import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, caption2Strong, subtitle2 } from '../../ds/type'
import { labelEyebrow as EYEBROW } from '../../ds/type'
import { ALL, RESTATED_TITLE, WARN_TITLE } from './data'
import {
  badge,
  der,
  driverBand,
  fmtRange,
  fmtRangeNum,
  heat,
  money,
  num,
  pct,
  rangeOf,
  scaleColor,
} from './calc'
import type { Period } from './data'
import type { ProfitabilityState } from './useProfitability'

/** A history column. `sort` marks the ones the header can order by. */
interface Def {
  k: string
  label: string
  width?: string
  flex?: string
  min?: string
  right?: boolean
  sort?: boolean
}

/** Per-column [lo, hi] ranges, so a cell can colour itself against the set. */
type Heats = Record<string, [number, number]>

const DEFS: Def[] = [
  { k: 'idx', label: 'Pay period', flex: '1', min: '110px', sort: true },
  { k: 'dates', label: 'Dates', width: '104px', sort: true },
  { k: 'routes', label: 'Routes', width: '56px', right: true, sort: true },
  { k: 'rev', label: 'Revenue', width: '104px', right: true, sort: true },
  { k: 'cost', label: 'Cost', width: '104px', right: true, sort: true },
  { k: 'gp', label: 'Gross profit', width: '116px', right: true, sort: true },
  { k: 'margin', label: 'Margin %', width: '84px', right: true, sort: true },
  { k: 'ppr', label: '$ / route', width: '84px', right: true, sort: true },
  { k: 'drv', label: 'Driver %', width: '80px', right: true, sort: true },
  { k: 'src', label: 'Source', width: '96px', sort: true },
  { k: 'link', label: 'Action', width: '56px', right: true },
]

const cellBox = (def: Def): CSSProperties => ({
  boxSizing: 'border-box',
  width: def.width || 'auto',
  flex: def.flex || 'none',
  minWidth: def.min || 0,
  flexShrink: def.flex ? 1 : 0,
  display: 'flex',
  justifyContent: def.right ? 'flex-end' : 'flex-start',
})

function HeadCell({
  def,
  sort,
  onSort,
}: {
  def: Def
  sort: ProfitabilityState['sort']
  onSort: () => void
}) {
  const [hover, hoverProps] = useHover()
  const active = sort.col === def.k
  return (
    <div
      onClick={def.sort ? onSort : undefined}
      style={{
        ...cellBox(def),
        alignItems: 'center',
        gap: 'var(--size-40)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: def.sort ? 'pointer' : 'default',
        userSelect: 'none',
        color: active || (hover && def.sort) ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      {def.label}
      {def.sort && (
        <span style={{ display: 'flex' }}>
          <Icon
            name={active ? (sort.dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
            size={12}
            color={active ? 'currentColor' : 'var(--text-disabled)'}
          />
        </span>
      )}
    </div>
  )
}

function LinkText({
  children,
  onClick,
  style,
}: {
  children?: ReactNode
  onClick?: () => void
  style?: CSSProperties
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{ cursor: 'pointer', textDecoration: hover ? 'underline' : 'none', ...style }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

function Row({ p, s, heats }: { p: Period; s: ProfitabilityState; heats: Heats }) {
  const [hover, hoverProps] = useHover()
  const d = der(p)
  const src = p.projected ? badge('projected') : p.prov ? badge('provisional') : badge('closed')
  const fs = p.projected ? 'italic' : 'normal'
  const cell = (def: Def, children: ReactNode, style?: CSSProperties) => (
    <div key={def.k} style={cellBox(def)}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontStyle: fs, whiteSpace: 'nowrap', ...style }}>
        {children}
      </span>
    </div>
  )

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ ...cellBox(DEFS[0]), alignItems: 'center', gap: 'var(--size-60)' }}>
        <LinkText onClick={() => s.pickPeriod(p.id)} style={{ ...caption1Strong, fontStyle: fs }}>
          {p.year} · {p.id}
        </LinkText>
        {/* A disputed week and a restatement are facts about the number, so
            they travel with it rather than living in a footnote. */}
        {p.prov && (
          <span title={WARN_TITLE} style={{ color: 'var(--warning-fg)', cursor: 'help' }}>
            ⚠︎
          </span>
        )}
        {p.restated && (
          <span title={RESTATED_TITLE} style={{ color: 'var(--text-secondary)', cursor: 'help' }}>
            ↻
          </span>
        )}
      </div>
      {cell(DEFS[1], fmtRangeNum(p.start), { color: 'var(--text-secondary)' })}
      {cell(DEFS[2], num(p.routes))}
      {cell(DEFS[3], money(p.rev), { color: heat(p.rev, heats.rev[0], heats.rev[1]) })}
      {cell(DEFS[4], money(p.cost), { color: heat(p.cost, heats.cost[0], heats.cost[1], true) })}
      {cell(DEFS[5], money(d.gp), { color: heat(d.gp, heats.gp[0], heats.gp[1]) })}
      {cell(DEFS[6], pct(d.margin), {
        ...caption1Strong,
        fontStyle: fs,
        color: scaleColor(
          heats.margin[1] === heats.margin[0]
            ? 1
            : (d.margin - heats.margin[0]) / (heats.margin[1] - heats.margin[0]),
        ),
      })}
      {cell(DEFS[7], money(d.ppr))}
      {cell(DEFS[8], pct(d.drv), {
        color:
          d.drv < driverBand.lo - 0.05
            ? 'var(--success-fg)'
            : d.drv > driverBand.hi + 0.05
              ? 'var(--warning-fg)'
              : 'var(--text-primary)',
      })}
      <div style={cellBox(DEFS[9])}>
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-60)',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: src.bg,
            border: `1px solid ${src.border}`,
            ...caption1Strong,
            color: src.fg,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: src.dot, flexShrink: 0 }} />
          {src.label}
        </span>
      </div>
      <div style={cellBox(DEFS[10])}>
        <LinkText onClick={() => s.pickPeriod(p.id)} style={{ ...caption1, color: 'var(--text-link)' }}>
          Open
        </LinkText>
      </div>
    </div>
  )
}

