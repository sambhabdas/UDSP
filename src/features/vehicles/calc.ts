// The arithmetic behind the vehicle list: how a status reads, how far off a
// renewal is, and whether a ranked DA is actually allowed to drive the van.

import { DAS, TODAY, TYPES } from './data'
import type { OdoReading, Renewal, Reminder, Status, Vehicle, VehicleType } from './data'
import { int } from '../../ds/format'

const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmt(d: Date): string {
  return `${MONS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** Whole days from today. Negative is in the past. */
export function days(d: Date): number {
  return Math.round((d.getTime() - TODAY.getTime()) / 86400000)
}

/** The year is dropped from labels in the current year - it is understood. */
export const short = (s: string): string => s.replace(', 2026', '')

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-'
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface Tone {
  bg: string
  fg: string
  dot: string
}

export function tone(s: string): Tone {
  if (s === 'In service') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (s === 'In shop') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  if (s === 'Grounded') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

export type Urgency = 'red' | 'amber' | 'green' | 'LAPSED' | 'overdue'

export function uTone(u: Urgency): Tone {
  if (u === 'red' || u === 'LAPSED' || u === 'overdue') {
    return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  }
  if (u === 'amber') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
}

export function typeOf(v: Vehicle, types: VehicleType[] = TYPES): VehicleType {
  return types.find((t) => t.name === v.type) ?? { name: v.type, dot: false, suits: '', use: '' }
}

export function latestOdo(odo: OdoReading[], vid: string): OdoReading | null {
  const rows = odo.filter((o) => o.vid === vid).sort((a, b) => b.d.getTime() - a.d.getTime())
  return rows[0] ?? null
}

/**
 * How close a renewal is. A lease is measured to its notice date rather than
 * its expiry, because missing notice is the thing that costs money - but it is
 * only LAPSED once the expiry itself has passed.
 */
export function renewalStatus(n: Renewal): { label: string; u: Urgency; dd: number } {
  const basis = n.nd && n.nd < n.ed ? n.nd : n.ed
  const dd = days(basis)
  if (days(n.ed) < 0) return { label: 'LAPSED', u: 'LAPSED', dd }
  if (dd <= 7) return { label: `${dd} d`, u: 'red', dd }
  if (dd <= 30) return { label: `${dd} d`, u: 'amber', dd }
  return { label: `${dd} d`, u: 'green', dd }
}

export interface Cell {
  txt: string
  color: string
}

/**
 * The most pressing thing due on a vehicle. Overdue outranks a mileage
 * reminder with no reading to measure against, which outranks everything else.
 */
export function nextMaint(v: Vehicle, reminders: Reminder[], odo: OdoReading[]): Cell {
  if (v.status === 'Off fleet') return { txt: '-', color: 'var(--text-disabled)' }
  const rs = reminders.filter((r) => r.vid === v.id && !r.done)
  if (!rs.length) return { txt: 'No PM', color: 'var(--text-disabled)' }
  const latest = latestOdo(odo, v.id)
  let best: (Cell & { k: number }) | null = null
  rs.forEach((r) => {
    let item: Cell & { k: number }
    if (r.dueType === 'Mileage') {
      if (!latest) {
        item = { txt: `${r.name} needs a reading`, color: 'var(--warning-fg)', k: 1 }
      } else {
        const away = r.dueMi! - latest.reading
        item = {
          txt: away <= 0 ? `${r.name} overdue` : `${r.name} in ${int(away)} mi`,
          color: away <= 0 ? 'var(--danger-fg)' : away <= 500 ? 'var(--warning-fg)' : 'var(--text-primary)',
          k: away <= 0 ? 0 : 2,
        }
      }
    } else {
      const dd = days(r.dd!)
      item = {
        txt: dd < 0 ? `${r.name} overdue` : `${r.name} · ${short(fmt(r.dd!))}`,
        color: dd < 0 || dd <= 7 ? 'var(--danger-fg)' : dd <= 30 ? 'var(--warning-fg)' : 'var(--text-primary)',
        k: dd < 0 ? 0 : 2,
      }
    }
    if (!best || item.k < best.k) best = item
  })
  return best!
}

/** The soonest renewal, with a count of the rest. */
export function expiring(v: Vehicle, renewals: Renewal[]): Cell {
  if (v.status === 'Off fleet') return { txt: '-', color: 'var(--text-disabled)' }
  const ns = renewals.filter((n) => n.vid === v.id)
  if (!ns.length) return { txt: '-', color: 'var(--text-disabled)' }
  const sorted = ns.map((n) => ({ n, st: renewalStatus(n) })).sort((a, b) => a.st.dd - b.st.dd)
  const top = sorted[0]
  const more = ns.length - 1
  const label = `${top.n.type} · ${top.st.u === 'LAPSED' ? 'LAPSED' : short(fmt(top.n.ed))}`
  return {
    txt: label + (more > 0 ? ` (+${more})` : ''),
    color:
      top.st.u === 'LAPSED' || top.st.u === 'red'
        ? 'var(--danger-fg)'
        : top.st.u === 'amber' ? 'var(--warning-fg)' : 'var(--text-primary)',
  }
}

/**
 * Whether a ranked DA can actually take this van: still employed, carded for
 * its type, and DOT-carded if the type demands it.
 */
export function eligible(daId: string, v: Vehicle, types: VehicleType[] = TYPES): { ok: boolean; why?: string } {
  const da = DAS.find((d) => d.id === daId)
  if (!da) return { ok: false, why: 'removed' }
  if (!da.active) return { ok: false, why: 'Deactivated' }
  if (!da.types.includes(v.type)) return { ok: false, why: `Not allowed: ${v.type}` }
  if (typeOf(v, types).dot && !da.dot) return { ok: false, why: 'Needs DOT' }
  return { ok: true }
}

export function prioSummary(v: Vehicle, prio: Record<string, string[]>, types: VehicleType[] = TYPES): Cell {
  if (v.status === 'Off fleet') return { txt: '-', color: 'var(--text-disabled)' }
  const list = prio[v.id] ?? []
  if (!list.length) return { txt: '-', color: 'var(--text-disabled)' }
  const warn = list.filter((id) => !eligible(id, v, types).ok).length
  return warn
    ? { txt: `${list.length} Ranked · ${warn} Ineligible`, color: 'var(--warning-fg)' }
    : { txt: `${list.length} Ranked`, color: 'var(--text-primary)' }
}

export function categoryTone(cat: string): Tone {
  if (cat === 'Repair') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  if (cat === 'Preventive') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (cat === 'Bodywork') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--blue-100)', fg: 'var(--blue-700)', dot: 'var(--blue-500)' }
}

/** A stable sort, so rows that tie keep the order they were seeded in. */
export function sortBy<T>(rows: T[], dir: 'asc' | 'desc', val: (r: T) => string | number): T[] {
  const mul = dir === 'asc' ? 1 : -1
  return rows.slice().sort((a, b) => {
    const x = val(a)
    const y = val(b)
    return (x > y ? 1 : x < y ? -1 : 0) * mul
  })
}

export type { Status }
