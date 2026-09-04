// Compliance's seed, lifted from Compliance.dc.html. Times are minutes since
// midnight; `fmt` in calc.ts is the only place a colon gets written.

export type Minutes = number

/** The clock the board is read against - 16:09. */
export const NOW: Minutes = 969

/** The day the board opens on. Local-time parts only, so it is TZ-stable. */
export const BASE_DAY = { y: 2026, m: 6, d: 29 }

export const DEFAULT_LEAD = 30
export const DEFAULT_GRACE = 10

/** Lunch has to start inside five hours of the in-punch. */
export const LUNCH_WINDOW = 300
/** A second lunch is owed ten hours in. */
export const SECOND_LUNCH = 600
/** Anything shorter than this is a short lunch. */
export const MIN_LUNCH = 30

export type WorkKind = 'route' | 'rescue' | 'training' | 'ops' | 'standby' | 'yard' | 'custom'

/** What somebody is on. `set` and `left` are the stamps, not the schedule. */
export interface Work {
  kind: WorkKind
  label: string
  set: string | null
  left: string | null
}

export interface Person {
  id: string
  name: string
  /** When Load Out expected them. `null` means they punched in unscheduled. */
  sched: Minutes | null
  inP: Minutes | null
  out: Minutes | null
  ls: Minutes | null
  le: Minutes | null
  work: Work | null
  /** Whether Load Out has a row for them at all. */
  hasRow: boolean
  phone: boolean
  /** A shift that has not started yet - it is not scored. */
  future?: boolean
}

const W = (kind: WorkKind, label: string, set?: string, left?: string): Work => ({
  kind,
  label,
  set: set ?? null,
  left: left ?? null,
})

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'DIAZ, DAVID', sched: 690, inP: null, out: null, ls: null, le: null, work: W('route', 'CX252 · PACT04'), hasRow: true, phone: true },
  { id: 'p2', name: 'CASILLAS, RUBEN', sched: 600, inP: 602, out: null, ls: null, le: null, work: W('training', 'Training', '13:10'), hasRow: true, phone: true },
  { id: 'p3', name: 'HARRIS, DEON', sched: 610, inP: 615, out: null, ls: 921, le: 952, work: W('route', 'CX276 · PACT20'), hasRow: true, phone: true },
  { id: 'p4', name: 'KNOKE, PAUL', sched: 635, inP: 640, out: null, ls: 912, le: 934, work: W('route', 'CX286 · PACT52'), hasRow: true, phone: true },
  { id: 'p5', name: 'MENDEZ, GABRIEL', sched: 695, inP: 698, out: null, ls: null, le: null, work: W('rescue', 'Rescue'), hasRow: true, phone: true },
  { id: 'p6', name: 'SUAZO, MARTIN', sched: 690, inP: 695, out: null, ls: null, le: null, work: W('route', 'CX271 · PACT41'), hasRow: true, phone: true },
  { id: 'p7', name: 'FLORENDO, ROSS', sched: null, inP: 506, out: null, ls: 760, le: 792, work: W('yard', 'Yard / Staging', '9:05'), hasRow: false, phone: true },
  { id: 'p8', name: 'GARCIA, ANDY', sched: 705, inP: 708, out: null, ls: null, le: null, work: null, hasRow: true, phone: true },
  { id: 'p9', name: 'RAIGOSA, PETER', sched: 690, inP: 712, out: null, ls: 926, le: 957, work: W('route', 'CX272 · PACT09'), hasRow: true, phone: true },
  { id: 'p10', name: 'MAYORGA, LUIS', sched: 415, inP: 418, out: null, ls: 662, le: 693, work: W('ops', 'OPS', undefined, '15:30'), hasRow: true, phone: true },
  { id: 'p11', name: 'VACA, ELENA', sched: 705, inP: 707, out: null, ls: 969, le: null, work: W('route', 'CX270 · PACT23'), hasRow: true, phone: true },
  { id: 'p12', name: 'URIARTE, KAT', sched: 425, inP: 430, out: null, ls: 658, le: 689, work: W('route', 'CX268 · PACT12'), hasRow: true, phone: true },
  { id: 'p13', name: 'WILD, MARCO', sched: 720, inP: 725, out: null, ls: null, le: null, work: W('route', 'CX290 · PACT54'), hasRow: true, phone: true },
  { id: 'p14', name: 'CALDERON, IVY', sched: 1050, inP: null, out: null, ls: null, le: null, work: W('route', 'CX259 · EP-02'), hasRow: true, phone: true, future: true },
  { id: 'p15', name: 'ALVARENGA, CARLOS', sched: 685, inP: 681, out: null, ls: 928, le: 959, work: W('route', 'CX248 · PACT03'), hasRow: true, phone: true },
  { id: 'p16', name: 'ASUTAY, MELIH', sched: 695, inP: 692, out: null, ls: 917, le: 948, work: W('route', 'CX294 · EP-01'), hasRow: true, phone: true },
  { id: 'p17', name: 'STROSKA, M', sched: 420, inP: 424, out: 810, ls: 665, le: 696, work: W('ops', 'OPS'), hasRow: true, phone: true },
  { id: 'p18', name: 'STROSKA, ANGELO', sched: 415, inP: 415, out: 840, ls: 670, le: 701, work: W('standby', 'Standby'), hasRow: true, phone: true },
]

