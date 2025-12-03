import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../Navbar';

const Dashboard = ({ user, token, onLogout, onEditProfile }) => {
  const [showDashboard, setShowDashboard] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const skillsArray = user?.skills ? user.skills.split(',').map(skill => skill.trim()) : [];

  const checkDatabaseData = async () => {
    try {
      const response = await fetch('https://rex-ai-hu5w.onrender.com/api/debug/user-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('=== DATABASE DATA ===');
      console.log(data);
      alert('Check console for database data');
    } catch (error) {
      console.error('Error fetching database data:', error);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dashboard-page">
      <Navbar 
        user={user}
        isLoggedIn={true}
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
      />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="back-btn" onClick={() => navigate('/')}>
            <span>←</span>
            Back to Home
          </button>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p className="profile-email">{user?.email}</p>
              </div>
              <button className="edit-btn" onClick={() => {
                console.log('Edit Profile clicked');
                console.log('onEditProfile function:', onEditProfile);
                onEditProfile();
              }}>
                Complete Profile
              </button>
              <button className="debug-btn" onClick={checkDatabaseData}>
                Check DB Data
              </button>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <h4>Industry</h4>
                <p>{user?.industry || 'Not specified'}</p>
              </div>

              <div className="detail-item">
                <h4>Years of Experience</h4>
                <p>{user?.experience ? `${user.experience} years` : 'Not specified'}</p>
              </div>

              <div className="detail-item">
                <h4>Skills</h4>
                <div className="skills-container">
                  {skillsArray.length > 0 ? (
                    skillsArray.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p>No skills added</p>
                  )}
                </div>
              </div>

              <div className="detail-item bio-item">
                <h4>Professional Bio</h4>
                <p>{user?.bio || 'No bio added'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h4>Industry Insights</h4>
              <p>View market trends and salary data</p>
            </div>
            <div className="action-card">
              <div className="action-icon">📄</div>
              <h4>Build Resume</h4>
              <p>Create and download your resume</p>
            </div>
            <div className="action-card">
              <div className="action-icon">🎯</div>
              <h4>Interview Prep</h4>
              <p>Practice with mock interviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;