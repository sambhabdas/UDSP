'use client'

import { body1, caption1, caption1Strong } from '../../ds/type'
import { BarChart, LineChart, StackChart } from './charts'
import {
  Card, CardFoot, CardHead, DateRange, Dropdown, HeadRow, Legend, MiniButton,
  Row, SearchBox, SortHead, TierChip,
} from './parts'
import { HEAD, NUM, TILE_LABEL } from './style'
import {
  AGING, AGING_MAX, CATEGORIES, FN_WINDOWS, MEDALS, READINESS, RISK_DATA,
  SCORE_OPTIONS, TOP_OPTIONS, WINS, netColor, signed, topOf,
} from './data'
import type { PanelFilters, OverviewState } from './useScorecardOverview'

// ── Header and KPI tiles ────────────────────────────────────────────────────

export function PageHead({ s }: { s: OverviewState }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
      <span style={{ fontSize: 'var(--title-3-size)', lineHeight: 'var(--title-3-lh)', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.2px' }}>
        Performance Overview
      </span>
      <div style={{ flex: 1 }} />
      <Dropdown
        label={`Window · ${s.period}`}
        value={s.period}
        options={WINS}
        open={s.drop === 'window'}
        onToggle={() => s.toggleDrop('window')}
        onPick={(v) => { s.setPeriod(v); s.closeDrop() }}
        width={170}
      />
      {s.period === 'Custom' && (
        <DateRange from={s.winFrom} to={s.winTo} onFrom={s.setWinFrom} onTo={s.setWinTo} width={130} />
      )}
    </div>
  )
}

export function Tiles({ s }: { s: OverviewState }) {
  const d = s.d
  const tiles = [
    { label: 'Fleet Net', value: signed(d.net), color: d.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', click: s.go(`Events · ${s.period}`) },
    { label: 'Events', value: String(d.events), color: 'var(--text-primary)', click: s.go(`Events · ${s.period}`) },
    { label: 'At Risk', value: '4', color: 'var(--danger-fg)', click: s.go('Performance Roster · At risk only') },
    { label: 'Shift Blocked', value: '2', color: 'var(--danger-fg)', click: s.go('Events · Open · Blocked only') },
    { label: 'Completion', value: `${d.completion}%`, color: d.completion >= 80 ? 'var(--success-fg)' : 'var(--warning-fg)', click: s.go('Coaching Library') },
  ]
  return (
    <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-100)' }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          data-fx=""
          tabIndex={0}
          role="button"
          onClick={t.click}
          style={{
            boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)', padding: 'var(--size-120)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--size-40)' }}>
            <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
          </div>
          <span style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>
            {t.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SectionLabel({ children }: { children: string }) {
  return <span style={{ ...HEAD, marginTop: 'var(--size-80)' }}>{children}</span>
}

// ── Scores ──────────────────────────────────────────────────────────────────

/**
 * Deductions to the left of the centre line, bonuses to the right, both scaled
 * to the same axis so the two sides can be compared by eye.
 */
export function CategoryPanel({ s }: { s: OverviewState }) {
  const c = s.categories
  return (
    <Card>
      <CardHead title="Deductions and Bonuses by Category" link={s.go(`Events · ${s.period}`)} linkTitle="Open Events" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
        {c.rows.map((r) => (
          <CategoryRow key={r.label} row={r} onClick={s.go(`Events · ${r.label} · ${s.period}`)} />
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', columnGap: 0 }}>
          <span />
          <div style={{ borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--size-40)' }}>
            <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>-{c.axisMax}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM, transform: 'translateX(50%)' }}>0</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--size-40)' }}>
            <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>+{c.axisMax}</span>
          </div>
        </div>
        <div style={{ paddingTop: 'var(--size-60)' }}>
          <Legend items={[{ label: 'Negative', fill: 'var(--red-500)' }, { label: 'Positive', fill: 'var(--green-600)' }]} />
        </div>
      </div>
      <CardFoot>Deductions -{c.deductions} · Bonuses +{c.bonuses}</CardFoot>
    </Card>
  )
}

function CategoryRow({
  row, onClick,
}: {
  row: { label: string; dedTxt: string; bonTxt: string; dedW: string; bonW: string }
  onClick: () => void
}) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', alignItems: 'center', columnGap: 0, minHeight: 26, borderRadius: 'var(--radius-small)', cursor: 'pointer' }}
    >
      <span style={{ ...body1, paddingRight: 'var(--size-80)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.label}</span>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-60)' }}>
        <span style={{ ...caption1, color: 'var(--danger-fg)', ...NUM }}>{row.dedTxt}</span>
        <div style={{ width: row.dedW, height: 12, background: 'var(--red-500)', borderRadius: '2px 0 0 2px' }} />
      </div>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', borderLeft: '1px solid var(--border-strong)' }}>
        <div style={{ width: row.bonW, height: 12, background: 'var(--green-600)', borderRadius: '0 2px 2px 0' }} />
        <span style={{ ...caption1, color: 'var(--success-fg)', ...NUM }}>{row.bonTxt}</span>
      </div>
    </div>
  )
}

export function TrendPanel({ s }: { s: OverviewState }) {
  const t = s.trend
  return (
    <Card>
      <CardHead
        title={`${s.scoreBy} by Week`}
        controls={
          <>
            <Dropdown
              label={`Score · ${s.scoreBy}`}
              value={s.scoreBy}
              options={SCORE_OPTIONS.map(([label, hint]) => ({ label, hint }))}
              open={s.drop === 'score'}
              onToggle={() => s.toggleDrop('score')}
              onPick={(v) => { s.setScoreBy(v); s.closeDrop() }}
              width={160}
            />
            <Dropdown
              label={`Last · ${s.fnWin}`}
              value={s.fnWin}
              options={FN_WINDOWS}
              open={s.drop === 'fn'}
              onToggle={() => s.toggleDrop('fn')}
              onPick={(v) => { s.setFnWin(v); s.closeDrop() }}
              width={140}
            />
          </>
        }
      />
      <LineChart
        cols={t.cols}
        points={t.points}
        yLabels={[signed(t.yMax), String(t.yMin)]}
        color="var(--blue-500)"
        zeroPct={{ pct: t.zeroPct.toFixed(1), show: t.showZero }}
        onPick={(i) => s.go(`Events · ${t.weeks[i][0]}${s.scoreBy === 'Fleet Net' ? '' : ` · ${s.scoreBy}`}`)()}
      />
      <CardFoot>Average {signed(t.average)} per week</CardFoot>
    </Card>
  )
}

export function WeeklyDeductions({ s }: { s: OverviewState }) {
  const w = s.deductions
  return (
    <Card>
      <CardHead title="Deductions by Category per Week" note="Last 8 weeks" />
      <StackChart
        bars={w.bars}
        yLabels={[`-${w.axisMax}`, `-${w.axisMax / 2}`, '0']}
        legend={[{ label: 'Safety', fill: 'var(--red-500)' }, { label: 'DSB and CDF', fill: 'var(--blue-500)' }, { label: 'Other', fill: 'var(--yellow-500)' }]}
        onPick={(i) => s.go(`Events · ${w.bars[i].label} · Deductions`)()}
      />
      <CardFoot>Total -{w.total} over 8 weeks</CardFoot>
    </Card>
  )
}

export function WeeklyBonuses({ s }: { s: OverviewState }) {
  const b = s.bonuses
  return (
    <Card>
      <CardHead title="Bonuses by Category per Week" note="Last 8 weeks" />
      <StackChart bars={b.bars} yLabels={[`+${b.axMax}`, `+${b.axMax / 2}`, '0']} legend={b.legend} />
      <CardFoot>Total +{s.totals.bonuses} over 8 weeks</CardFoot>
    </Card>
  )
}

export function EventSources({ s }: { s: OverviewState }) {
  const r = s.sources
  const [imports, manual] = s.totals.sources
  return (
    <Card>
      <CardHead title="Events by Source per Week" note="Last 8 weeks" />
      <StackChart bars={r.bars} yLabels={[String(r.axMax), String(r.axMax / 2), '0']} legend={r.legend} />
      <CardFoot>Imports {imports} · Manual {manual}</CardFoot>
    </Card>
  )
}

export function TierDistribution({ s }: { s: OverviewState }) {
  const t = s.tiers
  return (
    <Card>
      <CardHead title="Tier Distribution" note="All time" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
        <div style={{ display: 'flex', height: 28, borderRadius: 'var(--radius-small)', overflow: 'hidden', marginTop: 'var(--size-60)' }}>
          {t.segs.map((d) => (
            <div
              key={d.tier}
              data-fx=""
              tabIndex={0}
              role="button"
              onClick={s.go(`Performance Roster · Tier ${d.tier}`)}
              title={d.title}
              style={{ width: d.w, display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.fill, cursor: 'pointer' }}
            >
              <span style={{ ...caption1Strong, color: 'var(--text-inverse)', whiteSpace: 'nowrap', overflow: 'hidden' }}>{d.label}</span>
            </div>
          ))}
        </div>
        <Legend items={t.legend} />
      </div>
      <CardFoot>{t.total} active associates</CardFoot>
    </Card>
  )
}

// ── People ──────────────────────────────────────────────────────────────────

/** The four filter controls a people panel carries, in their fixed order. */
function PanelControls({
  s, id, f, set, catWidth = 140, searchWidth = 150, allTime,
}: {
  s: OverviewState
  id: string
  f: PanelFilters
  set: (f: PanelFilters) => void
  catWidth?: number
  searchWidth?: number
  allTime?: boolean
}) {
  return (
    <>
      <Dropdown
        label={`Score · ${f.cat}`}
        value={f.cat}
        options={CATEGORIES}
        open={s.drop === `${id}Cat`}
        onToggle={() => s.toggleDrop(`${id}Cat`)}
        onPick={(v) => { set({ ...f, cat: v }); s.closeDrop() }}
        width={catWidth}
      />
      <Dropdown
        label={`Window · ${f.win}`}
        value={f.win}
        options={allTime ? ['All time', ...WINS] : WINS}
        open={s.drop === `${id}Win`}
        onToggle={() => s.toggleDrop(`${id}Win`)}
        onPick={(v) => { set({ ...f, win: v }); s.closeDrop() }}
        width={130}
      />
      {f.win === 'Custom' && (
        <DateRange from={f.from} to={f.to} onFrom={(v) => set({ ...f, from: v })} onTo={(v) => set({ ...f, to: v })} width={110} />
      )}
      <Dropdown
        label={f.top}
        value={f.top}
        options={TOP_OPTIONS}
        open={s.drop === `${id}Top`}
        onToggle={() => s.toggleDrop(`${id}Top`)}
        onPick={(v) => { set({ ...f, top: v }); s.closeDrop() }}
        width={100}
      />
      <SearchBox value={f.q} onChange={(v) => set({ ...f, q: v })} width={searchWidth} />
    </>
  )
}

const RISK_COLS = '1fr 90px 120px 110px'

export function AtRisk({ s }: { s: OverviewState }) {
  const f = s.risk
  const q = f.q.trim().toLowerCase()
  const dir = s.riskSort.d === 'asc' ? 1 : -1
  const rows = RISK_DATA
    .filter((r) => !q || r.name.toLowerCase().includes(q))
    .slice(0, q ? Infinity : topOf(f.top))
    .slice()
    .sort((a, b) => {
      const key = s.riskSort.k
      const va = key === 'name' ? a.name : key === 'blocked' ? (a.blocked ? 0 : 1) : a.net
      const vb = key === 'name' ? b.name : key === 'blocked' ? (b.blocked ? 0 : 1) : b.net
      return (va > vb ? 1 : va < vb ? -1 : 0) * dir
    })

  const heads: [typeof s.riskSort.k, string, string][] = [
    ['name', 'Associate', 'flex-start'],
    ['net', 'Net', 'flex-end'],
    ['tier', 'Tier', 'flex-start'],
    ['blocked', 'Blocked', 'flex-start'],
  ]

  return (
    <Card>
      <CardHead
        title="At Risk"
        link={s.go('Performance Roster · At risk only')}
        linkTitle="Open Performance Roster"
        wrap
        controls={<PanelControls s={s} id="rk" f={f} set={s.setRisk} searchWidth={160} />}
      />
      <HeadRow cols={RISK_COLS}>
        {heads.map(([k, label, justify]) => (
          <SortHead
            key={k}
            label={label}
            justify={justify}
            active={s.riskSort.k === k}
            dir={s.riskSort.d}
            onClick={() => s.sortRisk(k)}
          />
        ))}
      </HeadRow>
      <div style={{ height: 220, overflow: 'auto' }}>
        {rows.map((r) => (
          <Row key={r.name} cols={RISK_COLS} onClick={s.go(`${r.name} · Associate record`)}>
            <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{r.name}</span>
            <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--danger-fg)', ...NUM }}>{signed(r.net)}</span>
            <span><TierChip tier={r.tier} /></span>
            <span>
              {r.blocked ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: 'var(--danger-bg)', color: 'var(--danger-fg)', ...caption1Strong, whiteSpace: 'nowrap' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger-accent)' }} />
                  Blocked
                </span>
              ) : (
                <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>
              )}
            </span>
          </Row>
        ))}
      </div>
    </Card>
  )
}

