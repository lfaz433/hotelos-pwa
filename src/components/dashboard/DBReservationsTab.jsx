import { useState, useMemo } from 'react'
import { useHotel } from '../../context/HotelContext'
import StatusBadge from '../shared/StatusBadge'
import NewReservationModal from './NewReservationModal'
import './DBReservationsTab.css'

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDay(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

const BOOKING_COLORS = {
  active:   { bg: '#0071c2', text: '#fff' },
  arriving: { bg: '#f57c00', text: '#fff' },
  upcoming: { bg: '#7b1fa2', text: '#fff' },
  pending:  { bg: '#e0e0e0', text: '#333' },
}

export default function DBReservationsTab() {
  const { rooms, bookings, deleteBooking, approveBooking, rejectBooking } = useHotel()
  const [showModal, setShowModal] = useState(false)
  const [editBooking, setEditBooking] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchGuest, setSearchGuest] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const DAYS = Array.from({ length: 9 }, (_, i) => addDays(today, i - 1))
  const COL_WIDTH = 100

  const bookingsByRoom = useMemo(() => {
    const map = {}
    bookings.forEach(b => {
      if (!map[b.roomId]) map[b.roomId] = []
      map[b.roomId].push(b)
    })
    return map
  }, [bookings])

  const floorGroups = useMemo(() => {
    const groups = {}
    rooms.forEach(r => {
      if (!groups[r.floor]) groups[r.floor] = []
      groups[r.floor].push(r)
    })
    return groups
  }, [rooms])

  const getBookingSpan = (booking) => {
    const ci = new Date(booking.checkIn); ci.setHours(0,0,0,0)
    const co = new Date(booking.checkOut); co.setHours(0,0,0,0)
    const firstDay = DAYS[0]
    const lastDay = DAYS[DAYS.length - 1]
    if (co <= firstDay || ci > lastDay) return null
    const startOffset = Math.max(0, Math.round((ci - firstDay) / 86400000))
    const endOffset = Math.min(DAYS.length, Math.round((co - firstDay) / 86400000))
    return { startOffset, width: endOffset - startOffset }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const guest = b.guest?.toLowerCase() || ''
      const conf = b.confirmationNo?.toLowerCase() || ''
      const q = searchGuest.toLowerCase()
      const matchSearch = !q || guest.includes(q) || conf.includes(q)
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [bookings, searchGuest, filterStatus])

  function openEdit(booking) {
    setEditBooking(booking)
    setSelectedBooking(null)
    setShowModal(true)
  }

  function handleDelete(id) {
    deleteBooking(id)
    setDeleteConfirm(null)
    setSelectedBooking(null)
  }

  return (
    <div className="db-res-tab">
      {/* Toolbar */}
      <div className="db-res-toolbar">
        <div className="db-toolbar-left">
          <h2 className="db-section-title" style={{ margin: 0 }}>Reservations</h2>
          <div className="db-date-range">
            {formatDate(DAYS[0])} – {formatDate(DAYS[DAYS.length - 1])}
          </div>
        </div>
        <div className="db-toolbar-right">
          {/* Search */}
          <div className="db-res-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="search"
              placeholder="Search guest or ref…"
              value={searchGuest}
              onChange={e => setSearchGuest(e.target.value)}
              id="res-search-input"
            />
          </div>

          {/* Status filter */}
          <select
            className="db-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            id="res-filter-status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="upcoming">Upcoming</option>
            <option value="arriving">Arriving</option>
            <option value="active">Active</option>
          </select>

          <div className="db-view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} id="btn-view-grid" title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} id="btn-view-list" title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>

          <button className="db-btn-primary" onClick={() => { setEditBooking(null); setShowModal(true) }} id="btn-new-reservation">
            + New Reservation
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="db-res-summary">
        {[
          { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: '#d68910' },
          { label: 'Upcoming', count: bookings.filter(b => b.status === 'upcoming').length, color: '#7b1fa2' },
          { label: 'Arriving Today', count: bookings.filter(b => b.status === 'arriving').length, color: '#f57c00' },
          { label: 'Active (In-house)', count: bookings.filter(b => b.status === 'active').length, color: '#0071c2' },
        ].map(s => (
          <div key={s.label} className="db-res-summary-item" id={`summary-${s.label.replace(/\s/g,'-').toLowerCase()}`}>
            <span className="db-res-summary-num" style={{ color: s.color }}>{s.count}</span>
            <span className="db-res-summary-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="db-card db-grid-card">
          <div className="db-booking-grid">
            <div className="db-grid-header">
              <div className="db-grid-room-col">Room</div>
              <div className="db-grid-dates">
                {DAYS.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString()
                  return (
                    <div key={i} className={`db-grid-date-cell ${isToday ? 'today' : ''}`} style={{ width: COL_WIDTH }}>
                      <span className="db-day-name">{formatDay(d)}</span>
                      <span className="db-day-num">{d.getDate()}</span>
                      <span className="db-day-month">{d.toLocaleDateString('en-US',{month:'short'})}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {Object.entries(floorGroups).map(([floor, floorRooms]) => (
              <div key={floor} className="db-grid-floor-group">
                <div className="db-grid-floor-label">Floor {floor}</div>
                {floorRooms.map(room => {
                  const roomBookings = bookingsByRoom[room.id] || []
                  return (
                    <div key={room.id} className="db-grid-row" id={`grid-row-${room.id}`}>
                      <div className="db-grid-room-col">
                        <div className="db-grid-room-info">
                          <span className="db-grid-room-num">{room.number}</span>
                          <StatusBadge status={room.status} />
                        </div>
                        <span className="db-grid-room-type">{room.type}</span>
                      </div>
                      <div className="db-grid-cells" style={{ width: COL_WIDTH * DAYS.length }}>
                        {DAYS.map((d, i) => (
                          <div key={i} className={`db-grid-cell ${d.toDateString() === new Date().toDateString() ? 'today' : ''}`} style={{ left: i * COL_WIDTH, width: COL_WIDTH }} />
                        ))}
                        {roomBookings.filter(b => b.status !== 'pending').map(b => {
                          const span = getBookingSpan(b)
                          if (!span) return null
                          const colors = BOOKING_COLORS[b.status] || BOOKING_COLORS.upcoming
                          return (
                            <div
                              key={b.id}
                              className="db-booking-block"
                              style={{ left: span.startOffset * COL_WIDTH + 2, width: span.width * COL_WIDTH - 4, background: colors.bg, color: colors.text }}
                              onClick={() => setSelectedBooking(b)}
                              id={`booking-block-${b.id}`}
                              title={`${b.guest} · ${b.confirmationNo}`}
                            >
                              <span className="db-block-guest">{b.guest}</span>
                              <span className="db-block-conf">{b.confirmationNo}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="db-grid-legend">
            {Object.entries(BOOKING_COLORS).map(([status, colors]) => (
              <div key={status} className="db-legend-item">
                <span className="db-legend-block" style={{ background: colors.bg }} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            ))}
            <span className="db-grid-count">{bookings.length} reservations total</span>
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">All Reservations</span>
            <span className="db-card-subtitle">{filteredBookings.length} results</span>
          </div>
          <div className="db-hk-table-wrap">
            <table className="db-hk-table">
              <thead>
                <tr>
                  <th>Confirmation</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No reservations match your search
                    </td>
                  </tr>
                )}
                {filteredBookings.map(b => {
                  const room = rooms.find(r => r.id === b.roomId)
                  const nights = b.nights || Math.round((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000)
                  return (
                    <tr key={b.id} id={`list-booking-${b.id}`} className="db-res-row">
                      <td><span className="db-tbl-mono">{b.confirmationNo}</span></td>
                      <td className="db-tbl-guest-col">
                        <div className="db-tbl-guest-info">
                          <div className="db-tbl-guest-avatar">{b.guest?.charAt(0) || '?'}</div>
                          <div>
                            <div className="db-tbl-guest-name">{b.guest}</div>
                            {b.email && <div className="db-tbl-guest-email">{b.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="db-tbl-room-num">{room?.number || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{room?.type}</td>
                      <td>{new Date(b.checkIn).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'})}</td>
                      <td>{new Date(b.checkOut).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'})}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{nights}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {b.totalAmount ? `€${b.totalAmount.toLocaleString()}` : '—'}
                      </td>
                      <td>
                        <span className={`db-booking-badge ${b.status}`}>
                          {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {b.source || 'Direct'}
                      </td>
                      <td>
                        <div className="db-res-actions">
                          {b.status === 'pending' && (
                            <>
                              <button className="db-action-icon-btn" onClick={() => approveBooking(b.id, b.roomId)} title="Approve" style={{ color: '#1a7f4b' }}>
                                ✓
                              </button>
                              <button className="db-action-icon-btn" onClick={() => rejectBooking(b.id)} title="Reject" style={{ color: '#c0392b' }}>
                                ✕
                              </button>
                            </>
                          )}
                          <button
                            className="db-action-icon-btn"
                            onClick={() => openEdit(b)}
                            id={`btn-edit-${b.id}`}
                            title="Edit reservation"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            className="db-action-icon-btn danger"
                            onClick={() => setDeleteConfirm(b.id)}
                            id={`btn-delete-${b.id}`}
                            title="Cancel reservation"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking detail modal (from grid click) */}
      {selectedBooking && (
        <div className="db-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="db-modal db-booking-detail" onClick={e => e.stopPropagation()} id="booking-detail-modal">
            <div className="db-modal-header">
              <div>
                <h3>Reservation Details</h3>
                <p className="db-modal-conf">{selectedBooking.confirmationNo}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="db-modal-x">✕</button>
            </div>
            <div className="db-modal-body">
              {[
                ['Guest', selectedBooking.guest],
                ['Email', selectedBooking.email || '—'],
                ['Phone', selectedBooking.phone || '—'],
                ['Room', rooms.find(r => r.id === selectedBooking.roomId)?.number],
                ['Room Type', rooms.find(r => r.id === selectedBooking.roomId)?.type],
                ['Check-in', new Date(selectedBooking.checkIn).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})],
                ['Check-out', new Date(selectedBooking.checkOut).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})],
                ['Guests', selectedBooking.adults ? `${selectedBooking.adults} adults${selectedBooking.children ? `, ${selectedBooking.children} children` : ''}` : '—'],
                ['Meal Plan', selectedBooking.mealPlan ? selectedBooking.mealPlan.toUpperCase() : '—'],
                ['Source', selectedBooking.source || 'Direct'],
                ['Total', selectedBooking.totalAmount ? `€${selectedBooking.totalAmount.toLocaleString()}` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="db-detail-row">
                  <span>{label}</span><strong>{val}</strong>
                </div>
              ))}
              {selectedBooking.notes && (
                <div className="db-notes-row">
                  <span>Notes</span>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="db-modal-footer">
              {selectedBooking.status === 'pending' ? (
                <>
                  <button className="db-btn-ghost danger-btn" onClick={() => { rejectBooking(selectedBooking.id); setSelectedBooking(null) }} id="btn-reject-booking">
                    Reject Request
                  </button>
                  <button className="db-btn-primary" onClick={() => { approveBooking(selectedBooking.id, selectedBooking.roomId); setSelectedBooking(null) }} id="btn-approve-booking" style={{ background: '#1a7f4b' }}>
                    ✓ Approve Request
                  </button>
                </>
              ) : (
                <>
                  <button className="db-btn-ghost danger-btn" onClick={() => { setDeleteConfirm(selectedBooking.id); setSelectedBooking(null) }} id="btn-cancel-booking">
                    Cancel Booking
                  </button>
                  <button className="db-btn-primary" onClick={() => openEdit(selectedBooking)} id="btn-edit-booking">
                    ✏ Edit
                  </button>
                </>
              )}
              <button className="db-btn-ghost" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="db-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="db-modal db-delete-modal" onClick={e => e.stopPropagation()} id="delete-confirm-modal">
            <div className="db-modal-header">
              <h3>Cancel Reservation?</h3>
              <button onClick={() => setDeleteConfirm(null)} className="db-modal-x">✕</button>
            </div>
            <div className="db-modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This will permanently remove this reservation. The room will be freed up and the guest will need to be notified separately.
              </p>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn-ghost" onClick={() => setDeleteConfirm(null)} id="btn-cancel-delete">Keep Reservation</button>
              <button className="db-btn-primary" style={{ background: 'var(--status-dirty)' }} onClick={() => handleDelete(deleteConfirm)} id="btn-confirm-delete">
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Reservation Modal */}
      {showModal && (
        <NewReservationModal
          editBooking={editBooking}
          onClose={() => { setShowModal(false); setEditBooking(null) }}
        />
      )}
    </div>
  )
}
