import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing__bg" />
      <div className="landing__content">

        {/* Logo */}
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
          A unified platform for all hotel staff.
          Real-time room status. Zero friction.
        </p>

        {/* Guest primary CTA */}
        <Link to="/booking" className="landing__btn-primary" id="btn-open-booking">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Book a Room
        </Link>

        {/* Staff role portals */}
        <div className="landing__section-label">Staff Portals</div>
        <div className="landing__cards">

          {/* Manager */}
          <Link to="/login?role=manager" className="landing__card landing__card--primary" id="btn-manager">
            <div className="landing__card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Manager</h2>
              <p>Full dashboard — analytics, reservations, staff & settings</p>
              <div className="landing__card-meta">
                <span className="badge">Manager Only</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          {/* Front Desk */}
          <Link to="/login?role=reception" className="landing__card landing__card--reception" id="btn-reception">
            <div className="landing__card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.14 1.2 2 2 0 012.12 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Front Desk</h2>
              <p>Check-in, check-out, arrivals & departures management</p>
              <div className="landing__card-meta">
                <span className="badge">Reception</span>
                <span className="badge">Real-time</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          {/* Housekeeping */}
          <Link to="/login?role=housekeeper" className="landing__card landing__card--hk" id="btn-housekeeping">
            <div className="landing__card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Maintenance */}
          <Link to="/login?role=maintenance" className="landing__card landing__card--maintenance" id="btn-maintenance">
            <div className="landing__card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="landing__card-body">
              <h2>Maintenance</h2>
              <p>Engineering & repair ticket management system</p>
              <div className="landing__card-meta">
                <span className="badge">Staff</span>
                <span className="badge">Kanban</span>
              </div>
            </div>
            <div className="landing__card-arrow">→</div>
          </Link>

          {/* Guest Portal */}
          <Link to="/guest" className="landing__card landing__card--guest" id="btn-guest">
            <div className="landing__card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
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

        {/* Stats bar */}
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
