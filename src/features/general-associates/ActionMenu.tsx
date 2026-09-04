'use client'

import { useHover } from '../../ds/useHover'
import { body1 } from '../../ds/type'
import { DAS } from './data'
import { dial } from '../dialer/dial'
import type { GaState } from './useGeneralAssociates'

interface Item {
  label: string
  run: () => void
  danger?: boolean
}

/** A rule between groups, rather than a row. */
const DIVIDER = null
type Entry = Item | typeof DIVIDER

/**
 * The floating action menu - the roster's row ⋯, the profile header's ⋯, and
 * the Export split.
 *
 * It is anchored in viewport coordinates the way the design file anchors it, so
 * it escapes the card's own scroller rather than being clipped by it.
 */
export function ActionMenu({ s }: { s: GaState }) {
  const m = s.menu
  if (!m) return null

  const entries = buildEntries(s)
  if (!entries.length) return null

  return (
    <div
      data-pop=""
      style={{
        position: 'fixed',
        left: m.x,
        top: m.y,
        width: m.w,
        maxHeight: 340,
        overflow: 'auto',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-40)',
        padding: 'var(--size-40)',
      }}
    >
      {entries.map((e, i) =>
        e === DIVIDER ? (
          <div key={`rule-${i}`} style={{ height: 1, background: 'var(--border-default)', margin: 'var(--size-40) 0' }} />
        ) : (
          <MenuRow key={e.label} item={e} />
        ),
      )}
    </div>
  )
}

function MenuRow({ item }: { item: Item }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        item.run()
      }}
      style={{
        boxSizing: 'border-box',
        flexShrink: 0,
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-60) var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {/* Every row reserves the check column the design file leaves in place,
          so the labels line up with the checkable menus elsewhere. */}
      <span style={{ width: 16, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          ...body1,
          color: item.danger ? 'var(--danger-fg)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.label}
      </span>
    </div>
  )
}

function buildEntries(s: GaState): Entry[] {
  const m = s.menu
  if (!m) return []

  if (m.kind === 'export') {
    return ['XLSX', 'PDF'].map((fmt) => ({
      label: fmt,
      run: () => {
        s.closeMenu()
        s.toastMsg(`${fmt} exported - the filtered view`)
      },
    }))
  }

  if (m.kind === 'row') {
    const d = DAS.find((x) => x.id === m.extra)
    if (!d) return []
    return [
      { label: 'Open Profile', run: () => s.openProfile(d) },
      {
        label: 'Message',
        run: () => {
          s.closeMenu()
          s.toastMsg(`Opens the Inbox with ${d.name} selected`)
        },
      },
      {
        label: 'Call',
        run: () => {
          s.closeMenu()
          dial(d.name, d.phone)
        },
      },
      {
        label: 'Log Event',
        run: () => {
          s.closeMenu()
          s.toastMsg(`Opens the Events manual panel prefilled with ${d.name}`)
        },
      },
      {
        label: 'Assign Coaching',
        run: () => {
          s.closeMenu()
          s.focusDa(d.id)
          s.openCoach()
        },
      },
      {
        // From a row, both readings open the dialog - the design has no
        // one-click reinstate here, only on the profile header.
        label: d.excluded ? 'Reinstate' : 'Exclude From Auto-Schedule',
        run: () => {
          s.closeMenu()
          s.focusDa(d.id)
          s.openExcl()
        },
      },
      DIVIDER,
      {
        label: 'Edit Associate',
        run: () => {
          s.closeMenu()
          s.editDa(d)
        },
      },
      {
        label: d.status === 'active' ? 'Deactivate DA' : 'Reactivate DA',
        run: () => {
          s.closeMenu()
          s.toastMsg(d.status === 'active' ? 'Opens the deactivate confirm' : `${d.name} reactivated`)
        },
      },
      {
        label: 'Delete Permanently',
        danger: true,
        run: () => {
          s.closeMenu()
          s.toastMsg('Owner-only - refused on a record with history')
        },
      },
    ]
  }

  const cur = s.cur
  return [
    {
      label: 'Give Kudo',
      run: () => {
        s.closeMenu()
        s.toastMsg(`Kudo recorded for ${cur.name}`)
      },
    },
    {
      label: 'Invite To Ultimate DA',
      run: () => {
        s.closeMenu()
        // The invite goes by SMS, but the account needs the email to exist.
        s.toastMsg(cur.email ? 'Invite SMS sent' : 'Refused - no email on the record')
      },
    },
    {
      label: '+ Note',
      run: () => {
        s.closeMenu()
        s.toastMsg('Opens the Inbox composer on the Note tab')
      },
    },
    {
      label: 'Export Full Profile',
      run: () => {
        s.closeMenu()
        s.toastMsg('XLSX + PDF - all six tabs')
      },
    },
    {
      label: cur.excluded ? 'Reinstate' : 'Exclude From Auto-Schedule',
      run: () => {
        s.closeMenu()
        s.toggleExclude()
      },
    },
    DIVIDER,
    {
      label: cur.status === 'active' ? 'Deactivate DA' : 'Reactivate DA',
      run: () => {
        s.closeMenu()
        s.toastMsg('Opens the deactivate confirm')
      },
    },
    {
      label: 'Delete Permanently',
      danger: true,
      run: () => {
        s.closeMenu()
        s.toastMsg('Owner-only - refused on a record with history')
      },
    },
  ]
}
