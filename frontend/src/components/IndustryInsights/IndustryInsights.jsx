import React, { useState, useEffect, useRef } from 'react';
import './IndustryInsights.css';
import Navbar from '../Navbar';
import API_BASE_URL from '../../config';

const IndustryInsights = ({ user, onLogout }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(user?.industry || 'Technology');
  const [insights, setInsights] = useState({
    marketOutlook: '',
    industryGrowth: 0,
    demandLevel: '',
    topSkills: [],
    salaryRanges: [],
    trends: [],
    recommendedSkills: []
  });
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const dropdownRef = useRef(null);

  const industries = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Education', 'Sales'];

  useEffect(() => {
    if (user?.industry) {
      setSelectedIndustry(user.industry);
    }
  }, [user]);


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
        setLoading(true);
        const token = localStorage.getItem('token');

        console.log('Fetching insights for:', selectedIndustry);

        const apiUrl = `${API_BASE_URL}/api/insights/${encodeURIComponent(selectedIndustry)}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          const transformedData = {
            marketOutlook: data.marketOutlook,
            industryGrowth: data.growthRate,
            demandLevel: data.demandLevel,
            topSkills: data.topSkills || [],
            salaryRanges: (data.salaryRanges || []).map(range => ({
              role: range.role,
              min: range.min,
              median: range.median,
              max: range.max
            })),
            trends: data.keyTrends || [],
            recommendedSkills: data.recommendedSkills || []
          };
          setInsights(transformedData);
        } else {
          throw new Error('API Error');
        }
      } catch (error) {
        console.error('Using fallback data due to error:', error);
        setInsights(getFallbackInsights(selectedIndustry));
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryInsights();
  }, [selectedIndustry]);

  const getFallbackInsights = (industry) => {

    const defaultData = {
      marketOutlook: 'Stable',
      industryGrowth: 5.2,
      demandLevel: 'High',
      topSkills: ['Data Analysis', 'Communication', 'Project Management'],
      salaryRanges: [
        { role: 'Entry Level', min: 45000, median: 60000, max: 75000 },
        { role: 'Mid Level', min: 75000, median: 95000, max: 120000 },
        { role: 'Senior Level', min: 110000, median: 140000, max: 180000 }
      ],
      trends: ['Digital Transformation', 'Remote Work', 'AI Integration'],
      recommendedSkills: ['Python', 'Agile Methodology', 'Cloud Computing']
    };

    const industryData = {
      Technology: {
        marketOutlook: 'Bullish',
        industryGrowth: 12.5,
        demandLevel: 'Very High',
        topSkills: ['React.js', 'Node.js', 'System Design', 'Cloud Architecture'],
        salaryRanges: [
          { role: 'Junior Developer', min: 500000, median: 800000, max: 1200000 },
          { role: 'Senior Developer', min: 1500000, median: 2400000, max: 3500000 },
          { role: 'Tech Lead', min: 2500000, median: 3500000, max: 5000000 }
        ],
        trends: ['Generative AI', 'Cybersecurity', 'Edge Computing'],
        recommendedSkills: ['TensorFlow', 'Kubernetes', 'AWS', 'System Design']
      },
      Finance: {
        marketOutlook: 'Stable',
        industryGrowth: 4.8,
        demandLevel: 'Moderate',
        topSkills: ['Financial Modeling', 'Risk Management', 'Data Analysis'],
        salaryRanges: [
          { role: 'Analyst', min: 400000, median: 700000, max: 1000000 },
          { role: 'Associate', min: 800000, median: 1500000, max: 2000000 },
          { role: 'VP', min: 2500000, median: 4000000, max: 6000000 }
        ],
        trends: ['FinTech', 'Blockchain', 'ESG Investing'],
        recommendedSkills: ['Python for Finance', 'SQL', 'Tableau']
      },
      Healthcare: {
        marketOutlook: 'Growing',
        industryGrowth: 8.5,
        demandLevel: 'Very High',
        topSkills: ['Patient Care', 'Electronic Health Records', 'Medical Coding'],
        salaryRanges: [
          { role: 'Nurse', min: 300000, median: 500000, max: 800000 },
          { role: 'Healthcare Admin', min: 400000, median: 600000, max: 900000 },
          { role: 'Physician', min: 1200000, median: 2000000, max: 4000000 }
        ],
        trends: ['Telemedicine', 'AI Diagnostics', 'Personalized Medicine'],
        recommendedSkills: ['Healthcare IT', 'Data Privacy', 'Telehealth specific']
      },
      Marketing: {
        marketOutlook: 'Evolving',
        industryGrowth: 6.2,
        demandLevel: 'High',
        topSkills: ['SEO/SEM', 'Content Strategy', 'Data Analytics'],
        salaryRanges: [
          { role: 'Marketing Specialist', min: 300000, median: 500000, max: 800000 },
          { role: 'Marketing Manager', min: 800000, median: 1200000, max: 1800000 },
          { role: 'CMO', min: 2000000, median: 3500000, max: 5000000 }
        ],
        trends: ['AI Content Generation', 'Video Marketing', 'Influencer Strategy'],
        recommendedSkills: ['Google Analytics', 'Copywriting', 'Social Media Algorithms']
      }
    };

    return industryData[industry] || defaultData;
  };

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
          <p>Analyzing {selectedIndustry} Market Data...</p>
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
          <div className="header-content">
            <h1>Industry Insights</h1>
            <p className="header-subtitle">Real-time market analysis and trends provided by RexAI</p>
          </div>

          <div className="industry-selector-container">
            <span className="industry-label">Current Focus:</span>
            <div className="industry-badge glass-panel">
              {selectedIndustry}
            </div>
          </div>
        </div>


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
                    <span className="stat-value min">
                      ₹{role.min < 100000 ? `${(role.min / 1000).toFixed(0)}k` : `${(role.min / 100000).toFixed(1)}L`}
                    </span>
                  </div>
                  <div className="salary-stat main">
                    <span className="stat-label">Median</span>
                    <span className="stat-value median">
                      ₹{role.median < 100000 ? `${(role.median / 1000).toFixed(0)}k` : `${(role.median / 100000).toFixed(1)}L`}
                    </span>
                  </div>
                  <div className="salary-stat">
                    <span className="stat-label">Max</span>
                    <span className="stat-value max">
                      ₹{role.max < 100000 ? `${(role.max / 1000).toFixed(0)}k` : `${(role.max / 100000).toFixed(1)}L`}
                    </span>
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