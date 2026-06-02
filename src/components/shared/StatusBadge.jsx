import { STATUS_LABELS } from '../../context/HotelContext'

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="dot" />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
