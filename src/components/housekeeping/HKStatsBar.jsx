import { useHotel, STATUS_LABELS } from '../../context/HotelContext'
import './HKStatsBar.css'

export default function HKStatsBar({ rooms }) {
  const counts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const stats = [
    { key: 'dirty',    label: 'Dirty',    color: '#c0392b' },
    { key: 'cleaning', label: 'Cleaning', color: '#d68910' },
    { key: 'ready',    label: 'Ready',    color: '#0071c2' },
    { key: 'available',label: 'Clean',    color: '#1a7f4b' },
  ]

  return (
    <div className="hk-stats">
      {stats.map(s => (
        <div key={s.key} className="hk-stat" style={{ '--stat-color': s.color }}>
          <span className="hk-stat__num">{counts[s.key] || 0}</span>
          <span className="hk-stat__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
