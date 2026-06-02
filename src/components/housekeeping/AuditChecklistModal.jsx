import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useHotel } from '../../context/HotelContext'
import './AuditChecklistModal.css'

const FLAG_OPTIONS = [
  { action: 'low_stock',   label: 'Mark as Low Stock',           icon: '📦', desc: 'Adds to inventory reorder queue' },
  { action: 'maintenance', label: 'Report Damage / Maintenance', icon: '🔧', desc: 'Creates a maintenance ticket' },
]

export default function AuditChecklistModal({ room, onClose, onComplete }) {
  const { activeStaff, getTemplateForRoom, submitAudit } = useHotel()
  const template = getTemplateForRoom(room.type)

  // Flatten all items for state initialisation
  const allItems = useMemo(() =>
    template?.sections.flatMap(s => s.items.map(it => ({ ...it, sectionId: s.id }))) || [],
    [template]
  )

  // item states: true = checked/OK, false = unchecked/flagged
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(allItems.map(it => [it.id, true]))
  )

  // Flag drawer state: which item is open
  const [openFlag, setOpenFlag] = useState(null)

  // flags[itemId] = { action, label, stockItem }
  const [flags, setFlags] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('checklist') // 'checklist' | 'summary'

  const totalItems = allItems.length
  const checkedCount = Object.values(checked).filter(Boolean).length
  const flaggedCount = Object.keys(flags).length
  const progress = Math.round((checkedCount / totalItems) * 100)
  const allDone = totalItems > 0 && (checkedCount + flaggedCount) >= totalItems

  if (!template) return null

  function toggleItem(item) {
    const wasChecked = checked[item.id]
    if (wasChecked) {
      // Unchecking → open flag drawer
      setChecked(prev => ({ ...prev, [item.id]: false }))
      setOpenFlag(item.id)
    } else {
      // Re-checking → remove flag
      setChecked(prev => ({ ...prev, [item.id]: true }))
      setFlags(prev => { const n = { ...prev }; delete n[item.id]; return n })
      setOpenFlag(null)
    }
  }

  function applyFlag(item, action) {
    setFlags(prev => ({
      ...prev,
      [item.id]: { action, label: item.label, itemId: item.id, stockItem: item.stockItem },
    }))
    setOpenFlag(null)
  }

  function dismissFlag(itemId) {
    // Keep unchecked but no action yet
    setOpenFlag(null)
  }

  async function handleSubmit() {
    setSubmitting(true)

    // Build consumptions list (only from checked/OK items)
    const consumptions = allItems
      .filter(it => checked[it.id] && it.stockItem && it.consumeQty > 0)
      .map(it => ({ itemId: it.stockItem, qty: it.consumeQty }))

    // Consolidate duplicates
    const consMap = {}
    consumptions.forEach(c => {
      consMap[c.itemId] = (consMap[c.itemId] || 0) + c.qty
    })
    const consolidatedConsumptions = Object.entries(consMap).map(([itemId, qty]) => ({ itemId, qty }))

    const flaggedItems = Object.values(flags)

    await new Promise(r => setTimeout(r, 600))

    submitAudit({
      roomId: room.id,
      checkedItems: allItems.filter(it => checked[it.id]).map(it => it.id),
      flaggedItems,
      consumptions: consolidatedConsumptions,
      staffName: activeStaff?.name || 'Staff',
      staffId: activeStaff?.id,
    })

    setSubmitting(false)
    onComplete?.()
  }

  const modalContent = (
    <div className="acm-overlay" onClick={(e) => {
      if (e.target.className === 'acm-overlay') onClose()
    }} role="dialog" aria-modal="true" aria-label="Room Audit Checklist">
      <div className="acm-modal">

        {/* ── Header ── */}
        <div className="acm-header">
          <div className="acm-header-top">
            <div className="acm-room-badge">
              <span className="acm-room-num">Room {room.number}</span>
              <span className="acm-room-type">{template.icon} {template.name}</span>
            </div>
            <button className="acm-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="acm-progress-wrap">
            <div className="acm-progress-bar">
              <div
                className="acm-progress-fill"
                style={{ width: `${progress}%`, background: progress === 100 ? 'var(--status-available)' : 'var(--brand-action)' }}
              />
            </div>
            <div className="acm-progress-labels">
              <span className="acm-progress-text">
                {checkedCount} of {totalItems} complete
              </span>
              <span className="acm-progress-pct" style={{ color: progress === 100 ? 'var(--status-available)' : 'var(--brand-action)' }}>
                {progress}%
              </span>
            </div>
          </div>

          {flaggedCount > 0 && (
            <div className="acm-flag-strip">
              <span className="acm-flag-icon">⚠</span>
              <span>{flaggedCount} item{flaggedCount !== 1 ? 's' : ''} flagged — a report will be submitted</span>
            </div>
          )}
        </div>

        {/* ── Checklist Body ── */}
        <div className="acm-body">
          {template.sections.map(section => (
            <div key={section.id} className="acm-section">
              <div className="acm-section-title">
                <span>{section.title}</span>
                <span className="acm-section-count">
                  {section.items.filter(it => checked[it.id]).length}/{section.items.length}
                </span>
              </div>

              <div className="acm-items">
                {section.items.map(item => {
                  const isChecked = checked[item.id]
                  const flag = flags[item.id]
                  const isOpen = openFlag === item.id

                  return (
                    <div key={item.id} className={`acm-item-wrap ${!isChecked ? 'flagged' : ''} ${isOpen ? 'open' : ''}`}>
                      <div
                        className="acm-item"
                        onClick={() => toggleItem(item)}
                        id={`audit-item-${item.id}`}
                      >
                        <div className={`acm-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : flag ? (
                            <span className="acm-flag-marker">{flag.action === 'low_stock' ? '📦' : '🔧'}</span>
                          ) : (
                            <span className="acm-x-marker">✕</span>
                          )}
                        </div>

                        <div className="acm-item-body">
                          <span className={`acm-item-label ${!isChecked ? 'strikethrough' : ''}`}>
                            {item.label}
                          </span>
                          {item.stockItem && (
                            <span className="acm-item-consumes">
                              uses {item.consumeQty} {item.stockItem}
                            </span>
                          )}
                          {flag && (
                            <span className={`acm-flag-chip ${flag.action}`}>
                              {flag.action === 'low_stock' ? '📦 Low Stock' : '🔧 Maintenance'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flag Action Drawer */}
                      {isOpen && (
                        <div className="acm-flag-drawer animate-in">
                          <div className="acm-drawer-label">What action should be taken?</div>
                          {FLAG_OPTIONS.map(opt => (
                            <button
                              key={opt.action}
                              className={`acm-flag-option action-${opt.action}`}
                              onClick={() => applyFlag(item, opt.action)}
                              id={`flag-${item.id}-${opt.action}`}
                            >
                              <span className="acm-flag-opt-icon">{opt.icon}</span>
                              <div className="acm-flag-opt-text">
                                <span className="acm-flag-opt-label">{opt.label}</span>
                                <span className="acm-flag-opt-desc">{opt.desc}</span>
                              </div>
                              <span className="acm-flag-opt-arrow">→</span>
                            </button>
                          ))}
                          <button
                            className="acm-flag-dismiss"
                            onClick={() => dismissFlag(item.id)}
                            id={`flag-${item.id}-dismiss`}
                          >
                            Skip for now
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="acm-footer safe-bottom">
          <div className="acm-footer-info">
            {allDone ? (
              <span className="acm-ready-msg">
                {flaggedCount > 0
                  ? `✓ Audit complete — ${flaggedCount} issue(s) reported`
                  : '✓ All items checked — room is ready!'}
              </span>
            ) : (
              <span className="acm-pending-msg">
                {totalItems - checkedCount - flaggedCount} item{totalItems - checkedCount - flaggedCount !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>

          <div className="acm-footer-actions">
            <button className="acm-btn-ghost" onClick={onClose} id="btn-audit-cancel">
              Cancel
            </button>
            <button
              className={`acm-btn-submit ${!allDone ? 'disabled' : ''} ${submitting ? 'loading' : ''}`}
              onClick={allDone && !submitting ? handleSubmit : undefined}
              disabled={!allDone || submitting}
              id="btn-audit-submit"
            >
              {submitting ? (
                <><span className="acm-spinner" /> Submitting…</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Terminer (Submit Audit)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
