import React from 'react'
import { useHotel } from '../../context/HotelContext'
import './GlobalToast.css'

export default function GlobalToast() {
  const { toasts, removeToast } = useHotel()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="gt-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`gt-toast gt-${toast.type} animate-fade-in-up`}>
          <div className="gt-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'i'}
          </div>
          <div className="gt-message">{toast.message}</div>
          <button className="gt-close" onClick={() => removeToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
