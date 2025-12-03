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
    const getIndustryData = (industry) => {
      const industryData = {
        Technology: {
          marketOutlook: 'Positive',
          industryGrowth: 85,
          demandLevel: 'High',
          topSkills: ['JavaScript', 'React', 'Python', 'AWS', 'Docker'],
          salaryRanges: [
            { role: 'Junior Developer', min: 60000, median: 75000, max: 90000 },
            { role: 'Senior Developer', min: 90000, median: 120000, max: 150000 },
            { role: 'Tech Lead', min: 120000, median: 150000, max: 180000 },
            { role: 'Engineering Manager', min: 140000, median: 170000, max: 200000 }
          ],
          trends: ['AI/ML Integration', 'Cloud Computing', 'DevOps Automation', 'Cybersecurity', 'Remote Development'],
          recommendedSkills: ['TypeScript', 'Kubernetes', 'GraphQL', 'Microservices', 'Machine Learning']
        },
        Finance: {
          marketOutlook: 'Stable',
          industryGrowth: 65,
          demandLevel: 'Medium',
          topSkills: ['Financial Analysis', 'Risk Management', 'Excel', 'SQL', 'Python'],
          salaryRanges: [
            { role: 'Financial Analyst', min: 55000, median: 70000, max: 85000 },
            { role: 'Senior Analyst', min: 75000, median: 95000, max: 115000 },
            { role: 'Finance Manager', min: 95000, median: 125000, max: 155000 },
            { role: 'Finance Director', min: 130000, median: 165000, max: 200000 }
          ],
          trends: ['Digital Banking', 'Cryptocurrency', 'RegTech', 'ESG Investing', 'Robo-Advisors'],
          recommendedSkills: ['Data Analytics', 'Blockchain', 'Compliance', 'Financial Modeling', 'Power BI']
        },
        Healthcare: {
          marketOutlook: 'Very Positive',
          industryGrowth: 92,
          demandLevel: 'Very High',
          topSkills: ['Patient Care', 'Medical Knowledge', 'EMR Systems', 'Telemedicine', 'Healthcare Analytics'],
          salaryRanges: [
            { role: 'Healthcare Assistant', min: 35000, median: 45000, max: 55000 },
            { role: 'Registered Nurse', min: 60000, median: 75000, max: 90000 },
            { role: 'Healthcare Manager', min: 80000, median: 105000, max: 130000 },
            { role: 'Healthcare Director', min: 120000, median: 150000, max: 180000 }
          ],
          trends: ['Telehealth Expansion', 'AI Diagnostics', 'Personalized Medicine', 'Digital Health Records', 'Preventive Care'],
          recommendedSkills: ['Digital Health', 'Data Analysis', 'Quality Improvement', 'Healthcare IT', 'Patient Experience']
        },
        Marketing: {
          marketOutlook: 'Positive',
          industryGrowth: 78,
          demandLevel: 'High',
          topSkills: ['Digital Marketing', 'SEO/SEM', 'Social Media', 'Analytics', 'Content Creation'],
          salaryRanges: [
            { role: 'Marketing Coordinator', min: 40000, median: 50000, max: 60000 },
            { role: 'Marketing Specialist', min: 55000, median: 70000, max: 85000 },
            { role: 'Marketing Manager', min: 75000, median: 95000, max: 115000 },
            { role: 'Marketing Director', min: 110000, median: 140000, max: 170000 }
          ],
          trends: ['Influencer Marketing', 'AI-Powered Personalization', 'Video Content', 'Voice Search Optimization', 'Privacy-First Marketing'],
          recommendedSkills: ['Marketing Automation', 'Data Analytics', 'CRM Systems', 'A/B Testing', 'Customer Journey Mapping']
        },
        Education: {
          marketOutlook: 'Stable',
          industryGrowth: 55,
          demandLevel: 'Medium',
          topSkills: ['Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment', 'Student Engagement'],
          salaryRanges: [
            { role: 'Teaching Assistant', min: 25000, median: 35000, max: 45000 },
            { role: 'Teacher', min: 40000, median: 55000, max: 70000 },
            { role: 'Department Head', min: 60000, median: 75000, max: 90000 },
            { role: 'Principal', min: 80000, median: 100000, max: 120000 }
          ],
          trends: ['Online Learning', 'EdTech Integration', 'Personalized Learning', 'STEM Focus', 'Social-Emotional Learning'],
          recommendedSkills: ['Learning Management Systems', 'Digital Literacy', 'Data-Driven Instruction', 'Inclusive Education', 'Educational Assessment']
        }
      };

      return industryData[industry] || industryData.Technology;
    };

    setTimeout(() => {
      const industryInsights = getIndustryData(user?.industry);
      setInsights(industryInsights);
      setLoading(false);
    }, 1000);
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