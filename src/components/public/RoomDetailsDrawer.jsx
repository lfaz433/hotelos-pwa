import { useState } from 'react'
import './RoomDetailsDrawer.css'

const AMENITY_LIST = [
  { id: 'wifi', label: 'Gigabit WiFi', icon: '🚀' },
  { id: 'tv', label: '85" 8K Smart TV', icon: '📺' },
  { id: 'ac', label: 'Climate Control', icon: '❄️' },
  { id: 'minibar', label: 'Premium Minibar', icon: '🍾' },
  { id: 'roomService', label: '24/7 Butler Service', icon: '🛎️' },
  { id: 'safe', label: 'Biometric Safe', icon: '🔒' },
  { id: 'kitchen', label: 'Gourmet Kitchenette', icon: '👨‍🍳' },
  { id: 'view', label: 'Panoramic City View', icon: '🏙️' },
  { id: 'balcony', label: 'Private Terrace', icon: '🌅' },
  { id: 'lelabo', label: 'Le Labo Toiletries', icon: '🧴' },
  { id: 'nespresso', label: 'Nespresso Vertuo', icon: '☕' },
  { id: 'pillow', label: 'Custom Pillow Menu', icon: '🛏️' },
]

export default function RoomDetailsModal({ room, onClose, onBook }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const hasImages = room.images && room.images.length > 0
  const images = hasImages ? room.images : ['https://via.placeholder.com/800x500?text=No+Image+Available']
  
  // Mock some premium amenities even if the room doesn't explicitly have them defined
  const premiumAmenities = AMENITY_LIST.slice(0, 6)

  // Masonry images mock (repeat some to fill the grid if few)
  const gallery = [...images, ...images, ...images].slice(0, 5)

  return (
    <div className="rd-drawer-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rd-drawer animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="rd-drawer-header">
          <div className="rd-drawer-title">
            <h2>{room.name}</h2>
            <div className="rd-price-block">
              <span className="rd-price">€{room.price}</span>
              <span className="rd-night">/ night</span>
            </div>
          </div>
          <button className="rd-close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="rd-drawer-body">
          {/* Masonry Image Gallery */}
          <div className="rd-masonry-gallery">
            <div className="rd-gallery-main" style={{ backgroundImage: `url(${gallery[0]})` }}></div>
            <div className="rd-gallery-side">
              <div className="rd-gallery-img" style={{ backgroundImage: `url(${gallery[1]})` }}></div>
              <div className="rd-gallery-img" style={{ backgroundImage: `url(${gallery[2]})` }}></div>
              <div className="rd-gallery-img" style={{ backgroundImage: `url(${gallery[3]})` }}></div>
              <div className="rd-gallery-img" style={{ backgroundImage: `url(${gallery[4]})` }}></div>
            </div>
          </div>
          
          <div className="rd-content-grid">
            {/* Left Column: Details */}
            <div className="rd-main-details">
              <div className="rd-meta-pills">
                <span className="rd-pill">👥 Up to {room.capacity} Guests</span>
                <span className="rd-pill">📏 120 sq.m.</span>
                <span className="rd-pill">🌅 Ocean View</span>
              </div>
              
              <div className="rd-section">
                <h3>The Experience</h3>
                <p className="rd-desc">{room.desc} Experience the height of luxury with panoramic views, bespoke furnishings, and 24-hour dedicated butler service. Every detail has been meticulously curated to ensure an unforgettable stay.</p>
              </div>
              
              <div className="rd-section">
                <h3>Premium Amenities</h3>
                <div className="rd-amenities-grid">
                  {premiumAmenities.map(a => (
                    <div key={a.id} className="rd-amenity">
                      <span className="rd-amenity-icon">{a.icon}</span>
                      <span className="rd-amenity-label">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column: 360 Tour & Action */}
            <div className="rd-sidebar">
              <div className="rd-virtual-tour">
                <div className="rd-tour-placeholder" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${gallery[0]})` }}>
                  <div className="rd-tour-play">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span>Launch 360° Virtual Tour</span>
                </div>
              </div>
              
              <div className="rd-action-card">
                <h3>Ready to book?</h3>
                <p>Secure this suite for your selected dates.</p>
                <button className="rd-btn-book-large" onClick={onBook}>
                  Select & Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