const BOARD_COLS = '52px 1fr 90px 120px 90px'

export function Leaderboard({ s }: { s: OverviewState }) {
  const f = s.board
  const q = f.q.trim().toLowerCase()
  const rows = s.ranked
    .map((r, i) => ({ ...r, i }))
    .filter((r) => (q ? r.name.toLowerCase().includes(q) : r.i < topOf(f.top)))

  return (
    <Card>
      <CardHead
        title="Leaderboard"
        wrap
        controls={<PanelControls s={s} id="lb" f={f} set={s.setBoard} allTime searchWidth={180} />}
      />
      <HeadRow cols={BOARD_COLS}>
        <span style={HEAD}>Rank</span>
        <span style={HEAD}>Associate</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Net</span>
        <span style={HEAD}>Tier</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Readiness</span>
      </HeadRow>
      <div style={{ height: 220, overflow: 'auto' }}>
        {rows.map((r) => {
          const ready = READINESS[r.name] ?? ''
          return (
            <Row key={r.name} cols={BOARD_COLS} onClick={s.go(`${r.name} · Associate record${r.i < 3 ? ' · Performance' : ''}`)}>
              <span style={{ fontSize: 16, lineHeight: 'var(--body-1-lh)', color: 'var(--text-secondary)', ...NUM }}>
                {r.i < 3 ? MEDALS[r.i] : String(r.i + 1)}
              </span>
              <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{r.name}</span>
              <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: netColor(r.net), ...NUM }}>{signed(r.net)}</span>
              <span><TierChip tier={r.tier} /></span>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {ready ? (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)',
                      borderRadius: 'var(--radius-medium)',
                      background: ready === '4/4' ? 'var(--success-bg)' : 'var(--surface-subtle)',
                      color: ready === '4/4' ? 'var(--success-fg)' : 'var(--text-secondary)',
                      ...caption1Strong, ...NUM,
                    }}
                  >
                    {ready}
                  </span>
                ) : (
                  <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>
                )}
              </span>
            </Row>
          )
        })}
      </div>
    </Card>
  )
}

