// Availability - who can work which day, and where that answer came from.
//
// Every cell is one of three states, and each has a provenance: a standing
// weekly pattern, a manual override, or an import. The grid never hides which.

export interface Da {
  id: string
  name: string
  tid: string
  /** The standing weekly pattern: 1 = available on that weekday. */
  pattern: number[]
  note?: string
}

export const SEED_DAS: Da[] = [
  { id: 'alvarez', name: 'Alvarez, Rosa', tid: 'TR-6002', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'boone', name: 'Boone, Jesse', tid: 'TR-2890', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'diaz', name: 'Diaz, Marcus', tid: 'TR-1186', pattern: [0, 0, 0, 0, 0, 0, 1], note: 'On leave - Saturdays only' },
  { id: 'karim', name: 'Karim, Sofia', tid: 'TR-5190', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'knoke', name: 'Knoke, Daniel', tid: 'TR-7731', pattern: [1, 1, 1, 1, 1, 1, 0] },
  { id: 'okafor', name: 'Okafor, Chidi', tid: 'TR-4821', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'patel', name: 'Patel, Dev', tid: 'TR-9954', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'ruiz', name: 'Ruiz, Fernanda', tid: 'TR-1042', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'tran', name: 'Tran, Vinh', tid: 'TR-8419', pattern: [0, 0, 1, 1, 1, 1, 1], note: 'School Sun-Mon' },
  { id: 'vang', name: 'Vang, Mai', tid: 'TR-3307', pattern: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'woods', name: 'Woods, Tanya', tid: 'TR-2214', pattern: [1, 1, 1, 1, 1, 1, 1] },
]

export interface Exclusion {
  da: string
  reason: string
  until: string | null
}

export const SEED_EXCLUDED: Exclusion[] = [
  { da: 'woods', reason: 'Suspended', until: 'Aug 5' },
  { da: 'diaz', reason: 'Leave', until: null },
  { da: 'ruiz', reason: 'New hire', until: null },
]

export type CellState = 'A' | 'U' | 'PTO'
export type CellSource = 'manual' | 'import' | 'pattern'

export interface Cell {
  t: CellState
  /** Hours, on approved time off only. */
  h?: number
  reason?: string
  src: CellSource
}

/** overrides[week][daId][day] - anything not here falls back to the pattern. */
export type Overrides = Record<number, Record<string, Record<number, Cell>>>

export const SEED_OVERRIDES: Overrides = {
  31: {
    karim: { 2: { t: 'PTO', h: 8, reason: 'Family day, approved Jul 20', src: 'manual' } },
    boone: { 0: { t: 'U', src: 'import' }, 1: { t: 'U', src: 'import' } },
    okafor: { 5: { t: 'U', src: 'manual' } },
  },
}

/** How many people each day of week 31 needs - drives the header ratio colour. */
export const NEEDS: Record<number, number[]> = { 31: [6, 6, 6, 6, 6, 8, 6] }

export interface AuditRow {
  when: string
  who: string
  action: string
  detail: string
}

export const SEED_AUDIT: AuditRow[] = [
  { when: 'Jul 25 · 3:12 PM', who: 'M. Ortega', action: 'Cell edit', detail: 'Okafor, Chidi · Fri to Unavailable · ✎ manual' },
  { when: 'Jul 24 · 9:04 AM', who: 'Import', action: 'Import batch', detail: 'availability_w31.csv · 22 cells written · ⇪' },
  { when: 'Jul 22 · 5:40 PM', who: 'D. Whitfield', action: 'Time off', detail: 'Karim, Sofia · Wed · 8 h · Family day' },
  { when: 'Jul 21 · 8:15 AM', who: 'D. Whitfield', action: 'Pattern change', detail: 'Tran, Vinh · Sun Mon to Unavailable · effective Jul 26' },
]

export interface Batch {
  date: string
  /** A sortable stamp - month × 100 + day. */
  d: number
  source: string
  file: string
  rows: number
  /** Cells written. */
  events: number
  skipped: number
  unmatched: number
  status: string
}

export const SEED_BATCHES: Batch[] = [
  { date: 'Jul 26, 07:12', d: 726, source: 'Last week’s schedule', file: 'schedule_w30.xlsx', rows: 41, events: 41, skipped: 0, unmatched: 0, status: 'Done' },
  { date: 'Jul 24, 06:58', d: 724, source: 'Availability report', file: 'availability_w31.csv', rows: 42, events: 22, skipped: 3, unmatched: 1, status: 'Needs review' },
]

