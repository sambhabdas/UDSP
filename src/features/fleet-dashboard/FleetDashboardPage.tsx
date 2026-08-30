'use client'

import { body1, body1Strong, caption1Strong, title3 } from '../../ds/type'
import { Icon } from '../../ds/icons/Icon'
import {
  FLEET_TILES,
  KINDS,
  PERIODS,
  QUEUE,
  categoryTone,
  money,
  severityTone,
} from './data'
import { TrendChart, UtilChart } from './charts'
import {
  DataRow,
  DeltaBadge,
  DotPill,
  EmptyLine,
  PeriodPicker,
  Pill,
  SearchBox,
  SectionTitle,
  SortHead,
  Tile,
  Toast,
} from './parts'
import { CARD } from './style'
import { useFleetDashboard } from './useFleetDashboard'
import type {
  FleetDashboardState,
  IdleSortKey,
  LemonSortKey,
  QueueSortKey,
} from './useFleetDashboard'
import type { HeadDef } from './parts'

const IDLE_COLS = 'minmax(90px,1fr) 130px 130px 130px'
const LEMON_COLS = 'minmax(64px,1fr) 100px 78px 82px 100px'
const QUEUE_COLS = '110px 120px 110px 1fr 200px'

/**
 * Fleet Dashboard: where the vans are, what they cost, and which ones want
 * something done about them.
 *
 * The period picker at the top scopes utilization and the idle list. Spend has
 * a picker of its own, because you often want the fleet's this-week shape next
 * to last month's money — choosing a page period resets it back in step.
 */
