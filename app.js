
import { SUITABILITY_DATA, COMPETENCY_DATA } from './constants.js';

const app = {
    state: {
        userName: '',
        view: 'suitability',
        suitabilityScores: {},
        competencyScores: {},
        radarChart: null,
        isAdmin: false
    },

    init: function() {
        document.getElementById('loading-overlay').classList.add('hidden');
        document.getElementById('view-onboarding').classList.remove('hidden');
        
        // 이벤트 리스너 바인딩
        document.getElementById('btn-onboarding-start').onclick = () => this.submitName();
        document.getElementById('user-name-input').onkeyup = (e) => e.key === 'Enter' && this.submitName();
        document.getElementById('btn-logout').onclick = () => this.logout();
        document.getElementById('btn-admin-logout').onclick = () => this.logout();
        document.getElementById('btn-reset-suitability').onclick = () => this.resetSuitability();
        document.getElementById('btn-reset-competency').onclick = () => this.resetCompetency();
        document.getElementById('btn-download-pdf').onclick = () => this.downloadPDF();

        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.onclick = () => this.navigate(btn.dataset.view);
        });
    },

    submitName: async function() {
        const nameInput = document.getElementById('user-name-input');
        const name = nameInput.value.trim();
        if (!name) return;

        this.state.userName = name;
        if (name === '관리자') {
            this.state.isAdmin = true;
            this.initAdmin();
            return;
        }

        this.setSyncing(true);
        try {
            const userData = await window.firebaseDB.loadUserData(name);
            if (userData) {
                this.state.suitabilityScores = userData.suitabilityScores || {};
                this.state.competencyScores = userData.competencyScores || {};
            }
            this.renderUserUI();
            this.setSyncing(false);
        } catch (e) {
            this.setSyncing(false, true);
        }
    },

    initAdmin: async function() {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('app').classList.add('admin-active');
        document.getElementById('view-onboarding').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.navigate('admin');
        this.loadAdminDashboard();
    },

    loadAdminDashboard: async function() {
        const dashboard = document.getElementById('admin-dashboard');
        dashboard.innerHTML = '<p>데이터를 불러오는 중...</p>';
        const users = await window.firebaseDB.fetchAllUsers();
        this.renderAdminCards(users);
    },

    renderAdminCards: function(users) {
        const dashboard = document.getElementById('admin-dashboard');
        if (!users.length) { dashboard.innerHTML = '<p>데이터가 없습니다.</p>'; return; }
        
        dashboard.innerHTML = users.map(user => {
            const sValues = Object.values(user.suitabilityScores || {});
            const sScore = sValues.length ? Math.round((sValues.reduce((a,b)=>a+b,0) / (11*5)) * 100) : 0;
            
            return `
                <div class="admin-card">
                    <button class="admin-delete-btn" onclick="app.deleteUser('${user.id}', '${user.userName}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                    <h3 style="margin:0;">${user.userName || user.id}</h3>
                    <div class="admin-score-badge">업무 적합도 ${sScore}점</div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-top:12px;">최종 업데이트: ${new Date(user.updatedAt).toLocaleDateString()}</div>
                </div>
            `;
        }).join('');
    },

    deleteUser: async function(id, name) {
        if (confirm(`'${name || id}' 사용자의 정보를 영구적으로 삭제할까요?`)) {
            await window.firebaseDB.deleteUser(id);
            this.loadAdminDashboard();
        }
    },

    renderUserUI: function() {
        document.getElementById('user-name-display').innerText = `${this.state.userName}님`;
        document.getElementById('user-avatar').innerText = this.state.userName.charAt(0).toUpperCase();
        document.querySelectorAll('.welcome-name').forEach(el => el.innerText = this.state.userName);
        
        this.renderSuitabilityChecklist();
        this.updateSuitabilityStats();
        this.renderCompetencyTable();
        this.updateCompetencyAnalysis();

        document.getElementById('view-onboarding').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.navigate('suitability');
    },

    navigate: function(view) {
        ['suitability', 'competency', 'report', 'admin'].forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.classList.add('hidden');
            const menu = document.getElementById(`menu-${v}`);
            if (menu) menu.classList.remove('active');
        });
        document.getElementById(`view-${view}`).classList.remove('hidden');
        const activeMenu = document.getElementById(`menu-${view}`);
        if (activeMenu) activeMenu.classList.add('active');
        if (view === 'report') this.renderReport();
    },

    // --- 업무 적합성 로직 ---
    renderSuitabilityChecklist: function() {
        const container = document.getElementById('checklist-container');
        container.innerHTML = SUITABILITY_DATA.map(cat => `
            <div class="card-premium">
                <h2 class="category-title">${cat.title}</h2>
                ${cat.items.map(item => {
                    const score = this.state.suitabilityScores[item.id] || 3;
                    const isSelected = this.state.suitabilityScores.hasOwnProperty(item.id);
                    return `
                        <div class="checklist-row">
                            <div style="font-size:14px;">${item.text}</div>
                            ${this.generateSliderHTML(item.id, score, isSelected, 'suitability')}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    },

    // --- 역량 평가 로직 ---
    renderCompetencyTable: function() {
        const tbody = document.getElementById('competency-table-body');
        let html = '';
        COMPETENCY_DATA.forEach(dom => {
            dom.items.forEach((item, idx) => {
                const score = this.state.competencyScores[item.id] || 3;
                const isSelected = this.state.competencyScores.hasOwnProperty(item.id);
                const gap = isSelected ? (dom.weight * item.importance * (item.importance - score)) : null;
                html += `<tr>`;
                if (idx === 0) html += `<td rowspan="${dom.items.length}" class="domain-cell"><strong>${dom.name}</strong><br><small>가중치 ${dom.weight}</small></td>`;
                html += `<td>${item.text}</td><td class="text-center">${item.importance}</td><td class="text-center">${this.generateSliderHTML(item.id, score, isSelected, 'competency')}</td><td class="text-center">${gap !== null ? `<strong>${gap.toFixed(0)}</strong>` : '-'}</td></tr>`;
            });
        });
        tbody.innerHTML = html;
    },

    // --- 공통 슬라이더 생성 ---
    generateSliderHTML: function(id, score, isSelected, type) {
        return `
            <div class="slider-container">
                <div class="slider-header" id="header-${id}">
                    ${[1,2,3,4,5].map(n => `<div class="slider-num ${score === n ? 'active' : ''}" onclick="app.setScore('${type}', '${id}', ${n})">${n}</div>`).join('')}
                </div>
                <div class="slider-track-wrapper">
                    <div class="track-bg"></div>
                    <div class="track-fill" id="fill-${id}" style="width: ${((score-1)/4)*100}%; opacity:${isSelected ? 1 : 0.3}"></div>
                    <input type="range" min="1" max="5" step="1" value="${score}" 
                        oninput="app.handleSliderInput('${id}', this.value)" 
                        onchange="app.setScore('${type}', '${id}', parseInt(this.value))">
                </div>
            </div>
        `;
    },

    handleSliderInput: function(id, val) {
        const score = parseInt(val);
        const fill = document.getElementById(`fill-${id}`);
        if (fill) fill.style.width = `${((score-1)/4)*100}%`;
        const header = document.getElementById(`header-${id}`);
        if (header) Array.from(header.children).forEach((c, i) => c.classList.toggle('active', i+1 === score));
    },

    setScore: async function(type, id, val) {
        if (type === 'suitability') {
            this.state.suitabilityScores[id] = val;
            this.updateSuitabilityStats();
        } else {
            this.state.competencyScores[id] = val;
            this.updateCompetencyAnalysis();
            this.renderCompetencyTable();
        }
        this.handleSliderInput(id, val);
        await this.saveData();
    },

    updateSuitabilityStats: function() {
        const total = 11;
        const vals = Object.values(this.state.suitabilityScores);
        const pct = Math.round((vals.length / total) * 100);
        const score = vals.length ? Math.round((vals.reduce((a,b)=>a+b,0)/(total*5))*100) : 0;
        
        document.getElementById('suitability-total-score').innerText = score;
        document.getElementById('suitability-progress-bar').style.width = `${pct}%`;
        document.getElementById('suitability-progress-percent').innerText = `${pct}%`;
        document.getElementById('suitability-progress-text').innerText = `진행률 (${vals.length}/${total})`;
    },

    updateCompetencyAnalysis: function() {
        const prios = [];
        COMPETENCY_DATA.forEach(d => d.items.forEach(i => {
            const s = this.state.competencyScores[i.id];
            if(s) { const gap = d.weight * i.importance * (i.importance - s); if(gap > 0) prios.push({ text: i.text, gap, domain: d.name }); }
        }));
        prios.sort((a,b) => b.gap - a.gap);
        const top3 = prios.slice(0,3);
        
        const list = document.getElementById('priority-list');
        const section = document.getElementById('priority-section');
        if(top3.length) {
            section.classList.remove('hidden');
            list.innerHTML = top3.map((p, i) => `<div class="priority-card"><strong>RANK ${i+1}</strong><br>${p.text}<br><small>${p.domain}</small></div>`).join('');
        }
    },

    saveData: async function() {
        if (!this.state.userName || this.state.isAdmin) return;
        this.setSyncing(true);
        try {
            await window.firebaseDB.saveUserData(this.state.userName, {
                userName: this.state.userName,
                suitabilityScores: this.state.suitabilityScores,
                competencyScores: this.state.competencyScores,
                updatedAt: new Date().toISOString()
            });
            this.setSyncing(false);
        } catch (e) {
            this.setSyncing(false, true);
        }
    },

    setSyncing: function(syncing, error = false) {
        const dot = document.getElementById('sync-dot');
        const text = document.getElementById('sync-text');
        if (error) { dot.className = 'sync-dot offline'; text.innerText = '동기화 실패'; }
        else if (syncing) { dot.className = 'sync-dot syncing'; text.innerText = '저장 중...'; }
        else { dot.className = 'sync-dot'; text.innerText = '클라우드 동기화 됨'; }
    },

    renderReport: function() {
        const container = document.getElementById('report-content');
        container.innerHTML = `<div class="card-premium" style="padding:40px; text-align:center;">리포트 생성 중...</div>`;
        
        setTimeout(() => {
            const radarData = COMPETENCY_DATA.map(d => {
                let s = 0, c = 0;
                d.items.forEach(i => { if(this.state.competencyScores[i.id]) { s += this.state.competencyScores[i.id]; c++; } });
                return c === 0 ? 0 : Math.round((s / (d.items.length * 5)) * 100);
            });

            container.innerHTML = `
                <div class="card-premium" style="padding:32px;">
                    <h2 style="text-align:center;">${this.state.userName}님의 진단 리포트</h2>
                    <canvas id="reportChart" style="max-width:500px; margin: 0 auto;"></canvas>
                </div>
            `;

            new Chart(document.getElementById('reportChart'), {
                type: 'radar',
                data: {
                    labels: COMPETENCY_DATA.map(d => d.name.split('. ')[1]),
                    datasets: [{ label: '역량 지표', data: radarData, backgroundColor: 'rgba(17,24,39,0.1)', borderColor: '#111827' }]
                },
                options: { scales: { r: { min: 0, max: 100 } } }
            });
        }, 300);
    },

    downloadPDF: function() {
        const element = document.getElementById('report-content');
        html2pdf().from(element).set({ margin: 10, filename: `Report_${this.state.userName}.pdf` }).save();
    },

    logout: function() { location.reload(); },
    resetSuitability: function() { if(confirm('초기화하시겠습니까?')) { this.state.suitabilityScores = {}; this.renderSuitabilityChecklist(); this.updateSuitabilityStats(); this.saveData(); } },
    resetCompetency: function() { if(confirm('초기화하시겠습니까?')) { this.state.competencyScores = {}; this.renderCompetencyTable(); this.updateCompetencyAnalysis(); this.saveData(); } }
};

window.app = app;
app.init();
