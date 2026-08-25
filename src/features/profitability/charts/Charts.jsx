import {
  Axis,
  Column,
  Dot,
  Legend,
  MultiLine,
  Plot,
  ShareBar,
  StackedBar,
  Tooltip,
} from '../../../ds/charts/ChartKit.jsx'
import { CARD, linePath } from '../../../ds/charts/chartTokens.js'
import { caption1, caption1Strong, subtitle2 } from '../../../ds/type.js'
import { AXIS } from '../data.js'
import {
  colLeft,
  der,
  fmtRange,
  money,
  money0,
  num,
  otSplit,
  pct,
  workforceOf,
  PRODUCTIVE_RATE,
} from '../calc.js'

const H = 216

// Every chart card is a drop target and its header is the drag handle, so the
// reader can put the chart they live in at the top.
function DraggableCard({ id, s, title, legend, children }) {
  return (
    <div
      style={{ ...CARD, order: s.layout[id] }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        s.swapCharts(e.dataTransfer.getData('text/plain'), id)
      }}
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', id)
          e.dataTransfer.effectAllowed = 'move'
        }}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', cursor: 'grab', flexWrap: 'wrap' }}
      >
        <span style={{ ...subtitle2, whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ flex: 1 }} />
        <Legend items={legend} />
      </div>
      {children}
    </div>
  )
}

const titleOf = (p) =>
  `${p.id} · ${fmtRange(p.start)}${p.projected ? ' · projected' : p.hours && p.hours.toDate ? ' · to date' : ''}`

