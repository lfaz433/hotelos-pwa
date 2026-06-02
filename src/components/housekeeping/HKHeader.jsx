import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext'
import './HKHeader.css'

export default function HKHeader({ searchQuery, onSearchChange }) {
  const { activeStaff, staff, setActiveStaff, notifications } = useHotel()
  const [showStaffPicker, setShowStaffPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const unread = notifications.filter(n => !n.read).length

  return (
    <>
      <header className="hk-header">
        <div className="hk-header__left">
          <div
            className="hk-avatar"
            onClick={() => setShowStaffPicker(true)}
            id="btn-staff-picker"
            role="button"
            tabIndex={0}
            aria-label="Switch staff member"
          >
            <span>{activeStaff?.avatar}</span>
          </div>
          <div className="hk-header__info">
            <span className="hk-header__greeting">Good morning,</span>
            <span className="hk-header__name">{activeStaff?.name?.split(' ')[0]}</span>
          </div>
        </div>

        <div className="hk-header__actions">
          <button
            className="hk-icon-btn"
            onClick={() => setShowSearch(s => !s)}
            id="btn-search-toggle"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <Link to="/dashboard" className="hk-icon-btn" id="btn-go-dashboard" aria-label="Open dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {unread > 0 && <span className="hk-badge">{unread}</span>}
          </Link>
        </div>
      </header>

      {showSearch && (
        <div className="hk-search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Search room number or type…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            autoFocus
            id="input-room-search"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="hk-search-clear">✕</button>
          )}
        </div>
      )}

      {showStaffPicker && (
        <div className="hk-modal-overlay" onClick={() => setShowStaffPicker(false)}>
          <div className="hk-staff-picker" onClick={e => e.stopPropagation()}>
            <h3>Switch Staff Member</h3>
            <p>Select your profile to track your activity</p>
            <div className="hk-staff-list">
              {staff.map(s => (
                <button
                  key={s.id}
                  className={`hk-staff-item ${activeStaff?.id === s.id ? 'active' : ''}`}
                  onClick={() => { setActiveStaff(s); setShowStaffPicker(false) }}
                  id={`staff-${s.id}`}
                >
                  <div className="hk-staff-avatar">{s.avatar}</div>
                  <div className="hk-staff-info">
                    <span className="hk-staff-name">{s.name}</span>
                    <span className="hk-staff-role">{s.role}{s.floor ? ` · Floor ${s.floor}` : ''}</span>
                  </div>
                  {activeStaff?.id === s.id && <span className="hk-staff-check">✓</span>}
                </button>
              ))}
            </div>
            <button className="hk-modal-close" onClick={() => setShowStaffPicker(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
