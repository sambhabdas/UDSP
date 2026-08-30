import type { CSSProperties, ReactNode } from 'react'
import type { LegendItem } from '../../../ds/charts/ChartKit'
import type { ProjectionState } from '../useProfitProjection'
import { caption1Strong, caption2Strong } from '../../../ds/type'
import {
  Axis,
  ChartCard,
  Column,
  ColumnLabels,
  Plot,
  PlotLine,
  ReferenceRule,
  StackedBar,
  Tooltip,
} from '../../../ds/charts/ChartKit'
import { AXIS, BREAK_EVEN, DAYS } from '../data'
import {
  colLeft,
  costOf,
  cprOf,
  cprY,
  marginOf,
  money,
  money0,
  num,
  pct,
  regularVsOt,
  revOf,
  statusOf,
  workforceOf,
} from '../calc'

// Every week chart draws the same seven days against the same tooltip state.
interface WeekChartProps {
  locked: Record<number, boolean>
  tip: ProjectionState['tip']
  setTip: ProjectionState['setTip']
  onPickDay: (i: number) => void
}

const H = 232
const H_SMALL = 196

// A projected day is drawn as a dashed outline rather than a solid fill — the
// second channel that keeps "not actual yet" from being colour-only.
const projectedBar = (
  value: number,
  ceiling: number,
  solid: string,
  projected: boolean,
): CSSProperties => ({
  height: `${((value / ceiling) * 100).toFixed(1)}%`,
  background: projected ? 'transparent' : solid,
  border: projected ? `1.5px dashed ${solid}` : 'none',
  boxSizing: 'border-box',
  borderRadius: '2px 2px 0 0',
  width: 14,
})

