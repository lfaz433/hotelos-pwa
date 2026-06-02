import { useState, useEffect } from 'react'
import { useHotel } from '../../context/HotelContext'
import StatusBadge from '../shared/StatusBadge'
import './DBHousekeepingTab.css'

const STATUS_OPTIONS = ['all', 'available', 'dirty', 'cleaning', 'ready', 'occupied']

export default function DBHousekeepingTab() {
  const { rooms, updateRoomStatus, staff } = useHotel()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFloor, setFilterFloor] = useState('all')
  const [flashRooms, setFlashRooms] = useState({})

  // Flash effect when a room is updated
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashRooms(prev => {
        const now = Date.now()
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(k => {
          if (now - next[k] > 2000) { delete next[k]; changed = true }
        })
        return changed ? next : prev
      })
    }, 500)
    return () => clearInterval(timer)
  }, [])

  const floors = [...new Set(rooms.map(r => r.floor))].sort()

  const filteredRooms = rooms.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchFloor = filterFloor === 'all' || r.floor === parseInt(filterFloor)
    return matchStatus && matchFloor
  })

  const handleStatusChange = (roomId, newStatus) => {
    updateRoomStatus(roomId, newStatus)
    setFlashRooms(prev => ({ ...prev, [roomId]: Date.now() }))
  }

  return (
    <div className="db-hk-tab">
      {/* Filters */}
      <div className="db-hk-filters db-card">
        <div className="db-card-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <div className="db-filter-row">
            <div className="db-filter-group">
              <label className="db-filter-label">Status</label>
              <div className="db-filter-chips">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`db-filter-chip ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                    id={`db-filter-status-${s}`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="db-filter-group">
              <label className="db-filter-label">Floor</label>
              <select
                value={filterFloor}
                onChange={e => setFilterFloor(e.target.value)}
                className="db-select"
                id="db-filter-floor"
              >
                <option value="all">All Floors</option>
                {floors.map(f => (
                  <option key={f} value={f}>Floor {f}</option>
                ))}
              </select>
            </div>
            <div className="db-filter-results">
              <span>{filteredRooms.length} rooms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid Table */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Housekeeping Status Board</span>
          <span className="db-live-badge">
            <span className="db-live-dot" />
            Live
          </span>
        </div>
        <div className="db-hk-table-wrap">
          <table className="db-hk-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => (
                <tr
                  key={room.id}
                  id={`hk-row-${room.id}`}
                  className={`hk-table-row status-${room.status} ${flashRooms[room.id] ? 'flash' : ''}`}
                >
                  <td className="db-tbl-room-num">{room.number}</td>
                  <td>{room.floor}</td>
                  <td>{room.type}</td>
                  <td>
                    <StatusBadge status={room.status} />
                  </td>
                  <td>
                    {room.assignedTo ? (
                      <span className="db-assigned">{room.assignedTo}</span>
                    ) : (
                      <button className="db-assign-btn" id={`btn-assign-${room.id}`}>+ Assign</button>
                    )}
                  </td>
                  <td>
                    {room.priority === 'high' && (
                      <span className="db-priority-badge">High</span>
                    )}
                  </td>
                  <td>
                    <div className="db-hk-actions">
                      <select
                        className="db-status-select"
                        value={room.status}
                        onChange={e => handleStatusChange(room.id, e.target.value)}
                        id={`db-status-${room.id}`}
                      >
                        {['available','dirty','cleaning','ready','occupied'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Summary */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Staff Assignment Overview</span>
        </div>
        <div className="db-staff-grid">
          {staff.map(s => {
            const assigned = rooms.filter(r => r.assignedTo?.includes(s.name.split(' ')[0]))
            const completed = assigned.filter(r => r.status === 'ready' || r.status === 'available')
            const pct = assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0

            return (
              <div key={s.id} className="db-staff-card" id={`staff-card-${s.id}`}>
                <div className="db-staff-avatar-lg" style={{ background: `hsl(${s.id * 60}, 60%, 35%)` }}>
                  {s.avatar}
                </div>
                <div className="db-staff-details">
                  <span className="db-staff-nm">{s.name}</span>
                  <span className="db-staff-rl">{s.role}{s.floor ? ` · Floor ${s.floor}` : ''}</span>
                  <div className="db-staff-progress">
                    <div className="db-progress-bar">
                      <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="db-progress-label">{completed.length}/{assigned.length} done</span>
                  </div>
                </div>
                <div className={`db-staff-status-dot ${assigned.length > 0 ? 'active' : ''}`} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
