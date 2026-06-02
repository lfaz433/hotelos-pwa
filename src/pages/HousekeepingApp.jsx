import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import HKHeader from '../components/housekeeping/HKHeader'
import HKRoomList from '../components/housekeeping/HKRoomList'
import HKBottomNav from '../components/housekeeping/HKBottomNav'
import HKStatsBar from '../components/housekeeping/HKStatsBar'
import Toast from '../components/shared/Toast'
import './HousekeepingApp.css'

export default function HousekeepingApp() {
  const { rooms, activeStaff } = useHotel()
  const [activeTab, setActiveTab] = useState('myrooms')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const myRooms = rooms.filter(r =>
    activeTab === 'myrooms'
      ? (r.assignedTo && r.assignedTo.includes(activeStaff?.name?.split(' ')[0] || '')) ||
        r.status === 'dirty' || r.status === 'cleaning'
      : true
  )

  const filteredRooms = myRooms.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchSearch = !searchQuery ||
      r.number.includes(searchQuery) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const location = useLocation()
  const isMainRoomsPage = location.pathname === '/housekeeping'

  return (
    <div className="hk-app">
      <HKHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {isMainRoomsPage && <HKStatsBar rooms={rooms} />}

      <div className="hk-main-content" style={{ flex: 1, paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={
            <>
              <div className="hk-filter-tabs">
                {[
                  { key: 'myrooms', label: 'My Rooms' },
                  { key: 'all', label: 'All Floors' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`hk-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    id={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="hk-filter-scroll">
                  {['all', 'dirty', 'cleaning', 'ready', 'available', 'occupied'].map(s => (
                    <button
                      key={s}
                      className={`hk-chip ${filterStatus === s ? 'active' : ''}`}
                      onClick={() => setFilterStatus(s)}
                      id={`filter-${s}`}
                    >
                      {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <HKRoomList
                rooms={filteredRooms}
                onStatusUpdate={showToast}
              />
            </>
          } />
          
          <Route path="/checklist" element={
            <div className="hk-empty-state animate-fade-in-up">
              <div className="hk-empty-icon">📋</div>
              <h2>Checklist Templates</h2>
              <p>View and manage your standard room audit templates.</p>
            </div>
          } />
          
          <Route path="/issues" element={
            <div className="hk-empty-state animate-fade-in-up">
              <div className="hk-empty-icon">🔧</div>
              <h2>Maintenance Issues</h2>
              <p>Active maintenance and low-stock reports will appear here.</p>
            </div>
          } />
          
          <Route path="/profile" element={
            <div className="hk-empty-state animate-fade-in-up">
              <div className="hk-empty-icon">👤</div>
              <h2>Staff Profile</h2>
              <p>View your performance stats and schedule.</p>
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/housekeeping" replace />} />
        </Routes>
      </div>

      <HKBottomNav />

      {toast && (
        <Toast message={toast.msg} type={toast.type} key={toast.id} />
      )}
    </div>
  )
}
