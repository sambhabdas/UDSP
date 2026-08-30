// Invoice Validation — one Amazon invoice per week, checked against the work
// summary the station already confirmed.
//
// The seed covers weeks 20-33 of 2026 with "today" pinned to Aug 11, so W33 is
// still running and everything up to W32 is elapsed and expects an invoice.

import type { Day } from './date'
import { weekStart } from './date'

export type InvoiceStatus = 'pending' | 'validated' | 'dispute'

export interface HistoryEntry {
  when: string
  who: string
  action: string
  detail: string
}

export interface Invoice {
  status: InvoiceStatus
  uploaded: boolean
  /** The week was told not to expect an invoice at all. */
  na?: boolean
  /** Set when the work summary changed after the decision was recorded. */
  flagged?: boolean
  flagDays?: string
  disputedOn?: Day | null
  decidedBy?: string
  decidedOn?: Day | null
  caseRef?: string
  notes?: string
  recovered?: number | null
  /** Amazon reissued the invoice to settle a dispute. */
  adjusted?: boolean
  source?: 'pdf' | 'manual'
  history: HistoryEntry[]
}

/** The date the whole page is pinned to. */
export const TODAY: Day = { y: 2026, m: 7, d: 11 }
export const WHO = 'Kai Sato'
export const STATION = 'DBK4'

/** The stamp every action recorded in this session carries. */
export const NOW_STAMP = 'Aug 11 · 16:20'

export const FIRST_WEEK = 20
export const LAST_WEEK = 33

const h = (when: string, who: string, action: string, detail = ''): HistoryEntry => ({ when, who, action, detail })

export function seedInvoices(): Record<number, Invoice> {
  const inv: Record<number, Invoice> = {}
  // Weeks 20-25 are all long settled; the rest are spelled out below.
  for (let n = FIRST_WEEK; n <= 25; n++) {
    const who = n % 2 ? 'Kai Sato' : 'M. Chen'
    const on = weekStart(2026, n + 1)
    inv[n] = {
      status: 'validated',
      uploaded: true,
      decidedBy: who,
      decidedOn: on,
      history: [h(`${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][on.m]} ${on.d} · 09:00`, who, 'Validated', 'All lines matched')],
    }
  }
  inv[26] = {
    status: 'pending',
    uploaded: false,
    na: true,
    history: [h('Jul 6 · 08:15', 'Kai Sato', 'Marked N/A', 'No invoice expected for this week')],
  }
  inv[27] = {
    status: 'validated',
    uploaded: true,
    decidedBy: 'M. Chen',
    decidedOn: { y: 2026, m: 6, d: 16 },
    recovered: 380,
    caseRef: 'AMZ-DSP-4471',
    history: [
      h('Jul 9 · 11:14', 'M. Chen', 'Disputed', '2 discrepancies · $412.00 at stake'),
      h('Jul 16 · 16:03', 'M. Chen', 'Marked resolved', '$380.00 recovered'),
    ],
  }
  inv[28] = {
    status: 'dispute',
    uploaded: true,
    disputedOn: { y: 2026, m: 6, d: 21 },
    decidedBy: 'M. Chen',
    caseRef: 'AMZ-DSP-4902',
    notes: '',
    history: [h('Jul 21 · 10:02', 'M. Chen', 'Disputed', '1 discrepancy · $420.00 at stake')],
  }
  inv[29] = {
    status: 'validated',
    uploaded: true,
    decidedBy: 'Kai Sato',
    decidedOn: { y: 2026, m: 6, d: 22 },
    flagged: true,
    flagDays: 'Jul 15 and Jul 17',
    history: [
      h('Jul 22 · 09:05', 'Kai Sato', 'Validated', 'All lines matched'),
      h('Aug 6 · 14:20', 'System', 'Flagged', 'Work summary edited for Jul 15 and Jul 17'),
    ],
  }
  inv[30] = {
    status: 'validated',
    uploaded: true,
    decidedBy: 'Kai Sato',
    decidedOn: { y: 2026, m: 6, d: 29 },
    history: [
      h('Jul 29 · 08:40', 'Kai Sato', 'Uploaded', 'Invoice_W30_2026.pdf'),
      h('Jul 29 · 08:52', 'Kai Sato', 'Validated', 'All lines matched'),
    ],
  }
  inv[31] = {
    status: 'dispute',
    uploaded: true,
    disputedOn: { y: 2026, m: 7, d: 4 },
    decidedBy: 'A. Owner',
    caseRef: 'AMZ-DSP-5120',
    notes: '',
    history: [
      h('Aug 4 · 09:12', 'A. Owner', 'Uploaded', 'Invoice_W31_2026.pdf'),
      h('Aug 4 · 09:31', 'A. Owner', 'Disputed', '3 discrepancies · $2,224.80 at stake'),
    ],
  }
  inv[32] = { status: 'pending', uploaded: false, history: [] }
  inv[33] = { status: 'pending', uploaded: false, history: [] }
  return inv
}

// ── The billed vs actual figures ────────────────────────────────────────────