export function FleetDashboardPage() {
  const s = useFleetDashboard()

  return (
    <div
      data-screen-label="Fleet Dashboard"
      onClick={s.closeMenus}
      style={{
        boxSizing: 'border-box',
        // The design file writes calc(100vh - header) because it mounts under a
        // fixed header; here the shell has already taken the header out.
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div
          data-rsp-minw0=""
          data-rsp-page=""
          style={{
            boxSizing: 'border-box',
            minWidth: 1120,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-120)',
            padding: 'var(--size-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
            <div style={{ flex: 1 }} />
            <PeriodPicker
              label={s.period}
              open={s.periodOpen}
              items={PERIODS}
              current={s.period}
              onToggle={(e) => {
                e.stopPropagation()
                s.setPeriodOpen(!s.periodOpen)
                s.setSpendPeriodOpen(false)
              }}
              onPick={(e, p) => {
                e.stopPropagation()
                s.setPeriod(p)
                s.setPeriodOpen(false)
                // Choosing a page period puts spend back in step with it.
                s.setSpendPeriod(null)
              }}
            />
          </div>

          <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)' }}>
            {FLEET_TILES.map((t) => (
              <Tile
                key={t.label}
                label={t.label}
                value={t.value}
                color={t.color}
                size={28}
                dim={t.dim}
                onClick={() => s.toastMsg(`Opening Vehicles · ${t.label.replace('On fleet total', 'On fleet')}`)}
              />
            ))}
          </div>

          <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-120)', alignItems: 'stretch' }}>
            <UtilizationCard s={s} />
            <IdleCard s={s} />
          </div>

          <SpendCard s={s} />
          <QueueCard s={s} />
        </div>
      </div>

      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

function UtilizationCard({ s }: { s: FleetDashboardState }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
        <SectionTitle>Utilization</SectionTitle>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-120)',
          padding: '0 var(--size-160) var(--size-160) var(--size-160)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
          <span style={{ ...title3, letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
            {s.uScope.hero ?? `${s.uAvg}%`}
          </span>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>{s.uScope.sub ?? 'average on route'}</span>
          <div style={{ flex: 1 }} />
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>{s.uScope.right ?? ''}</span>
        </div>
        <UtilChart s={s} />
      </div>
    </div>
  )
}

const IDLE_HEAD: HeadDef<IdleSortKey>[] = [
  { label: 'Van', key: 'van' },
  { label: 'Status', key: 'status' },
  { label: 'Last ran', key: 'last' },
  { label: 'Idle', key: 'idle', justify: 'flex-end' },
]

function IdleCard({ s }: { s: FleetDashboardState }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
        <SectionTitle>Idle Vans</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.idleQ} onChange={s.setIdleQ} width={180} />
      </div>
      <SortHead
        topBorder
        defs={IDLE_HEAD}
        sort={s.idleSort}
        onSort={s.setIdleSort}
        cols={IDLE_COLS}
        columnGap="var(--size-100)"
      />
      {s.idleRows.map((r) => (
        <DataRow
          key={r.van}
          cols={IDLE_COLS}
          columnGap="var(--size-100)"
          onClick={() => s.toastMsg(`Opening ${r.van} · Overview`)}
        >
          <span style={body1Strong}>{r.van}</span>
          <span>
            <DotPill bg="var(--success-bg)" fg="var(--success-fg)" dot="var(--success-accent)">
              {r.status}
            </DotPill>
          </span>
          <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.lastRan}</span>
          <span
            style={{
              textAlign: 'right',
              ...body1Strong,
              color: r.idleColor,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {r.idle}
          </span>
        </DataRow>
      ))}
      {s.idleRows.length === 0 && (
        <EmptyLine>
          {s.idleQ.trim() ? 'No vans match.' : 'Every in-service van ran in this period.'}
        </EmptyLine>
      )}
    </div>
  )
}

const LEMON_HEAD: HeadDef<LemonSortKey>[] = [
  { label: 'Van', key: 'van' },
  { label: 'Out of pocket', key: 'oop', justify: 'flex-end' },
  { label: 'Vs median', key: 'x', justify: 'flex-end' },
  { label: 'Total', key: 'gross', justify: 'flex-end' },
  { label: 'Top category', key: 'top', justify: 'flex-end' },
]

function SpendCard({ s }: { s: FleetDashboardState }) {
  const tiles = [
    { label: 'Total service spend', value: money(s.curGross), d: s.dG, color: 'var(--text-primary)', scope: '' },
    { label: 'Out of pocket', value: money(s.curOop), d: s.dO, color: 'var(--danger-fg)', scope: ' · Paid by Out of pocket' },
    { label: 'Reimbursed', value: money(s.curRe), d: null, color: 'var(--success-fg)', scope: ' · reimbursed payers' },
    { label: 'Median cost per serviced van', value: s.med === null ? '-' : money(s.med), d: null, color: 'var(--text-primary)', scope: '' },
  ]

  return (
    <div
      style={{
        ...CARD,
        padding: 'var(--size-160)',
        gap: 'var(--size-120)',
        overflow: 'visible',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)' }}>
        <SectionTitle>Spend</SectionTitle>
        <div style={{ flex: 1 }} />
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            s.toastMsg('Opening Fleet Financials')
          }}
          style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--control-height)', ...body1 }}
        >
          Fleet Financials
        </a>
        <PeriodPicker
          label={s.scopeKey}
          open={s.spendPeriodOpen}
          items={PERIODS}
          current={s.scopeKey}
          onToggle={(e) => {
            e.stopPropagation()
            s.setSpendPeriodOpen(!s.spendPeriodOpen)
            s.setPeriodOpen(false)
          }}
          onPick={(e, p) => {
            e.stopPropagation()
            s.setSpendPeriod(p)
            s.setSpendPeriodOpen(false)
          }}
        />
      </div>

      <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <Tile
            key={t.label}
            label={t.label}
            value={t.value}
            color={t.color}
            size={24}
            onClick={() => s.toastMsg(`Opening Service Records · ${s.scopeKey}${t.scope}`)}
          >
            <div style={{ marginTop: 'var(--size-60)', minHeight: 20, display: 'flex', alignItems: 'center' }}>
              {/* Spending less than last period is the good direction. */}
              {t.d !== null && s.badge(t.d) && <DeltaBadge text={s.badge(t.d)} good={t.d <= 0} />}
            </div>
          </Tile>
        ))}
      </div>

      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-100) var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
            <span style={body1Strong}>Spend by Month · Last 6 Months</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: 'var(--size-160)' }}>
            <TrendChart s={s} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-80) var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
            <span style={body1Strong}>Lemon Watch · Last 90 Days</span>
            <div style={{ flex: 1 }} />
            <SearchBox value={s.lemonQ} onChange={s.setLemonQ} width={170} />
          </div>
          <SortHead
            defs={LEMON_HEAD}
            sort={s.lemonSort}
            onSort={s.setLemonSort}
            cols={LEMON_COLS}
            columnGap="var(--size-80)"
          />
          {s.lemonRows.map((l) => {
            const t = categoryTone(l.top)
            return (
              <DataRow
                key={l.van}
                cols={LEMON_COLS}
                columnGap="var(--size-80)"
                onClick={() => s.toastMsg(`Opening ${l.van} · Service Records · Last 90 days`)}
              >
                <span style={body1Strong}>{l.van}</span>
                <span style={{ textAlign: 'right', ...body1Strong, color: 'var(--danger-fg)', fontVariantNumeric: 'tabular-nums' }}>
                  {money(l.oop)}
                </span>
                <span style={{ textAlign: 'right', ...body1, color: 'var(--danger-fg)', fontVariantNumeric: 'tabular-nums' }}>
                  {l.x.toFixed(1)}x
                </span>
                <span style={{ textAlign: 'right', ...body1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {money(l.gross)}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <Pill bg={t.bg} fg={t.fg}>{l.top}</Pill>
                </span>
              </DataRow>
            )
          })}
          {s.lemonRows.length === 0 && <EmptyLine>No vans match.</EmptyLine>}
        </div>
      </div>
    </div>
  )
}

