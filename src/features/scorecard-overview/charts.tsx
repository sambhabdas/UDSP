'use client'

import { useState } from 'react'
import { caption1 } from '../../ds/type'
import { AXIS_TEXT } from './style'
import type { LineCol, StackBar } from './calc'

/** Which column the pointer is over. Every chart here tracks exactly one. */
function useHoverIndex() {
  return useState<number | null>(null)
}

/**
 * The y-axis gutter every chart on this page shares: a fixed 36px column with
 * its labels pinned top, middle and bottom.
 */
function AxisColumn({ labels, padTop = 20 }: { labels: string[]; padTop?: number }) {
  return (
    <div style={{ width: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: padTop, paddingBottom: 1 }}>
      {labels.map((l, i) => (
        <span key={i} style={AXIS_TEXT}>{l}</span>
      ))}
    </div>
  )
}

/**
 * A line chart with a dot per point.
 *
 * The value only appears over the point the pointer is on — with 24 weeks on
 * screen, showing every one at once is unreadable.
 */
export function LineChart({
  cols, points, yLabels, color, refPct, zeroPct, minHeight = 110, onPick,
}: {
  cols: LineCol[]
  points: string
  yLabels: string[]
  color: string
  /** A dashed rule at this percentage down the plot — a target or a zero line. */
  refPct?: string
  zeroPct?: { pct: string; show: boolean }
  minHeight?: number
  onPick?: (i: number) => void
}) {
  const [hover, setHover] = useHoverIndex()
  return (
    <div style={{ flex: 1, display: 'flex', gap: 'var(--size-80)', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
      {zeroPct ? (
        // The trend chart labels its own zero, which floats with the axis.
        <div style={{ position: 'relative', width: 36 }}>
          <span style={{ position: 'absolute', top: 20, right: 0, ...AXIS_TEXT }}>{yLabels[0]}</span>
          {zeroPct.show && (
            <span style={{ position: 'absolute', top: `calc(20px + (100% - 40px) * ${zeroPct.pct} / 100 - 8px)`, right: 0, ...AXIS_TEXT }}>0</span>
          )}
          <span style={{ position: 'absolute', bottom: 20, right: 0, ...AXIS_TEXT }}>{yLabels[1]}</span>
        </div>
      ) : (
        <AxisColumn labels={yLabels} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 20 }} />
        <div style={{ position: 'relative', flex: zeroPct ? undefined : 1, height: zeroPct ? minHeight : undefined, minHeight, borderLeft: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
          {(refPct ?? zeroPct?.pct) && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${refPct ?? zeroPct?.pct}%`, borderTop: '1px dashed var(--border-strong)', pointerEvents: 'none' }} />
          )}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {cols.map((w, i) => (
              <div
                key={i}
                data-fx={onPick ? '' : undefined}
                tabIndex={onPick ? 0 : undefined}
                role={onPick ? 'button' : undefined}
                onClick={onPick ? () => onPick(i) : undefined}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                title={w.title}
                style={{ flex: 1, position: 'relative', cursor: onPick ? 'pointer' : undefined }}
              >
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 2, ...AXIS_TEXT, opacity: hover === i ? 1 : 0, transition: 'opacity 100ms', whiteSpace: 'nowrap' }}>
                  {w.val}
                </span>
                <span style={{ position: 'absolute', left: '50%', top: `${w.dotY}%`, width: 7, height: 7, margin: '-3.5px 0 0 -3.5px', borderRadius: '50%', background: color, border: '1.5px solid var(--surface-card)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </div>
        <ColumnLabels labels={cols.map((c) => c.label)} />
      </div>
    </div>
  )
}

function ColumnLabels({ labels, gap, pad }: { labels: string[]; gap?: string; pad?: string }) {
  return (
    <div style={{ display: 'flex', gap, padding: pad ?? 'var(--size-40) 0 0 0' }}>
      {labels.map((l, i) => (
        <span key={i} style={{ flex: 1, textAlign: 'center', ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{l}</span>
      ))}
    </div>
  )
}

/** A column of stacked segments per week. */
export function StackChart({
  bars, yLabels, legend, onPick,
}: {
  bars: StackBar[]
  yLabels: string[]
  legend: { label: string; fill: string }[]
  onPick?: (i: number) => void
}) {
  const [hover, setHover] = useHoverIndex()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
      <div style={{ flex: 1, minHeight: 170, display: 'flex', gap: 'var(--size-80)' }}>
        <AxisColumn labels={yLabels} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 'var(--size-120)', padding: '0 var(--size-40)', borderLeft: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
            {bars.map((b, i) => (
              <div
                key={b.label}
                data-fx={onPick ? '' : undefined}
                tabIndex={onPick ? 0 : undefined}
                role={onPick ? 'button' : undefined}
                onClick={onPick ? () => onPick(i) : undefined}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                title={b.title}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-40)', cursor: onPick ? 'pointer' : undefined }}
              >
                <span style={{ minHeight: 16, ...AXIS_TEXT, opacity: hover === i ? 1 : 0, transition: 'opacity 100ms', whiteSpace: 'nowrap' }}>
                  {b.hoverLabel}
                </span>
                <div style={{ width: '100%', maxWidth: 44, height: b.barH, display: 'flex', flexDirection: 'column-reverse', borderRadius: '2px 2px 0 0', overflow: 'hidden' }}>
                  {b.segs.map((s, j) => (
                    <div key={j} title={s.title} style={{ height: s.h, background: s.fill }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ColumnLabels labels={bars.map((b) => b.label)} gap="var(--size-120)" pad="var(--size-40) var(--size-40) 0 var(--size-40)" />
        </div>
      </div>
      <Legend items={legend} />
    </div>
  )
}

function Legend({ items }: { items: { label: string; fill: string }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)' }}>
      {items.map((l) => (
        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: l.fill }} />
          {l.label}
        </span>
      ))}
    </div>
  )
}

/** Three plain bars with their values always shown — the aging buckets. */
export function BarChart({ bars, yLabels }: { bars: { label: string; value: string; h: string; fill: string; title: string }[]; yLabels: string[] }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
      <div style={{ flex: 1, minHeight: 150, display: 'flex', gap: 'var(--size-80)' }}>
        <AxisColumn labels={yLabels} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 'var(--size-200)', padding: '0 var(--size-200)', borderLeft: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
            {bars.map((b) => (
              <div key={b.label} title={b.title} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-40)' }}>
                <span style={AXIS_TEXT}>{b.value}</span>
                <div style={{ width: '100%', maxWidth: 56, height: b.h, background: b.fill, borderRadius: '2px 2px 0 0' }} />
              </div>
            ))}
          </div>
          <ColumnLabels labels={bars.map((b) => b.label)} gap="var(--size-200)" pad="var(--size-40) var(--size-200) 0 var(--size-200)" />
        </div>
      </div>
    </div>
  )
}
