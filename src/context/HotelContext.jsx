import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'

/* ─── Seed Data ─── */
const FLOORS = [1, 2, 3, 4, 5]
const ROOMS_PER_FLOOR = 8

function generateRooms() {
  const rooms = []
  const statuses = ['available', 'dirty', 'cleaning', 'ready', 'occupied']
  const types = ['Standard', 'Standard', 'Deluxe', 'Deluxe', 'Suite', 'Junior Suite', 'Double', 'Twin']
  let id = 1
  FLOORS.forEach(floor => {
    for (let r = 1; r <= ROOMS_PER_FLOOR; r++) {
      rooms.push({
        id: id++,
        number: `${floor}0${r}`,
        floor,
        type: types[(r - 1) % types.length],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignedTo: Math.random() > 0.5 ? 'Maria G.' : Math.random() > 0.5 ? 'James K.' : null,
        lastUpdated: null,
        notes: '',
        priority: Math.random() > 0.7 ? 'high' : 'normal',
      })
    }
  })
  return rooms
}

function generateBookings(rooms) {
  const bookings = []
  const today = new Date()
  const guests = [
    'Anderson, J.', 'Smith, M.', 'Johnson, L.', 'Williams, R.',
    'Brown, K.', 'Davis, T.', 'Garcia, N.', 'Martinez, C.',
    'Lopez, A.', 'Hernandez, D.', 'Wilson, S.', 'Moore, B.',
  ]
  let bookingId = 1
  
  // Guarantee some arrivals and departures for TODAY
  rooms.slice(0, 3).forEach(room => {
    bookings.push({
      id: bookingId++, roomId: room.id, guest: guests[bookingId % guests.length],
      checkIn: new Date(today), checkOut: new Date(today.getTime() + 86400000 * 2),
      status: 'arriving', confirmationNo: `HOS${String(bookingId).padStart(5, '0')}`
    })
  })
  rooms.slice(3, 6).forEach(room => {
    bookings.push({
      id: bookingId++, roomId: room.id, guest: guests[bookingId % guests.length],
      checkIn: new Date(today.getTime() - 86400000 * 3), checkOut: new Date(today),
      status: 'active', confirmationNo: `HOS${String(bookingId).padStart(5, '0')}`
    })
  })

  // Random others
  rooms.slice(6).forEach(room => {
    const numBookings = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numBookings; i++) {
      const startOffset = Math.floor(Math.random() * 10) - 2
      const duration = Math.floor(Math.random() * 4) + 1
      const checkIn = new Date(today)
      checkIn.setDate(today.getDate() + startOffset)
      const checkOut = new Date(checkIn)
      checkOut.setDate(checkIn.getDate() + duration)
      
      // Avoid overlapping check-ins for the same room today in random gen
      if (startOffset === 0) continue; 
      
      bookings.push({
        id: bookingId++,
        roomId: room.id,
        guest: guests[Math.floor(Math.random() * guests.length)],
        checkIn, checkOut,
        status: startOffset < 0 ? 'active' : 'upcoming',
        confirmationNo: `HOS${String(bookingId).padStart(5, '0')}`,
        totalAmount: room.price ? room.price * duration : 200 * duration
      })
    }
  })
  return bookings
}

const STAFF = [
  { id: 1, name: 'Maria Garcia',  role: 'Housekeeper', avatar: 'MG', floor: 1 },
  { id: 2, name: 'James Kim',     role: 'Housekeeper', avatar: 'JK', floor: 2 },
  { id: 3, name: 'Ana Pereira',   role: 'Supervisor',  avatar: 'AP', floor: null },
  { id: 4, name: 'Carlos Santos', role: 'Housekeeper', avatar: 'CS', floor: 3 },
]

function generateAuditLogs(rooms) {
  const logs = []
  const now = new Date()
  for(let i = 0; i < 15; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)]
    const staff = STAFF[Math.floor(Math.random() * 2)] // only housekeepers
    const score = Math.floor(Math.random() * 20) + 80 // 80 to 100
    const ts = new Date(now.getTime() - Math.random() * 86400000) // past 24 hrs
    logs.push({
      id: Date.now() + i,
      roomId: room.id,
      roomNumber: room.number,
      roomType: room.type,
      staff: staff.name,
      staffId: staff.id,
      checkedCount: 15,
      totalCount: score === 100 ? 15 : 16,
      flaggedItems: score === 100 ? [] : [{ action: 'maintenance', label: 'Dust on TV' }],
      consumptions: [],
      score: score,
      timestamp: ts
    })
  }
  // Sort descending by timestamp
  return logs.sort((a,b) => b.timestamp - a.timestamp)
}

