import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HotelProvider } from './context/HotelContext'
import HousekeepingApp from './pages/HousekeepingApp'
import DashboardApp from './pages/DashboardApp'
import LandingPage from './pages/LandingPage'
import BookingPortal from './pages/BookingPortal'
import LoginPortal from './pages/LoginPortal'
import ReceptionDashboard from './pages/ReceptionDashboard'
import SupervisorDashboard from './pages/SupervisorDashboard'
import InventoryDashboard from './pages/InventoryDashboard'
import GuestPortal from './pages/GuestPortal'
import MaintenanceDashboard from './pages/MaintenanceDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import AdminSettings from './pages/AdminSettings'
import GlobalToast from './components/common/GlobalToast'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LockScreen from './components/shared/LockScreen'

export default function App() {
  return (
    <HotelProvider>
      <GlobalToast />
      <LockScreen />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/booking" element={<BookingPortal />} />
          <Route path="/guest" element={<GuestPortal />} />
          
          <Route path="/housekeeping/*" element={
            <ProtectedRoute allowedRoles={['housekeeper', 'manager']}>
              <HousekeepingApp />
            </ProtectedRoute>
          } />

          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={['reception', 'manager']}>
              <ReceptionDashboard />
            </ProtectedRoute>
          } />

          <Route path="/supervisor" element={
            <ProtectedRoute allowedRoles={['supervisor', 'manager']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['inventory', 'manager']}>
              <InventoryDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/*" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <DashboardApp />
            </ProtectedRoute>
          } />

          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={['maintenance', 'manager']}>
              <MaintenanceDashboard />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HotelProvider>
  )
}
