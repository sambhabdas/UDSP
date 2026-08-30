// Events — the scorecard ledger and the coaching loop it opens.
//
// Three readings of the same coaching cycle: every event that scored (All),
// every assignment still owed (Open), and every one closed out (Completed).

export interface Standard {
  name: string
  cat: string
  neg: number
  pos: number
  per: string
}

export const STANDARDS: Standard[] = [
  { name: 'Seatbelt', cat: 'Safety', neg: 60, pos: 1, per: 'per valid violation' },
  { name: 'Speeding', cat: 'Safety', neg: 60, pos: 1, per: 'per valid violation' },
  { name: 'Distractions', cat: 'Safety', neg: 45, pos: 1, per: 'per valid violation' },
  { name: 'Following Distance', cat: 'Safety', neg: 35, pos: 1, per: 'per valid violation' },
  { name: 'Delivered Over 50 Meters', cat: 'DSB', neg: 100, pos: 0, per: 'per event' },
  { name: 'Mishandled Package', cat: 'CDF', neg: 8, pos: 0, per: 'per event' },
  { name: 'DVIC Not Done', cat: 'DVIC', neg: 10, pos: 0.1, per: 'per event' },
  { name: 'Unexcused Absence', cat: 'Work Ethics', neg: 30, pos: 1, per: 'per event' },
  { name: 'Damage', cat: 'Work Ethics', neg: 10, pos: 1, per: 'per dollar' },
  { name: 'Helped Dispatch', cat: 'Helping PT', neg: 0, pos: 30, per: 'per event' },
  { name: 'Shift Pick-Up', cat: 'Helping PT', neg: 0, pos: 30, per: 'per event' },
]

export interface LedgerRow {
  /** Day of August, used for both the window filter and date sorting. */
  day: number
  date: string
  da: string
  standard: string
  cat: string
  pts: number
  source: string
  module?: string
  coach?: string
  /** Shown in the module column when there is no module to name. */
  plain?: string
  plainAmber?: boolean
  voided?: boolean
}

export const LEDGER: LedgerRow[] = [
  { day: 17, date: 'Aug 17', da: 'Marcus Webb', standard: 'Speeding', cat: 'Safety', pts: -60, source: 'Netradyne import', module: 'Safe Speed Coaching', coach: 'Overdue' },
  { day: 17, date: 'Aug 17', da: 'Jorge Ruiz', standard: 'Seatbelt', cat: 'Safety', pts: -60, source: 'Netradyne import', module: 'Seatbelt Safety 101', coach: 'Overdue' },
  { day: 16, date: 'Aug 16', da: 'Tina Alvarez', standard: 'Mishandled Package', cat: 'CDF', pts: -8, source: 'CDF import', module: 'Package Handling Basics', coach: 'Assigned' },
  { day: 16, date: 'Aug 16', da: 'Priya Shah', standard: 'Shift Pick-Up', cat: 'Helping PT', pts: 30, source: 'Manual · K. Ortiz', plain: '-' },
  { day: 15, date: 'Aug 15', da: 'Dana Kim', standard: 'Distractions', cat: 'Safety', pts: -45, source: 'Netradyne import', module: 'Distraction-Free Driving', coach: 'Due Today' },
  { day: 15, date: 'Aug 15', da: 'Chris Boone', standard: 'Delivered Over 50 Meters', cat: 'DSB', pts: -100, source: 'DSB import', module: 'Delivery Distance Rules', coach: 'Awaiting Acknowledgement' },
  { day: 14, date: 'Aug 14', da: 'Leah Grant', standard: 'DVIC Not Done', cat: 'DVIC', pts: -10, source: 'DVIC import', plain: 'No module', plainAmber: true },
  { day: 14, date: 'Aug 14', da: 'Alex Chen', standard: 'Helped Dispatch', cat: 'Helping PT', pts: 30, source: 'Manual · K. Ortiz', plain: '-' },
  { day: 13, date: 'Aug 13', da: 'Marcus Webb', standard: 'Following Distance', cat: 'Safety', pts: -35, source: 'Netradyne import', module: 'Safe Following Distance', coach: 'Completed' },
  { day: 12, date: 'Aug 12', da: 'Nina Torres', standard: 'Unexcused Absence', cat: 'Work Ethics', pts: -30, source: 'Manual · K. Ortiz', module: 'Attendance Matters', coach: 'Assigned' },
  { day: 11, date: 'Aug 11', da: 'David Park', standard: 'Damage', cat: 'Work Ethics', pts: -40, source: 'Manual · K. Ortiz', plain: '-' },
  { day: 10, date: 'Aug 10', da: 'Sam Ortiz', standard: 'Speeding', cat: 'Safety', pts: -60, source: 'Netradyne import', voided: true, plain: '-' },
]

