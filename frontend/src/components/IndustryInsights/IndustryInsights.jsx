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
        
        console.log('User object:', user);
        console.log('User industry from profile:', user?.industry);
        console.log('Fetching AI-powered insights for:', industry);
        
        const apiUrl = `https://rex-ai-hu5w.onrender.com/api/insights/${encodeURIComponent(industry)}`;
        console.log('Making API call to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received insights data:', data);
          console.log('Sample salary role from API:', data.salaryRanges?.[0]?.role);
          console.log('Expected industry roles for', industry, '- checking if roles match industry');
          
          // Transform API data to match UI expectations
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
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        console.log('Using fallback data for:', user?.industry || 'Technology');
        console.log('Available fallback industries:', Object.keys(getFallbackInsights('').constructor === Object ? {
          Technology: true,
          Sales: true,
          Finance: true,
          Healthcare: true,
          Marketing: true,
          Education: true
        } : {}));
        
        // Industry-specific fallback data
        const fallbackData = getFallbackInsights(user?.industry || 'Technology');
        setInsights(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryInsights();
  }, [user?.industry]);

  const getFallbackInsights = (industry) => {
    const fallbackData = {
      Technology: {
        marketOutlook: 'Positive',
        industryGrowth: 22,
        demandLevel: 'High',
        topSkills: ['JavaScript', 'Python', 'React', 'AWS', 'Docker'],
        salaryRanges: [
          { role: 'Software Engineer', min: 70000, median: 95000, max: 150000 },
          { role: 'Data Scientist', min: 80000, median: 110000, max: 160000 },
          { role: 'Product Manager', min: 90000, median: 125000, max: 180000 },
          { role: 'DevOps Engineer', min: 75000, median: 105000, max: 155000 },
          { role: 'Frontend Developer', min: 65000, median: 90000, max: 140000 }
        ],
        trends: ['AI Integration', 'Cloud Migration', 'Remote Work', 'Cybersecurity Focus', 'Low-Code Platforms'],
        recommendedSkills: ['Machine Learning', 'Kubernetes', 'TypeScript', 'GraphQL', 'Microservices']
      },
      Sales: {
        marketOutlook: 'Positive',
        industryGrowth: 12,
        demandLevel: 'High',
        topSkills: ['CRM Software', 'Lead Generation', 'Negotiation', 'Communication', 'Pipeline Management'],
        salaryRanges: [
          { role: 'Sales Representative', min: 40000, median: 55000, max: 80000 },
          { role: 'Account Manager', min: 50000, median: 70000, max: 100000 },
          { role: 'Sales Manager', min: 70000, median: 95000, max: 140000 },
          { role: 'Business Development Representative', min: 35000, median: 50000, max: 70000 },
          { role: 'Sales Director', min: 90000, median: 130000, max: 200000 }
        ],
        trends: ['Social Selling', 'Sales Automation', 'AI-Powered CRM', 'Video Prospecting', 'Account-Based Selling'],
        recommendedSkills: ['Salesforce', 'HubSpot', 'LinkedIn Sales Navigator', 'Sales Analytics', 'Customer Success']
      },
      Finance: {
        marketOutlook: 'Positive',
        industryGrowth: 8,
        demandLevel: 'Medium',
        topSkills: ['Financial Modeling', 'Excel', 'Python', 'SQL', 'Risk Analysis'],
        salaryRanges: [
          { role: 'Financial Analyst', min: 55000, median: 75000, max: 120000 },
          { role: 'Investment Banker', min: 85000, median: 130000, max: 200000 },
          { role: 'Portfolio Manager', min: 90000, median: 150000, max: 250000 },
          { role: 'Risk Manager', min: 70000, median: 105000, max: 160000 },
          { role: 'Quantitative Analyst', min: 80000, median: 120000, max: 180000 }
        ],
        trends: ['Digital Banking', 'Cryptocurrency', 'ESG Investing', 'RegTech', 'Robo-Advisors'],
        recommendedSkills: ['Blockchain', 'Machine Learning', 'Tableau', 'R Programming', 'Financial Planning']
      },
      Healthcare: {
        marketOutlook: 'Positive',
        industryGrowth: 15,
        demandLevel: 'High',
        topSkills: ['Patient Care', 'Medical Records', 'HIPAA Compliance', 'Clinical Research', 'Healthcare IT'],
        salaryRanges: [
          { role: 'Registered Nurse', min: 60000, median: 75000, max: 95000 },
          { role: 'Healthcare Administrator', min: 70000, median: 95000, max: 140000 },
          { role: 'Medical Technologist', min: 50000, median: 65000, max: 85000 },
          { role: 'Healthcare Data Analyst', min: 55000, median: 75000, max: 100000 },
          { role: 'Clinical Research Coordinator', min: 45000, median: 60000, max: 80000 }
        ],
        trends: ['Telemedicine', 'AI Diagnostics', 'Personalized Medicine', 'Digital Health Records', 'Preventive Care'],
        recommendedSkills: ['Electronic Health Records', 'Data Analysis', 'Telehealth Platforms', 'Medical Coding', 'Quality Assurance']
      },
      Marketing: {
        marketOutlook: 'Positive',
        industryGrowth: 10,
        demandLevel: 'High',
        topSkills: ['Digital Marketing', 'SEO', 'Social Media', 'Content Creation', 'Analytics'],
        salaryRanges: [
          { role: 'Digital Marketing Specialist', min: 45000, median: 60000, max: 85000 },
          { role: 'Marketing Manager', min: 65000, median: 85000, max: 130000 },
          { role: 'Content Marketing Manager', min: 50000, median: 70000, max: 95000 },
          { role: 'SEO Specialist', min: 40000, median: 55000, max: 80000 },
          { role: 'Social Media Manager', min: 35000, median: 50000, max: 75000 }
        ],
        trends: ['Influencer Marketing', 'Video Content', 'AI-Powered Ads', 'Privacy-First Marketing', 'Omnichannel Strategies'],
        recommendedSkills: ['Marketing Automation', 'Google Analytics', 'Facebook Ads', 'Email Marketing', 'Conversion Optimization']
      },
      Education: {
        marketOutlook: 'Neutral',
        industryGrowth: 5,
        demandLevel: 'Medium',
        topSkills: ['Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment', 'Student Engagement'],
        salaryRanges: [
          { role: 'Elementary Teacher', min: 40000, median: 50000, max: 70000 },
          { role: 'Instructional Designer', min: 50000, median: 65000, max: 90000 },
          { role: 'Education Administrator', min: 60000, median: 80000, max: 120000 },
          { role: 'Curriculum Developer', min: 45000, median: 60000, max: 85000 },
          { role: 'Educational Technology Specialist', min: 50000, median: 70000, max: 95000 }
        ],
        trends: ['Online Learning', 'Personalized Education', 'EdTech Integration', 'Competency-Based Learning', 'Hybrid Classrooms'],
        recommendedSkills: ['Learning Management Systems', 'Educational Apps', 'Data-Driven Instruction', 'Virtual Reality in Education', 'Student Analytics']
      }
    };
    
    console.log('Fallback data requested for industry:', industry);
    console.log('Available fallback industries:', Object.keys(fallbackData));
    const result = fallbackData[industry] || fallbackData.Technology;
    console.log('Returning fallback data for:', industry, 'Sample role:', result.salaryRanges?.[0]?.role);
    return result;
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