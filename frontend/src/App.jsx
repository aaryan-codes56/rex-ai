import { useState, useEffect, useRef } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import AuthForm from './components/AuthForm'

const API_URL = 'https://rex-ai-hu5w.onrender.com'

// Test function to check backend connectivity
const testBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/test`)
    const data = await response.json()
    console.log('Backend test:', data)
    return true
  } catch (error) {
    console.error('Backend test failed:', error)
    return false
  }
}

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const wakeUpBackend = async () => {
    try {
      await fetch(`${API_URL}/test`, { method: 'GET' })
    } catch (error) {
      console.log('Backend wake-up attempt')
    }
  }

  const handleAuthSubmit = async (formData) => {
    setMessage('Processing...')
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    console.log('Submitting to:', `${API_URL}${endpoint}`)
    console.log('Form data:', formData)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setMessage(`${isLogin ? 'Login' : 'Registration'} successful!`)
        setToken(data.token)
        setUser(data.user)
        setIsLoggedIn(true)
        setShowAuth(false)
      } else {
        setMessage(data.message || `Error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      
      if (error.name === 'AbortError') {
        setMessage('Request timed out. Please try again.')
      } else {
        setMessage(`Error: ${error.message}`)
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setToken('')
    setMessage('')
    setShowDashboard(false)
  }



  if (showAuth) {
    return (
      <AuthForm
        isLogin={isLogin}
        onSubmit={handleAuthSubmit}
        onToggle={() => setIsLogin(!isLogin)}
        onBack={() => setShowAuth(false)}
        message={message}
        token={token}
      />
    )
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>RexAI</h1>
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
              <Dashboard 
                user={user}
                token={token}
                showDashboard={showDashboard}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
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