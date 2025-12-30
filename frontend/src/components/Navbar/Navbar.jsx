import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({
  user,
  isLoggedIn,
  onSignIn,
  onSignUp,
  onLogout,
  showDashboard,
  setShowDashboard,
  dropdownRef,
  onNavigate,
  showProfile = false
}) => {
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
    setShowDashboard(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => {
          if (window.location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            navigate('/');
            setTimeout(() => window.scrollTo(0, 0), 0);
          }
        }}>
          <img src="/rex.png" alt="RexAI" className="logo-image" />
        </div>

        {isLoggedIn && user && (
          <div className="nav-links">
            <button
              className="nav-link"
              onClick={() => handleNavigation('courses')}
            >
              Courses
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation('insights')}
            >
              Industry Insights
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation('resume')}
            >
              Resume Builder
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation('interview')}
            >
              Interview Prep
            </button>
          </div>
        )}

        <div className="nav-buttons">
          {isLoggedIn && user ? (
            <div className="user-profile" ref={dropdownRef}>
              <span className="user-greeting">Welcome, {user.name}</span>
              <div
                className="profile-avatar"
                onClick={() => setShowDashboard(!showDashboard)}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {showDashboard && (
                <div className="profile-dropdown">
                  <button onClick={() => handleNavigation('dashboard')}>Dashboard</button>
                  <button onClick={onLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="signin-btn" onClick={onSignIn}>Sign In</button>
              <button className="signup-btn" onClick={onSignUp}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;