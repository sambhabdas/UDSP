// Scorecard Overview - the fleet's performance at a glance.
//
// Everything here is a fixed figure or a pure function of one. The page has no
// clock and no randomness: the "generated" series are hashes of their own
// labels run through Math.sin, so a given selection always draws the same
// chart, on the server and in the browser alike.

export type Tier = 'Excellent' | 'Good' | 'Decent' | 'Needs Work' | 'At Risk'

export interface Tone {
  bg: string
  fg: string
  dot: string
}

/** The 13 active associates, by net score. */
export const ROSTER: [string, number][] = [
  ['Priya Shah', 186],
  ['Alex Chen', 154],
  ['Sam Ortiz', 131],
  ['Maria Lopez', 44],
  ['David Park', 12],
  ['Nina Torres', 6],
  ['Omar Haddad', 0],
  ['Chris Boone', -18],
  ['Leah Grant', -33],
  ['Dana Kim', -58],
  ['Jorge Ruiz', -71],
  ['Tina Alvarez', -96],
  ['Marcus Webb', -142],
]

export function tierOf(net: number): Tier {
  if (net >= 50) return 'Excellent'
  if (net >= 10) return 'Good'
  if (net >= 0) return 'Decent'
  if (net >= -49) return 'Needs Work'
  return 'At Risk'
}

export function tierTone(t: Tier | string): Tone {
  if (t === 'At Risk') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  if (t === 'Good') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (t === 'Excellent') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--green-700)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

