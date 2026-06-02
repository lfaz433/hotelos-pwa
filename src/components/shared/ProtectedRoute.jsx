import { Navigate, useLocation } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, activeStaff } = useHotel()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If specific roles are required, we could check here.
  // For the prototype, we simply enforce that a housekeeper shouldn't casually
  // end up on the manager dashboard, and vice-versa, though we won't strictly block it
  // unless we want to. Let's just return children.
  if (allowedRoles && activeStaff) {
    const userRole = (activeStaff.role || '').toLowerCase()
    const allowed = allowedRoles.map(r => r.toLowerCase())
    
    if (!allowed.includes(userRole)) {
      if (userRole === 'housekeeper') {
        return <Navigate to="/housekeeping" replace />
      } else if (userRole === 'reception') {
        return <Navigate to="/reception" replace />
      } else {
        return <Navigate to="/" replace />
      }
    }
  }

  return children
}
