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

        {/* Primary CTA */}
        <Link to="/booking" className="landing__btn-primary" id="btn-open-booking">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Book a Room
        </Link>

        {/* Card grid — role-based portals */}
        <div className="landing__section-label">Staff Portals</div>
        <div className="landing__cards">

          {/* Staff Login — single entry point for all staff */}
          <Link to="/login" className="landing__card landing__card--primary" id="btn-staff-login">
            <div className="landing__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Staff Login</h2>
              <p>Manager, Receptionist, Housekeeping & Maintenance access</p>
              <div className="landing__card-meta">
                <span className="badge">All Roles</span>
                <span className="badge">Secure</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          {/* Housekeeping */}
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

          {/* Guest Portal */}
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