// Column label + the selected period highlighted, shared by every chart.
function Labels({ periods, sel, marginLeft = 46, marginRight = 0, second }) {
  return (
    <div style={{ display: 'flex', marginLeft, marginRight }}>
      {periods.map((p) => (
        <span
          key={p.id}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            ...caption1,
            fontWeight: p.id === sel ? 'var(--weight-semibold)' : 'var(--weight-regular)',
            color: p.id === sel ? 'var(--primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {p.id}
          {second && (
            <span style={{ ...caption1Strong, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
              {second(p)}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

const colBg = (p, sel) => (p.id === sel ? 'var(--blue-50)' : 'transparent')

const hooks = (s, chart, i, p) => ({
  onEnter: () => s.setTip({ chart, i }),
  onLeave: () => s.setTip(null),
  onClick: () => s.pickPeriod(p.id),
})

const tipIdx = (s, chart) => (s.tip && s.tip.chart === chart ? s.tip.i : null)

// --- c1 · Revenue and gross profit -----------------------------------------

export function RevenueAndProfit({ s, periods }) {
  const n = periods.length
  const active = tipIdx(s, 'c1')
  const margins = periods.map((p) => der(p).margin)

  return (
    <DraggableCard
      id="c1"
      s={s}
      title="Revenue and gross profit"
      legend={[
        { label: 'Revenue', color: 'var(--blue-500)' },
        { label: 'Gross profit', color: 'var(--green-500)' },
        { label: 'Margin %', color: 'var(--neutral-900)', rule: true },
        { label: 'Projected', color: 'var(--text-disabled)', dashed: true },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$180k', '$90k', '$0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const d = der(p)
            const bar = (v, color) => ({
              width: 12,
              height: `${((v / AXIS.revenue) * 100).toFixed(1)}%`,
              background: p.projected ? 'transparent' : color,
              border: p.projected ? `1.5px dashed ${color}` : 'none',
              boxSizing: 'border-box',
              borderRadius: '2px 2px 0 0',
            })
            return (
              <Column key={p.id} style={{ gap: 3, background: colBg(p, s.sel) }} {...hooks(s, 'c1', i, p)}>
                <div style={bar(p.rev, 'var(--blue-500)')} />
                <div style={bar(d.gp, 'var(--green-500)')} />
                <Dot
                  bottom={`${((d.margin / AXIS.margin) * 100).toFixed(1)}%`}
                  color="var(--neutral-900)"
                  hollow={p.projected}
                />
              </Column>
            )
          })}
          <MultiLine
            series={[
              {
                color: 'var(--neutral-900)',
                solid: linePath(margins, 0, n - 2, AXIS.margin, n),
                dashed: linePath(margins, n - 2, n - 1, AXIS.margin, n),
              },
            ]}
          />
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={180}
              title={titleOf(periods[active])}
              rows={[
                { sw: 'var(--blue-500)', label: 'Revenue', val: money(periods[active].rev) },
                { sw: 'var(--green-500)', label: 'Gross profit', val: money(der(periods[active]).gp) },
                { sw: 'var(--neutral-900)', label: 'Margin', val: pct(der(periods[active]).margin) },
              ]}
            />
          )}
        </Plot>
        <Axis ticks={['50%', '25%', '0%']} height={H} align="left" width={30} />
      </div>
      <Labels periods={periods} sel={s.sel} marginRight={38} />
    </DraggableCard>
  )
}

// --- c3 · Per-route economics ----------------------------------------------

export function PerRouteEconomics({ s, periods }) {
  const n = periods.length
  const active = tipIdx(s, 'c3')
  const series = (get, color) => {
    const vals = periods.map((p) => get(der(p)))
    return {
      color,
      solid: linePath(vals, 0, n - 2, AXIS.perRoute, n),
      dashed: linePath(vals, n - 2, n - 1, AXIS.perRoute, n),
    }
  }

  return (
    <DraggableCard
      id="c3"
      s={s}
      title="Per-route economics"
      legend={[
        { label: 'Revenue / route', color: 'var(--blue-500)', rule: true },
        { label: 'Cost / route', color: 'var(--red-500)', rule: true },
        { label: 'Profit / route', color: 'var(--green-500)', rule: true },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$400', '$200', '$0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const d = der(p)
            const at = (v) => `${((v / AXIS.perRoute) * 100).toFixed(1)}%`
            return (
              <Column
                key={p.id}
                style={{ background: colBg(p, s.sel), alignItems: 'stretch' }}
                {...hooks(s, 'c3', i, p)}
              >
                <Dot bottom={at(d.rpr)} color="var(--blue-500)" hollow={p.projected} />
                <Dot bottom={at(d.cpr)} color="var(--red-500)" hollow={p.projected} />
                <Dot bottom={at(d.ppr)} color="var(--green-500)" hollow={p.projected} />
              </Column>
            )
          })}
          <MultiLine
            series={[
              series((d) => d.rpr, 'var(--blue-500)'),
              series((d) => d.cpr, 'var(--red-500)'),
              series((d) => d.ppr, 'var(--green-500)'),
            ]}
          />
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={180}
              title={titleOf(periods[active])}
              rows={[
                { sw: 'var(--blue-500)', label: 'Revenue / route', val: money(der(periods[active]).rpr) },
                { sw: 'var(--red-500)', label: 'Cost / route', val: money(der(periods[active]).cpr) },
                { sw: 'var(--green-500)', label: 'Profit / route', val: money(der(periods[active]).ppr) },
              ]}
            />
          )}
        </Plot>
      </div>
      <Labels periods={periods} sel={s.sel} />
    </DraggableCard>
  )
}

// --- c2 · Revenue distribution ---------------------------------------------

export function RevenueDistribution({ s, periods }) {
  const n = periods.length
  const active = tipIdx(s, 'c2')
  const shares = (p) => ({
    drv: ((p.sp.dg + p.sp.dt) / p.rev) * 100,
    dsp: ((p.sp.dsg + p.sp.dst) / p.rev) * 100,
    trn: ((p.sp.tg + p.sp.tt) / p.rev) * 100,
    gp: der(p).margin,
  })

  return (
    <DraggableCard
      id="c2"
      s={s}
      title="Revenue distribution"
      legend={[
        { label: 'Driver', color: 'var(--blue-500)' },
        { label: 'Dispatch', color: 'var(--blue-300)' },
        { label: 'Training', color: 'var(--yellow-300)' },
        { label: 'Gross profit', color: 'var(--green-500)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['100%', '50%', '0%']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const sh = shares(p)
            return (
              <Column key={p.id} style={{ background: colBg(p, s.sel) }} {...hooks(s, 'c2', i, p)}>
                <ShareBar
                  width={24}
                  opacity={p.projected ? 0.55 : 1}
                  segments={[
                    { h: `${sh.drv.toFixed(1)}%`, bg: 'var(--blue-500)' },
                    { h: `${sh.dsp.toFixed(1)}%`, bg: 'var(--blue-300)' },
                    { h: `${sh.trn.toFixed(1)}%`, bg: 'var(--yellow-300)' },
                    { h: `${sh.gp.toFixed(1)}%`, bg: 'var(--green-500)' },
                  ]}
                />
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={180}
              title={titleOf(periods[active])}
              rows={(() => {
                const sh = shares(periods[active])
                return [
                  { sw: 'var(--blue-500)', label: 'Driver', val: pct(sh.drv) },
                  { sw: 'var(--blue-300)', label: 'Dispatch', val: pct(sh.dsp) },
                  { sw: 'var(--yellow-300)', label: 'Training', val: pct(sh.trn) },
                  { sw: 'var(--green-500)', label: 'Gross profit', val: pct(sh.gp) },
                ]
              })()}
            />
          )}
        </Plot>
      </div>
      <Labels periods={periods} sel={s.sel} />
    </DraggableCard>
  )
}

// --- c4 · Cost breakdown ---------------------------------------------------

export function CostBreakdown({ s, periods }) {
  const active = tipIdx(s, 'c4')
  const n = periods.length

  return (
    <DraggableCard
      id="c4"
      s={s}
      title="Cost breakdown"
      legend={[
        { label: 'Driver pay', color: 'var(--blue-500)' },
        { label: 'Dispatch', color: 'var(--blue-300)' },
        { label: 'Training', color: 'var(--yellow-300)' },
        { label: 'WC + ER', color: 'var(--neutral-400)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['$120k', '$60k', '$0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const d = der(p)
            return (
              <Column key={p.id} style={{ background: colBg(p, s.sel) }} {...hooks(s, 'c4', i, p)}>
                <div
                  style={{
                    width: 44,
                    height: `${((p.cost / AXIS.cost) * 100).toFixed(1)}%`,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    opacity: p.projected ? 0.55 : 1,
                    border: p.projected ? '1.5px dashed var(--warning-accent)' : 'none',
                    boxSizing: 'border-box',
                    borderRadius: '2px 2px 0 0',
                  }}
                >
                  {[
                    { f: p.sp.dg, bg: 'var(--blue-500)' },
                    { f: p.sp.dsg, bg: 'var(--blue-300)' },
                    { f: p.sp.tg, bg: 'var(--yellow-300)' },
                    { f: d.taxes, bg: 'var(--neutral-400)' },
                  ].map((seg, j) => (
                    <div key={j} style={{ flex: seg.f, background: seg.bg }} />
                  ))}
                </div>
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={190}
              title={titleOf(periods[active])}
              rows={[
                { sw: 'var(--blue-500)', label: 'Driver pay', val: money(periods[active].sp.dg) },
                { sw: 'var(--blue-300)', label: 'Dispatch', val: money(periods[active].sp.dsg) },
                { sw: 'var(--yellow-300)', label: 'Training', val: money(periods[active].sp.tg) },
                { sw: 'var(--neutral-400)', label: 'WC + ER', val: money(der(periods[active]).taxes) },
                { sw: 'var(--neutral-900)', label: 'Total', val: money(periods[active].cost) },
              ]}
            />
          )}
        </Plot>
      </div>
      <Labels periods={periods} sel={s.sel} second={(p) => money0(p.cost)} />
    </DraggableCard>
  )
}

// --- c5 · Timecard hours ---------------------------------------------------

export function TimecardHours({ s, periods }) {
  const active = tipIdx(s, 'c5')
  const n = periods.length

  return (
    <DraggableCard
      id="c5"
      s={s}
      title="Timecard hours"
      legend={[
        { label: 'Regular', color: 'var(--blue-500)' },
        { label: 'Overtime', color: 'var(--yellow-500)' },
        { label: 'PTO · paid, not worked', color: 'var(--neutral-400)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['9k h', '4.5k', '0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const h = p.hours
            const total = h.reg + h.ot + h.pto
            const heightPct = (total / AXIS.hours) * 100
            return (
              <Column key={p.id} style={{ background: colBg(p, s.sel) }} {...hooks(s, 'c5', i, p)}>
                <StackedBar
                  width={44}
                  height={`${heightPct.toFixed(1)}%`}
                  segments={[
                    { f: h.reg, bg: 'var(--blue-500)' },
                    { f: h.ot, bg: 'var(--yellow-500)' },
                    { f: h.pto, bg: 'var(--neutral-400)' },
                  ]}
                />
                {/* A part-way period says so on the bar, not just in a tooltip. */}
                {h.toDate && (
                  <span
                    style={{
                      position: 'absolute',
                      top: `${(100 - heightPct - 14).toFixed(1)}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxSizing: 'border-box',
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 var(--size-80)',
                      borderRadius: 'var(--radius-medium)',
                      background: 'var(--info-bg)',
                      border: '1px solid var(--info-border)',
                      ...caption1Strong,
                      color: 'var(--info-fg)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    To date
                  </span>
                )}
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={180}
              title={titleOf(periods[active])}
              rows={[
                { sw: 'var(--blue-500)', label: 'Regular', val: `${num(periods[active].hours.reg)} h` },
                { sw: 'var(--yellow-500)', label: 'Overtime', val: `${num(periods[active].hours.ot)} h` },
                { sw: 'var(--neutral-400)', label: 'PTO', val: `${num(periods[active].hours.pto)} h` },
              ]}
            />
          )}
        </Plot>
      </div>
      <Labels
        periods={periods}
        sel={s.sel}
        second={(p) => `${num(p.hours.reg + p.hours.ot + p.hours.pto)} Hours`}
      />
    </DraggableCard>
  )
}

// --- c6 · Regular vs overtime ----------------------------------------------

export function RegularVsOvertime({ s, periods }) {
  const active = tipIdx(s, 'c6')
  const n = periods.length

  return (
    <DraggableCard
      id="c6"
      s={s}
      title="Regular vs overtime"
      legend={[
        { label: 'Regular hours', color: 'var(--blue-500)' },
        { label: 'OT hours', color: 'var(--yellow-500)' },
        { label: 'Regular cost', color: 'var(--neutral-400)' },
        { label: 'OT cost', color: 'var(--red-500)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['9k h', '4.5k', '0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const h = p.hours
            const c = otSplit(p)
            return (
              <Column key={p.id} style={{ gap: 4, background: colBg(p, s.sel) }} {...hooks(s, 'c6', i, p)}>
                <StackedBar
                  width={26}
                  height={`${(((h.reg + h.ot) / AXIS.hours) * 100).toFixed(1)}%`}
                  segments={[
                    { f: h.reg, bg: 'var(--blue-500)' },
                    { f: h.ot, bg: 'var(--yellow-500)' },
                  ]}
                />
                <StackedBar
                  width={26}
                  height={`${(((c.regC + c.otC) / AXIS.payCost) * 100).toFixed(1)}%`}
                  segments={[
                    { f: c.regC, bg: 'var(--neutral-400)' },
                    { f: c.otC, bg: 'var(--red-500)' },
                  ]}
                />
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={210}
              title={titleOf(periods[active])}
              rows={(() => {
                const p = periods[active]
                const c = otSplit(p)
                return [
                  { sw: 'var(--blue-500)', label: 'Regular', val: `${num(p.hours.reg)} h`, val2: money(c.regC) },
                  { sw: 'var(--yellow-500)', label: 'OT', val: `${num(p.hours.ot)} h`, val2: money(c.otC) },
                ]
              })()}
            />
          )}
        </Plot>
        <Axis ticks={['$90k', '$45k', '$0']} height={H} align="left" width={34} />
      </div>
      <Labels
        periods={periods}
        sel={s.sel}
        marginRight={42}
        second={(p) => `${num(p.hours.reg + p.hours.ot)} Hours`}
      />
    </DraggableCard>
  )
}

// --- c7 · Workforce utilization --------------------------------------------

export function WorkforceUtilization({ s, periods }) {
  const active = tipIdx(s, 'c7')
  const n = periods.length

  return (
    <DraggableCard
      id="c7"
      s={s}
      title="Workforce utilization"
      legend={[
        { label: 'Required staff', color: 'var(--blue-500)' },
        { label: 'Productive cost', color: 'var(--neutral-400)' },
        { label: 'Over staff', color: 'var(--yellow-500)' },
        { label: 'Idle cost', color: 'var(--red-500)' },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['60', '30', '0']} height={H} />
        <Plot height={H}>
          {periods.map((p, i) => {
            const w = workforceOf(p)
            const productive = w.req * PRODUCTIVE_RATE
            return (
              <Column key={p.id} style={{ gap: 4, background: colBg(p, s.sel) }} {...hooks(s, 'c7', i, p)}>
                <StackedBar
                  width={16}
                  height={`${(((w.req + w.extra) / AXIS.staff) * 100).toFixed(1)}%`}
                  segments={[
                    { f: w.req, bg: 'var(--blue-500)' },
                    { f: w.extra, bg: 'var(--yellow-500)' },
                  ]}
                />
                <StackedBar
                  width={16}
                  height={`${(((productive + w.idle) / AXIS.idleCost) * 100).toFixed(1)}%`}
                  segments={[
                    { f: productive, bg: 'var(--neutral-400)' },
                    { f: w.idle, bg: 'var(--red-500)' },
                  ]}
                />
              </Column>
            )
          })}
          {active !== null && (
            <Tooltip
              left={colLeft(active, n)}
              minWidth={220}
              title={titleOf(periods[active])}
              rows={(() => {
                const w = workforceOf(periods[active])
                return [
                  { sw: 'var(--blue-500)', label: 'Required staff', val: num(w.req), val2: money(w.req * PRODUCTIVE_RATE) },
                  { sw: 'var(--yellow-500)', label: 'Over staff', val: num(w.extra), val2: money(w.idle) },
                ]
              })()}
            />
          )}
        </Plot>
        <Axis ticks={['$120k', '$60k', '$0']} height={H} align="left" width={34} />
      </div>
      <Labels periods={periods} sel={s.sel} marginRight={42} />
    </DraggableCard>
  )
}
