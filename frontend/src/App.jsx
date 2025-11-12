import { useState } from 'react'
import './App.css'

const API_URL = 'https://rex-ai-hu5w.onrender.com'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`${isLogin ? 'Login' : 'Registration'} successful!`)
        setToken(data.token)
      } else {
        setMessage(data.message || 'Error occurred')
      }
    } catch (error) {
      setMessage('Network error')
    }
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
          
          {message && <p className="message">{message}</p>}
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