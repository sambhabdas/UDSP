// Work Summary's seed, lifted from WorkSummary.dc.html.
//
// The day has three streams that have to agree: the service-type table (what
// the Amazon file says ran), the rescue table (what Dispatch says happened),
// and Load Out's count of launched rows. The page exists to show where they
// disagree.

/** Who edits, and the stamp every note carries. */
export const ME = 'R. GUTIERREZ'
export const STAMP_TIME = '7:58'

/** The day the page opens on. Local-time parts only, so it is TZ-stable. */
export const BASE_DAY = { y: 2026, m: 6, d: 29 }

/** Load Out's launched-row count for the day. Routes Ran is checked against it. */
export const LAUNCHED = 29

/** Delivered on the two file rows that matched no service type. */
export const UNMATCHED_DELIVERED = 96

export type PaidBy = 'Amazon' | 'DSP'

export interface ServiceType {
  id: string
  name: string
  hrs: number
  paid: PaidBy
  /** The Amazon service-type string the weekly file is matched on. */
  amz: string
  veh: string[]
  /** The one row whose count is fed by the rescue table's Unpaid marks. */
  fed: boolean
}

/** What the Amazon file says for a type: allocated, late-cancelled, dropped, delivered. */
export interface FileCounts {
  a: number
  c: number
  d: number
  del: number
}

export interface Rescue {
  id: string
  rescuer: string | null
  rescued: string
  route: string
  where: string
  totes: number | null
  assigned: boolean
}

export interface Note {
  txt: string
  who: string
  when: string
}

export type Mark = 'paid' | 'unpaid'

export type Status = 'pending' | 'match' | 'disputed'

export const SEED_TYPES: ServiceType[] = [
  { id: 't1', name: 'DLX5 Delivery Associate', hrs: 10, paid: 'Amazon', amz: 'Standard Parcel - Delivery Van - US', veh: ['Delivery Van'], fed: false },
  { id: 't2', name: 'Large Van', hrs: 10, paid: 'Amazon', amz: 'Standard Parcel - Large Van - US', veh: ['Large Van'], fed: false },
  { id: 't3', name: 'CDV', hrs: 8, paid: 'Amazon', amz: 'Standard Parcel - CDV - US', veh: ['CDV'], fed: false },
  { id: 't4', name: 'DOT Step Van Driver', hrs: 10, paid: 'Amazon', amz: 'Standard Parcel - Step Van - US', veh: ['Step Van'], fed: false },
  { id: 't5', name: 'Adhoc', hrs: 10, paid: 'DSP', amz: '', veh: ['Delivery Van'], fed: false },
  { id: 't6', name: 'Unpaid Rescues', hrs: 4, paid: 'DSP', amz: '', veh: [], fed: true },
]

export const SEED_FILE: Record<string, FileCounts> = {
  t1: { a: 17, c: 1, d: 0, del: 4236 },
  t2: { a: 4, c: 0, d: 1, del: 812 },
  t3: { a: 2, c: 0, d: 0, del: 384 },
  t4: { a: 6, c: 0, d: 0, del: 1566 },
}

/** Counts typed over the file's, keyed by type. */
export const SEED_MANUAL: Record<string, number> = { t5: 1 }

export const SEED_TYPE_NOTES: Record<string, Note> = {
  t2: { txt: 'Drop was CX298', who: ME, when: STAMP_TIME },
}

export const SEED_MARKS: Record<string, Mark> = { x1: 'unpaid' }

export const SEED_RESCUES: Rescue[] = [
  { id: 'x1', rescuer: 'MENDEZ, GABRIEL', rescued: 'DIAZ, DAVID', route: 'CX252', where: '1420 W Olympic Blvd', totes: 32, assigned: true },
  { id: 'x2', rescuer: null, rescued: 'CANDIA, MARISOL', route: 'CX255', where: '88 Mateo St', totes: 41, assigned: false },
  { id: 'x3', rescuer: 'CRUZ, ADRIAN', rescued: 'EGUEZ, RAMON', route: 'CX261', where: '415 S Grand Ave', totes: 23, assigned: true },
]

/** File rows that matched no service type. Adding one opens the type form. */
export const UNMATCHED = [
  { raw: 'Standard Parcel - XL Van - US - 9 hr', a: 1, del: 64 },
  { raw: 'Nursery Route - US - 4 hr', a: 1, del: 32 },
]

/** Service types that can be added without typing one out. */
export const CATALOG = [
  { name: 'Extra Large Van', hrs: 9, amz: 'Standard Parcel - XL Van - US', veh: ['Large Van'] },
  { name: 'Nursery Route', hrs: 4, amz: 'Nursery Route - US', veh: ['Delivery Van'] },
  { name: 'DLX5 Delivery Associate', hrs: 9, amz: 'Standard Parcel - Delivery Van - US', veh: ['Delivery Van'] },
  { name: 'DOT Step Van Driver', hrs: 9, amz: 'Standard Parcel - Step Van - US', veh: ['Step Van'] },
  { name: 'Helper', hrs: 8, amz: '', veh: [] },
  { name: 'Yard Shift', hrs: 8, amz: '', veh: [] },
]

/** Drivers a rescue can be opened for, with the route they were on. */
export const RESCUE_POOL: [string, string][] = [
  ['KOEHLER, BRETT', 'CX259'],
  ['HARRIS, DEON', 'CX276'],
  ['KNOKE, PAUL', 'CX286'],
  ['VACA, ELENA', 'CX270'],
  ['URIARTE, KAT', 'CX268'],
  ['WILD, MARCO', 'CX290'],
]

export const VEHICLE_TYPES = ['Delivery Van', 'Large Van', 'CDV', 'Step Van']
export const HOURS_OPTIONS = [4, 8, 9, 10]

export const STATUS_TONES: Record<Status, [string, string, string, string]> = {
  pending: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'Pending'],
  match: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'Match With Amazon'],
  disputed: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'Disputed'],
}

export type TypeSortKey = 'name' | 'hrs' | 'alloc' | 'cancel' | 'dropped' | 'delivered' | 'notes' | 'ran'
export type RescSortKey = 'pair' | 'route' | 'where' | 'totes' | 'state' | 'notes' | 'paid'

export const TYPE_HEADERS: [string, TypeSortKey][] = [
  ['Service Type', 'name'],
  ['Hrs', 'hrs'],
  ['Allocated', 'alloc'],
  ['Late Cancel', 'cancel'],
  ['Dropped', 'dropped'],
  ['Delivered', 'delivered'],
  ['Notes', 'notes'],
  ['Routes Ran', 'ran'],
]

export const RESC_HEADERS: [string, RescSortKey][] = [
  ['Rescuer → Rescued', 'pair'],
  ['Route', 'route'],
  ['Where', 'where'],
  ['Totes', 'totes'],
  ['State', 'state'],
  ['Notes', 'notes'],
  ['Paid?', 'paid'],
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function dateLabel(d: Date): string {
  return `${DAYS[d.getDay()]} ${MONS[d.getMonth()]} ${d.getDate()}`
}
