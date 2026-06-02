import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import './LoginPortal.css'

export default function LoginPortal() {
  const { login } = useHotel()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false)
      
      const lowerUser = username.toLowerCase()
      
      // We mock the staff selection. We can pass a mock staff object.
      // If it's housekeeper, we route to housekeeping.
      let mockStaff = { id: 1, name: 'Maria G.', role: 'housekeeper' }
      let targetRoute = '/housekeeping'
      
      if (lowerUser === 'admin' || lowerUser === 'manager') {
        mockStaff = { id: 2, name: 'James K.', role: 'manager' }
        targetRoute = '/dashboard'
      } else if (lowerUser === 'reception') {
        mockStaff = { id: 3, name: 'Sarah L.', role: 'reception' }
        targetRoute = '/reception'
      } else if (lowerUser === 'supervisor') {
        mockStaff = { id: 4, name: 'Ana P.', role: 'supervisor' }
        targetRoute = '/supervisor'
      } else if (lowerUser === 'inventory') {
        mockStaff = { id: 5, name: 'David M.', role: 'inventory' }
        targetRoute = '/inventory'
      }

      login(mockStaff)
      navigate(targetRoute, { replace: true })
      
    }, 1200)
  }

  return (
    <div className="login-wrapper">
      <div className="login-split">
        <div className="login-image-side">
          <div className="login-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span>HotelOS</span>
          </div>
          <div className="login-image-overlay">
            <h1>Elevate your hospitality.</h1>
            <p>Seamless management, unforgettable guest experiences.</p>
          </div>
        </div>
        
        <div className="login-form-side">
          <div className="login-form-container animate-fade-in-up">
            <div className="login-form-header">
              <h2>Staff Portal</h2>
              <p>Sign in to access your dashboard.</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              {error && <div className="login-error">{error}</div>}
              
              <div className="login-input-group">
                <label>Username or Staff ID</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="e.g. manager or housekeeper"
                  autoFocus
                />
              </div>
              
              <div className="login-input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit" 
                className={`login-submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? <span className="login-spinner" /> : 'Sign In'}
              </button>
            </form>
            
            <div className="login-form-footer">
              <p>Tip: Type <strong>manager</strong>, <strong>reception</strong>, <strong>supervisor</strong>, <strong>inventory</strong>, or <strong>housekeeper</strong> to test different roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
