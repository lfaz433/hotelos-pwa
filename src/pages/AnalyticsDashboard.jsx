import React from 'react'
import { useHotel } from '../context/HotelContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { useNavigate } from 'react-router-dom'
import './AnalyticsDashboard.css'

export default function AnalyticsDashboard({ embedded }) {
  const { rooms, bookings, auditLogs } = useHotel()
  const navigate = useNavigate()

  // 1. Occupancy Metric
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length
  const totalRooms = rooms.length
  const occupancyRate = ((occupiedCount / totalRooms) * 100).toFixed(0)

  // 2. Revenue Metric (Mock live revenue based on active bookings)
  const activeBookings = bookings.filter(b => b.status === 'active')
  const liveRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  // 3. Housekeeping Performance Data
  // Average score per staff
  const staffStats = auditLogs.reduce((acc, log) => {
    if (!acc[log.staff]) {
      acc[log.staff] = { name: log.staff, totalScore: 0, count: 0 }
    }
    acc[log.staff].totalScore += log.score
    acc[log.staff].count += 1
    return acc
  }, {})

  const performanceData = Object.values(staffStats).map(s => ({
    name: s.name.split(' ')[0],
    Score: Math.round(s.totalScore / s.count)
  })).sort((a,b) => b.Score - a.Score)

  // 4. Booking Trends (Fake 7 day data for the line chart)
  const trendData = [
    { day: 'Mon', Bookings: 12 },
    { day: 'Tue', Bookings: 19 },
    { day: 'Wed', Bookings: 15 },
    { day: 'Thu', Bookings: 22 },
    { day: 'Fri', Bookings: 30 },
    { day: 'Sat', Bookings: 35 },
    { day: 'Sun', Bookings: 28 },
  ]

  return (
    <div className="adash-layout">
      {!embedded && (
        <header className="adash-header">
          <div className="adash-h-inner">
            <div className="adash-brand">
              <h1>📈 Analytics & Reports</h1>
            </div>
            <button className="adash-nav-back" onClick={() => navigate('/dashboard')}>← Back to Home</button>
          </div>
        </header>
      )}
      
      <main className="adash-main">
        {/* KPI Cards */}
        <div className="adash-kpi-grid">
          <div className="adash-kpi-card">
            <h3>Live Occupancy</h3>
            <div className="adash-kpi-val">{occupancyRate}%</div>
            <p>{occupiedCount} of {totalRooms} rooms occupied</p>
          </div>
          <div className="adash-kpi-card">
            <h3>Active Revenue</h3>
            <div className="adash-kpi-val">${liveRevenue.toLocaleString()}</div>
            <p>From {activeBookings.length} checked-in guests</p>
          </div>
          <div className="adash-kpi-card">
            <h3>Average Audit Score</h3>
            <div className="adash-kpi-val">
              {auditLogs.length ? Math.round(auditLogs.reduce((s, l) => s + l.score, 0) / auditLogs.length) : 0}%
            </div>
            <p>Based on {auditLogs.length} inspections</p>
          </div>
        </div>

        {/* Charts */}
        <div className="adash-charts-grid">
          <div className="adash-chart-card">
            <h3>7-Day Booking Trends</h3>
            <div style={{width: '100%', height: 300}}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{top: 20, right: 20, left: 0, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} />
                  <Line type="monotone" dataKey="Bookings" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="adash-chart-card">
            <h3>Housekeeping Performance (Avg Score)</h3>
            <div style={{width: '100%', height: 300}}>
              <ResponsiveContainer>
                <BarChart data={performanceData} margin={{top: 20, right: 20, left: 0, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} />
                  <Bar dataKey="Score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