const MOVE_COLS = '1fr 120px 90px 110px'
const DECLINE_COLS = '1fr 120px 90px 130px'

/** Kudos and Biggest Declines are the same table read in opposite directions. */
function MovementPanel({
  s, title, id, f, set, rows, cols, deltaLabel, deltaColor, deltaSign, actionLabel, action,
}: {
  s: OverviewState
  title: string
  id: string
  f: PanelFilters
  set: (f: PanelFilters) => void
  rows: { name: string; net: number; d: number }[]
  cols: string
  deltaLabel: string
  deltaColor: string
  deltaSign: string
  actionLabel: string
  action: (name: string) => string
}) {
  const q = f.q.trim().toLowerCase()
  const shown = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows.slice(0, topOf(f.top))
  return (
    <Card>
      <CardHead title={title} wrap controls={<PanelControls s={s} id={id} f={f} set={set} catWidth={150} />} />
      <HeadRow cols={cols}>
        <span style={HEAD}>Associate</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>{deltaLabel}</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Net</span>
        <span style={{ ...HEAD, textAlign: 'center' }}>Actions</span>
      </HeadRow>
      <div style={{ height: 220, overflow: 'auto' }}>
        {shown.map((r) => (
          <Row key={r.name} cols={cols}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); s.toastMsg(`Opening ${r.name} · Associate record`) }}
              style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {r.name}
            </a>
            <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: deltaColor, ...NUM }}>{deltaSign}{r.d}</span>
            <span style={{ textAlign: 'right', ...body1, color: netColor(r.net), ...NUM }}>{signed(r.net)}</span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MiniButton onClick={() => s.toastMsg(`Opening ${action(r.name)}`)}>{actionLabel}</MiniButton>
            </div>
          </Row>
        ))}
      </div>
    </Card>
  )
}