function generateTickets(rooms) {
  const issues = ["AC not cooling", "Leaky bathroom faucet", "Flickering entrance light", "TV remote batteries dead", "WiFi weak signal"]
  const statuses = ["open", "in-progress", "resolved"]
  const tickets = []
  const now = new Date()
  for(let i=0; i<8; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)]
    const ts = new Date(now.getTime() - Math.random() * 172800000)
    tickets.push({
      id: Date.now() + 100 + i,
      roomId: room.id,
      roomNumber: room.number,
      issue: issues[Math.floor(Math.random() * issues.length)],
      reportedBy: Math.random() > 0.5 ? 'Guest' : 'Maria Garcia',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      createdAt: ts
    })
  }
  return tickets.sort((a,b) => b.createdAt - a.createdAt)
}

function generateFeedAndNotifs(rooms) {
  const feed = []
  const notifs = []
  const now = new Date()
  const statuses = ['dirty', 'cleaning', 'ready', 'occupied']
  for(let i=0; i<10; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)]
    const ts = new Date(now.getTime() - Math.random() * 36000000)
    const st = statuses[Math.floor(Math.random() * statuses.length)]
    feed.push({
      id: Date.now() + 200 + i,
      roomId: room.id,
      roomNumber: room.number,
      status: st,
      staff: Math.random() > 0.5 ? 'System' : 'James Kim',
      timestamp: ts,
    })
    if(i < 3) {
      notifs.push({
        id: Date.now() + 300 + i,
        type: 'status_update',
        message: `Room ${room.number} is now ${st}`,
        timestamp: ts,
        read: false
      })
    }
  }
  return { 
    feed: feed.sort((a,b) => b.timestamp - a.timestamp), 
    notifs: notifs.sort((a,b) => b.timestamp - a.timestamp) 
  }
}

