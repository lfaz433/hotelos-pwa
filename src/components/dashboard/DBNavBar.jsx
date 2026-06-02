import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext'
import './DBNavBar.css'

const TABS = [
  { key: 'overview',      label: 'Overview' },
  { key: 'reservations',  label: 'Reservations' },
  { key: 'housekeeping',  label: 'Housekeeping' },
  { key: 'inventory',     label: 'Inventory & Audit' },
  { key: 'analytics',     label: 'Analytics' },
  { key: 'templates',     label: 'Template Manager' },
  { key: 'room_types',    label: 'Room Types' },
  { key: 'settings',      label: 'Settings' },
]

export default function DBNavBar({ activeTab, onTabChange }) {
  const { notifications, markNotificationsRead, activeStaff, logout } = useHotel()
  const unread = notifications.filter(n => !n.read).length
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="db-navbar">
      <div className="db-navbar__inner">
        <div className="db-navbar__brand">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.15)"/>
            <path d="M8 30V14a2 2 0 012-2h6v-2a2 2 0 012-2h4a2 2 0 012 2v2h6a2 2 0 012 2v16H8z" fill="white"/>
            <rect x="16" y="22" width="8" height="8" rx="1" fill="rgba(0,53,128,0.6)"/>
          </svg>
          <span className="db-navbar__logo">HotelOS</span>
          <span className="db-navbar__property">Grand Palace Hotel</span>
        </div>

        <nav className="db-navbar__tabs" role="navigation" aria-label="Dashboard navigation">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`db-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
              id={`db-tab-${tab.key}`}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
              {tab.key === 'housekeeping' && unread > 0 && (
                <span className="db-tab-badge" onClick={markNotificationsRead}>{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="db-navbar__actions">
          <div className="db-date-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>

          <Link to="/housekeeping" className="db-hk-link" id="db-link-housekeeping" title="Open Housekeeping App">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 18.5l-7-7 7-7"/><path d="M19 11.5H5"/>
            </svg>
            Housekeeping
          </Link>

          <div className="db-user-dropdown-container" ref={dropdownRef}>
            <div 
              className="db-user-avatar" 
              onClick={() => setShowDropdown(!showDropdown)}
              title="Profile & Settings"
            >
              {activeStaff?.avatar || 'AM'}
            </div>
            {showDropdown && (
              <div className="db-user-dropdown animate-in">
                <div className="db-dropdown-header">
                  <strong>{activeStaff?.name || 'Alice M.'}</strong>
                  <span>{activeStaff?.role || 'General Manager'}</span>
                </div>
                <hr className="db-dropdown-divider" />
                <button className="db-dropdown-item logout" onClick={logout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
