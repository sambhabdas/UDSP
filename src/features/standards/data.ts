// Standards - the scoring rulebook.
//
// Two halves: the catalogue of what scores and by how much, and the tier
// ladder that turns a net score into a label. Everything else on the page is
// derived from these two.

export interface StandardRow {
  name: string
  /** Points lost per unit; 0 when the standard only scores upward. */
  neg: number
  pos: number
  per: string
  module: string | null
  auto: boolean
  due: number | null
  custom?: boolean
  inactive?: boolean
  /** A built-in whose points were changed from the shipped default. */
  edited?: boolean
  editedHint?: string
  desc?: string
}

export interface Category {
  name: string
  dot: string
  custom: boolean
  rows: StandardRow[]
}

const S = (
  name: string, neg: number, pos: number, per: string,
  module?: string | null, auto?: boolean, due?: number | null,
  extra?: Partial<StandardRow>,
): StandardRow => ({ name, neg, pos, per, module: module ?? null, auto: !!auto, due: due ?? null, ...extra })

export const SEED_CATEGORIES: Category[] = [
  {
    name: 'Safety', dot: 'var(--red-500)', custom: false, rows: [
      S('Seatbelt', 60, 1, 'Valid violation', 'Seatbelt Safety 101', true, 3),
      S('Speeding', 60, 1, 'Valid violation', 'Safe Speed Coaching', true, 3),
      S('Sign and Signal', 60, 1, 'Valid violation'),
      S('Distractions', 45, 1, 'Valid violation', 'Distraction-Free Driving', true, 3),
      S('Following Distance', 35, 1, 'Valid violation', 'Safe Following Distance', true, 3),
    ],
  },
  {
    name: 'DSB', dot: 'var(--blue-500)', custom: false, rows: [
      S('Simultaneous Deliveries', 100, 0, 'Event'),
      S('Delivered Over 50 Meters', 100, 0, 'Event', 'Delivery Distance Rules', true, 7),
      S('Incorrect Scan Attended', 100, 0, 'Event'),
      S('Incorrect Scan Unattended', 100, 0, 'Event'),
      S('No POD on Delivery', 100, 0, 'Event'),
      S('Scanned but Not Delivered', 100, 0, 'Event'),
    ],
  },
  {
    name: 'CDF', dot: 'var(--yellow-600)', custom: false, rows: [
      S('Mishandled Package', 8, 0, 'Event', 'Package Handling Basics', true, 7),
      S('Unprofessional', 8, 0, 'Event'),
      S('Did Not Follow Delivery Instructions', 8, 0, 'Event'),
      S('Wrong Address', 8, 0, 'Event'),
      S('Never Received', 8, 0, 'Event'),
      S('Wrong Item', 8, 0, 'Event'),
    ],
  },
  {
    name: 'DVIC', dot: 'var(--neutral-500)', custom: false, rows: [
      S('DVIC Not Done', 10, 0.1, 'Event'),
      S('DVIC Under 90 Seconds', 7, 0.1, 'Event'),
    ],
  },
  {
    name: 'Work Ethics', dot: 'var(--yellow-700)', custom: false, rows: [
      S('Unexcused Absence', 30, 1, 'Event', 'Attendance Matters', false, 7),
      S('Violence', 2000, 0, 'Event'),
      S('Order Refusal', 200, 1, 'Event'),
      S('Damage', 10, 1, 'Dollar', 'Damage Prevention', true, 7, { edited: true, editedHint: 'K. Ortiz · Aug 5 · -8 to -10' }),
      S('Intentional Wrong Punch', 1000, 0, 'Event'),
    ],
  },
  {
    name: 'Helping PT', dot: 'var(--green-600)', custom: false, rows: [
      S('Helped Dispatch', 0, 30, 'Event'),
      S('Shift Pick-Up', 0, 30, 'Event'),
      S('Split Route', 0, 30, 'Event'),
    ],
  },
  {
    name: 'Station', dot: 'var(--blue-400)', custom: true, rows: [
      S('Staging Errors', 15, 2, 'Event', null, false, null, { custom: true }),
      S('Late Van Return', 20, 0, 'Minute', null, false, null, { custom: true, inactive: true }),
    ],
  },
]

export interface Tier {
  name: string
  /** The lower bound; null marks the bottom tier, which has no floor. */
  from: number | null
  color: string
  risk: boolean
  note?: string
}

export const SEED_TIERS: Tier[] = [
  { name: 'Excellent', from: 50, color: 'var(--green-700)', risk: false },
  { name: 'Good', from: 10, color: 'var(--green-500)', risk: false },
  { name: 'Decent', from: 0, color: 'var(--neutral-400)', risk: false },
  { name: 'Needs Work', from: -49, color: 'var(--yellow-600)', risk: false },
  { name: 'At Risk', from: null, color: 'var(--red-600)', risk: true },
]

export const MODULES = [
  'Seatbelt Safety 101', 'Safe Speed Coaching', 'Distraction-Free Driving', 'Safe Following Distance',
  'Delivery Distance Rules', 'Package Handling Basics', 'Attendance Matters', 'Damage Prevention',
]

export const ROSTER_NETS: [string, number][] = [
  ['Priya Shah', 186], ['Alex Chen', 154], ['Sam Ortiz', 131], ['Maria Lopez', 44], ['David Park', 12],
  ['Nina Torres', 6], ['Omar Haddad', 0], ['Chris Boone', -18], ['Leah Grant', -33], ['Dana Kim', -58],
  ['Jorge Ruiz', -71], ['Tina Alvarez', -96], ['Marcus Webb', -142],
]

export const SWATCHES = [
  'var(--green-800)', 'var(--green-600)', 'var(--green-500)', 'var(--green-300)',
  'var(--blue-600)', 'var(--blue-400)', 'var(--yellow-500)', 'var(--yellow-600)',
  'var(--yellow-700)', 'var(--red-500)', 'var(--red-600)', 'var(--neutral-400)',
]

export const PER_UNITS = ['Valid violation', 'Event', 'Dollar', 'Minute']

export const signed = (n: number): string => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n)}`

/** Highest band first - the order the ladder and the distribution both read in. */
export const sortTiers = (list: Tier[]): Tier[] =>
  list.slice().sort((a, b) => (b.from === null ? -Infinity : b.from) - (a.from === null ? -Infinity : a.from))

/** "50 and above", "10 to 49", "-50 and below". */
export function bandOf(tiers: Tier[], i: number): string {
  const t = tiers[i]
  const above = tiers[i - 1]
  if (t.from === null) return `${(above ? above.from! - 1 : 0)} and below`
  if (!above) return `${t.from} and above`
  return `${t.from} to ${above.from! - 1}`
}

/** Who currently sits in a band. */
export function namesIn(tiers: Tier[], i: number): string[] {
  const t = tiers[i]
  const above = tiers[i - 1]
  const lo = t.from === null ? -Infinity : t.from
  const hi = above ? above.from! - 1 : Infinity
  return ROSTER_NETS.filter((r) => r[1] >= lo && r[1] <= hi).map((r) => r[0])
}

export const countIn = (tiers: Tier[], i: number): number => namesIn(tiers, i).length
