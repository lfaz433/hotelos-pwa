import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HotelProvider } from './context/HotelContext'
import HousekeepingApp from './pages/HousekeepingApp'
import DashboardApp from './pages/DashboardApp'
import LandingPage from './pages/LandingPage'
import BookingPortal from './pages/BookingPortal'
import LoginPortal from './pages/LoginPortal'
import GuestPortal from './pages/GuestPortal'
import MaintenanceDashboard from './pages/MaintenanceDashboard'
import GlobalToast from './components/common/GlobalToast'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LockScreen from './components/shared/LockScreen'

// MVP Roles: manager, reception, housekeeper, maintenance, guest
// Removed for MVP (moved into Manager Dashboard tabs): supervisor, inventory

export default function App() {
  return (
    <HotelProvider>
      <GlobalToast />
      <LockScreen />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/booking" element={<BookingPortal />} />
          <Route path="/guest" element={<GuestPortal />} />

          {/* Housekeeping — mobile PWA */}
          <Route path="/housekeeping/*" element={
            <ProtectedRoute allowedRoles={['housekeeper', 'manager']}>
              <HousekeepingApp />
            </ProtectedRoute>
          } />

          {/* Maintenance — ticket kanban */}
          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={['maintenance', 'manager']}>
              <MaintenanceDashboard />
            </ProtectedRoute>
          } />

          {/* Manager + Reception — unified dashboard */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute allowedRoles={['manager', 'reception']}>
              <DashboardApp />
            </ProtectedRoute>
          } />

          {/* Redirect legacy/removed routes to dashboard */}
          <Route path="/reception"   element={<Navigate to="/dashboard" replace />} />
          <Route path="/supervisor"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/inventory"   element={<Navigate to="/dashboard" replace />} />
          <Route path="/analytics"   element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin"       element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HotelProvider>
  )
}
