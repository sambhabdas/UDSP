'use client'

import { Toast } from '../../ds/components/Overlay'
import { useHover } from '../../ds/useHover'
import { body1 } from '../../ds/type'
import { DaTab } from './DaTab'
import { DaInviteDialog, ImportDialog, RemoveDialog, TransferDialog, UserForm } from './Dialogs'
import { FilterPanel } from './FilterPanel'
import { PortalTab } from './PortalTab'
import { useAdminUsers } from './useAdminUsers'
import type { UsersState } from './useAdminUsers'
import { FOCUS_RING, useFocusRing } from '../../ds/focus'

const TABS: { id: UsersState['tab']; label: string }[] = [
  { id: 'portal', label: 'Portal User' },
  { id: 'da', label: 'Ultimate DA' },
]

// Two populations that are never the same list. A PORTAL USER holds one of the
// five posts and consumes a seat; a DA is a roster driver whose only surface is
// the phone app - no post, no seat, no email, and never removed from the roster
// by anything on this page.
export function AdminUsersPage() {
  const s = useAdminUsers()

  return (
    <div
      data-screen-label="Admin Users"
      onClick={s.closeOverlays}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-120)',
          padding: 'var(--size-200) var(--size-200) var(--size-120) var(--size-200)',
          background: 'var(--surface-page)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
          {TABS.map((t) => (
            <Tab key={t.id} label={t.label} on={s.tab === t.id} onPick={() => s.setTab(t.id)} />
          ))}
        </div>
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-200) var(--size-200) var(--size-320) var(--size-200)',
        }}
      >
        {s.tab === 'portal' ? <PortalTab s={s} /> : <DaTab s={s} />}
      </div>

      {s.formOpen && <UserForm s={s} />}
      {s.removeId && <RemoveDialog s={s} />}
      {s.transferOpen && <TransferDialog s={s} />}
      {s.daInviteOpen && <DaInviteDialog s={s} />}
      {s.importOpen && <ImportDialog s={s} />}
      {s.fpOpen && <FilterPanel s={s} />}
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}

function Tab({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      role="tab"
      aria-selected={on}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick()
        }
      }}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        padding: 'var(--size-80) 0',
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'color var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      {label}
      {on && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
          }}
        />
      )}
    </div>
  )
}
