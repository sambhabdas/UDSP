import type { CSSProperties } from 'react'

// Non-component exports the chart kit shares, kept separate so fast refresh
// works on ChartKit.jsx itself.

// A chart card is a resting surface: hairline, no shadow.
export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  padding: 'var(--size-160)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--size-120)',
}

// Builds a plot-relative path across n columns. `from`/`to` let a series be
// split so the projected tail can be drawn dashed.
export function linePath(
  values: readonly number[],
  from: number,
  to: number,
  max: number,
  n: number,
): string {
  let d = ''
  for (let i = from; i <= to; i++) {
    const x = ((i + 0.5) / n) * 100
    const y = 100 - (values[i] / max) * 100
    d += (i === from ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2)
  }
  return d
}
