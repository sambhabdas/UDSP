// Associates — the roster the whole console hangs off.
//
// Everything here is the seed the design file carries verbatim. The rows below
// the roster (this week, the activity feed, shifts, events, route history, the
// timecard, the documents) are a single worked example rather than per-DA data:
// the design file renders the same set for whoever is open and bends only the
// handful of cells that read off the current record. Where a row does that,
// it is a function of the DA rather than a constant.

export type Status = 'active' | 'inactive'
export type Uda = 'active' | 'invited' | 'not invited'

export interface Exclusion {
  reason: string
  until: string
}

export interface Da {
  id: string
  name: string
  /** Amazon's transporter ID — the identity every import joins on. */
  tr: string
  /** Paycom's employee code. Blank means payroll has no record yet. */
  ee: string
  phone: string
  email: string
  quals: string[]
  veh: string[]
  status: Status
  inactiveSince?: string
  /** All-time net of non-voided Events. */
  net: number
  next: string
  hoursPP: number
  abs: number
  pto: number
  tenure: number
  started: string
  uda: Uda
  /** An overdue blocking coaching assignment gates the shift. */
  blocked?: boolean
  /** Quiz passed, acknowledgement not in. */
  awaitingAck?: boolean
  excluded?: Exclusion
  /** The route they are on today, from the last itineraries import. */
  onRoute: string | null
}

/** Who is signed in — the name the manual Events carry. */
export const ME = 'R. GUTIERREZ'

export const DAS: Da[] = [
  { id: 'd1', name: 'ALVARENGA, CARLOS', tr: 'A3TP7284XQ', ee: '40103', phone: '(213) 555-0103', email: 'c.alvarenga@mail.com', quals: ['DOT'], veh: ['Delivery Van'], status: 'active', net: 186, next: 'Fri · DOT 7:00 (10h)', hoursPP: 62, abs: 0, pto: 0, tenure: 28, started: 'Mar 3, 2024', uda: 'active', onRoute: 'CX248' },
  { id: 'd2', name: 'DIAZ, DAVID', tr: 'A3TP1180DD', ee: '40104', phone: '(213) 555-0104', email: 'd.diaz@mail.com', quals: ['DOT', 'Step Van'], veh: ['Delivery Van', 'Step Van'], status: 'active', net: -58, next: 'Thu · DOT 7:30 (10h)', hoursPP: 58, abs: 1, pto: 1, tenure: 14, started: 'Jun 12, 2025', uda: 'active', onRoute: 'CX252' },
  { id: 'd3', name: 'MENDEZ, GABRIEL', tr: 'A3TP5521GM', ee: '40105', phone: '(213) 555-0105', email: 'g.mendez@mail.com', quals: ['DOT'], veh: ['Delivery Van'], status: 'active', net: 44, next: 'Wed · DOT 7:30 (10h)', hoursPP: 60, abs: 0, pto: 1, tenure: 19, started: 'Jan 20, 2025', uda: 'active', onRoute: null },
  { id: 'd4', name: 'RAIGOSA, PETER', tr: 'A3TP9034PR', ee: '40106', phone: '(213) 555-0106', email: 'p.raigosa@mail.com', quals: ['DOT'], veh: ['Delivery Van'], status: 'active', net: -71, next: 'Wed · DOT 7:30 (10h)', hoursPP: 54, abs: 2, pto: 0, tenure: 9, started: 'Nov 2, 2025', uda: 'invited', blocked: true, awaitingAck: false, onRoute: 'CX272' },
  { id: 'd5', name: 'VACA, ELENA', tr: 'A3TP2209EV', ee: '40107', phone: '(213) 555-0107', email: 'e.vaca@mail.com', quals: ['DOT', 'EV'], veh: ['Delivery Van', 'CDV'], status: 'active', net: 131, next: 'Wed · DOT 7:45 (10h)', hoursPP: 62, abs: 0, pto: 0, tenure: 23, started: 'Sep 9, 2024', uda: 'active', onRoute: 'CX270' },
  { id: 'd6', name: 'SUAZO, MARTIN', tr: 'A3TP6690SM', ee: '40108', phone: '(213) 555-0108', email: 'm.suazo@mail.com', quals: ['DOT'], veh: ['Delivery Van'], status: 'active', net: 6, next: 'Wed · DOT 7:30 (10h)', hoursPP: 56, abs: 1, pto: 0, tenure: 11, started: 'Sep 29, 2025', uda: 'active', awaitingAck: true, onRoute: 'CX271' },
  { id: 'd7', name: 'FLORENDO, ROSS', tr: 'A3TP8823FR', ee: '', phone: '(213) 555-0144', email: '', quals: ['Non-DOT'], veh: [], status: 'active', net: 12, next: '-', hoursPP: 40, abs: 0, pto: 2, tenure: 6, started: 'Feb 16, 2026', uda: 'not invited', excluded: { reason: 'Leave', until: 'Aug 8' }, onRoute: null },
  { id: 'd8', name: 'URIARTE, KAT', tr: 'A3TP3318KU', ee: '40110', phone: '(213) 555-0110', email: 'k.uriarte@mail.com', quals: ['DOT'], veh: ['Delivery Van'], status: 'active', net: 61, next: 'Thu · DOT 4:45 (10h)', hoursPP: 62, abs: 0, pto: 0, tenure: 31, started: 'Jan 8, 2024', uda: 'active', onRoute: 'CX268' },
  { id: 'd9', name: 'WILD, MARCO', tr: 'A3TP7712MW', ee: '40111', phone: '(213) 555-0111', email: 'm.wild@mail.com', quals: ['DOT', 'Step Van'], veh: ['Step Van'], status: 'active', net: -12, next: 'Wed · DOT 8:00 (10h)', hoursPP: 50, abs: 1, pto: 1, tenure: 8, started: 'Dec 15, 2025', uda: 'active', onRoute: 'CX290' },
  { id: 'd10', name: 'STROSKA, ANGELO', tr: 'A3TP0007AS', ee: '40112', phone: '(213) 555-0112', email: 'a.stroska@mail.com', quals: ['Non-DOT'], veh: ['Delivery Van'], status: 'inactive', inactiveSince: 'Jul 2, 2026', net: 20, next: '-', hoursPP: 0, abs: 0, pto: 0, tenure: 16, started: 'Apr 21, 2025', uda: 'invited', onRoute: null },
]

