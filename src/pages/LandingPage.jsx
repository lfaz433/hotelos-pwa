import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing__bg" />
      <div className="landing__content">
        <div className="landing__logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0071c2"/>
            <path d="M8 30V14a2 2 0 012-2h6v-2a2 2 0 012-2h4a2 2 0 012 2v2h6a2 2 0 012 2v16H8z" fill="white" opacity="0.9"/>
            <rect x="16" y="22" width="8" height="8" rx="1" fill="#003580"/>
            <rect x="11" y="18" width="4" height="4" rx="0.5" fill="#003580" opacity="0.7"/>
            <rect x="25" y="18" width="4" height="4" rx="0.5" fill="#003580" opacity="0.7"/>
          </svg>
          <span>HotelOS</span>
        </div>

        <h1 className="landing__headline">Hotel Management,<br />Reimagined.</h1>
        <p className="landing__subtitle">
          A unified platform for housekeeping, reception, and management teams.
          Real-time room status. Zero friction.
        </p>

        <div className="landing__cards">
          <Link to="/housekeeping" className="landing__card landing__card--hk" id="btn-housekeeping">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Housekeeping</h2>
              <p>Mobile-first room management for cleaning staff</p>
              <div className="landing__card-meta">
                <span className="badge">PWA</span>
                <span className="badge">Mobile First</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          <Link to="/dashboard" className="landing__card landing__card--db" id="btn-dashboard">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Reception Dashboard</h2>
              <p>Full-featured management console for front desk & managers</p>
              <div className="landing__card-meta">
                <span className="badge">Desktop</span>
                <span className="badge">Real-time</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          <Link to="/guest" className="landing__card landing__card--guest" id="btn-guest">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Guest Portal</h2>
              <p>In-stay requests, billing & room service</p>
              <div className="landing__card-meta">
                <span className="badge">Guest</span>
                <span className="badge">Mobile</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          <Link to="/maintenance" className="landing__card landing__card--hk" id="btn-maintenance">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Maintenance</h2>
              <p>Engineering & Repair Ticket System</p>
              <div className="landing__card-meta">
                <span className="badge">Staff</span>
                <span className="badge">Kanban</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          <Link to="/analytics" className="landing__card landing__card--db" id="btn-analytics">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Analytics</h2>
              <p>Revenue & Occupancy Metrics</p>
              <div className="landing__card-meta">
                <span className="badge">Manager</span>
                <span className="badge">Live</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          <Link to="/admin" className="landing__card landing__card--db" id="btn-admin">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Admin Settings</h2>
              <p>Staff & Pricing Configuration</p>
              <div className="landing__card-meta">
                <span className="badge">Manager</span>
                <span className="badge">Global</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>
        </div>

        <div className="landing__stats">
          <div className="landing__stat">
            <span className="landing__stat-num">40</span>
            <span className="landing__stat-label">Rooms</span>
          </div>
          <div className="landing__stat-divider" />
          <div className="landing__stat">
            <span className="landing__stat-num">4</span>
            <span className="landing__stat-label">Staff</span>
          </div>
          <div className="landing__stat-divider" />
          <div className="landing__stat">
            <span className="landing__stat-num">Live</span>
            <span className="landing__stat-label">Status Sync</span>
          </div>
        </div>
      </div>
    </div>
  )
}
