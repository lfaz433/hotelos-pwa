import './Toast.css'

export default function Toast({ message, type = 'success' }) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {type === 'success' && '✓ '}
        {type === 'error' && '✕ '}
        {message}
      </div>
    </div>
  )
}
