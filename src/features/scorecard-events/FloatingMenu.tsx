'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { DAS, MODULES, STANDARDS, VEHICLES } from './data'
import type { DoneRow, LedgerRow, OpenRow } from './data'
import type { EventsState } from './useEvents'

interface Item {
  label: string
  hint?: string
  selected?: boolean
  pick: () => void
}

/** One menu for every kebab and every combo on the page. */
export function FloatingMenu({ s }: { s: EventsState }) {
  const m = s.menu
  if (!m) return null
  const items = itemsFor(s)
  const search = m.kind === 'stdFilter'
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
      {search && (
        <div
          data-search=""
          style={{
            boxSizing: 'border-box', height: 28, flexShrink: 0, display: 'flex', alignItems: 'center',
            gap: 'var(--size-60)', margin: 'var(--size-20) var(--size-20) var(--size-40) var(--size-20)',
            padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
            background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          }}
        >
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="FnSearch" size={16} /></span>
          <input
            autoFocus
            value={s.menuQuery}
            placeholder="Search"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => s.setMenuQuery(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...caption1 }}
          />
        </div>
      )}
      {items.map((it, i) => (
        <Row key={`${it.label}-${i}`} item={it} />
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

function itemsFor(s: EventsState): Item[] {
  const m = s.menu
  if (!m) return []
  const q = s.menuQuery.trim().toLowerCase()

  if (m.kind === 'kebab') return kebabItems(s)

  // The filter drawer's three combos all pick one value from a pool.
  if (m.kind === 'pDa' || m.kind === 'pStd' || m.kind === 'pMod') {
    const pool = m.kind === 'pDa' ? DAS : m.kind === 'pStd' ? STANDARDS.map((x) => x.name) : MODULES
    const key = m.kind === 'pDa' ? 'da' : m.kind === 'pStd' ? 'std' : 'mod'
    const cur = s.pending[key]
    return ['All', ...pool]
      .filter((o) => !q || o.toLowerCase().includes(q))
      .map((o) => ({ label: o, selected: o === cur, pick: () => { s.setPf({ ...s.pending, [key]: o }); s.closeMenu() } }))
  }

  if (m.kind === 'da') {
    let opts = DAS.filter((o) => !q || o.toLowerCase().includes(q))
    if (s.ev.da && !q) opts = [s.ev.da, ...opts.filter((o) => o !== s.ev.da)]
    return opts.map((o) => ({ label: o, selected: o === s.ev.da, pick: () => { s.setEv({ ...s.ev, da: o }); s.closeMenu() } }))
  }

  if (m.kind === 'standard') {
    const sel = s.ev.standard
    let opts = STANDARDS.filter((x) => !q || x.name.toLowerCase().includes(q))
    if (sel && !q) opts = [...opts.filter((o) => o.name === sel), ...opts.filter((o) => o.name !== sel)]
    return opts.map((o) => ({
      label: o.name,
      hint: o.cat,
      selected: o.name === sel,
      // A standard with no negative side can only be logged as a positive.
      pick: () => { s.setEv({ ...s.ev, standard: o.name, dir: o.neg ? s.ev.dir : 'pos' }); s.closeMenu() },
    }))
  }

  if (m.kind === 'vehicle') {
    const sel = s.ev.vehicle
    let opts = VEHICLES.filter((v) => !q || v.toLowerCase().includes(q))
    if (sel && !q) opts = [sel, ...opts.filter((o) => o !== sel)]
    return [
      { label: 'None', selected: !sel, pick: () => { s.setEv({ ...s.ev, vehicle: null }); s.closeMenu() } },
      ...opts.map((o) => ({ label: o, selected: o === sel, pick: () => { s.setEv({ ...s.ev, vehicle: o }); s.closeMenu() } })),
    ]
  }

  if (m.kind === 'module') {
    const sel = s.re.module
    let opts = MODULES.filter((v) => !q || v.toLowerCase().includes(q))
    if (sel && !q) opts = [sel, ...opts.filter((o) => o !== sel)]
    return opts.map((o) => ({ label: o, selected: o === sel, pick: () => { s.setRe({ ...s.re, module: o }); s.closeMenu() } }))
  }

  return []
}

function kebabItems(s: EventsState): Item[] {
  const m = s.menu
  if (!m?.row) return []

  if (m.tab === 'all') {
    const r = m.row as LedgerRow
    if (r.voided) {
      return [
        { label: 'View Details', pick: () => { s.closeMenu(); s.toastMsg(`Opening event details · ${r.da}`) } },
        { label: 'Restore', pick: () => { s.setReasonText(''); s.openDlg('reason', { kind: 'restore', label: `${r.da} · ${r.standard}` }) } },
      ]
    }
    const items: Item[] = [
      { label: 'View Details', pick: () => { s.closeMenu(); s.toastMsg(`Opening event details · ${r.da}`) } },
      { label: 'Open Associate', pick: () => { s.closeMenu(); s.toastMsg(`Opening Associates · ${r.da}`) } },
      { label: 'Assign Module', pick: () => { s.setRe({ module: null, due: '7' }); s.openDlg('reassign', { kind: 'assign', label: `${r.da} · ${r.standard}` }) } },
      { label: 'Void', pick: () => { s.setReasonText(''); s.openDlg('reason', { kind: 'void', label: `${r.da} · ${r.standard}` }) } },
    ]
    // An imported event can be traced back to the batch that brought it in.
    if (r.source.includes('import')) {
      items.splice(2, 0, {
        label: 'View Import Batch',
        pick: () => { s.closeMenu(); s.toastMsg(`Opening Imports · History · ${r.source.replace(' import', '')} batch`) },
      })
    }
    return items
  }

  if (m.tab === 'open') {
    const r = m.row as OpenRow
    return [
      { label: 'Remind', pick: () => { s.closeMenu(); s.toastMsg(`Reminder sent to ${r.da} - logged to the Inbox timeline`) } },
      { label: `Call ${r.phone}`, pick: () => { s.closeMenu(); s.toastMsg(`Calling ${r.da} · ${r.phone}`) } },
      { label: 'Reassign Module', pick: () => { s.setRe({ module: r.module, due: '7' }); s.openDlg('reassign', { kind: 'reassign', label: `${r.da} · ${r.module}` }) } },
      { label: 'Extend Due Date', pick: () => { s.setEx({ date: '2026-08-22', reason: '' }); s.openDlg('extend', { label: `${r.da} · ${r.module}` }) } },
      { label: 'Mark Completed Manually', pick: () => { s.setReasonText(''); s.openDlg('reason', { kind: 'manual', label: `${r.da} · ${r.module}` }) } },
      { label: 'Cancel Assignment', pick: () => { s.setReasonText(''); s.openDlg('reason', { kind: 'cancel', label: `${r.da} · ${r.module}` }) } },
      { label: 'View Details', pick: () => { s.closeMenu(); s.toastMsg(`Opening assignment details · ${r.da}`) } },
    ]
  }

  const r = m.row as DoneRow
  return [
    { label: 'View Acknowledgement', pick: () => s.openDlg('ack', { kind: 'ack', label: `${r.da} · ${r.module}`, row: r }) },
    { label: 'Open Associate', pick: () => { s.closeMenu(); s.toastMsg(`Opening Associates · ${r.da}`) } },
  ]
}