export type WarnKey = 'snI' | 'inNS' | 'lateIn' | 'noOut' | 'missed' | 'closing' | 'lateL' | 'shortL' | 'noWork'

/** The warning chips, in the order they appear above the board. */
export const CHIP_DEFS: [WarnKey, string, 'danger' | 'warn'][] = [
  ['snI', 'Punch Missing', 'danger'],
  ['inNS', 'In, Not Scheduled', 'warn'],
  ['lateIn', 'Late Punch-In', 'warn'],
  ['noOut', 'No Punch-Out', 'warn'],
  ['missed', 'Lunch Missing', 'danger'],
  ['closing', 'Lunch Closing', 'warn'],
  ['lateL', 'Late Lunch', 'warn'],
  ['shortL', 'Short Lunch', 'warn'],
  ['noWork', 'No Work', 'warn'],
]

export const TONE: Record<'danger' | 'warn', [string, string, string]> = {
  danger: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)'],
  warn: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)'],
}

export type TileKey = 'in' | 'routes' | 'onroutes' | 'rescues' | 'ops' | 'standby' | 'lunches'

export const WORK_TYPES = ['Dispatching', 'Training', 'Modified Duty', 'Standby', 'OPS', 'Yard / Staging']

/** Drivers who can be pulled onto the board but are not on it yet. */
export const ADD_POOL = ['NAVARRO, JOSE', 'OKAFOR, CHIDI', 'PHAM, LINH', 'REYES, MARTA', 'SINGH, DEV', 'TORRES, NINA']

export const LUNCH_BODY = 'Hi {Employee} - please start your 30 min lunch before {Lunch deadline}.'
export const PUNCH_BODY = 'Hi {Employee} - you were scheduled for {Scheduled}. Please punch in or call dispatch.'

/** Who has already been reminded when the day opens. */
export const SEED_REMINDED: Record<string, { at: string; mode: string }> = {
  p1: { at: '11:40', mode: 'auto' },
  p2: { at: '14:32', mode: 'auto' },
  p6: { at: '16:05', mode: 'auto' },
}

export const IMPORT_COLS = ['Employee', 'In', 'Out', 'Lunch Start', 'Lunch End']

export type FillKey = 'in' | 'out' | 'ls' | 'le'

/** Which punch column feeds which field on the board. */
export const IMPORT_FILLS: [FillKey, string, string][] = [
  ['in', 'In punch', 'In'],
  ['out', 'Out punch', 'Out'],
  ['ls', 'Lunch start', 'Lunch Start'],
  ['le', 'Lunch end', 'Lunch End'],
]

/** The one work type a picked label does not map onto by name. */
export function kindOfWorkType(label: string): WorkKind {
  if (label === 'Training') return 'training'
  if (label === 'OPS') return 'ops'
  if (label === 'Standby') return 'standby'
  if (label === 'Yard / Staging' || label === 'Dispatching') return 'yard'
  return 'custom'
}
