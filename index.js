/**
 * Presales Compass - Pure Vanilla JS Implementation
 */

// --- Data Definitions ---

const SUITABILITY_DATA = [
    {
      id: "tech",
      title: "1. 기술 역량",
      items: [
        { id: "t1", text: "새로운 기술을 배우고 문제를 해결하는 데 흥미를 느낀다." },
        { id: "t2", text: "최신 기술 및 업계 동향을 지속적으로 학습하고 있다." },
        { id: "t3", text: "RFP, 제안서, PoC 보고서 등의 문서를 작성하는 것이 익숙하다." },
      ]
    },
    {
      id: "biz",
      title: "2. 비즈니스 및 고객 대응",
      items: [
        { id: "b1", text: "고객이 원하는 가치를 이해하고, 비즈니스적 관점에서 솔루션을 고민할 수 있다." },
        { id: "b2", text: "기업의 성장을 위해 좋은 제품을 만드는 것만큼 판매가 중요하다고 생각한다." },
        { id: "b3", text: "고객이 명확하게 정의하지 않은 요구사항을 파악하고, 최적의 솔루션을 제안할 수 있다." },
        { id: "b4", text: "고객과 신뢰를 구축하며, 협업을 원활하게 진행할 수 있다." },
      ]
    },
    {
      id: "comm",
      title: "3. 커뮤니케이션 및 협업",
      items: [
        { id: "c1", text: "기술적 내용을 고객이 이해하기 쉽게 설명할 수 있다." },
        { id: "c2", text: "영업, 개발, 컨설팅 등 다양한 팀과 협업한 경험이 있다." },
      ]
    },
    {
      id: "prob",
      title: "4. 문제 해결 및 멀티태스킹",
      items: [
        { id: "p1", text: "복잡한 문제를 논리적으로 분석하고 해결책을 찾는 능력이 있다." },
        { id: "p2", text: "여러 개의 프로젝트나 고객을 동시에 관리하고 진행할 수 있다." },
      ]
    }
];

const COMPETENCY_DATA = [
    {
      id: "d1",
      name: "1. 기술적 지식",
      weight: 5,
      items: [
        { id: "c1_1", text: "제품 또는 서비스에 대한 전반적인 이해도", importance: 5 },
        { id: "c1_2", text: "제품 또는 서비스의 기능과 특징에 대한 이해", importance: 5 },
        { id: "c1_3", text: "경쟁 제품과의 비교 분석에 대한 이해", importance: 4 },
        { id: "c1_4", text: "제품 또는 서비스의 가치와 이점에 대한 이해", importance: 5 },
      ]
    },
    {
      id: "d2",
      name: "2. 커뮤니케이션 기술",
      weight: 5,
      items: [
        { id: "c2_1", text: "효과적인 커뮤니케이션 기술", importance: 5 },
        { id: "c2_2", text: "명확하고 구조화된 프레젠테이션 기술", importance: 4 },
        { id: "c2_3", text: "청중을 이해하고 이에 맞는 커뮤니케이션", importance: 4 },
        { id: "c2_4", text: "비기술적인 고객 용어를 사용하여 설명하는 능력", importance: 3 },
      ]
    },
    {
      id: "d3",
      name: "3. 분석 및 문제 해결 능력",
      weight: 4.5,
      items: [
        { id: "c3_1", text: "고객의 요구 사항을 분석하고 이해", importance: 5 },
        { id: "c3_2", text: "복잡한 문제를 해결하는 능력", importance: 4 },
        { id: "c3_3", text: "고객의 비즈니스 도전과제를 파악하는 능력", importance: 4 },
        { id: "c3_4", text: "제품 또는 서비스를 적용하여 해결책을 제시하는 능력", importance: 4 },
      ]
    },
    {
      id: "d4",
      name: "4. 고객 관계 구축",
      weight: 4,
      items: [
        { id: "c4_1", text: "고객과의 강력한 관계 형성", importance: 5 },
        { id: "c4_2", text: "신뢰와 신뢰성을 구축하는 능력", importance: 5 },
        { id: "c4_3", text: "고객의 욕구와 필요를 이해하는 능력", importance: 4 },
        { id: "c4_4", text: "고객과의 소통을 통한 관계 유지", importance: 3 },
      ]
    },
    {
      id: "d5",
      name: "5. 판매 전략 개발",
      weight: 4,
      items: [
        { id: "c5_1", text: "비즈니스 환경과 산업 동향에 대한 이해", importance: 5 },
        { id: "c5_2", text: "고객의 비즈니스 모델과 요구사항에 대한 이해", importance: 4 },
        { id: "c5_3", text: "영업 전략을 개발하고 실행하는 능력", importance: 5 },
        { id: "c5_4", text: "고객이 가치를 창출할 수 있는 방법 제시", importance: 4 },
      ]
    }
];

// --- App Logic ---

