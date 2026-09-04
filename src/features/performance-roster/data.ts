// Performance Roster - the whole fleet in one table, and any one associate in
// full when you open them.
//
// The roster, the standards catalogue and the two hand-written detail records
// are the fixtures; everything else on the page is derived from them.

export type Tier = 'Excellent' | 'Good' | 'Decent' | 'Needs Work' | 'At Risk'

export interface Tone {
  bg: string
  fg: string
  dot: string
}

export interface Associate {
  name: string
  tid: string
  net: number
  openEv: number
  /** The coaching state as it reads in the table: "1 Overdue", "" for none. */
  coach: string
  blocked?: boolean
  tenure: string
  tenureN: number
  ready?: number
  inactive?: boolean
}

export const ROSTER: Associate[] = [
  { name: 'Marcus Webb', tid: 'MW-2101', net: -142, openEv: 3, coach: '1 Overdue', blocked: true, tenure: '9 mo', tenureN: 9 },
  { name: 'Tina Alvarez', tid: 'TA-6644', net: -96, openEv: 2, coach: '1 Assigned', tenure: '14 mo', tenureN: 14 },
  { name: 'Jorge Ruiz', tid: 'JR-8823', net: -71, openEv: 2, coach: '1 Overdue', blocked: true, tenure: '22 mo', tenureN: 22 },
  { name: 'Dana Kim', tid: 'DK-3356', net: -58, openEv: 1, coach: '1 Due Today', tenure: '7 mo', tenureN: 7 },
  { name: 'Leah Grant', tid: 'LG-4470', net: -33, openEv: 1, coach: '', tenure: '11 mo', tenureN: 11 },
  { name: 'Chris Boone', tid: 'CB-1198', net: -18, openEv: 1, coach: '1 Awaiting Ack', tenure: '16 mo', tenureN: 16 },
  { name: 'Omar Haddad', tid: 'OH-7741', net: 0, openEv: 0, coach: '', tenure: '2 mo', tenureN: 2 },
  { name: 'Nina Torres', tid: 'NT-2210', net: 6, openEv: 1, coach: '1 Assigned', tenure: '5 mo', tenureN: 5 },
  { name: 'David Park', tid: 'DP-6633', net: 12, openEv: 0, coach: '', tenure: '19 mo', tenureN: 19 },
  { name: 'Maria Lopez', tid: 'ML-8402', net: 44, openEv: 0, coach: '', tenure: '26 mo', tenureN: 26 },
  { name: 'Sam Ortiz', tid: 'SO-5521', net: 131, openEv: 0, coach: '', tenure: '31 mo', tenureN: 31 },
  { name: 'Alex Chen', tid: 'AC-3187', net: 154, openEv: 0, coach: '', tenure: '24 mo', tenureN: 24 },
  { name: 'Priya Shah', tid: 'PS-9214', net: 186, openEv: 0, coach: '', tenure: '28 mo', tenureN: 28, ready: 4 },
  { name: 'Ray Nolan', tid: 'RN-0042', net: -12, openEv: 0, coach: '', tenure: '13 mo', tenureN: 13, inactive: true },
]

