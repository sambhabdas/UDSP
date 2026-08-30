'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong } from '../../ds/type'
import { MONTHS, NET_SERIES, PREV, UNIT_COLS, UNIT_HEAD, VEHICLES } from './data'
import type { Vehicle } from './data'
import { cell, money, sparkFor, statusTone } from './calc'
import { DotPill, FilterButton, SearchBox, SectionTitle, SortHeadCell } from './parts'
import { CARD, LABEL } from './style'
import type { FleetFinancialsState } from './useFleetFinancials'

/**
 * The dashboard: five totals, a NET-by-month chart, the vans losing money, and
 * the per-van economics the rest of the page exists to feed.
 */
export function Dashboard({ s }: { s: FleetFinancialsState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <Tiles s={s} />
      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--size-120)' }}>
        <NetChart s={s} />
        <Losers s={s} />
      </div>
      <UnitEconomics s={s} />
    </div>
  )
}

function Tiles({ s }: { s: FleetFinancialsState }) {
  const { tot } = s.rollup
  const pct = (cur: number, prev: number) => (!prev ? '0%' : `${Math.abs(Math.round(((cur - prev) / prev) * 100))}%`)
  const prevName = `Vs. ${MONTHS[s.month === 0 ? 11 : s.month - 1]} ${s.month === 0 ? s.year - 1 : s.year}`

  const defs = [
    { label: 'Amazon in', value: money(tot.amz), cur: tot.amz, prev: PREV.amz, good: tot.amz >= PREV.amz },
    { label: 'Lease out', value: money(tot.lease), cur: tot.lease, prev: PREV.lease, good: tot.lease <= PREV.lease },
    { label: 'Insurance out', value: money(tot.ins), cur: tot.ins, prev: PREV.ins, good: tot.ins <= PREV.ins },
    { label: 'Service out-of-pocket', value: money(tot.oop), cur: tot.oop, prev: PREV.oop, good: tot.oop <= PREV.oop, click: () => s.toastMsg('Opening service records') },
    { label: 'NET', value: money(tot.net), cur: tot.net, prev: PREV.net, good: tot.net >= PREV.net, net: true },
  ]

  return (
    <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)' }}>
      {defs.map((t) => (
        <div
          key={t.label}
          role={t.click ? 'button' : undefined}
          tabIndex={t.click ? 0 : undefined}
          onClick={t.click}
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-40)',
            cursor: t.click ? 'pointer' : 'default',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
            <span
              style={{ flex: 1, minWidth: 0, ...caption1Strong, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {t.label}
            </span>
          </div>
          <span
            style={{
              fontSize: 28,
              lineHeight: '36px',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '-0.3px',
              // Only NET goes red, and only when the fleet actually lost money.
              color: t.net && tot.net < 0 ? 'var(--danger-fg)' : 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.value}
          </span>
          <div style={{ marginTop: 'var(--size-80)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
            <span
              style={{
                flexShrink: 0,
                boxSizing: 'border-box',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-60)',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-medium)',
                background: t.good ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${t.good ? 'var(--success-border)' : 'var(--danger-border)'}`,
                color: t.good ? 'var(--success-fg)' : 'var(--danger-fg)',
                ...caption1Strong,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {/* The arrow says which way it moved; the colour says whether that
                  is good, which is the opposite for a cost. */}
              <span style={{ display: 'flex', flexShrink: 0 }}>
                <Icon name={t.cur >= t.prev ? 'FnSortUp' : 'FnSortDown'} size={12} />
              </span>
              {pct(t.cur, t.prev)}
            </span>
            <span style={{ minWidth: 0, ...caption1Strong, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {prevName}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * NET by month, drawn as a zero-line chart: positives grow up from the rule,
 * negatives hang below it, and the plot only reserves the lower half when
 * something in the series is actually negative.
 */
function NetChart({ s }: { s: FleetFinancialsState }) {
  const series = NET_SERIES.map((x) => ({ l: x.l, v: x.v === null ? s.rollup.tot.net : x.v }))
  const maxPos = Math.max(...series.map((x) => Math.max(x.v, 0)), 1)
  const maxNeg = Math.max(...series.map((x) => Math.max(-x.v, 0)), 1)
  const hasNeg = series.some((x) => x.v < 0)

  return (
    <div style={{ ...CARD, padding: 'var(--size-160)', gap: 'var(--size-160)' }}>
      <SectionTitle>NET by Month</SectionTitle>
      <div style={{ height: 170, display: 'flex', alignItems: 'stretch', gap: 'var(--size-200)', padding: '0 var(--size-40)' }}>
        {series.map((x, i) => {
          const on = s.hoverBar === i
          return (
            <div
              key={x.l}
              role="button"
              tabIndex={0}
              onClick={() => s.setHoverBar(on ? null : i)}
              onMouseEnter={() => s.setHoverBar(i)}
              onMouseLeave={() => s.setHoverBar(null)}
              title={`${x.l} · NET ${money(x.v)}`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div style={{ flex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-40)' }}>
                <span style={{ minHeight: 16, ...caption1, color: 'var(--text-secondary)', opacity: on ? 1 : 0, transition: 'opacity 100ms', fontVariantNumeric: 'tabular-nums' }}>
                  {x.v > 0 ? money(x.v) : ''}
                </span>
                <div
                  style={{
                    width: '100%', maxWidth: 56,
                    height: x.v > 0 ? `${Math.round((x.v / maxPos) * 100)}%` : 0,
                    background: x.v > 0 ? 'var(--blue-500)' : 'transparent',
                    border: '1px solid transparent', borderBottom: 'none',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              </div>
              <div style={{ height: 1, background: 'var(--border-default)' }} />
              <div style={{ flex: hasNeg ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-40)' }}>
                <div
                  style={{
                    width: '100%', maxWidth: 56,
                    height: x.v < 0 ? `${Math.round((-x.v / maxNeg) * 100)}%` : 0,
                    background: x.v < 0 ? 'var(--red-500)' : 'transparent',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
                <span style={{ minHeight: 16, ...caption1, color: 'var(--danger-fg)', opacity: on ? 1 : 0, transition: 'opacity 100ms', fontVariantNumeric: 'tabular-nums' }}>
                  {x.v < 0 ? money(x.v) : ''}
                </span>
              </div>
              <span style={{ textAlign: 'center', paddingTop: 'var(--size-60)', ...caption1, color: 'var(--text-primary)' }}>
                {x.l}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Every on-fleet van whose NET is negative, worst first. */
function Losers({ s }: { s: FleetFinancialsState }) {
  const list = VEHICLES.filter((v) => v.status !== 'Off fleet' && s.vanNetOf(v) < 0).sort(
    (a, b) => s.vanNetOf(a) - s.vanNetOf(b),
  )

  return (
    <div style={{ ...CARD, padding: 'var(--size-160)', gap: 'var(--size-120)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <SectionTitle>Vans Losing Money</SectionTitle>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--size-120)',
            padding: 'var(--size-60) var(--size-80)', background: 'var(--surface-subtle)',
            borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
          }}
        >
          <span style={{ width: 88, ...LABEL }}>Van</span>
          <span style={LABEL}>Status</span>
          <span style={{ flex: 1, textAlign: 'right', ...LABEL }}>Money lost</span>
        </div>
        {list.map((v) => (
          <LoserRow key={v.id} v={v} s={s} />
        ))}
      </div>
      {list.length === 0 && (
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>No van lost money this month.</span>
      )}
    </div>
  )
}

function LoserRow({ v, s }: { v: Vehicle; s: FleetFinancialsState }) {
  const [hover, hoverProps] = useHover()
  const t = statusTone(v.status)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { s.setSearch(v.name); s.setSSts({}) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--size-120)',
        minHeight: 44, padding: 'var(--size-60) var(--size-80)',
        borderBottom: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : undefined,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1Strong, width: 88 }}>{v.name}</span>
      <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{v.status}</DotPill>
      <span style={{ flex: 1, textAlign: 'right', ...body1Strong, color: 'var(--danger-fg)', fontVariantNumeric: 'tabular-nums' }}>
        {money(s.vanNetOf(v))}
      </span>
    </div>
  )
}

/** One row per van: what it earned, what it cost, and what is left. */
function UnitEconomics({ s }: { s: FleetFinancialsState }) {
  let rows = VEHICLES.filter(s.match).map((v) => {
    const a = s.amazonOf(v.id)
    const net = s.vanNetOf(v)
    return { v, a, net, inc: s.incompleteOf(v) }
  })
  if (s.stsSel.length) rows = rows.filter((r) => s.sSts[r.v.status])
  if (s.onlyIncomplete) rows = rows.filter((r) => !!r.inc)

  const dir = s.sortDir === 'asc' ? 1 : -1
  const val = (r: (typeof rows)[number]): string | number =>
    ({
      name: r.v.name, status: r.v.status, days: r.v.days, amazon: r.a,
      lease: r.v.lease ?? 0, ins: r.v.ins ?? 0, oop: r.v.oop, net: r.net,
      margin: r.a > 0 ? r.net / r.a : -Infinity, spark: r.net,
    })[s.sortKey] ?? ''
  // Off-fleet vans always sink to the bottom, whatever the sort.
  rows.sort((x, y) => {
    const ox = x.v.status === 'Off fleet' ? 1 : 0
    const oy = y.v.status === 'Off fleet' ? 1 : 0
    if (ox !== oy) return ox - oy
    const a = val(x)
    const b = val(y)
    return (a > b ? 1 : a < b ? -1 : 0) * dir
  })

  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80) var(--size-160)', padding: 'var(--size-160)' }}>
        <SectionTitle>Unit Economics</SectionTitle>
        <div style={{ flex: 1 }} />
        <FilterButton count={s.fpCount} onClick={() => { s.setPf({ sts: { ...s.sSts }, inc: s.onlyIncomplete }); s.setFpOpen(true) }} />
        <SearchBox value={s.search} onChange={s.setSearch} />
      </div>

      <div
        style={{
          display: 'grid', gridTemplateColumns: UNIT_COLS, alignItems: 'center',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
          padding: 'var(--size-100) var(--size-160)',
        }}
      >
        {UNIT_HEAD.map(([k, label, justify]) => (
          <SortHeadCell
            key={k}
            label={label}
            justify={justify}
            active={s.sortKey === k}
            dir={s.sortDir}
            onSort={() => {
              s.setSortDir(s.sortKey === k && s.sortDir === 'asc' ? 'desc' : 'asc')
              s.setSortKey(k)
            }}
          />
        ))}
      </div>

      {rows.map(({ v, a, net }) => {
        const l = cell(s.cells, 'lease', v.id, s.month)
        const i = cell(s.cells, 'ins', v.id, s.month)
        const t = statusTone(v.status)
        const sp = sparkFor(s.cells, v, s.month)
        return (
          <div
            key={v.id}
            style={{
              display: 'grid', gridTemplateColumns: UNIT_COLS, alignItems: 'center',
              minHeight: 48, padding: 'var(--size-60) var(--size-160)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, paddingRight: 'var(--size-80)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ ...body1Strong, color: 'var(--text-primary)' }}>
                  {v.name}
                </a>
                {v.restated && (
                  <span title="Restated Aug 12 · K. Ortiz" style={{ ...caption1, color: 'var(--text-secondary)' }}>
                    Restated
                  </span>
                )}
              </div>
              <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{v.vin}</span>
            </div>

            <div>
              <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{v.status}</DotPill>
            </div>

            <Num color="var(--text-secondary)">{v.days}</Num>
            <Num>{a ? money(a) : '-'}</Num>
            {/* A missing charge reads as a dash in helper grey, not a zero. */}
            <Num color={l === null ? 'var(--text-helper)' : 'var(--text-primary)'}>{l === null ? '-' : money(l)}</Num>
            <Num color={i === null ? 'var(--text-helper)' : 'var(--text-primary)'}>{i === null ? '-' : money(i)}</Num>
            <Num>{money(v.oop)}</Num>
            <Num bold color={net < 0 ? 'var(--danger-fg)' : 'var(--text-primary)'}>{money(net)}</Num>
            <Num color="var(--text-secondary)">{a > 0 ? `${((net / a) * 100).toFixed(1)}%` : '-'}</Num>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 'var(--size-80)' }}>
              <svg viewBox="0 0 100 28" preserveAspectRatio="none" style={{ width: 96, height: 28, overflow: 'visible' }}>
                <title>{`12-mo NET · ${sp.vals}`}</title>
                <polyline
                  points={sp.points}
                  fill="none"
                  stroke={net < 0 ? 'var(--red-500)' : 'var(--blue-500)'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Num({ children, color, bold }: { children: React.ReactNode; color?: string; bold?: boolean }) {
  return (
    <span
      style={{
        textAlign: 'right',
        ...body1,
        fontWeight: bold ? 'var(--weight-semibold)' : undefined,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </span>
  )
}
