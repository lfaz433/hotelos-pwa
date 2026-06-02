import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import RoomDetailsDrawer from '../components/public/RoomDetailsDrawer'
import ConciergeChatbot from '../components/public/ConciergeChatbot'
import SkeletonLoader from '../components/shared/SkeletonLoader'
import './BookingPortal.css'

export default function BookingPortal() {
  const { rooms, bookings, roomTypes, addBooking } = useHotel()
  
  const roomTypesArray = useMemo(() => Object.values(roomTypes), [roomTypes])
  const navigate = useNavigate()
  
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [guests, setGuests] = useState(1)
  const [children, setChildren] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requests: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Search, 2: Details, 3: Success
  const [viewingRoom, setViewingRoom] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // i18n and Currency State
  const [currency, setCurrency] = useState('EUR')
  const [language, setLanguage] = useState('EN')

  // Mock exchange rates (Base: EUR)
  const RATES = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.85
  }
  const CURRENCY_SYMBOLS = {
    EUR: '€',
    USD: '$',
    GBP: '£'
  }

  const formatPrice = (eurPrice) => {
    const converted = Math.round(eurPrice * RATES[currency])
    return `${CURRENCY_SYMBOLS[currency]}${converted}`
  }

  // Calculate available rooms for the selected dates
  const availability = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return roomTypesArray.map(rt => ({ ...rt, available: 0 }))
    
    const ci = new Date(dates.checkIn)
    const co = new Date(dates.checkOut)
    
    if (isNaN(ci) || isNaN(co) || ci >= co) return roomTypesArray.map(rt => ({ ...rt, available: 0 }))

    const availableCounts = {}
    roomTypesArray.forEach(rt => availableCounts[rt.id] = 0)

    rooms.forEach(room => {
      // Find all bookings for this room
      const roomBookings = bookings.filter(b => b.roomId === room.id && b.status !== 'rejected')
      
      // Check if any booking overlaps with requested dates
      const isOverlapping = roomBookings.some(b => {
        const bCi = new Date(b.checkIn)
        const bCo = new Date(b.checkOut)
        return ci < bCo && co > bCi
      })
      
      if (!isOverlapping && availableCounts[room.type] !== undefined) {
        availableCounts[room.type]++
      }
    })

    return roomTypesArray.map(rt => ({
      ...rt,
      available: availableCounts[rt.id] || 0
    }))
  }, [dates, rooms, bookings, roomTypesArray])

  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0
    const ci = new Date(dates.checkIn)
    const co = new Date(dates.checkOut)
    if (ci >= co) return 0
    return Math.round((co - ci) / 86400000)
  }, [dates])

  function handleSearch(e) {
    e.preventDefault()
    // Validation
    const ci = new Date(dates.checkIn)
    const co = new Date(dates.checkOut)
    if (ci >= co) {
      alert("Check-out date must be after check-in date.")
      return
    }
    
    // Simulate network latency for searching
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })
    }, 1200)
  }

  function handleSelectRoom(room) {
    setSelectedRoom(room)
    setStep(2)
  }

  function handleSubmitBooking(e) {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate network delay for UX
    setTimeout(() => {
      const availableRoomOfThisType = rooms.find(r => r.type === selectedRoom.id && !bookings.some(b => b.roomId === r.id && b.status !== 'rejected' && new Date(dates.checkIn) < new Date(b.checkOut) && new Date(dates.checkOut) > new Date(b.checkIn)))

      addBooking({
        roomId: availableRoomOfThisType?.id || rooms.find(r => r.type === selectedRoom.id)?.id, // fallback to any if edge case
        guest: `${form.lastName}, ${form.firstName.charAt(0)}.`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        checkIn: new Date(dates.checkIn),
        checkOut: new Date(dates.checkOut),
        adults: guests,
        children: 0,
        totalAmount: selectedRoom.price * nights,
        notes: form.requests,
        source: 'Website'
      }, 'public')

      setIsSubmitting(false)
      setStep(3)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="bp-layout">
      {/* Header */}
      <header className="bp-header">
        <div className="bp-header-inner">
          <div className="bp-logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.15)"/>
              <path d="M8 30V14a2 2 0 012-2h6v-2a2 2 0 012-2h4a2 2 0 012 2v2h6a2 2 0 012 2v16H8z" fill="white"/>
              <rect x="16" y="22" width="8" height="8" rx="1" fill="rgba(0,53,128,0.6)"/>
            </svg>
            <span>Grand Palace Hotel</span>
          </div>
          
          <button className="bp-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          <nav className={`bp-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="bp-preferences">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bp-pref-select">
                <option value="EN">EN 🇬🇧</option>
                <option value="FR">FR 🇫🇷</option>
                <option value="ES">ES 🇪🇸</option>
              </select>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bp-pref-select">
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
              </select>
            </div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <a href="#rooms" onClick={() => setMobileMenuOpen(false)}>Rooms</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="bp-main animate-fade-in-up">
        {step === 1 && (
          <>
            <section className="bp-hero">
              <div className="bp-hero-slideshow">
                <div className="bp-hero-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d27ce669?auto=format&fit=crop&q=60&w=1200')" }}></div>
                <div className="bp-hero-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=60&w=1200')" }}></div>
                <div className="bp-hero-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719478250-c894e4dc240e?auto=format&fit=crop&q=60&w=1200')" }}></div>
                <div className="bp-hero-gradient"></div>
              </div>
              
              <div className="bp-hero-content">
                <div className="bp-hero-badge">⭐⭐⭐⭐⭐ Premium Resort & Spa</div>
                <h1>Ready for an unforgettable<br/>stay with us?</h1>
                <p>Discover world-class dining, pristine pools, and ultimate relaxation.</p>
                <a href="#rooms" className="bp-explore-link">Explore Now &rarr;</a>
              </div>
            </section>
            
            <div className="bp-search-wrapper">
              <div className="bp-search-tabs">
                <button className="bp-search-tab active">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  Book Room
                </button>
                <button className="bp-search-tab disabled">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Manage Booking
                </button>
              </div>

              <div className="bp-search-card">
                <form className="bp-search-form" onSubmit={handleSearch}>
                  <div className="bp-search-inputs-row">
                    <div className="bp-input-block">
                      <label>CHECK-IN</label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        value={dates.checkIn}
                        onChange={e => setDates(prev => ({ ...prev, checkIn: e.target.value }))}
                      />
                    </div>
                    
                    <div className="bp-swap-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>
                    </div>

                    <div className="bp-input-block">
                      <label>CHECK-OUT</label>
                      <input 
                        type="date" 
                        required
                        min={dates.checkIn || new Date().toISOString().split('T')[0]}
                        value={dates.checkOut}
                        onChange={e => setDates(prev => ({ ...prev, checkOut: e.target.value }))}
                      />
                    </div>
                    
                    <div className="bp-input-divider"></div>

                    <div className="bp-input-block">
                      <label>ADULTS</label>
                      <select value={guests} onChange={e => setGuests(parseInt(e.target.value))}>
                        {[1,2,3,4].map(n => <option key={n} value={n}>0{n}</option>)}
                      </select>
                    </div>

                    <div className="bp-input-divider"></div>

                    <div className="bp-input-block">
                      <label>CHILDREN</label>
                      <select value={children} onChange={e => setChildren(parseInt(e.target.value))}>
                        {[0,1,2,3,4].map(n => <option key={n} value={n}>0{n}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <button type="submit" className="bp-btn-search-floating">
                    Search Rooms &nbsp;&rarr;
                  </button>
                </form>
              </div>
            </div>

            <section className="bp-results" id="rooms">
              {dates.checkIn && dates.checkOut && nights > 0 ? (
                <div className="bp-results-container">
                  <h2>Available Rooms for {nights} Night{nights > 1 ? 's' : ''}</h2>
                  <div className="bp-room-list">
                    {isSearching ? (
                      <>
                        <SkeletonLoader variant="card" height="240px" />
                        <SkeletonLoader variant="card" height="240px" />
                        <SkeletonLoader variant="card" height="240px" />
                      </>
                    ) : (
                      availability.map(room => (
                        <div key={room.id} className={`bp-room-card ${room.available === 0 || room.capacity < guests ? 'unavailable' : ''}`}>
                          <img src={room.images[0] || ''} alt={room.name} className="bp-room-img" />
                          <div className="bp-room-info">
                            <div className="bp-room-header">
                              <h3>{room.name}</h3>
                              <div className="bp-room-price">
                                <span className="bp-price-val">{formatPrice(room.price)}</span>
                                <span className="bp-price-night">/ night</span>
                              </div>
                            </div>
                            <p className="bp-room-desc">{room.desc}</p>
                            <div className="bp-room-meta">
                              <span>👥 Up to {room.capacity} guests</span>
                              {room.available > 0 && room.capacity >= guests && (
                                <span className="bp-urgency">Only {room.available} left!</span>
                              )}
                            </div>
                            <div className="bp-room-action">
                              {room.capacity < guests ? (
                                <span className="bp-room-status-text">Room too small for {guests} guests</span>
                              ) : room.available === 0 ? (
                                <span className="bp-room-status-text">Sold out for these dates</span>
                              ) : (
                                <button className="bp-btn-select" onClick={() => setViewingRoom(room)}>
                                  View Details & Book
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bp-empty-state">
                  <div className="bp-empty-icon">📅</div>
                  <h3>Select dates to see availability</h3>
                  <p>Enter your check-in and check-out dates above to find the perfect room.</p>
                </div>
              )}
            </section>
          </>
        )}

        {step === 2 && selectedRoom && (
          <section className="bp-checkout">
            <div className="bp-checkout-container">
              <div className="bp-checkout-header">
                <button className="bp-btn-back" onClick={() => setStep(1)}>← Back to results</button>
                <h2>Complete your booking</h2>
              </div>
              
              <div className="bp-checkout-grid">
                <div className="bp-checkout-form-container">
                  <form className="bp-form" onSubmit={handleSubmitBooking}>
                    <h3>Guest Details</h3>
                    <div className="bp-form-row">
                      <div className="bp-form-group">
                        <label>First Name *</label>
                        <input type="text" required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} />
                      </div>
                      <div className="bp-form-group">
                        <label>Last Name *</label>
                        <input type="text" required value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} />
                      </div>
                    </div>
                    <div className="bp-form-row">
                      <div className="bp-form-group">
                        <label>Email Address *</label>
                        <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                      </div>
                      <div className="bp-form-group">
                        <label>Phone Number</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                      </div>
                    </div>
                    
                    <h3 style={{ marginTop: '24px' }}>Special Requests</h3>
                    <div className="bp-form-group">
                      <label>Let us know if you have any special requests (optional)</label>
                      <textarea rows="4" value={form.requests} onChange={e => setForm(f => ({...f, requests: e.target.value}))}></textarea>
                    </div>
                    
                    <div className="bp-form-policy">
                      <p><strong>Payment Policy:</strong> No payment is required right now. The hotel will review your request and send you a secure payment link once confirmed.</p>
                    </div>

                    <button type="submit" className="bp-btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <svg className="bp-spinner" viewBox="0 0 50 50" width="20" height="20">
                            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="90, 150"></circle>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        `Request Booking`
                      )}
                    </button>
                  </form>
                </div>
                
                <div className="bp-checkout-summary">
                  <h3>Your Stay</h3>
                  <div className="bp-summary-dates">
                    <div>
                      <span>Check-in</span>
                      <strong>{new Date(dates.checkIn).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                    </div>
                    <div className="bp-summary-arrow">→</div>
                    <div>
                      <span>Check-out</span>
                      <strong>{new Date(dates.checkOut).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                    </div>
                  </div>
                  
                  <div className="bp-summary-details">
                    <p>Total length of stay: <strong>{nights} nights</strong></p>
                    <p>Guests: <strong>{guests}</strong></p>
                  </div>
                  
                  <div className="bp-summary-room">
                    <h4>{selectedRoom.name}</h4>
                    <p>{selectedRoom.desc}</p>
                  </div>
                  
                  <div className="bp-summary-price">
                    <div className="bp-summary-row">
                    <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                    <span>{formatPrice(selectedRoom.price * nights)}</span>
                  </div>
                  <div className="bp-summary-row">
                    <span>Taxes & Fees</span>
                    <span>{formatPrice(selectedRoom.price * nights * 0.1)}</span>
                  </div>
                  <div className="bp-summary-total">
                    <span>Total</span>
                    <span>{formatPrice(selectedRoom.price * nights * 1.1)}</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="bp-success">
            <div className="bp-success-card">
              <div className="bp-success-icon">✓</div>
              <h2>Booking Request Received</h2>
              <p>Thank you, {form.firstName}! Your request for a {selectedRoom?.name} from {new Date(dates.checkIn).toLocaleDateString()} to {new Date(dates.checkOut).toLocaleDateString()} has been submitted.</p>
              <div className="bp-success-info">
                <p><strong>What happens next?</strong></p>
                <p>Our reception team will review your request shortly. Once approved, you will receive a confirmation email with a secure payment link to finalize your reservation.</p>
              </div>

              <div className="bp-invoice-card" style={{marginTop: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center'}}>
                <h3 style={{marginBottom: '10px', color: '#003580'}}>Digital Reservation Pass</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HOS-${Date.now()}-${selectedRoom?.id}`} alt="QR Code" style={{borderRadius: '8px', marginBottom: '15px'}} />
                <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>Save this QR code to your phone and scan at the front desk for instant check-in.</p>
                <div style={{background: 'white', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', fontSize: '15px'}}>
                  <span style={{fontWeight: 'bold'}}>{selectedRoom?.name} ({nights} nights)</span>
                  <span style={{fontWeight: 'bold', color: '#003580'}}>{formatPrice(selectedRoom?.price * nights * 1.1)}</span>
                </div>
              </div>

              <button className="bp-btn-home" onClick={() => navigate('/')}>Return to Home</button>
            </div>
          </section>
        )}
      </main>

      <footer className="bp-footer">
        <div className="bp-footer-inner">
          <p>© {new Date().getFullYear()} Grand Palace Hotel. All rights reserved.</p>
        </div>
      </footer>

      {step === 1 && viewingRoom && (
        <RoomDetailsDrawer 
          room={viewingRoom} 
          onClose={() => setViewingRoom(null)} 
          onBook={() => {
            setSelectedRoom(viewingRoom)
            setViewingRoom(null)
            setStep(2)
          }}
        />
      )}

      {/* Floating Concierge Chatbot */}
      <ConciergeChatbot />
    </div>
  )
}
