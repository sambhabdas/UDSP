// Fleet Dashboard's seed, lifted from FleetDashboard.dc.html.
//
// Money is whole dollars. A month's spend is its out-of-pocket plus whatever
// somebody else covered, so `oop` and `segs` together are the gross.

import { money as moneyDec, money0 } from '../../ds/format'

export interface Month {
  key: string
  label: string
  /** July is month-to-date, so its bar is drawn hollow. */
  mtd?: boolean
  oop: number
  /** What was covered, by who covered it. */
  segs: Record<string, number>
  prevC: number
  repC: number
  prevJ: number
  repJ: number
  /** Spend per van in the month, for the median. */
  vans: Record<string, number>
}

export const MONTHS: Month[] = [
  { key: 'Feb', label: 'Feb', oop: 1450, segs: { Insurance: 300 }, prevC: 380, repC: 890, prevJ: 2, repJ: 3, vans: { 'Van 103': 220, 'Van 114': 610, 'Van 121': 620 } },
  { key: 'Mar', label: 'Mar', oop: 2210, segs: {}, prevC: 520, repC: 1450, prevJ: 3, repJ: 4, vans: { 'Van 108': 340, 'Van 114': 980, 'Van 117': 890 } },
  { key: 'Apr', label: 'Apr', oop: 980, segs: { FIF: 450 }, prevC: 410, repC: 480, prevJ: 2, repJ: 1, vans: { 'Van 103': 410, 'Van 124': 570 } },
  { key: 'May', label: 'May', oop: 3120, segs: { Insurance: 1200 }, prevC: 300, repC: 2600, prevJ: 1, repJ: 5, vans: { 'Van 121': 1680, 'Van 114': 940, 'Van 108': 500 } },
  { key: 'Jun', label: 'Jun', oop: 842, segs: {}, prevC: 430, repC: 412, prevJ: 2, repJ: 1, vans: { 'Van 103': 412, 'Van 117': 220, 'Van 110': 210 } },
  { key: 'Jul', label: 'Jul', mtd: true, oop: 3026, segs: { Warranty: 4440, Insurance: 1340 }, prevC: 486, repC: 7780, prevJ: 3, repJ: 4, vans: { 'Van 114': 4966, 'Van 121': 1840, 'Van 108': 690, 'Van 105': 152, 'Van 116': 540, 'Van 119': 188, 'Van 124': 430 } },
]

/** The two weeks the spend picker can scope to, which are not months. */
export const WEEK_THIS: Pick<Month, 'oop' | 'segs' | 'vans'> = { oop: 0, segs: {}, vans: {} }
export const WEEK_LAST: Pick<Month, 'oop' | 'segs' | 'vans'> = {
  oop: 930, segs: { Insurance: 1340 }, vans: { 'Van 121': 1840, 'Van 124': 430 },
}
export const WEEK_29: Pick<Month, 'oop' | 'segs' | 'vans'> = {
  oop: 1610, segs: { Warranty: 3900 }, vans: { 'Van 114': 5510, 'Van 108': 690 },
}

export const PERIODS = [
  'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year',
  'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026',
]

/** Percentage of the fleet on route, per bar, for each period the picker offers. */
export const UTIL: Record<string, { bars: [string, number][]; hero?: string; sub?: string; right?: string }> = {
  'This Week': {
    bars: [['Wed', 88], ['Thu', 100], ['Fri', 63], ['Sat', 75], ['Sun', 100], ['Mon', 88], ['Tue', 88]],
    hero: '7 of 8', sub: 'on route today', right: 'This week 86%',
  },
  'Last Week': { bars: [['Sun', 75], ['Mon', 88], ['Tue', 75], ['Wed', 88], ['Thu', 100], ['Fri', 75], ['Sat', 88]] },
  Feb: { bars: [['Wk 6', 74], ['Wk 7', 79], ['Wk 8', 81], ['Wk 9', 78]] },
  Mar: { bars: [['Wk 10', 80], ['Wk 11', 84], ['Wk 12', 82], ['Wk 13', 79]] },
  Apr: { bars: [['Wk 14', 77], ['Wk 15', 80], ['Wk 16', 83], ['Wk 17', 81]] },
  May: { bars: [['Wk 18', 79], ['Wk 19', 83], ['Wk 20', 78], ['Wk 21', 84]] },
  Jun: { bars: [['Wk 23', 82], ['Wk 24', 85], ['Wk 25', 84], ['Wk 26', 86]] },
  Jul: { bars: [['Wk 27', 82], ['Wk 28', 85], ['Wk 29', 88], ['Wk 30', 84], ['Wk 31', 86]] },
  'This Year': { bars: [['Feb', 78], ['Mar', 81], ['Apr', 80], ['May', 81], ['Jun', 84], ['Jul', 85]] },
}

/** van · last-ran label · last-ran sort value · idle label · idle days · colour */
export type IdleSeed = [string, string, number, string, number, string]

export const IDLE: Record<string, IdleSeed[]> = {
  'This Week': [
    ['Van 112', 'Never ran', 0, '27 days', 27, 'var(--danger-fg)'],
    ['Van 110', 'Jul 22', 22, '7 days', 7, 'var(--warning-fg)'],
  ],
  'Last Week': [['Van 112', 'Never ran', 0, '20 days', 20, 'var(--danger-fg)']],
  'This Year': [['Van 112', 'Never ran', 0, '27 days', 27, 'var(--danger-fg)']],
  Jul: [['Van 112', 'Never ran', 0, '27 days', 27, 'var(--danger-fg)']],
  Jun: [['Van 110', 'Jun 18', 18, '5 days', 5, 'var(--warning-fg)']],
}

