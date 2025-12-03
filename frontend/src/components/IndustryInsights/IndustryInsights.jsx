import React, { useState, useEffect, useRef } from 'react';
import './IndustryInsights.css';
import Navbar from '../Navbar';

const IndustryInsights = ({ user, onLogout }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchIndustryInsights = async () => {
      try {
        const industry = user?.industry || 'Technology';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`https://rex-ai-hu5w.onrender.com/api/insights/${industry}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match UI expectations
          const transformedData = {
            marketOutlook: data.marketOutlook,
            industryGrowth: data.growthRate,
            demandLevel: data.demandLevel,
            topSkills: data.topSkills,
            salaryRanges: data.salaryRanges.map(range => ({
              role: range.role,
              min: range.min,
              median: range.median,
              max: range.max
            })),
            trends: data.keyTrends,
            recommendedSkills: data.recommendedSkills
          };
          setInsights(transformedData);
        } else {
          throw new Error('API failed');
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Fallback to mock data
        const fallbackData = {
          marketOutlook: 'Positive',
          industryGrowth: 85,
          demandLevel: 'High',
          topSkills: ['JavaScript', 'React', 'Python', 'AWS', 'Docker'],
          salaryRanges: [
            { role: 'Junior Developer', min: 60000, median: 75000, max: 90000 },
            { role: 'Senior Developer', min: 90000, median: 120000, max: 150000 }
          ],
          trends: ['AI Integration', 'Cloud Computing', 'Remote Work'],
          recommendedSkills: ['TypeScript', 'Kubernetes', 'GraphQL']
        };
        setInsights(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryInsights();
  }, [user?.industry]);

  if (loading) {
    return (
      <div className="insights-page">
        <Navbar 
          user={user} 
          isLoggedIn={true} 
          onLogout={onLogout}
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
          dropdownRef={dropdownRef}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading industry insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <Navbar 
        user={user} 
        isLoggedIn={true} 
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
      />
      
      <div className="insights-container">
        <div className="insights-header">
          <h1>Industry Insights</h1>
          <p className="industry-name">{user?.industry || 'Technology'} Industry</p>
        </div>

        {/* Top Cards */}
        <div className="insights-overview">
          <div className="overview-card market-card">
            <div className="card-header">
              <div className="card-icon market-icon">📈</div>
              <div className="card-title">
                <h3>Market Outlook</h3>
                <p className="card-subtitle">Current market sentiment</p>
              </div>
            </div>
            <div className="card-content">
              <div className={`outlook-badge ${insights.marketOutlook.toLowerCase()}`}>
                <span className="badge-dot"></span>
                {insights.marketOutlook}
              </div>
            </div>
          </div>

          <div className="overview-card growth-card">
            <div className="card-header">
              <div className="card-icon growth-icon">📊</div>
              <div className="card-title">
                <h3>Industry Growth</h3>
                <p className="card-subtitle">Year-over-year growth</p>
              </div>
            </div>
            <div className="card-content">
              <div className="growth-display">
                <span className="growth-number">{insights.industryGrowth}%</span>
                <div className="growth-bar">
                  <div 
                    className="growth-fill" 
                    style={{ width: `${insights.industryGrowth}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="overview-card demand-card">
            <div className="card-header">
              <div className="card-icon demand-icon">🔥</div>
              <div className="card-title">
                <h3>Job Demand</h3>
                <p className="card-subtitle">Current hiring demand</p>
              </div>
            </div>
            <div className="card-content">
              <div className={`demand-badge ${insights.demandLevel.toLowerCase()}`}>
                <span className="demand-indicator"></span>
                {insights.demandLevel}
              </div>
            </div>
          </div>

          <div className="overview-card skills-card">
            <div className="card-header">
              <div className="card-icon skills-icon">⚡</div>
              <div className="card-title">
                <h3>Top Skills</h3>
                <p className="card-subtitle">Most in-demand skills</p>
              </div>
            </div>
            <div className="card-content">
              <div className="top-skills">
                {insights.topSkills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="top-skill-tag">
                    <span className="skill-rank">#{index + 1}</span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Salary Chart */}
        <div className="salary-section">
          <div className="section-header">
            <h2>💰 Salary Insights</h2>
            <p>Compensation ranges across different experience levels</p>
          </div>
          <div className="salary-grid">
            {insights.salaryRanges.map((role, index) => (
              <div key={index} className="salary-card">
                <div className="salary-header">
                  <h4>{role.role}</h4>
                  <div className="salary-trend">📈 +12%</div>
                </div>
                <div className="salary-stats">
                  <div className="salary-stat">
                    <span className="stat-label">Min</span>
                    <span className="stat-value min">${(role.min / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="salary-stat main">
                    <span className="stat-label">Median</span>
                    <span className="stat-value median">${(role.median / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="salary-stat">
                    <span className="stat-label">Max</span>
                    <span className="stat-value max">${(role.max / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <div className="salary-bar">
                  <div className="bar-segment min-segment" style={{ width: '25%' }}></div>
                  <div className="bar-segment median-segment" style={{ width: '50%' }}></div>
                  <div className="bar-segment max-segment" style={{ width: '25%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Trends Section */}
        <div className="bottom-section">
          <div className="trends-panel">
            <div className="panel-header">
              <h2>🚀 Industry Trends</h2>
              <p>Key developments shaping the industry</p>
            </div>
            <div className="trends-grid">
              {insights.trends.map((trend, index) => (
                <div key={index} className="trend-card">
                  <div className="trend-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="trend-content">
                    <h4>{trend}</h4>
                    <div className="trend-impact">High Impact</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-panel">
            <div className="panel-header">
              <h2>🎯 Skill Recommendations</h2>
              <p>Skills to boost your career prospects</p>
            </div>
            <div className="skills-recommendations">
              {insights.recommendedSkills.map((skill, index) => (
                <div key={index} className="skill-recommendation">
                  <span className="skill-name">{skill}</span>
                  <div className="skill-demand">
                    <span className="demand-level">High Demand</span>
                    <div className="demand-bars">
                      <div className="demand-bar active"></div>
                      <div className="demand-bar active"></div>
                      <div className="demand-bar active"></div>
                      <div className="demand-bar"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryInsights;