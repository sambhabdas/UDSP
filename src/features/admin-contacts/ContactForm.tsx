import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type { StationLine } from './data'
import type { ContactsState } from './useAdminContacts'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2, subtitle2 } from '../../ds/type'
import { ReasonGroups } from './ReasonGroups'
import { CategorySelect, InfoDot, SearchField } from './ReasonsPanel'
import { CHOSEN_LIMIT, STATION_LINES, TITLE_HELP } from './data'

const fieldWrap: CSSProperties = {
  boxSizing: 'border-box',
  height: 28,
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-60)',
  padding: '0 var(--size-100)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-small)',
  background: 'var(--surface-card)',
}

const bareInput: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  ...caption1,
  color: 'var(--text-primary)',
  padding: 0,
}

function Labelled({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', flex: 1, minWidth: 0 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>{label}</span>
        {help && <InfoDot title={help} />}
      </span>
      {children}
    </div>
  )
}

function Btn({
  children,
  onClick,
  tone,
  disabled,
}: {
  children?: ReactNode
  onClick?: () => void
  tone?: 'primary'
  disabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const primary = tone === 'primary'
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        background: disabled
          ? 'var(--surface-subtle)'
          : primary
            ? hover ? 'var(--primary-hover)' : 'var(--primary)'
            : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${disabled ? 'var(--border-default)' : primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: disabled ? 'var(--text-disabled)' : primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function CloseX({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      aria-label="Close"
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name="DismissSize16ThemeRegular" size={16} />
    </span>
  )
}

// Station lines come from Connections, so the phone field offers them rather
// than making someone retype a number that already exists.
function PhoneField({ s }: { s: ContactsState }) {
  const digits = s.form.phone.replace(/[^0-9]/g, '')
  const matches = STATION_LINES.filter(
    (l) => (!digits || l.number.replace(/[^0-9]/g, '').includes(digits)) && l.number !== s.form.phone,
  )
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <span data-field="" onClick={(e) => e.stopPropagation()} style={{ ...fieldWrap, flex: 1 }}>
        <input
          value={s.form.phone}
          onChange={(e) => s.patchForm({ phone: e.target.value })}
          onFocus={() => s.setPhoneOpen(true)}
          onBlur={() => setTimeout(() => s.setPhoneOpen(false), 150)}
          placeholder="+1"
          style={bareInput}
        />
      </span>
      {s.phoneOpen && matches.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 31,
            left: 0,
            right: 0,
            boxSizing: 'border-box',
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 42,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {matches.map((l) => (
            <LineRow key={l.number} line={l} onPick={() => s.patchForm({ phone: l.number })} />
          ))}
        </div>
      )}
    </span>
  )
}

function LineRow({ line, onPick }: { line: StationLine; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        ...caption1,
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.name}</span>
      <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{line.number}</span>
    </div>
  )
}

function ChosenChip({
  label,
  onRemove,
}: {
  label: string
  onRemove?: (e: MouseEvent<HTMLSpanElement>) => void
}) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--blue-50)',
        border: '1px solid var(--blue-200)',
        ...caption2,
        color: 'var(--blue-700)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span onClick={onRemove} style={{ display: 'flex', cursor: 'pointer' }}>
        <Icon name="DismissSize16ThemeRegular" size={12} />
      </span>
    </span>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 32,
        height: 18,
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--primary)' : 'var(--neutral-400)',
        padding: 2,
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 'var(--radius-circle)',
          background: 'var(--white)',
          transform: on ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform var(--motion-move)',
        }}
      />
    </div>
  )
}

