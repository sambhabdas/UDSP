'use client'

import type { CSSProperties } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { fmtD, fromIso, int, money, cents } from './calc'
import type { RateWindow } from './data'
import { Badge, CardTitle, PrimaryButton, RateCell, SortGlyph, Switch } from './parts'
import { CARD, HEAD } from './ui'
import type { RateCardsState, SortKey } from './useRateCards'

/** The eight columns, and the widths every row repeats. */
const COLS: { key: SortKey; label: string; style: CSSProperties }[] = [
  { key: 'name', label: 'Service type', style: { flex: 1, minWidth: 160 } },
  { key: 'hours', label: 'Hours', style: { width: 64, flexShrink: 0, justifyContent: 'flex-end' } },
  { key: 'paid', label: 'Paid by', style: { width: 96, flexShrink: 0 } },
  { key: 'rate', label: 'Rate per route', style: { width: 120, flexShrink: 0, justifyContent: 'flex-end' } },
  { key: 'from', label: 'From', style: { width: 108, flexShrink: 0 } },
  { key: 'to', label: 'To', style: { width: 108, flexShrink: 0 } },
  { key: 'routes', label: 'Routes', style: { width: 80, flexShrink: 0, justifyContent: 'flex-end' } },
  { key: 'revenue', label: 'Revenue', style: { width: 120, flexShrink: 0, justifyContent: 'flex-end' } },
]

const ROW: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-160)',
  minHeight: 48,
  padding: 'var(--size-100) var(--space-cell-x)',
  borderBottom: '1px solid var(--border-subtle)',
  ...body1,
  transition: 'background var(--motion-hover)',
}

function HeadCell({
  col,
  s,
}: {
  col: (typeof COLS)[number]
  s: RateCardsState
}) {
  const [hover, hoverProps] = useHover()
  const active = s.sortKey === col.key
  return (
    <div
      onClick={() => s.sortBy(col.key)}
      title={`Sort by ${col.label.toLowerCase()}`}
      style={{
        ...col.style,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none',
        color: active || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      {col.label}
      <SortGlyph active={active} dir={s.sortDir} />
    </div>
  )
}

function Row({ r, s }: { r: RateCardsState['rowData'][number]; s: RateCardsState }) {
  const [hover, hoverProps] = useHover()
  const { t, w } = r
  const dsp = t.paidBy === 'DSP'
  return (
    <div
      style={{ ...ROW, background: hover ? 'var(--surface-subtle)' : 'transparent' }}
      {...hoverProps}
    >
      <div style={COLS[0].style}>
        <TypeName
          name={t.name}
          dsp={dsp}
          onClick={() => s.toast('Service types are created and edited on Work Summary.')}
        />
      </div>

      <div
        style={{
          ...COLS[1].style,
          textAlign: 'right',
          fontWeight: 'var(--weight-semibold)',
          color: dsp ? 'var(--text-secondary)' : 'var(--primary)',
        }}
      >
        {t.hours} hr
      </div>

      <div style={{ ...COLS[2].style, display: 'flex', alignItems: 'center' }}>
        {dsp ? (
          <Badge
            bg="var(--danger-bg)"
            border="var(--danger-border)"
            fg="var(--danger-fg)"
            dot="var(--danger-accent)"
          >
            DSP
          </Badge>
        ) : (
          <Badge bg="var(--info-bg)" border="var(--info-border)" fg="var(--info-fg)">
            Amazon
          </Badge>
        )}
      </div>

      <div style={{ ...COLS[3].style, display: 'flex', justifyContent: 'flex-end' }}>
        <RateCell
          onClick={() => s.openEditor(t.id, null)}
          title={
            dsp
              ? 'The DSP pays for these, so the rate is locked at $0.00'
              : 'Change this rate from a day'
          }
          bg={dsp ? 'var(--surface-subtle)' : 'var(--surface-card)'}
          border={w ? (dsp ? 'var(--border-subtle)' : 'var(--border-default)') : 'var(--warning-border)'}
          hoverBorder={dsp ? 'var(--border-subtle)' : 'var(--border-focus)'}
          fg={dsp ? 'var(--text-disabled)' : w ? 'var(--text-primary)' : 'var(--warning-fg)'}
          cursor={dsp ? 'default' : 'pointer'}
        >
          {w ? money(w.rate) : 'Set a rate'}
        </RateCell>
      </div>

      <div
        style={{
          ...COLS[4].style,
          ...caption1,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--text-secondary)',
        }}
      >
        {w && !dsp ? (
          <FromLink
            label={fmtD(fromIso(w.from))}
            onClick={() =>
              s.toast(`Opens ${fmtD(fromIso(w.from))} in Profit Projection.`)
            }
          />
        ) : (
          <span>{w ? fmtD(fromIso(w.from)) : '-'}</span>
        )}
      </div>

      <div
        style={{
          ...COLS[5].style,
          ...caption1,
          color: dsp
            ? 'var(--text-disabled)'
            : w && !w.to
              ? 'var(--success-fg)'
              : 'var(--text-secondary)',
        }}
      >
        {dsp ? 'Locked' : w ? (w.to ? fmtD(fromIso(w.to)) : 'No end') : '-'}
      </div>

      <div style={{ ...COLS[6].style, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {int(r.routes)}
      </div>

      <div
        style={{
          ...COLS[7].style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--size-60)',
        }}
      >
        {/* A range that spans a rate change says so, rather than letting one
            number imply one price. */}
        {r.rateCount > 1 && (
          <span
            title="This range spans a rate change. Each day is priced with the rate in force on it."
            style={{
              boxSizing: 'border-box',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-60)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--caption-2-size)',
              lineHeight: 'var(--caption-2-lh)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              cursor: 'help',
            }}
          >
            {r.rateCount} rates
          </span>
        )}
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: dsp ? 'var(--text-disabled)' : 'var(--text-primary)',
          }}
        >
          {money(r.rev)}
        </span>
      </div>
    </div>
  )
}

