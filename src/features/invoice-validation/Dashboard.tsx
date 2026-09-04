'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import { Badge, IconButton, Muted, SearchBox, SectionTitle, SortHead } from './parts'
import { CARD, HEAD, ROW } from './style'
import { billedTotal, hasInvoice, statusName, statusTone } from './calc'
import { TODAY } from './data'
import { daysBetween, fmt, weekName, weekRange } from './date'
import { money } from './fmt'
import type { IvState, SortKey } from './useInvoiceValidation'

/**
 * The dashboard.
 *
 * Two fixed charts over the last eight elapsed weeks, then every week that
 * expects an invoice, whatever its state. The default order puts disputes and
 * pending weeks at the top; a column head takes over from there.
 */
export function Dashboard({ s }: { s: IvState }) {
  return (
    <>
      <div data-rsp-c2="" style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-120)' }}>
        <DiscrepancyChart s={s} />
        <DisputeChart s={s} />
      </div>
      <InvoiceTable s={s} />
    </>
  )
}

/** The last eight weeks the station could have been billed for. */
function chartWeeks(s: IvState): number[] {
  return s.elapsed.slice(-8)
}

function DiscrepancyChart({ s }: { s: IvState }) {
  const weeks = chartWeeks(s)
  const counts = weeks.map((w) => (hasInvoice(s.inv[w]) ? s.comparisonOf(w).count : 0))
  const peak = Math.max(...counts, 1)

  return (
    <div style={{ ...CARD, padding: 'var(--size-160)', gap: 'var(--size-160)' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80) var(--size-160)' }}>
        <SectionTitle>Discrepancies by week</SectionTitle>
        <div style={{ flex: 1 }} />
        <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Peak {peak} · W{weeks[0]} to W{weeks[weeks.length - 1]}
        </span>
      </div>
      <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 'var(--size-160)', borderBottom: '1px solid var(--border-default)', padding: '0 var(--size-40)' }}>
        {weeks.map((w, i) => {
          const c = counts[i]
          const i2 = s.inv[w]
          const title = `${weekName(w)} · ${
            hasInvoice(i2)
              ? `${c} ${c === 1 ? 'discrepancy' : 'discrepancies'}`
              : i2.na ? 'no invoice expected' : 'no invoice uploaded'
          }`
          return (
            <div key={w} title={title} style={{ flex: 1, maxWidth: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div
                style={{
                  height: `${Math.round((c / peak) * 100)}%`,
                  // The peak week is the one worth looking at, so it alone
                  // carries the saturated fill.
                  background: c === peak && c > 0 ? 'var(--blue-500)' : 'var(--blue-300)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 'var(--size-160)' }}>
        {weeks.map((w) => (
          <span key={w} style={{ flex: 1, maxWidth: 48, textAlign: 'center', ...caption1, color: 'var(--text-helper)' }}>
            W{w}
          </span>
        ))}
      </div>
    </div>
  )
}

function DisputeChart({ s }: { s: IvState }) {
  const weeks = chartWeeks(s)
  const stake = weeks.map((w) => (s.inv[w].status === 'dispute' ? s.comparisonOf(w).atStake : 0))
  const recovered = weeks.map((w) => s.inv[w].recovered ?? 0)
  // A $500 grid keeps the axis from jumping around as weeks settle.
  const max = Math.max(1000, Math.ceil(Math.max(...stake, ...recovered) / 500) * 500)
  const points = (arr: number[]): string =>
    arr.map((v, i) => `${((i * 300) / (arr.length - 1)).toFixed(1)},${(140 - (v / max) * 130).toFixed(1)}`).join(' ')

  return (
    <div style={{ ...CARD, padding: 'var(--size-160)', gap: 'var(--size-160)' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80) var(--size-160)' }}>
        <SectionTitle>Dispute value by week</SectionTitle>
        <div style={{ flex: 1 }} />
        <LegendKey color="var(--blue-500)">At stake</LegendKey>
        <LegendKey color="var(--neutral-400)">Recovered</LegendKey>
      </div>
      <div style={{ height: 140, position: 'relative', borderBottom: '1px solid var(--border-default)' }}>
        <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, background: 'var(--border-subtle)' }} />
        <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'var(--border-subtle)' }} />
        <svg viewBox="0 0 300 140" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polyline points={points(stake)} fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <polyline points={points(recovered)} fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 'var(--size-160)' }}>
        {weeks.map((w) => (
          <span key={w} style={{ flex: 1, textAlign: 'center', ...caption1, color: 'var(--text-helper)' }}>
            W{w}
          </span>
        ))}
      </div>
    </div>
  )
}

function LegendKey({ color, children }: { color: string; children: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 12, height: 2, background: color, flexShrink: 0 }} />
      {children}
    </span>
  )
}

