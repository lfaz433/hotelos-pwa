import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import SkeletonLoader from '../components/shared/SkeletonLoader'
import DBNavBar from '../components/dashboard/DBNavBar'
import DBOverviewTab from '../components/dashboard/DBOverviewTab'
import DBReservationsTab from '../components/dashboard/DBReservationsTab'
import DBTemplateManager from '../components/dashboard/DBTemplateManager'
import DBRoomTypesTab from '../components/dashboard/DBRoomTypesTab'
import DBActivityFeed from '../components/dashboard/DBActivityFeed'
import SupervisorDashboard from './SupervisorDashboard'
import InventoryDashboard from './InventoryDashboard'
import AnalyticsDashboard from './AnalyticsDashboard'
import AdminSettings from './AdminSettings'
import ReceptionDashboard from './ReceptionDashboard'
import './DashboardApp.css'

const TABS = ['overview', 'reservations', 'analytics', 'settings']

export default function DashboardApp() {
  const { activeStaff } = useHotel()
  const isReception = activeStaff?.role === 'reception'
  const [activeTab, setActiveTab] = useState(isReception ? 'frontdesk' : 'overview')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Faux initial data load
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="db-app">
      <DBNavBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="db-layout animate-in">
        <main className="db-main">
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SkeletonLoader variant="card" height="150px" />
              <div style={{ display: 'flex', gap: '20px' }}>
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="card" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview'      && <DBOverviewTab />}
              {activeTab === 'frontdesk'     && <ReceptionDashboard embedded />}
              {activeTab === 'reservations'  && <DBReservationsTab />}
              {activeTab === 'analytics'     && <AnalyticsDashboard embedded />}
              {activeTab === 'housekeeping'  && <SupervisorDashboard embedded />}
              {activeTab === 'inventory'     && <InventoryDashboard embedded />}
              {activeTab === 'templates'     && <DBTemplateManager />}
              {activeTab === 'room_types'    && <DBRoomTypesTab />}
              {activeTab === 'settings'      && <AdminSettings embedded />}
            </>
          )}
        </main>
        <aside className="db-sidebar">
          {isLoading ? (
            <SkeletonLoader variant="list" />
          ) : (
            <DBActivityFeed />
          )}
        </aside>
      </div>

      <div className="db-mobile-hint">
        <span className="db-mobile-text">
          Manager dashboard is optimized for desktop viewing.
        </span>
      </div>
    </div>
  )
}
