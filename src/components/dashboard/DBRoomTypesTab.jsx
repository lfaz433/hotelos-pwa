import { useState } from 'react'
import { useHotel } from '../../context/HotelContext'
import './DBRoomTypesTab.css'

const AMENITY_LIST = [
  { id: 'wifi', label: 'High-Speed WiFi', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"></path><path d="M1.42 9a16 16 0 0121.16 0"></path><path d="M8.53 16.11a6 6 0 016.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg> },
  { id: 'tv', label: 'Smart TV', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg> },
  { id: 'ac', label: 'Air Conditioning', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6"></path><path d="M8 12H2"></path><path d="M12 22v-6"></path><path d="M12 8V2"></path><path d="M19.07 4.93l-4.24 4.24"></path><path d="M9.17 14.83l-4.24 4.24"></path><path d="M19.07 19.07l-4.24-4.24"></path><path d="M9.17 9.17L4.93 4.93"></path></svg> },
  { id: 'minibar', label: 'Minibar', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"></path><path d="M12 18v4"></path><path d="M12 2v16"></path><path d="M5 10l7-8 7 8"></path></svg> },
  { id: 'roomService', label: '24/7 Room Service', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg> },
  { id: 'safe', label: 'In-Room Safe', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg> },
  { id: 'kitchen', label: 'Kitchenette', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14h20"></path><path d="M9 14v8"></path><path d="M15 14v8"></path><path d="M18 14l-2-9a2 2 0 00-1.97-1.56H7.97A2 2 0 006 5l-2 9"></path></svg> },
  { id: 'view', label: 'City View', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
  { id: 'balcony', label: 'Balcony', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
]

export default function DBRoomTypesTab() {
  const { roomTypes, saveRoomType, deleteRoomType } = useHotel()
  
  const [editingId, setEditingId] = useState(null)
  
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    capacity: '',
    desc: '',
    images: '',
    amenities: {}
  })

  function openEdit(typeId = null) {
    if (typeId) {
      const rt = roomTypes[typeId]
      setForm({
        id: rt.id,
        name: rt.name,
        price: rt.price,
        capacity: rt.capacity,
        desc: rt.desc,
        images: rt.images.join(', '),
        amenities: { ...rt.amenities }
      })
      setEditingId(typeId)
    } else {
      setForm({
        id: '', name: '', price: '', capacity: '', desc: '', images: '', amenities: {}
      })
      setEditingId('NEW')
    }
  }

  function handleSave(e) {
    e.preventDefault()
    
    if (!form.id || !form.name) {
      alert("ID and Name are required")
      return
    }

    const payload = {
      id: form.id,
      name: form.name,
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || 1,
      desc: form.desc,
      images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      amenities: { ...form.amenities }
    }
    
    saveRoomType(payload)
    setEditingId(null)
  }

  function toggleAmenity(id) {
    setForm(f => ({
      ...f,
      amenities: {
        ...f.amenities,
        [id]: !f.amenities[id]
      }
    }))
  }

  return (
    <div className="db-room-types">
      <div className="db-card-header" style={{ padding: '0 0 24px 0', border: 'none' }}>
        <div>
          <h2 className="db-section-title" style={{ margin: 0 }}>Room Types</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Manage your property's room categories, pricing, descriptions, and amenities.
          </p>
        </div>
        <button className="db-btn-primary" onClick={() => openEdit()}>+ New Room Type</button>
      </div>

      <div className="db-rt-grid">
        {Object.values(roomTypes).map(rt => (
          <div key={rt.id} className="db-card db-rt-card">
            <div className="db-rt-img" style={{ backgroundImage: `url(${rt.images[0] || ''})` }}>
              <div className="db-rt-price">€{rt.price}<span>/night</span></div>
            </div>
            <div className="db-rt-info">
              <h3>{rt.name}</h3>
              <p className="db-rt-desc">{rt.desc}</p>
              
              <div className="db-rt-meta">
                <span>👥 Up to {rt.capacity} guests</span>
                <span>📸 {rt.images.length} photos</span>
              </div>
              
              <div className="db-rt-amenities-mini">
                {AMENITY_LIST.filter(a => rt.amenities[a.id]).map(a => (
                  <span key={a.id} title={a.label}>{a.icon}</span>
                ))}
              </div>

              <div className="db-rt-actions">
                <button className="db-btn-ghost" onClick={() => openEdit(rt.id)}>Edit</button>
                <button className="db-btn-ghost danger-btn" onClick={() => deleteRoomType(rt.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="db-modal-overlay" onClick={() => setEditingId(null)}>
          <div className="db-modal db-rt-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{editingId === 'NEW' ? 'Create Room Type' : 'Edit Room Type'}</h3>
              <button className="db-modal-x" onClick={() => setEditingId(null)}>✕</button>
            </div>
            <div className="db-modal-body db-rt-form">
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Type ID (Internal) *</label>
                  <input type="text" value={form.id} onChange={e => setForm(f => ({...f, id: e.target.value}))} disabled={editingId !== 'NEW'} placeholder="e.g. Standard" />
                </div>
                <div className="db-form-group">
                  <label>Display Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Standard Room" />
                </div>
              </div>
              
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Base Price (€) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
                </div>
                <div className="db-form-group">
                  <label>Max Capacity *</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} />
                </div>
              </div>

              <div className="db-form-group">
                <label>Description</label>
                <textarea rows="3" value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} placeholder="Describe the room experience..."></textarea>
              </div>

              <div className="db-form-group">
                <label>Image URLs (comma separated)</label>
                <textarea rows="2" value={form.images} onChange={e => setForm(f => ({...f, images: e.target.value}))} placeholder="https://image1.jpg, https://image2.jpg"></textarea>
                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Provide direct URLs to images to build the gallery.</small>
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '15px' }}>Room Amenities & Equipment</h4>
              <div className="db-amenity-grid">
                {AMENITY_LIST.map(amenity => (
                  <label key={amenity.id} className={`db-amenity-toggle ${form.amenities[amenity.id] ? 'active' : ''}`}>
                    <div className="db-amenity-info">
                      <span className="db-amenity-icon">{amenity.icon}</span>
                      <span className="db-amenity-label">{amenity.label}</span>
                    </div>
                    <div className="db-toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={!!form.amenities[amenity.id]} 
                        onChange={() => toggleAmenity(amenity.id)} 
                      />
                      <span className="db-toggle-slider"></span>
                    </div>
                  </label>
                ))}
              </div>

            </div>
            <div className="db-modal-footer">
              <button className="db-btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="db-btn-primary" onClick={handleSave}>Save Room Type</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