const COLS = {
  week: { flex: 1.4, minWidth: 170 },
  total: { flex: 1, minWidth: 130 },
  status: { width: 130, flexShrink: 0 },
  disputed: { width: 110, flexShrink: 0 },
  discr: { width: 110, flexShrink: 0 },
  stake: { width: 110, flexShrink: 0 },
} as const

function InvoiceTable({ s }: { s: IvState }) {
  return (
    <div data-rsp-scroll="" style={{ flexShrink: 0, ...CARD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)' }}>
        <SectionTitle>All invoices</SectionTitle>
        <div style={{ flex: 1 }} />
        <FiltersButton s={s} />
        <SearchBox value={s.query} onChange={s.setQuery} placeholder="Search week, status or case reference" />
      </div>

      <div data-rsp-minw="" style={HEAD}>
        <Head s={s} k="week" label="Week" style={COLS.week} />
        <Head s={s} k="total" label="Invoice total" style={COLS.total} align="right" />
        <Head s={s} k="status" label="Status" style={COLS.status} />
        <Head s={s} k="disputed" label="Disputed" style={COLS.disputed} />
        <Head s={s} k="discr" label="Discrepancies" style={COLS.discr} align="right" />
        <Head s={s} k="stake" label="$ at stake" style={COLS.stake} align="right" />
        <div style={{ width: 32, flexShrink: 0 }} />
      </div>

      {s.rows.map((x) => (
        <InvoiceRow key={x} s={s} x={x} />
      ))}

      {s.rows.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>
            {s.query.trim() ? 'No invoices match this search.' : 'No invoices match this filter.'}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => { s.setFilter('All'); s.setQuery('') }}
            style={{ ...body1, color: 'var(--text-link)', cursor: 'pointer' }}
          >
            Show all invoices
          </span>
        </div>
      )}
    </div>
  )
}

function Head({ s, k, label, style, align }: { s: IvState; k: SortKey; label: string; style: object; align?: 'right' }) {
  return (
    <SortHead
      label={label}
      active={s.sortKey === k}
      dir={s.sortDir}
      onClick={() => s.onSort(k)}
      style={style}
      align={align}
    />
  )
}

function FiltersButton({ s }: { s: IvState }) {
  const [hover, hoverProps] = useHover()
  const on = s.filter !== 'All'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { s.closeTransient(); s.setDraftFilter(s.filter); s.setFpOpen(true) }}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: on ? 'var(--blue-700)' : 'var(--text-primary)',
        fontSize: 'var(--body-1-size)',
        lineHeight: 'var(--body-1-lh)',
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {on && (
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
            ...caption1Strong,
          }}
        >
          1
        </span>
      )}
    </div>
  )
}