export function DailyPL({ locked, tip, setTip, onPickDay }: WeekChartProps) {
  const margins = DAYS.map((_, i) => marginOf(i))
  const best = Math.max(...margins)
  const active = tip && tip.chart === 'c1' ? tip.i : null

  return (
    <ChartCard
      title="Daily P&L"
      legend={[
        { label: 'Revenue', color: 'var(--blue-500)' },
        { label: 'Cost', color: 'var(--neutral-400)' },
        { label: 'Profit', color: 'var(--green-500)' },
        { label: 'Projected', color: 'var(--text-disabled)', dashed: true },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$13k', '$6.5k', '$0']} height={H} />
        <Plot height={H}>
          {DAYS.map((d, i) => {
            const proj = statusOf(i, locked) === 'projected'
            return (
              <Column
                key={d.l}
                style={{ gap: 3 }}
                onEnter={() => setTip({ chart: 'c1', i })}
                onLeave={() => setTip(null)}
                onClick={() => onPickDay(i)}
              >
                <div style={projectedBar(revOf(i), AXIS.dailyPL, 'var(--blue-500)', proj)} />
                <div style={projectedBar(costOf(i), AXIS.dailyPL, 'var(--neutral-400)', proj)} />
                <div style={projectedBar(revOf(i) - costOf(i), AXIS.dailyPL, 'var(--green-500)', proj)} />
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active)}
              minWidth={190}
              title={DAYS[active].full + (statusOf(active, locked) === 'projected' ? ' · projected' : '')}
              rows={[
                { sw: 'var(--blue-500)', label: 'Revenue', val: money(revOf(active)) },
                { sw: 'var(--neutral-400)', label: 'Cost', val: money(costOf(active)) },
                { sw: 'var(--green-500)', label: 'Profit', val: money(revOf(active) - costOf(active)) },
                { sw: 'var(--neutral-900)', label: 'Margin', val: pct(margins[active]) },
              ]}
            />
          )}
        </Plot>
      </div>
      <ColumnLabels
        cols={DAYS.map((d, i) => ({ d, i }))}
        render={({ d, i }) => (
          <>
            <span style={{ ...caption1Strong, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {d.l + (statusOf(i, locked) === 'projected' ? ' · projected' : '')}
            </span>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: margins[i] === best ? 'var(--success-fg)' : 'var(--text-helper)',
                whiteSpace: 'nowrap',
              }}
            >
              {pct(margins[i])}
            </span>
          </>
        )}
      />
    </ChartCard>
  )
}

export function CostPerRoute({ tip, setTip, onPickDay }: Omit<WeekChartProps, 'locked'>) {
  const vals = DAYS.map((_, i) => cprOf(i))
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const active = tip && tip.chart === 'cpr' ? tip.i : null

  return (
    <ChartCard
      title="Cost per route"
      legend={[{ label: `Break-even ${money(BREAK_EVEN)}`, color: 'var(--success-accent)', rule: true }]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$320', '$290', '$260']} height={H_SMALL} />
        <Plot height={H_SMALL} rules={<ReferenceRule top={`${cprY(BREAK_EVEN).toFixed(1)}%`} />}>
          {DAYS.map((d, i) => {
            const v = vals[i]
            const best = v === lo
            const worst = v === hi
            const bottom = `${(100 - cprY(v)).toFixed(1)}%`
            return (
              <Column
                key={d.l}
                onEnter={() => setTip({ chart: 'cpr', i })}
                onLeave={() => setTip(null)}
                onClick={() => onPickDay(i)}
                style={{ alignItems: 'stretch' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom,
                    width: 8,
                    height: 8,
                    marginLeft: -4,
                    marginBottom: -4,
                    borderRadius: 'var(--radius-circle)',
                    background: best ? 'var(--success-accent)' : worst ? 'var(--warning-accent)' : 'var(--surface-card)',
                    border: `1.5px solid ${best ? 'var(--success-accent)' : worst ? 'var(--warning-accent)' : 'var(--blue-500)'}`,
                    boxSizing: 'border-box',
                  }}
                />
                {/* Only the best and worst days are labelled — never a number
                    on every point. */}
                {(best || worst) && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: `calc(${bottom} + 8px)`,
                      transform: 'translateX(-50%)',
                      ...caption2Strong,
                      color: best ? 'var(--success-fg)' : 'var(--warning-fg)',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {money(v)}
                  </span>
                )}
              </Column>
            )
          })}
          <PlotLine points={DAYS.map((_, i) => [((i + 0.5) / 7) * 100, cprY(vals[i])])} color="var(--blue-500)" />
          {active !== null && (
            <Tooltip
              left={colLeft(active)}
              title={DAYS[active].full}
              text={`${money(vals[active])} per route · ${DAYS[active].routes} routes`}
            />
          )}
        </Plot>
      </div>
      <ColumnLabels
        cols={DAYS}
        render={(d) => (
          <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.l}</span>
        )}
      />
    </ChartCard>
  )
}

export function PerRouteEconomics({ locked, tip, setTip, onPickDay }: WeekChartProps) {
  const active = tip && tip.chart === 'pr' ? tip.i : null
  return (
    <ChartCard
      title="Per-route economics"
      legend={[
        { label: 'Cost / route', color: 'var(--neutral-400)' },
        { label: 'Profit / route', color: 'var(--green-500)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$400', '$200', '$0']} height={H_SMALL} />
        <Plot height={H_SMALL}>
          {DAYS.map((d, i) => {
            const proj = statusOf(i, locked) === 'projected'
            const rpr = revOf(i) / d.routes
            const cpr = cprOf(i)
            return (
              <Column
                key={d.l}
                onEnter={() => setTip({ chart: 'pr', i })}
                onLeave={() => setTip(null)}
                onClick={() => onPickDay(i)}
              >
                <StackedBar
                  width={24}
                  height={`${((rpr / AXIS.perRoute) * 100).toFixed(1)}%`}
                  opacity={proj ? 0.55 : 1}
                  segments={[
                    { f: cpr, bg: 'var(--neutral-400)' },
                    { f: rpr - cpr, bg: 'var(--green-500)' },
                  ]}
                />
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active)}
              minWidth={190}
              title={DAYS[active].full + (statusOf(active, locked) === 'projected' ? ' · projected' : '')}
              rows={[
                { sw: 'var(--blue-500)', label: 'Revenue / route', val: money(revOf(active) / DAYS[active].routes) },
                { sw: 'var(--neutral-400)', label: 'Cost / route', val: money(cprOf(active)) },
                { sw: 'var(--green-500)', label: 'Profit / route', val: money(revOf(active) / DAYS[active].routes - cprOf(active)) },
              ]}
            />
          )}
        </Plot>
      </div>
      <ColumnLabels
        cols={DAYS.map((d, i) => ({ d, i }))}
        render={({ d, i }) => (
          <>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.l}</span>
            <span
              style={{
                ...caption1Strong,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {money0(revOf(i) / DAYS[i].routes)}
            </span>
          </>
        )}
      />
    </ChartCard>
  )
}

// Hours and cost sit side by side per day, each against its own axis — see the
// note in the README about this pairing.
function PairedChart({
  title,
  legend,
  leftTicks,
  rightTicks,
  cols,
  tipNode,
  labels,
}: {
  title: string
  legend: LegendItem[]
  leftTicks: string[]
  rightTicks: string[]
  cols: ReactNode
  tipNode: ReactNode
  labels: ReactNode
}) {
  return (
    <ChartCard title={title} legend={legend}>
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={leftTicks} height={H_SMALL} />
        <Plot height={H_SMALL}>
          {cols}
          {tipNode}
        </Plot>
        <Axis ticks={rightTicks} height={H_SMALL} align="left" width={34} />
      </div>
      {labels}
    </ChartCard>
  )
}

export function RegularVsOvertime({ locked, tip, setTip, onPickDay }: WeekChartProps) {
  const active = tip && tip.chart === 'ro' ? tip.i : null
  const data = DAYS.map((_, i) => regularVsOt(i))
  return (
    <PairedChart
      title="Regular vs overtime"
      legend={[
        { label: 'Regular hours', color: 'var(--blue-500)' },
        { label: 'OT hours', color: 'var(--yellow-500)' },
        { label: 'Regular cost', color: 'var(--neutral-400)' },
        { label: 'OT cost', color: 'var(--red-500)' },
      ]}
      leftTicks={['360 h', '180', '0']}
      rightTicks={['$12k', '$6k', '$0']}
      cols={DAYS.map((d, i) => {
        const r = data[i]
        const proj = statusOf(i, locked) === 'projected'
        const op = proj ? 0.55 : 1
        return (
          <Column
            key={d.l}
            style={{ gap: 4 }}
            onEnter={() => setTip({ chart: 'ro', i })}
            onLeave={() => setTip(null)}
            onClick={() => onPickDay(i)}
          >
            <StackedBar
              width={16}
              height={`${(((r.regH + r.otH) / AXIS.hours) * 100).toFixed(1)}%`}
              opacity={op}
              segments={[
                { f: r.regH, bg: 'var(--blue-500)' },
                { f: r.otH, bg: 'var(--yellow-500)' },
              ]}
            />
            <StackedBar
              width={16}
              height={`${(((r.regD + r.otD) / AXIS.cost) * 100).toFixed(1)}%`}
              opacity={op}
              segments={[
                { f: r.regD, bg: 'var(--neutral-400)' },
                { f: r.otD, bg: 'var(--red-500)' },
              ]}
            />
          </Column>
        )
      })}
      tipNode={
        active !== null && (
          <Tooltip
            left={colLeft(active)}
            minWidth={210}
            title={DAYS[active].full + (statusOf(active, locked) === 'projected' ? ' · projected' : '')}
            rows={[
              { sw: 'var(--blue-500)', label: 'Regular', val: `${num(data[active].regH, 1)} h`, val2: money(data[active].regD) },
              { sw: 'var(--yellow-500)', label: 'OT', val: `${num(data[active].otH, 1)} h`, val2: money(data[active].otD) },
            ]}
          />
        )
      }
      labels={
        <ColumnLabels
          cols={DAYS}
          marginRight={42}
          render={(d) => <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.l}</span>}
        />
      }
    />
  )
}

export function WorkforceUtilization({ locked, tip, setTip, onPickDay }: WeekChartProps) {
  const active = tip && tip.chart === 'wf' ? tip.i : null
  const data = DAYS.map((_, i) => workforceOf(i))
  return (
    <PairedChart
      title="Workforce utilization"
      legend={[
        { label: 'Required staff', color: 'var(--blue-500)' },
        { label: 'Productive cost', color: 'var(--neutral-400)' },
        { label: 'Over staff', color: 'var(--yellow-500)' },
        { label: 'Idle cost', color: 'var(--red-500)' },
      ]}
      leftTicks={['40', '20', '0']}
      rightTicks={['$12k', '$6k', '$0']}
      cols={DAYS.map((d, i) => {
        const w = data[i]
        const proj = statusOf(i, locked) === 'projected'
        const op = proj ? 0.55 : 1
        return (
          <Column
            key={d.l}
            style={{ gap: 4 }}
            onEnter={() => setTip({ chart: 'wf', i })}
            onLeave={() => setTip(null)}
            onClick={() => onPickDay(i)}
          >
            <StackedBar
              width={16}
              height={`${((d.clock / AXIS.staff) * 100).toFixed(1)}%`}
              opacity={op}
              segments={[
                { f: d.routes, bg: 'var(--blue-500)' },
                { f: w.extra, bg: 'var(--yellow-500)' },
              ]}
            />
            <StackedBar
              width={16}
              height={`${(((w.productive + w.idle) / AXIS.cost) * 100).toFixed(1)}%`}
              opacity={op}
              segments={[
                { f: w.productive, bg: 'var(--neutral-400)' },
                { f: w.idle, bg: 'var(--red-500)' },
              ]}
            />
          </Column>
        )
      })}
      tipNode={
        active !== null && (
          <Tooltip
            left={colLeft(active)}
            minWidth={220}
            title={DAYS[active].full + (statusOf(active, locked) === 'projected' ? ' · projected' : '')}
            rows={[
              { sw: 'var(--blue-500)', label: 'Required staff', val: num(DAYS[active].routes), val2: money(data[active].productive) },
              { sw: 'var(--yellow-500)', label: 'Over staff', val: String(data[active].extra), val2: money(data[active].idle) },
            ]}
          />
        )
      }
      labels={
        <ColumnLabels
          cols={DAYS.map((d, i) => ({ d, w: data[i] }))}
          marginRight={42}
          render={({ d, w }) => (
            <>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.l}</span>
              <span
                style={{
                  ...caption1Strong,
                  fontVariantNumeric: 'tabular-nums',
                  color: w.extra > 0 ? 'var(--warning-fg)' : 'var(--success-fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                {w.extra > 0 ? `+${w.extra}` : '0'}
              </span>
            </>
          )}
        />
      }
    />
  )
}