export interface Lemon {
  van: string
  oop: number
  /** How many times the median serviced van this one costs. */
  x: number
  gross: number
  top: string
}

export const LEMONS: Lemon[] = [
  { van: 'Van 114', oop: 3006, x: 5.6, gross: 10906, top: 'Repair' },
  { van: 'Van 121', oop: 2180, x: 4.0, gross: 3520, top: 'Bodywork' },
  { van: 'Van 108', oop: 1190, x: 2.2, gross: 1190, top: 'Repair' },
]

export type Severity = 'Red' | 'Orange' | 'Gray'

export interface QueueRow {
  sev: Severity
  kind: string
  van: string
  fact: string
  link: string
  factColor: string
}

export const QUEUE: QueueRow[] = [
  { sev: 'Red', kind: 'Renewal', van: 'Van 121', fact: 'Permit expired Jul 12', link: 'Maintenance & Renewals', factColor: 'var(--danger-fg)' },
  { sev: 'Red', kind: 'Renewal', van: 'Van 119', fact: 'Registration expires Jul 31', link: 'Maintenance & Renewals', factColor: 'var(--danger-fg)' },
  { sev: 'Red', kind: 'Service', van: 'Van 108', fact: 'Grounded 12 days with no service activity', link: 'Service Records', factColor: 'var(--danger-fg)' },
  { sev: 'Orange', kind: 'Reminder', van: 'Van 114', fact: 'Oil change overdue by 7,347 mi', link: 'Maintenance & Renewals', factColor: 'var(--text-primary)' },
  { sev: 'Orange', kind: 'Reminder', van: 'Van 121', fact: 'Brake pads overdue since Jul 20', link: 'Maintenance & Renewals', factColor: 'var(--text-primary)' },
  { sev: 'Orange', kind: 'Renewal', van: 'Van 114', fact: 'Registration expires Aug 3', link: 'Maintenance & Renewals', factColor: 'var(--text-primary)' },
  { sev: 'Orange', kind: 'Renewal', van: 'Van 108', fact: 'Registration expires Aug 3', link: 'Maintenance & Renewals', factColor: 'var(--text-primary)' },
  { sev: 'Orange', kind: 'Status', van: 'Van 114', fact: 'Shop return overdue since Jul 26', link: 'Overview', factColor: 'var(--text-primary)' },
  { sev: 'Orange', kind: 'Reminder', van: 'Van 103', fact: 'Tire rotation due Aug 12', link: 'Maintenance & Renewals', factColor: 'var(--text-primary)' },
  { sev: 'Gray', kind: 'Odometer', van: 'Van 112', fact: 'No odometer reading recorded', link: 'Odometer', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Photos', van: 'Van 112', fact: 'No photo set in 30 days', link: 'Photos', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Photos', van: 'Van 117', fact: 'No photo set in 30 days', link: 'Photos', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Photos', van: 'Van 124', fact: 'No photo set in 30 days', link: 'Photos', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Reminder', van: 'Van 117', fact: 'No maintenance scheduled', link: 'Maintenance & Renewals', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Reminder', van: 'Van 124', fact: 'No maintenance scheduled', link: 'Maintenance & Renewals', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Priority', van: 'Van 121', fact: '1 ranked DA is deactivated', link: 'Priority', factColor: 'var(--text-secondary)' },
  { sev: 'Gray', kind: 'Priority', van: 'Van 124', fact: '1 ranked DA can no longer drive it', link: 'Priority', factColor: 'var(--text-secondary)' },
]

export const KINDS = ['All', 'Renewal', 'Reminder', 'Service', 'Status', 'Odometer', 'Photos', 'Priority']

/** Who paid, and the blue each payer is drawn in. */
export const SEG_COLORS: Record<string, string> = {
  'Out of pocket': 'var(--blue-700)',
  Insurance: 'var(--blue-400)',
  Warranty: 'var(--blue-200)',
  FIF: 'var(--neutral-400)',
}

export const LEGEND = ['Out of pocket', 'Insurance', 'Warranty', 'FIF']

export const FLEET_TILES: { label: string; value: string; color: string; dim?: boolean }[] = [
  { label: 'On fleet total', value: '11', color: 'var(--blue-700)' },
  { label: 'In service', value: '8', color: 'var(--success-fg)' },
  { label: 'In shop', value: '2', color: 'var(--warning-fg)' },
  { label: 'Grounded', value: '1', color: 'var(--danger-fg)' },
  // Off fleet is history, not the fleet, so it is stepped back.
  { label: 'Off fleet', value: '1', color: 'var(--text-secondary)', dim: true },
]

/** Whole dollars unless `dec`, which the design never asks for but keeps.
 *  The magnitude only - every figure on this board is already labelled as a
 *  cost or a saving, so the design does not repeat it as a sign. */
export function money(n: number, dec?: boolean): string {
  return dec ? moneyDec(Math.abs(n)) : money0(Math.abs(n))
}

export function median(arr: number[]): number | null {
  if (!arr.length) return null
  const a = arr.slice().sort((x, y) => x - y)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

export function severityTone(s: Severity): { bg: string; fg: string; dot: string } {
  if (s === 'Red') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  if (s === 'Orange') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

export function categoryTone(c: string): { bg: string; fg: string } {
  if (c === 'Repair') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)' }
  if (c === 'Preventive') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)' }
  if (c === 'Bodywork') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }
  return { bg: 'var(--blue-50)', fg: 'var(--blue-700)' }
}
