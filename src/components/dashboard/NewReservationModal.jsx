import { useState, useEffect, useMemo } from 'react'
import { useHotel } from '../../context/HotelContext'
import './NewReservationModal.css'

/* ── helpers ── */
function toInputDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().split('T')[0]
}

function fromInputDate(str) {
  const [y, m, day] = str.split('-').map(Number)
  return new Date(y, m - 1, day)
}

function nightCount(ci, co) {
  if (!ci || !co) return 0
  const diff = fromInputDate(co) - fromInputDate(ci)
  return Math.max(0, Math.round(diff / 86400000))
}

const RATE_BY_TYPE = {
  Standard:      120,
  Double:        140,
  Twin:          135,
  Deluxe:        185,
  'Junior Suite':260,
  Suite:         340,
}

const MEAL_PLANS = [
  { id: 'ro',  label: 'Room Only',         short: 'RO',  extra: 0 },
  { id: 'bb',  label: 'Bed & Breakfast',   short: 'B&B', extra: 18 },
  { id: 'hb',  label: 'Half Board',        short: 'HB',  extra: 48 },
  { id: 'fb',  label: 'Full Board',        short: 'FB',  extra: 80 },
]

const SOURCES = [
  'Direct / Walk-in',
  'Booking.com',
  'Expedia',
  'Airbnb',
  'Phone',
  'Email',
  'Travel Agent',
  'Corporate',
]

const STEPS = ['Guest', 'Room & Dates', 'Details', 'Confirm']

