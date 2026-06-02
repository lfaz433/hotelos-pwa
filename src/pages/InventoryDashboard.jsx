import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useHotel } from '../context/HotelContext'
import './InventoryDashboard.css'

export default function InventoryDashboard({ embedded }) {
  const { inventory, restockItem } = useHotel()
  const [filter, setFilter] = useState('all') // 'all', 'low', 'critical'
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [restockModal, setRestockModal] = useState(null)
  const [restockQty, setRestockQty] = useState(50)
  const [showPO, setShowPO] = useState(false)

  // Derive categories
  const categories = ['All', ...new Set(inventory.map(i => i.category))]

  // Derive stats & Analytics
  const stats = useMemo(() => {
    const low = inventory.filter(i => i.qty < i.threshold && i.qty >= i.threshold * 0.5)
    const critical = inventory.filter(i => i.qty < i.threshold * 0.5)
    
    // Mock analytics
    const mockBurnRate = 45 // items consumed today
    const restockCost = [...low, ...critical].reduce((acc, item) => acc + (item.threshold * 2 * 1.5), 0) // Mock cost: $1.5 per unit

    return {
      total: inventory.length,
      low: low.length,
      critical: critical.length,
      healthy: inventory.length - low.length - critical.length,
      burnRate: mockBurnRate,
      restockCost: restockCost.toFixed(2)
    }
  }, [inventory])

  // Filtered items
  const filteredInventory = useMemo(() => {
    return inventory.filter(i => {
      // Search
      if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      // Category
      if (categoryFilter !== 'All' && i.category !== categoryFilter) return false
      // Status
      if (filter === 'low' && !(i.qty < i.threshold && i.qty >= i.threshold * 0.5)) return false
      if (filter === 'critical' && !(i.qty < i.threshold * 0.5)) return false
      if (filter === 'healthy' && !(i.qty >= i.threshold)) return false
      return true
    })
  }, [inventory, filter, categoryFilter, searchQuery])

  const handleRestock = () => {
    if (restockModal && restockQty > 0) {
      restockItem(restockModal.id, restockQty)
      setRestockModal(null)
      setRestockQty(50)
    }
  }

  const getStatusInfo = (qty, threshold) => {
    if (qty < threshold * 0.5) return { label: 'CRITICAL', className: 'status-critical', icon: '🚨' }
    if (qty < threshold) return { label: 'LOW STOCK', className: 'status-low', icon: '⚠️' }
    return { label: 'HEALTHY', className: 'status-healthy', icon: '✓' }
  }

  return (
    <div className="rdash-luxury-layout">
      {/* Top Navbar */}
      {!embedded && (
        <header className="rdash-lux-header">
          <div className="rdash-lux-logo">
            <div className="lux-logo-icon">H</div>
            <div className="lux-logo-text">
              <h1>HOTEL OS</h1>
              <span>MAGASIN INVENTORY</span>
            </div>
          </div>

          <div className="rdash-lux-user">
            <div className="lux-user-info">
              <span className="lux-name">Inventory Manager</span>
              <span className="lux-role">Stock Control</span>
            </div>
            <div className="lux-avatar">M</div>
            <Link to="/dashboard" className="lux-logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </Link>
          </div>
        </header>
      )}

      <div className="rdash-lux-body">
        {/* Main Content */}
        <main className="rdash-lux-main">
          <div className="rdash-lux-header-text">
            <h2>Stock Overview & Analytics</h2>
            <p>Real-time inventory levels with predictive consumption data.</p>
          </div>

          {/* New Analytics Section */}
          <div className="inv-analytics-bar">
            <div className="inv-analytic-card">
              <span className="inv-analytic-label">Today's Burn Rate</span>
              <span className="inv-analytic-value">{stats.burnRate} units</span>
            </div>
            <div className="inv-analytic-card">
              <span className="inv-analytic-label">Est. Restock Cost</span>
              <span className="inv-analytic-value">${stats.restockCost}</span>
            </div>
            <div className="inv-analytic-card" style={{justifyContent: 'center'}}>
              <button className="inv-btn-po" onClick={() => setShowPO(true)}>
                📄 Generate Purchase Order
              </button>
            </div>
          </div>

          <div className="rdash-lux-stats">
            <div className={`lux-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <div className="lux-stat-value">{stats.total}</div>
              <div className="lux-stat-label">Total Items</div>
            </div>
            <div className={`lux-stat-card type-ready ${filter === 'healthy' ? 'active' : ''}`} onClick={() => setFilter('healthy')}>
              <div className="lux-stat-value">{stats.healthy}</div>
              <div className="lux-stat-label">Healthy Stock</div>
            </div>
            <div className={`lux-stat-card type-cleaning ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>
              <div className="lux-stat-value">{stats.low}</div>
              <div className="lux-stat-label">Low Stock (Order Soon)</div>
            </div>
            <div className={`lux-stat-card type-dirty ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>
              <div className="lux-stat-value">{stats.critical}</div>
              <div className="lux-stat-label">Critical (Order Now)</div>
            </div>
          </div>

          {/* Smart Controls */}
          <div className="inv-controls">
            <input 
              type="text" 
              className="inv-search" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="inv-filter-group">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`inv-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="inv-table-card">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const status = getStatusInfo(item.qty, item.threshold)
                  return (
                    <tr key={item.id} className={status.className}>
                      <td data-label="Item">
                        <div className="inv-item-info">
                          <span className="inv-item-icon">{item.icon}</span>
                          <strong>{item.name}</strong>
                        </div>
                      </td>
                      <td data-label="Category"><span className="inv-category-pill">{item.category}</span></td>
                      <td data-label="Status">
                        <span className={`inv-status-badge ${status.className}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td data-label="Quantity">
                        <div className="inv-qty-info">
                          <strong className={`qty-val ${status.className}`}>{item.qty}</strong>
                          <span>{item.unit}</span>
                        </div>
                      </td>
                      <td data-label="Threshold" className="inv-threshold-col">Warn at {item.threshold}</td>
                      <td data-label="Action">
                        <button className="inv-btn-restock" onClick={() => setRestockModal(item)}>
                          + Add Stock
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <div className="inv-empty-state" style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                No items match this filter.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="inv-modal-overlay" onClick={() => setRestockModal(null)}>
          <div className="inv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>{restockModal.icon} Restock {restockModal.name}</h3>
            </div>
            
            <div className="inv-modal-body">
              <div className="inv-current-stock">
                Current Level: <strong>{restockModal.qty} {restockModal.unit}</strong>
              </div>
              
              <div className="inv-input-group">
                <label>Add Amount</label>
                <input 
                  type="number" 
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="inv-quick-adds">
                {[10, 50, 100, 500].map(q => (
                  <button key={q} onClick={() => setRestockQty(q)}>+{q}</button>
                ))}
              </div>
            </div>

            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setRestockModal(null)}>Cancel</button>
              <button className="inv-btn-confirm" onClick={handleRestock}>Confirm Restock</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {showPO && (
        <div className="inv-modal-overlay" onClick={() => setShowPO(false)}>
          <div className="inv-modal-card" style={{width: '600px'}} onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>📄 Generated Purchase Order</h3>
            </div>
            <div className="inv-modal-body" style={{maxHeight: '60vh', overflowY: 'auto'}}>
              <p style={{marginBottom: '20px', color: '#666'}}>
                The following items are low or critical and require immediate restocking from vendors.
              </p>
              {inventory.filter(i => i.qty < i.threshold).length === 0 ? (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <strong>No items currently require restocking!</strong>
                </div>
              ) : (
                <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{borderBottom: '2px solid #eee'}}>
                      <th style={{padding: '10px 0'}}>Item</th>
                      <th>Category</th>
                      <th>Needed</th>
                      <th>Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.filter(i => i.qty < i.threshold).map(item => {
                      const needed = (item.threshold * 2) - item.qty;
                      const cost = needed * 1.5;
                      return (
                        <tr key={item.id} style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '10px 0'}}>{item.icon} {item.name}</td>
                          <td>{item.category}</td>
                          <td>{needed} {item.unit}</td>
                          <td>${cost.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowPO(false)}>Close</button>
              <button className="inv-btn-confirm" onClick={() => {
                alert('Purchase Order Sent to Vendor System!')
                setShowPO(false)
              }}>Send to Vendors</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
