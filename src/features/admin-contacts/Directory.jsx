import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type.js'
import { CheckBox } from './ReasonGroups.jsx'
import { CHIP_LIMIT, EXPORT_FORMATS } from './data.js'

const HEADS = [
  { k: 'order', label: 'Order', w: '56px' },
  { k: 'who', label: 'Who', f: '1.1', min: '110px' },
  { k: 'title', label: 'Job title', f: '1', min: '100px' },
  { k: null, label: 'Phone', w: '180px' },
  { k: null, label: 'Reasons to call', f: '1.6', min: '150px' },
  { k: null, label: 'Shown', w: '52px', center: true },
  { k: null, label: 'Actions', w: '56px', center: true },
]

const cellBox = (h) => ({
  boxSizing: 'border-box',
  width: h.w || 'auto',
  flex: h.f || 'none',
  minWidth: h.min || 0,
  flexShrink: 0,
  display: 'flex',
  justifyContent: h.center ? 'center' : 'flex-start',
})

const smallControl = (hover) => ({
  boxSizing: 'border-box',
  height: 28,
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
})

function HeadCell({ h, sort, onSort }) {
  const [hover, hoverProps] = useHover()
  const active = sort.col === h.k
  return (
    <div
      onClick={h.k ? onSort : undefined}
      style={{
        ...cellBox(h),
        alignItems: 'center',
        gap: 'var(--size-40)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: h.k ? 'pointer' : 'default',
        userSelect: 'none',
        borderRadius: 'var(--radius-small)',
        color: active || (hover && h.k) ? 'var(--text-primary)' : 'var(--text-label)',
      }}
      {...hoverProps}
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

function ReasonChip({ r, onPick }) {
  return (
    <span
      onClick={onPick}
      title={r.retired ? 'Retired — kept on this contact, never offered to drivers' : ''}
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        // A dashed border means retired — the chip is still here, but no driver
        // is ever offered it.
        border: `1px ${r.retired ? 'dashed var(--border-strong)' : 'solid var(--border-default)'}`,
        ...caption2,
        color: r.retired ? 'var(--text-disabled)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {r.urgent && !r.retired && (
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--danger-accent)', flexShrink: 0 }} />
      )}
      {r.name}
    </span>
  )
}

function Row({ c, index, s, manual, flip }) {
  const [hover, hoverProps] = useHover()
  const held = c.reasons.map((rid) => s.reasons.find((x) => x.id === rid)).filter(Boolean)
  const urgent = held.some((r) => r.urgent && !r.retired)
  const overflow = c.reasons.length - CHIP_LIMIT
  const fg = c.shown ? 'var(--text-primary)' : 'var(--text-disabled)'
  const subFg = c.shown ? 'var(--text-secondary)' : 'var(--text-disabled)'

  return (
    <div
      draggable={manual}
      onDragStart={() => s.beginDrag(c.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        if (manual) s.reorder(c.id)
      }}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        // The left edge marks a visible contact who answers something urgent.
        borderLeft: `3px solid ${urgent && c.shown ? 'var(--danger-accent)' : 'transparent'}`,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        color: fg,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ width: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-40)' }}>
        <span
          title={manual ? 'Drag to reorder — this is the order the app renders' : 'Sort by Order to drag'}
          style={{
            display: 'flex',
            color: manual ? 'var(--text-disabled)' : 'var(--border-subtle)',
            cursor: manual ? 'grab' : 'default',
          }}
        >
          <Icon name="SvDrag" size={14} />
        </span>
        <span style={{ color: subFg, fontVariantNumeric: 'tabular-nums' }}>{index + 1}</span>
      </div>

      <EditLink onClick={() => s.openForm(c)}>{c.who}</EditLink>

      <div style={{ flex: 1, minWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: subFg }}>
        {c.title || '-'}
      </div>
      <div style={{ width: 180, flexShrink: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {c.phone}
      </div>

      <div style={{ flex: 1.6, minWidth: 150, display: 'flex', gap: 'var(--size-40)', flexWrap: 'wrap', alignItems: 'center' }}>
        {held.slice(0, CHIP_LIMIT).map((r) => (
          <ReasonChip
            key={r.id}
            r={r}
            onPick={(e) => {
              e.stopPropagation()
              if (!r.retired) s.setReasonFilter([r.id])
            }}
          />
        ))}
        {overflow > 0 && (
          <span
            title={held.slice(CHIP_LIMIT).map((r) => r.name).join(' · ')}
            style={{ ...caption2, color: 'var(--text-helper)', cursor: 'help' }}
          >
            +{overflow}
          </span>
        )}
      </div>

      <div style={{ width: 52, flexShrink: 0, textAlign: 'center', color: c.shown ? 'var(--success-fg)' : 'var(--text-disabled)' }}>
        {c.shown ? '✓' : '-'}
      </div>

      <RowMenu c={c} s={s} flip={flip} />
    </div>
  )
}

function EditLink({ children, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1.1,
        minWidth: 110,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...caption1Strong,
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function RowMenu({ c, s, flip }) {
  const open = s.menuFor === c.id
  const items = [
    { label: 'Edit', act: () => s.openForm(c) },
    {
      label: 'Duplicate',
      act: () => {
        s.setContacts((cs) => {
          const i = cs.findIndex((v) => v.id === c.id)
          const next = cs.slice()
          next.splice(i + 1, 0, { ...c, id: Date.now(), who: `${c.who} (copy)` })
          return next
        })
        s.setMenuFor(null)
        s.toast(`Duplicated: ${c.who}`)
      },
    },
    {
      // Hiding keeps a contact's place in the order.
      label: c.shown ? 'Hide' : 'Show',
      act: () => {
        s.setContacts((cs) => cs.map((v) => (v.id === c.id ? { ...v, shown: !v.shown } : v)))
        s.setMenuFor(null)
      },
    },
    { label: 'Delete', color: 'var(--danger-fg)', act: () => { s.setDelFor(c.id); s.setMenuFor(null) } },
  ]
  return (
    <div style={{ width: 56, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <MenuTrigger
        onClick={(e) => {
          e.stopPropagation()
          s.setOpenDrop(null)
          s.setMenuFor(open ? null : c.id)
        }}
      />
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            // Opening upward keeps the menu inside the table's horizontal
            // scroller; a downward menu on the last rows would be clipped.
            ...(flip ? { bottom: 26 } : { top: 26 }),
            right: 0,
            boxSizing: 'border-box',
            minWidth: 160,
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
            <MenuRow key={m.label} color={m.color} onClick={m.act}>
              {m.label}
            </MenuRow>
          ))}
        </div>
      )}
    </div>
  )
}