export interface SubRow {
  name: string
  /** Blocks the invoice charged for. */
  billedQty: number
  /** What the invoice charged per block. */
  unit: number
  /** The rate on file. Null means the line has no Amazon service type name. */
  rate: number | null
  /** Blocks the work summary says actually ran. */
  actual: number
  unmapped?: boolean
}

export interface WeekData {
  subrows: SubRow[]
  rescues: { billed: number; unit: number; actual: number; notMarked: number }
  sessions: { billed: number; unit: number; actual: number }
  income: { billed: number; actual: number }
  packages: { billed: number; unit: number; rate: number; actual: number }
  dspPaid: number
  days: { matched: number; pending: number }
}

/** Three weeks carry the interesting cases; the rest are generated clean. */
export function weekData(n: number): WeekData {
  if (n === 32) {
    return {
      subrows: [
        { name: 'Step Van · 9 hours', billedQty: 130, unit: 349.2, rate: 349.2, actual: 130 },
        { name: 'XL Van · 10 hours', billedQty: 54, unit: 384.0, rate: 384.0, actual: 56 },
        { name: 'Large Van · 9 hours', billedQty: 31, unit: 339.2, rate: 349.2, actual: 31 },
        { name: 'Amazon-paid manual types', billedQty: 7, unit: 150.0, rate: null, actual: 7, unmapped: true },
      ],
      rescues: { billed: 4, unit: 95, actual: 6, notMarked: 2 },
      sessions: { billed: 4, unit: 280, actual: 4 },
      income: { billed: 1120, actual: 1120 },
      packages: { billed: 41208, unit: 0.2, rate: 0.2, actual: 41208 },
      dspPaid: 1,
      days: { matched: 5, pending: 2 },
    }
  }
  if (n === 31) {
    return {
      subrows: [
        { name: 'Step Van · 9 hours', billedQty: 128, unit: 349.2, rate: 349.2, actual: 128 },
        { name: 'XL Van · 10 hours', billedQty: 61, unit: 376.0, rate: 384.0, actual: 61 },
        { name: 'Large Van · 9 hours', billedQty: 29, unit: 339.2, rate: 339.2, actual: 33 },
        { name: 'Amazon-paid manual types', billedQty: 6, unit: 150.0, rate: null, actual: 6, unmapped: true },
      ],
      rescues: { billed: 5, unit: 95, actual: 9, notMarked: 0 },
      sessions: { billed: 3, unit: 280, actual: 3 },
      income: { billed: 840, actual: 840 },
      packages: { billed: 39880, unit: 0.2, rate: 0.2, actual: 39880 },
      dspPaid: 0,
      days: { matched: 7, pending: 0 },
    }
  }
  if (n === 28) {
    return {
      subrows: [
        { name: 'Step Van · 9 hours', billedQty: 124, unit: 349.2, rate: 349.2, actual: 124 },
        { name: 'XL Van · 10 hours', billedQty: 57, unit: 384.0, rate: 384.0, actual: 57 },
        { name: 'Large Van · 9 hours', billedQty: 28, unit: 334.2, rate: 349.2, actual: 28 },
        { name: 'Amazon-paid manual types', billedQty: 5, unit: 150.0, rate: null, actual: 5, unmapped: true },
      ],
      rescues: { billed: 6, unit: 95, actual: 6, notMarked: 0 },
      sessions: { billed: 3, unit: 280, actual: 3 },
      income: { billed: 840, actual: 840 },
      packages: { billed: 39104, unit: 0.2, rate: 0.2, actual: 39104 },
      dspPaid: 0,
      days: { matched: 7, pending: 0 },
    }
  }
  // A settled week: billed equals actual on every line, jittered off the week
  // number so the weeks are not identical.
  const j = (k: number): number => (n * k) % 5
  const sessions = 2 + j(17)
  const pkgs = 38000 + ((n * 137) % 4000)
  return {
    subrows: [
      { name: 'Step Van · 9 hours', billedQty: 120 + j(3), unit: 349.2, rate: 349.2, actual: 120 + j(3) },
      { name: 'XL Van · 10 hours', billedQty: 55 + j(2), unit: 384.0, rate: 384.0, actual: 55 + j(2) },
      { name: 'Large Van · 9 hours', billedQty: 28 + j(7), unit: 349.2, rate: 349.2, actual: 28 + j(7) },
      { name: 'Amazon-paid manual types', billedQty: 4 + j(11), unit: 150.0, rate: null, actual: 4 + j(11), unmapped: true },
    ],
    rescues: { billed: 5 + j(13), unit: 95, actual: 5 + j(13), notMarked: 0 },
    sessions: { billed: sessions, unit: 280, actual: sessions },
    income: { billed: sessions * 280, actual: sessions * 280 },
    packages: { billed: pkgs, unit: 0.2, rate: 0.2, actual: pkgs },
    dspPaid: 0,
    days: { matched: 7, pending: 0 },
  }
}

export const STATUS_FILTERS = ['All', 'Pending', 'Validated', 'Under dispute', 'N/A']