export interface OpenRow {
  due: string
  /** Negative is late, 0 is today — what the Due column sorts on. */
  dueN: number
  red?: boolean
  amber?: boolean
  da: string
  standard: string | null
  cat?: string
  module: string
  assigned: string
  status: string
  blocked?: boolean
  reminded: string | null
  /** Days since the last reminder; 99 stands in for "never". */
  remN: number
  phone: string
}

export const OPEN_LIST: OpenRow[] = [
  { due: '2 days late', dueN: -2, red: true, da: 'Marcus Webb', standard: 'Speeding', cat: 'Safety', module: 'Safe Speed Coaching', assigned: 'Aug 10, 07:12', status: 'Overdue · Blocked', blocked: true, reminded: '2 days ago', remN: 2, phone: '(555) 214-8890' },
  { due: '5 days late', dueN: -5, red: true, da: 'Jorge Ruiz', standard: 'Seatbelt', cat: 'Safety', module: 'Seatbelt Safety 101', assigned: 'Aug 6, 07:04', status: 'Overdue · Blocked', blocked: true, reminded: '5 days ago', remN: 5, phone: '(555) 118-4471' },
  { due: 'Today', dueN: 0, amber: true, da: 'Dana Kim', standard: 'Distractions', cat: 'Safety', module: 'Distraction-Free Driving', assigned: 'Aug 15, 07:20', status: 'Due Today', reminded: 'Yesterday', remN: 1, phone: '(555) 380-1123' },
  { due: 'In 1 day', dueN: 1, da: 'Chris Boone', standard: 'Delivered Over 50 Meters', cat: 'DSB', module: 'Delivery Distance Rules', assigned: 'Aug 15, 07:20', status: 'Awaiting Acknowledgement', reminded: null, remN: 99, phone: '(555) 402-7741' },
  { due: 'In 3 days', dueN: 3, da: 'Tina Alvarez', standard: 'Mishandled Package', cat: 'CDF', module: 'Package Handling Basics', assigned: 'Aug 16, 09:31', status: 'Assigned', reminded: null, remN: 99, phone: '(555) 118-3306' },
  { due: 'In 6 days', dueN: 6, da: 'Nina Torres', standard: null, module: 'Attendance Matters', assigned: 'Aug 12, 11:02', status: 'Assigned', reminded: null, remN: 99, phone: '(555) 662-9010' },
]

export interface DoneRow {
  completed: string
  day: number
  da: string
  standard: string | null
  cat?: string
  module: string
  time: string
  timeN: number
  score: string
  /** The quiz score as a percentage; -1 when there was no quiz. */
  scoreN: number
  ack: string
  repeat?: boolean
  manual?: boolean
}

export const DONE_LIST: DoneRow[] = [
  { completed: 'Aug 13, 14:02', day: 13, da: 'Marcus Webb', standard: 'Following Distance', cat: 'Safety', module: 'Safe Following Distance', time: '2 days', timeN: 2, score: '5/5', scoreN: 100, ack: 'Marcus Webb · Aug 13, 14:02' },
  { completed: 'Aug 9, 18:44', day: 9, da: 'Tina Alvarez', standard: 'Mishandled Package', cat: 'CDF', module: 'Package Handling Basics', time: '4 days', timeN: 4, score: '4/5 · 2nd try', scoreN: 80, ack: 'Tina Alvarez · Aug 9, 18:44', repeat: true },
  { completed: 'Aug 6, 12:10', day: 6, da: 'Dana Kim', standard: 'Distractions', cat: 'Safety', module: 'Distraction-Free Driving', time: '3 days', timeN: 3, score: '5/5', scoreN: 100, ack: 'Dana Kim · Aug 6, 12:10' },
  { completed: 'Aug 5, 08:55', day: 5, da: 'Sam Ortiz', standard: null, module: 'Peak Season Prep', time: '6 days', timeN: 6, score: '5/5', scoreN: 100, ack: 'Sam Ortiz · Aug 5, 08:55' },
  { completed: 'Aug 3, 16:20', day: 3, da: 'Leah Grant', standard: 'DVIC Not Done', cat: 'DVIC', module: 'DVIC In Full', time: '5 days', timeN: 5, score: '-', scoreN: -1, ack: 'Completed manually by K. Ortiz - no DA acknowledgement', manual: true },
  { completed: 'Aug 1, 10:15', day: 1, da: 'David Park', standard: 'Damage', cat: 'Work Ethics', module: 'Damage Prevention', time: '5 days', timeN: 5, score: '4/5', scoreN: 80, ack: 'David Park · Aug 1, 10:15' },
]

