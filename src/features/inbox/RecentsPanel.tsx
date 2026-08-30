import type { Person, QueueFilter } from './data'
import { Icon } from '../../ds/icons/Icon'
import { FilterChip } from '../../ds/components/Chip'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type'
import { FILTERS, initials, tint } from './data'

function RecentRow({
  person,
  selected,
  onSelect,
}: {
  person: Person
  selected: boolean
  onSelect: () => void
}) {
  const [hover, hoverProps] = useHover()
  const [avBg, avFg] = tint(person.name)
  const missedLast = Boolean(person.last?.miss)
  const glyph =
    person.last?.ch === 'call' ? 'IbCall' : person.last?.ch === 'email' ? 'IbMail' : 'IbChat'

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        padding: 'var(--size-100) var(--size-120)',
        background: selected
          ? 'var(--blue-50)'
          : hover
            ? 'var(--surface-subtle)'
            : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {/* Selection is two channels — a 2px accent bar plus the tinted plate. */}
      {selected && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--primary)',
          }}
        />
      )}
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-circle)',
          background: avBg,
          color: avFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...caption1Strong,
          flexShrink: 0,
        }}
      >
        {initials(person.name)}
      </span>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <span
            style={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...caption1Strong,
            }}
          >
            {person.name}
          </span>
          {person.onRoute && (
            <span
              title="On route"
              style={{
                width: 6,
                height: 6,
                borderRadius: 'var(--radius-circle)',
                background: 'var(--green-500)',
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', minWidth: 0 }}
        >
          <span style={{ display: 'flex', flexShrink: 0 }}>
            <Icon
              name={glyph}
              size={12}
              color={missedLast ? 'var(--red-600)' : 'var(--text-helper)'}
            />
          </span>
          <span
            style={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...caption1,
              color: missedLast ? 'var(--red-600)' : 'var(--text-secondary)',
            }}
          >
            {person.last?.snip}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 'var(--size-40)',
          flexShrink: 0,
        }}
      >
        <span style={{ ...caption2, color: 'var(--text-helper)' }}>{person.last?.t}</span>
        {person.unread > 0 && (
          <span
            style={{
              boxSizing: 'border-box',
              minWidth: 16,
              height: 16,
              padding: '0 var(--size-40)',
              borderRadius: 'var(--radius-pill)',
              background: person.missed ? 'var(--red-500)' : 'var(--primary)',
              color: 'var(--text-inverse)',
              ...caption2Strong,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {person.unread}
          </span>
        )}
      </div>
    </div>
  )
}

export function RecentsPanel({
  rows,
  selectedId,
  onSelect,
  filter,
  onFilter,
  isDrawer = false,
  open = false,
  onClose,
}: {
  rows: Person[]
  selectedId: string
  onSelect: (id: string) => void
  filter: QueueFilter
  onFilter: (f: QueueFilter) => void
  isDrawer?: boolean
  open?: boolean
  onClose: () => void
}) {
  // Below the two-column fold Recents becomes a left drawer, mirroring what the
  // decision rail already does on the right.
  const hidden = isDrawer && !open
  return (
    <div
      style={{
        boxSizing: 'border-box',
        minHeight: 0,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: isDrawer ? 0 : 'var(--radius-medium)',
        display: hidden ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(isDrawer && {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 'min(300px, 85vw)',
          boxShadow: 'var(--elevation-drawer)',
          zIndex: 6,
        }),
      }}
    >
      {isDrawer && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            padding: 'var(--size-120) var(--size-120) 0 var(--size-120)',
          }}
        >
          <span style={{ ...body1Strong }}>Recents</span>
          <div style={{ flex: 1 }} />
          <CloseButton onClick={onClose} />
        </div>
      )}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-80)',
          padding: 'var(--size-120) var(--size-120) var(--size-100) var(--size-120)',
        }}
      >
        <span
          data-field=""
          style={{
            boxSizing: 'border-box',
            height: 'var(--control-height)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: '0 var(--size-120)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-page)',
          }}
        >
          <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
          <input
            placeholder="Search recents"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...caption1,
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
        </span>
        <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              selected={filter === f}
              onSelect={() => onFilter(f)}
            />
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-default)', flexShrink: 0 }} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto' }}>
        {rows.map((p) => (
          <RecentRow
            key={p.id}
            person={p}
            selected={p.id === selectedId}
            onSelect={() => onSelect(p.id)}
          />
        ))}
        {rows.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--size-80)',
              padding: 'var(--size-320) var(--size-160)',
              textAlign: 'center',
            }}
          >
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              {filter === 'Unread'
                ? "Nothing unread — you're caught up"
                : 'No missed calls or voicemails'}
            </span>
            <span
              onClick={() => onFilter('All')}
              style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}
            >
              Show all
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-medium)',
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
      <Icon name="IbDismiss" size={16} />
    </span>
  )
}
