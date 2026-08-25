import { caption1, caption1Strong, caption2, subtitle2 } from '../type.js'
import { CARD } from './chartTokens.js'

// The pieces every chart on this page is built from. Grid and axes are
// recessive; the marks carry the message.

// A legend is always present for two or more series, so identity is never
// carried by colour alone.
export function Legend({ items }) {
  return (
    <>
      {items.map((it) => (
        <span
          key={it.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-60)',
            ...caption1,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Swatch {...it} />
          {it.label}
        </span>
      ))}
    </>
  )
}

function Swatch({ color, dashed, rule }) {
  if (rule) {
    return <span style={{ width: 12, height: 0, borderTop: `2px dashed ${color}` }} />
  }
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 'var(--radius-small)',
        ...(dashed
          ? { border: `1.5px dashed ${color}`, boxSizing: 'border-box' }
          : { background: color }),
      }}
    />
  )
}

export function ChartCard({ title, legend, children }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
        <span style={{ ...subtitle2, whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ flex: 1 }} />
        {legend && <Legend items={legend} />}
      </div>
      {children}
    </div>
  )
}

// Value ticks down the side of a plot. `align` puts them on the right for the
// second axis of a paired chart.
export function Axis({ ticks, height, align = 'right', width = 38 }) {
  return (
    <div
      style={{
        width,
        flexShrink: 0,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: align === 'right' ? 'flex-end' : 'flex-start',
        ...caption2,
        color: 'var(--text-disabled)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {ticks.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  )
}

// Plot area: three recessive rules (top, middle, baseline) with the columns
// laid over them.
export function Plot({ height, children, rules }) {
  return (
    <div style={{ flex: 1, position: 'relative', height }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, borderTop: '1px solid var(--border-subtle)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid var(--border-subtle)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTop: '1px solid var(--border-default)' }} />
      {rules}
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>{children}</div>
    </div>
  )
}

// A reference line the reader is meant to compare against — break-even, or the
// blocked hours per route.
export function ReferenceRule({ top }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        borderTop: '2px dashed var(--success-accent)',
      }}
    />
  )
}

// Hover tooltip. Anchored to the column and pointer-transparent so it never
// steals the hover it was opened by.
export function Tooltip({ left, title, rows, text, minWidth }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 4,
        left,
        transform: 'translateX(-50%)',
        zIndex: 30,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        minWidth,
        padding: 'var(--size-80) var(--size-100)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-callout)',
        display: 'flex',
        flexDirection: 'column',
        gap: rows ? 'var(--size-40)' : 2,
      }}
    >
      <span style={{ ...caption1Strong, whiteSpace: 'nowrap' }}>{title}</span>
      {text && (
        <span
          style={{
            ...caption1,
            color: 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
      )}
      {(rows || []).map((r) => (
        <span key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-small)',
              background: r.sw,
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.label}</span>
          <span
            style={{
              ...(r.val2 ? { width: 56, textAlign: 'right' } : {}),
              ...caption1Strong,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {r.val}
          </span>
          {r.val2 && (
            <span
              style={{
                width: 80,
                textAlign: 'right',
                ...caption1Strong,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {r.val2}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

// Column labels under a plot — one per column, matching the plot's flex split.
export function ColumnLabels({ cols, marginLeft = 46, marginRight = 0, render }) {
  return (
    <div style={{ display: 'flex', marginLeft, marginRight }}>
      {cols.map((c, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            ...caption1,
          }}
        >
          {render(c)}
        </span>
      ))}
    </div>
  )
}

// A hit target spanning the full column height, so hovering anywhere in the
// column works — not just on the mark itself.
export function Column({ onEnter, onLeave, onClick, children, style }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// A stack of segments drawn bottom-up, with the 2px surface gaps that keep
// adjacent fills legible.
export function StackedBar({ width, height, segments, opacity = 1 }) {
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column-reverse',
        borderRadius: '2px 2px 0 0',
        overflow: 'hidden',
        opacity,
      }}
    >
      {segments.map((s, i) => (
        <div key={i} style={{ flex: s.f, background: s.bg }} />
      ))}
    </div>
  )
}

// A polyline across the plot in plot-relative percentages.
export function PlotLine({ points, color }) {
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join('')
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// A half-circle gauge for a 0–1 fraction. Reads at a glance beside a figure;
// the figure itself always carries the precise value.
export function Gauge({ frac, color, width = 58, height = 31 }) {
  const p = Math.max(2, Math.min(1, frac < 0 ? 0 : frac) * 100)
  const arc = 'M6 30 A26 26 0 0 1 58 30'
  return (
    <svg viewBox="0 0 64 34" style={{ width, height, display: 'block', overflow: 'visible' }}>
      <path d={arc} fill="none" stroke="var(--border-default)" strokeWidth={6} strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${p} 100`}
      />
    </svg>
  )
}


// One or more series, each optionally split into a solid actual run and a
// dashed projected tail — the second channel that marks "not final yet".
export function MultiLine({ series }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {series.map((s, i) => (
        <g key={i}>
          {s.solid && (
            <path
              d={s.solid}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {s.dashed && (
            <path
              d={s.dashed}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  )
}

// A point on a line. Hollow means projected.
export function Dot({ bottom, color, hollow, size = 7 }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginBottom: -size / 2,
        borderRadius: 'var(--radius-circle)',
        background: hollow ? 'var(--surface-card)' : color,
        border: `1.5px solid ${color}`,
        boxSizing: 'border-box',
      }}
    />
  )
}

// A 100%-tall column of proportional segments — for share-of-total charts,
// where every column reaches the top by definition.
export function ShareBar({ width, segments, opacity = 1 }) {
  return (
    <div
      style={{ width, height: '100%', display: 'flex', flexDirection: 'column-reverse', opacity }}
    >
      {segments.map((s, i) => (
        <div key={i} style={{ height: s.h, background: s.bg, boxSizing: 'border-box' }} />
      ))}
    </div>
  )
}