function MenuTrigger({ onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
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
  )
}

function MenuRow({ children, onClick, color }) {
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
        color: color || 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function SmallButton({ children, onClick, primary }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={
        primary
          ? {
              boxSizing: 'border-box',
              height: 28,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-100)',
              borderRadius: 'var(--radius-small)',
              background: hover ? 'var(--primary-hover)' : 'var(--primary)',
              color: 'var(--text-inverse)',
              ...caption1Strong,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'background var(--motion-hover)',
            }
          : smallControl(hover)
      }
      {...hoverProps}
    >
      {children}
    </div>
  )
}

// The reason filter is a searchable multi-select; picked reasons float to the
// top so the current filter stays visible while you search for the next one.
function ReasonFilter({ s }) {
  const open = s.openDrop === 'reason'
  const q = s.rdQ.trim().toLowerCase()
  const items = s.live
    .filter((r) => !q || r.name.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => (s.reasonFilter.includes(a.id) ? 0 : 1) - (s.reasonFilter.includes(b.id) ? 0 : 1))

  const placeholder = s.reasonFilter.length
    ? s.reasonFilter.length === 1
      ? s.nameOf(s.reasonFilter[0])
      : `${s.reasonFilter.length} reasons`
    : 'All reasons'

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <span
        data-field=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 200,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          cursor: 'text',
        }}
      >
        <input
          value={s.rdQ}
          onChange={(e) => {
            s.setRdQ(e.target.value)
            s.setOpenDrop('reason')
            s.setMenuFor(null)
          }}
          onFocus={() => {
            s.setOpenDrop('reason')
            s.setMenuFor(null)
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-family)',
            ...caption1,
            color: 'var(--text-primary)',
            padding: 0,
          }}
        />
      </span>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 31,
            left: 0,
            boxSizing: 'border-box',
            width: 200,
            maxHeight: 260,
            overflow: 'hidden auto',
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {items.map((r) => {
            const on = s.reasonFilter.includes(r.id)
            const n = s.countFor(r.id)
            return (
              <FilterRow
                key={r.id}
                label={r.name}
                on={on}
                count={n}
                onClick={() =>
                  s.setReasonFilter((f) => (on ? f.filter((v) => v !== r.id) : f.concat([r.id])))
                }
              />
            )
          })}
          {items.length === 0 && (
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', ...caption1, color: 'var(--text-secondary)' }}>
              No match
            </div>
          )}
        </div>
      )}
    </span>
  )
}