/* ─── Checklist Templates ─── */
export const DEFAULT_TEMPLATES = {
  Standard: {
    id: 'standard', name: 'Standard Room', appliesTo: ['Standard', 'Double', 'Twin'], icon: '🛏',
    sections: [
      { id: 'bed', title: 'Bedroom', items: [
          { id: 'bed_made', label: 'Bed made & pillows arranged', stockItem: null, consumeQty: 0 },
          { id: 'surfaces_dust', label: 'Surfaces dusted & cleaned', stockItem: null, consumeQty: 0 },
          { id: 'floor_vac', label: 'Floor vacuumed / swept', stockItem: null, consumeQty: 0 },
          { id: 'trash_empty', label: 'Trash bin emptied', stockItem: null, consumeQty: 0 },
          { id: 'tv_remote', label: 'TV remote present & functional', stockItem: null, consumeQty: 0 },
          { id: 'coffee_restock', label: 'Coffee & tea restocked', stockItem: 'coffee', consumeQty: 2 },
      ]},
      { id: 'bathroom', title: 'Bathroom', items: [
          { id: 'toilet_clean', label: 'Toilet cleaned & disinfected', stockItem: null, consumeQty: 0 },
          { id: 'sink_clean', label: 'Sink & mirrors cleaned', stockItem: null, consumeQty: 0 },
          { id: 'shower_clean', label: 'Shower / bath cleaned', stockItem: null, consumeQty: 0 },
          { id: 'soap_stock', label: 'Soap stocked', stockItem: 'soap', consumeQty: 2 },
          { id: 'shampoo_stock', label: 'Shampoo stocked', stockItem: 'shampoo', consumeQty: 1 },
          { id: 'towels_fresh', label: 'Towels replaced (bath + hand)', stockItem: 'towels', consumeQty: 2 },
          { id: 'tp_stock', label: 'Toilet paper stocked (×2)', stockItem: 'tp', consumeQty: 2 },
      ]},
    ],
  },
  Deluxe: {
    id: 'deluxe', name: 'Deluxe Room', appliesTo: ['Deluxe'], icon: '⭐',
    sections: [
      { id: 'bed', title: 'Bedroom', items: [
          { id: 'bed_made', label: 'Bed made, pillows & bolsters', stockItem: null, consumeQty: 0 },
          { id: 'surfaces_dust', label: 'Surfaces dusted & cleaned', stockItem: null, consumeQty: 0 },
          { id: 'floor_vac', label: 'Floor vacuumed / swept', stockItem: null, consumeQty: 0 },
          { id: 'trash_empty', label: 'Trash bin emptied', stockItem: null, consumeQty: 0 },
          { id: 'tv_remote', label: 'TV remote + smart panel set', stockItem: null, consumeQty: 0 },
          { id: 'coffee_restock', label: 'Coffee, tea & capsules restocked', stockItem: 'coffee', consumeQty: 4 },
          { id: 'minibar_check', label: 'Mini-bar checked & restocked', stockItem: null, consumeQty: 0 },
      ]},
      { id: 'bathroom', title: 'Bathroom', items: [
          { id: 'toilet_clean', label: 'Toilet cleaned & disinfected', stockItem: null, consumeQty: 0 },
          { id: 'sink_clean', label: 'Sink & mirrors polished', stockItem: null, consumeQty: 0 },
          { id: 'shower_clean', label: 'Shower / bath scrubbed', stockItem: null, consumeQty: 0 },
          { id: 'soap_stock', label: 'Soap & hand wash stocked', stockItem: 'soap', consumeQty: 3 },
          { id: 'shampoo_stock', label: 'Shampoo stocked', stockItem: 'shampoo', consumeQty: 2 },
          { id: 'cond_stock', label: 'Conditioner stocked', stockItem: 'conditioner', consumeQty: 1 },
          { id: 'lotion_stock', label: 'Body lotion stocked', stockItem: 'lotion', consumeQty: 1 },
          { id: 'towels_fresh', label: 'Towels replaced (bath + hand)', stockItem: 'towels', consumeQty: 3 },
          { id: 'tp_stock', label: 'Toilet paper stocked (×2)', stockItem: 'tp', consumeQty: 2 },
          { id: 'robe_slippers', label: 'Bathrobe & slippers present', stockItem: null, consumeQty: 0 },
      ]},
    ],
  },
  Suite: {
    id: 'suite', name: 'Suite', appliesTo: ['Suite', 'Junior Suite'], icon: '👑',
    sections: [
      { id: 'living', title: 'Living Area', items: [
          { id: 'living_clean', label: 'Living area fully cleaned', stockItem: null, consumeQty: 0 },
          { id: 'surfaces_dust', label: 'All surfaces dusted & polished', stockItem: null, consumeQty: 0 },
          { id: 'floor_clean', label: 'Floors vacuumed & mopped', stockItem: null, consumeQty: 0 },
          { id: 'trash_all', label: 'All bins emptied', stockItem: null, consumeQty: 0 },
      ]},
      { id: 'bed', title: 'Bedroom', items: [
          { id: 'bed_made', label: 'Bed made (turndown standard)', stockItem: null, consumeQty: 0 },
          { id: 'extra_pillows', label: 'Extra pillow set present', stockItem: null, consumeQty: 0 },
          { id: 'tv_audio', label: 'TV & audio system functional', stockItem: null, consumeQty: 0 },
          { id: 'coffee_restock', label: 'Premium coffee & tea restocked', stockItem: 'coffee', consumeQty: 6 },
          { id: 'minibar_check', label: 'Full mini-bar restocked', stockItem: null, consumeQty: 0 },
          { id: 'safe_working', label: 'In-room safe operational', stockItem: null, consumeQty: 0 },
      ]},
      { id: 'bathroom', title: 'Bathroom', items: [
          { id: 'toilet_clean', label: 'Toilet cleaned & disinfected', stockItem: null, consumeQty: 0 },
          { id: 'sink_clean', label: 'Sink & mirrors polished', stockItem: null, consumeQty: 0 },
          { id: 'bath_clean', label: 'Jacuzzi / bath tub scrubbed', stockItem: null, consumeQty: 0 },
          { id: 'soap_stock', label: 'Premium soap stocked (×3)', stockItem: 'soap', consumeQty: 4 },
          { id: 'shampoo_stock', label: 'Shampoo stocked (×2)', stockItem: 'shampoo', consumeQty: 2 },
          { id: 'cond_stock', label: 'Conditioner stocked (×2)', stockItem: 'conditioner', consumeQty: 2 },
          { id: 'lotion_stock', label: 'Body lotion (×2)', stockItem: 'lotion', consumeQty: 2 },
          { id: 'towels_fresh', label: 'Full towel set replaced', stockItem: 'towels', consumeQty: 5 },
          { id: 'tp_stock', label: 'Toilet paper stocked (×4)', stockItem: 'tp', consumeQty: 4 },
          { id: 'robe_slippers', label: 'Premium robes & slippers set', stockItem: null, consumeQty: 0 },
          { id: 'bath_amenities', label: 'Full amenity basket complete', stockItem: null, consumeQty: 0 },
      ]},
    ],
  },
}

