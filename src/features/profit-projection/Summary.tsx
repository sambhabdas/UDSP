import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type { ProjectionState } from './useProfitProjection'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, subtitle1, subtitle2, title3 } from '../../ds/type'
import { labelEyebrow as EYEBROW } from '../../ds/type'
import { DAYS, SEG_COLORS, SEG_TEXT, WEEK_BREAKDOWN } from './data'
import {
  DASH,
  breakdownOf,
  costOf,
  marginColor,
  money,
  money0,
  num,
  pct,
  revOf,
  weekTotals,
} from './calc'

export function SectionLabel({ children }: { children?: ReactNode }) {
  return (
    <span style={{ ...EYEBROW, marginBottom: 'calc(-1 * var(--size-80))' }}>{children}</span>
  )
}

const GRID_CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  overflow: 'hidden',
  display: 'grid',
}

// One cell of a hairline-ruled grid. The negative margin collapses the shared
// edge so neighbours never double up their rule.
function GridCell({ label, children }: { label: ReactNode; children?: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-100) var(--size-160)',
        borderLeft: '1px solid var(--border-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        margin: '-1px 0 0 -1px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
      }}
    >
      <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{label}</span>
      {children}
    </div>
  )
}

function IconAction({
  title,
  onClick,
  children,
}: {
  title: string
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
  children?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        flexShrink: 0,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

// What the day's money is computed FROM — routes, packages, payroll, rates.
export function ProjectionInputs({ s }: { s: ProjectionState }) {
  const day = DAYS[s.dayIdx]
  const cells = [
    { label: 'Routes', value: num(day.routes), detail: day.mix, tag: s.dayIdx === 3 ? 'Matched with Amazon' : null, onEdit: () => s.toast(`Opens the per-type override · ${day.full}`) },
    { label: 'Packages', value: num(day.pkg), detail: 'Delivered', onEdit: () => s.toast(`Opens the packages override · ${day.full}`) },
    { label: 'Payroll', value: num(day.clock), detail: 'People · Paycom Jul 15 - Jul 31.xlsx', onEdit: () => s.setImportOpen(true) },
    { label: 'Rates', value: '$150 - $360', detail: 'Per route · $0.12/pkg', link: 'Rate Cards', onLink: () => s.toast('Opens Rate Cards') },
  ]
  return (
    <>
      <SectionLabel>Projection inputs</SectionLabel>
      <div style={{ ...GRID_CARD, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {cells.map((c) => (
          <GridCell key={c.label} label={c.label}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)', minWidth: 0 }}>
              <span style={{ ...subtitle1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {c.value}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  ...caption1,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.detail}
              </span>
              {c.tag && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-40)',
                    ...caption1Strong,
                    color: 'var(--success-fg)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="FnCheck" size={12} />
                  {c.tag}
                </span>
              )}
              {c.onEdit && (
                <IconAction title="Override" onClick={c.onEdit}>
                  <Icon name="FnEdit" size={14} />
                </IconAction>
              )}
              {c.link && (
                <LinkText onClick={c.onLink}>{c.link}</LinkText>
              )}
            </span>
          </GridCell>
        ))}
      </div>
    </>
  )
}

function LinkText({ children, onClick }: { children?: ReactNode; onClick?: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        ...caption1,
        color: 'var(--text-link)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

// Previous-week per-route baseline the chips compare against.
const PREV_WEEK = { rpr: 366.1, cpr: 284.9, ppr: 81.2 }

const NEUTRAL_CHIP = {
  chipBg: 'var(--blue-100)',
  chipBd: 'var(--blue-200)',
  chipFg: 'var(--blue-700)',
  chipTitle: '',
}

// A per-route figure is only good or bad against something — with no baseline,
// or on a custom range, the chip stays neutral rather than implying a verdict.
function chipVs(
  cur: number,
  prev: number | null | undefined,
  invert: boolean,
  vsLabel: string,
  grain: string,
) {
  if (grain === 'Custom' || prev === null || prev === undefined) return NEUTRAL_CHIP
  const good = invert ? cur <= prev : cur >= prev
  const title = `vs ${vsLabel} ${money(prev)}`
  return good
    ? { chipBg: 'var(--success-bg)', chipBd: 'var(--success-border)', chipFg: 'var(--success-fg)', chipTitle: title }
    : { chipBg: 'var(--danger-bg)', chipBd: 'var(--danger-border)', chipFg: 'var(--danger-fg)', chipTitle: title }
}

export function MoneyKpis({ s }: { s: ProjectionState }) {
  const wk = weekTotals()
  const di = s.dayIdx
  const day = DAYS[di]
  const dRev = revOf(di)
  const dCost = costOf(di)
  const dProfit = dRev - dCost
  const dMargin = (dProfit / dRev) * 100

  let kpis
  if (s.empty) {
    kpis = ['Total revenue', 'Total cost', 'Profit', 'Margin'].map((label) => ({
      label,
      value: DASH,
      chip: 'No days in range',
      color: 'var(--text-disabled)',
      border: 'var(--border-default)',
      ...NEUTRAL_CHIP,
    }))
  } else if (s.isWeek) {
    kpis = [
      { label: 'Total revenue', value: money0(wk.rev), chip: `${money(wk.rev / wk.routes)} / route`, color: 'var(--text-primary)', border: 'var(--border-default)', ...chipVs(wk.rev / wk.routes, PREV_WEEK.rpr, false, 'last week', s.grain) },
      { label: 'Total cost', value: money0(wk.cost), chip: `${money(wk.cost / wk.routes)} / route`, color: 'var(--text-primary)', border: 'var(--border-default)', ...chipVs(wk.cost / wk.routes, PREV_WEEK.cpr, true, 'last week', s.grain) },
      { label: 'Profit', value: money0(wk.profit), chip: `${money(wk.profit / wk.routes)} / route`, color: wk.profit >= 0 ? 'var(--success-fg)' : 'var(--danger-fg)', border: wk.profit >= 0 ? 'var(--success-border)' : 'var(--danger-border)', ...chipVs(wk.profit / wk.routes, PREV_WEEK.ppr, false, 'last week', s.grain) },
      { label: 'Margin', value: pct(wk.margin), chip: null, color: marginColor(wk.margin), border: wk.margin >= 15 ? 'var(--success-border)' : 'var(--border-default)' },
    ]
  } else {
    const prev = di > 0
      ? {
          rpr: revOf(di - 1) / DAYS[di - 1].routes,
          cpr: costOf(di - 1) / DAYS[di - 1].routes,
          ppr: (revOf(di - 1) - costOf(di - 1)) / DAYS[di - 1].routes,
        }
      : null
    const vs = DAYS[di - 1] ? DAYS[di - 1].full : ''
    kpis = [
      { label: 'Total revenue', value: money(dRev), chip: `${money(dRev / day.routes)} / route`, color: 'var(--text-primary)', border: 'var(--border-default)', ...chipVs(dRev / day.routes, prev && prev.rpr, false, vs, s.grain) },
      { label: 'Total cost', value: money(dCost), chip: `${money(dCost / day.routes)} / route`, color: 'var(--text-primary)', border: 'var(--border-default)', ...chipVs(dCost / day.routes, prev && prev.cpr, true, vs, s.grain) },
      { label: 'Profit', value: money(dProfit), chip: `${money(dProfit / day.routes)} / route`, color: dProfit >= 0 ? 'var(--success-fg)' : 'var(--danger-fg)', border: dProfit >= 0 ? 'var(--success-border)' : 'var(--danger-border)', ...chipVs(dProfit / day.routes, prev && prev.ppr, false, vs, s.grain) },
      { label: 'Margin', value: pct(dMargin), chip: null, color: marginColor(dMargin), border: dMargin >= 15 ? 'var(--success-border)' : 'var(--border-default)' },
    ]
  }

  return (
    <>
      <SectionLabel>The money</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: 'var(--size-160)' }}>
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              boxSizing: 'border-box',
              background: 'var(--surface-card)',
              border: `1px solid ${k.border}`,
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-160) var(--size-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-40)',
            }}
          >
            <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{k.label}</span>
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-80)' }}>
              <span style={{ ...title3, fontVariantNumeric: 'tabular-nums', color: k.color }}>
                {k.value}
              </span>
            </span>
            {k.chip && (
              <span
                title={k.chipTitle}
                style={{
                  boxSizing: 'border-box',
                  height: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-medium)',
                  background: k.chipBg,
                  border: `1px solid ${k.chipBd}`,
                  ...caption1Strong,
                  color: k.chipFg,
                  whiteSpace: 'nowrap',
                  width: 'max-content',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                {k.chip}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// The operational levers behind the money.
export function WhatMovesIt({ s }: { s: ProjectionState }) {
  const wk = weekTotals()
  const day = DAYS[s.dayIdx]
  const BLOCK = 9.31

  let ops
  if (s.empty) {
    ops = ['Overtime', 'Hours per route', 'Clock-ins', 'Routes', 'Over workforce'].map((label) => ({
      label,
      value: DASH,
      color: 'var(--text-disabled)',
      title: '',
    }))
  } else {
    const [otPct, hrsRt, clock, routes] = s.isWeek
      ? [20.1, wk.hours / wk.routes, wk.clock, wk.routes]
      : [day.otPct, day.hours / day.routes, day.clock, day.routes]
    const over = (clock / routes - 1) * 100
    ops = [
      { label: 'Overtime', value: pct(otPct), color: 'var(--warning-fg)', title: 'Share of pay that is overtime' },
      { label: 'Hours per route', value: hrsRt.toFixed(2), color: hrsRt > BLOCK ? 'var(--warning-fg)' : 'var(--text-primary)', title: `${hrsRt.toFixed(2)} vs ${BLOCK.toFixed(2)} blocked` },
      { label: 'Clock-ins', value: num(clock), color: 'var(--text-primary)', title: '' },
      { label: 'Routes', value: num(routes), color: 'var(--text-primary)', title: '' },
      { label: 'Over workforce', value: pct(over), color: over > 0 ? 'var(--warning-fg)' : 'var(--success-fg)', title: '' },
    ]
  }

  return (
    <>
      <SectionLabel>What moves it</SectionLabel>
      <div style={{ ...GRID_CARD, gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {ops.map((o) => (
          <GridCell key={o.label} label={o.label}>
            <span title={o.title} style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-100)', minWidth: 0 }}>
              <span
                style={{
                  ...subtitle1,
                  fontVariantNumeric: 'tabular-nums',
                  color: o.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {o.value}
              </span>
            </span>
          </GridCell>
        ))}
      </div>
    </>
  )
}

// Where the cost actually went — a segmented bar plus the numbers, because a
// bar alone is not a figure anyone can quote.
export function CostBreakdown({ s }: { s: ProjectionState }) {
  const di = s.dayIdx
  const rows = s.empty ? [] : s.isWeek ? WEEK_BREAKDOWN : breakdownOf(di)
  const total = rows.reduce((sum, r) => sum + r.amt, 0) || 1
  const dRev = revOf(di)
  const dCost = costOf(di)

  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
      }}
    >
      <span style={{ ...subtitle2, whiteSpace: 'nowrap' }}>Cost breakdown</span>
      <div style={{ display: 'flex', height: 28, borderRadius: 'var(--radius-small)', overflow: 'hidden' }}>
        {rows.map((r, i) => {
          const p = (r.amt / total) * 100
          return (
            <div
              key={r.label}
              style={{
                width: `${p.toFixed(2)}%`,
                background: SEG_COLORS[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...caption1Strong,
                color: SEG_TEXT[i],
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {/* Only segments with room get an inline label. */}
              {p >= 12 ? pct(p) : ''}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', ...caption1 }}>
            <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-small)', background: SEG_COLORS[i], flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.label}
            </span>
            <span style={{ width: 96, textAlign: 'right', fontVariantNumeric: 'tabular-nums', ...caption1Strong }}>
              {s.isWeek ? money0(r.amt) : money(r.amt)}
            </span>
            <span style={{ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
              {pct((r.amt / total) * 100)}
            </span>
          </div>
        ))}
      </div>
      {s.isDay && !s.empty && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--size-80)',
            ...caption1,
            color: 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {`Revenue ${money(dRev)} - cost ${money(dCost)} = profit ${money(dRev - dCost)}`}
        </div>
      )}
    </div>
  )
}
