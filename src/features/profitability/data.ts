// Seed for Profitability, from Profitability.dc.html.
//
// The grain is the 2-week PAY PERIOD, from Payroll Setup's locked calendar.
// Fifteen closed periods plus the current one, which is projected because not
// every input has landed yet.

export type WeekStatus = 'validated' | 'dispute' | 'noinv'

/** One Amazon invoice week inside a pay period. */
export interface Week {
  n: number
  start: Date
  rev: number
  routes: number
  status: WeekStatus
}

/** Cost split by group: gross pay (g) and employer tax (t) for driver,
 *  dispatch and training. */
export interface CostSplit {
  dg: number
  dsg: number
  tg: number
  dt: number
  dst: number
  tt: number
}

export interface Hours {
  reg: number
  ot: number
  pto: number
  /** True while the period is still running, so the hours are partial. */
  toDate?: boolean
}

/** A pay period - the grain of this whole page. */
export interface Period {
  id: string
  year: number
  idx: number
  closed: boolean
  start: Date
  routes: number
  rev: number
  cost: number
  sp: CostSplit
  weeks: Week[]
  /** A week still under dispute leaves the period's revenue provisional. */
  prov: boolean
  restated: boolean
  hours: Hours | null
  projected?: boolean
}

const r2 = (v: number) => Math.round(v * 100) / 100
const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// [id, year, routes, revenue, cost]
const RAW: [string, number, number, number, number][] = [
  ['P25', 2025, 415, 146882.4, 93214.75],
  ['P26', 2025, 419, 148210.55, 94002.1],
  ['P1', 2026, 412, 147355.2, 93871.4],
  ['P2', 2026, 420, 149982.75, 94510.65],
  ['P3', 2026, 424, 150844.3, 95122.85],
  ['P4', 2026, 428, 152110.2, 95384.1],
  ['P5', 2026, 435, 155472.85, 96801.45],
  ['P6', 2026, 431, 153987.4, 96110.25],
  ['P7', 2026, 440, 157240.1, 97905.6],
  ['P8', 2026, 432, 154872.4, 96418.22],
  ['P9', 2026, 438, 155610.75, 101374.3],
  ['P10', 2026, 449, 160988.5, 99975.1],
  ['P11', 2026, 452, 162447.9, 100236.3],
  ['P12', 2026, 455, 163882.25, 101004.75],
  ['P13', 2026, 450, 165345.68, 101859.4],
]

const BASE = new Date(2026, 0, 4)

// Cost splits into gross pay and employer tax per group. Every period but P13
// derives its split from the same fixed shares; P13 carries the figures Payroll
// Setup actually posted.
function splitCost(cost: number): CostSplit {
  const dg = r2(cost * 0.8113)
  const dsg = r2(cost * 0.0632)
  const tg = r2(cost * 0.0281)
  const dt = r2(cost * 0.08804)
  const dst = r2(cost * 0.006366)
  return { dg, dsg, tg, dt, dst, tt: r2(cost - dg - dsg - tg - dt - dst) }
}

const P13_SPLIT: CostSplit = { dg: 82642.65, dsg: 6439.5, tg: 2862.0, dt: 8967.7, dst: 648.4, tt: 299.15 }

export const PERIODS: Period[] = RAW.map((r, i) => {
  const [id, year, routes, rev, cost] = r
  const start = addDays(BASE, i * 14)
  const w1n = 2 + i * 2
  const w1rev = id === 'P13' ? 81942.0 : r2(rev * 0.49558)
  const w1routes = Math.round(routes / 2)
  return {
    id,
    year,
    idx: i,
    closed: true,
    start,
    routes,
    rev,
    cost,
    sp: id === 'P13' ? P13_SPLIT : splitCost(cost),
    weeks: [
      { n: w1n, start, rev: w1rev, routes: w1routes, status: 'validated' },
      {
        n: w1n + 1,
        start: addDays(start, 7),
        rev: r2(rev - w1rev),
        routes: routes - w1routes,
        // One week is still being disputed, which is why P12 reads provisional.
        status: id === 'P12' ? 'dispute' : 'validated',
      },
    ],
    prov: id === 'P12',
    restated: id === 'P11',
    hours:
      id === 'P12'
        ? { reg: 7846, ot: 402, pto: 88 }
        : id === 'P13'
          ? { reg: 7918, ot: 371, pto: 104 }
          : null,
  }
})