export const SCHEDULE_SOURCE = 'Last week’s schedule'
export const AVAIL_SOURCE = 'Availability report'
export const BUILT_IN_SOURCES = [AVAIL_SOURCE, SCHEDULE_SOURCE]

export const CELL_STATES = ['Available', 'Unavailable', 'Time off 8h']

/** The names the importer can match an unrecognised row to. */
export const IMPORT_DAS = [
  'Ada Okafor', 'Mai Vang', 'Terrell Woods', 'Sana Karim', 'Marisol Diaz',
  'Tina Alvarez', 'Chris Boone', 'Vinh Tran', 'Dev Patel', 'Elena Ruiz',
]

export interface Issue {
  id: string
  value: string
  cause: string
  /** `filter` is by design - reported, never resolved. */
  kind: 'da' | 'map' | 'filter'
  rows: number
}

export const AVAIL_ISSUES: Issue[] = [
  { id: 'i1', value: 'KNOKE', cause: 'No roster match', kind: 'da', rows: 1 },
  { id: 'i2', value: 'MAYBE', cause: 'Unmapped value', kind: 'map', rows: 2 },
  { id: 'i3', value: 'Value is empty', cause: 'Failed filter', kind: 'filter', rows: 1 },
]

export const SEED_VALUE_MAP: [string, string][] = [
  ['Y', 'Available'],
  ['N', 'Unavailable'],
  ['PTO', 'Time off 8h'],
]

export const SEED_REMEMBERED: [string, string][] = [['SANA K', 'Sana Karim']]

export const AVAIL_PREVIEW: string[][] = [
  ['A2C4E6', 'Okafor, Ada', '08/02/2026', 'Y', '10'],
  ['B3D5F7', 'Vang, Mai', '08/02/2026', 'Y', '10'],
  ['C4E6G8', 'Woods, Terrell', '08/03/2026', 'N', '0'],
  ['KNOKE', 'Knoke, J', '08/03/2026', 'Y', '10'],
  ['D5F7H9', 'Karim, Sana', '08/05/2026', 'PTO', '8'],
]

export const SCHED_PREVIEW: string[][] = [
  ['A2C4E6', 'Okafor, Ada', '07/19/2026', 'DOT', '10'],
  ['B3D5F7', 'Vang, Mai', '07/19/2026', 'STD', '10'],
  ['C4E6G8', 'Woods, Terrell', '07/20/2026', 'DOT', '10'],
  ['E6G8I0', 'Diaz, Marisol', '07/21/2026', 'RSC', '8'],
  ['F7H9J1', 'Alvarez, Tina', '07/22/2026', 'STD', '10'],
]

export const AVAIL_PREVIEW_HEAD = ['Transporter ID', 'Name', 'Date', 'Value', 'Hours']
export const SCHED_PREVIEW_HEAD = ['Transporter ID', 'Name', 'Date', 'Department', 'Hours']

export const FILTER_COLS = ['Value', 'Date', 'Name', 'Transporter ID', 'Hours']
export const FILTER_OPS = ['Equals', 'Does not equal', 'Contains', 'Is empty']

export const WRITE_MODES = ['This week’s overrides', 'Standing patterns']

export const STEPS = ['Choose source', 'Upload file', 'Map columns', 'Value map', 'Review and run']

export const BATCH_STATUSES = ['Done', 'Needs review', 'Rolled back']

/** The grid never shows more than a fortnight at once. */
export const MAX_RANGE_DAYS = 14

/** How far either side of the anchor the calendar will go. */
export const MIN_OFFSET = -35
export const MAX_OFFSET = 62

export function stateColor(s: string): string {
  if (s === 'Available') return 'var(--success-fg)'
  if (s === 'Unavailable') return 'var(--text-secondary)'
  return 'var(--green-700)'
}

export function batchTone(status: string): { bg: string; fg: string; dot: string } {
  if (status === 'Done') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (status === 'Needs review') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

/** Avatar tints, picked by a hash of the name - the DS rule. */
export function tint(name: string): [string, string] {
  const tints: [string, string][] = [
    ['var(--blue-100)', 'var(--blue-700)'],
    ['var(--green-100)', 'var(--green-700)'],
    ['var(--yellow-100)', 'var(--yellow-700)'],
    ['var(--red-100)', 'var(--red-700)'],
  ]
  return tints[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % tints.length]
}

export const initialsOf = (name: string): string =>
  name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const PAGE_SIZE = 10
export const BATCH_PAGE_SIZE = 8
