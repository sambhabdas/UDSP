// The arithmetic behind every chart on the page.
//
// Kept apart from the views so each figure can be checked on its own: a bar
// height, an axis maximum and a footer total are all just numbers here.

import {
  BONUS_ROWS, DED_SEGS, DED_STACKS, ROSTER, SOURCE_ROWS, TIER_FILLS, WK8,
  type Tier, type WindowData, signed, tierOf, winScale,
} from './data'

/** A point on a line chart: where the dot sits and what it says. */
export interface LineCol {
  label: string
  val: string
  dotY: string
  title: string
}

export interface LineSeries {
  points: string
  cols: LineCol[]
}

/**
 * A line over a 0..max axis — the shape used by the coaching charts, where
 * nothing goes negative and the axis therefore starts at zero.
 */
export function buildLine(values: number[], max: number, fmt: (v: number) => string): LineSeries {
  const points = values
    .map((v, i) => `${((i + 0.5) / values.length * 100).toFixed(2)},${((max - v) / max * 100).toFixed(2)}`)
    .join(' ')
  const cols = values.map((v, i) => ({
    label: i % 2 ? '' : WK8[i],
    val: fmt(v),
    dotY: ((max - v) / max * 100).toFixed(2),
    title: `${WK8[i]} · ${fmt(v)}`,
  }))
  return { points, cols }
}

export interface StackSeg {
  title: string
  h: string
  fill: string
}

export interface StackBar {
  label: string
  barH: string
  hoverLabel: string
  title: string
  segs: StackSeg[]
}

export interface StackSeries {
  bars: StackBar[]
  axMax: number
  legend: { label: string; fill: string }[]
  total: number
}

/** A column of stacked segments per week, scaled to a round axis maximum. */
export function buildStack(rows: number[][], segDefs: [string, string][], sign: string): StackSeries {
  const totals = rows.map((r) => r.reduce((a, b) => a + b, 0))
  const axMax = Math.ceil(Math.max(...totals) / 10) * 10
  const bars = rows.map((r, i) => {
    const g = totals[i]
    return {
      label: WK8[i],
      barH: `${(g / axMax * 100).toFixed(1)}%`,
      hoverLabel: `${sign}${g}`,
      title: `${WK8[i]} · ${sign}${g}`,
      segs: segDefs.map((sd, j) => ({
        title: `${WK8[i]} · ${sd[0]} · ${sign}${r[j]}`,
        h: g ? `${(r[j] / g * 100).toFixed(1)}%` : '0',
        fill: sd[1],
      })),
    }
  })
  return { bars, axMax, legend: segDefs.map((sd) => ({ label: sd[0], fill: sd[1] })), total: totals.reduce((a, b) => a + b, 0) }
}

/** The weekly-deductions chart, which has its own 20-step axis and click targets. */
export function buildDeductions() {
  const totals = DED_STACKS.map((s) => s[1] + s[2] + s[3])
  const axisMax = Math.ceil(Math.max(...totals) / 20) * 20
  const bars = DED_STACKS.map(([label, ...parts], i) => {
    const g = totals[i]
    return {
      label,
      barH: `${(g / axisMax * 100).toFixed(1)}%`,
      hoverLabel: `-${g}`,
      title: `${label} · Deductions -${g}`,
      segs: parts.map((v, j) => ({
        title: `${label} · ${DED_SEGS[j][0]} · -${v}`,
        h: `${(v / g * 100).toFixed(1)}%`,
        fill: DED_SEGS[j][1],
      })),
    }
  })
  return { bars, axisMax, total: totals.reduce((a, b) => a + b, 0) }
}

// ── The trend chart ─────────────────────────────────────────────────────────

/**
 * The fleet-net series for the last 12 weeks is real, recorded data. Every
 * other selection is derived from the measure's own name, so switching to
 * "Seatbelt" always draws the same seatbelt line rather than a new one.
 */
export function trendWeeks(scoreBy: string, fnWindow: string): [string, number][] {
  const n = parseInt(fnWindow, 10)
  if (scoreBy === 'Fleet Net' && n === 12) {
    return [
      ['Wk 21', -64], ['Wk 22', -38], ['Wk 23', -51], ['Wk 24', -12], ['Wk 25', 6], ['Wk 26', -22],
      ['Wk 27', -30], ['Wk 28', -8], ['Wk 29', 14], ['Wk 30', -26], ['Wk 31', -44], ['Wk 32', -18],
    ]
  }
  let h = n
  for (let i = 0; i < scoreBy.length; i++) h += scoreBy.charCodeAt(i)
  const amp = scoreBy === 'Fleet Net' ? 34 : 8 + (h % 4) * 8
  const positive = scoreBy === 'Helping PT'
  const labels: string[] = []
  for (let i = 0; i < n; i++) labels.push(`Wk ${33 - n + i}`)
  return labels.map((label, i) => {
    const m = Math.abs(Math.sin(h + i * 1.7)) * amp
    const v = positive
      ? Math.round(m) + 4
      : Math.sin(h * 0.7 + i) > 0.75 ? Math.round(m * 0.15) : -Math.round(m)
    return [label, v]
  })
}

export interface TrendCol {
  label: string
  val: string
  dotY: string
  title: string
}

