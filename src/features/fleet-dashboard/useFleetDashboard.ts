'use client'

import { useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import {
  IDLE,
  LEMONS,
  MONTHS,
  QUEUE,
  UTIL,
  WEEK_29,
  WEEK_LAST,
  WEEK_THIS,
  median,
  money,
} from './data'
import type { IdleSeed, Lemon, Month, QueueRow } from './data'

export interface SortState<K extends string> {
  k: K
  d: 'asc' | 'desc'
}

export type IdleSortKey = 'van' | 'status' | 'last' | 'idle'
export type LemonSortKey = 'van' | 'oop' | 'x' | 'gross' | 'top'
export type QueueSortKey = 'sev' | 'kind' | 'van'

export interface IdleRow {
  van: string
  status: string
  lastRan: string
  lastD: number
  idle: string
  days: number
  idleColor: string
}

/** What the spend section is scoped to: one bucket, or the whole year. */
interface Scope {
  months: Pick<Month, 'oop' | 'segs' | 'vans'>[]
  prev: Pick<Month, 'oop' | 'segs' | 'vans'>[] | null
  prevLabel: string | null
}

const gross = (m: Pick<Month, 'oop' | 'segs'>): number =>
  m.oop + Object.values(m.segs).reduce((a, v) => a + v, 0)

const sumGross = (arr: Pick<Month, 'oop' | 'segs'>[]): number => arr.reduce((a, m) => a + gross(m), 0)
const sumOop = (arr: Pick<Month, 'oop'>[]): number => arr.reduce((a, m) => a + m.oop, 0)

/** Percent change, or nothing when there is no prior period to compare to. */
const delta = (cur: number, prev: number | null): number | null =>
  prev === null || prev === 0 ? null : Math.round(((cur - prev) / prev) * 100)

export function useFleetDashboard() {
  const [period, setPeriod] = useState('This Month')
  const [periodOpen, setPeriodOpen] = useState(false)
  const [spendPeriod, setSpendPeriod] = useState<string | null>(null)
  const [spendPeriodOpen, setSpendPeriodOpen] = useState(false)

  const [hoverBar, setHoverBar] = useState<number | null>(null)
  const [hoverUtil, setHoverUtil] = useState<number | null>(null)

  const [idleSort, setIdleSort] = useState<SortState<IdleSortKey>>({ k: 'idle', d: 'desc' })
  const [lemonSort, setLemonSort] = useState<SortState<LemonSortKey>>({ k: 'oop', d: 'desc' })
  const [qSort, setQSort] = useState<SortState<QueueSortKey>>({ k: 'sev', d: 'asc' })

  const [idleQ, setIdleQ] = useState('')
  const [lemonQ, setLemonQ] = useState('')
  const [qQ, setQQ] = useState('')
  const [qKind, setQKind] = useState('All')

  const { toast, toastMsg } = useToast(2400)

  const closeMenus = () => {
    if (periodOpen || spendPeriodOpen) {
      setPeriodOpen(false)
      setSpendPeriodOpen(false)
    }
  }

  // ---- utilization ---------------------------------------------------------

  /**
   * The month a period names. "This Month" is July; a named month like
   * "Mar 2026" is its first word. Periods with their own data — the two weeks
   * and the year — are looked up whole first.
   */
  const mKey =
    period === 'This Month' ? 'Jul' : period === 'Last Month' ? 'Jun' : period.split(' ')[0]

  const uScope = UTIL[period] ?? UTIL[mKey] ?? UTIL.Jul
  const uAvg = Math.round(uScope.bars.reduce((a, b) => a + b[1], 0) / uScope.bars.length)

  // ---- idle vans -----------------------------------------------------------

  const idleRows = useMemo(() => {
    const seed: IdleSeed[] = IDLE[period] ?? IDLE[mKey] ?? []
    const data: IdleRow[] = seed.map((r) => ({
      van: r[0], status: 'In service', lastRan: r[1], lastD: r[2], idle: r[3], days: r[4], idleColor: r[5],
    }))
    const needle = idleQ.trim().toLowerCase()
    const filtered = data.filter(
      (r) => !needle || `${r.van} ${r.status} ${r.lastRan}`.toLowerCase().includes(needle),
    )
    const val = (r: IdleRow, k: IdleSortKey): string | number =>
      ({ van: r.van, status: r.status, last: r.lastD, idle: r.days })[k]
    return sortBy(filtered, idleSort, val)
  }, [period, mKey, idleQ, idleSort])

  // ---- spend ---------------------------------------------------------------

  /** The spend picker overrides the page period until the page period changes. */
  const scopeKey = spendPeriod ?? period

  const scope: Scope = useMemo(() => {
    if (scopeKey === 'This Week') return { months: [WEEK_THIS], prev: [WEEK_LAST], prevLabel: 'Wk 30' }
    if (scopeKey === 'Last Week') return { months: [WEEK_LAST], prev: [WEEK_29], prevLabel: 'Wk 29' }
    if (scopeKey === 'This Month') return { months: [MONTHS[5]], prev: [MONTHS[4]], prevLabel: 'Jun' }
    if (scopeKey === 'Last Month') return { months: [MONTHS[4]], prev: [MONTHS[3]], prevLabel: 'May' }
    if (scopeKey === 'This Year') return { months: MONTHS, prev: null, prevLabel: null }
    const i = MONTHS.map((m) => `${m.key} 2026`).indexOf(scopeKey)
    return {
      months: [MONTHS[Math.max(0, i)]],
      prev: i > 0 ? [MONTHS[i - 1]] : null,
      prevLabel: i > 0 ? MONTHS[i - 1].key : null,
    }
  }, [scopeKey])

  const curGross = sumGross(scope.months)
  const curOop = sumOop(scope.months)
  const curRe = curGross - curOop
  const dG = scope.prev ? delta(curGross, sumGross(scope.prev)) : null
  const dO = scope.prev ? delta(curOop, sumOop(scope.prev)) : null

  const badge = (d: number | null): string =>
    d === null || scope.prevLabel === null ? '' : `${d >= 0 ? '+' : '-'}${Math.abs(d)}% vs ${scope.prevLabel}`

  /** Spend per van across the scope, for the median tile. */
  const vansMap: Record<string, number> = {}
  scope.months.forEach((m) => {
    Object.entries(m.vans).forEach(([k, v]) => { vansMap[k] = (vansMap[k] ?? 0) + v })
  })
  const med = median(Object.values(vansMap))

  // The trend chart is always the six months, whatever the spend scope is; the
  // axis is rounded up to a whole $2,000 so the gridline lands on a round number.
  const maxG = Math.max(...MONTHS.map(gross))
  const axisMax = Math.ceil(maxG / 2000) * 2000

  // ---- lemon watch ---------------------------------------------------------

  const lemonRows = useMemo(() => {
    const needle = lemonQ.trim().toLowerCase()
    const filtered = LEMONS.filter((r) => !needle || `${r.van} ${r.top}`.toLowerCase().includes(needle))
    return sortBy(filtered, lemonSort, (r: Lemon, k: LemonSortKey) => r[k])
  }, [lemonQ, lemonSort])

  // ---- needs attention -----------------------------------------------------

  const queueRows = useMemo(() => {
    const needle = qQ.trim().toLowerCase()
    const filtered = QUEUE.filter(
      (r) =>
        (qKind === 'All' || r.kind === qKind) &&
        (!needle || `${r.van} ${r.fact} ${r.kind} ${r.link}`.toLowerCase().includes(needle)),
    )
    const val = (r: QueueRow, k: QueueSortKey): string | number =>
      k === 'sev' ? ({ Red: 0, Orange: 1, Gray: 2 })[r.sev] : k === 'kind' ? r.kind : r.van
    return sortBy(filtered, qSort, val)
  }, [qQ, qKind, qSort])

  return {
    period, setPeriod, periodOpen, setPeriodOpen,
    spendPeriod, setSpendPeriod, spendPeriodOpen, setSpendPeriodOpen, scopeKey,
    closeMenus,
    hoverBar, setHoverBar, hoverUtil, setHoverUtil,
    idleSort, setIdleSort, lemonSort, setLemonSort, qSort, setQSort,
    idleQ, setIdleQ, lemonQ, setLemonQ, qQ, setQQ, qKind, setQKind,
    toast, toastMsg,
    uScope, uAvg, idleRows,
    curGross, curOop, curRe, dG, dO, badge, med,
    axisMax, axisMaxLabel: money(axisMax), axisMidLabel: money(axisMax / 2),
    lemonRows, queueRows,
  }
}

/** A stable sort, so rows that tie keep the order they were seeded in. */
function sortBy<T, K extends string>(
  rows: T[],
  s: SortState<K>,
  val: (r: T, k: K) => string | number,
): T[] {
  const dir = s.d === 'asc' ? 1 : -1
  return rows.slice().sort((a, b) => {
    const x = val(a, s.k)
    const y = val(b, s.k)
    return (x > y ? 1 : x < y ? -1 : 0) * dir
  })
}

export type FleetDashboardState = ReturnType<typeof useFleetDashboard>
