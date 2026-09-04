import type { Invoice, SubRow, WeekData } from './data'
import { weekData } from './data'
import { num as fmtNum } from './fmt'
import { money } from './fmt'

/** One service-type line with its two independent gaps. */
export interface SubComparison {
  s: SubRow & { rate: number | null }
  /** Blocks billed minus blocks run. */
  countGap: number
  countMoney: number
  /** What was charged per block minus the rate on file. */
  rateGap: number
  rateMoney: number
  mismatch: boolean
}

export interface Comparison {
  d: WeekData
  sub: SubComparison[]
  routesBilled: number
  routesActual: number
  rescueGap: number
  pkgGap: number
  pkgRateGap: number
  /** What the work summary says the week is worth. */
  derived: number
  atStake: number
  count: number
  claims: string[]
  totalGap: number
}

export const billedTotal = (d: WeekData): number =>
  d.subrows.reduce((s, r) => s + r.billedQty * r.unit, 0) +
  d.rescues.billed * d.rescues.unit +
  d.sessions.billed * d.sessions.unit +
  d.packages.billed * d.packages.unit

/**
 * The figures a week is checked against.
 *
 * An adjusted invoice is Amazon's own reissue after a settled dispute: it bills
 * exactly what the work summary said, at the rate on file, so the comparison
 * comes out clean and the week goes back to pending for a fresh decision.
 */
export function dataOf(n: number, inv: Invoice | undefined): WeekData {
  const base = weekData(n)
  if (!inv?.adjusted) return base
  return {
    subrows: base.subrows.map((s) => ({ ...s, billedQty: s.actual, unit: s.rate ?? s.unit })),
    rescues: { ...base.rescues, billed: base.rescues.actual },
    sessions: { ...base.sessions, billed: base.sessions.actual },
    income: { ...base.income, billed: base.income.actual },
    packages: { ...base.packages, billed: base.packages.actual, unit: base.packages.rate },
    dspPaid: base.dspPaid,
    days: base.days,
  }
}

/**
 * The whole check, in one pass.
 *
 * Each service type can be wrong two ways at once - the wrong number of blocks
 * AND the wrong price per block - and both count as separate discrepancies,
 * because they are separate claims with separate arithmetic behind them.
 */
export function compare(n: number, inv: Invoice | undefined, rates: Record<string, number>): Comparison {
  const d = dataOf(n, inv)
  const sub: SubComparison[] = d.subrows.map((sr) => {
    const rate = rates[sr.name] ?? sr.rate
    const s = { ...sr, rate }
    const countGap = s.billedQty - s.actual
    const countMoney = Math.abs(countGap) * s.unit
    const rateGap = s.rate != null ? s.unit - s.rate : 0
    const rateMoney = Math.abs(rateGap) * s.billedQty
    return { s, countGap, countMoney, rateGap, rateMoney, mismatch: countGap !== 0 || rateGap !== 0 }
  })

  const routesBilled = d.subrows.reduce((a, r) => a + r.billedQty, 0)
  const routesActual = d.subrows.reduce((a, r) => a + r.actual, 0)
  const rescueGap = d.rescues.billed - d.rescues.actual
  const pkgGap = d.packages.billed - d.packages.actual
  const pkgRateGap = d.packages.unit - d.packages.rate
  const derived =
    d.subrows.reduce((a, r) => a + r.actual * r.unit, 0) +
    d.rescues.actual * d.rescues.unit +
    d.sessions.actual * d.sessions.unit +
    d.packages.actual * d.packages.unit

  let atStake = 0
  let count = 0
  const claims: string[] = []
  sub.forEach((x) => {
    if (x.countGap !== 0) {
      atStake += x.countMoney
      count += 1
      claims.push(
        `${x.s.name} - billed ${fmtNum(x.s.billedQty)} blocks, ${fmtNum(x.s.actual)} ran. ` +
          `${fmtNum(Math.abs(x.countGap))} blocks at ${money(x.s.unit)} = ${money(x.countMoney)}.`,
      )
    }
    if (x.rateGap !== 0) {
      atStake += x.rateMoney
      count += 1
      claims.push(
        `${x.s.name} - billed ${money(x.s.unit)} per block, rate in force ${money(x.s.rate as number)}. ` +
          `${fmtNum(x.s.billedQty)} blocks at ${money(Math.abs(x.rateGap))} = ${money(x.rateMoney)}.`,
      )
    }
  })
  if (rescueGap !== 0) {
    atStake += Math.abs(rescueGap) * d.rescues.unit
    count += 1
    claims.push(
      `Rescues - billed ${d.rescues.billed}, ${d.rescues.actual} marked paid. ` +
        `${Math.abs(rescueGap)} at ${money(d.rescues.unit)} = ${money(Math.abs(rescueGap) * d.rescues.unit)}.`,
    )
  }
  if (pkgGap !== 0 || pkgRateGap !== 0) {
    const m = Math.abs(pkgGap) * d.packages.unit + Math.abs(pkgRateGap) * d.packages.billed
    atStake += m
    count += 1
    claims.push(`Packages - billed ${fmtNum(d.packages.billed)}, delivered ${fmtNum(d.packages.actual)}. ${money(m)}.`)
  }

  return {
    d, sub, routesBilled, routesActual, rescueGap, pkgGap, pkgRateGap,
    derived, atStake, count, claims,
    totalGap: billedTotal(d) - derived,
  }
}

export const statusName = (i: Invoice): string =>
  i.na ? 'N/A' : i.status === 'validated' ? 'Validated' : i.status === 'dispute' ? 'Under dispute' : 'Pending'

export interface Tone {
  bg: string
  border: string
  fg: string
  dot: string
}

export function statusTone(i: Invoice): Tone {
  if (i.na) return { bg: 'var(--surface-subtle)', border: 'var(--border-default)', fg: 'var(--text-helper)', dot: 'var(--neutral-400)' }
  if (i.status === 'validated') return { bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (i.status === 'dispute') return { bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  return { bg: 'var(--surface-subtle)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

/** A week has an invoice once one is uploaded, or once it carries a decision. */
export const hasInvoice = (i: Invoice | undefined): boolean => !!i && (i.uploaded || i.status !== 'pending')
