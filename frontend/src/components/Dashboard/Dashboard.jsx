import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../Navbar';
import API_BASE_URL from '../../config';

const Dashboard = ({ user, token, onLogout, onEditProfile }) => {
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [enrolledCourses, setEnrolledCourses] = React.useState([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const skillsArray = user?.skills ? user.skills.split(',').map(skill => skill.trim()) : [];

  // Check if profile is complete
  const isProfileComplete = (user) => {
    return user?.industry && user?.experience && user?.skills && user?.bio;
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching enrolled courses with token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE_URL}/api/courses/enrolled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Enrolled courses response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Enrolled courses data:', data);
        setEnrolledCourses(data.courses || []);
      } else {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      // Fallback: empty array when backend is unavailable
      setEnrolledCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  React.useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const [recommendedCourses, setRecommendedCourses] = React.useState([]);
  const [loadingRecommended, setLoadingRecommended] = React.useState(false);

  // Fetch recommended courses based on user industry
  React.useEffect(() => {
    const fetchRecommended = async () => {
      if (!user?.industry) return;

      setLoadingRecommended(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/courses?category=${encodeURIComponent(user.industry)}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRecommendedCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching recommended courses:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    if (user?.industry) {
      fetchRecommended();
    }
  }, [user]);



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
                {isProfileComplete(user) ? 'Edit Profile' : 'Complete Profile'}
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

        {/* Recommended Courses Section */}
        {user?.industry && (
          <div className="recommended-section">
            <div className="section-header">
              <h3>Selected for {user.industry}</h3>
              <button className="view-all-btn" onClick={() => navigate('/courses')}>
                View All
              </button>
            </div>

            {loadingRecommended ? (
              <div className="loading-state" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <p>Curating best courses for {user.industry}...</p>
                <small>This might take a moment as our AI personalizes content for you.</small>
              </div>
            ) : recommendedCourses.length > 0 ? (
              <div className="courses-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {recommendedCourses.map(course => (
                  <div key={course._id} className="course-card" style={{
                    background: 'var(--color-glass-surface)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }} onClick={() => navigate('/courses')}>
                    <div className="course-badge" style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      marginBottom: '10px'
                    }}>{course.level}</div>
                    <h4 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{course.title}</h4>
                    <p style={{
                      color: '#9ca3af',
                      fontSize: '0.9rem',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{course.description}</p>
                    <div className="course-meta" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      color: '#d1d5db'
                    }}>
                      <span>⭐ {course.rating}</span>
                      <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <p>No courses found for this category yet.</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{ marginTop: '10px', padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                >
                  Refresh to Generate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="enrolled-courses">
          <h3>My Enrolled Courses</h3>
          {loadingCourses ? (
            <div className="loading">Loading courses...</div>
          ) : enrolledCourses.length > 0 ? (
            <div className="courses-list">
              {enrolledCourses.map(course => (
                <div key={course._id} className="enrolled-course-card">
                  <div className="course-info">
                    <h4>{course.title}</h4>
                    <p className="course-category">{course.category}</p>
                    <p className="course-instructor">By {course.instructorName}</p>
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress || 0}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>You haven't enrolled in any courses yet.</p>
              <button className="browse-btn" onClick={() => navigate('/courses')}>
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/insights')}>
              <div className="action-icon">📊</div>
              <h4>Industry Insights</h4>
              <p>View market trends and salary data</p>
              <div className="action-arrow">→</div>
            </div>
            <div className="action-card" onClick={() => navigate('/courses')}>
              <div className="action-icon">📚</div>
              <h4>Browse Courses</h4>
              <p>Explore available courses and enroll</p>
              <div className="action-arrow">→</div>
            </div>
            <div className="action-card" onClick={() => navigate('/resume')}>
              <div className="action-icon">📄</div>
              <h4>Build Resume</h4>
              <p>Create and download your resume</p>
              <div className="action-arrow">→</div>
            </div>
            <div className="action-card" onClick={() => navigate('/interview')}>
              <div className="action-icon">🎯</div>
              <h4>Interview Prep</h4>
              <p>Practice with mock interviews</p>
              <div className="action-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;