import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { 
  CheckSquare, 
  BarChart2, 
  Menu, 
  Compass,
  Info,
  AlertCircle,
  Trophy,
  Target,
  ChevronRight
} from "lucide-react";

// --- Data: Checklist Questions ---
const CHECKLIST_CATEGORIES = [
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

const TOTAL_ITEMS = 11;
const MAX_SCORE = TOTAL_ITEMS * 5;

// --- Data: Competency Matrix ---
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

// --- Components ---

const Sidebar = ({ activeSection, setActiveSection }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <Compass size={24} color="#FFFFFF" />
        </div>
        <span className="app-title">Presales Compass</span>
      </div>

      <div className="sidebar-menu">
        <div className="menu-label">MENU</div>
        
        <button 
          className={`menu-item ${activeSection === 'suitability' ? 'active' : ''}`}
          onClick={() => setActiveSection('suitability')}
        >
          <div className="menu-icon-wrapper">
             <CheckSquare size={18} />
          </div>
          <span className="menu-text">업무 적합성 체크리스트</span>
          {activeSection === 'suitability' && <div className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeSection === 'competency' ? 'active' : ''}`}
          onClick={() => setActiveSection('competency')}
        >
          <div className="menu-icon-wrapper">
            <BarChart2 size={18} />
          </div>
          <span className="menu-text">역량 평가 및 학습</span>
          {activeSection === 'competency' && <div className="active-indicator" />}
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
            <div className="avatar-circle">U</div>
            <div className="user-info">
                <span className="user-name">User Account</span>
                <span className="user-role">Premium Plan</span>
            </div>
        </div>
      </div>
    </div>
  );
};

// Custom Slider Component
const ScoreSlider = ({ value, onChange }) => {
  const currentValue = value || 3;
  const isSelected = value !== undefined;

  const handleInputChange = (e) => {
    onChange(parseInt(e.target.value));
  };

  const handleInteractionEnd = (e) => {
    const val = parseInt(e.currentTarget.value);
    onChange(val);
  };

  return (
    <div className="slider-container">
      <div className="slider-header">
        {[1, 2, 3, 4, 5].map((num) => (
          <div 
            key={num} 
            className={`slider-num ${value === num ? 'active' : ''}`}
            onClick={() => onChange(num)}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="slider-track-wrapper">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={currentValue}
          onChange={handleInputChange}
          onPointerUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          className={`custom-range ${isSelected ? 'selected' : ''}`}
        />
        {/* Visual Track Background */}
        <div className="track-bg"></div>
        {/* Visual Progress Fill */}
        <div 
            className="track-fill" 
            style={{ 
                width: `${((currentValue - 1) / 4) * 100}%`,
                opacity: isSelected ? 1 : 0.3
            }}
        ></div>
      </div>
      <div className="slider-labels">
        <span>매우 그렇지 않다</span>
        <span>매우 그렇다</span>
      </div>
    </div>
  );
};

// Compact Score Input for Table
const CompactScoreSelector = ({ value, onChange }) => {
  return (
    <div className="compact-selector">
      {[1, 2, 3, 4, 5].map(num => (
        <button
          key={num}
          className={`compact-num-btn ${value === num ? 'selected' : ''}`}
          onClick={() => onChange(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

// Rating Legend Component
const RatingLegend = () => {
  const criteria = [
    { score: 1, label: "기술 없음" },
    { score: 2, label: "지식 있음" },
    { score: 3, label: "숙련" },
    { score: 4, label: "고급" },
    { score: 5, label: "전문가" },
  ];

  return (
    <div className="card-premium rating-legend-card">
      <div className="legend-header">
         <Info size={14} style={{marginRight: '6px'}}/>
         평가 기준 가이드 (1~5점)
      </div>
      <div className="legend-items">
        {criteria.map((c) => (
          <div key={c.score} className="legend-item">
            <span className={`legend-badge score-${c.score}`}>{c.score}</span>
            <span className="legend-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuitabilityChecklist = () => {
  const [scores, setScores] = useState({});

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("presales_suitability_scores");
    if (saved) {
      try {
        setScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("presales_suitability_scores", JSON.stringify(scores));
  }, [scores]);

  const handleScoreChange = (id, value) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const calculateTotalScore = () => {
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    const scaled = Math.round((sum / MAX_SCORE) * 100);
    return scaled;
  };

  const currentScore = calculateTotalScore();
  const filledCount = Object.keys(scores).length;
  const progress = Math.round((filledCount / TOTAL_ITEMS) * 100);

  return (
    <div className="page-content animate-modal-in">
      <div className="page-header">
        <h1>프리세일즈 업무 적합성 체크리스트</h1>
        <p className="page-subtitle">본인의 성향과 역량이 프리세일즈 직무에 얼마나 부합하는지 진단해보세요.</p>
      </div>

      <div className="card-premium score-overview-card">
        <div className="score-chart-area">
             <div className="score-circle">
                <span className="score-number">{currentScore}</span>
                <span className="score-unit">점</span>
             </div>
        </div>
        <div className="score-details-area">
          <div className="score-label">현재 적합도 점수</div>
          <div className="progress-container">
             <div className="progress-info">
                <span>진행률 ({filledCount}/{TOTAL_ITEMS})</span>
                <span>{progress}%</span>
             </div>
             <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
        </div>
      </div>

      <div className="checklist-wrapper">
        {CHECKLIST_CATEGORIES.map((category) => (
          <div key={category.id} className="card-premium category-card">
            <h2 className="category-title">{category.title}</h2>
            <div className="category-items">
              {category.items.map((item) => (
                <div key={item.id} className="checklist-row">
                  <div className="question-text">{item.text}</div>
                  <div className="answer-input-area">
                    <ScoreSlider 
                      value={scores[item.id]} 
                      onChange={(val) => handleScoreChange(item.id, val)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filledCount === TOTAL_ITEMS && (
         <div className="card-premium result-card">
            <div className="result-icon">🎉</div>
            <div className="result-content">
                <h3>진단 완료</h3>
                <p>
                {currentScore >= 80 ? "프리세일즈 직무에 매우 적합한 성향과 역량을 갖추고 계십니다! 탁월한 성과가 기대됩니다." :
                currentScore >= 60 ? "프리세일즈 직무에 대한 잠재력이 충분합니다. 일부 역량을 보완하면 훌륭한 전문가로 성장할 수 있습니다." :
                "현재 성향과는 다소 차이가 있을 수 있습니다. 구체적인 부족 역량을 파악하고 개발 계획을 세워보세요."}
                </p>
            </div>
         </div>
      )}
      
      <div className="action-area">
        <button 
            className="btn-text"
            onClick={() => {
            if(confirm('모든 기록을 초기화 하시겠습니까?')) {
                setScores({});
            }
            }}
        >
            기록 초기화
        </button>
      </div>
    </div>
  );
};

const CompetencyMatrix = () => {
  const [competencyScores, setCompetencyScores] = useState({});

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("presales_competency_scores");
    if (saved) {
      try {
        setCompetencyScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse competency scores", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("presales_competency_scores", JSON.stringify(competencyScores));
  }, [competencyScores]);

  const handleScoreChange = (id, value) => {
    setCompetencyScores(prev => ({ ...prev, [id]: value }));
  };

  // Calculate GAP and Priorities
  const analysisResult = useMemo(() => {
    let allItems = [];

    COMPETENCY_DATA.forEach(domain => {
      domain.items.forEach(item => {
        const current = competencyScores[item.id] || 0;
        let gap = 0;
        if (current > 0) {
          gap = domain.weight * item.importance * (item.importance - current);
        }
        
        allItems.push({
          domainName: domain.name,
          text: item.text,
          gap: gap,
          current: current,
          importance: item.importance
        });
      });
    });

    const scoredItems = allItems.filter(i => i.current > 0);
    const sorted = [...scoredItems].sort((a, b) => b.gap - a.gap);
    const topPriorities = sorted.slice(0, 3).filter(i => i.gap > 0);

    return { allItems, topPriorities };
  }, [competencyScores]);

  return (
    <div className="page-content animate-modal-in">
      <div className="page-header">
        <h1>역량 평가 및 학습 우선순위</h1>
        <p className="page-subtitle">현재 역량을 진단하고 GAP 분석을 통해 학습 우선순위를 도출합니다.</p>
      </div>

      {analysisResult.topPriorities.length === 0 && (
        <div className="info-banner">
           <AlertCircle size={20} className="banner-icon" />
           <span>아래 표에서 현재 본인의 역량을 입력(1~5점)하면, 자동으로 학습 우선순위가 분석됩니다.</span>
        </div>
      )}

      <RatingLegend />

      <div className="card-premium table-card">
        <div className="table-responsive">
            <table className="competency-table">
            <thead>
                <tr>
                <th style={{ width: "15%" }}>영역 (가중치)</th>
                <th style={{ width: "40%" }}>역량 상세</th>
                <th style={{ width: "10%", textAlign: "center" }}>중요도</th>
                <th style={{ width: "25%", textAlign: "center" }}>내 역량 (1~5)</th>
                <th style={{ width: "10%", textAlign: "center" }}>GAP</th>
                </tr>
            </thead>
            <tbody>
                {COMPETENCY_DATA.map((domain) => (
                <React.Fragment key={domain.id}>
                    {domain.items.map((item, idx) => {
                    const currentScore = competencyScores[item.id];
                    const gap = currentScore ? (domain.weight * item.importance * (item.importance - currentScore)) : 0;
                    
                    return (
                        <tr key={item.id}>
                        {idx === 0 && (
                            <td rowSpan={domain.items.length} className="domain-cell">
                            <div className="domain-name">{domain.name}</div>
                            <div className="badge-weight">가중치 {domain.weight}</div>
                            </td>
                        )}
                        <td className="text-cell">{item.text}</td>
                        <td className="center-cell">
                            <span className="importance-dot" style={{opacity: item.importance/5}}></span>
                            {item.importance}
                        </td>
                        <td className="input-cell">
                            <CompactScoreSelector 
                            value={currentScore} 
                            onChange={(val) => handleScoreChange(item.id, val)}
                            />
                        </td>
                        <td className="center-cell gap-cell">
                            {currentScore ? (
                            <span className={`gap-badge ${gap > 0 ? "gap-high" : "gap-low"}`}>
                                {gap.toFixed(0)}
                            </span>
                            ) : "-"}
                        </td>
                        </tr>
                    );
                    })}
                </React.Fragment>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {analysisResult.topPriorities.length > 0 && (
        <div className="priority-section">
          <div className="priority-header">
             <Target size={24} className="text-primary" />
             <h3>학습 우선순위 TOP 3</h3>
          </div>
          <p className="priority-desc">
            다음 역량을 먼저 개발하면 가장 큰 성장을 이룰 수 있습니다.
          </p>
          
          <div className="priority-grid">
              {analysisResult.topPriorities.map((item, idx) => (
                <div key={idx} className="card-premium priority-card card-hover-effect">
                  <div className="priority-rank-badge">{idx + 1}</div>
                  <div className="priority-content">
                    <div className="priority-domain">{item.domainName}</div>
                    <div className="priority-text">{item.text}</div>
                    <div className="priority-gap-info">
                        <span>GAP Score</span>
                        <strong>{item.gap.toFixed(1)}</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="action-area">
        <button 
            className="btn-text"
            onClick={() => {
            if(confirm('역량 평가 기록을 초기화 하시겠습니까?')) {
                setCompetencyScores({});
            }
            }}
        >
            평가 초기화
        </button>
      </div>
    </div>
  )
}

const App = () => {
  const [activeSection, setActiveSection] = useState("suitability");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <style>{`
        /* --- DualFit Premium SaaS Design System (Monochrome) --- */
        
        :root {
          --primary: #111827; /* Gray 900 (Black-ish) */
          --primary-hover: #000000;
          --primary-light: #F3F4F6; /* Gray 100 */
          
          --text-main: #111827; /* Gray 900 */
          --text-secondary: #4B5563; /* Gray 600 */
          --text-muted: #9CA3AF; /* Gray 400 */
          
          --bg-body: #F9FAFB; /* Gray 50 */
          --bg-card: #FFFFFF;
          --bg-sidebar: #FFFFFF;
          
          --border: #E5E7EB; /* Gray 200 */
          --border-focus: #111827; /* Focus ring is now dark */
          
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          
          --radius-lg: 16px;
          --radius-md: 12px;
          --radius-sm: 8px;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--text-main);
          background: var(--bg-body);
          -webkit-font-smoothing: antialiased;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
        }

        .app-container {
          display: flex;
          min-height: 100vh;
        }

        /* --- Sidebar --- */
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100%;
          z-index: 50;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid transparent;
        }

        .logo-box {
            width: 36px;
            height: 36px;
            background: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .app-title {
          font-weight: 700;
          font-size: 16px;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .sidebar-menu {
          padding: 20px 12px;
          flex: 1;
        }

        .menu-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 0 12px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 4px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text-secondary);
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          gap: 12px;
          transition: all 0.2s ease;
          position: relative;
        }

        .menu-item:hover {
          background: var(--bg-body);
          color: var(--text-main);
        }

        .menu-item.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }
        
        .active-indicator {
            position: absolute;
            right: 12px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--primary);
        }

        .sidebar-footer {
            padding: 20px;
            border-top: 1px solid var(--border);
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .avatar-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #E5E7EB;
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
        }
        
        .user-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-main);
        }
        
        .user-role {
            font-size: 11px;
            color: var(--text-muted);
        }

        /* --- Main Content --- */
        .main {
          flex: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          background: var(--bg-body);
        }

        .page-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 48px 40px;
        }

        .page-header {
          margin-bottom: 40px;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: var(--text-main);
          letter-spacing: -0.03em;
        }
        
        .page-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0;
        }

        /* --- Premium Cards --- */
        .card-premium {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            margin-bottom: 24px;
            transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        
        .card-hover-effect:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        /* --- Suitability Score Overview --- */
        .score-overview-card {
            display: flex;
            padding: 32px;
            align-items: center;
            gap: 40px;
        }
        
        .score-chart-area {
            position: relative;
        }
        
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 8px solid var(--primary-light);
            border-top-color: var(--primary);
            border-left-color: var(--primary);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            background: #fff;
            transform: rotate(45deg); /* Simple visual trick */
        }
        
        .score-circle > * {
            transform: rotate(-45deg);
        }
        
        .score-number {
            font-size: 32px;
            font-weight: 800;
            color: var(--text-main);
            line-height: 1;
        }
        
        .score-unit {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 600;
            margin-top: 4px;
        }
        
        .score-details-area {
            flex: 1;
        }
        
        .score-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .progress-container {
            background: var(--bg-body);
            padding: 16px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--text-secondary);
        }
        
        .progress-bar-track {
            height: 8px;
            background: #E5E7EB;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-bar-fill {
            height: 100%;
            background: var(--primary);
            border-radius: 4px;
            transition: width 0.5s ease;
        }

        /* --- Checklist Items --- */
        .category-card {
            padding: 0;
        }
        
        .category-title {
            font-size: 16px;
            font-weight: 700;
            background: #F9FAFB;
            padding: 16px 24px;
            margin: 0;
            border-bottom: 1px solid var(--border);
            color: var(--text-main);
        }
        
        .category-items {
            padding: 8px 24px;
        }

        .checklist-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid var(--border);
            gap: 24px;
        }
        
        .checklist-row:last-child {
            border-bottom: none;
        }

        .question-text {
            flex: 1;
            font-size: 15px;
            line-height: 1.5;
            color: var(--text-secondary);
            font-weight: 500;
        }

        /* --- Premium Slider --- */
        .answer-input-area {
            width: 220px;
            flex-shrink: 0;
        }
        
        .slider-container {
            width: 100%;
        }
        
        .slider-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .slider-num {
            font-size: 12px;
            color: #D1D5DB;
            cursor: pointer;
            width: 20px;
            text-align: center;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .slider-num:hover {
            color: var(--text-muted);
        }
        
        .slider-num.active {
            color: var(--primary);
            transform: scale(1.2);
        }

        .slider-track-wrapper {
            position: relative;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .track-bg {
            position: absolute;
            left: 0; 
            right: 0;
            height: 4px;
            background: #E5E7EB;
            border-radius: 2px;
            z-index: 0;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .track-fill {
            position: absolute;
            left: 0;
            height: 4px;
            background: var(--primary);
            border-radius: 2px;
            z-index: 1;
            transition: width 0.2s ease;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .custom-range {
            -webkit-appearance: none;
            width: 100%;
            height: 24px; /* Ensure input container is tall enough */
            background: transparent;
            outline: none;
            cursor: pointer;
            margin: 0;
            position: relative;
            z-index: 2;
            padding: 0;
        }
        
        .custom-range::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px; /* Match the visual track height */
            cursor: pointer;
            background: transparent; 
            border: none;
            border-radius: 2px;
        }
        
        .custom-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #FFFFFF;
            border: 2px solid #D1D5DB;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            margin-top: -8px; /* (Track 4px - Thumb 20px) / 2 = -8px. This centers it perfectly. */
        }
        
        /* Selected State */
        .custom-range.selected::-webkit-slider-thumb {
            background: var(--primary);
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.2); /* Black shadow */
        }

        .slider-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 10px;
            color: var(--text-muted);
            font-weight: 500;
        }

        /* --- Info & Result Cards --- */
        .info-banner {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            padding: 12px 16px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 24px;
        }
        
        .result-card {
            background: #F3F4F6;
            border-color: #E5E7EB;
            padding: 24px;
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }
        
        .result-icon {
            font-size: 32px;
            background: #FFFFFF;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .result-content h3 {
            margin: 0 0 8px 0;
            color: var(--text-main);
            font-size: 18px;
        }
        
        .result-content p {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* --- Legend --- */
        .rating-legend-card {
            padding: 16px 24px;
            background: #F8FAFC;
        }
        
        .legend-header {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        .legend-items {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
        }
        
        .legend-badge {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            color: var(--text-secondary);
        }
        
        .score-5 { background: var(--primary); color: white; border-color: var(--primary); }
        .score-4 { background: #4B5563; color: white; border-color: #4B5563; }
        .score-3 { background: #9CA3AF; color: white; border-color: #9CA3AF; }

        /* --- Tables --- */
        .table-card {
            overflow: hidden;
            padding: 0;
        }
        
        .table-responsive {
            overflow-x: auto;
        }
        
        .competency-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        
        .competency-table th {
            background: #F9FAFB;
            color: var(--text-secondary);
            font-weight: 600;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        
        .competency-table td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
            color: var(--text-secondary);
        }
        
        .competency-table tr:last-child td {
            border-bottom: none;
        }
        
        .domain-cell {
            background: #FFFFFF;
            vertical-align: top;
            border-right: 1px solid var(--border);
        }
        
        .domain-name {
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 8px;
        }
        
        .badge-weight {
            display: inline-block;
            font-size: 10px;
            background: #F3F4F6;
            color: #4B5563;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
        }
        
        .text-cell {
            color: var(--text-main);
        }
        
        .center-cell { text-align: center; }
        .input-cell { text-align: center; }

        .importance-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--primary);
            margin-right: 6px;
        }
        
        .gap-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: 700;
        }
        
        .gap-high {
            background: var(--primary);
            color: #FFFFFF;
        }
        
        .gap-low {
            background: #F3F4F6;
            color: #9CA3AF;
        }

        /* --- Compact Selector --- */
        .compact-selector {
            display: inline-flex;
            gap: 4px;
            background: #F3F4F6;
            padding: 3px;
            border-radius: 8px;
        }
        
        .compact-num-btn {
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            color: #6B7280;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            transition: all 0.15s;
        }
        
        .compact-num-btn:hover {
            background: rgba(0,0,0,0.05);
        }
        
        .compact-num-btn.selected {
            background: #FFFFFF;
            color: var(--primary);
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        /* --- Priority Section --- */
        .priority-section {
            margin-top: 48px;
        }
        
        .priority-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .text-primary { color: var(--primary); }
        
        .priority-header h3 {
            font-size: 20px;
            margin: 0;
            color: var(--text-main);
        }
        
        .priority-desc {
            margin-top: 0;
            margin-bottom: 24px;
            color: var(--text-secondary);
        }
        
        .priority-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .priority-card {
            display: flex;
            flex-direction: column;
            padding: 24px;
            position: relative;
            border-top: 4px solid var(--primary);
        }
        
        .priority-rank-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            background: var(--primary-light);
            color: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
        }
        
        .priority-domain {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .priority-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 16px;
            line-height: 1.4;
            min-height: 44px;
        }
        
        .priority-gap-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F9FAFB;
            padding: 8px 12px;
            border-radius: var(--radius-sm);
            font-size: 13px;
        }
        
        .priority-gap-info span { color: var(--text-secondary); }
        .priority-gap-info strong { color: var(--primary); font-weight: 700; }

        .action-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 40px;
        }
        
        .btn-text {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 13px;
            cursor: pointer;
            text-decoration: underline;
        }
        .btn-text:hover { color: var(--text-main); }

        /* Animation */
        @keyframes modal-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-modal-in {
            animation: modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main { margin-left: 0; width: 100%; }
          .page-content { padding: 24px 16px; }
          .checklist-row { flex-direction: column; align-items: flex-start; gap: 16px; }
          .answer-input-area { width: 100%; }
          .score-overview-card { flex-direction: column; gap: 24px; text-align: center; }
          .score-details-area { width: 100%; text-align: left; }
          
          .mobile-menu-toggle {
            display: block;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 100;
            background: white;
            border: 1px solid #E5E7EB;
            padding: 8px;
            border-radius: 8px;
            box-shadow: var(--shadow-sm);
            color: var(--text-main);
          }
          
          .priority-grid { grid-template-columns: 1fr; }
        }
        
        @media (min-width: 769px) {
            .mobile-menu-toggle { display: none; }
        }
      `}</style>

      {/* Mobile Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, backdropFilter: 'blur(2px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar activeSection={activeSection} setActiveSection={(s) => { setActiveSection(s); setIsMobileMenuOpen(false); }} />
      </div>

      <main className="main">
        {activeSection === "suitability" ? <SuitabilityChecklist /> : <CompetencyMatrix />}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