const QUEUE_HEAD: HeadDef<QueueSortKey>[] = [
  { label: 'Severity', key: 'sev' },
  { label: 'Kind', key: 'kind' },
  { label: 'Van', key: 'van' },
  { label: 'Fact' },
  { label: 'Open', justify: 'flex-end' },
]

function QueueCard({ s }: { s: FleetDashboardState }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Needs Attention</SectionTitle>
        {/* The badge counts everything, not what the filters left. */}
        <Pill bg="var(--danger-bg)" fg="var(--danger-fg)">{QUEUE.length}</Pill>
        <div style={{ flex: 1 }} />
        {KINDS.map((k) => {
          const on = s.qKind === k
          return (
            <div
              key={k}
              role="button"
              tabIndex={0}
              onClick={() => s.setQKind(k)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 'var(--control-height)',
                padding: '0 var(--size-120)',
                borderRadius: 'var(--radius-medium)',
                background: on ? 'var(--blue-100)' : 'var(--surface-card)',
                border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
                color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
                ...caption1Strong,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {k}
            </div>
          )
        })}
        <SearchBoxWide value={s.qQ} onChange={s.setQQ} />
      </div>
      <SortHead
        topBorder
        defs={QUEUE_HEAD}
        sort={s.qSort}
        onSort={s.setQSort}
        cols={QUEUE_COLS}
        columnGap=""
      />
      {s.queueRows.map((r, i) => {
        const t = severityTone(r.sev)
        return (
          <DataRow key={`${r.van}-${r.kind}-${i}`} cols={QUEUE_COLS}>
            <span>
              <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{r.sev}</DotPill>
            </span>
            <span>
              <Pill bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)">
                {r.kind}
              </Pill>
            </span>
            <span style={body1Strong}>{r.van}</span>
            <span style={{ ...body1, color: r.factColor, paddingRight: 'var(--size-80)' }}>{r.fact}</span>
            <span style={{ textAlign: 'right' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  s.toastMsg(`Opening ${r.van} · ${r.link}`)
                }}
                style={body1}
              >
                {r.link}
              </a>
            </span>
          </DataRow>
        )
      })}
      {s.queueRows.length === 0 && (
        <span style={{ padding: 'var(--size-160)', ...body1, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
          No rows match.
        </span>
      )}
    </div>
  )
}

/** The queue's search takes a fact as well as a van, so it is wider. */
function SearchBoxWide({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      data-search=""
      data-keep-icon=""
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 220,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search van or fact"
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}