export function ContactForm({ s }: { s: ContactsState }) {
  const f = s.form
  const chosen = f.reasons
  const canSave = !!(f.who.trim() && f.phone.trim() && chosen.length > 0)

  const existing = f.editId ? s.contacts.find((c) => c.id === f.editId) : null
  // Reasons this save would light up for the first time - worth saying out loud,
  // because until now no driver was offered them at all.
  const newlyLit = chosen.filter(
    (rid) => s.visibleCountFor(rid) === 0 && (!existing || !existing.reasons.includes(rid)),
  )

  const chipLabels = chosen.map((rid) => {
    const r = s.reasons.find((x) => x.id === rid)
    return { rid, label: r && r.cat !== r.name ? `${r.cat} - ${r.name}` : s.nameOf(rid) }
  })
  const overflow = chipLabels.length > CHOSEN_LIMIT
  const shownChips = f.chosenOpen || !overflow ? chipLabels : chipLabels.slice(0, CHOSEN_LIMIT)

  const effectiveCat = f.newCat.trim() || (f.cat === 'All' ? 'Other' : f.cat)
  const catIsNew = !s.allCategories.some((c) => c.toLowerCase() === effectiveCat.toLowerCase())
  const addLabel = f.newReason.trim() ? (catIsNew ? 'Add category and reason' : 'Add reason') : 'Add'
  const dupReason =
    f.newReason.trim() && s.reasons.some((r) => r.name.toLowerCase() === f.newReason.trim().toLowerCase())

  return (
    <div
      onClick={() => s.setFormOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'var(--size-320) var(--size-200)',
        overflow: 'auto',
      }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={f.editId ? 'Edit contact' : 'Add a contact'}
        style={{
          boxSizing: 'border-box',
          width: 640,
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ ...subtitle2, flex: 1 }}>{f.editId ? 'Edit contact' : 'Add a contact'}</span>
          <CloseX onClick={() => s.setFormOpen(false)} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--size-120)', padding: '0 var(--size-200)', flexWrap: 'wrap' }}>
          <Labelled label="Who">
            <span data-field="" style={fieldWrap}>
              <input
                value={f.who}
                onChange={(e) => s.patchForm({ who: e.target.value })}
                placeholder="A person, a desk or a company"
                style={bareInput}
              />
            </span>
          </Labelled>
          <Labelled label="Job title" help={TITLE_HELP}>
            <span data-field="" style={fieldWrap}>
              <input
                value={f.title}
                onChange={(e) => s.patchForm({ title: e.target.value })}
                placeholder="Optional"
                style={bareInput}
              />
            </span>
          </Labelled>
          <Labelled label="Phone">
            <PhoneField s={s} />
          </Labelled>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-200)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
            <span style={{ ...caption1Strong, paddingTop: 2 }}>Reasons</span>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
              {shownChips.map((c) => (
                <ChosenChip
                  key={c.rid}
                  label={c.label}
                  onRemove={(e) => {
                    e.stopPropagation()
                    s.toggleFormReason(c.rid)
                  }}
                />
              ))}
              {overflow && (
                <span
                  onClick={() => s.patchForm({ chosenOpen: !f.chosenOpen })}
                  style={{ ...caption2, color: 'var(--text-link)', cursor: 'pointer', alignSelf: 'center' }}
                >
                  {f.chosenOpen ? 'Show less' : `+${chipLabels.length - CHOSEN_LIMIT} …`}
                </span>
              )}
            </div>
            <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
              {chosen.length} {chosen.length === 1 ? 'reason selected' : 'reasons selected'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <SearchField
              flex={1}
              value={f.query}
              onChange={(e) => s.patchForm({ query: e.target.value })}
              placeholder="Search reasons"
            />
            <CategorySelect
              width={170}
              label={f.cat === 'All' ? 'All categories' : f.cat}
              open={s.openDrop === 'fcat'}
              onToggle={s.toggleDrop('fcat')}
              cats={s.categories}
              current={f.cat}
              onPick={(c) => {
                s.patchForm({ cat: c })
                s.setOpenDrop(null)
              }}
              newValue={s.ncNew}
              onNewChange={(e) => s.setNcNew(e.target.value)}
              onNewCommit={() =>
                s.resolveCategory(s.ncNew, (c) => {
                  s.patchForm({ cat: c })
                  s.setOpenDrop(null)
                  s.setNcNew('')
                })
              }
              isDuplicate={
                s.ncNew.trim() !== '' &&
                s.allCategories.some((c) => c.toLowerCase() === s.ncNew.trim().toLowerCase())
              }
            />
          </div>

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-medium)',
              maxHeight: 260,
              overflow: 'hidden auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ReasonGroups
              pool={s.live}
              categories={s.categories}
              extraCats={s.extraCats}
              query={f.query}
              cat={f.cat}
              collapsed={f.collapsed}
              onToggleGroup={(c) =>
                s.patchForm({
                  collapsed: f.collapsed.includes(c) ? f.collapsed.filter((x) => x !== c) : f.collapsed.concat([c]),
                })
              }
              selectedIds={chosen}
              onToggleReason={s.toggleFormReason}
              countFor={s.countFor}
              visibleCountFor={s.visibleCountFor}
              metaLabel={(picked, total) =>
                `${picked ? `${picked} picked · ` : ''}${total} ${total === 1 ? 'reason' : 'reasons'}`
              }
              rename={s.rename}
              setRename={s.setRename}
              onCommitRename={s.commitRename}
            />
          </div>

          {/* Add a reason without leaving the form - it arrives already picked. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <span data-field="" style={{ ...fieldWrap, width: 160, borderStyle: 'dashed', borderColor: 'var(--primary)' }}>
              <input
                placeholder={f.cat === 'All' ? 'Category' : f.cat}
                value={f.newCat}
                onChange={(e) => s.patchForm({ newCat: e.target.value })}
                style={bareInput}
              />
            </span>
            <span
              data-field=""
              style={{
                ...fieldWrap,
                flex: 1,
                minWidth: 160,
                borderStyle: 'dashed',
                borderColor: dupReason ? 'var(--danger-accent)' : 'var(--primary)',
              }}
            >
              <input
                placeholder="New reason - arrives picked"
                value={f.newReason}
                onChange={(e) => s.patchForm({ newReason: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && s.addReason()}
                style={{ ...bareInput, color: dupReason ? 'var(--danger-fg)' : 'var(--text-primary)' }}
              />
            </span>
            <AddButton onClick={s.addReason}>{addLabel}</AddButton>
          </div>
        </div>

        {newlyLit.length > 0 && f.who.trim() && f.shown && (
          <div
            role="status"
            style={{
              margin: '0 var(--size-200)',
              boxSizing: 'border-box',
              padding: 'var(--size-100) var(--size-160)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-medium)',
              ...caption1,
              color: 'var(--warning-fg)',
              textWrap: 'pretty',
            }}
          >
            {newlyLit.map(s.nameOf).join(' · ')} {newlyLit.length === 1 ? 'was' : 'were'} dark on the Help
            screen until now.
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-200)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
            <span style={{ ...body1 }}>Shown in the app</span>
            <Toggle on={f.shown} onClick={() => s.patchForm({ shown: !f.shown })} />
          </span>
          <div style={{ flex: 1 }} />
          <Btn onClick={() => s.setFormOpen(false)}>Cancel</Btn>
          <Btn tone="primary" disabled={!canSave} onClick={s.saveForm}>
            {f.editId ? 'Save' : 'Add contact'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

function AddButton({ children, onClick }: { children?: ReactNode; onClick?: () => void }) {
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
