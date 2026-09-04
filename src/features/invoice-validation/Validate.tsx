'use client'

import { useState } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong } from '../../ds/type'
import { Badge, Button, DecisionButton, Link, SectionTitle } from './parts'
import { CARD, HEAD, ROW } from './style'
import { billedTotal } from './calc'
import type { SubComparison } from './calc'
import { STATION } from './data'
import { fmtY, weekName, weekRange } from './date'
import { money, num, rate as fmtRate, signColor, signed } from './fmt'
import type { IvState } from './useInvoiceValidation'

/**
 * The validate tab - one week at a time, top to bottom.
 *
 * Work summary (what we say happened) → extracted (what Amazon says it will
 * pay for) → the comparison → the dispute draft → the decision. Once a week is
 * decided the whole stack freezes and a banner replaces the decision pair.
 */
export function Validate({ s }: { s: IvState }) {
  const n = s.vWeek
  const cur = s.cur
  const has = s.has
  const c = has ? s.comparisonOf(n) : null
  const showDrop = !has || s.isReplacing

  return (
    <>
      {s.decided && <DecidedBanner s={s} />}

      {showDrop && (
        <>
          <DropZone s={s} />
          <WorkSummary s={s} />
        </>
      )}

      {has && !s.isReplacing && c && (
        <>
          <Extracted s={s} />
          <ComparisonTable s={s} />
          {(c.count > 0 || cur.status === 'dispute') && <Dispute s={s} />}
          {!s.decided && <Decision s={s} />}
        </>
      )}
    </>
  )
}

function DecidedBanner({ s }: { s: IvState }) {
  const cur = s.cur
  const validated = cur.status === 'validated'
  const text = validated
    ? `Validated ${cur.decidedOn ? fmtY(cur.decidedOn) : ''} by ${cur.decidedBy ?? ''}` +
      (cur.recovered != null ? ` · ${money(cur.recovered)} recovered` : '')
    : `Disputed ${cur.disputedOn ? fmtY(cur.disputedOn) : ''} by ${cur.decidedBy ?? ''}` +
      (cur.caseRef ? ` · ${cur.caseRef}` : '')

  return (
    <div
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        padding: 'var(--size-120) var(--size-160)',
        background: validated ? 'var(--success-bg)' : 'var(--warning-bg)',
        border: `1px solid ${validated ? 'var(--success-border)' : 'var(--warning-border)'}`,
        borderRadius: 'var(--radius-medium)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, ...body1, color: validated ? 'var(--success-fg)' : 'var(--warning-fg)' }}>{text}</span>
      {cur.status === 'dispute' && (
        <Button icon="FnUpload" onClick={() => s.openDialog('adjusted', s.vWeek)}>Upload adjusted invoice</Button>
      )}
      <Button
        icon="SvExport"
        onClick={() => s.toastMsg(`${validated ? 'Validation record' : 'Dispute document'} downloaded.`)}
      >
        {validated ? 'Validation record' : 'Dispute document'}
      </Button>
      <Button onClick={() => s.openDialog('revert', s.vWeek)}>Revert to pending</Button>
    </div>
  )
}

