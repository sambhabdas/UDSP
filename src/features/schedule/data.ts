// Schedule - one week of the station, seven columns wide.
//
// A shift is a (DA, day, department) triple. The department carries the start
// time and the length, so a shift only overrides them when someone typed real
// punches into it.

export interface Palette {
  fg: string
  bg: string
  bd: string
  dot: string
}

export interface Dept {
  id: string
  name: string
  code: string
  /** Minutes past midnight. */
  start: number
  /** Hours. */
  len: number
  /** A weekly ceiling per DA. Null means uncapped. */
  cap: number | null
  qual: string | null
  active: boolean
  striped?: boolean
  /** Lunch out / in, when the template pins them. */
  lo?: number
  li?: number
  c: Palette
}

export interface Da {
  id: string
  name: string
  tid: string
  /** Paycom's employee code. Blank means payroll cannot identify them. */
  ee: string
  score: number
  tier: Tier
  quals: string[]
  rate: number | null
  blocked?: boolean
  noWork?: boolean
  /** Seven flags, Sunday first. */
  avail: number[]
}

export type Tier = 'Top' | 'Good' | 'Fair' | 'At risk'

export interface Shift {
  da: string
  day: number
  dept: string
  manual?: boolean
  /** Set only when the shift overrides its department's template. */
  start?: number
  len?: number
  lo?: number
  li?: number
  note?: string
}

export interface Exclusion {
  da: string
  reason: string
  until: string | null
}

export interface Override {
  t: 'PTO'
  h: number
  reason: string
}

export interface ExportLogRow {
  when: string
  by: string
  preset: string
  format: string
  range: string
  rows: string
  scores: string
  file: string
}

export interface AuditRow {
  when: string
  who: string
  action: string
  detail: string
}

const P = (fg: string, bg: string, bd: string, dot: string): Palette => ({ fg, bg, bd, dot })

/**
 * The tier palette, matching the Associates canon: Top and Good are both green
 * and separated only by the dot, Fair is amber, At risk is red.
 */
export const TIERS: Record<Tier, Palette> = {
  Top: P('var(--success-fg)', 'var(--success-bg)', 'var(--success-border)', 'var(--green-700)'),
  Good: P('var(--success-fg)', 'var(--success-bg)', 'var(--success-border)', 'var(--success-accent)'),
  Fair: P('var(--warning-fg)', 'var(--warning-bg)', 'var(--warning-border)', 'var(--warning-accent)'),
  'At risk': P('var(--danger-fg)', 'var(--danger-bg)', 'var(--danger-border)', 'var(--danger-accent)'),
}

export const DEPTS: Dept[] = [
  { id: 'DOT', name: 'DOT routes', code: 'DOT', start: 450, len: 10, cap: null, qual: 'DOT cert', active: true, c: P('var(--blue-700)', 'var(--blue-50)', 'var(--blue-200)', 'var(--blue-500)') },
  { id: 'STD', name: 'Standard', code: 'STD', start: 540, len: 9, cap: null, qual: null, active: true, c: P('var(--neutral-600)', 'var(--neutral-100)', 'var(--neutral-200)', 'var(--neutral-500)') },
  { id: 'RSC', name: 'Rescue', code: 'RSC', start: 630, len: 4, cap: null, qual: null, active: true, c: P('var(--yellow-700)', 'var(--yellow-50)', 'var(--yellow-200)', 'var(--yellow-600)') },
  { id: 'SBY', name: 'Standby', code: 'SBY', start: 420, len: 10, cap: 1, qual: null, active: true, striped: true, c: P('var(--neutral-600)', 'var(--neutral-50)', 'var(--neutral-200)', 'var(--neutral-400)') },
]

export const DAS: Da[] = [
  { id: 'okafor', name: 'Okafor, Chidi', tid: 'TR-4821', ee: '4821', score: 186, tier: 'Top', quals: ['DOT cert'], rate: 24.5, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'vang', name: 'Vang, Mai', tid: 'TR-3307', ee: '3307', score: 171, tier: 'Top', quals: ['DOT cert'], rate: 23, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'woods', name: 'Woods, Tanya', tid: 'TR-2214', ee: '2214', score: 158, tier: 'Good', quals: ['DOT cert'], rate: null, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'karim', name: 'Karim, Sofia', tid: 'TR-5190', ee: '5190', score: 140, tier: 'Good', quals: ['DOT cert'], rate: 24, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'diaz', name: 'Diaz, Marcus', tid: 'TR-1186', ee: '1186', score: 122, tier: 'Good', quals: [], rate: 21, avail: [0, 0, 0, 0, 0, 0, 1] },
  { id: 'alvarez', name: 'Alvarez, Rosa', tid: 'TR-6002', ee: '6002', score: 95, tier: 'Good', quals: ['DOT cert'], rate: 23.5, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'boone', name: 'Boone, Jesse', tid: 'TR-2890', ee: '2890', score: 81, tier: 'Fair', quals: [], rate: null, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'knoke', name: 'Knoke, Daniel', tid: 'TR-7731', ee: '', score: 64, tier: 'Fair', quals: [], rate: null, avail: [1, 1, 1, 1, 1, 1, 0] },
  { id: 'tran', name: 'Tran, Vinh', tid: 'TR-8419', ee: '', score: 38, tier: 'Fair', quals: [], rate: null, noWork: true, avail: [0, 0, 1, 1, 1, 1, 1] },
  { id: 'patel', name: 'Patel, Dev', tid: 'TR-9954', ee: '9954', score: -62, tier: 'At risk', quals: [], rate: 22.5, blocked: true, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'ruiz', name: 'Ruiz, Fernanda', tid: 'TR-1042', ee: '1042', score: 12, tier: 'Fair', quals: [], rate: 22.5, avail: [1, 1, 1, 1, 1, 1, 1] },
]