export default function NewReservationModal({ onClose, editBooking = null }) {
  const { rooms, addBooking, updateBooking } = useHotel()

  const today = toInputDate(new Date())
  const tomorrow = toInputDate(new Date(Date.now() + 86400000))

  /* ── form state ── */
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState(() => {
    if (editBooking) {
      return {
        firstName: editBooking.guest?.split(', ')[1] || '',
        lastName:  editBooking.guest?.split(', ')[0] || '',
        email:     editBooking.email || '',
        phone:     editBooking.phone || '',
        roomId:    editBooking.roomId || '',
        checkIn:   toInputDate(editBooking.checkIn),
        checkOut:  toInputDate(editBooking.checkOut),
        adults:    editBooking.adults || 1,
        children:  editBooking.children || 0,
        mealPlan:  editBooking.mealPlan || 'ro',
        source:    editBooking.source || 'Direct / Walk-in',
        notes:     editBooking.notes || '',
        status:    editBooking.status || 'upcoming',
      }
    }
    return {
      firstName: '', lastName: '', email: '', phone: '',
      roomId: '', checkIn: today, checkOut: tomorrow,
      adults: 2, children: 0,
      mealPlan: 'ro', source: 'Direct / Walk-in',
      notes: '', status: 'upcoming',
    }
  })

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  /* ── derived ── */
  const nights = nightCount(form.checkIn, form.checkOut)
  const selectedRoom = rooms.find(r => r.id === Number(form.roomId))
  const baseRate = selectedRoom ? (RATE_BY_TYPE[selectedRoom.type] || 120) : 120
  const mealExtra = MEAL_PLANS.find(m => m.id === form.mealPlan)?.extra || 0
  const totalRate = (baseRate + mealExtra) * nights
  const tax = Math.round(totalRate * 0.1)
  const grandTotal = totalRate + tax

  /* ── available rooms (no overlap) ── */
  const availableRooms = useMemo(() => {
    return rooms.filter(r => r.status !== 'occupied')
  }, [rooms])

  /* ── room type groups ── */
  const roomsByType = useMemo(() => {
    const groups = {}
    availableRooms.forEach(r => {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    })
    return groups
  }, [availableRooms])

  /* ── validation ── */
  function validateStep(s) {
    const errs = {}
    if (s === 0) {
      if (!form.firstName.trim()) errs.firstName = 'Required'
      if (!form.lastName.trim())  errs.lastName  = 'Required'
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    }
    if (s === 1) {
      if (!form.roomId)             errs.roomId  = 'Please select a room'
      if (!form.checkIn)            errs.checkIn = 'Required'
      if (!form.checkOut)           errs.checkOut = 'Required'
      if (nights <= 0)              errs.checkOut = 'Check-out must be after check-in'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(s => s + 1)
  }

  function prevStep() { setStep(s => Math.max(0, s - 1)) }

  /* ── submit ── */
  async function handleSubmit() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))

    const booking = {
      guest:    `${form.lastName}, ${form.firstName}`,
      email:    form.email,
      phone:    form.phone,
      roomId:   Number(form.roomId),
      checkIn:  fromInputDate(form.checkIn),
      checkOut: fromInputDate(form.checkOut),
      adults:   form.adults,
      children: form.children,
      mealPlan: form.mealPlan,
      source:   form.source,
      notes:    form.notes,
      status:   form.status,
      nights,
      totalAmount: grandTotal,
    }

    if (editBooking) {
      updateBooking({ ...booking, id: editBooking.id, confirmationNo: editBooking.confirmationNo })
    } else {
      addBooking(booking)
    }

    setSaving(false)
    setSaved(true)
  }

  /* ── keyboard escape ── */
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  /* ── render ── */
  if (saved) {
    return (
      <div className="nrm-overlay" onClick={onClose}>
        <div className="nrm-modal" onClick={e => e.stopPropagation()} id="reservation-success">
          <div className="nrm-success">
            <div className="nrm-success-icon">
              <svg viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="25" stroke="#1a7f4b" strokeWidth="2"/>
                <path d="M14 27l8 8 16-16" stroke="#1a7f4b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>{editBooking ? 'Reservation Updated' : 'Reservation Created!'}</h2>
            <div className="nrm-success-conf">
              {/* Confirmation no. shows up from store immediately */}
              <span className="nrm-conf-label">Confirmation</span>
              <span className="nrm-conf-no">HOS{String(Date.now()).slice(-5)}</span>
            </div>
            <div className="nrm-success-details">
              <div className="nrm-sd-row">
                <span>Guest</span>
                <strong>{form.lastName}, {form.firstName}</strong>
              </div>
              <div className="nrm-sd-row">
                <span>Room</span>
                <strong>{selectedRoom?.number} — {selectedRoom?.type}</strong>
              </div>
              <div className="nrm-sd-row">
                <span>Check-in</span>
                <strong>{fromInputDate(form.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div className="nrm-sd-row">
                <span>Check-out</span>
                <strong>{fromInputDate(form.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div className="nrm-sd-row">
                <span>Total</span>
                <strong className="nrm-total-highlight">€{grandTotal.toLocaleString()}</strong>
              </div>
            </div>
            <div className="nrm-success-actions">
              <button className="nrm-btn-outline" onClick={onClose} id="btn-close-success">Close</button>
              <button className="nrm-btn-primary" onClick={() => { setSaved(false); setStep(0); setForm(f => ({ ...f, firstName: '', lastName: '', email: '', phone: '', roomId: '', notes: '' })) }} id="btn-new-reservation-again">
                + New Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nrm-overlay" onClick={onClose}>
      <div className="nrm-modal" onClick={e => e.stopPropagation()} id="new-reservation-modal" role="dialog" aria-modal="true" aria-label="New Reservation">

        {/* ── Header ── */}
        <div className="nrm-header">
          <div className="nrm-header-left">
            <div className="nrm-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
              </svg>
            </div>
            <div>
              <h2 className="nrm-title">{editBooking ? 'Edit Reservation' : 'New Reservation'}</h2>
              <p className="nrm-subtitle">Grand Palace Hotel</p>
            </div>
          </div>
          <button className="nrm-close" onClick={onClose} id="btn-modal-close" aria-label="Close modal">✕</button>
        </div>

        {/* ── Step Indicators ── */}
        <div className="nrm-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`nrm-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="nrm-step-circle">
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="nrm-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className={`nrm-step-line ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="nrm-body">

          {/* STEP 0: Guest Info */}
          {step === 0 && (
            <div className="nrm-step-content animate-in">
              <h3 className="nrm-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Guest Information
              </h3>

              <div className="nrm-form-row">
                <div className={`nrm-field ${errors.firstName ? 'error' : ''}`}>
                  <label htmlFor="nrm-firstName">First Name *</label>
                  <input
                    id="nrm-firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    autoFocus
                  />
                  {errors.firstName && <span className="nrm-error">{errors.firstName}</span>}
                </div>
                <div className={`nrm-field ${errors.lastName ? 'error' : ''}`}>
                  <label htmlFor="nrm-lastName">Last Name *</label>
                  <input
                    id="nrm-lastName"
                    type="text"
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                  />
                  {errors.lastName && <span className="nrm-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="nrm-form-row">
                <div className={`nrm-field ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="nrm-email">Email</label>
                  <input
                    id="nrm-email"
                    type="email"
                    placeholder="john.smith@email.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                  {errors.email && <span className="nrm-error">{errors.email}</span>}
                </div>
                <div className="nrm-field">
                  <label htmlFor="nrm-phone">Phone</label>
                  <input
                    id="nrm-phone"
                    type="tel"
                    placeholder="+351 910 000 000"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="nrm-field">
                <label htmlFor="nrm-source">Booking Source</label>
                <select id="nrm-source" value={form.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="nrm-field">
                <label htmlFor="nrm-status">Booking Status</label>
                <div className="nrm-status-pills">
                  {['upcoming', 'arriving', 'active'].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`nrm-status-pill ${form.status === s ? 'active' : ''} status-pill-${s}`}
                      onClick={() => set('status', s)}
                      id={`pill-${s}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Room & Dates */}
          {step === 1 && (
            <div className="nrm-step-content animate-in">
              <h3 className="nrm-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Room & Dates
              </h3>

              <div className="nrm-form-row">
                <div className={`nrm-field ${errors.checkIn ? 'error' : ''}`}>
                  <label htmlFor="nrm-checkin">Check-in *</label>
                  <input
                    id="nrm-checkin"
                    type="date"
                    value={form.checkIn}
                    min={today}
                    onChange={e => {
                      set('checkIn', e.target.value)
                      if (e.target.value >= form.checkOut) {
                        const next = new Date(fromInputDate(e.target.value))
                        next.setDate(next.getDate() + 1)
                        set('checkOut', toInputDate(next))
                      }
                    }}
                  />
                  {errors.checkIn && <span className="nrm-error">{errors.checkIn}</span>}
                </div>
                <div className={`nrm-field ${errors.checkOut ? 'error' : ''}`}>
                  <label htmlFor="nrm-checkout">Check-out *</label>
                  <input
                    id="nrm-checkout"
                    type="date"
                    value={form.checkOut}
                    min={form.checkIn || today}
                    onChange={e => set('checkOut', e.target.value)}
                  />
                  {errors.checkOut && <span className="nrm-error">{errors.checkOut}</span>}
                </div>
              </div>

              {nights > 0 && (
                <div className="nrm-nights-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                  <strong>{nights}</strong> night{nights !== 1 ? 's' : ''}
                </div>
              )}

              <div className="nrm-form-row">
                <div className="nrm-field nrm-field-sm">
                  <label htmlFor="nrm-adults">Adults</label>
                  <div className="nrm-counter">
                    <button type="button" onClick={() => set('adults', Math.max(1, form.adults - 1))} id="btn-adults-minus">−</button>
                    <span id="adults-count">{form.adults}</span>
                    <button type="button" onClick={() => set('adults', Math.min(6, form.adults + 1))} id="btn-adults-plus">+</button>
                  </div>
                </div>
                <div className="nrm-field nrm-field-sm">
                  <label htmlFor="nrm-children">Children</label>
                  <div className="nrm-counter">
                    <button type="button" onClick={() => set('children', Math.max(0, form.children - 1))} id="btn-children-minus">−</button>
                    <span id="children-count">{form.children}</span>
                    <button type="button" onClick={() => set('children', Math.min(4, form.children + 1))} id="btn-children-plus">+</button>
                  </div>
                </div>
              </div>

              {/* Room Picker */}
              <div className={`nrm-field ${errors.roomId ? 'error' : ''}`}>
                <label>Select Room *</label>
                {errors.roomId && <span className="nrm-error">{errors.roomId}</span>}
                <div className="nrm-room-picker">
                  {Object.entries(roomsByType).map(([type, typeRooms]) => (
                    <div key={type} className="nrm-room-type-group">
                      <div className="nrm-room-type-label">
                        {type}
                        <span>from €{RATE_BY_TYPE[type] || 120}/night</span>
                      </div>
                      <div className="nrm-room-type-rooms">
                        {typeRooms.map(room => (
                          <button
                            key={room.id}
                            type="button"
                            className={`nrm-room-btn ${form.roomId === room.id ? 'selected' : ''} status-${room.status}`}
                            onClick={() => set('roomId', room.id)}
                            id={`room-select-${room.id}`}
                            title={`${room.type} — ${room.status}`}
                          >
                            <span className="nrm-room-btn-num">{room.number}</span>
                            <span className={`nrm-room-dot ${room.status}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="nrm-room-legend">
                  {['available', 'dirty', 'ready'].map(s => (
                    <span key={s} className="nrm-legend-item">
                      <span className={`nrm-room-dot ${s}`} />{s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="nrm-step-content animate-in">
              <h3 className="nrm-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Stay Details
              </h3>

              <div className="nrm-field">
                <label>Meal Plan</label>
                <div className="nrm-meal-grid">
                  {MEAL_PLANS.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      className={`nrm-meal-card ${form.mealPlan === plan.id ? 'selected' : ''}`}
                      onClick={() => set('mealPlan', plan.id)}
                      id={`meal-${plan.id}`}
                    >
                      <span className="nrm-meal-short">{plan.short}</span>
                      <span className="nrm-meal-label">{plan.label}</span>
                      <span className="nrm-meal-price">
                        {plan.extra > 0 ? `+€${plan.extra}/night` : 'Included'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="nrm-field">
                <label htmlFor="nrm-notes">Special Requests / Notes</label>
                <textarea
                  id="nrm-notes"
                  rows={4}
                  placeholder="e.g. Late check-in, high floor preferred, anniversary decoration…"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
                <span className="nrm-char-count">{form.notes.length}/300</span>
              </div>

              {/* Live price preview */}
              {selectedRoom && nights > 0 && (
                <div className="nrm-price-preview">
                  <div className="nrm-price-row">
                    <span>Room rate ({nights} night{nights !== 1 ? 's' : ''} × €{baseRate})</span>
                    <span>€{(baseRate * nights).toLocaleString()}</span>
                  </div>
                  {mealExtra > 0 && (
                    <div className="nrm-price-row">
                      <span>Meal plan ({MEAL_PLANS.find(m => m.id === form.mealPlan)?.short})</span>
                      <span>€{(mealExtra * nights).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="nrm-price-row">
                    <span>Tax (10%)</span>
                    <span>€{tax.toLocaleString()}</span>
                  </div>
                  <div className="nrm-price-total">
                    <span>Total</span>
                    <span>€{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="nrm-step-content animate-in">
              <h3 className="nrm-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Review & Confirm
              </h3>

              <div className="nrm-confirm-card">
                {/* Guest */}
                <div className="nrm-confirm-section">
                  <div className="nrm-confirm-section-title">Guest</div>
                  <div className="nrm-confirm-row">
                    <span>Name</span>
                    <strong>{form.lastName}, {form.firstName}</strong>
                  </div>
                  {form.email && <div className="nrm-confirm-row"><span>Email</span><strong>{form.email}</strong></div>}
                  {form.phone && <div className="nrm-confirm-row"><span>Phone</span><strong>{form.phone}</strong></div>}
                  <div className="nrm-confirm-row"><span>Source</span><strong>{form.source}</strong></div>
                </div>

                <div className="nrm-confirm-divider" />

                {/* Stay */}
                <div className="nrm-confirm-section">
                  <div className="nrm-confirm-section-title">Stay</div>
                  <div className="nrm-confirm-row">
                    <span>Room</span>
                    <strong>{selectedRoom?.number} — {selectedRoom?.type}</strong>
                  </div>
                  <div className="nrm-confirm-row">
                    <span>Check-in</span>
                    <strong>{fromInputDate(form.checkIn).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</strong>
                  </div>
                  <div className="nrm-confirm-row">
                    <span>Check-out</span>
                    <strong>{fromInputDate(form.checkOut).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</strong>
                  </div>
                  <div className="nrm-confirm-row">
                    <span>Duration</span>
                    <strong>{nights} night{nights !== 1 ? 's' : ''}</strong>
                  </div>
                  <div className="nrm-confirm-row">
                    <span>Guests</span>
                    <strong>{form.adults} adult{form.adults !== 1 ? 's' : ''}{form.children > 0 ? `, ${form.children} child${form.children !== 1 ? 'ren' : ''}` : ''}</strong>
                  </div>
                  <div className="nrm-confirm-row">
                    <span>Meal Plan</span>
                    <strong>{MEAL_PLANS.find(m => m.id === form.mealPlan)?.label}</strong>
                  </div>
                </div>

                {form.notes && (
                  <>
                    <div className="nrm-confirm-divider" />
                    <div className="nrm-confirm-section">
                      <div className="nrm-confirm-section-title">Notes</div>
                      <p className="nrm-confirm-notes">{form.notes}</p>
                    </div>
                  </>
                )}

                <div className="nrm-confirm-divider" />

                {/* Pricing */}
                <div className="nrm-confirm-section">
                  <div className="nrm-confirm-section-title">Pricing</div>
                  <div className="nrm-confirm-row">
                    <span>Room rate</span>
                    <strong>€{(baseRate * nights).toLocaleString()}</strong>
                  </div>
                  {mealExtra > 0 && (
                    <div className="nrm-confirm-row">
                      <span>Meal plan</span>
                      <strong>€{(mealExtra * nights).toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="nrm-confirm-row">
                    <span>Tax (10%)</span>
                    <strong>€{tax.toLocaleString()}</strong>
                  </div>
                  <div className="nrm-confirm-total">
                    <span>Total</span>
                    <strong>€{grandTotal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="nrm-footer">
          <button
            className="nrm-btn-ghost"
            onClick={step === 0 ? onClose : prevStep}
            id="btn-nrm-back"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <div className="nrm-footer-right">
            {selectedRoom && nights > 0 && step < 3 && (
              <div className="nrm-footer-price">
                <span>€{grandTotal.toLocaleString()}</span>
                <span className="nrm-footer-nights">{nights}n · {selectedRoom.type}</span>
              </div>
            )}

            {step < 3 ? (
              <button className="nrm-btn-primary" onClick={nextStep} id="btn-nrm-next">
                Continue →
              </button>
            ) : (
              <button
                className={`nrm-btn-primary nrm-btn-confirm ${saving ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={saving}
                id="btn-nrm-confirm"
              >
                {saving ? (
                  <><span className="nrm-spinner" /> Saving…</>
                ) : (
                  <>{editBooking ? '✓ Update Reservation' : '✓ Confirm Reservation'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
