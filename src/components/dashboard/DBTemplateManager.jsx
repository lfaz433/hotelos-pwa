import { useState } from 'react'
import { useHotel } from '../../context/HotelContext'
import './DBTemplateManager.css'

const ROOM_TYPE_OPTIONS = ['Standard', 'Double', 'Twin', 'Deluxe', 'Suite', 'Junior Suite']
const STOCK_ITEMS = [
  { id: 'soap', label: 'Soap' },
  { id: 'shampoo', label: 'Shampoo' },
  { id: 'conditioner', label: 'Conditioner' },
  { id: 'lotion', label: 'Body Lotion' },
  { id: 'towels', label: 'Towels' },
  { id: 'tp', label: 'Toilet Paper' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: null, label: 'None' },
]

function generateSectionId() { return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
function generateItemId()    { return `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

export default function DBTemplateManager() {
  const { checklistTemplates, saveTemplate } = useHotel()
  const [selectedKey, setSelectedKey] = useState(Object.keys(checklistTemplates)[0])
  const [editing, setEditing] = useState(null)   // deep copy of template being edited
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newItemLabels, setNewItemLabels] = useState({}) // sectionId → string

  const template = editing || checklistTemplates[selectedKey]

  function startEdit() {
    setEditing(JSON.parse(JSON.stringify(checklistTemplates[selectedKey])))
    setDirty(false)
    setSaved(false)
  }

  function cancelEdit() {
    setEditing(null)
    setDirty(false)
  }

  function handleSave() {
    saveTemplate(editing)
    setSaved(true)
    setDirty(false)
    setTimeout(() => { setEditing(null); setSaved(false) }, 1200)
  }

  function updateMeta(field, value) {
    setEditing(prev => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  function toggleAppliesTo(roomType) {
    setEditing(prev => {
      const arr = prev.appliesTo.includes(roomType)
        ? prev.appliesTo.filter(r => r !== roomType)
        : [...prev.appliesTo, roomType]
      return { ...prev, appliesTo: arr }
    })
    setDirty(true)
  }

  function updateItem(sectionId, itemId, field, value) {
    setEditing(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, [field]: value } : it) }
          : s
      ),
    }))
    setDirty(true)
  }

  function removeItem(sectionId, itemId) {
    setEditing(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, items: s.items.filter(it => it.id !== itemId) } : s
      ),
    }))
    setDirty(true)
  }

  function addItem(sectionId) {
    const label = (newItemLabels[sectionId] || '').trim()
    if (!label) return
    const newItem = { id: generateItemId(), label, stockItem: null, consumeQty: 0 }
    setEditing(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      ),
    }))
    setNewItemLabels(prev => ({ ...prev, [sectionId]: '' }))
    setDirty(true)
  }

  function removeSection(sectionId) {
    setEditing(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }))
    setDirty(true)
  }

  function addSection() {
    if (!newSectionTitle.trim()) return
    const newSection = { id: generateSectionId(), title: newSectionTitle.trim(), items: [] }
    setEditing(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
    setNewSectionTitle('')
    setAddSectionOpen(false)
    setDirty(true)
  }

  return (
    <div className="db-tmpl-tab">
      {/* ── Sidebar: template list ── */}
      <div className="db-tmpl-sidebar db-card">
        <div className="db-card-header">
          <span className="db-card-title">Templates</span>
        </div>
        <div className="db-tmpl-list">
          {Object.entries(checklistTemplates).map(([key, tmpl]) => (
            <button
              key={key}
              className={`db-tmpl-item ${selectedKey === key && !editing ? 'active' : ''}`}
              onClick={() => { setSelectedKey(key); setEditing(null); setDirty(false) }}
              id={`tmpl-item-${key}`}
            >
              <span className="db-tmpl-icon">{tmpl.icon}</span>
              <div className="db-tmpl-item-info">
                <span className="db-tmpl-item-name">{tmpl.name}</span>
                <span className="db-tmpl-item-sub">
                  {tmpl.sections.reduce((a, s) => a + s.items.length, 0)} items · {tmpl.appliesTo.join(', ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main editor ── */}
      <div className="db-tmpl-main">
        {/* Header */}
        <div className="db-card db-tmpl-header-card">
          <div className="db-tmpl-header-body">
            <div className="db-tmpl-header-info">
              <span className="db-tmpl-big-icon">{template.icon}</span>
              <div>
                <h2 className="db-tmpl-title">
                  {editing ? (
                    <input
                      className="db-tmpl-name-input"
                      value={editing.name}
                      onChange={e => updateMeta('name', e.target.value)}
                      id="tmpl-name-input"
                    />
                  ) : (
                    template.name
                  )}
                </h2>
                <p className="db-tmpl-sub">
                  {template.sections.length} sections ·{' '}
                  {template.sections.reduce((a, s) => a + s.items.length, 0)} checklist items
                </p>
              </div>
            </div>
            <div className="db-tmpl-header-actions">
              {editing ? (
                <>
                  <button className="db-btn-ghost" onClick={cancelEdit} id="btn-tmpl-cancel">Cancel</button>
                  <button
                    className={`db-btn-primary ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={!dirty}
                    id="btn-tmpl-save"
                  >
                    {saved ? '✓ Saved!' : 'Save Template'}
                  </button>
                </>
              ) : (
                <button className="db-btn-primary" onClick={startEdit} id="btn-tmpl-edit">
                  ✏ Edit Template
                </button>
              )}
            </div>
          </div>

          {/* Applies To */}
          <div className="db-tmpl-applies">
            <span className="db-tmpl-applies-label">Applies to:</span>
            <div className="db-tmpl-applies-chips">
              {ROOM_TYPE_OPTIONS.map(rt => {
                const active = (editing || template).appliesTo.includes(rt)
                return (
                  <button
                    key={rt}
                    className={`db-tmpl-rt-chip ${active ? 'active' : ''}`}
                    onClick={() => editing && toggleAppliesTo(rt)}
                    disabled={!editing}
                    id={`chip-${rt.replace(' ','-')}`}
                  >
                    {rt}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sections */}
        {(editing ? editing.sections : template.sections).map(section => (
          <div key={section.id} className="db-card db-tmpl-section" id={`section-${section.id}`}>
            <div className="db-card-header">
              <span className="db-card-title">{section.title}</span>
              <div className="db-tmpl-section-actions">
                <span className="db-tmpl-item-count">{section.items.length} items</span>
                {editing && (
                  <button
                    className="db-tmpl-del-btn"
                    onClick={() => removeSection(section.id)}
                    id={`btn-del-section-${section.id}`}
                    title="Remove section"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            <div className="db-tmpl-items">
              {section.items.map((item, idx) => (
                <div key={item.id} className="db-tmpl-checklist-item" id={`tmpl-item-edit-${item.id}`}>
                  <div className="db-tmpl-item-num">{idx + 1}</div>

                  {editing ? (
                    <>
                      <input
                        className="db-tmpl-item-input"
                        value={item.label}
                        onChange={e => updateItem(section.id, item.id, 'label', e.target.value)}
                        id={`item-label-${item.id}`}
                        placeholder="Checklist item label"
                      />
                      <div className="db-tmpl-item-stock">
                        <select
                          value={item.stockItem || ''}
                          onChange={e => updateItem(section.id, item.id, 'stockItem', e.target.value || null)}
                          className="db-tmpl-select"
                          id={`item-stock-${item.id}`}
                        >
                          {STOCK_ITEMS.map(s => (
                            <option key={String(s.id)} value={s.id || ''}>{s.label}</option>
                          ))}
                        </select>
                        {item.stockItem && (
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={item.consumeQty}
                            onChange={e => updateItem(section.id, item.id, 'consumeQty', parseInt(e.target.value) || 0)}
                            className="db-tmpl-qty-input"
                            id={`item-qty-${item.id}`}
                            title="Units consumed per clean"
                          />
                        )}
                      </div>
                      <button
                        className="db-tmpl-remove-btn"
                        onClick={() => removeItem(section.id, item.id)}
                        id={`btn-remove-item-${item.id}`}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="db-tmpl-item-label-ro">{item.label}</span>
                      <div className="db-tmpl-item-meta">
                        {item.stockItem && (
                          <span className="db-tmpl-cons-badge">
                            −{item.consumeQty} {item.stockItem}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add new item row */}
              {editing && (
                <div className="db-tmpl-add-item-row">
                  <input
                    className="db-tmpl-add-item-input"
                    placeholder="+ Add checklist item…"
                    value={newItemLabels[section.id] || ''}
                    onChange={e => setNewItemLabels(prev => ({ ...prev, [section.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addItem(section.id)}
                    id={`add-item-input-${section.id}`}
                  />
                  <button
                    className="db-tmpl-add-item-btn"
                    onClick={() => addItem(section.id)}
                    id={`btn-add-item-${section.id}`}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Section */}
        {editing && (
          <div className="db-tmpl-add-section">
            {addSectionOpen ? (
              <div className="db-tmpl-add-section-form db-card">
                <input
                  className="db-tmpl-add-section-input"
                  placeholder="Section name (e.g. 'Living Area')"
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSection()}
                  autoFocus
                  id="add-section-input"
                />
                <div className="db-tmpl-add-section-btns">
                  <button className="db-btn-ghost" onClick={() => setAddSectionOpen(false)}>Cancel</button>
                  <button className="db-btn-primary" onClick={addSection} id="btn-confirm-section">Add Section</button>
                </div>
              </div>
            ) : (
              <button className="db-tmpl-add-section-btn" onClick={() => setAddSectionOpen(true)} id="btn-add-section">
                <span>+</span> Add New Section
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
