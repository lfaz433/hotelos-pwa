import { Link, useLocation } from 'react-router-dom'
import './HKBottomNav.css'

const NAV_ITEMS = [
  {
    key: 'rooms',
    label: 'Rooms',
    to: '/housekeeping',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'checklist',
    label: 'Checklist',
    to: '/housekeeping/checklist',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    key: 'issues',
    label: 'Issues',
    to: '/housekeeping/issues',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/housekeeping/profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function HKBottomNav() {
  const location = useLocation()

  return (
    <nav className="hk-bottom-nav safe-bottom" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.to || 
          (item.to !== '/housekeeping' && location.pathname.startsWith(item.to))
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`hk-nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.key}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="hk-nav-icon">{item.icon}</span>
            <span className="hk-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
