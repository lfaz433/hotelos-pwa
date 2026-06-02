import { useState, useEffect, useRef } from 'react'
import { useHotel, timeAgo, formatTime } from '../../context/HotelContext'
import StatusBadge from '../shared/StatusBadge'
import './DBActivityFeed.css'

export default function DBActivityFeed() {
  const { activityFeed, notifications, markNotificationsRead, subscribeToUpdates } = useHotel()
  const [pulse, setPulse] = useState(false)
  const [latestUpdate, setLatestUpdate] = useState(null)
  const feedRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeToUpdates((update) => {
      setPulse(true)
      setLatestUpdate(update)
      setTimeout(() => setPulse(false), 1500)
    })
    return unsub
  }, [subscribeToUpdates])

  // Scroll to top on new activity
  useEffect(() => {
    if (feedRef.current && activityFeed.length > 0) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activityFeed.length])

  const unread = notifications.filter(n => !n.read).length

  const STATUS_ICONS = {
    available: '✓',
    dirty:     '⚠',
    cleaning:  '⟳',
    ready:     '★',
    occupied:  '⌂',
  }

  return (
    <div className="db-activity-feed">
      {/* Live indicator header */}
      <div className={`db-feed-header ${pulse ? 'pulsing' : ''}`}>
        <div className="db-feed-title">
          <div className={`db-live-indicator ${pulse ? 'active' : ''}`}>
            <span className="db-live-ring" />
            <span className="db-live-core" />
          </div>
          <span>Live Activity</span>
        </div>
        {unread > 0 && (
          <button
            className="db-clear-btn"
            onClick={markNotificationsRead}
            id="btn-clear-notifications"
          >
            Clear {unread}
          </button>
        )}
      </div>

      {/* Latest update banner */}
      {latestUpdate && (
        <div className={`db-latest-banner ${pulse ? 'visible' : ''}`}>
          <span>Room {latestUpdate.roomNumber} → </span>
          <StatusBadge status={latestUpdate.status} />
        </div>
      )}

      {/* Feed list */}
      <div className="db-feed-list" ref={feedRef}>
        {activityFeed.length === 0 ? (
          <div className="db-feed-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>No activity yet</p>
            <span>Updates will appear here as your housekeeping team works</span>
          </div>
        ) : (
          activityFeed.map((entry, i) => (
            <div
              key={entry.id}
              className={`db-feed-item ${i === 0 ? 'latest' : ''}`}
              id={`feed-item-${entry.id}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`db-feed-icon status-icon-${entry.status}`}>
                {STATUS_ICONS[entry.status] || '•'}
              </div>
              <div className="db-feed-body">
                <div className="db-feed-main">
                  <span className="db-feed-room">Room {entry.roomNumber}</span>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="db-feed-meta">
                  <span>{entry.staff}</span>
                  <span>·</span>
                  <span>{formatTime(entry.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick summary */}
      <div className="db-feed-footer">
        <div className="db-feed-footer-title">Today's Progress</div>
        <div className="db-feed-stats">
          <div className="db-feed-stat">
            <span className="db-feed-stat-num">{activityFeed.filter(e => e.status === 'ready').length}</span>
            <span className="db-feed-stat-label">Ready</span>
          </div>
          <div className="db-feed-stat">
            <span className="db-feed-stat-num">{activityFeed.filter(e => e.status === 'cleaning').length}</span>
            <span className="db-feed-stat-label">Started</span>
          </div>
          <div className="db-feed-stat">
            <span className="db-feed-stat-num">{activityFeed.length}</span>
            <span className="db-feed-stat-label">Total</span>
          </div>
        </div>
      </div>
    </div>
  )
}
