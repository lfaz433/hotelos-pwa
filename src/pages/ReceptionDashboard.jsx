import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHotel, STATUS_LABELS } from '../context/HotelContext'
import './ReceptionDashboard.css'

export default function ReceptionDashboard() {
  const { rooms, updateRoomStatus, bookings, updateBooking } = useHotel()
  const [filter, setFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [checkoutModal, setCheckoutModal] = useState(null)

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Derive stats
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      ready: rooms.filter(r => r.status === 'ready' || r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      dirty: rooms.filter(r => r.status === 'dirty').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length,
    }
  }, [rooms])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (filter === 'all') return rooms
    if (filter === 'ready') return rooms.filter(r => r.status === 'ready' || r.status === 'available')
    return rooms.filter(r => r.status === filter)
  }, [rooms, filter])

  // Get today's arrivals/departures from bookings mock
  const today = new Date().toDateString()
  const arrivals = bookings.filter(b => b.status === 'arriving' || new Date(b.checkIn).toDateString() === today)
  const departures = bookings.filter(b => b.status === 'active' && new Date(b.checkOut).toDateString() === today)

  const handleStatusChange = (roomId, currentStatus) => {
    if (currentStatus === 'occupied') {
      const room = rooms.find(r => r.id === roomId)
      const booking = bookings.find(b => b.roomId === roomId && b.status === 'active')
      setCheckoutModal({ room, booking })
    } else if (currentStatus === 'ready' || currentStatus === 'available') {
      if (window.confirm('Check Guest In? This suite will be marked as occupied.')) {
        updateRoomStatus(roomId, 'occupied')
        const arrivalBooking = bookings.find(b => b.roomId === roomId && (b.status === 'arriving' || new Date(b.checkIn).toDateString() === today))
        if (arrivalBooking) {
          updateBooking({ ...arrivalBooking, status: 'active' })
        }
      }
    }
  }

  const handleConfirmCheckout = () => {
    if (checkoutModal) {
      updateRoomStatus(checkoutModal.room.id, 'dirty')
      if (checkoutModal.booking) {
        updateBooking({ ...checkoutModal.booking, status: 'completed' })
      }
      setCheckoutModal(null)
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ready':
      case 'available': return '✨'
      case 'occupied': return '🌙'
      case 'dirty': return '🧹'
      case 'cleaning': return '⏳'
      default: return '•'
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
            <span>FRONT DESK</span>
          </div>
        </div>
        
        <div className="rdash-lux-clock">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span>{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="rdash-lux-user">
          <div className="lux-user-info">
            <span className="lux-name">Concierge</span>
            <span className="lux-role">Active Shift</span>
          </div>
          <div className="lux-avatar">C</div>
          <Link to="/" className="lux-logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </Link>
        </div>
      </header>

      <div className="rdash-lux-body">
        {/* Main Content */}
        <main className="rdash-lux-main">
          <div className="rdash-lux-header-text">
            <h2>Suite Overview</h2>
            <p>Real-time status of all properties.</p>
          </div>

          <div className="rdash-lux-stats">
            <div className={`lux-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <div className="lux-stat-value">{stats.total}</div>
              <div className="lux-stat-label">Total Suites</div>
            </div>
            <div className={`lux-stat-card type-ready ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>
              <div className="lux-stat-value">{stats.ready}</div>
              <div className="lux-stat-label">Pristine & Ready</div>
            </div>
            <div className={`lux-stat-card type-occupied ${filter === 'occupied' ? 'active' : ''}`} onClick={() => setFilter('occupied')}>
              <div className="lux-stat-value">{stats.occupied}</div>
              <div className="lux-stat-label">Currently Occupied</div>
            </div>
            <div className={`lux-stat-card type-dirty ${filter === 'dirty' ? 'active' : ''}`} onClick={() => setFilter('dirty')}>
              <div className="lux-stat-value">{stats.dirty}</div>
              <div className="lux-stat-label">Requires Service</div>
            </div>
          </div>

          <div className="rdash-lux-grid animate-fade-in-up">
            {filteredRooms.map(room => (
              <div 
                key={room.id} 
                className={`lux-room-card status-${room.status}`}
                onClick={() => handleStatusChange(room.id, room.status)}
              >
                <div className="lux-room-top">
                  <div className="lux-room-number">{room.number}</div>
                  <div className={`lux-room-icon icon-${room.status}`}>
                    {getStatusIcon(room.status)}
                  </div>
                </div>
                
                <div className="lux-room-type">{room.type}</div>
                
                <div className="lux-room-bottom">
                  <div className={`lux-status-pill pill-${room.status}`}>
                    {STATUS_LABELS[room.status] || room.status}
                  </div>
                  
                  <div className="lux-room-action">
                    {room.status === 'occupied' && <span>Check Out &rarr;</span>}
                    {(room.status === 'ready' || room.status === 'available') && <span>Check In &rarr;</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="rdash-lux-sidebar">
          <div className="lux-sidebar-panel">
            <div className="lux-panel-header">
              <h3>Today's Arrivals</h3>
              <span className="lux-count">{arrivals.length}</span>
            </div>
            <div className="lux-panel-list">
              {arrivals.length === 0 ? (
                <div className="lux-empty">No arrivals pending</div>
              ) : (
                arrivals.map(a => (
                  <div key={a.id} className="lux-list-item arrival-item">
                    <div className="lux-item-icon">↓</div>
                    <div className="lux-item-details">
                      <strong>{a.guest}</strong>
                      <span>Conf: {a.confirmationNo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lux-sidebar-panel">
            <div className="lux-panel-header">
              <h3>Today's Departures</h3>
              <span className="lux-count">{departures.length}</span>
            </div>
            <div className="lux-panel-list">
              {departures.length === 0 ? (
                <div className="lux-empty">No departures pending</div>
              ) : (
                departures.map(d => (
                  <div key={d.id} className="lux-list-item departure-item">
                    <div className="lux-item-icon">↑</div>
                    <div className="lux-item-details">
                      <strong>{d.guest}</strong>
                      <span>Suite {rooms.find(r => r.id === d.roomId)?.number || 'TBD'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Checkout Invoice Modal */}
      {checkoutModal && checkoutModal.room && (
        <div className="inv-modal-overlay" onClick={() => setCheckoutModal(null)}>
          <div className="inv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header" style={{background: '#003580'}}>
              <h3 style={{margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px'}}>📄 Check-Out & Final Invoice</h3>
            </div>
            <div className="inv-modal-body" style={{textAlign: 'center', padding: '24px'}}>
              <h2 style={{margin: '0 0 5px 0'}}>{checkoutModal.booking?.guest || 'Walk-in Guest'}</h2>
              <p style={{color: '#666', margin: '0 0 20px 0'}}>Suite {checkoutModal.room.number}</p>
              
              <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '20px', textAlign: 'left'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px'}}>
                  <span>Room Charges</span>
                  <span>${checkoutModal.booking?.totalAmount || (checkoutModal.room.price * 2)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px'}}>
                  <span>Room Service & Extras</span>
                  <span>$45.00</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', color: '#003580'}}>
                  <span>Total Due</span>
                  <span>${((checkoutModal.booking?.totalAmount || (checkoutModal.room.price * 2)) + 45).toFixed(2)}</span>
                </div>
              </div>

              <p style={{fontSize: '12px', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px'}}>Present QR code to guest for payment</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HOS-CHECKOUT-${checkoutModal.room.id}`} alt="Checkout QR" style={{borderRadius: '8px', marginBottom: '20px'}} />

              <div style={{display: 'flex', gap: '12px'}}>
                <button className="inv-btn-cancel" style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => setCheckoutModal(null)}>Cancel</button>
                <button className="inv-btn-confirm" style={{flex: 2, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}} onClick={handleConfirmCheckout}>Complete Check-Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