const app = {
    state: {
        view: 'suitability',
        suitabilityScores: {},
        competencyScores: {}
    },

    init: function() {
        // Load data from LocalStorage
        try {
            const savedSuitability = localStorage.getItem('presales_suitability_scores');
            if (savedSuitability) this.state.suitabilityScores = JSON.parse(savedSuitability);

            const savedCompetency = localStorage.getItem('presales_competency_scores');
            if (savedCompetency) this.state.competencyScores = JSON.parse(savedCompetency);
        } catch (e) {
            console.error("Load failed", e);
        }

        // Render Initial Components
        this.renderSuitabilityChecklist();
        this.updateSuitabilityStats();
        
        this.renderCompetencyTable();
        this.updateCompetencyAnalysis();

        // Show default view
        this.navigate('suitability');
    },

    navigate: function(viewName) {
        this.state.view = viewName;
        
        // Update Sidebar UI
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`menu-${viewName}`).classList.add('active');

        // Update Main View UI
        document.getElementById('view-suitability').classList.add('hidden');
        document.getElementById('view-competency').classList.add('hidden');
        document.getElementById(`view-${viewName}`).classList.remove('hidden');
    },

    // --- Suitability Logic ---

    renderSuitabilityChecklist: function() {
        const container = document.getElementById('checklist-container');
        let html = '';

        SUITABILITY_DATA.forEach(category => {
            html += `
                <div class="card-premium category-card">
                    <h2 class="category-title">${category.title}</h2>
                    <div>
            `;
            
            category.items.forEach(item => {
                const score = this.state.suitabilityScores[item.id] || 3;
                // Note: The 'value' attribute is for initialization. 
                // We also check class 'selected' if item.id exists in state keys to change style.
                const isSelected = this.state.suitabilityScores.hasOwnProperty(item.id);
                
                html += `
                    <div class="checklist-row">
                        <div style="flex:1; font-size:15px; font-weight:500; color:var(--text-secondary); line-height:1.5;">${item.text}</div>
                        <div class="slider-container">
                            <div class="slider-header" id="header-${item.id}">
                                ${[1,2,3,4,5].map(n => 
                                    `<div class="slider-num ${score === n ? 'active' : ''}" onclick="app.setSuitabilityScore('${item.id}', ${n})">${n}</div>`
                                ).join('')}
                            </div>
                            <div class="slider-track-wrapper">
                                <div class="track-bg"></div>
                                <div class="track-fill" id="fill-${item.id}" style="width: ${((score-1)/4)*100}%; opacity:${isSelected ? 1 : 0.3}"></div>
                                <input type="range" min="1" max="5" step="1" value="${score}" 
                                       class="${isSelected ? 'selected' : ''}"
                                       id="input-${item.id}"
                                       oninput="app.handleSliderInput('${item.id}', this.value)"
                                       onchange="app.setSuitabilityScore('${item.id}', parseInt(this.value))">
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px; color:var(--text-muted);">
                                <span>매우 그렇지 않다</span>
                                <span>매우 그렇다</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;
    },

    handleSliderInput: function(id, val) {
        // Visual update only during drag
        const score = parseInt(val);
        const fillPercent = ((score - 1) / 4) * 100;
        document.getElementById(`fill-${id}`).style.width = `${fillPercent}%`;
        document.getElementById(`fill-${id}`).style.opacity = '1';
        document.getElementById(`input-${id}`).classList.add('selected');
        
        // Update header numbers active state
        const header = document.getElementById(`header-${id}`);
        Array.from(header.children).forEach((child, idx) => {
            if (idx + 1 === score) child.classList.add('active');
            else child.classList.remove('active');
        });
    },

    setSuitabilityScore: function(id, score) {
        this.state.suitabilityScores[id] = score;
        localStorage.setItem('presales_suitability_scores', JSON.stringify(this.state.suitabilityScores));
        
        // Sync Input if triggered by click on number
        const input = document.getElementById(`input-${id}`);
        if(input) {
            input.value = score;
            this.handleSliderInput(id, score); // Update visuals
        }

        this.updateSuitabilityStats();
    },

    updateSuitabilityStats: function() {
        const totalItems = 11;
        const maxScore = totalItems * 5;
        const filledCount = Object.keys(this.state.suitabilityScores).length;
        
        const sum = Object.values(this.state.suitabilityScores).reduce((a,b) => a+b, 0);
        const finalScore = Math.round((sum / maxScore) * 100);
        const progressPercent = Math.round((filledCount / totalItems) * 100);

        // DOM Updates
        document.getElementById('suitability-total-score').innerText = finalScore;
        document.getElementById('suitability-progress-text').innerText = `진행률 (${filledCount}/${totalItems})`;
        document.getElementById('suitability-progress-percent').innerText = `${progressPercent}%`;
        document.getElementById('suitability-progress-bar').style.width = `${progressPercent}%`;

        // Show Result if complete
        const resultEl = document.getElementById('suitability-result');
        const resultTextEl = document.getElementById('suitability-result-text');
        
        if (filledCount === totalItems) {
            resultEl.classList.remove('hidden');
            if (finalScore >= 80) {
                resultTextEl.innerText = "프리세일즈 직무에 매우 적합한 성향과 역량을 갖추고 계십니다! 탁월한 성과가 기대됩니다.";
            } else if (finalScore >= 60) {
                resultTextEl.innerText = "프리세일즈 직무에 대한 잠재력이 충분합니다. 일부 역량을 보완하면 훌륭한 전문가로 성장할 수 있습니다.";
            } else {
                resultTextEl.innerText = "현재 성향과는 다소 차이가 있을 수 있습니다. 구체적인 부족 역량을 파악하고 개발 계획을 세워보세요.";
            }
        } else {
            resultEl.classList.add('hidden');
        }
    },

    resetSuitability: function() {
        if(confirm("초기화 하시겠습니까?")) {
            this.state.suitabilityScores = {};
            localStorage.removeItem('presales_suitability_scores');
            this.renderSuitabilityChecklist();
            this.updateSuitabilityStats();
        }
    },

    // --- Competency Logic ---

    renderCompetencyTable: function() {
        const tbody = document.getElementById('competency-table-body');
        let html = '';

        COMPETENCY_DATA.forEach(domain => {
            domain.items.forEach((item, idx) => {
                const currentScore = this.state.competencyScores[item.id];
                const gap = currentScore ? (domain.weight * item.importance * (item.importance - currentScore)) : null;
                
                html += `<tr>`;
                
                // Domain Cell (Rowspan)
                if (idx === 0) {
                    html += `
                        <td rowspan="${domain.items.length}" class="domain-cell">
                            <div style="font-weight:700; color:var(--text-main); margin-bottom:8px;">${domain.name}</div>
                            <span class="badge-weight">가중치 ${domain.weight}</span>
                        </td>
                    `;
                }

                html += `
                    <td>${item.text}</td>
                    <td class="text-center">
                        <span style="display:inline-block; width:8px; height:8px; background:var(--primary); border-radius:50%; margin-right:6px; opacity:${item.importance/5}"></span>
                        ${item.importance}
                    </td>
                    <td class="text-center">
                        <div class="compact-selector">
                            ${[1,2,3,4,5].map(n => `
                                <button class="compact-btn ${currentScore === n ? 'selected' : ''}" 
                                        onclick="app.setCompetencyScore('${item.id}', ${n})">
                                    ${n}
                                </button>
                            `).join('')}
                        </div>
                    </td>
                    <td class="text-center">
                        ${gap !== null ? `<span class="gap-badge ${gap > 0 ? 'gap-high' : 'gap-low'}">${gap.toFixed(0)}</span>` : '-'}
                    </td>
                `;

                html += `</tr>`;
            });
        });

        tbody.innerHTML = html;
    },

    setCompetencyScore: function(id, score) {
        this.state.competencyScores[id] = score;
        localStorage.setItem('presales_competency_scores', JSON.stringify(this.state.competencyScores));
        
        // Re-render whole table to update selections and gaps
        // (For a larger app, we would update specific DOM elements, but this is fast enough)
        this.renderCompetencyTable();
        this.updateCompetencyAnalysis();
    },

    updateCompetencyAnalysis: function() {
        const priorities = [];
        let hasData = false;

        COMPETENCY_DATA.forEach(domain => {
            domain.items.forEach(item => {
                const current = this.state.competencyScores[item.id];
                if (current) {
                    hasData = true;
                    const gap = domain.weight * item.importance * (item.importance - current);
                    if (gap > 0) {
                        priorities.push({
                            domain: domain.name,
                            text: item.text,
                            gap: gap
                        });
                    }
                }
            });
        });

        // Sort by GAP desc
        priorities.sort((a,b) => b.gap - a.gap);
        const top3 = priorities.slice(0, 3);

        const prioritySection = document.getElementById('priority-section');
        const listContainer = document.getElementById('priority-list');

        if (top3.length > 0) {
            prioritySection.classList.remove('hidden');
            listContainer.innerHTML = top3.map((p, idx) => `
                <div class="card-premium priority-card">
                    <div class="rank-badge">${idx+1}</div>
                    <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:8px;">${p.domain}</div>
                    <div style="font-size:16px; font-weight:600; margin-bottom:16px; min-height:44px;">${p.text}</div>
                    <div style="background:#F9FAFB; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; font-size:13px;">
                        <span style="color:var(--text-secondary)">GAP Score</span>
                        <strong style="color:var(--primary)">${p.gap.toFixed(1)}</strong>
                    </div>
                </div>
            `).join('');
        } else {
            prioritySection.classList.add('hidden');
        }
    },

    resetCompetency: function() {
        if(confirm("초기화 하시겠습니까?")) {
            this.state.competencyScores = {};
            localStorage.removeItem('presales_competency_scores');
            this.renderCompetencyTable();
            this.updateCompetencyAnalysis();
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});