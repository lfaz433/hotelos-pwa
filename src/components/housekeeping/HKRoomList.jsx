import HKRoomCard from './HKRoomCard'
import './HKRoomList.css'

export default function HKRoomList({ rooms, onStatusUpdate }) {
  if (rooms.length === 0) {
    return (
      <div className="hk-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <p>No rooms match your filter</p>
        <span>Try adjusting the status filter above</span>
      </div>
    )
  }

  // Group by floor
  const byFloor = rooms.reduce((acc, r) => {
    const key = `Floor ${r.floor}`
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div className="hk-room-list">
      {Object.entries(byFloor).map(([floor, floorRooms]) => (
        <section key={floor} className="hk-floor-section">
          <div className="hk-floor-header">
            <span className="hk-floor-label">{floor}</span>
            <span className="hk-floor-count">{floorRooms.length} rooms</span>
          </div>
          <div className="hk-floor-rooms">
            {floorRooms.map(room => (
              <HKRoomCard
                key={room.id}
                room={room}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </section>
      ))}
      <div className="hk-list-bottom-pad" />
    </div>
  )
}
