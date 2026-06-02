import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SkeletonLoader from '../components/shared/SkeletonLoader'
import DBNavBar from '../components/dashboard/DBNavBar'
import DBOverviewTab from '../components/dashboard/DBOverviewTab'
import DBReservationsTab from '../components/dashboard/DBReservationsTab'
import DBAnalyticsTab from '../components/dashboard/DBAnalyticsTab'
import DBActivityFeed from '../components/dashboard/DBActivityFeed'
import DBTemplateManager from '../components/dashboard/DBTemplateManager'
import DBSettingsTab from '../components/dashboard/DBSettingsTab'
import DBRoomTypesTab from '../components/dashboard/DBRoomTypesTab'
import './DashboardApp.css'

const TABS = ['overview', 'reservations', 'analytics', 'settings']

export default function DashboardApp() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Faux initial data load
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleTabChange = (tab) => {
    if (tab === 'housekeeping') window.location.href = '/supervisor'
    else if (tab === 'inventory') window.location.href = '/inventory'
    else if (tab === 'analytics') window.location.href = '/analytics'
    else if (tab === 'settings') window.location.href = '/admin'
    else setActiveTab(tab)
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
              {activeTab === 'reservations'  && <DBReservationsTab />}
              {activeTab === 'analytics'     && <DBAnalyticsTab />}
              {activeTab === 'templates'     && <DBTemplateManager />}
              {activeTab === 'room_types'    && <DBRoomTypesTab />}
              {activeTab === 'settings'      && <DBSettingsTab />}
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
