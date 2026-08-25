import { Gauge } from '../../ds/charts/ChartKit.jsx'
import { useHover } from '../../ds/useHover.js'
import { caption1, caption1Strong, subtitle1, title3 } from '../../ds/type.js'
import { EYEBROW } from './tokens.js'
import { ALL, CURRENT } from './data.js'
import { basis, badge, delta, der, fmtRange, money, otOf, pct } from './calc.js'

export function SectionLabel({ children }) {
  return <span style={EYEBROW}>{children}</span>
}

// The current period is always one click away, even while reading a closed one.
export function CurrentStrip({ s }) {
  if (s.sel === CURRENT.id) return null
  const d = der(CURRENT)
  const tone = badge('projected')
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        padding: 'var(--size-100) var(--size-160)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          boxSizing: 'border-box',
          height: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-80)',
          borderRadius: 'var(--radius-medium)',
          background: tone.bg,
          border: `1px solid ${tone.border}`,
          ...caption1Strong,
          color: tone.fg,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tone.dot, flexShrink: 0 }} />
        Projected
      </span>
      <span style={{ ...caption1Strong, whiteSpace: 'nowrap' }}>
        P14 · {fmtRange(CURRENT.start)}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {`Profit ${money(d.gp)} · margin ${pct(d.margin)} · ${money(d.ppr)} / route · 1 of 3 inputs real`}
      </span>
      <div style={{ flex: 1 }} />
      <ViewCurrent onClick={() => s.pickPeriod(CURRENT.id)} />
    </div>
  )
}

function ViewCurrent({ onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        ...caption1,
        color: 'var(--text-link)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      View current period
    </span>
  )
}

const GRID_CARD = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  overflow: 'hidden',
  display: 'grid',
}

// A delta is good or bad depending on the measure: rising cost is bad, rising
// profit is good, so each KPI says which way it reads.
const deltaColor = (d, invert) =>
  d === null ? null : (invert ? d.d <= 0 : d.d >= 0) ? 'var(--success-fg)' : 'var(--danger-fg)'

function DeltaLine({ d, invert, vs }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1 }}>
      {d ? (
        <span
          style={{
            ...caption1Strong,
            color: deltaColor(d, invert),
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {d.text}
        </span>
      ) : (
        <span style={{ color: 'var(--text-disabled)' }}>—</span>
      )}
      <span style={{ color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{vs}</span>
    </span>
  )
}

export function MoneyKpis({ s }) {
  const sel = s.selected
  const d = der(sel)
  const b = basis(sel, s.compare)
  const vs = b ? b.label : s.compare === 'none' ? 'Comparison off' : 'No previous period'

  const kpis = [
    { label: 'Total revenue', value: money(sel.rev), d: b ? delta(sel.rev, b.rev) : null },
    { label: 'Total cost', value: money(sel.cost), d: b ? delta(sel.cost, b.cost) : null, invert: true },
    { label: 'Gross profit', value: money(d.gp), d: b ? delta(d.gp, b.gp) : null },
    { label: 'Profit margin', value: pct(d.margin), d: b ? delta(d.margin, b.margin, 'pts') : null },
    { label: 'Profit / route', value: sel.routes ? money(d.ppr) : '—', d: b ? delta(d.ppr, b.ppr) : null },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <SectionLabel>The money</SectionLabel>
      <div style={{ ...GRID_CARD, gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))' }}>
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-160) var(--size-200)',
              borderLeft: '1px solid var(--border-subtle)',
              borderTop: '1px solid var(--border-subtle)',
              margin: '-1px 0 0 -1px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-40)',
            }}
          >
            <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{k.label}</span>
            <span style={{ ...title3, fontVariantNumeric: 'tabular-nums' }}>{k.value}</span>
            <DeltaLine d={k.d} invert={k.invert} vs={vs} />
          </div>
        ))}
      </div>
    </div>
  )
}

// The ratios that explain the headline. Each one is a cost share, so falling
// is good on all of them.
export function WhatMovesIt({ s }) {
  const sel = s.selected
  const d = der(sel)
  const b = basis(sel, s.compare)
  const vs = b ? b.label : s.compare === 'none' ? 'Comparison off' : 'No previous period'

  const taxLoad = (d.taxes / d.gross) * 100
  const ot = otOf(sel)
  const prev = ALL[sel.idx - 1]
  const dOt = s.compare === 'prev' && prev ? delta(ot, otOf(prev), 'pts') : null
  const gaugeColor = (dl) => (dl ? (dl.d <= 0 ? 'var(--success-accent)' : 'var(--danger-accent)') : 'var(--neutral-400)')

  const dDrv = b ? delta(d.drv, b.drv, 'pts') : null
  const dCpr = b ? delta(d.cpr, b.cpr) : null
  const dTax = b && b.tax !== null ? delta(taxLoad, b.tax, 'pts') : null

  const cards = [
    { label: 'Driver cost % of revenue', value: pct(d.drv), d: dDrv, gauge: { frac: d.drv / 100, color: gaugeColor(dDrv) } },
    { label: 'Cost / route', value: money(d.cpr), d: dCpr },
    { label: 'OT cost % of payroll', value: pct(ot), d: dOt, gauge: { frac: ot / 15, color: gaugeColor(dOt) } },
    { label: 'Employer tax load', value: pct(taxLoad), d: dTax, gauge: { frac: taxLoad / 20, color: gaugeColor(dTax) } },
    // Staffing plans are not built, so this one states that rather than
    // showing a number nothing stands behind.
    { label: 'Over workforce', value: '—', d: null, muted: true, vs: '' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <SectionLabel>What moves it</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--size-160)' }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              boxSizing: 'border-box',
              background: c.muted ? 'var(--surface-subtle)' : 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-160)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-40)',
            }}
          >
            <span
              title={c.label}
              style={{ ...EYEBROW, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {c.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-80)' }}>
              <span
                style={{
                  ...subtitle1,
                  fontVariantNumeric: 'tabular-nums',
                  color: c.muted ? 'var(--text-disabled)' : 'var(--text-primary)',
                }}
              >
                {c.value}
              </span>
              <span style={{ flex: 1 }} />
              {c.gauge && (
                <span style={{ display: 'flex' }}>
                  <Gauge frac={c.gauge.frac} color={c.gauge.color} />
                </span>
              )}
            </span>
            <DeltaLine d={c.d} invert vs={c.vs === '' ? '' : vs} />
          </div>
        ))}
      </div>
    </div>
  )
}
