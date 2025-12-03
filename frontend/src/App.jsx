import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import AuthForm from './components/AuthForm'
import HomePage from './components/HomePage'
import ProfileModal from './components/ProfileModal'
import IndustryInsights from './components/IndustryInsights'
import ResumeBuilder from './components/ResumeBuilder'
import InterviewPrep from './components/InterviewPrep'

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
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Check if user profile is incomplete (only for truly empty profiles)
  const isProfileIncomplete = (user) => {
    return !user?.industry && !user?.experience && !user?.skills && !user?.bio
  }

  // Check for stored token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    console.log('App loaded, checking stored token:', !!storedToken)
    
    if (storedToken) {
      setToken(storedToken)
      // Fetch user profile which will set isLoggedIn and user state
      fetchUserProfile(storedToken)
    } else {
      // Ensure we start with logged out state if no token
      console.log('No stored token, setting logged out state')
      setIsLoggedIn(false)
      setUser(null)
    }
  }, [])

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
      
      const data = await response.json()
      console.log('Auth response data:', data);
      
      if (response.ok) {
        setToken(data.token)
        setIsLoggedIn(true)
        setUser(data.user)
        setShowAuth(false)
        
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        
        if (!isLogin) {
          // Show profile modal for new signups
          setShowProfileModal(true)
        }
        
        // Navigate to home
        navigate('/')
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
    console.log('Logging out user...');
    setIsLoggedIn(false)
    setUser(null)
    setToken('')
    setMessage('')
    setShowDashboard(false)
    setShowProfileModal(false)
    localStorage.removeItem('token')
    console.log('Logout complete, navigating to home');
    navigate('/')
  }

  const handleNavigation = (page) => {
    setShowDashboard(false)
    navigate(`/${page}`)
  }

  const handleEditProfile = () => {
    setShowProfileModal(true)
  }

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsLoggedIn(true)
        
        // Show profile modal if profile is incomplete
        if (isProfileIncomplete(data.user)) {
          setShowProfileModal(true)
        }
      } else {
        // Clear invalid token
        localStorage.removeItem('token')
        setToken('')
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      localStorage.removeItem('token')
      setToken('')
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const handleProfileSave = async (profileData) => {
    console.log('=== HANDLE PROFILE SAVE START ===')
    console.log('Profile data received:', profileData)
    console.log('Current token:', token)
    console.log('Current user:', user)
    
    if (!token) {
      console.error('No token available for profile save')
      alert('Authentication error. Please log in again.')
      return
    }
    
    try {
      setMessage('Saving profile...')
      console.log('Making API request to save profile...')
      
      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      
      console.log('Profile save response status:', response.status)
      console.log('Profile save response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Profile save failed:', response.status, errorText)
        alert(`Error saving profile: ${response.status} - ${errorText}`)
        setMessage(`Error saving profile: ${response.status}`)
        return
      }
      
      const data = await response.json()
      console.log('Profile save response data:', data)
      
      // Use the user data returned from backend to ensure consistency
      const updatedUser = data.user || {
        ...user,
        ...profileData
      }
      console.log('Updated user to set:', updatedUser)
      
      setUser(updatedUser)
      setShowProfileModal(false)
      setMessage('Profile saved successfully!')
      
      console.log('Profile save completed successfully')
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.error('Profile save error:', error)
      alert(`Network error: ${error.message}`)
      setMessage('Error saving profile. Please try again.')
    }
    
    console.log('=== HANDLE PROFILE SAVE END ===')
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
      <Routes>
        <Route path="/" element={
          <HomePage 
            onSignIn={() => { setIsLogin(true); setShowAuth(true); }}
            onSignUp={() => { setIsLogin(false); setShowAuth(true); }}
            user={user}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            showDashboard={showDashboard}
            setShowDashboard={setShowDashboard}
            dropdownRef={dropdownRef}
            onNavigate={handleNavigation}
          />
        } />
        <Route path="/dashboard" element={
          <Dashboard 
            user={user}
            token={token}
            onLogout={handleLogout}
            onEditProfile={handleEditProfile}
          />
        } />
        <Route path="/insights" element={
          <IndustryInsights 
            user={user}
            onLogout={handleLogout}
          />
        } />
        <Route path="/resume" element={
          <ResumeBuilder 
            user={user}
            onLogout={handleLogout}
          />
        } />
        <Route path="/interview" element={
          <InterviewPrep 
            user={user}
            onLogout={handleLogout}
          />
        } />
      </Routes>
      
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleProfileSave}
        user={user}
      />
    </div>
  )
}

export default App