/** "+12", "-31", "0" - the sign is part of the reading, so it is never dropped. */
export const signed = (n: number): string => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n)}`

export const netColor = (n: number): string =>
  n < 0 ? 'var(--danger-fg)' : n > 0 ? 'var(--success-fg)' : 'var(--text-primary)'

export interface WindowData {
  net: number
  prevNet: number
  events: number
  completion: number
  created: number
  completed: number
  /** [category, deductions, bonuses] */
  cats: [string, number, number][]
}

export const DATA: Record<string, WindowData> = {
  '7 days': {
    net: -31, prevNet: -18, events: 48, completion: 67, created: 9, completed: 6,
    cats: [['Safety', 28, 2], ['DSB', 12, 0], ['CDF', 9, 0], ['Damage', 6, 0], ['Attendance', 4, 1], ['Helping PT', 0, 25]],
  },
  '30 days': {
    net: -128, prevNet: -86, events: 214, completion: 80, created: 41, completed: 33,
    cats: [['Safety', 118, 6], ['DSB', 54, 0], ['CDF', 38, 0], ['Damage', 26, 0], ['Attendance', 18, 4], ['Helping PT', 0, 116]],
  },
  '90 days': {
    net: -240, prevNet: -310, events: 590, completion: 83, created: 118, completed: 97,
    cats: [['Safety', 322, 18], ['DSB', 148, 0], ['CDF', 104, 0], ['Damage', 71, 0], ['Attendance', 49, 12], ['Helping PT', 0, 424]],
  },
}

export const WINS = ['Today', 'Yesterday', 'Last 7 days', 'Last week', 'Last 2 weeks', 'This month', 'Last month', 'Custom']

/** Which bucket of real figures each named window reads from. */
const WIN_KEY: Record<string, string> = {
  Today: '7 days',
  Yesterday: '7 days',
  'Last 7 days': '7 days',
  'Last week': '7 days',
  'Last 2 weeks': '30 days',
  'This month': '30 days',
  'Last month': '30 days',
}

export const dataFor = (window: string): WindowData => DATA[WIN_KEY[window]] ?? DATA['30 days']

/** How much a window stretches the per-associate movement figures. */
export function winScale(v: string): number {
  const m: Record<string, number> = {
    Today: 0.1, Yesterday: 0.1, 'Last 7 days': 0.4, 'Last week': 0.4,
    'Last 2 weeks': 0.7, 'This month': 1, 'Last month': 1, 'All time': 2.5,
  }
  return m[v] ?? 1
}

export const CATEGORIES = ['Overall', 'Safety', 'DSB', 'CDF', 'DVIC', 'Work Ethics', 'Helping PT', 'Attendance', 'Damage']
export const TOP_OPTIONS = ['Top 3', 'Top 5', 'Top 10', 'All']
export const FN_WINDOWS = ['8 weeks', '12 weeks', '24 weeks']

/** "Top 5" → 5; "All" → every row. */
export const topOf = (v: string): number => (v === 'All' ? Infinity : parseInt(v.replace('Top ', ''), 10))

/** [label, hint] - the trend chart can plot the fleet net or any one measure. */
export const SCORE_OPTIONS: [string, string][] = [
  ['Fleet Net', ''],
  ['Safety', 'Category'], ['DSB', 'Category'], ['CDF', 'Category'], ['DVIC', 'Category'],
  ['Work Ethics', 'Category'], ['Helping PT', 'Category'],
  ['Seatbelt', 'Standard'], ['Speeding', 'Standard'], ['Distractions', 'Standard'],
  ['Following Distance', 'Standard'], ['Mishandled Package', 'Standard'],
  ['Unexcused Absence', 'Standard'], ['Damage', 'Standard'],
]

export interface RiskRow {
  name: string
  net: number
  tier: Tier
  blocked: boolean
}

export const RISK_DATA: RiskRow[] = [
  { name: 'Marcus Webb', net: -142, tier: 'At Risk', blocked: true },
  { name: 'Tina Alvarez', net: -96, tier: 'At Risk', blocked: false },
  { name: 'Jorge Ruiz', net: -71, tier: 'At Risk', blocked: true },
  { name: 'Dana Kim', net: -58, tier: 'At Risk', blocked: false },
]

/** Coaching readiness, for the three associates who have any. */
export const READINESS: Record<string, string> = {
  'Priya Shah': '4/4',
  'Alex Chen': '3/4',
  'Sam Ortiz': '2/4',
}

export const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}']

export const WK8 = ['Wk 25', 'Wk 26', 'Wk 27', 'Wk 28', 'Wk 29', 'Wk 30', 'Wk 31', 'Wk 32']

/** Weekly deductions, split three ways. [label, safety, dsbCdf, other] */
export const DED_STACKS: [string, number, number, number][] = [
  ['Wk 25', 28, 18, 18], ['Wk 26', 22, 16, 14], ['Wk 27', 32, 22, 17], ['Wk 28', 16, 12, 10],
  ['Wk 29', 20, 14, 11], ['Wk 30', 26, 18, 14], ['Wk 31', 22, 15, 12], ['Wk 32', 14, 11, 8],
]

export const DED_SEGS: [string, string][] = [
  ['Safety', 'var(--red-500)'], ['DSB and CDF', 'var(--blue-500)'], ['Other', 'var(--yellow-500)'],
]

export const BONUS_SEGS: [string, string][] = [
  ['Helping PT', 'var(--green-700)'], ['Safety', 'var(--green-500)'], ['Attendance', 'var(--green-300)'],
]

export const BONUS_ROWS: number[][] = [
  [18, 4, 2], [22, 6, 3], [25, 5, 2], [12, 3, 1], [20, 6, 3], [26, 7, 4], [22, 5, 3], [28, 6, 4],
]

export const SOURCE_SEGS: [string, string][] = [
  ['Imports', 'var(--blue-500)'], ['Manual', 'var(--neutral-400)'],
]

export const SOURCE_ROWS: number[][] = [
  [38, 6], [42, 8], [45, 5], [31, 4], [40, 7], [44, 9], [39, 6], [46, 8],
]

export const COMPLETION_VALS = [72, 75, 81, 68, 78, 84, 80, 83]
export const TIME_VALS = [3.8, 3.4, 3.1, 3.6, 2.9, 2.6, 2.8, 2.4]

/** Open coaching, bucketed by how late it is. */
export const AGING: [string, number, string][] = [
  ['On Time', 3, 'var(--blue-500)'],
  ['Due Today', 1, 'var(--yellow-600)'],
  ['Overdue', 2, 'var(--red-500)'],
]

export const AGING_MAX = 4

export const TIER_FILLS: [Tier, string][] = [
  ['Excellent', 'var(--green-700)'],
  ['Good', 'var(--green-500)'],
  ['Decent', 'var(--neutral-400)'],
  ['Needs Work', 'var(--yellow-600)'],
  ['At Risk', 'var(--red-600)'],
]