function DropZone({ s }: { s: IvState }) {
  const n = s.vWeek
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      {!s.parsing && (
        <div
          role="button"
          tabIndex={0}
          onClick={s.upload}
          title={s.decided ? 'This invoice is decided. Revert it to pending before replacing it.' : 'PDF · one invoice covers one week'}
          style={{
            boxSizing: 'border-box',
            height: 196,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-200)',
            background: 'var(--surface-page)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-medium)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={body1Strong}>Drop the Amazon invoice PDF here</span>
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>PDF · up to 10 MB · one invoice covers one week</span>
          <span style={{ marginTop: 'var(--size-80)' }}>
            <Button>Choose a file</Button>
          </span>
        </div>
      )}

      {s.parsing && (
        <div style={{ ...CARD, boxSizing: 'border-box', height: 196, padding: 'var(--size-160)', gap: 'var(--size-120)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...body1Strong }}>
              Invoice_W{n}_2026.pdf
            </span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>1.2 MB</span>
          </div>
          <div style={{ height: 2, borderRadius: 2, background: 'var(--border-default)', overflow: 'hidden' }}>
            <div style={{ width: `${s.parsePct}%`, height: 2, borderRadius: 2, background: 'var(--primary)', transition: 'width var(--duration-fast) var(--curve-easy-ease)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
            <span style={{ flex: 1, ...caption1, color: 'var(--text-secondary)' }}>{s.parsePct}% · {s.parseStage}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={s.cancelParse}
              style={{ ...caption1Strong, color: 'var(--primary)', cursor: 'pointer' }}
            >
              Cancel
            </span>
          </div>
          <span style={{ marginTop: 'auto', ...caption1, color: 'var(--text-helper)' }}>
            Nothing is stored until the invoice finishes reading.
          </span>
        </div>
      )}

      {!s.parsing && <Link onClick={() => s.openDialog('manual', n)}>Enter figures manually</Link>}
      {s.isReplacing && <Link onClick={() => s.setReplacing(null)}>Keep the invoice already uploaded</Link>}
    </div>
  )
}

const BASE_COLS = {
  label: { flex: 1, minWidth: 190 },
  units: { width: 90, flexShrink: 0 },
  rate: { width: 130, flexShrink: 0 },
  revenue: { width: 130, flexShrink: 0 },
} as const

/**
 * What the station's own records say the week is worth.
 *
 * Every rate here is a click target: this is where a wrong rate on file gets
 * corrected, and correcting it re-runs the comparison below.
 */
function WorkSummary({ s }: { s: IvState }) {
  const n = s.vWeek
  const d = s.weekFigures(n)
  const rows = [
    ...d.subrows.map((sr) => ({
      label: sr.name,
      units: sr.actual,
      rate: s.rates[sr.name] ?? sr.rate,
      key: sr.rate != null ? sr.name : null,
      priced: sr.unit,
    })),
    { label: 'Rescues marked paid', units: d.rescues.actual, rate: d.rescues.unit, key: 'Rescues', priced: 0 },
    { label: 'Training sessions', units: d.sessions.actual, rate: d.sessions.unit, key: 'Training', priced: 0 },
    { label: 'Packages delivered', units: d.packages.actual, rate: d.packages.rate, key: 'Packages', priced: 0 },
  ]
  const total = rows.reduce((a, r) => a + r.units * (r.rate ?? r.priced), 0)

  return (
    <div style={{ flexShrink: 0, ...CARD }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-100) var(--size-160)' }}>
        <SectionTitle>Work summary</SectionTitle>
      </div>
      <div style={{ ...HEAD, padding: 'var(--size-100) var(--size-160)' }}>
        <div style={BASE_COLS.label}>Service type</div>
        <div style={{ ...BASE_COLS.units, textAlign: 'right' }}>Units</div>
        <div style={{ ...BASE_COLS.rate, textAlign: 'right' }}>Rate</div>
        <div style={{ ...BASE_COLS.revenue, textAlign: 'right' }}>Revenue</div>
      </div>
      {rows.map((r) => (
        <BaselineRow key={r.label} s={s} row={r} week={n} />
      ))}
      <div
        style={{
          ...ROW,
          padding: 'var(--size-100) var(--size-160)',
          background: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          ...body1Strong,
        }}
      >
        <span style={{ ...BASE_COLS.label, color: 'var(--text-secondary)' }}>Total</span>
        <span style={BASE_COLS.units} />
        <span style={BASE_COLS.rate} />
        <span style={{ ...BASE_COLS.revenue, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{money(total)}</span>
      </div>
    </div>
  )
}

function BaselineRow({
  s,
  row,
  week,
}: {
  s: IvState
  row: { label: string; units: number; rate: number | null; key: string | null; priced: number }
  week: number
}) {
  const [hover, hoverProps] = useHover()
  const [rateHover, rateHoverProps] = useHover()
  const editable = row.rate != null && row.key != null
  const priced = row.rate ?? row.priced
  return (
    <div style={{ ...ROW, padding: 'var(--size-100) var(--size-160)', ...body1, background: hover ? 'var(--surface-subtle)' : undefined, transition: 'background var(--motion-hover)' }} {...hoverProps}>
      <span style={{ ...BASE_COLS.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.label}</span>
      <span style={{ ...BASE_COLS.units, textAlign: 'right', fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>{num(row.units)}</span>
      <div style={{ ...BASE_COLS.rate, display: 'flex', justifyContent: 'flex-end' }}>
        <div
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : undefined}
          onClick={() => { if (editable) s.openEditor(row.key as string, row.rate as number, row.units, week) }}
          title={editable ? 'Change this rate from a day' : 'No rate on file, so this line is priced from the invoice'}
          style={{
            boxSizing: 'border-box',
            height: 28,
            minWidth: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 var(--size-100)',
            borderRadius: 'var(--radius-small)',
            background: 'var(--surface-card)',
            border: `1px solid ${editable ? (rateHover ? 'var(--border-focus)' : 'var(--border-default)') : 'transparent'}`,
            fontWeight: 'var(--weight-semibold)',
            color: editable ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
            cursor: editable ? 'pointer' : 'default',
            transition: 'border-color var(--motion-hover)',
          }}
          {...rateHoverProps}
        >
          {row.rate == null ? '-' : fmtRate(row.rate)}
        </div>
      </div>
      <span style={{ ...BASE_COLS.revenue, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{money(row.units * priced)}</span>
    </div>
  )
}

function Extracted({ s }: { s: IvState }) {
  const n = s.vWeek
  const d = s.weekFigures(n)
  const c = s.comparisonOf(n)
  const rows: [string, string, boolean][] = [
    ['Routes', num(c.routesBilled), false],
    ['Rescues', num(d.rescues.billed), false],
    ['Training sessions', num(d.sessions.billed), false],
    ['Training income', money(d.income.billed), false],
    ['Packages', `${num(d.packages.billed)} · ${money(d.packages.billed * d.packages.unit)}`, false],
    ['Total due', money(billedTotal(d)), true],
  ]
  return (
    <div style={{ flexShrink: 0, ...CARD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-100) var(--size-160)' }}>
        <SectionTitle>Extracted from the invoice</SectionTitle>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {s.cur.source === 'manual' ? 'Entered by hand' : `Invoice_W${n}_2026${s.cur.adjusted ? '_adjusted' : ''}.pdf`}
        </span>
      </div>
      {rows.map(([label, value, strong]) => (
        <div
          key={label}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-160)',
            minHeight: 48,
            padding: 'var(--size-100) var(--size-160)',
            borderTop: '1px solid var(--border-subtle)',
            background: strong ? 'var(--surface-subtle)' : 'transparent',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, ...(strong ? body1Strong : body1) }}>{label}</span>
          <span style={{ fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

const CMP = {
  label: { flex: 1.6, minWidth: 190 },
  billed: { width: 110, flexShrink: 0 },
  actual: { flex: 1, minWidth: 150 },
  rate: { width: 120, flexShrink: 0 },
  diffUnit: { width: 140, flexShrink: 0 },
  diffMoney: { width: 140, flexShrink: 0 },
  status: { width: 110, flexShrink: 0 },
} as const

interface CmpRow {
  key: string
  label: string
  billed: string
  actual: string
  indent?: number
  strong?: boolean
  bg?: string
  expandable?: boolean
  open?: boolean
  onToggle?: () => void
  chip?: string
  chipTitle?: string
  /** The service-type rows carry an editable rate-in-force cell. */
  rateInForce?: number | null
  onRate?: () => void
  diffUnit?: string
  diffUnitColor?: string
  /** The second line under the unit gap: the price difference per block. */
  rateUnit?: string
  rateMoney?: string
  rateColor?: string
  diffMoney?: string
  badge?: 'Match' | 'Mismatch' | null
  mismatch: boolean
}

function ComparisonTable({ s }: { s: IvState }) {
  const n = s.vWeek
  const c = s.comparisonOf(n)
  const d = s.weekFigures(n)
  const rows: CmpRow[] = []

  const routesOk = c.sub.every((x) => !x.mismatch)
  rows.push({
    key: 'routes',
    label: 'Routes',
    strong: true,
    expandable: true,
    open: s.routesOpen,
    onToggle: () => s.setRoutesOpen(!s.routesOpen),
    billed: num(c.routesBilled),
    actual: num(c.routesActual),
    diffUnit: signed(c.routesBilled - c.routesActual),
    diffUnitColor: signColor(c.routesBilled - c.routesActual),
    diffMoney: c.routesBilled === c.routesActual ? '-' : money(c.sub.reduce((a, x) => a + x.countMoney, 0)),
    badge: routesOk ? 'Match' : 'Mismatch',
    mismatch: !routesOk,
  })

  if (s.routesOpen) {
    c.sub.forEach((x: SubComparison) => {
      rows.push({
        key: x.s.name,
        label: x.s.name,
        indent: 26,
        bg: 'var(--surface-subtle)',
        billed: num(x.s.billedQty),
        actual: num(x.s.actual),
        chip: x.s.unmapped ? 'No rate' : undefined,
        chipTitle: x.s.unmapped
          ? 'These invoice lines carry no Amazon service type name, so there is no rate in force to check them against.'
          : undefined,
        rateInForce: x.s.rate,
        onRate: x.s.rate != null ? () => s.openEditor(x.s.name, x.s.rate as number, x.s.actual, n) : undefined,
        diffUnit: signed(x.countGap),
        diffUnitColor: signColor(x.countGap),
        diffMoney: x.countGap === 0 ? '-' : money(x.countMoney),
        rateUnit: x.rateGap !== 0 ? `${x.rateGap > 0 ? '+' : '−'}${money(Math.abs(x.rateGap))}` : undefined,
        rateMoney: x.rateGap !== 0 ? money(x.rateMoney) : undefined,
        rateColor: x.rateGap < 0 ? 'var(--red-600)' : 'var(--green-700)',
        badge: x.mismatch ? 'Mismatch' : 'Match',
        mismatch: x.mismatch,
      })
    })
  }

  const resOk = c.rescueGap === 0
  rows.push({
    key: 'rescues',
    label: 'Rescues',
    billed: num(d.rescues.billed),
    actual: num(d.rescues.actual),
    diffUnit: signed(c.rescueGap),
    diffUnitColor: signColor(c.rescueGap),
    diffMoney: resOk ? '-' : money(Math.abs(c.rescueGap) * d.rescues.unit),
    badge: resOk ? 'Match' : 'Mismatch',
    mismatch: !resOk,
  })
  rows.push({ key: 'sessions', label: 'Training sessions', billed: num(d.sessions.billed), actual: num(d.sessions.actual), badge: 'Match', mismatch: false })
  rows.push({ key: 'income', label: 'Training income', billed: money(d.income.billed), actual: money(d.income.actual), badge: 'Match', mismatch: false })

  const pkgOk = c.pkgGap === 0 && c.pkgRateGap === 0
  rows.push({
    key: 'packages',
    label: 'Packages',
    billed: num(d.packages.billed),
    actual: num(d.packages.actual),
    diffUnit: signed(c.pkgGap),
    diffUnitColor: signColor(c.pkgGap),
    diffMoney: pkgOk ? '-' : money(Math.abs(c.pkgGap) * d.packages.unit),
    badge: pkgOk ? 'Match' : 'Mismatch',
    mismatch: !pkgOk,
  })

  const totOk = Math.abs(c.totalGap) < 0.005
  rows.push({
    key: 'total',
    label: 'Total due',
    strong: true,
    bg: 'var(--surface-subtle)',
    billed: money(billedTotal(d)),
    actual: money(c.derived),
    diffMoney: totOk ? '-' : `${c.totalGap > 0 ? '+' : '−'}${money(Math.abs(c.totalGap))}`,
    diffUnitColor: signColor(totOk ? 0 : c.totalGap),
    // The total is arithmetic, not a claim - it carries no badge of its own.
    badge: null,
    mismatch: false,
  })

  const shown = s.mismatchOnly ? rows.filter((r) => r.mismatch || r.key === 'total') : rows

  return (
    <div style={{ flexShrink: 0, ...CARD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-100) var(--size-160)' }}>
        <SectionTitle>Invoice against the work summary</SectionTitle>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {d.days.matched} of {d.days.matched + d.days.pending} days matched with Amazon
          {d.days.pending ? ` · ${d.days.pending} pending` : ''}
        </span>
        <div style={{ flex: 1 }} />
        <MismatchToggle s={s} />
      </div>

      <div data-rsp-minw="" style={HEAD}>
        <div style={CMP.label}>Line item</div>
        <div style={{ ...CMP.billed, textAlign: 'right' }}>Invoice</div>
        <div style={{ ...CMP.actual, textAlign: 'right' }}>Work summary</div>
        <div style={{ ...CMP.rate, textAlign: 'right' }}>Rate in force</div>
        <div style={{ ...CMP.diffUnit, textAlign: 'right' }}>Unit difference</div>
        <div style={{ ...CMP.diffMoney, textAlign: 'right' }}>$ difference</div>
        <div style={CMP.status}>Status</div>
      </div>

      {shown.map((r) => (
        <ComparisonRow key={r.key} r={r} />
      ))}

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          height: 56,
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          ...body1Strong,
        }}
      >
        <div style={{ ...CMP.label, color: c.count ? 'var(--red-600)' : 'var(--text-secondary)' }}>
          {c.count ? `${c.count} ${c.count === 1 ? 'discrepancy to claim' : 'discrepancies to claim'}` : 'Nothing to claim'}
        </div>
        <div style={CMP.billed} />
        <div style={CMP.actual} />
        <div style={CMP.rate} />
        <div style={CMP.diffUnit} />
        <div style={{ ...CMP.diffMoney, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: c.count ? 'var(--red-600)' : 'var(--text-secondary)' }}>
          {money(c.atStake)}
        </div>
        <div style={CMP.status} />
      </div>
    </div>
  )
}

function MismatchToggle({ s }: { s: IvState }) {
  const [hover, hoverProps] = useHover()
  const on = s.mismatchOnly
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => s.setMismatchOnly(!on)}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--blue-700)' : 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover), border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Mismatches only
      {on && <span style={{ display: 'inline-flex', opacity: 0.7, fontSize: 12 }}>×</span>}
    </div>
  )
}

function ComparisonRow({ r }: { r: CmpRow }) {
  const [hover, hoverProps] = useHover()
  const [rateHover, rateHoverProps] = useHover()
  const cellStyle = {
    ...(r.strong ? body1Strong : body1),
    fontVariantNumeric: 'tabular-nums' as const,
  }
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        height: 56,
        padding: 'var(--size-100) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : r.bg ?? 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div
        role={r.expandable ? 'button' : undefined}
        tabIndex={r.expandable ? 0 : undefined}
        onClick={r.onToggle}
        title={r.expandable ? (r.open ? 'Hide the service types' : 'Show the service types') : undefined}
        style={{
          ...CMP.label,
          borderRadius: 'var(--radius-small)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          paddingLeft: r.indent ?? 0,
          overflow: 'hidden',
          cursor: r.expandable ? 'pointer' : 'default',
        }}
      >
        {r.expandable && (
          <span style={{ width: 20, height: 20, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transform: r.open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
            <Icon name="SvChevron" size={16} />
          </span>
        )}
        <span title={r.label} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...(r.strong ? body1Strong : body1) }}>
          {r.label}
        </span>
        {r.chip && (
          <span title={r.chipTitle} style={{ flexShrink: 0, cursor: 'help' }}>
            <Badge bg="var(--surface-subtle)" border="var(--border-default)" fg="var(--text-secondary)" height={20}>{r.chip}</Badge>
          </span>
        )}
      </div>

      <div style={{ ...CMP.billed, textAlign: 'right', ...cellStyle }}>{r.billed}</div>
      <div style={{ ...CMP.actual, textAlign: 'right', ...cellStyle }}>{r.actual}</div>

      <div style={{ ...CMP.rate, display: 'flex', justifyContent: 'flex-end' }}>
        {r.rateInForce != null && (
          <div
            role="button"
            tabIndex={0}
            onClick={r.onRate}
            title="Rate in force · click to change it"
            style={{
              boxSizing: 'border-box',
              height: 28,
              minWidth: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0 var(--size-100)',
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-card)',
              border: `1px solid ${rateHover ? 'var(--border-focus)' : 'var(--border-default)'}`,
              fontWeight: 'var(--weight-semibold)',
              fontVariantNumeric: 'tabular-nums',
              cursor: 'pointer',
              transition: 'border-color var(--motion-hover)',
            }}
            {...rateHoverProps}
          >
            {fmtRate(r.rateInForce)}
          </div>
        )}
      </div>

      <div style={{ ...CMP.diffUnit, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        <div style={{ ...(r.strong ? body1Strong : body1), fontWeight: 'var(--weight-semibold)', color: r.diffUnitColor ?? 'var(--text-secondary)' }}>
          {r.diffUnit ?? '-'}
        </div>
        {r.rateUnit && <div style={{ ...caption1, color: r.rateColor }}>{r.rateUnit}</div>}
      </div>

      <div style={{ ...CMP.diffMoney, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        <div style={{ ...(r.strong ? body1Strong : body1), fontWeight: 'var(--weight-semibold)', color: r.diffUnitColor ?? 'var(--text-secondary)' }}>
          {r.diffMoney ?? '-'}
        </div>
        {r.rateMoney && <div style={{ ...caption1, color: r.rateColor }}>{r.rateMoney}</div>}
      </div>

      <div style={CMP.status}>
        {r.badge && (
          <Badge
            bg={r.badge === 'Match' ? 'var(--surface-subtle)' : 'var(--red-50)'}
            border={r.badge === 'Match' ? 'var(--border-default)' : 'var(--red-200)'}
            fg={r.badge === 'Match' ? 'var(--text-secondary)' : 'var(--red-600)'}
          >
            {r.badge}
          </Badge>
        )}
      </div>
    </div>
  )
}

/** The claim letter, built from the mismatched lines and editable before it goes. */
function buildDraft(s: IvState, n: number): string {
  const c = s.comparisonOf(n)
  const d = c.d
  const lines: string[] = []
  lines.push(`Invoice dispute - ${weekName(n)} (${weekRange(n)})`)
  lines.push(`Station ${STATION} · invoice total ${money(billedTotal(d))}`)
  lines.push('')
  lines.push(`${c.count} discrepancies · ${money(c.atStake)} claimed`)
  lines.push('')
  c.claims.forEach((cl, i) => lines.push(`${i + 1}. ${cl}`))
  lines.push('')
  lines.push('Actual figures come from the confirmed daily work summary for this week.')
  if (d.days.pending) {
    lines.push(
      `${d.days.matched} of ${d.days.matched + d.days.pending} days are matched with Amazon; ${d.days.pending} are still pending.`,
    )
  }
  if (d.rescues.notMarked) {
    lines.push(
      `${d.rescues.notMarked} rescues this week are not yet marked paid or unpaid. This claim covers the ${d.rescues.actual} marked paid.`,
    )
  }
  return lines.join('\n')
}

function Dispute({ s }: { s: IvState }) {
  const n = s.vWeek
  const cur = s.cur
  const submitted = cur.status === 'dispute'
  const ready = !!s.generated[n] || submitted
  const value = s.drafts[n] ?? buildDraft(s, n)
  const [focus, setFocus] = useState(false)

  return (
    <div style={{ flexShrink: 0, ...CARD, gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
        <SectionTitle>{submitted ? 'Dispute as submitted' : 'Dispute draft'}</SectionTitle>
        {submitted && (
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>
            {cur.disputedOn ? fmtY(cur.disputedOn) : ''} by {cur.decidedBy ?? ''}
            {cur.caseRef ? ` · ${cur.caseRef}` : ''}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {ready && <Button icon="SvCopy" onClick={() => s.toastMsg('Dispute text copied.')}>Copy</Button>}
      </div>

      {ready && (
        <span
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            padding: 'var(--size-100) var(--size-120)',
            border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-medium)',
            background: submitted ? 'var(--surface-subtle)' : 'var(--surface-card)',
            transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
          }}
        >
          <textarea
            value={value}
            readOnly={submitted}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => {
              const v = e.target.value
              s.setDrafts((dr) => ({ ...dr, [n]: v }))
            }}
            rows={10}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', resize: 'vertical', background: 'transparent', ...body1, color: 'var(--text-primary)', padding: 0, fontFamily: 'var(--font-family)' }}
          />
        </span>
      )}

      {!ready && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-160)' }}>
          <span style={{ flex: 1, minWidth: 240, ...body1, color: 'var(--text-secondary)' }}>
            The draft is built from the mismatched lines. You can edit it before you submit.
          </span>
          <Button
            primary
            onClick={() => {
              s.setGenerated((g) => ({ ...g, [n]: true }))
              s.toastMsg('Dispute draft generated. Edit it, then submit.')
            }}
          >
            Draft the dispute
          </Button>
        </div>
      )}
    </div>
  )
}

function Decision({ s }: { s: IvState }) {
  const c = s.comparisonOf(s.vWeek)
  const disputeRecommended = c.count > 0
  return (
    <div
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--size-160)',
        padding: 'var(--size-160)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
      }}
    >
      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
        <span style={{ ...body1Strong, color: disputeRecommended ? 'var(--red-600)' : 'var(--success-fg)' }}>
          {disputeRecommended
            ? `${c.count}${c.count === 1 ? ' discrepancy worth ' : ' discrepancies worth '}${money(c.atStake)}.`
            : 'Every line agrees with the work summary.'}
        </span>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {disputeRecommended ? 'Submitting a dispute is recommended.' : 'Approving is recommended.'}
        </span>
      </div>
      <DecisionButton tone="green" recommended={!disputeRecommended} onClick={() => s.openDialog('approve', s.vWeek)}>
        Approve
      </DecisionButton>
      <DecisionButton tone="red" recommended={disputeRecommended} onClick={() => s.openDialog('dispute', s.vWeek)}>
        Dispute
      </DecisionButton>
    </div>
  )
}
