// Imports — bringing outside files into the scorecard.
//
// A five-step wizard on one side, and the record of everything already run on
// the other.

export const SOURCES = ['DA Roster', 'Paycom', 'Safety (Netradyne)', 'DSB', 'CDF', 'DVIC', 'Absence', 'Order Refusal']

export const DAS = [
  'Marcus Webb', 'Tina Alvarez', 'Jorge Ruiz', 'Dana Kim', 'Leah Grant', 'Chris Boone',
  'Omar Haddad', 'Nina Torres', 'David Park', 'Maria Lopez', 'Sam Ortiz', 'Alex Chen', 'Priya Shah',
]

/** The columns the sample file offers. */
export const COLS = ['Transporter ID', 'Driver Name', 'Metric Type', 'Violation Date', 'Status']

export const STD_NAMES = [
  'Seatbelt', 'Speeding', 'Distractions', 'Following Distance', 'Delivered Over 50 Meters',
  'Mishandled Package', 'DVIC Not Done', 'Unexcused Absence', 'Damage', 'Helped Dispatch', 'Shift Pick-Up',
]

export const ROSTER_COLS = ['Driver Name', 'Transporter ID', 'EE Code', 'Start Date', 'Phone', 'Status', 'Not in file']

export const FILTER_OPS = ['Equals', 'Does not equal', 'Less than', 'More than', 'Contains', 'Is empty']

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']

export const MODES = ['Each Row', 'Count Rows', 'Sum Column']

export const STEPS = ['Choose Source', 'Upload File', 'Map Columns', 'Scoring Rules', 'Review and Run']

export interface Batch {
  date: string
  /** Day of August — what the Date column sorts on. */
  d: number
  source: string
  file: string
  rows: number
  events: number
  skipped: number
  unmatched: number
  status: string
  roster?: boolean
}

export const BATCHES: Batch[] = [
  { date: 'Aug 18, 06:40', d: 18, source: 'Safety (Netradyne)', file: 'netradyne-wk33.csv', rows: 1204, events: 34, skipped: 1167, unmatched: 3, status: 'Needs Review' },
  { date: 'Aug 17, 06:38', d: 17, source: 'DSB', file: 'dsb-wk33.xlsx', rows: 96, events: 12, skipped: 84, unmatched: 0, status: 'Done' },
  { date: 'Aug 17, 06:31', d: 17, source: 'CDF', file: 'cdf-wk33.csv', rows: 148, events: 22, skipped: 120, unmatched: 6, status: 'Needs Review' },
  { date: 'Aug 11, 07:02', d: 11, source: 'Safety (Netradyne)', file: 'netradyne-wk32.csv', rows: 1186, events: 41, skipped: 1145, unmatched: 0, status: 'Done' },
  { date: 'Aug 10, 09:15', d: 10, source: 'DA Roster', file: 'roster-august.xlsx', rows: 14, events: 0, skipped: 1, unmatched: 0, status: 'Done', roster: true },
  { date: 'Aug 4, 06:44', d: 4, source: 'DVIC', file: 'dvic-july.csv', rows: 420, events: 63, skipped: 357, unmatched: 0, status: 'Rolled Back' },
]

export interface Issue {
  id: string
  value: string
  cause: string
  /** `filter` and `hold` are by design — they are reported, not resolved. */
  kind: 'da' | 'map' | 'date' | 'filter' | 'hold'
  rows: number
}

export const EVENT_ISSUES: Issue[] = [
  { id: 'i1', value: 'SHAH, K', cause: 'No roster match', kind: 'da', rows: 1 },
  { id: 'i2', value: 'WEB, MARCUS', cause: 'No roster match', kind: 'da', rows: 1 },
  { id: 'i3', value: 'TEST DRIVER', cause: 'No roster match', kind: 'da', rows: 1 },
  { id: 'i4', value: 'HARSH BRAKING', cause: 'Unmapped value', kind: 'map', rows: 18 },
  { id: 'i5', value: 'CAMERA OBSTRUCTION', cause: 'Unmapped value', kind: 'map', rows: 11 },
  { id: 'i6', value: 'Violation Date reads 17/08/2026', cause: 'Unparseable date', kind: 'date', rows: 7 },
  { id: 'i7', value: 'Status equals Valid', cause: 'Failed filter', kind: 'filter', rows: 1131 },
]

