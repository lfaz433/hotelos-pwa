import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotel, timeAgo } from '../context/HotelContext'
import './MaintenanceDashboard.css'

export default function MaintenanceDashboard() {
  const { maintenanceTickets, updateTicketStatus, addToast } = useHotel()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const handleStatusChange = (ticketId, newStatus) => {
    updateTicketStatus(ticketId, newStatus)
    addToast(`Ticket marked as ${newStatus}`)
  }

  const filteredTickets = maintenanceTickets.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const getPriorityColor = (p) => {
    return p === 'high' ? '#ef4444' : '#f59e0b'
  }

  const Column = ({ title, status, tickets }) => (
    <div className="mdash-col">
      <div className="mdash-col-header">
        <h3>{title}</h3>
        <span className="mdash-badge">{tickets.length}</span>
      </div>
      <div className="mdash-ticket-list">
        {tickets.length === 0 && <p className="mdash-empty">No tickets</p>}
        {tickets.map(t => (
          <div key={t.id} className="mdash-ticket" style={{borderLeftColor: getPriorityColor(t.priority)}}>
            <div className="mdash-t-head">
              <strong>Room {t.roomNumber}</strong>
              <span className="mdash-time">{timeAgo(t.createdAt)}</span>
            </div>
            <p className="mdash-t-issue">{t.issue}</p>
            <div className="mdash-t-meta">
              <span>Reported by {t.reportedBy}</span>
              <span className={`mdash-priority ${t.priority}`}>{t.priority}</span>
            </div>
            <div className="mdash-t-actions">
              {status === 'open' && (
                <button onClick={() => handleStatusChange(t.id, 'in-progress')} className="mdash-btn active">Start Work</button>
              )}
              {status === 'in-progress' && (
                <button onClick={() => handleStatusChange(t.id, 'resolved')} className="mdash-btn success">Mark Resolved</button>
              )}
              {status === 'resolved' && (
                <button onClick={() => handleStatusChange(t.id, 'open')} className="mdash-btn text">Reopen</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="mdash-layout">
      <header className="mdash-header">
        <div className="mdash-h-inner">
          <div className="mdash-brand">
            <h1>🛠️ Maintenance & Engineering</h1>
          </div>
          <button className="mdash-nav-back" onClick={() => navigate('/dashboard')}>← Back to Home</button>
        </div>
      </header>
      
      <main className="mdash-main">
        <div className="mdash-controls">
          <div className="mdash-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'open' ? 'active' : ''} onClick={() => setFilter('open')}>Open</button>
            <button className={filter === 'in-progress' ? 'active' : ''} onClick={() => setFilter('in-progress')}>In Progress</button>
            <button className={filter === 'resolved' ? 'active' : ''} onClick={() => setFilter('resolved')}>Resolved</button>
          </div>
        </div>

        <div className="mdash-board">
          {(filter === 'all' || filter === 'open') && 
            <Column title="Open" status="open" tickets={filteredTickets.filter(t => t.status === 'open')} />
          }
          {(filter === 'all' || filter === 'in-progress') && 
            <Column title="In Progress" status="in-progress" tickets={filteredTickets.filter(t => t.status === 'in-progress')} />
          }
          {(filter === 'all' || filter === 'resolved') && 
            <Column title="Resolved" status="resolved" tickets={filteredTickets.filter(t => t.status === 'resolved')} />
          }
        </div>
      </main>
    </div>
  )
}