/** The active coaching library — [module, category]. */
export const MODULES: [string, string][] = [
  ['Safe Backing', 'Safety'],
  ['Speeding Awareness', 'Safety'],
  ['Customer Delivery Feedback', 'CDF'],
  ['Photo On Delivery', 'DSB'],
  ['Attendance Expectations', 'Work Ethics'],
]

export type CoachState = 'Overdue' | 'Assigned' | 'Awaiting Ack' | 'Acknowledged' | 'Clear'

export interface Coaching {
  module: string
  due: string
  state: CoachState
  blocking?: boolean
}

const COACHING: Record<string, Coaching[]> = {
  d4: [
    { module: 'Safe Backing', due: 'Due Jul 26', state: 'Overdue', blocking: true },
    { module: 'Speeding Awareness', due: 'Due Aug 2', state: 'Assigned' },
  ],
  d6: [{ module: 'Photo On Delivery', due: 'Due Jul 30', state: 'Awaiting Ack' }],
  d2: [{ module: 'Customer Delivery Feedback', due: 'Done Jul 18', state: 'Acknowledged' }],
}

/** Nobody else has anything open. */
export function coachingOf(id: string): Coaching[] {
  return COACHING[id] ?? []
}

export const QUALS = ['DOT', 'Non-DOT', 'Step Van', 'EV']
export const VEH_TYPES = ['Delivery Van', 'Large Van', 'CDV', 'Step Van']
export const EXCLUSION_REASONS = ['New Hire', 'Suspended', 'Leave', 'Other']

/** The filter drawer's four sections — [key, label, options, kind]. */
export type FilterKey = 'status' | 'quals' | 'veh' | 'flags'

export const FILTER_SECTIONS: [FilterKey, string, string[], 'radio' | 'multi'][] = [
  ['status', 'Status', ['Active', 'All', 'Inactive'], 'radio'],
  ['quals', 'Qualification', QUALS, 'multi'],
  ['veh', 'Vehicle Type', [...VEH_TYPES, 'None'], 'multi'],
  ['flags', 'Flags', ['Blocked', 'At Risk', 'Excluded', 'Awaiting Ack'], 'multi'],
]

// ── The profile's worked example ────────────────────────────────────────────

export interface FeedRow {
  when: string
  tag: string
  tone: FeedTone
  txt: string
}

export type FeedTone = 'danger' | 'blue' | 'mut' | 'ok'

export const FEED_ROWS: FeedRow[] = [
  { when: 'Jul 28', tag: 'Event', tone: 'danger', txt: `Speeding - telematics · -20 · logged by ${ME}` },
  { when: 'Jul 27', tag: 'Coach', tone: 'blue', txt: 'Safe Backing assigned · due Jul 26 · blocking' },
  { when: 'Jul 24', tag: 'Call', tone: 'mut', txt: 'Outbound call · 3 min · logged to the timeline' },
  { when: 'Jul 21', tag: 'Kudo', tone: 'ok', txt: 'Helped stage three vans before wave 1' },
  { when: 'Jul 19', tag: 'Shift', tone: 'mut', txt: 'Shift added Fri Aug 7 · DOT 7:00 (10h) · manual' },
]

export const SHIFT_HEADERS = ['Date', 'Department', 'Start (Length)', 'Hours', 'Source', 'Flags']

export interface ShiftRow {
  date: string
  bold?: boolean
  dep: string
  /** A day with no shift greys the department, start and hours together. */
  off?: boolean
  start: string
  hrs: string
  source: string
  flag: string
  flagColor: string
  /** Today's row reads its flag off the live board rather than the seed. */
  live?: boolean
  highlight?: boolean
}