// Year is the only filter, but it lives in a panel so more can join it without
// the toolbar growing a row of chips.
function FilterPanel({ s }: { s: ProfitabilityState }) {
  const draft = s.filterDraft || { year: s.year }
  const options: { label: string; value: number | null }[] = [
    { label: 'All years', value: null },
    { label: '2026', value: 2026 },
    { label: '2025', value: 2025 },
  ]
  return (
    <div
      onClick={() => s.setFilterOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Filters"
        style={{
          boxSizing: 'border-box',
          width: 360,
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ ...subtitle2, flex: 1 }}>Filters</span>
          <CloseX onClick={() => s.setFilterOpen(false)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', padding: '0 var(--size-200)' }}>
          <span style={EYEBROW}>Year</span>
          {options.map((o) => {
            const on = draft.year === o.value
            return (
              <FilterRow
                key={String(o.value)}
                label={o.label}
                on={on}
                onClick={() => s.setFilterDraft({ ...draft, year: o.value })}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-200)' }}>
          <LinkText
            onClick={() => s.setFilterDraft({ year: null })}
            style={{
              ...caption1,
              color: draft.year === null ? 'var(--text-disabled)' : 'var(--text-link)',
              cursor: draft.year === null ? 'default' : 'pointer',
            }}
          >
            Clear all
          </LinkText>
          <div style={{ flex: 1 }} />
          <PanelButton onClick={() => s.setFilterOpen(false)}>Cancel</PanelButton>
          <PanelButton primary onClick={s.applyFilter}>
            Apply
          </PanelButton>
        </div>
      </div>
    </div>
  )
}

function FilterRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        height: 'var(--row-height)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        ...body1,
      }}
      {...hoverProps}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-circle)',
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
          ...caption2Strong,
          flexShrink: 0,
        }}
      >
        {on ? '•' : ''}
      </span>
      {label}
    </div>
  )
}

function PanelButton({
  children,
  onClick,
  primary,
}: {
  children?: ReactNode
  onClick?: () => void
  primary?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...caption1Strong,
        fontSize: 'var(--body-1-size)',
        lineHeight: 'var(--body-1-lh)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function CloseX({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      aria-label="Close"
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 16,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      ×
    </span>
  )
}

