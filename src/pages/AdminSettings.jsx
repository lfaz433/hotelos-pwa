import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import './AdminSettings.css'

export default function AdminSettings() {
  const { staff, addStaff, removeStaff, settings, updateSettings, roomTypes, saveRoomType, addToast } = useHotel()
  const navigate = useNavigate()
  
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Housekeeper' })
  const [editingPricing, setEditingPricing] = useState(false)
  const [localRoomTypes, setLocalRoomTypes] = useState(roomTypes)

  const handleAddStaff = (e) => {
    e.preventDefault()
    if (!newStaff.name) return
    const avatar = newStaff.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
    addStaff({ ...newStaff, avatar, floor: newStaff.role === 'Housekeeper' ? 1 : null })
    setNewStaff({ name: '', role: 'Housekeeper' })
    addToast('Staff member added')
  }

  const handleRemoveStaff = (id) => {
    if(window.confirm('Remove this staff member?')) {
      removeStaff(id)
      addToast('Staff member removed')
    }
  }

  const handlePricingChange = (id, newPrice) => {
    setLocalRoomTypes(prev => ({
      ...prev,
      [id]: { ...prev[id], price: Number(newPrice) }
    }))
  }

  const savePricing = () => {
    Object.values(localRoomTypes).forEach(rt => saveRoomType(rt))
    setEditingPricing(false)
    addToast('Room pricing updated')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-h-inner">
          <div className="admin-brand">
            <h1>⚙️ Admin Settings</h1>
          </div>
          <button className="admin-nav-back" onClick={() => navigate('/dashboard')}>← Back to Home</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-grid">
          
          {/* Staff Management */}
          <section className="admin-card">
            <h2>Staff Management</h2>
            <form onSubmit={handleAddStaff} className="admin-add-staff">
              <input 
                type="text" 
                placeholder="Staff Name" 
                value={newStaff.name} 
                onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} 
                required
              />
              <select 
                value={newStaff.role} 
                onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="Housekeeper">Housekeeper</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Reception">Reception</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Manager">Manager</option>
              </select>
              <button type="submit">Add Staff</button>
            </form>
            
            <div className="admin-list">
              {staff.map(s => (
                <div key={s.id} className="admin-list-item">
                  <div className="admin-staff-info">
                    <span className="admin-avatar">{s.avatar}</span>
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.role}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveStaff(s.id)} className="admin-btn-delete">Remove</button>
                </div>
              ))}
            </div>
          </section>

          <div className="admin-col">
            {/* Room Pricing */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Room Pricing</h2>
                {!editingPricing ? (
                  <button className="admin-btn-edit" onClick={() => setEditingPricing(true)}>Edit Pricing</button>
                ) : (
                  <button className="admin-btn-save" onClick={savePricing}>Save Changes</button>
                )}
              </div>
              
              <div className="admin-pricing-list">
                {Object.values(localRoomTypes).map(rt => (
                  <div key={rt.id} className="admin-pricing-item">
                    <span>{rt.name}</span>
                    {editingPricing ? (
                      <input 
                        type="number" 
                        value={rt.price} 
                        onChange={(e) => handlePricingChange(rt.id, e.target.value)}
                      />
                    ) : (
                      <strong>${rt.price} / night</strong>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Global Settings */}
            <section className="admin-card">
              <h2>Global Settings</h2>
              <div className="admin-setting-item">
                <div>
                  <strong>Instant Confirmation</strong>
                  <p>Automatically approve new web bookings</p>
                </div>
                <label className="admin-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.instantConfirmation} 
                    onChange={e => updateSettings({ instantConfirmation: e.target.checked })}
                  />
                  <span className="admin-slider"></span>
                </label>
              </div>
              <div className="admin-setting-item">
                <div>
                  <strong>System Theme</strong>
                  <p>Global visual mode</p>
                </div>
                <select 
                  value={settings.theme} 
                  onChange={e => updateSettings({ theme: e.target.value })}
                  style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  )
}
