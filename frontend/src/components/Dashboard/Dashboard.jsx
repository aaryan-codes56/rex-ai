import './Dashboard.css'

const Dashboard = ({ user, token, showDashboard, onLogout }) => {
  if (!showDashboard) return null
  

  
  return (
    <div className="dashboard-dropdown">
      <div className="dropdown-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar-large">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="status-indicator"></div>
          </div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <p className="email">{user.email}</p>

          </div>
        </div>
        

        
        {/* Menu Items */}
        <div className="menu-items">
          <div className="menu-item">
            <span className="menu-icon">👤</span>
            <span className="menu-text">Profile Settings</span>
            <span className="menu-arrow">→</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">🔒</span>
            <span className="menu-text">Privacy & Security</span>
            <span className="menu-arrow">→</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">💳</span>
            <span className="menu-text">Billing & Plans</span>
            <span className="menu-arrow">→</span>
          </div>
        </div>
        
        {/* JWT Token Section */}
        {/* {token && (
          <div className="token-section">
            <div className="token-header">
              <span className="token-icon">🔑</span>
              <h4>Authentication Token</h4>
            </div>
            <div className="token-display">
              <code>{token.substring(0, 40)}...</code>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(token)}>
                📋
              </button>
            </div>
            <a href="https://jwt.io" target="_blank" className="verify-link">
              🔍 Verify on JWT.io
            </a>
          </div>
        )} */}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-logout" onClick={onLogout}>
            <span className="btn-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard