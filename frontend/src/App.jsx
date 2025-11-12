import { useState } from 'react'
import './App.css'

const API_URL = 'https://rex-ai-hu5w.onrender.com'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('Processing...')
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    console.log('Submitting to:', `${API_URL}${endpoint}`)
    console.log('Form data:', formData)
    
    try {
      console.log('Making request to:', `${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'cors'
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setMessage(`${isLogin ? 'Login' : 'Registration'} successful!`)
        setToken(data.token)
        setUser(data.user)
        setIsLoggedIn(true)
        setShowAuth(false)
        // Clear form
        setFormData({ name: '', email: '', password: '' })
      } else {
        setMessage(data.message || `Error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setMessage(`Network error: ${error.message}`)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setToken('')
    setMessage('')
  }

  if (isLoggedIn && user) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>RexAI</h1>
          </div>
          <div className="nav-buttons">
            <span className="user-name">Welcome, {user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
        
        <main className="dashboard-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2>{user.name}</h2>
              <p className="email">{user.email}</p>
            </div>
            
            <div className="profile-info">
              <div className="info-item">
                <label>User ID:</label>
                <span>{user.id}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span>{user.role || 'User'}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className="status-active">Active</span>
              </div>
            </div>
            
            {token && (
              <div className="token-section">
                <h3>JWT Token:</h3>
                <textarea value={token} readOnly rows="4" />
                <p>Copy this token to <a href="https://jwt.io" target="_blank">jwt.io</a> to verify</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={!isLogin}
              />
            )}
            
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            
            <button type="submit" className="auth-btn">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="switch-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
          
          <button className="back-btn" onClick={() => setShowAuth(false)}>
            ← Back to Home
          </button>
          
          {message && (
            <p className={`message ${
              message.includes('error') || message.includes('Error') ? 'error' : 
              message.includes('Processing') ? 'processing' : ''
            }`}>
              {message}
            </p>
          )}
          {token && (
            <div className="token">
              <h3>JWT Token:</h3>
              <textarea value={token} readOnly rows="4" />
              <p>Copy this token to <a href="https://jwt.io" target="_blank">jwt.io</a> to verify</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>RexAI</h1>
        </div>
        <div className="nav-buttons">
          <button 
            className="btn-signin" 
            onClick={() => { setIsLogin(true); setShowAuth(true); }}
          >
            Sign In
          </button>
          <button 
            className="btn-signup" 
            onClick={() => { setIsLogin(false); setShowAuth(true); }}
          >
            Sign Up
          </button>
        </div>
      </nav>
      
      <main className="hero">
        <h1 className="hero-title">Welcome to RexAI</h1>
        <p className="hero-subtitle">Your Smart AI-Powered Career Guidance Platform</p>
      </main>
    </div>
  )
}

export default App