// The current period is projected from the trailing three clean periods: the
// weeks with no invoice yet are priced at the trailing revenue per route, and
// cost at the trailing cost per route.
const TRAIL = PERIODS.filter((p) => !p.prov).slice(-3)
const TRAIL_ROUTES = TRAIL.reduce((a, p) => a + p.routes, 0)
export const TRAIL_RPR = TRAIL.reduce((a, p) => a + p.rev, 0) / TRAIL_ROUTES
export const TRAIL_CPR = TRAIL.reduce((a, p) => a + p.cost, 0) / TRAIL_ROUTES

const W33_REV = r2(225 * TRAIL_RPR)
const CUR_START = addDays(BASE, 15 * 14)

export const CURRENT: Period = (() => {
  const cost = r2(TRAIL_CPR * 452)
  return {
    id: 'P14',
    year: 2026,
    idx: 15,
    closed: false,
    start: CUR_START,
    routes: 452,
    rev: r2(83560.14 + W33_REV),
    cost,
    sp: splitCost(cost),
    weeks: [
      { n: 32, start: CUR_START, rev: 83560.14, routes: 227, status: 'validated' },
      { n: 33, start: addDays(CUR_START, 7), rev: W33_REV, routes: 225, status: 'noinv' },
    ],
    prov: false,
    restated: false,
    hours: { reg: 6204, ot: 262, pto: 64, toDate: true },
    projected: true,
  }
})()

export const ALL = PERIODS.concat([CURRENT])

/** A period that carries real timecards - what the hours charts need. */
export type TimedPeriod = Period & { hours: Hours }
export const BY_ID: Record<string, Period> = Object.fromEntries(ALL.map((p) => [p.id, p]))

// Chart ceilings, so bar heights come from the design file rather than a
// re-derived max.
export const AXIS = {
  revenue: 180000,
  margin: 50,
  perRoute: 400,
  cost: 120000,
  hours: 9000,
  payCost: 90000,
  staff: 60,
  idleCost: 120000,
}

export const RANGES: [number, string][] = [
  [3, 'Last 3 periods'],
  [6, 'Last 6 periods'],
  [10, 'Last 10 periods'],
]

export type CompareMode = 'prev' | 'ly' | 't3' | 'none'

export const COMPARE_MODES: [CompareMode, string][] = [
  ['prev', 'Previous period'],
  ['ly', 'Same period last year'],
  ['t3', 'Trailing-3 average'],
  ['none', 'None'],
]

// The three inputs the current period is waiting on.
export const INPUT_ROWS: { name: string; status: string; kind: BadgeKind }[] = [
  { name: 'W32 invoice', status: 'Uploaded', kind: 'validated' },
  { name: 'W33 invoice', status: 'Not uploaded', kind: 'noinv' },
  { name: 'Payroll', status: 'Not posted', kind: 'provisional' },
]

export const WARN_TITLE =
  'W29 · Jul 12 - 18 under dispute · revenue reads the billed total until every week validates'
export const RESTATED_TITLE = 'Adjusted Jun 24 · +$1,238.40 dispute recovery on W27'

export type BadgeKind =
  | 'closed'
  | 'validated'
  | 'projected'
  | 'provisional'
  | 'dispute'
  | 'noinv'

export const CHART_KEYS = ['c1', 'c3', 'c2', 'c4', 'c5', 'c6', 'c7']
export const LAYOUT_STORAGE_KEY = 'udsp-profitability-layout'
