import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useHotel, STATUS_LABELS } from '../context/HotelContext'
import './SupervisorDashboard.css'

export default function SupervisorDashboard() {
  const { rooms, staff, updateRoomStatus } = useHotel()
  const [filter, setFilter] = useState('all') // 'all', 'cleaning', 'dirty'

  // Only show rooms that need attention from Housekeeping
  const activeRooms = rooms.filter(r => r.status === 'dirty' || r.status === 'cleaning')

  const stats = useMemo(() => {
    return {
      total: activeRooms.length,
      dirty: activeRooms.filter(r => r.status === 'dirty').length,
      cleaning: activeRooms.filter(r => r.status === 'cleaning').length,
    }
  }, [activeRooms])

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return activeRooms
    return activeRooms.filter(r => r.status === filter)
  }, [activeRooms, filter])

  const handleApprove = (roomId) => {
    if (window.confirm('Approve this suite? It will be marked as READY for the Receptionist.')) {
      updateRoomStatus(roomId, 'ready')
    }
  }

  const handleReject = (roomId) => {
    if (window.confirm('Reject this cleaning? It will be marked as DIRTY and sent back to the housekeeper.')) {
      updateRoomStatus(roomId, 'dirty')
    }
  }

  return (
    <div className="rdash-luxury-layout">
      {/* Top Navbar */}
      <header className="rdash-lux-header">
        <div className="rdash-lux-logo">
          <div className="lux-logo-icon">H</div>
          <div className="lux-logo-text">
            <h1>HOTEL OS</h1>
            <span>SUPERVISOR</span>
          </div>
        </div>

        <div className="rdash-lux-user">
          <div className="lux-user-info">
            <span className="lux-name">Chef of Group</span>
            <span className="lux-role">Quality Control</span>
          </div>
          <div className="lux-avatar">S</div>
          <Link to="/" className="lux-logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </Link>
        </div>
      </header>

      <div className="rdash-lux-body">
        {/* Main Content */}
        <main className="rdash-lux-main">
          <div className="rdash-lux-header-text">
            <h2>Inspection Board</h2>
            <p>Review suites cleaned by housekeepers before they return to inventory.</p>
          </div>

          <div className="rdash-lux-stats">
            <div className={`lux-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <div className="lux-stat-value">{stats.total}</div>
              <div className="lux-stat-label">Total Active Tasks</div>
            </div>
            <div className={`lux-stat-card type-dirty ${filter === 'dirty' ? 'active' : ''}`} onClick={() => setFilter('dirty')}>
              <div className="lux-stat-value">{stats.dirty}</div>
              <div className="lux-stat-label">Awaiting Cleaning</div>
            </div>
            <div className={`lux-stat-card type-cleaning ${filter === 'cleaning' ? 'active' : ''}`} onClick={() => setFilter('cleaning')}>
              <div className="lux-stat-value">{stats.cleaning}</div>
              <div className="lux-stat-label">Pending Inspection</div>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="sup-empty-state">
              <div className="sup-empty-icon">✨</div>
              <h3>All caught up!</h3>
              <p>There are no suites requiring inspection at the moment.</p>
            </div>
          ) : (
            <div className="rdash-lux-grid animate-fade-in">
              {filteredRooms.map(room => (
                <div key={room.id} className={`lux-room-card status-${room.status} sup-card`}>
                  <div className="lux-room-top">
                    <div className="lux-room-number">{room.number}</div>
                    <div className={`lux-room-icon icon-${room.status}`}>
                      {room.status === 'dirty' ? '🧹' : '⏳'}
                    </div>
                  </div>
                  
                  <div className="lux-room-type">{room.type}</div>
                  
                  <div className="lux-room-bottom">
                    <div className={`lux-status-pill pill-${room.status}`}>
                      {STATUS_LABELS[room.status] || room.status}
                    </div>
                  </div>

                  {/* Supervisor Actions */}
                  {room.status === 'cleaning' && (
                    <div className="sup-action-bar">
                      <button className="sup-btn sup-reject" onClick={() => handleReject(room.id)}>✕ Reject</button>
                      <button className="sup-btn sup-approve" onClick={() => handleApprove(room.id)}>✓ Approve</button>
                    </div>
                  )}
                  {room.status === 'dirty' && (
                    <div className="sup-info-bar">
                      <span>Assigned: <strong>{room.assignedTo || 'Unassigned'}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="rdash-lux-sidebar">
          <div className="lux-panel-header">
            <h3>Staff Deployment</h3>
          </div>
          
          <div className="lux-panel-list">
            {staff.filter(s => s.role.toLowerCase() === 'housekeeper').map(s => {
              const assigned = rooms.filter(r => r.assignedTo?.includes(s.name.split(' ')[0]))
              const completed = assigned.filter(r => r.status === 'ready' || r.status === 'available')
              const pct = assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0

              return (
                <div key={s.id} className="lux-list-item sup-staff-item">
                  <div className="lux-item-icon sup-staff-icon">{s.avatar}</div>
                  <div className="lux-item-details" style={{ flex: 1 }}>
                    <strong>{s.name}</strong>
                    <span>Floor {s.floor || 'Float'}</span>
                    
                    <div className="sup-progress-wrapper">
                      <div className="sup-progress-bar">
                        <div className="sup-progress-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="sup-progress-text">{completed.length}/{assigned.length} Done</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
