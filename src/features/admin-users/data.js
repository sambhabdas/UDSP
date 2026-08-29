// Seed for Admin · Users, from AdminUsers.dc.html.
//
// Two populations that are never the same list: PORTAL USERS hold one of the
// five posts and consume a seat, and DAs are roster drivers whose only surface
// is the phone app. A DA is not a portal user, so it has no role, no seat and
// no email — it has a transporter ID and a number to text an invite to.

export const SEAT_CAP = 12

export const ROLES = ['Owner', 'Sub Admin', 'Manager', 'Operations', 'Finance']
// Ownership moves only by Transfer ownership, so Owner is never offered here.
export const ASSIGNABLE_ROLES = ['Sub Admin', 'Manager', 'Operations', 'Finance']
export const STATUSES = ['Active', 'Invited', 'Deactivated']
export const DA_STATES = ['active', 'invited', 'not invited']

export const SEED_USERS = [
  { id: 1, name: 'Dana Whitfield', mobile: '(815) 555-0114', email: 'dana@cedarridge.com', role: 'Owner', lastActive: '2 min ago', status: 'Active' },
  { id: 2, name: 'Priya Raman', mobile: '(815) 555-0187', email: 'priya@cedarridge.com', role: 'Sub Admin', lastActive: '1 h ago', status: 'Active' },
  { id: 3, name: 'Marcus Bell', mobile: '(815) 555-0165', email: 'marcus@cedarridge.com', role: 'Manager', lastActive: 'Today 06:12', status: 'Active' },
  { id: 4, name: 'Elena Cruz', mobile: '(815) 555-0142', email: 'elena@cedarridge.com', role: 'Operations', lastActive: '4 min ago', status: 'Active' },
  { id: 5, name: 'Tommy Nguyen', mobile: '(815) 555-0131', email: 'tommy@cedarridge.com', role: 'Operations', lastActive: 'Yesterday', status: 'Active' },
  { id: 6, name: 'Gene Park', mobile: '-', email: 'gene@cedarridge.com', role: 'Finance', lastActive: '08/12', status: 'Active' },
  { id: 7, name: 'Rita Solis', mobile: '-', email: 'rita@cedarridge.com', role: 'Operations', lastActive: '-', status: 'Invited' },
  { id: 8, name: 'Owen Marsh', mobile: '(815) 555-0109', email: 'owen@cedarridge.com', role: 'Manager', lastActive: '03/02', status: 'Deactivated' },
]

export const SEED_DAS = [
  { id: 1, name: 'ALVARENGA, C', tid: 'A1B2C3D4E5F6', phone: '(815) 555-0221', state: 'active', invitedOn: '06/04', lastSeen: 'Today' },
  { id: 2, name: 'ASUTAY, YUSUF', tid: 'B2C3D4E5F6A1', phone: '(815) 555-0234', state: 'active', invitedOn: '06/04', lastSeen: 'Today' },
  { id: 3, name: 'DIAZ, DAVID', tid: 'C3D4E5F6A1B2', phone: '(815) 555-0246', state: 'active', invitedOn: '06/04', lastSeen: 'Yesterday' },
  { id: 4, name: 'GARCIA, ANDY', tid: 'D4E5F6A1B2C3', phone: '(815) 555-0252', state: 'not invited', invitedOn: '-', lastSeen: '-' },
  { id: 5, name: 'MENDEZ, GABRIEL', tid: 'E5F6A1B2C3D4', phone: '(815) 555-0263', state: 'active', invitedOn: '06/11', lastSeen: 'Today' },
  { id: 6, name: 'RAIGOSA, O', tid: 'F6A1B2C3D4E5', phone: '(815) 555-0275', state: 'invited', invitedOn: '08/09', lastSeen: '-' },
  { id: 7, name: 'SHAW, KELLY', tid: 'A2B3C4D5E6F1', phone: '', state: 'not invited', invitedOn: '-', lastSeen: '-' },
  { id: 8, name: 'SUAZO, MARCO', tid: 'B3C4D5E6F1A2', phone: '(815) 555-0290', state: 'invited', invitedOn: '08/11', lastSeen: '-' },
  { id: 9, name: 'VEGA, MARIA', tid: 'C4D5E6F1A2B3', phone: '(815) 555-0302', state: 'active', invitedOn: '06/04', lastSeen: '08/13' },
  { id: 10, name: 'WOODS, TANYA', tid: 'D5E6F1A2B3C4', phone: '(815) 555-0315', state: 'active', invitedOn: '06/04', lastSeen: 'Today' },
  { id: 11, name: 'YOUNG, DESHAWN', tid: 'E6F1A2B3C4D5', phone: '(815) 555-0327', state: 'not invited', invitedOn: '-', lastSeen: '-' },
]

// A dot as well as a colour — status is never carried by hue alone.
export const STATUS_TONE = {
  Active: { dot: 'var(--success-accent)', fg: 'var(--success-fg)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
  Invited: { dot: 'var(--warning-accent)', fg: 'var(--warning-fg)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
  Deactivated: { dot: 'var(--neutral-400)', fg: 'var(--text-secondary)', bg: 'var(--surface-subtle)', border: 'var(--border-default)' },
}

export const DA_TONE = {
  active: { dot: 'var(--success-accent)', fg: 'var(--success-fg)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
  invited: { dot: 'var(--warning-accent)', fg: 'var(--warning-fg)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
  'not invited': { dot: 'var(--danger-accent)', fg: 'var(--danger-fg)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
}

// Sort order for the status column: the states in the order you act on them.
export const STATUS_ORDER = { Active: 0, Invited: 1, Deactivated: 2 }
export const DA_ORDER = { 'not invited': 0, invited: 1, active: 2 }

export const USER_HEADS = [
  { k: 'name', label: 'User', flex: 1.4, min: 120 },
  { k: 'mobile', label: 'Mobile', w: 110 },
  { k: 'email', label: 'Email', flex: 1.6, min: 150 },
  { k: 'role', label: 'Role', w: 120 },
  { k: 'last', label: 'Last active', w: 116 },
  { k: 'status', label: 'Status', w: 104 },
  { k: null, label: 'Actions', w: 72, center: true },
]

export const DA_HEADS = [
  { k: 'name', label: 'DA', flex: 1.4, min: 130 },
  { k: 'tid', label: 'Transporter ID', w: 120 },
  { k: 'phone', label: 'Phone', w: 120 },
  { k: 'state', label: 'App state', w: 104 },
  { k: 'invited', label: 'Invited on', w: 90 },
  { k: 'seen', label: 'Last seen', w: 90 },
  { k: null, label: 'Actions', w: 72, center: true },
]

export const IMPORT_FIELDS = {
  portal: ['name', 'email', 'mobile', 'role'],
  da: ['name', 'transporter_id', 'phone'],
}

export const IMPORT_FILE = { portal: 'users-aug.csv', da: 'roster-aug.csv' }

// The date an invite is stamped with in this seed.
export const INVITE_STAMP = '08/17'

// Reasons a menu item is dark. Stated rather than left as a greyed mystery.
export const WHY = {
  ownerLocked: 'Only the account owner can change the owner.',
  noInviteToResend: 'Only an invited account has a link to re-send.',
  hasHistory: 'Deactivate instead. This account has history that must be kept.',
  daActive: 'Nothing to re-send. An active account signs in with its email and password.',
  noNumber: 'No number on file.',
  noAccount: 'No account exists.',
}

export const REMOVE_BODY =
  'The row is deleted permanently. An account with history is deactivated instead, never removed.'