function FilterRow({ label, on, count, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <CheckBox on={on} />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {/* Zero contacts is a warning, not a neutral fact — nobody answers it. */}
      <span style={{ ...caption2, color: count === 0 ? 'var(--warning-fg)' : 'var(--text-helper)' }}>{count}</span>
    </div>
  )
}

export function Directory({ s }) {
  const q = s.q.trim().toLowerCase()
  let visible = s.contacts.filter(
    (c) =>
      (!q || `${c.who} ${c.title} ${c.phone}`.toLowerCase().includes(q)) &&
      (!s.reasonFilter.length || s.reasonFilter.some((rf) => c.reasons.includes(rf))),
  )

  // Manual order IS the order the driver's app renders, so dragging is only
  // offered while that is the active sort.
  const manual = s.sort.col === 'order'
  if (!manual) {
    const key = (c) => (s.sort.col === 'title' ? c.title : c.who)
    visible = visible.slice().sort((a, b) => key(a).localeCompare(key(b)) * (s.sort.dir === 'asc' ? 1 : -1))
  }

  const zeroText =
    s.contacts.length === 0
      ? 'No contacts yet — until you add one, a driver’s Help screen offers only the station line'
      : s.reasonFilter.length
        ? 'No contacts match — nobody covers this reason'
        : 'No contacts match'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <span
        style={{
          ...caption1Strong,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          color: 'var(--text-label)',
        }}
      >
        Directory
      </span>
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
            flexWrap: 'wrap',
            gap: 'var(--size-80) var(--size-120)',
            padding: 'var(--size-100) var(--space-cell-x)',
            borderBottom: '1px solid var(--border-subtle)',
            borderLeft: '3px solid transparent',
          }}
        >
          <span
            data-field=""
            style={{
              boxSizing: 'border-box',
              width: 240,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-80)',
              padding: '0 var(--size-100)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-card)',
            }}
          >
            <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
            <input
              placeholder="Search name, title or phone"
              value={s.q}
              onChange={(e) => s.setQ(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-family)',
                ...caption1,
                color: 'var(--text-primary)',
                padding: 0,
              }}
            />
          </span>

          <ReasonFilter s={s} />

          <div style={{ flex: 1 }} />

          <span style={{ position: 'relative', display: 'flex' }}>
            <SmallButton onClick={s.toggleDrop('export')}>
              Export
              <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
                <Icon name="SvChevron" size={12} />
              </span>
            </SmallButton>
            {s.openDrop === 'export' && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 31,
                  right: 0,
                  boxSizing: 'border-box',
                  width: 120,
                  padding: 'var(--size-40)',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-medium)',
                  boxShadow: 'var(--elevation-menu)',
                  zIndex: 40,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {EXPORT_FORMATS.map((f) => (
                  <MenuRow
                    key={f}
                    onClick={() => {
                      s.setOpenDrop(null)
                      s.toast(`Exported ${visible.length} contacts as ${f} · filters applied`)
                    }}
                  >
                    {f}
                  </MenuRow>
                ))}
              </div>
            )}
          </span>

          <SmallButton primary onClick={() => s.openForm(null)}>
            + Add contact
          </SmallButton>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 860 }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--size-160)',
                padding: 'var(--size-80) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderBottom: '1px solid var(--border-default)',
                borderLeft: '3px solid transparent',
                ...caption2Strong,
                letterSpacing: '.6px',
                textTransform: 'uppercase',
                color: 'var(--text-label)',
              }}
            >
              {HEADS.map((h) => (
                <HeadCell
                  key={h.label}
                  h={h}
                  sort={s.sort}
                  onSort={() =>
                    s.setSort((v) => ({
                      col: h.k,
                      dir: v.col === h.k ? (v.dir === 'asc' ? 'desc' : 'asc') : 'asc',
                    }))
                  }
                />
              ))}
            </div>

            {visible.map((c, i) => (
              <Row
                key={c.id}
                c={c}
                index={s.contacts.indexOf(c)}
                s={s}
                manual={manual}
                flip={i >= visible.length - 2 && visible.length > 3}
              />
            ))}

            {visible.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)', textAlign: 'center' }}>{zeroText}</span>
                <span
                  onClick={() => {
                    s.setQ('')
                    s.setReasonFilter([])
                    s.setRdQ('')
                  }}
                  style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}
                >
                  Clear filters
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
