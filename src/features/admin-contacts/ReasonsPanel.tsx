import type { ChangeEventHandler, MouseEvent, ReactNode } from 'react'
import type { ContactsState } from './useAdminContacts'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type'
import { ReasonGroups } from './ReasonGroups'
import { REASONS_HELP } from './data'

export function InfoDot({ title, size = 14 }: { title: string; size?: number }) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box',
        width: size,
        height: size,
        borderRadius: 'var(--radius-circle)',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-secondary)',
        ...caption2Strong,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      i
    </span>
  )
}

export function ToneButton({
  children,
  onClick,
  tone,
}: {
  children?: ReactNode
  onClick?: () => void
  /** A tinted ramp: 100 fill, 200 hairline, 700 text. */
  tone: { bg: string; border: string; fg: string }
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        color: tone.fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        filter: hover ? 'brightness(0.97)' : 'none',
        transition: 'filter var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  flex,
}: {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  flex?: number | string
}) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box',
        flex,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
      }}
    >
      <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
      <input
        value={value}
        onChange={onChange}
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
  )
}

// A category picker that also creates: typing a name that already exists picks
// it instead of making a near-duplicate, and the field turns red to say so.
export function CategorySelect({
  label,
  width,
  open,
  onToggle,
  cats,
  current,
  onPick,
  newValue,
  onNewChange,
  onNewCommit,
  isDuplicate,
  align = 'right',
}: {
  label: string
  width: number | string
  open: boolean
  onToggle: (e: MouseEvent<HTMLDivElement>) => void
  cats: string[]
  current: string
  onPick: (c: string) => void
  newValue: string
  onNewChange: ChangeEventHandler<HTMLInputElement>
  onNewCommit: () => void
  isDuplicate: boolean
  align?: 'left' | 'right'
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={onToggle}
        style={{
          boxSizing: 'border-box',
          width,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
          ...caption1,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'border-color var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 31,
            [align]: 0,
            boxSizing: 'border-box',
            width: 200,
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
          {['All'].concat(cats).map((c) => (
            <CatRow key={c} label={c === 'All' ? 'All categories' : c} selected={current === c} onClick={() => onPick(c)} />
          ))}
          <span
            style={{
              boxSizing: 'border-box',
              height: 28,
              display: 'flex',
              alignItems: 'center',
              marginTop: 'var(--size-40)',
              padding: '0 var(--size-80)',
              border: `1px dashed ${isDuplicate ? 'var(--danger-accent)' : 'var(--primary)'}`,
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-card)',
              transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
            }}
          >
            <input
              placeholder="New category - press Enter"
              value={newValue}
              onChange={onNewChange}
              onKeyDown={(e) => e.key === 'Enter' && onNewCommit()}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-family)',
                ...caption1,
                color: isDuplicate ? 'var(--danger-fg)' : 'var(--primary)',
                padding: 0,
              }}
            />
          </span>
        </div>
      )}
    </span>
  )
}

function CatRow({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: selected ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

export function ReasonsPanel({ s }: { s: ContactsState }) {
  const selected = s.reasons.filter((r) => s.vSelIds.includes(r.id))
  const allUrgent = selected.length > 0 && selected.every((r) => r.urgent)
  const allRetired = selected.length > 0 && selected.every((r) => r.retired)
  const dupCat =
    s.vcNew.trim() !== '' &&
    s.allCategories.some((c) => c.toLowerCase() === s.vcNew.trim().toLowerCase())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={{ ...caption1Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-label)' }}>
          Reasons
        </span>
        <InfoDot title={REASONS_HELP} />
      </span>

      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          padding: 'var(--size-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-160)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
          {s.vSelIds.length > 0 && (
            <>
              <ToneButton
                tone={{ bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)' }}
                onClick={() =>
                  s.bulkSet(
                    () => ({ urgent: !allUrgent }),
                    allUrgent ? 'Urgent cleared' : 'Pinned to the top of the Help screen',
                  )
                }
              >
                {allUrgent ? 'Clear urgent on ' : 'Mark urgent on '}
                {selected.length}
              </ToneButton>
              {/* Retiring keeps a reason on its contacts, greyed. There is no delete. */}
              <ToneButton
                tone={
                  allRetired
                    ? { bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)' }
                    : { bg: 'var(--danger-bg)', border: 'var(--danger-border)', fg: 'var(--danger-fg)' }
                }
                onClick={() =>
                  s.bulkSet(
                    () => ({ retired: !allRetired }),
                    allRetired ? 'Restored · offered to drivers again' : 'Retired · kept on contacts, never offered',
                  )
                }
              >
                {allRetired ? 'Restore ' : 'Retire '}
                {selected.length}
              </ToneButton>
            </>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            {s.vSelIds.length} {s.vSelIds.length === 1 ? 'reason selected' : 'reasons selected'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
          <SearchField flex={1} value={s.vq} onChange={(e) => s.setVq(e.target.value)} placeholder="Search reasons" />
          <CategorySelect
            width={170}
            label={s.vCat === 'All' ? 'All categories' : s.vCat}
            open={s.openDrop === 'vcat'}
            onToggle={s.toggleDrop('vcat')}
            cats={s.allCategories}
            current={s.vCat}
            onPick={(c) => {
              s.setVCat(c)
              s.setOpenDrop(null)
            }}
            newValue={s.vcNew}
            onNewChange={(e) => s.setVcNew(e.target.value)}
            onNewCommit={() =>
              s.resolveCategory(s.vcNew, (c) => {
                s.setVCat(c)
                s.setOpenDrop(null)
                s.setVcNew('')
              })
            }
            isDuplicate={dupCat}
          />
        </div>

        <div
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-medium)',
            overflow: 'hidden auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ReasonGroups
            pool={s.reasons}
            categories={s.allCategories}
            extraCats={s.extraCats}
            query={s.vq}
            cat={s.vCat}
            collapsed={s.vCollapsed}
            onToggleGroup={(c) =>
              s.setVCollapsed((v) => (v.includes(c) ? v.filter((x) => x !== c) : v.concat([c])))
            }
            selectedIds={s.vSelIds}
            onToggleReason={(rid) =>
              s.setVSelIds((v) => (v.includes(rid) ? v.filter((x) => x !== rid) : v.concat([rid])))
            }
            countFor={s.countFor}
            visibleCountFor={s.visibleCountFor}
            showUrgent
            metaLabel={(picked, total) =>
              `${picked ? `${picked} selected · ` : ''}${total} ${total === 1 ? 'reason' : 'reasons'}`
            }
            rename={s.rename}
            setRename={s.setRename}
            onCommitRename={s.commitRename}
          />
        </div>
      </div>
    </div>
  )
}
