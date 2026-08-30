// Fleet Financials' seed, lifted from FleetFinancials.dc.html.
//
// Three money streams meet here: what Amazon pays per week, what the lessor and
// the insurer charge per month, and what service cost out of pocket. The page
// exists to net them per van.

export type Status = 'In service' | 'In shop' | 'Grounded' | 'Off fleet'

export interface Vehicle {
  id: string
  name: string
  vin: string
  own: 'Owned' | 'Rented'
  status: Status
  days: number
  lease: number | null
  ins: number | null
  /** Amazon's five weekly payments in the current month. */
  wk: (number | null)[]
  oop: number
  /** Off-fleet vans stop accruing after this month index. */
  off?: string
  offM?: number
  restated?: boolean
}

export const VEHICLES: Vehicle[] = [
  { id: 'v103', name: 'Van 103', vin: '1FTBW2CM1PKB60427', own: 'Rented', status: 'In service', days: 18, lease: 864, ins: 326, wk: [312, 352, 344, 336, 336], oop: 60 },
  { id: 'v107', name: 'Van 107', vin: '1FTBW2CM8NKA39114', own: 'Rented', status: 'In service', days: 31, lease: 864, ins: 326, wk: [285, 318, 312, 308, 307], oop: 245 },
  { id: 'v109', name: 'Van 109', vin: '1FTBW2CM3NKA40118', own: 'Rented', status: 'In service', days: 31, lease: 864, ins: 326, wk: [300, 330, 325, 320, 315], oop: 120 },
  { id: 'v112', name: 'Van 112', vin: '1FTBW3XM6PKA55231', own: 'Owned', status: 'In service', days: 29, lease: null, ins: 326, wk: [290, 320, 318, 310, 302], oop: 410 },
  { id: 'v114', name: 'Van 114', vin: '1FTBW2CM6NKA45872', own: 'Rented', status: 'In shop', days: 9, lease: null, ins: 326, wk: [220, 245, 240, 238, 237], oop: 1410 },
  { id: 'v117', name: 'Van 117', vin: '3C6TRVAG5RE118427', own: 'Rented', status: 'In service', days: 31, lease: 864, ins: 326, wk: [280, 315, 310, 305, 300], oop: 95 },
  { id: 'v121', name: 'Van 121', vin: '4UZAANFA8SFC24817', own: 'Rented', status: 'In service', days: 31, lease: 864, ins: 326, wk: [265, 295, 290, 286, 284], oop: 180, restated: true },
  { id: 'v124', name: 'Van 124', vin: '1FTBW2CM9PKB60112', own: 'Rented', status: 'In service', days: 26, lease: 864, ins: 326, wk: [275, 305, 300, 295, 290], oop: 640 },
  { id: 'v128', name: 'Van 128', vin: '1FTBW3XM2PKA61944', own: 'Rented', status: 'In service', days: 31, lease: 864, ins: null, wk: [270, 300, 296, 292, 288], oop: 80 },
  { id: 'v131', name: 'Van 131', vin: '3C6TRVAG7ME529431', own: 'Rented', status: 'Grounded', days: 22, lease: 864, ins: 326, wk: [268, 298, 294, 290, 286], oop: 210 },
  { id: 'v118', name: 'Van 118', vin: '3C6TRVAG2ME517766', own: 'Rented', status: 'Off fleet', off: 'Jul 6, 2026', offM: 6, days: 6, lease: 432, ins: 163, wk: [420, 360, null, null, null], oop: 0 },
  { id: 'v097', name: 'Van 097', vin: '1FTBW2CM0MKA22417', own: 'Rented', status: 'Off fleet', off: 'Feb 28, 2026', offM: 1, days: 0, lease: null, ins: null, wk: [null, null, null, null, null], oop: 0 },
]

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface Week {
  id: string
  label: string
  peak: number
  paid: number
  /** A week that has closed asks for a reason before it can be restated. */
  ended: boolean
}

/**
 * The weeks in a month. July is the live month and has real week numbers; every
 * other month is four synthetic weeks, generated the same way each time.
 */
export function weeks(m = 6): Week[] {
  if (m === 6) {
    return [
      { id: 'wk27', label: 'Wk 27 · Jun 28-Jul 4', peak: 46, paid: 46, ended: true },
      { id: 'wk28', label: 'Wk 28 · Jul 5-11', peak: 44, paid: 44, ended: true },
      { id: 'wk29', label: 'Wk 29 · Jul 12-18', peak: 46, paid: 46, ended: true },
      { id: 'wk30', label: 'Wk 30 · Jul 19-25', peak: 42, paid: 42, ended: true },
      { id: 'wk31', label: 'Wk 31 · Jul 26-Aug 1', peak: 45, paid: 45, ended: false },
    ]
  }
  const mn = MONTHS[m]
  const ended = m < 6
  return [1, 2, 3, 4].map((i) => ({
    id: `m${m}w${i}`,
    label: `${mn} · Wk ${i}`,
    peak: ended ? 42 + ((m + i) % 5) : 0,
    paid: ended ? 42 + ((m + i) % 5) : 0,
    ended,
  }))
}

/** Charges that belong to the fleet rather than to any one van. */
export const UNALLOC = { lease: 440, ins: 104, wk: [300, 340, 335, 320, 300] }

export type Cells = Record<string, number>

/**
 * Build the cell map: `tab|vehicleId|column`.
 *
 * Two holes are deliberate — Van 114 has no July lease and Van 128 no July
 * insurance — because an incomplete row is what the page is for. Earlier months
 * use the full monthly rate; the off-fleet van's part-month figures only apply
 * to the month it left.
 */
