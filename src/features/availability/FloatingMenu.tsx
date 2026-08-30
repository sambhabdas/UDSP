'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1 } from '../../ds/type'
import { CELL_STATES, FILTER_COLS, FILTER_OPS, IMPORT_DAS, SCHEDULE_SOURCE } from './data'
import type { Mapping } from './useAvailability'
import type { AvailabilityState } from './useAvailability'

interface Item {
  label: string
  selected?: boolean
  danger?: boolean
  pick: () => void
}

/** The long lists get a search box; the short ones do not need one. */
const SEARCHABLE = new Set(['issDa'])

export function FloatingMenu({ s }: { s: AvailabilityState }) {
  const m = s.menu
  if (!m) return null
  const items = itemsFor(s)
  return (
    <div
      data-pop=""
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', left: m.x, top: m.y, width: m.w, boxSizing: 'border-box',
        maxHeight: 300, overflow: 'hidden auto', padding: 'var(--size-40)',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 90,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {SEARCHABLE.has(m.kind) && (
        <span
          data-field=""
          style={{ boxSizing: 'border-box', height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-60)', margin: 'var(--size-20) var(--size-20) var(--size-40) var(--size-20)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-disabled)' }}>
            <Icon name="SearchGlyph" size={14} />
          </span>
          <input
            autoFocus
            value={s.menuQuery}
            placeholder="Search"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => s.setMenuQuery(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...caption1, color: 'var(--text-primary)' }}
          />
        </span>
      )}
      {items.map((it, i) => <Row key={`${it.label}-${i}`} item={it} />)}
    </div>
  )
}

function Row({ item }: { item: Item }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={(e) => { e.stopPropagation(); item.pick() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', minHeight: 28, flexShrink: 0, display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : item.selected ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        fontWeight: item.selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: item.danger ? 'var(--danger-fg)' : item.selected ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ width: 14, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {item.selected ? '✓' : ''}
      </span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
    </div>
  )
}

function itemsFor(s: AvailabilityState): Item[] {
  const m = s.menu
  if (!m) return []
  const q = s.menuQuery.trim().toLowerCase()

  if (m.kind === 'combo') {
    const key = m.comboKey as keyof Mapping
    return (m.comboOpts ?? []).map((o) => ({
      label: o,
      selected: s.mapping[key] === o,
      pick: () => { s.setMapping({ ...s.mapping, [key]: o }); s.closeMenu() },
    }))
  }

  if (m.kind === 'preset') {
    const name = m.source!
    const custom = s.customSources.includes(name)
    return [
      { label: 'Edit mapping', pick: () => { s.closeMenu(); s.setImportType(name); s.setStep(3); s.toastMsg('The stored mapping is loaded') } },
      { label: 'Rename', pick: () => { s.closeMenu(); s.toastMsg(custom ? 'Rename comes with the connections work' : 'Built-in presets cannot be renamed') } },
      {
        label: 'Delete preset',
        danger: custom,
        pick: () => {
          s.closeMenu()
          // Only a source you made can be removed; the built-ins are the product.
          if (!custom) { s.toastMsg('Built-in presets cannot be deleted'); return }
          s.setCustomSources(s.customSources.filter((x) => x !== name))
          s.setImportType('Availability report')
          s.toastMsg(`${name} deleted`)
        },
      },
      { label: 'View remembered matches', pick: () => { s.closeMenu(); s.setGDlg('matches'); s.setGCtx({ src: name }) } },
    ]
  }

  if (m.kind === 'mvStd') {
    return CELL_STATES.map((c) => ({ label: c, selected: s.mv.std === c, pick: () => { s.setMv({ ...s.mv, std: c }); s.closeMenu() } }))
  }

  if (m.kind === 'issDa') {
    const id = m.issueId!
    const sel = s.resolved[id]
    let people = IMPORT_DAS.filter((p) => !q || p.toLowerCase().includes(q))
    if (sel && !q) people = [sel, ...people.filter((p) => p !== sel)]
    return [
      ...people.map((p) => ({
        label: p,
        selected: sel === p,
        pick: () => { s.setResolved({ ...s.resolved, [id]: p }); s.closeMenu(); s.toastMsg(`Matched to ${p} - remembered for the next import`) },
      })),
      { label: 'Skip these rows', selected: sel === 'Skip these rows', pick: () => { s.setResolved({ ...s.resolved, [id]: 'Skip these rows' }); s.closeMenu() } },
    ]
  }

  if (m.kind === 'issStd') {
    const id = m.issueId!
    const sel = s.resolved[id]
    return [
      ...CELL_STATES.map((c) => ({
        label: c,
        selected: sel === c,
        pick: () => { s.setResolved({ ...s.resolved, [id]: c }); s.closeMenu(); s.toastMsg(`Mapped to ${c} - remembered for the next import`) },
      })),
      { label: 'Skip these rows', selected: sel === 'Skip these rows', pick: () => { s.setResolved({ ...s.resolved, [id]: 'Skip these rows' }); s.closeMenu() } },
    ]
  }

  if (m.kind === 'fCol') {
    return FILTER_COLS.map((c) => ({ label: c, selected: s.ff.col === c, pick: () => { s.setFf({ ...s.ff, col: c }); s.closeMenu() } }))
  }

  if (m.kind === 'fOp') {
    return FILTER_OPS.map((o) => ({ label: o, selected: s.ff.op === o, pick: () => { s.setFf({ ...s.ff, op: o }); s.closeMenu() } }))
  }

  if (m.kind === 'batchKebab') {
    const b = m.batch!
    const index = m.batchIndex ?? 0
    const isSchedule = b.source === SCHEDULE_SOURCE
    const items: Item[] = [
      { label: 'View mapping used', pick: () => { s.closeMenu(); s.setGDlg('mapping'); s.setGCtx({ file: b.file }) } },
      { label: 'View skipped rows', pick: () => { s.closeMenu(); s.setGDlg('skipRows'); s.setGCtx({ file: b.file, skipped: b.skipped, unmatched: b.unmatched }) } },
      { label: 'Download source file', pick: () => { s.closeMenu(); s.toastMsg(`Downloading ${b.file}`) } },
    ]
    if (isSchedule) {
      // A schedule record is replaced wholesale, not rolled back cell by cell.
      items.push({ label: 'Replace week', pick: () => { s.closeMenu(); s.setTab('Import'); s.setImportType(b.source); s.setStep(2); s.toastMsg('Upload the corrected file - the mapping is kept') } })
      items.push({ label: 'Remove record', danger: true, pick: () => { s.closeMenu(); s.openDlg('coldRemove') } })
    } else if (b.status !== 'Rolled back') {
      items.push({ label: 'Roll back batch', danger: true, pick: () => { s.closeMenu(); s.openDlg('rollback', { i: index }) } })
    }
    return items
  }

  return []
}
