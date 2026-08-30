// Seed for Financial Management · Rate Cards, from RateCards.dc.html.
//
// A rate is never a single number — it is a dated WINDOW. Every figure on this
// page is priced with the rate that was in force on the day it belongs to, so
// changing a rate today cannot rewrite what yesterday earned.

/** A dated rate. `to: null` means it runs until something later closes it. */
export interface RateWindow {
  rate: number
  from: string
  to: string | null
  by: string
  at: string
  /** True when the end date was set by hand rather than by a later change. */
  bounded?: boolean
  /** The two Others rows can be switched off entirely. */
  paid?: boolean
}

export type PaidBy = 'Amazon' | 'DSP'

export interface ServiceType {
  id: string
  name: string
  hours: number
  paidBy: PaidBy
  /** Before this day the type did not exist, so it ran no routes. */
  created: string
  windows: RateWindow[]
}

/** What a rate change is being made to. */
export type RateKind = 'route' | 'package' | 'training'

// The design file pins "today" so the seeded week always reads the same.
export const TODAY = new Date(2026, 6, 29) // Wed Jul 29, 2026

// Payroll has closed these days; a rate change cannot reach back through them.
export const LOCKED_THROUGH = new Date(2026, 6, 25)

// The week the daily counts below describe: Sun Jul 26 – Sat Aug 1, 2026.
export const WEEK0 = new Date(2026, 6, 26)

// Where the timeline starts, and the months it can span.
export const TIMELINE_ANCHOR = new Date(2026, 2, 1)
export const ZOOM_STEPS = [2, 3, 6, 9, 12, 18, 24]
export const DEFAULT_MONTHS = 6

const w = (
  rate: number,
  from: string,
  to: string | null,
  by: string,
  at: string,
  bounded?: boolean,
): RateWindow => ({ rate, from, to, by, at, bounded: !!bounded })

export const SEED_TYPES: ServiceType[] = [
  {
    id: 'sv10', name: 'Step Van', hours: 10, paidBy: 'Amazon', created: '2026-01-19',
    windows: [
      w(362, '2026-01-19', '2026-03-20', 'M. Chen', 'Jan 12, 2026'),
      w(375, '2026-03-21', '2026-06-09', 'M. Chen', 'Mar 18, 2026'),
      w(360, '2026-06-10', null, 'N. Shazu', 'Jun 8, 2026'),
    ],
  },
  {
    id: 'sv9', name: 'Step Van', hours: 9, paidBy: 'Amazon', created: '2026-07-05',
    windows: [w(325, '2026-07-05', null, 'N. Shazu', 'Jul 5, 2026')],
  },
  {
    id: 'xl9', name: 'XL Van', hours: 9, paidBy: 'Amazon', created: '2026-01-19',
    windows: [
      w(362, '2026-01-19', '2026-03-20', 'M. Chen', 'Jan 12, 2026'),
      w(375, '2026-03-21', '2026-06-09', 'M. Chen', 'Mar 18, 2026'),
      w(360, '2026-06-10', '2026-07-04', 'N. Shazu', 'Jun 8, 2026'),
      w(335, '2026-07-05', null, 'N. Shazu', 'Jul 5, 2026'),
    ],
  },
  {
    id: 'lv10', name: 'Large Van', hours: 10, paidBy: 'Amazon', created: '2026-01-19',
    windows: [
      w(362, '2026-01-19', '2026-03-20', 'M. Chen', 'Jan 12, 2026'),
      w(375, '2026-03-21', '2026-06-09', 'M. Chen', 'Mar 18, 2026'),
      w(360, '2026-06-10', null, 'N. Shazu', 'Jun 8, 2026'),
    ],
  },
  {
    id: 'ad4', name: 'Adhoc', hours: 4, paidBy: 'Amazon', created: '2026-01-19',
    windows: [
      w(150, '2026-01-19', '2026-06-01', 'M. Chen', 'Jan 12, 2026'),
      // The one window with an end somebody typed, rather than one a later
      // change closed — the timeline colours it differently for that reason.
      w(180, '2026-06-02', '2026-06-02', 'N. Shazu', 'Jun 1, 2026', true),
      w(150, '2026-06-03', null, 'N. Shazu', 'Jun 1, 2026'),
    ],
  },
  {
    id: 'ur4', name: 'Unpaid Rescues', hours: 4, paidBy: 'DSP', created: '2026-01-19',
    windows: [w(0, '2026-01-19', null, 'System', 'Jan 19, 2026')],
  },
]

export const SEED_PKG_WINDOWS: RateWindow[] = [
  { rate: 0.12, paid: true, from: '2026-01-19', to: null, by: 'M. Chen', at: 'Jan 19, 2026' },
]

export const SEED_TRAIN_WINDOWS: RateWindow[] = [
  { rate: 45, paid: true, from: '2026-01-19', to: null, by: 'M. Chen', at: 'Jan 19, 2026' },
]

// Routes run per day across WEEK0, keyed by service type.
export const DAILY: Record<string, number[]> = {
  sv10: [17, 17, 16, 17, 17, 16, 14],
  sv9: [2, 2, 2, 2, 2, 2, 2],
  xl9: [8, 8, 8, 8, 8, 7, 7],
  lv10: [5, 5, 5, 5, 5, 5, 5],
  ad4: [1, 1, 1, 1, 1, 1, 1],
  ur4: [0, 0, 0, 1, 0, 0, 0],
}

export const PKG = [7222, 7400, 7200, 7392, 7200, 7100, 7100]
export const TRAIN = [3, 2, 2, 3, 2, 2, 1]

// What a route of each type costs to run — only used to show what a rate change
// does to the day's margin.
export const COST: Record<string, number> = {
  sv10: 250, sv9: 230, xl9: 232, lv10: 250, ad4: 105, ur4: 180,
}
export const OVERHEAD = 1601.45

/** Service types Work Summary knows about that this page has not priced yet. */
export const REGISTRY: { name: string; hours: number; paidBy: PaidBy }[] = [
  { name: 'Cargo Van', hours: 8, paidBy: 'Amazon' },
  { name: 'Nursery Route', hours: 10, paidBy: 'Amazon' },
  { name: 'Standby', hours: 4, paidBy: 'DSP' },
]

export interface Note {
  author: string
  at: string
  text: string
}

export const SEED_NOTES: Note[] = [
  {
    author: 'N. Shazu',
    at: 'Sun Jul 5, 8:02 am',
    text: '9-hour Step Van blocks start today at $325. The 10-hour rate is unchanged.',
  },
]

export const CURRENT_USER = 'Kai Sato'

/** A window's state, as the To column and the filter panel name it. */
export type WindowState = 'Open' | 'Bounded' | 'Locked'
