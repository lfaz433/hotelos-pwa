import { useHotel } from '../../context/HotelContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import './DBAnalyticsTab.css'

function MiniBar({ value, max, color = '#0071c2', label }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="mini-bar-row">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mini-bar-val">{value}</span>
    </div>
  )
}

export default function DBAnalyticsTab() {
  const { rooms, bookings } = useHotel()

  // Occupancy per floor
  const floors = [...new Set(rooms.map(r => r.floor))].sort()
  const occupancyByFloor = floors.map(f => {
    const floorRooms = rooms.filter(r => r.floor === f)
    const occupied = floorRooms.filter(r => r.status === 'occupied').length
    return { floor: f, total: floorRooms.length, occupied, pct: Math.round((occupied / floorRooms.length) * 100) }
  })

  // Room type breakdown
  const typeMap = {}
  rooms.forEach(r => {
    typeMap[r.type] = (typeMap[r.type] || 0) + 1
  })
  const maxType = Math.max(...Object.values(typeMap))

  // Status counts
  const statusCounts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  // Simulated weekly revenue data for AreaChart
  const revenueData = [
    { day: 'Mon', revenue: 14200 },
    { day: 'Tue', revenue: 16800 },
    { day: 'Wed', revenue: 15400 },
    { day: 'Thu', revenue: 19200 },
    { day: 'Fri', revenue: 22100 },
    { day: 'Sat', revenue: 18700 },
    { day: 'Sun', revenue: 21300 },
  ]

  // Booking source breakdown
  const sourceData = [
    { name: 'Direct', value: 38, color: '#0071c2' },
    { name: 'Booking.com', value: 31, color: '#003580' },
    { name: 'Expedia', value: 17, color: '#d68910' },
    { name: 'Other OTAs', value: 14, color: '#7d3c98' },
  ]

  return (
    <div className="db-analytics">
      {/* Summary KPI row */}
      <div className="db-analytics-kpis">
        {[
          { label: 'Avg Daily Rate', value: '€142', sub: '+8% vs last week', color: '#0071c2' },
          { label: 'RevPAR', value: '€108', sub: 'Revenue per avail. room', color: '#1a7f4b' },
          { label: 'Total Bookings', value: bookings.length, sub: 'All time', color: '#7d3c98' },
          { label: 'Avg Stay Length', value: '2.4 nights', sub: 'Last 30 days', color: '#d68910' },
        ].map((kpi, i) => (
          <div key={i} className="db-analytics-kpi db-card" id={`analytics-kpi-${i}`}>
            <div className="db-analytics-kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="db-analytics-kpi-label">{kpi.label}</div>
            <div className="db-analytics-kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="db-analytics-row">
        {/* Weekly Revenue Chart using Recharts */}
        <div className="db-card db-revenue-card" style={{ flex: 2 }}>
          <div className="db-card-header">
            <span className="db-card-title">Weekly Revenue Trend</span>
            <span className="db-card-subtitle">This week</span>
          </div>
          <div className="db-card-body" style={{ height: '300px', paddingTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071c2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0071c2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} tickFormatter={(val) => `€${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: '#0071c2', fontWeight: 'bold' }}
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0071c2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Sources using Recharts */}
        <div className="db-card" style={{ flex: 1 }}>
          <div className="db-card-header">
            <span className="db-card-title">Booking Sources</span>
          </div>
          <div className="db-card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Occupancy by Floor */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Occupancy by Floor</span>
        </div>
        <div className="db-card-body">
          {occupancyByFloor.map(f => (
            <MiniBar
              key={f.floor}
              label={`Floor ${f.floor}`}
              value={f.occupied}
              max={f.total}
              color={f.pct > 70 ? '#1a7f4b' : f.pct > 40 ? '#d68910' : '#c0392b'}
            />
          ))}
        </div>
      </div>

      {/* Room type mix */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Room Type Mix</span>
        </div>
        <div className="db-card-body">
          {Object.entries(typeMap).map(([type, count]) => (
            <MiniBar key={type} label={type} value={count} max={maxType} color="#0071c2" />
          ))}
        </div>
      </div>
    </div>
  )
}