export function Kudos({ s }: { s: OverviewState }) {
  return (
    <MovementPanel
      s={s}
      title="Kudos"
      id="kd"
      f={s.kudos}
      set={s.setKudos}
      rows={s.kudosRows}
      cols={MOVE_COLS}
      deltaLabel="Improvement"
      deltaColor="var(--success-fg)"
      deltaSign="+"
      actionLabel="Give Kudo"
      action={(n) => `Give Kudo · ${n}`}
    />
  )
}

export function Declines({ s }: { s: OverviewState }) {
  return (
    <MovementPanel
      s={s}
      title="Biggest Declines"
      id="md"
      f={s.decline}
      set={s.setDecline}
      rows={s.declineRows}
      cols={DECLINE_COLS}
      deltaLabel="Decline"
      deltaColor="var(--danger-fg)"
      deltaSign="-"
      actionLabel="Assign Coaching"
      action={(n) => `Assign Coaching · ${n}`}
    />
  )
}

// ── Coaching ────────────────────────────────────────────────────────────────

export function AutomationHealth({ s }: { s: OverviewState }) {
  const d = s.d
  const pct = Math.round(d.completed / d.created * 100)
  const rows = [
    { label: 'Coaching created', value: String(d.created), color: 'var(--text-primary)', to: 'Coaching Library' },
    { label: 'Completed', value: String(d.completed), color: 'var(--text-primary)', to: 'Coaching Library' },
    { label: 'Completion', value: `${pct}%`, color: pct >= 80 ? 'var(--success-fg)' : 'var(--warning-fg)', to: 'Coaching Library' },
    { label: 'Open', value: '12', color: 'var(--text-primary)', to: 'Events · Open' },
    { label: 'Overdue', value: '4', color: 'var(--danger-fg)', to: 'Events · Open · Overdue' },
    { label: 'Repeat within 30 days', value: '9%', color: 'var(--warning-fg)', to: 'Events · Completed · Repeats only' },
    { label: 'Coaching paused - video unavailable', value: '1 module', color: 'var(--warning-fg)', to: 'Coaching Library · Videos · Replace the video' },
  ]
  return (
    <Card>
      <CardHead title="Automation Health" link={s.go('Events · Open')} linkTitle="Open Events" />
      <HeadRow cols="1fr 140px">
        <span style={HEAD}>Metric</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Value</span>
      </HeadRow>
      {rows.map((r) => (
        <Row key={r.label} cols="1fr 140px" onClick={s.go(r.to)}>
          <span style={body1}>{r.label}</span>
          <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: r.color, ...NUM }}>{r.value}</span>
        </Row>
      ))}
    </Card>
  )
}