function TypeName({ name, dsp, onClick }: { name: string; dsp: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title="Service types are created and edited on Work Summary"
      style={{
        cursor: 'pointer',
        color: dsp ? 'var(--text-secondary)' : 'var(--text-primary)',
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      {name}
    </span>
  )
}

function FromLink({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title={`Open ${label} in Profit Projection`}
      style={{ cursor: 'pointer', textDecoration: hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      {label}
    </span>
  )
}

export function RateTable({ s }: { s: RateCardsState }) {
  return (
    <div style={CARD}>
      <CardTitle
        trailing={
          <>
            <FilterButton s={s} />
            <PrimaryButton onClick={s.openAdd}>Add service</PrimaryButton>
          </>
        }
      >
        Amazon Route Rates
      </CardTitle>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          ...HEAD,
        }}
      >
        {COLS.map((c) => (
          <HeadCell key={c.key} col={c} s={s} />
        ))}
      </div>

      {s.rowData.map((r) => (
        <Row key={r.t.id} r={r} s={s} />
      ))}

      {/* The footer carries the add affordance a second time, under the column
          it adds to. */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          minHeight: 44,
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          ...body1,
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ ...COLS[0].style, display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
          {s.totals.types} {s.totals.types === 1 ? 'service type' : 'service types'}
          {s.filtered && (
            <Badge bg="var(--info-bg)" border="var(--info-border)" fg="var(--info-fg)">
              filtered
            </Badge>
          )}
        </div>
        <div style={COLS[1].style} />
        <div style={COLS[2].style} />
        <div style={{ ...COLS[3].style, display: 'flex', justifyContent: 'flex-end' }}>
          <AddSquare onClick={s.openAdd} />
        </div>
        <div style={COLS[4].style} />
        <div style={COLS[5].style} />
        <div style={{ ...COLS[6].style, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {int(s.totals.routes)}
        </div>
        <div style={{ ...COLS[7].style, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {money(s.totals.revenue)}
        </div>
      </div>
    </div>
  )
}

function AddSquare({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title="Add a service type"
      style={{
        boxSizing: 'border-box',
        width: 24,
        height: 24,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        border: '1px solid var(--border-default)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--primary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      +
    </span>
  )
}

function FilterButton({ s }: { s: RateCardsState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.appliedCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}>
        <Icon name="FnFilter" size={16} />
      </span>
      Filters
      {s.appliedCount > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            padding: '0 var(--size-40)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
            color: 'var(--text-inverse)',
            fontSize: 'var(--caption-1-size)',
            lineHeight: 'var(--caption-1-lh)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {s.appliedCount}
        </span>
      )}
    </div>
  )
}

// ---- Others -----------------------------------------------------------------

/** Packages and training: paid per unit rather than per route, and switchable
 *  off - but the switch is a dated change like any other. */
export function OthersTable({ s }: { s: RateCardsState }) {
  const rows = [
    {
      name: 'Delivered packages',
      kind: 'package' as const,
      win: s.others.pkg.win,
      count: s.others.pkg.count,
      revenue: s.others.pkg.revenue,
      fmt: cents,
    },
    {
      name: 'Per training',
      kind: 'training' as const,
      win: s.others.train.win,
      count: s.others.train.count,
      revenue: s.others.train.revenue,
      fmt: money,
    },
  ]

  return (
    <div style={CARD}>
      <CardTitle>Others</CardTitle>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          ...HEAD,
        }}
      >
        <div style={{ flex: 1, minWidth: 160, marginRight: 192 }}>Name</div>
        <div style={{ width: 120, flexShrink: 0, textAlign: 'right' }}>Rate</div>
        <div style={{ width: 108, flexShrink: 0 }}>From</div>
        <div style={{ width: 108, flexShrink: 0 }}>To</div>
        <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Units</div>
        <div style={{ width: 120, flexShrink: 0, textAlign: 'right' }}>Revenue</div>
      </div>

      {rows.map((row) => (
        <OtherRow key={row.kind} row={row} s={s} />
      ))}
    </div>
  )
}

function OtherRow({
  row,
  s,
}: {
  row: {
    name: string
    kind: 'package' | 'training'
    win: RateWindow | null
    count: number
    revenue: number
    fmt: (n: number) => string
  }
  s: RateCardsState
}) {
  const [hover, hoverProps] = useHover()
  const on = !!row.win?.paid
  return (
    <div
      style={{ ...ROW, background: hover ? 'var(--surface-subtle)' : 'transparent' }}
      {...hoverProps}
    >
      <div
        style={{
          flex: 1,
          minWidth: 160,
          marginRight: 192,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-100)',
        }}
      >
        <Switch
          on={on}
          onClick={() => s.openEditor(null, null, row.kind)}
          title="Turning this off is dated like every other change"
        />
        <span>{row.name}</span>
      </div>
      <div style={{ width: 120, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <RateCell
          onClick={() => s.openEditor(null, null, row.kind)}
          title="Change this rate from a day"
          fg={on ? 'var(--text-primary)' : 'var(--text-secondary)'}
        >
          {on && row.win ? row.fmt(row.win.rate) : 'off'}
        </RateCell>
      </div>
      <div style={{ width: 108, flexShrink: 0, ...caption1, color: 'var(--text-secondary)' }}>
        {row.win ? fmtD(fromIso(row.win.from)) : '-'}
      </div>
      <div
        style={{
          width: 108,
          flexShrink: 0,
          ...caption1,
          color: on && !row.win?.to ? 'var(--success-fg)' : 'var(--text-secondary)',
        }}
      >
        {row.win ? (row.win.to ? fmtD(fromIso(row.win.to)) : 'No end') : '-'}
      </div>
      <div style={{ width: 80, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {int(row.count)}
      </div>
      <div
        style={{
          width: 120,
          flexShrink: 0,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: row.revenue ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {money(row.revenue)}
      </div>
    </div>
  )
}
