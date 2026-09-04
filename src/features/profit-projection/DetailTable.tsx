import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type { Person } from './data'
import type { ProjectionState } from './useProfitProjection'
import { Icon } from '../../ds/icons/Icon'
import { Menu, MenuItem } from '../../ds/components/Overlay'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, caption2Strong, subtitle2 } from '../../ds/type'
import {
  DAY_COLUMNS,
  DAY_TOTALS,
  DAYS,
  PEOPLE,
  WEEK_COLUMNS,
} from './data'
import {
  DASH,
  badge,
  costOf,
  cprOf,
  marginOf,
  money,
  money0,
  num,
  pct,
  personDerived,
  revOf,
  scaleColor,
  statusOf,
  weekTotals,
} from './calc'

/** A table column. `f`/`min` mark the one flexible column. */
interface Def {
  k: string
  label: string
  w?: string
  f?: string
  min?: string
  right?: boolean
}

/** One rendered cell: either a value with its tone, or a status badge. */
interface CellSpec {
  def: Def
  t?: ReactNode
  fw?: string
  c?: string
  fs?: string
  badge?: { bg: string; border: string; fg: string; dot: string; label: string }
  onBadgeClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

const headerCell: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

const WEEK_DEFS: Def[] = [
  { k: 'day', label: 'Day', f: '1', min: '96px' },
  { k: 'status', label: 'Status', w: '104px' },
  { k: 'routes', label: 'Routes', w: '56px', right: true },
  { k: 'clock', label: 'Clock-in', w: '64px', right: true },
  { k: 'over', label: 'Over', w: '48px', right: true },
  { k: 'hrsrt', label: 'Hrs/rt', w: '56px', right: true },
  { k: 'ot', label: 'OT %', w: '56px', right: true },
  { k: 'payroll', label: 'Payroll', w: '76px', right: true },
  { k: 'cost', label: 'Cost', w: '76px', right: true },
  { k: 'cpr', label: 'CPR', w: '68px', right: true },
  { k: 'rev', label: 'Revenue', w: '80px', right: true },
  { k: 'profit', label: 'Profit', w: '72px', right: true },
  { k: 'margin', label: 'Margin', w: '60px', right: true },
]

const WEEK_EXTRA: Record<string, Def> = {
  Packages: { k: 'pkg', label: 'Packages', w: '72px', right: true },
  'Revenue / route': { k: 'rpr', label: 'Rev/rt', w: '68px', right: true },
  'Profit / route': { k: 'ppr', label: 'Profit/rt', w: '68px', right: true },
}

const DAY_DEFS: Def[] = [
  { k: 'code', label: 'Code', w: '52px' },
  { k: 'emp', label: 'Employee', f: '1', min: '160px' },
  { k: 'pos', label: 'Position', w: '128px' },
  { k: 'reg', label: 'Reg hrs', w: '60px', right: true },
  { k: 'othr', label: 'OT hrs', w: '56px', right: true },
  { k: 'tot', label: 'Total hrs', w: '64px', right: true },
  { k: 'regd', label: 'Regular', w: '72px', right: true },
  { k: 'otd', label: 'Overtime', w: '72px', right: true },
  { k: 'bonus', label: 'Bonus', w: '56px', right: true },
  { k: 'cost', label: 'Cost', w: '76px', right: true },
]

const DAY_EXTRA: Record<string, Def> = {
  'Workers’ comp': { k: 'wc', label: 'WC', w: '64px', right: true },
  'Employer taxes': { k: 'tax', label: 'Taxes', w: '64px', right: true },
  Rate: { k: 'rate', label: 'Rate', w: '104px', right: true },
}

const cellBox = (def: Def): CSSProperties => ({
  boxSizing: 'border-box',
  width: def.w || 'auto',
  flex: def.f || 'none',
  minWidth: def.min || 0,
  flexShrink: 0,
  display: 'flex',
  justifyContent: def.right ? 'flex-end' : 'flex-start',
})

function HeadCell({
  def,
  sort,
  onSort,
}: {
  def: Def
  sort: ProjectionState['sort']
  onSort: () => void
}) {
  const [hover, hoverProps] = useHover()
  const active = sort.col === def.k
  return (
    <div
      onClick={onSort}
      style={{
        ...cellBox(def),
        alignItems: 'center',
        gap: 'var(--size-40)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: 'var(--radius-small)',
        color: active || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      {def.label}
      <span style={{ display: 'flex' }}>
        <Icon
          name={active ? (sort.dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
          size={12}
          color={active ? 'currentColor' : 'var(--text-disabled)'}
        />
      </span>
    </div>
  )
}

function Row({
  cells,
  bg,
  onClick,
}: {
  cells: CellSpec[]
  bg?: string
  onClick?: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : bg,
        ...caption1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {cells.map((c, i) => (
        <div key={i} style={{ ...cellBox(c.def), minHeight: 16 }}>
          {c.badge ? (
            <span
              onClick={c.onBadgeClick}
              style={{
                boxSizing: 'border-box',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-60)',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-medium)',
                background: c.badge.bg,
                border: `1px solid ${c.badge.border}`,
                ...caption1Strong,
                color: c.badge.fg,
                whiteSpace: 'nowrap',
                cursor: c.onBadgeClick ? 'pointer' : 'default',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: c.badge.dot, flexShrink: 0 }} />
              {c.badge.label}
            </span>
          ) : (
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: c.fw || 'var(--weight-regular)',
                color: c.c || 'var(--text-primary)',
                fontStyle: c.fs || 'normal',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {c.t}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function SmallButton({
  children,
  onClick,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

// Day by day (week) or who was paid (day). Sorting, optional columns and a
// totals row that always states the same figures the charts are drawn from.
export function DetailTable({ s }: { s: ProjectionState }) {
  const isWeek = s.isWeek
  const defs = isWeek
    ? WEEK_DEFS.concat(WEEK_COLUMNS.filter((c) => s.extraCols[c]).map((c) => WEEK_EXTRA[c]))
    : DAY_DEFS.concat(DAY_COLUMNS.filter((c) => s.extraCols[c]).map((c) => DAY_EXTRA[c]))
  const colNames = isWeek ? WEEK_COLUMNS : DAY_COLUMNS

  const built = isWeek ? weekRows(s, defs) : dayRows(s, defs)

  return (
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
        <span style={{ ...subtitle2 }}>{isWeek ? 'Day by day' : 'Who was paid on this day'}</span>
        {!isWeek && s.dayIdx === 3 && (
          <span
            style={{
              boxSizing: 'border-box',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-60)',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              ...caption1Strong,
              color: 'var(--warning-fg)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--warning-accent)', flexShrink: 0 }} />
            1 code not on the roster
          </span>
        )}
        <div style={{ flex: 1 }} />
        {!isWeek && (
          <>
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
                value={s.pq}
                onChange={(e) => s.setPq(e.target.value)}
                placeholder="Search people"
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
            </div>
            <SmallButton onClick={() => s.toast(`Opens the roster picker · a manual row lands on ${DAYS[s.dayIdx].full}`)}>
              Add a person
            </SmallButton>
          </>
        )}
        <span style={{ position: 'relative', display: 'flex' }}>
          <SmallButton onClick={s.toggleMenu('cols')}>
            Columns
            <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
              <Icon name="SvChevron" size={12} />
            </span>
          </SmallButton>
          {s.menu === 'cols' && (
            <Menu top={30} minWidth={170}>
              {colNames.map((c) => (
                <MenuItem
                  key={c}
                  selected={!!s.extraCols[c]}
                  onClick={s.toggleExtraCol(c)}
                  trailing={s.extraCols[c] ? <Icon name="FnCheck" size={12} color="var(--primary)" /> : null}
                >
                  {c}
                </MenuItem>
              ))}
            </Menu>
          )}
        </span>
      </div>

      {/* Thirteen columns of fixed-width cells come to ~1070px, which is wider
          than the content pane on a tablet. Header, rows and totals share one
          scroller so a column never drifts away from its own heading; the
          min-content floor is what gives that scroller something to scroll. */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 'min-content', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-120)',
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          ...headerCell,
        }}
      >
        {defs.map((d) => (
          <HeadCell key={d.k} def={d} sort={s.sort} onSort={s.toggleSort(d.k)} />
        ))}
      </div>

      <div style={{ maxHeight: isWeek ? 'none' : 400, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {built.rows.map((r, i) => (
          <Row key={i} cells={r.cells} bg={r.bg} onClick={r.onClick} />
        ))}
        {built.more && (
          <MoreRow onClick={() => s.setAllPeople(!s.allPeople)}>{built.more}</MoreRow>
        )}
      </div>

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
        {built.totals.map((c, i) => (
          <div key={i} style={cellBox(c.def)}>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: c.c || 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {c.t}
            </span>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  )
}

function MoreRow({ children, onClick }: { children?: ReactNode; onClick?: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        ...caption1,
        color: 'var(--text-link)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function weekRows(s: ProjectionState, defs: Def[]) {
  if (s.empty) {
    return {
      rows: [],
      more: null,
      totals: [{ def: defs[0], t: 'No days in range', c: 'var(--text-helper)' }] as CellSpec[],
    }
  }
  const wk = weekTotals()
  const vals = DAYS.map((d, i) => ({
    i,
    d,
    status: statusOf(i, s.locked),
    over: d.clock - d.routes,
    hrsrt: d.hours / d.routes,
    cost: costOf(i),
    rev: revOf(i),
    profit: revOf(i) - costOf(i),
    margin: marginOf(i),
    cpr: cprOf(i),
  }))

  const keyOf = (r: (typeof vals)[number]): number => {
    const keys: Record<string, number> = {
      status: r.status === 'projected' ? 2 : r.status === 'locked' ? 1 : 0,
      routes: r.d.routes, clock: r.d.clock, over: r.over, hrsrt: r.hrsrt,
      ot: r.d.otPct, payroll: r.d.payroll, cost: r.cost, cpr: r.cpr,
      rev: r.rev, profit: r.profit, margin: r.margin, pkg: r.d.pkg,
      rpr: r.rev / r.d.routes, ppr: r.profit / r.d.routes,
    }
    return keys[s.sort.col ?? ''] ?? r.i
  }

  const sorted = s.sort.col
    ? vals.slice().sort((a, b) => (keyOf(a) - keyOf(b)) * (s.sort.dir === 'asc' ? 1 : -1))
    : vals

  const range = (get: (r: (typeof vals)[number]) => number): [number, number] => {
    const arr = vals.map(get).concat([0, 1])
    return [Math.min(...arr), Math.max(...arr)]
  }
  const [rvLo, rvHi] = range((r) => r.rev)
  const [csLo, csHi] = range((r) => r.cost)
  const [pfLo, pfHi] = range((r) => r.profit)
  const [mgLo, mgHi] = range((r) => r.margin)
  // Heat text: greener is better, and cost is inverted because cheaper is.
  const heat = (v: number, lo: number, hi: number, invert?: boolean) =>
    scaleColor(hi === lo ? 1 : invert ? 1 - (v - lo) / (hi - lo) : (v - lo) / (hi - lo))

  const rows = sorted.map((r) => {
    const proj = r.status === 'projected'
    // A projected day is italic as well as amber - never colour alone.
    const base = { c: proj ? 'var(--warning-fg)' : 'var(--text-primary)', fs: proj ? 'italic' : 'normal' }
    const b = badge(r.status)
    const cells: CellSpec[] = [
      { def: defs[0], t: r.d.full, fw: 'var(--weight-semibold)', c: 'var(--text-primary)' },
      { def: defs[1], badge: { ...b } },
      { def: defs[2], t: num(r.d.routes), ...base },
      { def: defs[3], t: num(r.d.clock), ...base },
      {
        def: defs[4],
        t: r.over === 0 ? DASH : r.over < 0 ? `−${Math.abs(r.over)}` : String(r.over),
        fs: base.fs,
        c: r.over < 0 ? 'var(--success-fg)' : r.over === 0 ? 'var(--text-disabled)' : r.over <= 2 ? 'var(--warning-fg)' : 'var(--danger-fg)',
      },
      { def: defs[5], t: r.hrsrt.toFixed(2), ...base },
      { def: defs[6], t: pct(r.d.otPct), fs: base.fs, c: r.d.otPct > 25 ? 'var(--danger-fg)' : base.c },
      { def: defs[7], t: money0(r.d.payroll), ...base },
      { def: defs[8], t: money0(r.cost), fs: base.fs, c: heat(r.cost, csLo, csHi, true) },
      { def: defs[9], t: money(r.cpr), fs: base.fs, fw: 'var(--weight-semibold)', c: r.cpr <= 311.23 ? 'var(--success-fg)' : 'var(--warning-fg)' },
      { def: defs[10], t: money0(r.rev), fs: base.fs, c: heat(r.rev, rvLo, rvHi) },
      { def: defs[11], t: money0(r.profit), fs: base.fs, c: heat(r.profit, pfLo, pfHi) },
      { def: defs[12], t: pct(r.margin), fs: base.fs, fw: 'var(--weight-semibold)', c: heat(r.margin, mgLo, mgHi) },
    ]
    let n = 13
    if (s.extraCols.Packages) cells.push({ def: defs[n++], t: num(r.d.pkg), ...base })
    if (s.extraCols['Revenue / route']) cells.push({ def: defs[n++], t: money(r.rev / r.d.routes), ...base })
    if (s.extraCols['Profit / route']) cells.push({ def: defs[n++], t: money(r.profit / r.d.routes), ...base })
    return { cells, bg: 'transparent', onClick: () => s.openDay(r.i) }
  })

  const totals: CellSpec[] = [
    { def: defs[0], t: '7 days' },
    { def: defs[1], t: '' },
    { def: defs[2], t: num(wk.routes) },
    { def: defs[3], t: num(wk.clock) },
    { def: defs[4], t: String(wk.clock - wk.routes), c: 'var(--warning-fg)' },
    { def: defs[5], t: (wk.hours / wk.routes).toFixed(2) },
    { def: defs[6], t: pct(20.1) },
    { def: defs[7], t: money0(DAYS.reduce((sum, d) => sum + d.payroll, 0)) },
    { def: defs[8], t: money0(wk.cost) },
    { def: defs[9], t: money(wk.cost / wk.routes) },
    { def: defs[10], t: money0(wk.rev) },
    { def: defs[11], t: money0(wk.profit) },
    { def: defs[12], t: pct(wk.margin) },
  ]
  let n = 13
  if (s.extraCols.Packages) totals.push({ def: defs[n++], t: num(DAYS.reduce((sum, d) => sum + d.pkg, 0)) })
  if (s.extraCols['Revenue / route']) totals.push({ def: defs[n++], t: money(wk.rev / wk.routes) })
  if (s.extraCols['Profit / route']) totals.push({ def: defs[n++], t: money(wk.profit / wk.routes) })

  return { rows, more: null, totals }
}

function dayRows(s: ProjectionState, defs: Def[]) {
  const q = s.pq.trim().toLowerCase()
  const pool = PEOPLE.filter(
    (p) => !q || `${p.code} ${p.name} ${p.pos || ''}`.toLowerCase().includes(q),
  )
  const visible = s.allPeople || q ? pool : pool.slice(0, 9)
  const more = q ? null : s.allPeople ? 'Show fewer' : '26 more people · show all'

  const keyOf = (p: Person): number => {
    const dv = personDerived(p)
    const keys: Record<string, number> = {
      code: 0, emp: 0, pos: p.unmatched ? 1 : 0,
      reg: p.reg, othr: p.ot, regd: p.regD, otd: p.otD,
      bonus: p.bonus, cost: dv.cost, wc: dv.wc, tax: dv.taxes, rate: 22.5,
    }
    return keys[s.sort.col ?? ''] ?? dv.total
  }
  const dir = s.sort.col ? (s.sort.dir === 'asc' ? 1 : -1) : -1
  const sorted = visible.slice().sort((a, b) => (keyOf(a) - keyOf(b)) * dir)

  const rows = sorted.map((p) => {
    const dv = personDerived(p)
    const amber = p.unmatched
    const c = amber ? 'var(--warning-fg)' : 'var(--text-primary)'
    const cells: CellSpec[] = [
      { def: defs[0], t: p.code, c: 'var(--text-secondary)' },
      { def: defs[1], t: p.name, fw: 'var(--weight-semibold)', c },
      p.unmatched
        ? {
            def: defs[2],
            badge: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)', label: 'Not on roster · Link' },
            onBadgeClick: (e: MouseEvent<HTMLSpanElement>) => {
              e.stopPropagation()
              s.toast(`Opens the roster picker · ${p.name}`)
            },
          }
        : { def: defs[2], t: p.pos, c: p.pos === 'Dispatch' ? 'var(--text-link)' : 'var(--text-secondary)' },
      { def: defs[3], t: p.reg.toFixed(2), c },
      { def: defs[4], t: p.ot ? p.ot.toFixed(2) : DASH, c: p.ot > 2.5 ? 'var(--danger-fg)' : p.ot > 2 ? 'var(--warning-fg)' : c },
      { def: defs[5], t: dv.total.toFixed(2), fw: 'var(--weight-semibold)', c },
      { def: defs[6], t: money(p.regD), c },
      { def: defs[7], t: p.otD ? money(p.otD) : DASH, c },
      { def: defs[8], t: p.bonus ? money(p.bonus) : DASH, c },
      { def: defs[9], t: money(dv.cost), c },
    ]
    let n = 10
    if (s.extraCols['Workers’ comp']) cells.push({ def: defs[n++], t: money(dv.wc), c })
    if (s.extraCols['Employer taxes']) cells.push({ def: defs[n++], t: money(dv.taxes), c })
    if (s.extraCols.Rate) cells.push({ def: defs[n++], t: '$22.50 · default', c: 'var(--warning-fg)' })
    return { cells, bg: amber ? 'var(--warning-bg)' : 'transparent', onClick: undefined }
  })

  const T = DAY_TOTALS
  const totals: CellSpec[] = [
    { def: defs[0], t: '' },
    { def: defs[1], t: T.people },
    { def: defs[2], t: '' },
    { def: defs[3], t: T.reg },
    { def: defs[4], t: T.ot },
    { def: defs[5], t: T.total },
    { def: defs[6], t: T.regD },
    { def: defs[7], t: T.otD },
    { def: defs[8], t: T.bonus },
    { def: defs[9], t: T.cost },
  ]
  let n = 10
  if (s.extraCols['Workers’ comp']) totals.push({ def: defs[n++], t: T.wc })
  if (s.extraCols['Employer taxes']) totals.push({ def: defs[n++], t: T.taxes })
  if (s.extraCols.Rate) totals.push({ def: defs[n++], t: '' })

  return { rows, more, totals }
}
