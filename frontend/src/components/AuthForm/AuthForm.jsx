import { useState } from 'react'
import './AuthForm.css'

const AuthForm = ({ isLogin, onSubmit, onToggle, onBack, message, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit(formData)
    setIsLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">

          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Join RexAI'}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to continue your AI journey'
              : 'Create your account and unlock AI-powered career guidance'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                className="auth-input"
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="auth-input"
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="auth-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className={`auth-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>



        <div className="auth-footer">
          <p className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="switch-btn" onClick={onToggle}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
        </div>

        {message && (
          <div className={`message-container ${message.includes('error') || message.includes('Error') ? 'error' :
            message.includes('Processing') || message.includes('wait') ? 'processing' : 'success'
            }`}>

            <p className="message-text">{message}</p>
          </div>
        )}


      </div>
    </div>
  )
}

export default AuthForm