export function buildTrend(scoreBy: string, fnWindow: string) {
  const n = parseInt(fnWindow, 10)
  const weeks = trendWeeks(scoreBy, fnWindow)
  const vals = weeks.map((w) => w[1])
  // The axis always straddles zero, so a run of good weeks still reads as
  // "above the line" rather than filling the panel.
  const yMax = Math.max(10, Math.ceil(Math.max(...vals, 0) / 10) * 10)
  const yMin = Math.min(-10, Math.floor(Math.min(...vals, 0) / 10) * 10)
  const range = yMax - yMin
  const zeroPct = yMax / range * 100
  const points = weeks
    .map((w, i) => `${((i + 0.5) / weeks.length * 100).toFixed(2)},${((yMax - w[1]) / range * 100).toFixed(2)}`)
    .join(' ')
  const cols: TrendCol[] = weeks.map((w, i) => ({
    // A 24-week window cannot show every label without them colliding.
    label: i % (n > 16 ? 3 : 2) ? '' : w[0],
    val: signed(w[1]),
    dotY: ((yMax - w[1]) / range * 100).toFixed(2),
    title: `${w[0]} · ${scoreBy} ${signed(w[1])}`,
  }))
  const average = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  return { weeks, points, cols, yMax, yMin, zeroPct, average, showZero: zeroPct >= 12 && zeroPct <= 88 }
}

// ── Categories ──────────────────────────────────────────────────────────────

export function buildCategories(d: WindowData) {
  const maxCat = Math.max(...d.cats.map((c) => Math.max(c[1], c[2])))
  const axisMax = Math.ceil(maxCat / 20) * 20
  const rows = d.cats.map((c) => ({
    label: c[0],
    dedTxt: c[1] ? `-${c[1]}` : '',
    bonTxt: c[2] ? `+${c[2]}` : '',
    // A one-event category still gets a visible sliver rather than nothing.
    dedW: c[1] ? `${Math.max(2, Math.round(c[1] / axisMax * 100))}%` : '0',
    bonW: c[2] ? `${Math.max(2, Math.round(c[2] / axisMax * 100))}%` : '0',
  }))
  return {
    rows,
    axisMax,
    deductions: d.cats.reduce((a, c) => a + c[1], 0),
    bonuses: d.cats.reduce((a, c) => a + c[2], 0),
  }
}

// ── Tier distribution ───────────────────────────────────────────────────────

export function buildTiers() {
  const counts: Record<string, number> = { Excellent: 0, Good: 0, Decent: 0, 'Needs Work': 0, 'At Risk': 0 }
  ROSTER.forEach((r) => { counts[tierOf(r[1])]++ })
  const total = ROSTER.length
  const segs = TIER_FILLS.map(([tier, fill]) => ({
    tier,
    // A tier nobody is in still needs a hit target, hence the 8% floor.
    w: `${Math.max(8, counts[tier] / total * 100).toFixed(1)}%`,
    fill,
    // A narrow band cannot hold its own name, so it shows the count alone.
    label: counts[tier] / total < 0.2 ? String(counts[tier]) : `${tier} · ${counts[tier]}`,
    title: `${tier} · ${counts[tier]} associates`,
  }))
  const legend = TIER_FILLS.map(([tier, fill]) => ({ label: `${tier} · ${counts[tier]}`, fill }))
  return { counts, total, segs, legend }
}

// ── Movement tables ─────────────────────────────────────────────────────────

export interface MoveRow {
  name: string
  net: number
  d: number
}

/**
 * How far each associate moved over the window.
 *
 * The figure is a hash of the associate's name and the chosen category, scaled
 * by the window: deterministic, so the same filters always name the same
 * people in the same order.
 */
export function movement(category: string, window: string, seed: number, weight: number): MoveRow[] {
  let base = seed
  for (let i = 0; i < category.length; i++) base += category.charCodeAt(i) * weight
  const scale = winScale(window)
  const span = weight === 1 ? 26 : 22
  const floor = weight === 1 ? 3 : 2
  const offset = weight === 1 ? 2 : 5
  return ROSTER.map((r) => {
    let h = base
    for (let i = 0; i < r[0].length; i++) h += r[0].charCodeAt(i) * (i + offset)
    return { name: r[0], net: r[1], d: Math.max(1, Math.round((floor + (h % span)) * scale)) }
  }).sort((a, b) => b.d - a.d)
}

/** Biggest improvements — the Kudos table. */
export const improvements = (category: string, window: string): MoveRow[] => movement(category, window, 0, 1)

/** Biggest declines — the coaching table. */
export const declines = (category: string, window: string): MoveRow[] => movement(category, window, 7, 3)

export const rankedRoster = (): { name: string; net: number; tier: Tier }[] =>
  ROSTER.slice().sort((a, b) => b[1] - a[1]).map((r) => ({ name: r[0], net: r[1], tier: tierOf(r[1]) }))

export const bonusTotal = (): number => BONUS_ROWS.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0)

export const sourceTotals = (): [number, number] => [
  SOURCE_ROWS.reduce((a, r) => a + r[0], 0),
  SOURCE_ROWS.reduce((a, r) => a + r[1], 0),
]
