import { SUITABILITY_DATA, COMPETENCY_DATA } from './constants.js';
import { firebaseDB } from './index.js';

const app = {
    state: {
        userName: '',
        view: 'suitability',
        suitabilityScores: {},
        competencyScores: {},
        radarChart: null,
        isAdmin: false,
        isProcessing: false
    },

    init: function() {
        document.getElementById('loading-overlay').classList.add('hidden');
        document.getElementById('view-onboarding').classList.remove('hidden');
        
        // 이벤트 리스너 바인딩
        document.getElementById('btn-onboarding-start').onclick = () => this.submitName();
        const nameInput = document.getElementById('user-name-input');
        if (nameInput) {
            nameInput.onkeyup = (e) => e.key === 'Enter' && this.submitName();
            nameInput.focus();
        }

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
        if (this.state.isProcessing) return;
        
        const nameInput = document.getElementById('user-name-input');
        const name = nameInput.value.trim();
        if (!name) {
            alert('성함을 입력해주세요.');
            return;
        }

        const btn = document.getElementById('btn-onboarding-start');
        btn.disabled = true;
        btn.innerText = '확인 중...';
        this.state.isProcessing = true;

        this.state.userName = name;
        if (name === '관리자') {
            this.state.isAdmin = true;
            this.initAdmin();
            return;
        }

        this.setSyncing(true);
        try {
            console.log(`[App] Loading data for user: ${name}`);
            const userData = await firebaseDB.loadUserData(name);
            if (userData) {
                console.log("[App] Existing user found, loading scores.");
                this.state.suitabilityScores = userData.suitabilityScores || {};
                this.state.competencyScores = userData.competencyScores || {};
            } else {
                console.log("[App] New user, starting fresh.");
                this.state.suitabilityScores = {};
                this.state.competencyScores = {};
            }
            
            this.renderUserUI();
            this.setSyncing(false);
        } catch (e) {
            console.error("[App] Login error:", e);
            this.setSyncing(false, true);
            alert('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            this.state.isProcessing = false;
            btn.disabled = false;
            btn.innerText = '나침반 시작하기';
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
        dashboard.innerHTML = '<div class="card-premium" style="padding:20px;">데이터를 불러오는 중...</div>';
        try {
            const users = await firebaseDB.fetchAllUsers();
            this.renderAdminCards(users);
        } catch (e) {
            dashboard.innerHTML = '<div class="card-premium" style="padding:20px; color:red;">데이터 로드 실패</div>';
        }
    },

    renderAdminCards: function(users) {
        const dashboard = document.getElementById('admin-dashboard');
        if (!users || !users.length) { 
            dashboard.innerHTML = '<div class="card-premium" style="padding:20px;">저장된 데이터가 없습니다.</div>'; 
            return; 
        }
        
        dashboard.innerHTML = users.map(user => {
            const uScores = user.competencyScores || {};
            const sValues = Object.values(user.suitabilityScores || {});
            const sScore = sValues.length ? Math.round((sValues.reduce((a,b)=>a+b,0) / (11*5)) * 100) : 0;
            const lastUpdate = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '기록 없음';
            
            // 영역별 점수 계산
            const domainScores = COMPETENCY_DATA.map(d => {
                let s = 0, c = 0;
                d.items.forEach(i => { if(uScores[i.id]) { s += uScores[i.id]; c++; } });
                return { name: d.name.split('. ')[1], score: c === 0 ? 0 : Math.round((s / (d.items.length * 5)) * 100) };
            });

            // 우선순위 계산
            const top3 = this.getTopPriorities(uScores);
            
            return `
                <div class="admin-card">
                    <button class="admin-delete-btn" title="삭제" onclick="app.deleteUser('${user.id}', '${user.userName}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                        <div class="avatar-circle" style="width:44px; height:44px; font-size:20px;">${(user.userName || '?').charAt(0).toUpperCase()}</div>
                        <div>
                            <h3 style="margin:0; font-size:18px;">${user.userName || user.id}</h3>
                            <div class="admin-score-badge">업무 적합도 ${sScore}점</div>
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px;">영역별 점수 (도달률)</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            ${domainScores.map(ds => `
                                <div style="font-size:12px; display:flex; justify-content:space-between; background:#F9FAFB; padding:6px 8px; border-radius:6px;">
                                    <span style="color:var(--text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:80px;">${ds.name}</span>
                                    <span style="font-weight:700; color:var(--primary);">${ds.score}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px;">학습 우선순위 TOP 3</div>
                        ${top3.length ? `
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                ${top3.map((p, i) => `
                                    <div style="font-size:12px; display:flex; gap:8px; align-items:flex-start;">
                                        <span style="font-weight:800; color:var(--text-muted);">0${i+1}</span>
                                        <span style="font-weight:500; color:var(--text-main); line-height:1.4;">${p.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `<div style="font-size:12px; color:var(--text-muted);">데이터 없음</div>`}
                    </div>

                    <div style="font-size:11px; color:var(--text-muted); margin-top:20px; border-top:1px solid var(--border); padding-top:12px; text-align:right;">
                        최종 업데이트: ${lastUpdate}
                    </div>
                </div>
            `;
        }).join('');
    },

    deleteUser: async function(id, name) {
        if (confirm(`'${name || id}' 사용자의 정보를 영구적으로 삭제할까요?`)) {
            try {
                await firebaseDB.deleteUser(id);
                this.loadAdminDashboard();
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.');
            }
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
        
        const targetView = document.getElementById(`view-${view}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            // 페이드 인 효과
            targetView.style.opacity = 0;
            setTimeout(() => {
                targetView.style.transition = 'opacity 0.3s ease';
                targetView.style.opacity = 1;
            }, 10);
        }

        const activeMenu = document.getElementById(`menu-${view}`);
        if (activeMenu) activeMenu.classList.add('active');
        if (view === 'report') this.renderReport();
        
        // 스크롤 탑
        window.scrollTo(0, 0);
    },

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
                            <div style="font-size:14px; color:var(--text-main); font-weight:500;">${item.text}</div>
                            ${this.generateSliderHTML(item.id, score, isSelected, 'suitability')}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    },

    renderCompetencyTable: function() {
        const tbody = document.getElementById('competency-table-body');
        let html = '';
        COMPETENCY_DATA.forEach(dom => {
            dom.items.forEach((item, idx) => {
                const score = this.state.competencyScores[item.id] || 3;
                const isSelected = this.state.competencyScores.hasOwnProperty(item.id);
                const gap = isSelected ? (dom.weight * item.importance * (item.importance - score)) : null;
                html += `<tr>`;
                if (idx === 0) html += `<td rowspan="${dom.items.length}" class="domain-cell"><strong>${dom.name}</strong><br><small style="color:var(--text-muted)">가중치 ${dom.weight}</small></td>`;
                html += `<td>${item.text}</td><td class="text-center">${item.importance}</td><td class="text-center">${this.generateSliderHTML(item.id, score, isSelected, 'competency')}</td><td class="text-center">${gap !== null ? `<strong style="color:${gap > 0 ? '#EF4444' : '#10B981'}">${gap.toFixed(0)}</strong>` : '-'}</td></tr>`;
            });
        });
        tbody.innerHTML = html;
    },

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
        if (fill) {
            fill.style.width = `${((score-1)/4)*100}%`;
            fill.style.opacity = 1;
        }
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
        const rawScoreSum = vals.reduce((a,b)=>a+b,0);
        const score = vals.length ? Math.round((rawScoreSum/(total*5))*100) : 0;
        
        const scoreEl = document.getElementById('suitability-total-score');
        if (scoreEl) scoreEl.innerText = score;
        
        const barEl = document.getElementById('suitability-progress-bar');
        if (barEl) barEl.style.width = `${pct}%`;
        
        const pctEl = document.getElementById('suitability-progress-percent');
        if (pctEl) pctEl.innerText = `${pct}%`;
        
        const txtEl = document.getElementById('suitability-progress-text');
        if (txtEl) txtEl.innerText = `진행률 (${vals.length}/${total})`;
    },

    getTopPriorities: function(scores = this.state.competencyScores) {
        const prios = [];
        COMPETENCY_DATA.forEach(d => d.items.forEach(i => {
            const s = scores[i.id];
            if(s) { 
                const gap = d.weight * i.importance * (i.importance - s); 
                if(gap > 0) prios.push({ text: i.text, gap, domain: d.name }); 
            }
        }));
        prios.sort((a,b) => b.gap - a.gap);
        return prios.slice(0,3);
    },

    updateCompetencyAnalysis: function() {
        const top3 = this.getTopPriorities();
        const list = document.getElementById('priority-list');
        const section = document.getElementById('priority-section');
        if(top3.length) {
            section.classList.remove('hidden');
            list.innerHTML = top3.map((p, i) => `
                <div class="priority-card" style="border-left-color: ${i === 0 ? '#111827' : i === 1 ? '#4B5563' : '#9CA3AF'}">
                    <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:8px;">RANK ${i+1}</div>
                    <div style="font-weight:700; font-size:15px; margin-bottom:4px;">${p.text}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">${p.domain}</div>
                </div>
            `).join('');
        } else {
            section.classList.add('hidden');
        }
    },

    saveData: async function() {
        if (!this.state.userName || this.state.isAdmin) return;
        this.setSyncing(true);
        try {
            await firebaseDB.saveUserData(this.state.userName, {
                userName: this.state.userName,
                suitabilityScores: this.state.suitabilityScores,
                competencyScores: this.state.competencyScores,
                updatedAt: new Date().toISOString()
            });
            this.setSyncing(false);
        } catch (e) {
            console.error("[App] Save error:", e);
            this.setSyncing(false, true);
        }
    },

    setSyncing: function(syncing, error = false) {
        const dot = document.getElementById('sync-dot');
        const text = document.getElementById('sync-text');
        if (!dot || !text) return;
        
        if (error) { dot.className = 'sync-dot offline'; text.innerText = '동기화 실패'; }
        else if (syncing) { dot.className = 'sync-dot syncing'; text.innerText = '동기화 중...'; }
        else { dot.className = 'sync-dot'; text.innerText = '클라우드 동기화 됨'; }
    },

    renderReport: function() {
        const container = document.getElementById('report-content');
        container.innerHTML = `<div class="card-premium" style="padding:40px; text-align:center; color:var(--text-secondary);">리포트를 생성하고 있습니다...</div>`;
        
        setTimeout(() => {
            // 업무 적합성 점수 계산
            const sTotal = 11;
            const sVals = Object.values(this.state.suitabilityScores);
            const suitabilityScore = sVals.length ? Math.round((sVals.reduce((a,b)=>a+b,0)/(sTotal*5))*100) : 0;

            // 역량 차트 데이터 계산
            const radarLabels = COMPETENCY_DATA.map(d => d.name.split('. ')[1]);
            const radarData = COMPETENCY_DATA.map(d => {
                let s = 0, c = 0;
                d.items.forEach(i => { 
                    if(this.state.competencyScores[i.id]) { 
                        s += this.state.competencyScores[i.id]; 
                        c++; 
                    } 
                });
                return c === 0 ? 0 : Math.round((s / (d.items.length * 5)) * 100);
            });

            // 학습 우선순위 데이터
            const top3 = this.getTopPriorities();

            container.innerHTML = `
                <div class="card-premium" style="padding:48px;">
                    <div style="text-align:center; margin-bottom:48px;">
                        <div style="font-size:14px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">Presales Compass Analysis</div>
                        <h2 style="font-size:32px; font-weight:800; margin:0;">${this.state.userName}님의 종합 진단 리포트</h2>
                        <div style="width:60px; height:4px; background:var(--primary); margin:24px auto 0;"></div>
                    </div>

                    <!-- 업무 적합성 점수 섹션 -->
                    <div style="background:#F9FAFB; border-radius:16px; padding:32px; display:flex; align-items:center; justify-content:space-between; margin-bottom:40px; border:1px solid var(--border);">
                        <div>
                            <h3 style="margin:0 0 8px 0; font-size:18px;">업무 적합성 진단 결과</h3>
                            <p style="margin:0; font-size:14px; color:var(--text-secondary);">프리세일즈 직무에 대한 심리적 및 태도적 정렬 수준입니다.</p>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:48px; font-weight:800; color:var(--primary);">${suitabilityScore}</span>
                            <span style="font-size:18px; color:var(--text-muted); font-weight:600;"> / 100점</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:40px;">
                        <h3 style="font-size:20px; font-weight:700; margin-bottom:24px; text-align:center;">역량별 분포 그래프</h3>
                        <div style="max-width:560px; margin: 0 auto; position:relative;">
                            <canvas id="reportChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- 학습 우선순위 섹션 -->
                    <div style="margin-top:56px; border-top:2px solid var(--border); padding-top:40px;">
                        <h3 style="font-size:20px; font-weight:700; margin-bottom:24px;">학습 우선순위 TOP 3 (Action Plan)</h3>
                        ${top3.length ? `
                            <div style="display:grid; grid-template-columns: 1fr; gap:16px;">
                                ${top3.map((p, i) => `
                                    <div style="display:flex; align-items:center; gap:20px; background:#fff; border:1px solid var(--border); border-radius:12px; padding:20px; border-left:6px solid ${i === 0 ? '#111827' : i === 1 ? '#4B5563' : '#9CA3AF'}">
                                        <div style="font-size:20px; font-weight:800; color:var(--text-muted); width:40px;">0${i+1}</div>
                                        <div style="flex:1;">
                                            <div style="font-weight:700; font-size:16px; margin-bottom:2px;">${p.text}</div>
                                            <div style="font-size:12px; color:var(--text-secondary);">${p.domain}</div>
                                        </div>
                                        <div style="text-align:right; min-width:80px;">
                                            <div style="font-size:11px; font-weight:700; color:var(--text-muted);">집중 개선 GAP</div>
                                            <div style="font-size:18px; font-weight:800; color:#EF4444;">${p.gap.toFixed(0)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div style="padding:20px; background:#F3F4F6; border-radius:12px; text-align:center; color:var(--text-secondary);">모든 역량 진단을 완료하면 우선순위가 표시됩니다.</div>'}
                    </div>
                </div>
            `;

            const ctx = document.getElementById('reportChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: radarLabels,
                        datasets: [{ 
                            label: '역량 지점', 
                            data: radarData, 
                            backgroundColor: 'rgba(17,24,39,0.1)', 
                            borderColor: '#111827',
                            borderWidth: 2,
                            pointBackgroundColor: '#111827',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#111827'
                        }]
                    },
                    plugins: [ChartDataLabels],
                    options: { 
                        scales: { 
                            r: { 
                                min: 0, 
                                max: 100,
                                ticks: { stepSize: 20, display: false },
                                grid: { color: '#E5E7EB' },
                                angleLines: { color: '#E5E7EB' },
                                pointLabels: { font: { family: 'Inter', weight: '600', size: 14 }, color: '#374151' }
                            } 
                        },
                        plugins: { 
                            legend: { display: false },
                            datalabels: {
                                color: '#111827',
                                backgroundColor: '#fff',
                                borderRadius: 4,
                                font: { weight: '800', size: 11 },
                                formatter: (value) => value + '%',
                                padding: 4,
                                offset: 8,
                                align: 'end'
                            }
                        }
                    }
                });
            }
        }, 500);
    },

    downloadPDF: function() {
        const element = document.getElementById('report-content');
        const opt = {
            margin: 10,
            filename: `Presales_Compass_${this.state.userName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    },

    logout: function() { 
        if(confirm('로그아웃 하시겠습니까? 데이터는 클라우드에 안전하게 저장되었습니다.')) {
            location.reload(); 
        }
    },
    
    resetSuitability: function() { 
        if(confirm('업무 적합성 체크리스트를 초기화하시겠습니까?')) { 
            this.state.suitabilityScores = {}; 
            this.renderSuitabilityChecklist(); 
            this.updateSuitabilityStats(); 
            this.saveData(); 
        } 
    },
    
    resetCompetency: function() { 
        if(confirm('역량 평가 데이터를 초기화하시겠습니까?')) { 
            this.state.competencyScores = {}; 
            this.renderCompetencyTable(); 
            this.updateCompetencyAnalysis(); 
            this.saveData(); 
        } 
    }
};

window.app = app;
app.init();