export function CompletionByWeek({ s }: { s: OverviewState }) {
  return (
    <Card>
      <CardHead title="Completion by Week" note="Last 8 weeks · Target 80%" />
      <LineChart
        cols={s.completion.cols}
        points={s.completion.points}
        yLabels={['100%', '50%', '0']}
        color="var(--green-600)"
        refPct="20"
        minHeight={110}
      />
      <CardFoot>Average {s.totals.completionAvg}% · Target 80%</CardFoot>
    </Card>
  )
}

export function CoachingAging() {
  const bars = AGING.map(([label, value, fill]) => ({
    label,
    value: String(value),
    h: `${(value / AGING_MAX * 100).toFixed(1)}%`,
    fill,
    title: `${label} · ${value}`,
  }))
  const total = AGING.reduce((a, b) => a + b[1], 0)
  return (
    <Card>
      <CardHead title="Open Coaching Aging" note="Now" />
      <BarChart bars={bars} yLabels={[String(AGING_MAX), String(AGING_MAX / 2), '0']} />
      <CardFoot>{total} Open Coaching Assignments</CardFoot>
    </Card>
  )
}

export function TimeToComplete({ s }: { s: OverviewState }) {
  return (
    <Card>
      <CardHead title="Average Time to Complete by Week" note="Last 8 weeks · Days" />
      <LineChart
        cols={s.timeToClose.cols}
        points={s.timeToClose.points}
        yLabels={['5', '2.5', '0']}
        color="var(--blue-500)"
        minHeight={110}
      />
      <CardFoot>Average {s.totals.timeAvg} days</CardFoot>
    </Card>
  )
}
