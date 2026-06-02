import { useState } from 'react'
import { useHotel, timeAgo } from '../../context/HotelContext'
import StatusBadge from '../shared/StatusBadge'
import AuditChecklistModal from './AuditChecklistModal'
import './HKRoomCard.css'

const TRANSITIONS = {
  dirty:     { next: 'cleaning',  btnLabel: 'Start Cleaning', btnClass: 'btn-start' },
  cleaning:  { next: 'ready',     btnLabel: 'Finish & Audit', btnClass: 'btn-finish' },
  ready:     { next: 'available', btnLabel: 'Mark Available', btnClass: 'btn-available' },
  available: { next: null,        btnLabel: null, btnClass: '' },
  occupied:  { next: null,        btnLabel: null, btnClass: '' },
}

export default function HKRoomCard({ room, onStatusUpdate }) {
  const { updateRoomStatus } = useHotel()
  const [celebrating, setCelebrating] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAudit, setShowAudit] = useState(false)

  const transition = TRANSITIONS[room.status] || {}

  /* Ripple helper */
  function addRipple(e) {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'btn-ripple'
    ripple.style.left = `${e.clientX - rect.left}px`
    ripple.style.top  = `${e.clientY - rect.top}px`
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  const handleAction = async (e) => {
    if (!transition.next || loading) return
    addRipple(e)

    // "Finish & Audit" → open audit checklist modal instead of directly transitioning
    if (room.status === 'cleaning') {
      setShowAudit(true)
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 300))

    updateRoomStatus(room.id, transition.next)

    if (transition.next === 'cleaning') {
      onStatusUpdate?.(`Cleaning started in Room ${room.number}`, 'info')
    } else {
      onStatusUpdate?.(`Room ${room.number} is now ${transition.next}`, 'info')
    }

    setLoading(false)
  }

  /* Called when audit is submitted successfully */
  const handleAuditComplete = () => {
    setShowAudit(false)
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 2800)
    onStatusUpdate?.(`✓ Room ${room.number} audit submitted — marked Ready!`, 'success')
  }

  return (
    <>
      <div
        className={`hk-room-card status-${room.status} ${celebrating ? 'celebrating' : ''} ${expanded ? 'expanded' : ''}`}
        id={`room-card-${room.id}`}
      >
        {celebrating && (
          <div className="hk-celebrate">
            <div className="hk-celebrate__icon">✓</div>
            <span>Audit Passed!</span>
          </div>
        )}

        <div
          className="hk-room-card__main"
          onClick={() => setExpanded(e => !e)}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-label={`Room ${room.number}`}
        >
          <div className="hk-room-card__left">
            <div className="hk-room-number">
              {room.number}
              {room.priority === 'high' && <span className="hk-priority" title="High Priority">!</span>}
            </div>
            <div className="hk-room-type">{room.type}</div>
          </div>

          <div className="hk-room-card__center">
            <StatusBadge status={room.status} />
            {room.lastUpdated && (
              <span className="hk-room-updated">{timeAgo(room.lastUpdated)}</span>
            )}
          </div>

          <div className="hk-room-card__right">
            {transition.btnLabel && (
              <button
                className={`hk-action-btn ${transition.btnClass} ${loading ? 'loading' : ''}`}
                onClick={e => { e.stopPropagation(); handleAction(e) }}
                disabled={loading}
                id={`btn-room-${room.id}-action`}
                aria-label={`${transition.btnLabel} room ${room.number}`}
              >
                {loading ? (
                  <span className="hk-spinner" />
                ) : room.status === 'cleaning' ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11l3 3L22 4"/>
                    </svg>
                    Audit
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Start
                  </>
                )}
              </button>
            )}
            {(room.status === 'available' || room.status === 'occupied') && (
              <div className={`hk-status-icon ${room.status}`}>
                {room.status === 'available' ? '✓' : '⌂'}
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="hk-room-card__details animate-in">
            <div className="hk-detail-row">
              <span className="hk-detail-label">Floor</span>
              <span className="hk-detail-value">{room.floor}</span>
            </div>
            <div className="hk-detail-row">
              <span className="hk-detail-label">Room Type</span>
              <span className="hk-detail-value">{room.type}</span>
            </div>
            {room.assignedTo && (
              <div className="hk-detail-row">
                <span className="hk-detail-label">Assigned to</span>
                <span className="hk-detail-value">{room.assignedTo}</span>
              </div>
            )}
            <div className="hk-notes-section">
              <label className="hk-detail-label">Notes</label>
              <div className="hk-notes-chip">{room.notes || 'No notes'}</div>
            </div>

            {transition.btnLabel && (
              <button
                className={`hk-action-btn-lg ${transition.btnClass}`}
                onClick={handleAction}
                disabled={loading}
                id={`btn-room-${room.id}-action-expanded`}
              >
                {loading ? 'Updating…' : transition.btnLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Audit Modal — rendered outside card for correct stacking */}
      {showAudit && (
        <AuditChecklistModal
          room={room}
          onClose={() => setShowAudit(false)}
          onComplete={handleAuditComplete}
        />
      )}
    </>
  )
}
