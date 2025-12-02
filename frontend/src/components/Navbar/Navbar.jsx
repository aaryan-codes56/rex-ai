import React from 'react';
import './Navbar.css';

const Navbar = ({ user, isLoggedIn, onSignIn, onSignUp, onLogout, showDashboard, setShowDashboard, dropdownRef }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>RexAI</h2>
        </div>
        


        <div className="nav-buttons">
          {isLoggedIn && user ? (
            <div className="user-profile" ref={dropdownRef}>
              <span className="user-greeting">Welcome, {user.name}</span>
              <div 
                className="profile-avatar" 
                onClick={() => setShowDashboard(!showDashboard)}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
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