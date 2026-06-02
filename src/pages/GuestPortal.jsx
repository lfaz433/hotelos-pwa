import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import './GuestPortal.css'

export default function GuestPortal() {
  const navigate = useNavigate()
  const { rooms, bookings, createTicket, addToast } = useHotel()

  const [roomNo, setRoomNo] = useState('')
  const [lastName, setLastName] = useState('')
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    // Find room
    const room = rooms.find(r => r.number === roomNo)
    if (!room) {
      setError('Room not found.')
      return
    }

    // Find active booking for this room
    const activeBooking = bookings.find(b => b.roomId === room.id && (b.status === 'active' || b.status === 'arriving'))
    
    if (!activeBooking) {
      setError('No active stay found for this room.')
      return
    }

    // Verify last name (case insensitive, basic check)
    const guestLastName = activeBooking.guest.split(',')[0].trim().toLowerCase()
    if (guestLastName !== lastName.toLowerCase().trim()) {
      setError('Last name does not match our records.')
      return
    }

    setSession({ room, booking: activeBooking })
  }

  const handleLogout = () => {
    setSession(null)
    setRoomNo('')
    setLastName('')
  }

  const handleDemoLogin = () => {
    const activeBooking = bookings.find(b => b.status === 'active' || b.status === 'arriving')
    if (activeBooking) {
      const room = rooms.find(r => r.id === activeBooking.roomId)
      setRoomNo(room.number)
      setLastName(activeBooking.guest.split(',')[0].trim())
      setSession({ room, booking: activeBooking })
      setError('')
    } else {
      setError('No active bookings available in the system right now. Try reloading.')
    }
  }

  const requestService = (issue, priority = 'normal') => {
    if (!session) return
    createTicket({
      roomId: session.room.id,
      roomNumber: session.room.number,
      issue,
      reportedBy: session.booking.guest,
      priority
    })
    addToast(`${issue} requested successfully. Our team will be there shortly.`)
  }

  const orderFood = (item) => {
    // We'll log it as a ticket for simplicity so it shows up for staff
    requestService(`Room Service Order: ${item}`, 'high')
  }

  // Simulated bill
  const billItems = useMemo(() => {
    if (!session) return []
    return [
      { desc: 'Room Rate (per night)', amount: 150 },
      { desc: 'City Tax', amount: 15 },
      { desc: 'Mini-bar consumption', amount: 32 },
      { desc: 'Room Service', amount: 45 }
    ]
  }, [session])

  const totalBill = billItems.reduce((acc, item) => acc + item.amount, 0)

  if (!session) {
    return (
      <div className="guest-portal">
        <div className="gp-login-container">
          <div className="gp-login-card">
            <h1>HotelOS Portal</h1>
            <p>Access your stay details</p>
            
            <form onSubmit={handleLogin}>
              {error && <div className="gp-error">{error}</div>}
              <div className="gp-input-group">
                <label>Room Number</label>
                <input 
                  type="text" 
                  value={roomNo} 
                  onChange={e => setRoomNo(e.target.value)} 
                  placeholder="e.g. 101" 
                  required 
                />
              </div>
              <div className="gp-input-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  placeholder="e.g. Anderson" 
                  required 
                />
              </div>
              <button type="submit" className="gp-btn-login">View My Stay</button>
            </form>
            <button 
              type="button"
              className="gp-btn-login" 
              style={{marginTop: '10px', background: '#e0e0e0', color: '#333'}}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
            <button 
              type="button"
              className="gp-btn-login" 
              style={{marginTop: '10px', background: '#10b981', color: 'white'}}
              onClick={handleDemoLogin}
            >
              Quick Demo Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="guest-portal">
      <header className="gp-header">
        <div className="gp-header-title">HotelOS</div>
        <button className="gp-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <div className="gp-body">
        <div className="gp-welcome">
          <h2>Welcome, {session.booking.guest.split(',')[1]?.trim() || session.booking.guest}</h2>
          <p>Room {session.room.number} &bull; Check-out: {new Date(session.booking.checkOut).toLocaleDateString()}</p>
        </div>

        <div className="gp-section">
          <h3>✨ Housekeeping & Maintenance</h3>
          <div className="gp-action-grid">
            <button className="gp-action-btn" onClick={() => requestService('Make Up Room', 'normal')}>
              <span className="gp-action-icon">🛏️</span>
              <span className="gp-action-label">Make Up Room</span>
            </button>
            <button className="gp-action-btn" onClick={() => requestService('Extra Towels', 'normal')}>
              <span className="gp-action-icon">🛁</span>
              <span className="gp-action-label">Extra Towels</span>
            </button>
            <button className="gp-action-btn" onClick={() => requestService('Maintenance: AC Issue', 'high')}>
              <span className="gp-action-icon">❄️</span>
              <span className="gp-action-label">AC Issue</span>
            </button>
            <button className="gp-action-btn" onClick={() => requestService('Maintenance: Other Issue', 'normal')}>
              <span className="gp-action-icon">🔧</span>
              <span className="gp-action-label">Report Issue</span>
            </button>
          </div>
        </div>

        <div className="gp-section">
          <h3>🍽️ Room Service</h3>
          <div className="gp-action-grid">
            <button className="gp-action-btn" onClick={() => orderFood('Club Sandwich & Fries')}>
              <span className="gp-action-icon">🥪</span>
              <span className="gp-action-label">Club Sandwich</span>
            </button>
            <button className="gp-action-btn" onClick={() => orderFood('Continental Breakfast')}>
              <span className="gp-action-icon">🥐</span>
              <span className="gp-action-label">Breakfast</span>
            </button>
            <button className="gp-action-btn" onClick={() => orderFood('Bottle of Champagne')}>
              <span className="gp-action-icon">🍾</span>
              <span className="gp-action-label">Champagne</span>
            </button>
            <button className="gp-action-btn" onClick={() => orderFood('Fresh Coffee Pot')}>
              <span className="gp-action-icon">☕</span>
              <span className="gp-action-label">Coffee Pot</span>
            </button>
          </div>
        </div>

        <div className="gp-section">
          <h3>💳 Current Bill (Est.)</h3>
          <div className="gp-bill">
            {billItems.map((item, i) => (
              <div key={i} className="gp-bill-row">
                <span>{item.desc}</span>
                <span>${item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="gp-bill-row gp-bill-total">
              <span>Total Estimated</span>
              <span>${totalBill.toFixed(2)}</span>
            </div>
          </div>
          <button className="gp-btn-login" style={{marginTop: '20px', background: '#10b981'}} onClick={() => setShowInvoice(true)}>
            View Digital Invoice & Pay
          </button>
        </div>
      </div>

      {/* Digital Invoice Modal */}
      {showInvoice && (
        <div className="gp-modal-overlay" onClick={() => setShowInvoice(false)}>
          <div className="gp-modal-card" onClick={e => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>HotelOS Final Invoice</h3>
              <button className="gp-modal-close" onClick={() => setShowInvoice(false)}>✕</button>
            </div>
            <div className="gp-modal-body" style={{textAlign: 'center'}}>
              <p style={{color: '#666', marginBottom: '15px'}}>Scan to settle your bill instantly.</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HOS-PAY-${session.booking.id}-${totalBill}`} alt="Payment QR Code" style={{borderRadius: '8px', marginBottom: '20px'}} />
              
              <div style={{textAlign: 'left', background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #eee'}}>
                <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Stay Summary</h4>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px'}}>
                  <span>Guest</span>
                  <strong>{session.booking.guest}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px'}}>
                  <span>Room</span>
                  <strong>{session.room.number}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', paddingBottom: '10px', borderBottom: '1px solid #ddd'}}>
                  <span>Confirmation</span>
                  <strong>{session.booking.confirmationNo}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#003580'}}>
                  <span>Total Due</span>
                  <span>${totalBill.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