/* ─── Inventory Seed ─── */
const INITIAL_INVENTORY = [
  { id: 'soap',        name: 'Soap Bars',         unit: 'units', qty: 240, threshold: 40,  category: 'Toiletries', icon: '🧼' },
  { id: 'shampoo',     name: 'Shampoo Bottles',   unit: 'units', qty: 15,  threshold: 30,  category: 'Toiletries', icon: '🧴' }, // CRITICAL
  { id: 'conditioner', name: 'Conditioner',       unit: 'units', qty: 22,  threshold: 20,  category: 'Toiletries', icon: '🧴' },
  { id: 'lotion',      name: 'Body Lotion',       unit: 'units', qty: 95,  threshold: 20,  category: 'Toiletries', icon: '🧴' },
  { id: 'towels',      name: 'Bath Towels',       unit: 'units', qty: 320, threshold: 60,  category: 'Linens',     icon: '🛁' },
  { id: 'tp',          name: 'Toilet Paper',      unit: 'rolls', qty: 45,  threshold: 80,  category: 'Consumables',icon: '🧻' }, // LOW
  { id: 'coffee',      name: 'Coffee Sachets',    unit: 'units', qty: 350, threshold: 50,  category: 'F&B',        icon: '☕' },
  { id: 'tea',         name: 'Tea Bags',          unit: 'units', qty: 15,  threshold: 40,  category: 'F&B',        icon: '🍵' }, // CRITICAL
  { id: 'water',       name: 'Bottled Water',     unit: 'units', qty: 190, threshold: 30,  category: 'F&B',        icon: '💧' },
  { id: 'gloves',      name: 'Cleaning Gloves',   unit: 'pairs', qty: 55,  threshold: 20,  category: 'Supplies',   icon: '🧤' },
  { id: 'cleaner',     name: 'Surface Cleaner',   unit: 'litres', qty: 28, threshold: 8,   category: 'Supplies',   icon: '🫧' },
  { id: 'bin_bags',    name: 'Bin Bags (Large)',  unit: 'units', qty: 210, threshold: 40,  category: 'Supplies',   icon: '🗑️' },
]

const rooms = generateRooms()
const bookings = generateBookings(rooms)
const logs = generateAuditLogs(rooms)
const tickets = generateTickets(rooms)
const feedAndNotifs = generateFeedAndNotifs(rooms)