export const DAS = [
  'Marcus Webb', 'Tina Alvarez', 'Jorge Ruiz', 'Dana Kim', 'Leah Grant', 'Chris Boone',
  'Omar Haddad', 'Nina Torres', 'David Park', 'Maria Lopez', 'Sam Ortiz', 'Alex Chen', 'Priya Shah',
]

const PHONES: Record<string, string> = {
  'Marcus Webb': '(555) 214-8890', 'Tina Alvarez': '(555) 118-3306', 'Jorge Ruiz': '(555) 118-4471',
  'Dana Kim': '(555) 380-1123', 'Leah Grant': '(555) 771-2044', 'Chris Boone': '(555) 402-7741',
  'Omar Haddad': '(555) 640-8812', 'Nina Torres': '(555) 662-9010', 'David Park': '(555) 483-5520',
  'Maria Lopez': '(555) 129-7703', 'Sam Ortiz': '(555) 917-3348', 'Alex Chen': '(555) 205-6619',
  'Priya Shah': '(555) 344-1287',
}

export const phoneOf = (da: string): string => PHONES[da] ?? '(555) 000-0000'

export const MODULES = [
  'Seatbelt Safety 101', 'Safe Speed Coaching', 'Distraction-Free Driving', 'Safe Following Distance',
  'Delivery Distance Rules', 'Package Handling Basics', 'Attendance Matters', 'Damage Prevention',
]

export const VEHICLES = ['Van 103', 'Van 107', 'Van 109', 'Van 112', 'Van 114', 'Van 117', 'Van 121', 'Van 124']

export function catTone(c: string | undefined): { bg: string; fg: string } {
  if (c === 'Safety') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)' }
  if (c === 'DSB') return { bg: 'var(--blue-50)', fg: 'var(--blue-700)' }
  if (c === 'CDF') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }
  if (c === 'Helping PT') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)' }
}

export function statusTone(s: string): { bg: string; bd: string; fg: string } {
  if (s.includes('Overdue')) return { bg: 'var(--danger-bg)', bd: 'var(--danger-border)', fg: 'var(--danger-fg)' }
  if (s === 'Due Today') return { bg: 'var(--warning-bg)', bd: 'var(--warning-border)', fg: 'var(--warning-fg)' }
  if (s === 'Awaiting Acknowledgement') return { bg: 'var(--surface-card)', bd: 'var(--blue-200)', fg: 'var(--blue-700)' }
  if (s === 'Completed') return { bg: 'var(--success-bg)', bd: 'var(--success-border)', fg: 'var(--success-fg)' }
  return { bg: 'var(--blue-50)', bd: 'var(--blue-100)', fg: 'var(--blue-700)' }
}

/** Soonest problem first — the order the chase list is worked in. */
export function coachRank(c: string | undefined): number {
  if (c === 'Overdue') return 0
  if (c === 'Due Today') return 1
  if (c === 'Awaiting Acknowledgement') return 2
  if (c === 'Assigned') return 3
  if (c === 'Completed') return 4
  return 9
}

export const statusRank = (s: string): number =>
  s.includes('Overdue') ? 0 : s === 'Due Today' ? 1 : s === 'Awaiting Acknowledgement' ? 2 : 3

export const signed = (n: number): string => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n)}`

export const CATEGORIES = ['Safety', 'DSB', 'CDF', 'DVIC', 'Work Ethics', 'Helping PT']
export const SOURCES = ['Netradyne', 'DSB', 'CDF', 'DVIC', 'Manual']
export const COACH_STATUSES = ['Overdue', 'Due Today', 'Awaiting Acknowledgement', 'Assigned', 'Completed', 'None']
export const OPEN_STATUSES = ['Overdue', 'Due Today', 'Awaiting Acknowledgement', 'Assigned']

export const PAGE_SIZE = 10

export const TODAY_ISO = '2026-08-18'
export const EXTEND_ISO = '2026-08-22'