export const PAYCOM_ISSUES: Issue[] = [
  { id: 'p1', value: 'No matching associate', cause: 'EE code not found', kind: 'da', rows: 2 },
]

export const ROSTER_ISSUES: Issue[] = [
  { id: 'd1', value: 'Would overwrite a manual edit', cause: 'Manual edit', kind: 'hold', rows: 2 },
  { id: 'd2', value: 'Reactivates an inactive associate', cause: 'Inactive', kind: 'hold', rows: 1 },
  { id: 'd3', value: 'Active associate missing from file', cause: 'Not in file', kind: 'hold', rows: 1 },
]

export const EVENT_PREVIEW: string[][] = [
  ['A2C4E6', 'Webb, Marcus', 'SPEEDING-VIOLATION', '08/17/2026', 'Valid'],
  ['B3D5F7', 'Ruiz, Jorge', 'SEATBELT-COMPLIANCE', '08/17/2026', 'Valid'],
  ['C4E6G8', 'Kim, Dana', 'DISTRACTED-DRIVING', '08/15/2026', 'Valid'],
  ['SHAH, K', 'Shah, K', 'SPEEDING-VIOLATION', '08/15/2026', 'Valid'],
  ['D5F7H9', 'Park, David', 'HARSH BRAKING', '08/14/2026', 'Invalid'],
]

export const ROSTER_PREVIEW: string[][] = [
  ['Webb, Marcus', 'MW-2101', '4417', '(555) 214-8890', 'Active'],
  ['Shah, Priya', 'PS-9214', '4102', '(555) 380-1123', 'Active'],
  ['Nolan, Ray', 'RN-0042', '3988', '(555) 402-7741', 'Active'],
  ['Alvarez, Tina', 'TA-6644', '4230', '(555) 118-3306', 'Active'],
  ['Chen, Alex', 'AC-3187', '4079', '(555) 662-9010', 'Inactive'],
]

export const ROSTER_PREVIEW_HEAD = ['Driver Name', 'Transporter ID', 'EE Code', 'Phone', 'Status']

/** [file value, standard, direction] */
export type ValueMapping = [string, string, ('neg' | 'pos')?]

export const SEED_VALUE_MAP: ValueMapping[] = [
  ['SPEEDING-VIOLATION', 'Speeding'],
  ['SEATBELT-COMPLIANCE', 'Seatbelt'],
  ['DISTRACTED-DRIVING', 'Distractions'],
  ['FOLLOWING-DISTANCE', 'Following Distance'],
]

export const SEED_SKIP_VALUES = ['TEST DRIVER', 'TRAINING VAN']

export const SEED_REMEMBERED: [string, string][] = [
  ['SHAH, K', 'Priya Shah'],
  ['WEB, MARCUS', 'Marcus Webb'],
]

export const BATCH_STATUSES = ['Done', 'Needs Review', 'Rolled Back']

export function statusTone(s: string): { bg: string; fg: string; dot: string } {
  if (s === 'Done') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (s === 'Needs Review') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

/**
 * "1,204".
 *
 * Written out rather than `toLocaleString()` so the server and the browser
 * cannot disagree about the separator.
 */
export function comma(n: number): string {
  const s = String(Math.abs(Math.trunc(n)))
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ','
    out += s[i]
  }
  return n < 0 ? `-${out}` : out
}

export const isRosterSource = (src: string): boolean => src === 'DA Roster' || src === 'Paycom'

export const issuesFor = (src: string): Issue[] =>
  src === 'Paycom' ? PAYCOM_ISSUES : src === 'DA Roster' ? ROSTER_ISSUES : EVENT_ISSUES

export const PAGE_SIZE = 8
