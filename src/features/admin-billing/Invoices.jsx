import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, caption1, caption2 } from '../../ds/type.js'
import { INVOICE_HEADS, INVOICE_STATUS_TONE, YEAR_CHIPS } from './data.js'
import {
  Section,
  StatusPill,
} from './parts.jsx'
import { EYEBROW, FOCUS_RING, useFocusRing } from './ui.js'

// Date 72 + Invoice (flex) + Amount 76 + Status 86 + Actions 72, plus gaps and
// cell padding. Below this the amounts and the status pills collide, so the
// table scrolls sideways in its own box rather than taking the page with it.
const MIN_WIDTH = 560

export function Invoices({ s }) {
  return (
    <Section label="Invoices">
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: 'var(--size-100) var(--space-cell-x)',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <span
            data-field=""
            style={{
              boxSizing: 'border-box',
              width: 240,
              maxWidth: '100%',
              height: 'var(--control-height)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-80)',
              padding: '0 var(--size-100)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--surface-card)',
            }}
          >
            <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
            <input
              placeholder="Search"
              value={s.invQuery}
              onChange={(e) => s.setInvQuery(e.target.value)}
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
          </span>

          <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
            {YEAR_CHIPS.map((y) => (
              <YearChip key={y} label={y} on={s.invYear === y} onPick={() => s.setInvYear(y)} />
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            {s.visibleInvoices.length} of {s.invoiceTotal}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: MIN_WIDTH }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--size-160)',
                padding: 'var(--size-80) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderBottom: '1px solid var(--border-default)',
                ...EYEBROW,
              }}
            >
              {INVOICE_HEADS.map((h) => (
                <HeadCell key={h.label} h={h} sort={s.invSort} onSort={() => s.sortInvoices(h.k)} />
              ))}
            </div>

            {s.visibleInvoices.map((v, i) => (
              <InvoiceRow
                key={v.num}
                v={v}
                s={s}
                flip={i >= s.visibleInvoices.length - 2 && s.visibleInvoices.length > 3}
              />
            ))}

            {s.visibleInvoices.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>No invoices match</span>
                <span onClick={s.clearInvoiceFilters} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
                  Clear filters
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

function YearChip({ label, on, onPick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      {label}
    </div>
  )
}

function HeadCell({ h, sort, onSort }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  const active = sort.col === h.k
  return (
    <div
      onClick={h.k ? onSort : undefined}
      style={{
        boxSizing: 'border-box',
        width: h.w || 'auto',
        flex: h.flex || 'none',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        justifyContent: h.right ? 'flex-end' : h.center ? 'center' : 'flex-start',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: h.k ? 'pointer' : 'default',
        userSelect: 'none',
        borderRadius: 'var(--radius-small)',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        color: active || (hover && h.k) ? 'var(--text-primary)' : 'var(--text-label)',
      }}
      {...hoverProps}
      {...(h.k ? focusProps : {})}
    >
      {h.label}
      {h.k && (
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

function InvoiceRow({ v, s, flip }) {
  const [hover, hoverProps] = useHover()
  const tone = INVOICE_STATUS_TONE[v.status]
  // The invoice for the period being read is tinted, so the meters above and
  // the bill they landed on are visibly the same month.
  const selected = v.month === s.period

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ width: 72, flexShrink: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
        {v.date}
      </div>

      <NumberCell v={v} onOpen={() => s.toast(`Open ${v.num} · ${v.breakdown}`)} />

      {/* The amount carries its own breakdown — plan and overage are never one
          opaque figure. */}
      <div
        title={v.breakdown}
        style={{ width: 76, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums', cursor: 'help' }}
      >
        ${v.amt.toFixed(2)}
      </div>

      <div style={{ width: 86, flexShrink: 0, display: 'flex' }}>
        <StatusPill tone={tone}>{v.status}</StatusPill>
      </div>

      <RowMenu v={v} s={s} flip={flip} />
    </div>
  )
}

function NumberCell({ v, onOpen }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onOpen}
      style={{
        flex: 1,
        minWidth: 0,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      {v.num}
    </div>
  )
}

function RowMenu({ v, s, flip }) {
  const [hover, hoverProps] = useHover()
  const open = s.invMenuFor === v.num
  const items = [
    { label: 'Download PDF', act: () => s.toast(`Download ${v.num}.pdf`) },
    { label: 'View breakdown', act: () => s.toast(v.breakdown) },
    { label: 'Copy invoice number', act: () => s.toast(`Copied ${v.num}`) },
  ]
  return (
    <div style={{ width: 72, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <span
        onClick={(e) => {
          e.stopPropagation()
          s.setInvMenuFor(open ? null : v.num)
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-small)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <Icon name="SvMore" size={16} />
      </span>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            // Upward near the bottom so the table's scroller cannot clip it.
            ...(flip ? { bottom: 26 } : { top: 26 }),
            right: 0,
            boxSizing: 'border-box',
            minWidth: 190,
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-callout)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {items.map((m) => (
            <MenuRow
              key={m.label}
              label={m.label}
              onClick={() => {
                s.setInvMenuFor(null)
                m.act()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuRow({ label, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        ...body1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}