export interface Standard {
  name: string
  cat: string
  /** Points lost per unit, and gained per unit. */
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

export const MODULES = [
  'Seatbelt Safety 101', 'Safe Speed Coaching', 'Distraction-Free Driving', 'Safe Following Distance',
  'Delivery Distance Rules', 'Package Handling Basics', 'Attendance Matters', 'Damage Prevention',
]

export const VEHICLES = ['Van 103', 'Van 107', 'Van 109', 'Van 112', 'Van 114', 'Van 117', 'Van 121', 'Van 124']

export interface DetailEvent {
  date: string
  standard: string
  cat: string
  pts: number
  coach: string
  coachTone: 'danger' | 'ok' | 'none'
}

export interface DetailCoaching {
  module: string
  status: string
  due: string
}

export interface DetailAck {
  module: string
  standard: string
  completed: string
  score: string
  ack: string
}

export interface DetailKudo {
  text: string
  meta: string
}

/** A marker on the score trend: which week, and what happened there. */
export interface Mark {
  i: number
  neg?: boolean
  diamond?: boolean
}

export interface Detail {
  events: DetailEvent[]
  coaching: DetailCoaching[]
  acks: DetailAck[]
  kudos: DetailKudo[]
  marks: Mark[]
}

/** The two associates with a full hand-written record. */
export const DETAILS: Record<string, Detail> = {
  'Marcus Webb': {
    events: [
      { date: 'Aug 17', standard: 'Speeding', cat: 'Safety', pts: -60, coach: 'Overdue', coachTone: 'danger' },
      { date: 'Aug 13', standard: 'Following Distance', cat: 'Safety', pts: -35, coach: 'Completed', coachTone: 'ok' },
      { date: 'Aug 4', standard: 'Speeding', cat: 'Safety', pts: -60, coach: 'Completed', coachTone: 'ok' },
      { date: 'Jul 28', standard: 'Mishandled Package', cat: 'CDF', pts: -8, coach: '-', coachTone: 'none' },
      { date: 'Jul 20', standard: 'Helped Dispatch', cat: 'Helping PT', pts: 30, coach: '-', coachTone: 'none' },
    ],
    coaching: [{ module: 'Safe Speed Coaching', status: 'Overdue', due: '2 days late' }],
    acks: [
      { module: 'Safe Following Distance', standard: 'Following Distance', completed: 'Aug 13', score: '5/5', ack: 'Marcus Webb · Aug 13, 14:02' },
      { module: 'Safe Speed Coaching', standard: 'Speeding', completed: 'Aug 6', score: '4/5', ack: 'Marcus Webb · Aug 6, 18:44' },
    ],
    kudos: [],
    marks: [{ i: 3, neg: true }, { i: 7, neg: true }, { i: 10, neg: true }, { i: 8, diamond: true }],
  },
  'Priya Shah': {
    events: [
      { date: 'Aug 16', standard: 'Shift Pick-Up', cat: 'Helping PT', pts: 30, coach: '-', coachTone: 'none' },
      { date: 'Aug 9', standard: 'Helped Dispatch', cat: 'Helping PT', pts: 30, coach: '-', coachTone: 'none' },
      { date: 'Jul 30', standard: 'Shift Pick-Up', cat: 'Helping PT', pts: 30, coach: '-', coachTone: 'none' },
    ],
    coaching: [],
    acks: [{ module: 'Seatbelt Safety 101', standard: '-', completed: 'Jul 12', score: '5/5', ack: 'Priya Shah · Jul 12, 09:20' }],
    kudos: [{ text: 'Covered two rescue routes on Prime week', meta: 'Aug 2 · K. Ortiz' }],
    marks: [{ i: 4, neg: false }, { i: 9, neg: false }, { i: 11, neg: false }],
  },
}

/** Anyone without a written record gets this shape instead. */
export const fallbackDetail = (d: Associate): Detail => ({
  events: [{ date: 'Aug 12', standard: 'Mishandled Package', cat: 'CDF', pts: -8, coach: '-', coachTone: 'none' }],
  coaching: d.coach ? [{ module: 'Package Handling Basics', status: 'Assigned', due: 'In 4 days' }] : [],
  acks: [],
  kudos: [],
  marks: [{ i: 5, neg: d.net < 0 }],
})

export const TIERS: { name: Tier; from: number | null }[] = [
  { name: 'Excellent', from: 50 }, { name: 'Good', from: 10 }, { name: 'Decent', from: 0 },
  { name: 'Needs Work', from: -49 }, { name: 'At Risk', from: null },
]

export function tierOf(net: number): Tier {
  if (net >= 50) return 'Excellent'
  if (net >= 10) return 'Good'
  if (net >= 0) return 'Decent'
  if (net >= -49) return 'Needs Work'
  return 'At Risk'
}

export function tierTone(t: string): Tone {
  if (t === 'At Risk') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  if (t === 'Needs Work') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  if (t === 'Good') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (t === 'Excellent') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--green-700)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

export function catTone(c: string): { bg: string; fg: string } {
  if (c === 'Safety') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)' }
  if (c === 'DSB') return { bg: 'var(--blue-50)', fg: 'var(--blue-700)' }
  if (c === 'CDF') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }
  if (c === 'Helping PT') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)' }
}

/** How urgent a coaching state is, as a colour. */
export function coachTone(text: string): { bg: string; bd: string; fg: string } {
  const c = text.toLowerCase()
  if (c.includes('overdue')) return { bg: 'var(--danger-bg)', bd: 'var(--danger-border)', fg: 'var(--danger-fg)' }
  if (c.includes('due today')) return { bg: 'var(--warning-bg)', bd: 'var(--warning-border)', fg: 'var(--warning-fg)' }
  if (c.includes('awaiting')) return { bg: 'var(--surface-card)', bd: 'var(--blue-200)', fg: 'var(--blue-700)' }
  return { bg: 'var(--blue-50)', bd: 'var(--blue-100)', fg: 'var(--blue-700)' }
}

export function catDot(c: string): string {
  if (c === 'Safety') return 'var(--red-500)'
  if (c === 'DSB') return 'var(--blue-500)'
  if (c === 'CDF') return 'var(--yellow-600)'
  if (c === 'Helping PT') return 'var(--green-600)'
  return 'var(--neutral-400)'
}

/** Same ordering the table sorts coaching by: soonest problem first. */
export function coachRank(text: string): number {
  const c = text.toLowerCase()
  if (c.includes('overdue')) return 0
  if (c.includes('due today')) return 1
  if (c.includes('awaiting')) return 2
  return c ? 3 : 9
}

export const signed = (n: number): string => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n)}`

export const initials = (name: string): string => name.split(' ').map((w) => w[0]).join('')

export function avatarTone(name: string): [string, string] {
  const pal: [string, string][] = [
    ['var(--blue-100)', 'var(--blue-800)'],
    ['var(--green-100)', 'var(--green-800)'],
    ['var(--yellow-100)', 'var(--yellow-800)'],
    ['var(--red-100)', 'var(--red-800)'],
    ['var(--neutral-200)', 'var(--neutral-900)'],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return pal[h % pal.length]
}

export const WINDOW_PRESETS = ['Yesterday', 'This Week', 'Last Week', 'This Month', 'Last 30 Days', 'Last 90 Days', 'Custom']

export const STATUSES = ['Active', 'All', 'Inactive']

/** The page's fixed "today" - the design file hard-codes it into every date field. */
export const TODAY_ISO = '2026-08-18'