const INITIAL_ROOM_TYPES = {
  'Standard': { id: 'Standard', name: 'Standard Room', price: 120, desc: 'Comfortable and compact, perfect for short stays.', capacity: 2, images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'], amenities: { wifi: true, tv: true, ac: true, minibar: false, roomService: false, safe: true } },
  'Double': { id: 'Double', name: 'Double Room', price: 150, desc: 'Spacious room with a large double bed.', capacity: 2, images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800'], amenities: { wifi: true, tv: true, ac: true, minibar: false, roomService: true, safe: true } },
  'Deluxe': { id: 'Deluxe', name: 'Deluxe Room', price: 200, desc: 'Premium amenities with city views.', capacity: 2, images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800'], amenities: { wifi: true, tv: true, ac: true, minibar: true, roomService: true, safe: true } },
  'Suite': { id: 'Suite', name: 'Executive Suite', price: 350, desc: 'Luxury suite with separate living area.', capacity: 4, images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800'], amenities: { wifi: true, tv: true, ac: true, minibar: true, roomService: true, safe: true, kitchen: true } },
}

/* ─── Initial State ─── */
const initialState = {
  rooms,
  bookings,
  staff: STAFF,
  activeStaff: STAFF[0],
  activityFeed: feedAndNotifs.feed,
  notifications: feedAndNotifs.notifs,
  inventory: INITIAL_INVENTORY,
  auditLogs: logs,
  maintenanceTickets: tickets,
  checklistTemplates: DEFAULT_TEMPLATES,
  roomTypes: INITIAL_ROOM_TYPES,
  settings: { instantConfirmation: false, theme: 'light' },
  toasts: [],
  isAuthenticated: false,
  isLocked: false
}

/* ─── Helpers ─── */
function getTemplateForRoom(templates, roomType) {
  return Object.values(templates).find(t => t.appliesTo.includes(roomType))
    || templates.Standard
}

/* ─── Reducer ─── */
function hotelReducer(state, action) {
  switch (action.type) {

    case 'LOGIN':
      return { ...state, isAuthenticated: true, activeStaff: action.payload || state.staff[0] }
    
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, isLocked: false }

    case 'LOCK_SYSTEM':
      return { ...state, isLocked: true }

    case 'UNLOCK_SYSTEM':
      return { ...state, isLocked: false }

    case 'UPDATE_ROOM_STATUS': {
      const now = new Date()
      const room = state.rooms.find(r => r.id === action.roomId)
      if (!room) return state
      const updatedRooms = state.rooms.map(r =>
        r.id === action.roomId ? { ...r, status: action.status, lastUpdated: now } : r
      )
      const feedEntry = {
        id: Date.now(),
        roomId: action.roomId,
        roomNumber: room.number,
        status: action.status,
        staff: state.activeStaff?.name || 'Staff',
        timestamp: now,
      }
      const notification = {
        id: Date.now() + 1,
        type: 'status_update',
        message: `Room ${room.number} → ${action.status}`,
        timestamp: now,
        read: false,
      }
      return {
        ...state,
        rooms: updatedRooms,
        activityFeed: [feedEntry, ...state.activityFeed].slice(0, 50),
        notifications: [notification, ...state.notifications].slice(0, 20),
      }
    }

    case 'SUBMIT_AUDIT': {
      const now = new Date()
      const { roomId, checkedItems, flaggedItems, consumptions } = action
      const room = state.rooms.find(r => r.id === roomId)
      if (!room) return state

      // Deduct inventory
      let newInventory = [...state.inventory]
      consumptions.forEach(({ itemId, qty }) => {
        newInventory = newInventory.map(inv =>
          inv.id === itemId ? { ...inv, qty: Math.max(0, inv.qty - qty) } : inv
        )
      })

      // Add low-stock flags from audit
      flaggedItems.filter(f => f.action === 'low_stock').forEach(f => {
        if (f.stockItem) {
          newInventory = newInventory.map(inv =>
            inv.id === f.stockItem ? { ...inv, qty: Math.max(0, inv.qty - 1) } : inv
          )
        }
      })

      // Create maintenance tickets for reported damages
      const newTickets = flaggedItems
        .filter(f => f.action === 'maintenance')
        .map(f => ({
          id: Date.now() + Math.random(),
          roomId,
          roomNumber: room.number,
          issue: f.label,
          checklistItemId: f.itemId,
          reportedBy: action.staffName,
          status: 'open',
          priority: 'normal',
          createdAt: now,
        }))

      // Update room status to ready
      const updatedRooms = state.rooms.map(r =>
        r.id === roomId ? { ...r, status: 'ready', lastUpdated: now } : r
      )

      // Audit log entry
      const total = checkedItems.length + flaggedItems.length
      const passed = checkedItems.length
      const auditLog = {
        id: Date.now(),
        roomId,
        roomNumber: room.number,
        roomType: room.type,
        staff: action.staffName,
        staffId: action.staffId,
        checkedCount: passed,
        totalCount: total,
        flaggedItems,
        consumptions,
        score: total > 0 ? Math.round((passed / total) * 100) : 100,
        timestamp: now,
      }

      // Activity feed entry
      const feedEntry = {
        id: Date.now() + 2,
        roomId,
        roomNumber: room.number,
        status: 'ready',
        staff: action.staffName,
        timestamp: now,
        auditScore: auditLog.score,
        flagged: flaggedItems.length,
      }

      const notif = {
        id: Date.now() + 3,
        type: 'audit',
        message: `Room ${room.number} audited (${auditLog.score}%)` + (flaggedItems.length > 0 ? ` · ${flaggedItems.length} issue(s)` : ''),
        timestamp: now,
        read: false,
      }

      // Low-stock notifications
      const lowStockNotifs = newInventory
        .filter(inv => inv.qty < inv.threshold && inv.qty >= 0)
        .map((inv, i) => ({
          id: Date.now() + 10 + i,
          type: 'low_stock',
          message: `⚠ Low stock: ${inv.name} (${inv.qty} ${inv.unit} remaining)`,
          timestamp: now,
          read: false,
        }))

      return {
        ...state,
        rooms: updatedRooms,
        inventory: newInventory,
        auditLogs: [auditLog, ...state.auditLogs],
        maintenanceTickets: [...state.maintenanceTickets, ...newTickets],
        activityFeed: [feedEntry, ...state.activityFeed].slice(0, 50),
        notifications: [...lowStockNotifs, notif, ...state.notifications].slice(0, 30),
      }
    }

    case 'UPDATE_INVENTORY_QTY': {
      return {
        ...state,
        inventory: state.inventory.map(inv =>
          inv.id === action.itemId ? { ...inv, qty: Math.max(0, action.qty) } : inv
        ),
      }
    }

    case 'RESTOCK_ITEM': {
      return {
        ...state,
        inventory: state.inventory.map(inv =>
          inv.id === action.itemId ? { ...inv, qty: inv.qty + action.qty } : inv
        ),
      }
    }

    case 'UPDATE_TICKET_STATUS': {
      return {
        ...state,
        maintenanceTickets: state.maintenanceTickets.map(t =>
          t.id === action.ticketId ? { ...t, status: action.status } : t
        ),
      }
    }

    case 'CREATE_TICKET': {
      const now = new Date()
      return {
        ...state,
        maintenanceTickets: [
          ...state.maintenanceTickets,
          {
            id: Date.now() + Math.random(),
            roomId: action.payload.roomId,
            roomNumber: action.payload.roomNumber,
            issue: action.payload.issue,
            reportedBy: action.payload.reportedBy || 'Guest',
            status: 'open',
            priority: action.payload.priority || 'normal',
            createdAt: now,
          }
        ]
      }
    }

    case 'SAVE_TEMPLATE': {
      return {
        ...state,
        checklistTemplates: {
          ...state.checklistTemplates,
          [action.template.id]: action.template,
        },
      }
    }

    case 'SET_ACTIVE_STAFF':
      return { ...state, activeStaff: action.staff }

    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }

    case 'UPDATE_ROOM_NOTES':
      return { ...state, rooms: state.rooms.map(r => r.id === action.roomId ? { ...r, notes: action.notes } : r) }

    case 'ADD_STAFF':
      return { 
        ...state, 
        staff: [...state.staff, { 
          id: Date.now(), 
          ...action.payload 
        }] 
      }
      
    case 'REMOVE_STAFF':
      return {
        ...state,
        staff: state.staff.filter(s => s.id !== action.id)
      }

    case 'ADD_BOOKING': {
      const isPublic = action.source === 'public'
      const status = isPublic ? (state.settings.instantConfirmation ? 'upcoming' : 'pending') : action.booking.status || 'upcoming'
      return {
        ...state,
        bookings: [
          {
            ...action.booking,
            id: Date.now(),
            confirmationNo: `HOS${String(Date.now()).slice(-5)}`,
            status,
            createdAt: new Date(),
          },
          ...state.bookings,
        ]
      }
    }

    case 'UPDATE_BOOKING':
      return { ...state, bookings: state.bookings.map(b => b.id === action.booking.id ? { ...b, ...action.booking } : b) }

    case 'DELETE_BOOKING':
      return { ...state, bookings: state.bookings.filter(b => b.id !== action.id) }

    case 'APPROVE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.id ? { ...b, status: 'upcoming', roomId: action.roomId || b.roomId } : b
        )
      }

    case 'REJECT_BOOKING':
      return { ...state, bookings: state.bookings.filter(b => b.id !== action.id) }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }

    case 'SAVE_ROOM_TYPE':
      return { ...state, roomTypes: { ...state.roomTypes, [action.roomType.id]: action.roomType } }

    case 'DELETE_ROOM_TYPE': {
      const newTypes = { ...state.roomTypes }
      delete newTypes[action.id]
      return { ...state, roomTypes: newTypes }
    }

    case 'ADD_TOAST': {
      return { ...state, toasts: [...state.toasts, action.toast] }
    }

    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }
    }

    default:
      return state
  }
}

