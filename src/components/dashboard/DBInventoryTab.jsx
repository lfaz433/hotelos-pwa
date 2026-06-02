import { useState, useMemo } from 'react'
import { useHotel, formatTime } from '../../context/HotelContext'
import './DBInventoryTab.css'

const CATEGORIES = ['All', 'Toiletries', 'Linens', 'F&B', 'Consumables', 'Supplies']

function StockBar({ qty, threshold, max }) {
  const pct = Math.min(100, max > 0 ? (qty / max) * 100 : 0)
  const isLow = qty < threshold
  const isCritical = qty < threshold * 0.5
  const color = isCritical ? '#c0392b' : isLow ? '#d68910' : '#1a7f4b'
  return (
    <div className="inv-bar-track" title={`${qty} remaining (threshold: ${threshold})`}>
      <div className="inv-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function AuditScoreBadge({ score }) {
  const color = score === 100 ? '#1a7f4b' : score >= 80 ? '#d68910' : '#c0392b'
  const bg = score === 100 ? '#e6f5ed' : score >= 80 ? '#fef9e7' : '#fdecea'
  return (
    <span className="audit-score-badge" style={{ color, background: bg }}>
      {score}%
    </span>
  )
}

export default function DBInventoryTab() {
  const { inventory, auditLogs, maintenanceTickets, restockItem, updateTicketStatus } = useHotel()
  const [activeSection, setActiveSection] = useState('inventory')
  const [category, setCategory] = useState('All')
  const [restockModal, setRestockModal] = useState(null)
  const [restockQty, setRestockQty] = useState(50)
  const [ticketFilter, setTicketFilter] = useState('open')

  const maxQty = useMemo(() => Math.max(...inventory.map(i => i.qty + i.threshold * 2), 1), [inventory])

  const filteredInventory = category === 'All'
    ? inventory
    : inventory.filter(i => i.category === category)

  const lowStockItems = inventory.filter(i => i.qty < i.threshold)
  const criticalItems = inventory.filter(i => i.qty < i.threshold * 0.5)

  const filteredTickets = maintenanceTickets.filter(t =>
    ticketFilter === 'all' || t.status === ticketFilter
  )

  const handleRestock = () => {
    if (restockModal && restockQty > 0) {
      restockItem(restockModal.id, restockQty)
      setRestockModal(null)
      setRestockQty(50)
    }
  }

  return (
    <div className="db-inv-tab">

      {/* ── Alert Banner ── */}
      {criticalItems.length > 0 && (
        <div className="inv-alert-banner critical" id="inv-alert-critical">
          <span className="inv-alert-icon">🚨</span>
          <div className="inv-alert-body">
            <strong>Critical Stock Alert</strong>
            <span>{criticalItems.map(i => i.name).join(', ')} — reorder immediately</span>
          </div>
        </div>
      )}
      {criticalItems.length === 0 && lowStockItems.length > 0 && (
        <div className="inv-alert-banner warning" id="inv-alert-warning">
          <span className="inv-alert-icon">⚠️</span>
          <div className="inv-alert-body">
            <strong>{lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below threshold</strong>
            <span>{lowStockItems.map(i => i.name).join(', ')}</span>
          </div>
        </div>
      )}

      {/* ── KPI Summary ── */}
      <div className="inv-kpi-row">
        <div className="inv-kpi-card" id="kpi-total-items">
          <div className="inv-kpi-icon" style={{ background: '#e8f0fb', color: '#0071c2' }}>📦</div>
          <div>
            <div className="inv-kpi-val">{inventory.length}</div>
            <div className="inv-kpi-label">Stock Items</div>
          </div>
        </div>
        <div className="inv-kpi-card" id="kpi-low-stock">
          <div className="inv-kpi-icon" style={{ background: '#fef9e7', color: '#d68910' }}>⚠️</div>
          <div>
            <div className="inv-kpi-val" style={{ color: lowStockItems.length > 0 ? '#d68910' : 'inherit' }}>
              {lowStockItems.length}
            </div>
            <div className="inv-kpi-label">Low Stock</div>
          </div>
        </div>
        <div className="inv-kpi-card" id="kpi-audits-today">
          <div className="inv-kpi-icon" style={{ background: '#e6f5ed', color: '#1a7f4b' }}>✅</div>
          <div>
            <div className="inv-kpi-val">{auditLogs.length}</div>
            <div className="inv-kpi-label">Audits Done</div>
          </div>
        </div>
        <div className="inv-kpi-card" id="kpi-open-tickets">
          <div className="inv-kpi-icon" style={{ background: '#fdecea', color: '#c0392b' }}>🔧</div>
          <div>
            <div className="inv-kpi-val" style={{ color: maintenanceTickets.filter(t => t.status === 'open').length > 0 ? '#c0392b' : 'inherit' }}>
              {maintenanceTickets.filter(t => t.status === 'open').length}
            </div>
            <div className="inv-kpi-label">Open Tickets</div>
          </div>
        </div>
      </div>

      {/* ── Section Nav ── */}
      <div className="inv-section-nav db-card">
        {[
          { key: 'inventory', label: '📦 Stock Levels' },
          { key: 'audit',     label: '📋 Audit Logs' },
          { key: 'maintenance', label: '🔧 Maintenance' },
        ].map(s => (
          <button
            key={s.key}
            className={`inv-nav-btn ${activeSection === s.key ? 'active' : ''}`}
            onClick={() => setActiveSection(s.key)}
            id={`inv-nav-${s.key}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ══ INVENTORY SECTION ══ */}
      {activeSection === 'inventory' && (
        <div className="db-card inv-stock-card" id="inventory-stock-table">
          <div className="db-card-header">
            <span className="db-card-title">Stock Levels</span>
            <div className="inv-cat-filter">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`inv-cat-chip ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                  id={`cat-${c.toLowerCase().replace(/&/g,'')}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Level</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const isLow = item.qty < item.threshold
                  const isCritical = item.qty < item.threshold * 0.5
                  return (
                    <tr
                      key={item.id}
                      className={`inv-row ${isCritical ? 'critical' : isLow ? 'low' : ''}`}
                      id={`inv-row-${item.id}`}
                    >
                      <td>
                        <div className="inv-item-name">
                          <span className="inv-item-icon">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inv-category-badge">{item.category}</span>
                      </td>
                      <td>
                        <span className={`inv-qty-val ${isCritical ? 'critical' : isLow ? 'low' : ''}`}>
                          {item.qty}
                        </span>
                        <span className="inv-unit"> {item.unit}</span>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <StockBar qty={item.qty} threshold={item.threshold} max={maxQty} />
                      </td>
                      <td className="inv-threshold">{item.threshold} {item.unit}</td>
                      <td>
                        {isCritical ? (
                          <span className="inv-status-badge critical">🚨 Critical</span>
                        ) : isLow ? (
                          <span className="inv-status-badge low">⚠ Low</span>
                        ) : (
                          <span className="inv-status-badge ok">✓ OK</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="inv-restock-btn"
                          onClick={() => setRestockModal(item)}
                          id={`btn-restock-${item.id}`}
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ AUDIT LOGS SECTION ══ */}
      {activeSection === 'audit' && (
        <div className="db-card" id="audit-logs-section">
          <div className="db-card-header">
            <span className="db-card-title">Audit Logs</span>
            <span className="db-card-subtitle">{auditLogs.length} total audits</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="inv-empty-state">
              <span style={{ fontSize: 40 }}>📋</span>
              <p>No audits yet</p>
              <span>Audits appear here when housekeepers submit room checklists</span>
            </div>
          ) : (
            <div className="audit-log-list">
              {auditLogs.map(log => (
                <div key={log.id} className="audit-log-row" id={`audit-log-${log.id}`}>
                  <div className="audit-log-left">
                    <div className="audit-log-score-circle" style={{
                      borderColor: log.score === 100 ? '#1a7f4b' : log.score >= 80 ? '#d68910' : '#c0392b',
                      color: log.score === 100 ? '#1a7f4b' : log.score >= 80 ? '#d68910' : '#c0392b',
                    }}>
                      {log.score}%
                    </div>
                  </div>
                  <div className="audit-log-body">
                    <div className="audit-log-top">
                      <span className="audit-log-room">Room {log.roomNumber}</span>
                      <span className="audit-log-type">{log.roomType}</span>
                      <AuditScoreBadge score={log.score} />
                    </div>
                    <div className="audit-log-meta">
                      <span>👤 {log.staff}</span>
                      <span>·</span>
                      <span>🕐 {formatTime(log.timestamp)}</span>
                      <span>·</span>
                      <span>{log.checkedCount}/{log.totalCount} items OK</span>
                    </div>
                    {log.flaggedItems.length > 0 && (
                      <div className="audit-log-flags">
                        {log.flaggedItems.map((f, i) => (
                          <span key={i} className={`audit-flag-chip ${f.action}`}>
                            {f.action === 'low_stock' ? '📦' : '🔧'} {f.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.consumptions.length > 0 && (
                      <div className="audit-log-consumption">
                        <span className="audit-cons-label">Consumed:</span>
                        {log.consumptions.map((c, i) => (
                          <span key={i} className="audit-cons-chip">
                            -{c.qty} {c.itemId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ MAINTENANCE SECTION ══ */}
      {activeSection === 'maintenance' && (
        <div className="db-card" id="maintenance-tickets-section">
          <div className="db-card-header">
            <span className="db-card-title">Maintenance Tickets</span>
            <div className="inv-ticket-filter">
              {['open', 'in_progress', 'resolved', 'all'].map(s => (
                <button
                  key={s}
                  className={`inv-cat-chip ${ticketFilter === s ? 'active' : ''}`}
                  onClick={() => setTicketFilter(s)}
                  id={`ticket-filter-${s}`}
                >
                  {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="inv-empty-state">
              <span style={{ fontSize: 40 }}>🔧</span>
              <p>No {ticketFilter !== 'all' ? ticketFilter : ''} tickets</p>
              <span>Maintenance issues flagged during audits appear here</span>
            </div>
          ) : (
            <div className="maint-ticket-list">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className={`maint-ticket ${ticket.status}`} id={`ticket-${ticket.id}`}>
                  <div className="maint-ticket-left">
                    <div className={`maint-status-dot ${ticket.status}`} />
                    <div className="maint-room-badge">{ticket.roomNumber}</div>
                  </div>
                  <div className="maint-ticket-body">
                    <div className="maint-issue">{ticket.issue}</div>
                    <div className="maint-meta">
                      <span>Reported by {ticket.reportedBy}</span>
                      <span>·</span>
                      <span>{formatTime(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="maint-ticket-actions">
                    {ticket.status === 'open' && (
                      <button
                        className="maint-btn maint-btn-start"
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        id={`ticket-start-${ticket.id}`}
                      >
                        Start
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button
                        className="maint-btn maint-btn-resolve"
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        id={`ticket-resolve-${ticket.id}`}
                      >
                        ✓ Resolve
                      </button>
                    )}
                    {ticket.status === 'resolved' && (
                      <span className="maint-resolved-badge">✓ Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Restock Modal ── */}
      {restockModal && (
        <div className="inv-modal-overlay" onClick={() => setRestockModal(null)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()} id="restock-modal">
            <div className="inv-modal-header">
              <h3>{restockModal.icon} Restock {restockModal.name}</h3>
              <button onClick={() => setRestockModal(null)} className="inv-modal-close">✕</button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-modal-current">
                <span>Current stock</span>
                <strong className={restockModal.qty < restockModal.threshold ? 'low' : ''}>{restockModal.qty} {restockModal.unit}</strong>
              </div>
              <label className="inv-modal-label">Add quantity ({restockModal.unit})</label>
              <div className="inv-qty-selector">
                {[10, 25, 50, 100].map(q => (
                  <button
                    key={q}
                    className={`inv-qty-preset ${restockQty === q ? 'active' : ''}`}
                    onClick={() => setRestockQty(q)}
                    id={`preset-${q}`}
                  >
                    +{q}
                  </button>
                ))}
              </div>
              <div className="inv-qty-custom">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={restockQty}
                  onChange={e => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  id="input-restock-qty"
                />
                <span className="inv-modal-unit">{restockModal.unit}</span>
              </div>
              <div className="inv-modal-preview">
                After restock: <strong>{restockModal.qty + restockQty} {restockModal.unit}</strong>
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="db-btn-ghost" onClick={() => setRestockModal(null)}>Cancel</button>
              <button className="db-btn-primary" onClick={handleRestock} id="btn-confirm-restock">
                ✓ Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