export const SHIFT_ROWS: ShiftRow[] = [
  { date: 'Wed Jul 29', bold: true, dep: 'DOT', start: '7:30 (10h)', hrs: '10', source: 'Auto', flag: '', flagColor: 'var(--success-fg)', live: true, highlight: true },
  { date: 'Thu Jul 30', dep: 'DOT', start: '7:30 (10h)', hrs: '10', source: 'Auto', flag: '', flagColor: 'var(--text-secondary)' },
  { date: 'Fri Jul 31', dep: 'DOT', start: '7:00 (10h)', hrs: '10', source: 'Manual', flag: 'Hits the 50 h rolling cap', flagColor: 'var(--danger-fg)' },
  { date: 'Sat Aug 1', dep: 'Not scheduled', off: true, start: '-', hrs: '-', source: '-', flag: 'Weekly pattern OFF', flagColor: 'var(--text-secondary)' },
  { date: 'Sun Aug 2', dep: 'Not scheduled', off: true, start: '-', hrs: '-', source: '-', flag: 'Time Off (8h)', flagColor: 'var(--text-secondary)' },
  { date: 'Mon Aug 3', dep: 'DOT', start: '7:30 (10h)', hrs: '10', source: 'Auto', flag: '', flagColor: 'var(--text-secondary)' },
]

export const EV_HEADERS = ['Date', 'Standard', 'Category', 'Points', 'Note']

export interface EventRow {
  date: string
  std: string
  cat: string
  catTone: 'danger' | 'blue' | 'ok' | 'warn' | 'mut'
  pts: string
  /** Points colour follows the sign, not the category. */
  gain?: boolean
  note: string
}

export const EV_ROWS: EventRow[] = [
  { date: 'Jul 28', std: 'Speeding - Telematics', cat: 'Safety', catTone: 'danger', pts: '-20', note: `Logged by ${ME}` },
  { date: 'Jul 22', std: 'Photo On Delivery', cat: 'DSB', catTone: 'blue', pts: '-8', note: 'From the weekly import' },
  { date: 'Jul 21', std: 'Helping PT', cat: 'Helping PT', catTone: 'ok', pts: '+15', gain: true, note: 'Staged three vans before wave 1' },
  { date: 'Jul 12', std: 'Customer Delivery Feedback', cat: 'CDF', catTone: 'warn', pts: '-10', note: 'Auto-coach fired - module paired' },
  { date: 'Jun 30', std: 'On-Time Attendance', cat: 'Work Ethics', catTone: 'mut', pts: '+5', gain: true, note: 'Perfect week' },
]

export const RT_HEADERS = ['Date', 'Route', 'Van', 'Wave', 'Punched In', 'RTS']

export const TC_HEADERS = ['Date', 'Scheduled', 'In / Out', 'Worked', 'PTO', 'Source']

export interface TimecardRow {
  date: string
  bold?: boolean
  sched: string
  /** A day with no scheduled shift greys its own label. */
  quiet?: boolean
  pto: string
  ptoPaid?: boolean
  src: string
  highlight?: boolean
}

export const TC_ROWS: TimecardRow[] = [
  { date: 'Sun Jul 19', sched: '-', quiet: true, pto: '-', src: '-' },
  { date: 'Mon Jul 20', sched: 'DOT 7:30 (10h)', pto: '-', src: 'Auto' },
  { date: 'Tue Jul 21', sched: 'DOT 7:30 (10h)', pto: '-', src: 'Auto' },
  { date: 'Wed Jul 22', sched: '-', quiet: true, pto: '8.0', ptoPaid: true, src: 'Time Off' },
  { date: 'Thu Jul 23', sched: 'DOT 7:30 (10h)', pto: '-', src: 'Auto' },
  { date: 'Fri Jul 24', sched: 'DOT 7:00 (10h)', pto: '-', src: 'Manual' },
  { date: 'Wed Jul 29', bold: true, sched: 'DOT 7:30 (10h)', pto: '-', src: 'Auto', highlight: true },
]

export const TC_TOTALS = { sched: '62.0 h', pto: '16.0 h', shifts: '7' }

export interface DocRow {
  date: string
  txt: string
  state: string
  tone: 'danger' | 'ok' | 'mut'
}

export const DOC_ROWS: DocRow[] = [
  { date: 'Jul 27', txt: 'Safe Backing - assigned, blocking, due Jul 26', state: 'Overdue', tone: 'danger' },
  { date: 'Jul 18', txt: 'Customer Delivery Feedback - typed name, timestamp, statement snapshot', state: 'Acknowledged', tone: 'ok' },
  { date: 'Jun 12', txt: 'Photo On Delivery - typed name, timestamp, statement snapshot', state: 'Acknowledged', tone: 'ok' },
  { date: 'May 8', txt: 'Attendance Expectations - closed by the Owner, no DA acknowledgement', state: 'Manual', tone: 'mut' },
]
