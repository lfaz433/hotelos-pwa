import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext'
import './DBNavBar.css'

const ALL_TABS = [
  { key: 'overview',     label: 'Overview',         showFor: ['manager'] },
  { key: 'frontdesk',    label: 'Front Desk',        showFor: ['manager', 'reception'] },
  { key: 'reservations', label: 'Reservations',      showFor: ['manager', 'reception'] },
  { key: 'inventory',    label: 'Inventory',         showFor: ['manager'] },
  { key: 'analytics',    label: 'Analytics',         showFor: ['manager'] },
  { key: 'templates',    label: 'Templates',         showFor: ['manager'] },
  { key: 'room_types',   label: 'Room Types',        showFor: ['manager'] },
  { key: 'settings',     label: 'Settings',          showFor: ['manager'] },
]

const ROLE_LABELS = {
  manager:   'General Manager',
  reception: 'Front Desk Agent',
}

export default function DBNavBar({ activeTab, onTabChange }) {
  const { notifications, markNotificationsRead, activeStaff, logout } = useHotel()
  const unread = notifications.filter(n => !n.read).length
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const role       = activeStaff?.role || 'manager'
  const name       = activeStaff?.name || 'Manager'
  const initials   = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel  = ROLE_LABELS[role] || role
  const visibleTabs = ALL_TABS.filter(t => t.showFor.includes(role))

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="db-navbar">
      <div className="db-navbar__inner">

        {/* Brand */}
        <div className="db-navbar__brand">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.15)"/>
            <path d="M8 30V14a2 2 0 012-2h6v-2a2 2 0 012-2h4a2 2 0 012 2v2h6a2 2 0 012 2v16H8z" fill="white"/>
            <rect x="16" y="22" width="8" height="8" rx="1" fill="rgba(0,53,128,0.6)"/>
          </svg>
          <div className="db-navbar__brand-text">
            <span className="db-navbar__logo">HotelOS</span>
            <span className="db-navbar__property">Grand Palace Hotel</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="db-navbar__tabs" role="navigation" aria-label="Dashboard navigation">
          {visibleTabs.map(tab => (
            <button
              key={tab.key}
              className={`db-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
              id={`db-tab-${tab.key}`}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="db-navbar__actions">
          {/* Date */}
          <div className="db-date-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>

          {/* Avatar + dropdown */}
          <div className="db-user-area" ref={dropdownRef}>
            <button
              className={`db-user-btn ${showDropdown ? 'open' : ''}`}
              onClick={() => setShowDropdown(v => !v)}
              aria-label="User menu"
              aria-expanded={showDropdown}
            >
              <div className="db-user-avatar">{initials}</div>
              <div className="db-user-info">
                <span className="db-user-name">{name}</span>
                <span className="db-user-role">{roleLabel}</span>
              </div>
              <svg className="db-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showDropdown && (
              <div className="db-dropdown" role="menu">
                <div className="db-dropdown__user">
                  <div className="db-dropdown__avatar">{initials}</div>
                  <div>
                    <div className="db-dropdown__name">{name}</div>
                    <div className="db-dropdown__role">{roleLabel}</div>
                  </div>
                </div>

                <div className="db-dropdown__divider" />

                <button
                  className="db-dropdown__item db-dropdown__item--logout"
                  role="menuitem"
                  onClick={() => { setShowDropdown(false); logout() }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
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
