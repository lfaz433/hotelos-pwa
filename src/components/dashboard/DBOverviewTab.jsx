import { useHotel } from '../../context/HotelContext'
import { STATUS_LABELS } from '../../context/HotelContext'
import StatusBadge from '../shared/StatusBadge'
import './DBOverviewTab.css'

export default function DBOverviewTab() {
  const { rooms, bookings } = useHotel()

  const today = new Date()
  const checkInsToday = bookings.filter(b => {
    const ci = new Date(b.checkIn)
    return ci.toDateString() === today.toDateString()
  }).length

  const checkOutsToday = bookings.filter(b => {
    const co = new Date(b.checkOut)
    return co.toDateString() === today.toDateString()
  }).length

  const counts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const occupancyRate = Math.round(((counts.occupied || 0) / rooms.length) * 100)

  const KPI_CARDS = [
    {
      id: 'kpi-occupancy',
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      sub: `${counts.occupied || 0} of ${rooms.length} rooms`,
      color: '#0071c2',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      id: 'kpi-checkins',
      title: "Today's Check-ins",
      value: checkInsToday,
      sub: 'Arriving today',
      color: '#1a7f4b',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      ),
    },
    {
      id: 'kpi-checkouts',
      title: "Today's Check-outs",
      value: checkOutsToday,
      sub: 'Departing today',
      color: '#d68910',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
    },
    {
      id: 'kpi-dirty',
      title: 'Rooms to Clean',
      value: (counts.dirty || 0) + (counts.cleaning || 0),
      sub: `${counts.dirty || 0} dirty · ${counts.cleaning || 0} in progress`,
      color: '#c0392b',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      ),
    },
  ]

  const statusBreakdown = [
    { key: 'available', color: '#1a7f4b' },
    { key: 'dirty', color: '#c0392b' },
    { key: 'cleaning', color: '#d68910' },
    { key: 'ready', color: '#0071c2' },
    { key: 'occupied', color: '#7d3c98' },
  ]

  return (
    <div className="db-overview">
      {/* KPI Row */}
      <div className="db-kpi-grid">
        {KPI_CARDS.map(card => (
          <div key={card.id} className="db-kpi-card" id={card.id}>
            <div className="db-kpi-icon" style={{ color: card.color, background: `${card.color}15` }}>
              {card.icon}
            </div>
            <div className="db-kpi-body">
              <div className="db-kpi-value" style={{ color: card.color }}>{card.value}</div>
              <div className="db-kpi-title">{card.title}</div>
              <div className="db-kpi-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Status Breakdown */}
      <div className="db-card" id="room-status-overview">
        <div className="db-card-header">
          <span className="db-card-title">Room Status Overview</span>
          <span className="db-card-subtitle">{rooms.length} total rooms</span>
        </div>
        <div className="db-card-body">
          <div className="db-status-bar">
            {statusBreakdown.map(s => {
              const count = counts[s.key] || 0
              const pct = (count / rooms.length) * 100
              return pct > 0 ? (
                <div
                  key={s.key}
                  className="db-status-bar__segment"
                  style={{ width: `${pct}%`, background: s.color }}
                  title={`${STATUS_LABELS[s.key]}: ${count}`}
                />
              ) : null
            })}
          </div>
          <div className="db-status-legend">
            {statusBreakdown.map(s => (
              <div key={s.key} className="db-legend-item">
                <span className="db-legend-dot" style={{ background: s.color }} />
                <span className="db-legend-label">{STATUS_LABELS[s.key]}</span>
                <span className="db-legend-count">{counts[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's arrivals table */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Today's Arrivals & Departures</span>
          <button className="db-link-btn" id="btn-view-all-bookings">View All →</button>
        </div>
        <div className="db-arrivals-table">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Guest</th>
                <th>Type</th>
                <th>Confirmation</th>
                <th>Status</th>
                <th>Room Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter(b => b.status === 'arriving' || b.status === 'active')
                .slice(0, 8)
                .map(b => {
                  const room = rooms.find(r => r.id === b.roomId)
                  return (
                    <tr key={b.id} id={`booking-row-${b.id}`}>
                      <td className="db-tbl-room">{room?.number}</td>
                      <td className="db-tbl-guest">{b.guest}</td>
                      <td>{room?.type}</td>
                      <td className="db-tbl-mono">{b.confirmationNo}</td>
                      <td>
                        <span className={`db-booking-badge ${b.status}`}>
                          {b.status === 'arriving' ? 'Arriving' : 'Checked In'}
                        </span>
                      </td>
                      <td>
                        {room && <StatusBadge status={room.status} />}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
