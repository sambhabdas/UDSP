'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { MODULES, STANDARDS, VEHICLES } from './data'
import type { RosterState } from './useRoster'

interface Item {
  label: string
  hint?: string
  selected?: boolean
  pick: () => void
}

/**
 * One menu serves the whole page - kebabs, the export split, and the three
 * combo fields inside the dialogs. It is positioned in viewport coordinates
 * against whatever opened it, so a menu inside a dialog is not clipped by it.
 */
export function FloatingMenu({ s }: { s: RosterState }) {
  const m = s.menu
  if (!m) return null
  const items = itemsFor(s, m.kind, m.extra)

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', left: m.x, top: m.y, width: m.w, boxSizing: 'border-box',
        maxHeight: 300, overflow: 'hidden auto', padding: 'var(--size-40)',
        background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 90,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {items.map((it) => (
        <Row key={it.label} item={it} />
      ))}
    </div>
  )
}

function Row({ item }: { item: Item }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={(e) => { e.stopPropagation(); item.pick() }}
      style={{
        boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0, display: 'flex',
        alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : item.selected ? 'var(--blue-50)' : 'transparent',
        ...body1,
        fontWeight: item.selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: item.selected ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {item.selected && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
      {item.hint && <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.hint}</span>}
    </div>
  )
}

function itemsFor(s: RosterState, kind: string, extra: string | null): Item[] {
  const q = s.menuQuery.trim().toLowerCase()
  const d = s.current

  if (kind === 'coachRow') {
    return [
      { label: 'View Acknowledgement', pick: () => { s.closeMenu(); s.toastMsg('No acknowledgement yet - the assignment is still open') } },
      { label: 'Cancel Assignment', pick: () => s.openReason({ kind: 'cancel', label: extra ?? '' }) },
    ]
  }

  if (kind === 'kudoRow') {
    return [{ label: 'Delete', pick: () => s.openReason({ kind: 'kudoDelete', label: extra ?? '' }) }]
  }

  if (kind === 'headerMenu') {
    return [
      { label: 'Back to Roster', pick: () => { s.closeMenu(); s.setView('roster') } },
      { label: 'Open Full Record', pick: () => { s.closeMenu(); s.toastMsg(`Opening ${d.name} · Associate record · Performance`) } },
      { label: 'Copy Performance Link', pick: () => { s.closeMenu(); s.toastMsg('Performance link copied') } },
    ]
  }

  if (kind === 'kebab') {
    const name = extra ?? d.name
    return [
      { label: 'Open', pick: () => s.openDetail(name) },
      { label: 'Full Record', pick: () => { s.closeMenu(); s.toastMsg(`Opening ${name} · Associate record`) } },
      { label: 'Log Event', pick: () => s.openDlg('event', name) },
      { label: 'Assign Coaching', pick: () => s.openDlg('assign', name) },
      { label: 'Give Kudo', pick: () => s.openDlg('kudo', name) },
    ]
  }

  if (kind === 'export') {
    return ['Excel', 'PDF'].map((f) => ({
      label: f,
      pick: () => { s.closeMenu(); s.toastMsg(`Exported ${d.name} performance record · ${f} · Last 90 days`) },
    }))
  }

  if (kind === 'standard') {
    const sel = s.ev.standard
    const opts = STANDARDS.filter((x) => !q || x.name.toLowerCase().includes(q))
    // The current pick floats to the top, but only while you are not typing.
    const ordered = sel && !q ? [...opts.filter((o) => o.name === sel), ...opts.filter((o) => o.name !== sel)] : opts
    return ordered.map((o) => ({
      label: o.name,
      hint: o.cat,
      selected: o.name === sel,
      // A standard with no negative side can only be logged as a positive.
      pick: () => { s.setEv({ ...s.ev, standard: o.name, dir: o.neg ? s.ev.dir : 'pos' }); s.closeMenu() },
    }))
  }

  if (kind === 'vehicle') {
    const sel = s.ev.vehicle
    let opts = VEHICLES.filter((v) => !q || v.toLowerCase().includes(q))
    if (sel && !q) opts = [sel, ...opts.filter((o) => o !== sel)]
    return [
      { label: 'None', selected: !sel, pick: () => { s.setEv({ ...s.ev, vehicle: null }); s.closeMenu() } },
      ...opts.map((o) => ({ label: o, selected: o === sel, pick: () => { s.setEv({ ...s.ev, vehicle: o }); s.closeMenu() } })),
    ]
  }

  if (kind === 'module') {
    const sel = s.as.module
    let opts = MODULES.filter((v) => !q || v.toLowerCase().includes(q))
    if (sel && !q) opts = [sel, ...opts.filter((o) => o !== sel)]
    return opts.map((o) => ({ label: o, selected: o === sel, pick: () => { s.setAs({ ...s.as, module: o }); s.closeMenu() } }))
  }

  return []
}