export function HistoryTable({ s }: { s: ProfitabilityState }) {
  const q = s.q.trim().toLowerCase()
  const filtered = ALL.filter((p) => {
    if (s.year && p.year !== s.year) return false
    if (!q) return true
    const src = p.projected ? 'projected' : p.prov ? 'provisional' : 'closed'
    return `${p.id} ${p.year} ${fmtRange(p.start)} ${src}${p.restated ? ' restated' : ''}`
      .toLowerCase()
      .includes(q)
  })

  const keyOf = (p: Period) => {
    const d = der(p)
    return (
      { routes: p.routes, rev: p.rev, cost: p.cost, gp: d.gp, margin: d.margin, ppr: d.ppr,
        drv: d.drv, src: p.projected ? 2 : p.prov ? 1 : 0, dates: p.idx }[s.sort.col] ?? p.idx
    )
  }
  const sorted = filtered
    .slice()
    .sort((a, b) => (keyOf(a) - keyOf(b)) * (s.sort.dir === 'asc' ? 1 : -1))

  const heats = {
    rev: rangeOf(filtered.map((p) => p.rev)),
    cost: rangeOf(filtered.map((p) => p.cost)),
    gp: rangeOf(filtered.map((p) => der(p).gp)),
    margin: rangeOf(filtered.map((p) => der(p).margin)),
  }

  // The average deliberately excludes the projected and provisional periods —
  // a baseline built from numbers that are still moving is not a baseline.
  const pool = filtered.filter((p) => p.closed && !p.prov)
  const avg = pool.length
    ? (() => {
        const rev = pool.reduce((a, p) => a + p.rev, 0) / pool.length
        const cost = pool.reduce((a, p) => a + p.cost, 0) / pool.length
        const routes = pool.reduce((a, p) => a + p.routes, 0) / pool.length
        const gp = rev - cost
        const drv = pool.reduce((a, p) => a + (p.sp.dg + p.sp.dt), 0) / pool.length / rev * 100
        return {
          routes: num(Math.round(routes)), rev: money(rev), cost: money(cost), gp: money(gp),
          margin: pct((gp / rev) * 100), ppr: money(gp / routes), drv: pct(drv),
        }
      })()
    : { routes: '—', rev: '—', cost: '—', gp: '—', margin: '—', ppr: '—', drv: '—' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <span style={EYEBROW}>History</span>
      <div
        style={{
          boxSizing: 'border-box',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-100) var(--size-160)', flexWrap: 'wrap' }}>
          <span style={{ ...subtitle2 }}>Period history</span>
          <div style={{ flex: 1 }} />
          <FilterButton active={s.year !== null} onClick={s.openFilter} />
          <div
            data-field=""
            style={{
              boxSizing: 'border-box',
              height: 'var(--control-height)',
              width: 220,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-80)',
              padding: '0 var(--size-100)',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
            }}
          >
            <span style={{ display: 'flex', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <Icon name="SearchGlyph" size={16} />
            </span>
            <input
              value={s.q}
              onChange={(e) => s.setQ(e.target.value)}
              placeholder="Search periods"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-family)',
                ...body1,
                color: 'var(--text-primary)',
                padding: 0,
              }}
            />
            {s.q && (
              <span onClick={() => s.setQ('')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                ×
              </span>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 980 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-120)',
                padding: 'var(--size-100) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderTop: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                ...caption2Strong,
                letterSpacing: '.6px',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
              }}
            >
              {DEFS.map((def) => (
                <HeadCell key={def.k} def={def} sort={s.sort} onSort={s.toggleSort(def.k)} />
              ))}
            </div>

            {sorted.map((p) => (
              <Row key={p.id} p={p} s={s} heats={heats} />
            ))}

            <div
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-120)',
                minHeight: 'var(--row-height)',
                padding: 'var(--size-60) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                ...caption1Strong,
              }}
            >
              <div style={cellBox(DEFS[0])}>Average of {pool.length} closed periods</div>
              <div style={cellBox(DEFS[1])} />
              <div style={cellBox(DEFS[2])}>{avg.routes}</div>
              <div style={cellBox(DEFS[3])}>{avg.rev}</div>
              <div style={cellBox(DEFS[4])}>{avg.cost}</div>
              <div style={cellBox(DEFS[5])}>{avg.gp}</div>
              <div style={cellBox(DEFS[6])}>{avg.margin}</div>
              <div style={cellBox(DEFS[7])}>{avg.ppr}</div>
              <div style={cellBox(DEFS[8])}>{avg.drv}</div>
              <div style={cellBox(DEFS[9])} />
              <div style={cellBox(DEFS[10])} />
            </div>
          </div>
        </div>
      </div>

      {s.filterOpen && <FilterPanel s={s} />}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
}: {
  active: boolean
  onClick: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      title="Filters"
      style={{
        boxSizing: 'border-box',
        width: 32,
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-medium)',
        background: active ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'transparent',
        color: active ? 'var(--blue-700)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--blue-200)' : 'var(--border-default)'}`,
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="FnFilter" size={16} />
    </div>
  )
}
