import type { Reason } from './data'

/** Which reason is being renamed inline, and the text so far. */
export interface RenameState {
  id: number | null
  val: string
}
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2 } from '../../ds/type'

// The grouped, collapsible reason list. Both the Reasons panel and the contact
// form render it — the panel selects reasons to act on in bulk, the form
// selects the ones a contact answers for.

export function CheckBox({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
        fontSize: 10,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {on ? '✓' : ''}
    </span>
  )
}

// The count is the honest bit: 0 means no driver will ever be offered this
// reason, and "n · hidden" means contacts hold it but none of them are visible.
function reachOf(r: Reason, total: number, visible: number): { text: string; color: string } {
  if (r.retired) return { text: 'Retired', color: 'var(--text-disabled)' }
  if (total === 0) return { text: '0', color: 'var(--warning-fg)' }
  if (visible === 0) return { text: `${total} · hidden`, color: 'var(--warning-fg)' }
  return { text: String(total), color: 'var(--text-helper)' }
}

function GroupHeader({
  cat,
  meta,
  open,
  onToggle,
}: {
  cat: string
  meta: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        minHeight: 30,
        padding: 'var(--size-20) var(--size-120)',
        background: 'var(--surface-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <span
        style={{
          display: 'flex',
          color: 'var(--text-secondary)',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform var(--motion-move)',
        }}
      >
        <Icon name="SvChevron" size={12} />
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          ...caption1Strong,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        {cat}
      </span>
      <span style={{ ...caption2, color: 'var(--text-helper)' }}>{meta}</span>
    </div>
  )
}

function ReasonRow({
  r,
  on,
  total,
  visible,
  showUrgent,
  rename,
  setRename,
  onCommitRename,
  onToggle,
}: {
  r: Reason
  on: boolean
  total: number
  visible: number
  showUrgent?: boolean
  rename: RenameState
  setRename: (v: RenameState) => void
  onCommitRename: (r: Reason) => void
  onToggle: () => void
}) {
  const [hover, hoverProps] = useHover()
  const renaming = rename.id === r.id
  const reach = reachOf(r, total, visible)
  const label = r.cat !== r.name ? `${r.cat} - ${r.name}` : r.name

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        minHeight: 30,
        padding: 'var(--size-20) var(--size-120)',
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <CheckBox on={on} onClick={onToggle} />
      {/* Urgent is a red dot as well as a pinned position — never colour alone. */}
      {showUrgent && r.urgent && !r.retired && (
        <span
          title="Urgent — pinned to the top of the driver's Help screen"
          style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--danger-accent)', flexShrink: 0 }}
        />
      )}
      {renaming ? (
        <span
          data-field=""
          style={{
            flex: 1,
            boxSizing: 'border-box',
            height: 24,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-80)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            background: 'var(--surface-card)',
          }}
        >
          <input
            autoFocus
            value={rename.val}
            onChange={(e) => setRename({ id: r.id, val: e.target.value })}
            onBlur={() => onCommitRename(r)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(r)
              if (e.key === 'Escape') setRename({ id: null, val: '' })
            }}
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
      ) : (
        <span
          onClick={(e) => {
            e.stopPropagation()
            setRename({ id: r.id, val: r.name })
          }}
          title="Tap to rename — it renames on every contact that holds it"
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...(on ? caption1Strong : caption1),
            color: r.retired ? 'var(--text-disabled)' : 'var(--text-primary)',
            cursor: 'text',
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          width: 70,
          flexShrink: 0,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: reach.color,
        }}
      >
        {reach.text}
      </span>
    </div>
  )
}

export function ReasonGroups({
  pool,
  categories,
  query,
  cat,
  collapsed,
  onToggleGroup,
  selectedIds,
  onToggleReason,
  countFor,
  visibleCountFor,
  showUrgent,
  metaLabel,
  rename,
  setRename,
  onCommitRename,
  extraCats = [],
}: {
  pool: Reason[]
  categories: string[]
  query: string
  cat: string
  collapsed: string[]
  onToggleGroup: (c: string) => void
  selectedIds: number[]
  onToggleReason: (id: number) => void
  countFor: (id: number) => number
  visibleCountFor: (id: number) => number
  showUrgent?: boolean
  metaLabel: (picked: number, total: number) => string
  rename: RenameState
  setRename: (v: RenameState) => void
  onCommitRename: (r: Reason) => void
  extraCats?: string[]
}) {
  const q = query.trim().toLowerCase()

  const groups = categories
    .filter((c) => cat === 'All' || c === cat)
    .map((c) => {
      const rows = pool
        .filter((r) => r.cat === c)
        .filter((r) => !q || r.name.toLowerCase().includes(q) || `${c} - ${r.name}`.toLowerCase().includes(q))
      const total = pool.filter((r) => r.cat === c).length
      const picked = pool.filter((r) => r.cat === c && selectedIds.includes(r.id)).length
      // Searching forces every matching group open — a hit must never hide.
      const open = q ? true : !collapsed.includes(c)
      return { cat: c, rows, open, meta: metaLabel(picked, total) }
    })
    .filter((g) => g.rows.length > 0 || (!q && extraCats.includes(g.cat)))

  return (
    <>
      {groups.map((g) => (
        <div key={g.cat} style={{ display: 'contents' }}>
          <GroupHeader cat={g.cat} meta={g.meta} open={g.open} onToggle={() => onToggleGroup(g.cat)} />
          {g.open &&
            g.rows.map((r) => (
              <ReasonRow
                key={r.id}
                r={r}
                on={selectedIds.includes(r.id)}
                total={countFor(r.id)}
                visible={visibleCountFor(r.id)}
                showUrgent={showUrgent}
                rename={rename}
                setRename={setRename}
                onCommitRename={onCommitRename}
                onToggle={() => onToggleReason(r.id)}
              />
            ))}
        </div>
      ))}
    </>
  )
}