export const EXCLUDED: Exclusion[] = [
  { da: 'woods', reason: 'Suspended', until: 'Aug 5' },
  { da: 'diaz', reason: 'Leave', until: null },
  { da: 'ruiz', reason: 'New hire', until: null },
]

export const SEED_SHIFTS: Record<number, Shift[]> = {
  31: [
    { da: 'okafor', day: 0, dept: 'DOT' }, { da: 'okafor', day: 1, dept: 'DOT' }, { da: 'okafor', day: 2, dept: 'DOT' }, { da: 'okafor', day: 3, dept: 'DOT' }, { da: 'okafor', day: 4, dept: 'DOT' },
    { da: 'vang', day: 1, dept: 'DOT' }, { da: 'vang', day: 2, dept: 'DOT' }, { da: 'vang', day: 3, dept: 'DOT' }, { da: 'vang', day: 4, dept: 'DOT' }, { da: 'vang', day: 5, dept: 'DOT' },
    { da: 'woods', day: 2, dept: 'DOT' }, { da: 'woods', day: 3, dept: 'DOT' }, { da: 'woods', day: 4, dept: 'DOT' },
    { da: 'karim', day: 0, dept: 'STD' }, { da: 'karim', day: 1, dept: 'STD' }, { da: 'karim', day: 2, dept: 'STD' }, { da: 'karim', day: 3, dept: 'STD' }, { da: 'karim', day: 4, dept: 'STD' },
    { da: 'diaz', day: 6, dept: 'RSC', manual: true },
    { da: 'alvarez', day: 0, dept: 'STD' }, { da: 'alvarez', day: 1, dept: 'STD' }, { da: 'alvarez', day: 5, dept: 'DOT' }, { da: 'alvarez', day: 6, dept: 'DOT' },
    { da: 'boone', day: 2, dept: 'STD' }, { da: 'boone', day: 3, dept: 'STD' }, { da: 'boone', day: 4, dept: 'STD' }, { da: 'boone', day: 5, dept: 'STD' }, { da: 'boone', day: 6, dept: 'SBY', manual: true },
    { da: 'knoke', day: 0, dept: 'RSC' }, { da: 'knoke', day: 1, dept: 'RSC' }, { da: 'knoke', day: 2, dept: 'RSC' }, { da: 'knoke', day: 3, dept: 'RSC' }, { da: 'knoke', day: 4, dept: 'RSC' },
    { da: 'tran', day: 5, dept: 'RSC' }, { da: 'tran', day: 6, dept: 'STD' },
  ],
}

/** Approved time off, by week then DA then day. Always a hard gate. */
export const SEED_OVERRIDES: Record<number, Record<string, Record<number, Override>>> = {
  31: { karim: { 2: { t: 'PTO', h: 8, reason: 'Family day, approved Jul 20' } } },
}

/** How many of each department each day needs. */
export const SEED_NEEDS: Record<number, Record<string, number[]>> = {
  31: {
    DOT: [3, 3, 3, 3, 3, 3, 2],
    STD: [2, 2, 2, 2, 2, 2, 2],
    RSC: [1, 1, 1, 1, 1, 1, 1],
    SBY: [0, 0, 0, 0, 0, 0, 1],
  },
}

export const SEED_EXPORT_LOG: ExportLogRow[] = [
  {
    when: 'Jul 25, 2026 · 6:02 PM', by: 'D. Whitfield', preset: 'Paycom', format: 'CSV',
    range: 'Jul 26 - Aug 1', rows: '36 rows', scores: 'DA-safe',
    file: 'UDSP_schedule_paycom_2026-07-26_2026-08-01.csv',
  },
]

export const SEED_AUDIT: AuditRow[] = [
  { when: 'Jul 25 · 6:02 PM', who: 'D. Whitfield', action: 'Export', detail: 'Paycom · CSV · Jul 26 - Aug 1 · 36 rows' },
  { when: 'Jul 25 · 4:41 PM', who: 'M. Ortega', action: 'Swap', detail: 'Fri DOT 07:30 · Woods, Tanya to Vang, Mai' },
  { when: 'Jul 24 · 6:05 PM', who: 'D. Whitfield', action: 'Add shift', detail: 'Sat SBY 07:00 · Boone, Jesse · manual' },
  { when: 'Jul 24 · 6:02 PM', who: 'Auto Schedule', action: 'Run', detail: 'W31 · 33 of 40 slots filled' },
]

/** The weeks the page can step between. */
export const MIN_WEEK = 30
export const MAX_WEEK = 32

/** The weekly ceiling every DA is checked against. */
export const HOURS_CAP = 50
/** Where the hours cell turns amber ahead of the cap. */
export const HOURS_WARN = 46

/** Avatar tints, picked by a hash of the name - the same rule the DS uses. */
export function tint(name: string): [string, string] {
  const tints: [string, string][] = [
    ['var(--blue-100)', 'var(--blue-700)'],
    ['var(--green-100)', 'var(--green-700)'],
    ['var(--yellow-100)', 'var(--yellow-700)'],
    ['var(--red-100)', 'var(--red-700)'],
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return tints[hash % tints.length]
}

export const initialsOf = (name: string): string =>
  name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
