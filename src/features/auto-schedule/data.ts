// Auto Schedule - the same roster and the same week math as Schedule, seen
// from the other end: instead of placing shifts by hand, you set the needs and
// the rules and let the run place them, then read why it did what it did.
//
// The calendar comes from Schedule's own module rather than a second copy -
// both pages anchor week 31 to Sunday Jul 26, 2026 and must never disagree.

export interface Palette {
  fg: string
  bg: string
  bd: string
  dot: string
}

export type Tier = 'Top' | 'Good' | 'Fair' | 'At risk'

const P = (fg: string, bg: string, bd: string, dot: string): Palette => ({ fg, bg, bd, dot })

export const TIERS: Record<Tier, Palette> = {
  Top: P('var(--success-fg)', 'var(--success-bg)', 'var(--success-border)', 'var(--green-700)'),
  Good: P('var(--success-fg)', 'var(--success-bg)', 'var(--success-border)', 'var(--success-accent)'),
  Fair: P('var(--warning-fg)', 'var(--warning-bg)', 'var(--warning-border)', 'var(--warning-accent)'),
  'At risk': P('var(--danger-fg)', 'var(--danger-bg)', 'var(--danger-border)', 'var(--danger-accent)'),
}

export interface Dept {
  id: string
  name: string
  /** Hours one shift of this kind is worth. */
  len: number
  /** A per-DA weekly ceiling. Null means uncapped. */
  cap: number | null
  qual: string | null
  dot: string
}

export const DEPTS: Dept[] = [
  { id: 'DOT', name: 'DOT routes', len: 10, cap: null, qual: 'DOT cert', dot: 'var(--blue-500)' },
  { id: 'STD', name: 'Standard', len: 9, cap: null, qual: null, dot: 'var(--neutral-500)' },
  { id: 'RSC', name: 'Rescue', len: 4, cap: null, qual: null, dot: 'var(--yellow-600)' },
  { id: 'SBY', name: 'Standby', len: 10, cap: 1, qual: null, dot: 'var(--neutral-400)' },
]

export interface Da {
  id: string
  name: string
  tid: string
  score: number
  tier: Tier
  quals: string[]
  blocked?: boolean
  avail: number[]
}

export const DAS: Da[] = [
  { id: 'okafor', name: 'Okafor, Chidi', tid: 'TR-4821', score: 186, tier: 'Top', quals: ['DOT cert'], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'vang', name: 'Vang, Mai', tid: 'TR-3307', score: 171, tier: 'Top', quals: ['DOT cert'], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'woods', name: 'Woods, Tanya', tid: 'TR-2214', score: 158, tier: 'Good', quals: ['DOT cert'], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'karim', name: 'Karim, Sofia', tid: 'TR-5190', score: 140, tier: 'Good', quals: ['DOT cert'], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'diaz', name: 'Diaz, Marcus', tid: 'TR-1186', score: 122, tier: 'Good', quals: [], avail: [0, 0, 0, 0, 0, 0, 1] },
  { id: 'alvarez', name: 'Alvarez, Rosa', tid: 'TR-6002', score: 95, tier: 'Good', quals: ['DOT cert'], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'boone', name: 'Boone, Jesse', tid: 'TR-2890', score: 81, tier: 'Fair', quals: [], avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'knoke', name: 'Knoke, Daniel', tid: 'TR-7731', score: 64, tier: 'Fair', quals: [], avail: [1, 1, 1, 1, 1, 1, 0] },
  { id: 'tran', name: 'Tran, Vinh', tid: 'TR-8419', score: 38, tier: 'Fair', quals: [], avail: [0, 0, 1, 1, 1, 1, 1] },
  { id: 'patel', name: 'Patel, Dev', tid: 'TR-9954', score: -62, tier: 'At risk', quals: [], blocked: true, avail: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'ruiz', name: 'Ruiz, Fernanda', tid: 'TR-1042', score: 12, tier: 'Fair', quals: [], avail: [1, 1, 1, 1, 1, 1, 1] },
]

export interface Exclusion {
  da: string
  reason: string
  until: string | null
  /** An exclusion that lapses mid-week 32 only applies up to this day. */
  untilDay32?: number
  note?: string | null
}

export const SEED_EXCLUDED: Exclusion[] = [
  { da: 'woods', reason: 'Suspended', until: 'Aug 5', untilDay32: 3 },
  { da: 'diaz', reason: 'Leave', until: null },
  { da: 'ruiz', reason: 'New hire', until: null },
]

export type Needs = Record<string, number[]>

/** What week 31 was actually run against - the run in the log. */
export const W31_NEEDS: Needs = {
  DOT: [3, 3, 3, 3, 3, 3, 2],
  STD: [2, 2, 2, 2, 2, 2, 2],
  RSC: [1, 1, 1, 1, 1, 1, 1],
  SBY: [0, 0, 0, 0, 0, 0, 1],
}

/** The matrix the Setup tab opens on - Friday DOT is deliberately over-asked. */
export const SEED_NEEDS: Needs = {
  DOT: [3, 3, 3, 3, 3, 5, 2],
  STD: [2, 2, 2, 2, 2, 2, 2],
  RSC: [1, 1, 1, 1, 1, 1, 1],
  SBY: [0, 0, 0, 0, 0, 0, 1],
}

export const WEEKS = [31, 32, 33]

export const EXCLUSION_REASONS = ['New hire', 'Suspended', 'Leave', 'Other']
export const WINDOW_OPTIONS = [5, 7, 10, 14]
export const CAP_OPTIONS = [40, 50, 60, 70]
export const SCORE_WINDOWS = [10, 20, 30]
export const RANK_SOURCES = ['Scorecard net score', 'Seniority - roster start date', 'Fewest hours this week']

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

export const daOf = (id: string): Da => DAS.find((d) => d.id === id) as Da
export const deptOf = (id: string, depts: Dept[] = DEPTS): Dept => depts.find((d) => d.id === id) as Dept
