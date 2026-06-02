import { useState, useEffect } from 'react'
import { useHotel } from '../../context/HotelContext'
import './LockScreen.css'

export default function LockScreen() {
  const { isLocked, unlockSystem, activeStaff } = useHotel()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  // Block scrolling when locked
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isLocked])

  if (!isLocked) return null

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError(false)
      
      if (newPin.length === 4) {
        // Validate PIN (mock validation: accept any PIN except 0000)
        setTimeout(() => {
          if (newPin === '0000') {
            setError(true)
            setPin('')
          } else {
            unlockSystem()
            setPin('')
          }
        }, 300)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError(false)
  }

  return (
    <div className="lock-screen-overlay">
      <div className="lock-screen-content animate-scale-in">
        <div className="lock-avatar">
          {activeStaff?.name?.charAt(0) || 'S'}
        </div>
        <h2>{activeStaff?.name || 'Staff'}</h2>
        <p>System locked. Enter PIN to continue.</p>

        <div className={`lock-pin-display ${error ? 'error' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="lock-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handleKeyPress(num)} className="keypad-btn">
              {num}
            </button>
          ))}
          <button className="keypad-btn empty" disabled></button>
          <button onClick={() => handleKeyPress(0)} className="keypad-btn">0</button>
          <button onClick={handleDelete} className="keypad-btn action">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
              <line x1="18" y1="9" x2="12" y2="15"/>
              <line x1="12" y1="9" x2="18" y2="15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