export function seedCells(): Cells {
  const c: Cells = {}
  VEHICLES.forEach((v) => {
    for (let m = 0; m < 12; m++) {
      const past = m <= 6
      const live = v.offM === undefined || m <= v.offM
      if (!past || !live) continue
      if (v.lease !== null && !(v.id === 'v114' && m === 6)) {
        c[`lease|${v.id}|${m}`] = m === 6 ? v.lease : v.lease === 432 ? 864 : v.lease
      }
      if (v.ins !== null && !(v.id === 'v128' && m === 6)) {
        c[`ins|${v.id}|${m}`] = m === 6 ? v.ins : v.ins === 163 ? 326 : v.ins
      }
    }
    weeks().forEach((w, i) => {
      if (v.wk[i] !== null) c[`amz|${v.id}|${w.id}`] = v.wk[i]!
    })
    // Earlier months wobble around the same weekly figures, seeded off the id
    // so the number is the same on every render.
    for (let m = 1; m <= 5; m++) {
      if (v.offM !== undefined && m > v.offM) continue
      const seed = v.id.charCodeAt(3) + v.id.charCodeAt(4)
      weeks(m).forEach((w, i) => {
        const base = v.wk[i % 5]
        if (base === null || base === undefined) return
        c[`amz|${v.id}|${w.id}`] = Math.round((base + Math.sin(seed + m * 2 + i) * 18) * 100) / 100
      })
    }
  })
  for (let m = 0; m < 7; m++) {
    c[`lease|unalloc|${m}`] = UNALLOC.lease
    c[`ins|unalloc|${m}`] = UNALLOC.ins
  }
  weeks().forEach((w, i) => { c[`amz|unalloc|${w.id}`] = UNALLOC.wk[i] })
  for (let m = 1; m <= 5; m++) {
    weeks(m).forEach((w, i) => { c[`amz|unalloc|${w.id}`] = Math.round((UNALLOC.wk[i % 5] + m * 3) * 100) / 100 })
  }
  return c
}

export interface CellEdit {
  when: string
  period: string
  vehicle: string
  change: string
  reason: string
  by: string
}

export const SEED_EDITS: CellEdit[] = [
  { when: 'Aug 12, 09:41', period: 'Jun 2026', vehicle: 'Van 121', change: '$236.40 → $248.90', reason: 'Rate change, endorsement', by: 'K. Ortiz' },
  { when: 'Aug 12, 09:38', period: 'Jul 2026', vehicle: 'Van 107', change: '$214.00 → $226.50', reason: '', by: 'system' },
]

export interface Batch {
  when: string
  file: string
  period: string
  counts: string
  status: string
}

export const SEED_BATCHES: Batch[] = [
  { when: 'Aug 12, 09:38', file: 'insurer-jul-2026.csv', period: 'Jul 2026', counts: '19 written · 2 overwritten · 3 skipped', status: 'Done' },
]

/** Last month's totals, for the tile deltas. */
export const PREV = { amz: 24030, lease: 9930, ins: 4210, oop: 3050, net: 6840 }

/** The NET-by-month series. July's value comes from the live totals. */
export const NET_SERIES: { l: string; v: number | null }[] = [
  { l: 'Feb', v: 2180 },
  { l: 'Mar', v: 3050 },
  { l: 'Apr', v: 2640 },
  { l: 'May', v: -1120 },
  { l: 'Jun', v: 3340 },
  { l: 'Jul', v: null },
]

export const STATUSES: Status[] = ['In service', 'In shop', 'Grounded', 'Off fleet']

export const MONEY_BAND = [
  { label: 'File total', value: '$5,436.00', color: 'var(--text-primary)', bg: 'var(--surface-card)', border: 'var(--border-default)' },
  { label: 'Will write', value: '$4,742.00', color: 'var(--success-fg)', bg: 'var(--surface-card)', border: 'var(--border-default)' },
  { label: 'Will overwrite', value: '$453.00', color: 'var(--warning-fg)', bg: 'var(--surface-card)', border: 'var(--border-default)' },
  { label: 'Will skip', value: '$241.00', color: 'var(--text-secondary)', bg: 'var(--surface-card)', border: 'var(--border-default)' },
  { label: 'Column total after run', value: '$5,947.10', color: 'var(--text-primary)', bg: 'var(--surface-subtle)', border: 'var(--border-strong)' },
]

export const RUN_RESULT = [
  'Written $4,742.00 across 19 cells',
  'Overwritten $453.00 across 2 cells',
  'Skipped $241.00 across 3 rows',
]

export const UNIT_HEAD: [string, string, 'flex-start' | 'flex-end'][] = [
  ['name', 'Vehicle · VIN', 'flex-start'],
  ['status', 'Status', 'flex-start'],
  ['days', 'Days', 'flex-end'],
  ['amazon', 'Amazon in', 'flex-end'],
  ['lease', 'Lease', 'flex-end'],
  ['ins', 'Insurance', 'flex-end'],
  ['oop', 'Service OOP', 'flex-end'],
  ['net', 'NET', 'flex-end'],
  ['margin', 'Margin %', 'flex-end'],
  ['spark', '12-mo NET', 'flex-end'],
]

export const UNIT_COLS = '2fr 1.1fr .7fr 1fr 1fr 1fr 1fr 1fr .9fr 1.1fr'

export const TABS: [string, string][] = [
  ['dash', 'Dashboard'],
  ['ins', 'Insurance'],
  ['lease', 'Lease'],
  ['amz', 'Amazon Payments'],
]