/* ─── Context ─── */
const HotelContext = createContext(null)

export function HotelProvider({ children }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState)
  const listenersRef = useRef([])

  const updateRoomStatus = useCallback((roomId, status) => {
    dispatch({ type: 'UPDATE_ROOM_STATUS', roomId, status })
    listenersRef.current.forEach(fn => fn({ roomId, status }))
  }, [])

  const submitAudit = useCallback((payload) => {
    dispatch({ type: 'SUBMIT_AUDIT', ...payload })
    listenersRef.current.forEach(fn => fn({ roomId: payload.roomId, status: 'ready' }))
  }, [])

  const updateInventoryQty = useCallback((itemId, qty) => dispatch({ type: 'UPDATE_INVENTORY_QTY', itemId, qty }), [])
  const restockItem = useCallback((itemId, qty) => dispatch({ type: 'RESTOCK_ITEM', itemId, qty }), [])
  const updateTicketStatus = useCallback((ticketId, status) => dispatch({ type: 'UPDATE_TICKET_STATUS', ticketId, status }), [])
  const createTicket = useCallback((payload) => dispatch({ type: 'CREATE_TICKET', payload }), [])
  const saveTemplate = useCallback((template) => dispatch({ type: 'SAVE_TEMPLATE', template }), [])
  const setActiveStaff = useCallback((staff) => dispatch({ type: 'SET_ACTIVE_STAFF', staff }), [])
  const markNotificationsRead = useCallback(() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' }), [])
  const updateRoomNotes = useCallback((roomId, notes) => dispatch({ type: 'UPDATE_ROOM_NOTES', roomId, notes }), [])
  const addBooking = useCallback((booking, source) => dispatch({ type: 'ADD_BOOKING', booking, source }), [])
  const updateBooking = useCallback((booking) => dispatch({ type: 'UPDATE_BOOKING', booking }), [])
  const deleteBooking = useCallback((id) => dispatch({ type: 'DELETE_BOOKING', id }), [])
  const approveBooking = useCallback((id, roomId) => dispatch({ type: 'APPROVE_BOOKING', id, roomId }), [])
  const rejectBooking = useCallback((id) => dispatch({ type: 'REJECT_BOOKING', id }), [])
  const updateSettings = useCallback((settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings })
  }, [])
  const saveRoomType = useCallback((roomType) => dispatch({ type: 'SAVE_ROOM_TYPE', roomType }), [])
  const deleteRoomType = useCallback((id) => dispatch({ type: 'DELETE_ROOM_TYPE', id }), [])
  const addStaff = useCallback((payload) => dispatch({ type: 'ADD_STAFF', payload }), [])
  const removeStaff = useCallback((id) => dispatch({ type: 'REMOVE_STAFF', id }), [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString()
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } })
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', id })
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', id }), [])

  const login = useCallback((staff) => dispatch({ type: 'LOGIN', payload: staff }), [])
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])
  const lockSystem = useCallback(() => dispatch({ type: 'LOCK_SYSTEM' }), [])
  const unlockSystem = useCallback(() => dispatch({ type: 'UNLOCK_SYSTEM' }), [])

  // Sync theme to root element
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme || 'light'
  }, [state.settings.theme])

  const subscribeToUpdates = useCallback((fn) => {
    listenersRef.current.push(fn)
    return () => { listenersRef.current = listenersRef.current.filter(f => f !== fn) }
  }, [])

  const getTemplateForRoom = useCallback((roomType) => {
    return Object.values(state.checklistTemplates).find(t => t.appliesTo.includes(roomType))
      || state.checklistTemplates.Standard
  }, [state.checklistTemplates])

  const value = {
    ...state,
    updateRoomStatus, submitAudit,
    updateInventoryQty, restockItem, updateTicketStatus, createTicket, saveTemplate,
    setActiveStaff, markNotificationsRead, updateRoomNotes,
    addBooking, updateBooking, deleteBooking, approveBooking, rejectBooking,
    updateSettings, saveRoomType, deleteRoomType, addStaff, removeStaff,
    addToast, removeToast,
    login, logout, lockSystem, unlockSystem,
    subscribeToUpdates, getTemplateForRoom,
  }

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
}

export function useHotel() {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotel must be used within HotelProvider')
  return ctx
}

/* ─── Helpers ─── */
export const STATUS_LABELS = {
  available: 'Available', dirty: 'Dirty', cleaning: 'Cleaning',
  ready: 'Ready', occupied: 'Occupied',
}

export const STATUS_ORDER = ['available', 'dirty', 'cleaning', 'ready', 'occupied']

export function timeAgo(date) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