function InvoiceRow({ s, x }: { s: IvState; x: number }) {
  const [hover, hoverProps] = useHover()
  const [nameHover, nameHoverProps] = useHover()
  const i = s.inv[x]
  const has = hasInvoice(i)
  const c = has ? s.comparisonOf(x) : null
  const tone = statusTone(i)
  const menuOpen = s.menuRow === x

  return (
    <div
      style={{
        ...ROW,
        ...body1,
        background: hover ? 'var(--surface-subtle)' : i.na ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ ...COLS.week, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', overflow: 'hidden', color: i.na ? 'var(--text-disabled)' : 'var(--text-primary)' }}>
        <span
          role="link"
          tabIndex={0}
          title={i.na ? 'No invoice expected for this week' : `Open ${weekName(x)}`}
          onClick={() => { if (!i.na) s.openWeek(x) }}
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            textDecoration: nameHover && !i.na ? 'underline' : 'none',
          }}
          {...nameHoverProps}
        >
          {weekName(x)} · {weekRange(x)}
        </span>
        {i.flagged && (
          <span
            title={`Work summary changed after the decision. Changed days: ${i.flagDays}.`}
            style={{ flexShrink: 0, cursor: 'help' }}
          >
            <Badge bg="var(--warning-bg)" border="var(--warning-border)" fg="var(--warning-fg)">Re-check</Badge>
          </span>
        )}
      </div>

      <div style={{ ...COLS.total, textAlign: 'right', color: has ? 'var(--text-primary)' : 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums' }}>
        {has ? money(billedTotal(s.weekFigures(x))) : '-'}
      </div>

      <div style={{ ...COLS.status, display: 'flex', alignItems: 'center' }}>
        <Badge bg={tone.bg} border={tone.border} fg={tone.fg}>{statusName(i)}</Badge>
      </div>

      <div style={{ ...COLS.disputed, whiteSpace: 'nowrap' }}>
        <Muted>
          {i.status === 'dispute' && i.disputedOn
            ? `${fmt(i.disputedOn)} · ${daysBetween(i.disputedOn, TODAY)} d`
            : '-'}
        </Muted>
      </div>

      <div style={{ ...COLS.discr, textAlign: 'right', color: c && c.count ? 'var(--red-600)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
        {c ? String(c.count) : '-'}
      </div>

      <div style={{ ...COLS.stake, textAlign: 'right', color: i.status === 'dispute' ? 'var(--red-600)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
        {i.status === 'dispute' && c ? money(c.atStake) : '-'}
      </div>

      <div
        data-pop=""
        style={{
          width: 32,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          // The ⋯ hides until the row is under the pointer, unless its own menu
          // is open - closing it by clicking away would otherwise be a chase.
          opacity: hover || menuOpen ? 1 : 0,
          transition: 'opacity var(--duration-faster) var(--curve-linear)',
        }}
      >
        <span style={{ position: 'relative', display: 'flex' }}>
          <IconButton
            name="SvMore"
            title="Row actions"
            onClick={(e) => { e.stopPropagation(); s.setMenuRow(menuOpen ? null : x) }}
          />
          {menuOpen && <RowMenu s={s} x={x} />}
        </span>
      </div>
    </div>
  )
}

interface MenuItem {
  label: string
  run: () => void
  danger?: boolean
}

/** What can be done to a week depends entirely on the state it is in. */
function rowMenu(s: IvState, x: number): MenuItem[] {
  const i = s.inv[x]
  const c = hasInvoice(i) ? s.comparisonOf(x) : null
  const items: MenuItem[] = []
  if (!i.na) items.push({ label: 'Open', run: () => s.openWeek(x) })
  if (i.status === 'pending' && !i.na) {
    items.push({ label: 'No invoice expected', run: () => s.openDialog('na', x) })
    if (i.uploaded) items.push({ label: 'Delete invoice', danger: true, run: () => s.openDialog('delete', x) })
  }
  if (i.na) items.push({ label: 'Expect invoice', run: () => s.openDialog('expect', x) })
  if (i.status === 'validated') {
    items.push({ label: 'Dispute it', run: () => s.openDialog('disputeIt', x) })
    if (i.recovered != null) {
      items.push({
        label: 'Edit $ recovered',
        run: () => s.openDialog('resolve', x, { rec: String(i.recovered), ref: i.caseRef ?? '', note: '' }),
      })
    }
    items.push({ label: 'Revert to pending', run: () => s.openDialog('revert', x) })
  }
  if (i.status === 'dispute') {
    items.push({ label: 'Upload adjusted invoice', run: () => s.openDialog('adjusted', x) })
    items.push({ label: 'Accept it', run: () => s.openDialog('accept', x) })
    items.push({
      label: 'Mark resolved',
      run: () => s.openDialog('resolve', x, { rec: c ? c.atStake.toFixed(2) : '', ref: i.caseRef ?? '', note: '' }),
    })
    items.push({ label: 'Re-dispute it', run: () => s.openWeek(x) })
    items.push({ label: 'Edit case reference', run: () => s.openDialog('ref', x, { ref: i.caseRef ?? '', note: i.notes ?? '' }) })
    items.push({ label: 'Revert to pending', run: () => s.openDialog('revert', x) })
  }
  if (i.flagged) items.push({ label: 'Reviewed, no change', run: () => s.openDialog('reviewed', x) })
  items.push({ label: 'History', run: () => s.openDialog('history', x) })
  return items
}

function RowMenu({ s, x }: { s: IvState; x: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 28,
        right: 0,
        boxSizing: 'border-box',
        minWidth: 230,
        padding: 'var(--size-40)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-20)',
      }}
    >
      {rowMenu(s, x).map((m) => (
        <MenuRow key={m.label} item={m} />
      ))}
    </div>
  )
}

function MenuRow({ item }: { item: MenuItem }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); item.run() }}
      style={{
        boxSizing: 'border-box',
        height: 'var(--row-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        ...body1,
        color: item.danger ? 'var(--red-700)' : 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {item.label}
    </div>
  )
}
