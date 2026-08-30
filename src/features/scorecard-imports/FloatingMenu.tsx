'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { COLS, DAS, DATE_FORMATS, FILTER_OPS, ROSTER_COLS, STD_NAMES } from './data'
import type { ColumnMap, ImportsState } from './useImports'

interface Item {
  label: string
  selected?: boolean
  pick: () => void
}

/** Menus that search: the long lists — people and standards. */
const SEARCHABLE = new Set(['mvStd', 'issDa', 'issStd'])

export function FloatingMenu({ s }: { s: ImportsState }) {
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
        background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 90,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {SEARCHABLE.has(m.kind) && (
        <div
          data-search=""
          style={{ boxSizing: 'border-box', height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-60)', margin: 'var(--size-20) var(--size-20) var(--size-40) var(--size-20)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
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
      {items.map((it, i) => <Row key={`${it.label}-${i}`} item={it} />)}
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
    </div>
  )
}

function itemsFor(s: ImportsState): Item[] {
  const m = s.menu
  if (!m) return []
  const q = s.menuQuery.trim().toLowerCase()

  if (m.kind === 'daCol' || m.kind === 'dateCol') {
    const key = m.kind as keyof ColumnMap
    // The associate column can also be the derived VIN lookup.
    const opts = m.kind === 'daCol' ? [...COLS, 'VIN of Driver to Transporter ID'] : COLS
    return opts.map((c) => ({ label: c, selected: s.columns[key] === c, pick: () => { s.setColumn(key, c); s.closeMenu() } }))
  }

  if (m.kind === 'repCol' || m.kind === 'descCol') {
    const key = m.kind as keyof ColumnMap
    // Both fields can opt out — one to the clock, one to nothing.
    const extra = m.kind === 'repCol' ? 'Import time' : 'None'
    return [extra, ...COLS].map((c) => ({ label: c, selected: s.columns[key] === c, pick: () => { s.setColumn(key, c); s.closeMenu() } }))
  }

  if (m.kind === 'rCol') {
    const key = m.field as keyof ColumnMap
    return ROSTER_COLS.map((c) => ({ label: c, selected: s.columns[key] === c, pick: () => { s.setColumn(key, c); s.closeMenu() } }))
  }

  if (m.kind === 'preset') {
    const name = m.source!
    return [
      { label: 'Edit Mapping', pick: () => { s.closeMenu(); s.setSrc(name); s.setTab('import'); s.toastMsg('The stored mapping is loaded - upload a sample file for a full re-map') } },
      { label: 'Rename', pick: () => { s.closeMenu(); s.toastMsg('Built-in presets cannot be renamed') } },
      { label: 'Delete Preset', pick: () => { s.closeMenu(); s.toastMsg('Built-in presets cannot be deleted') } },
      { label: 'View Skipped Values', pick: () => s.openG('skips', { src: name }) },
      { label: 'View Remembered Matches', pick: () => s.openG('matches', { src: name }) },
    ]
  }

  if (m.kind === 'mvStd') {
    const sel = s.mv.std
    let opts = STD_NAMES.filter((d) => !q || d.toLowerCase().includes(q))
    if (sel && !q) opts = [sel, ...opts.filter((o) => o !== sel)]
    return opts.map((d) => ({ label: d, selected: sel === d, pick: () => { s.setMv({ ...s.mv, std: d }); s.closeMenu() } }))
  }

  if (m.kind === 'issDa') {
    const id = m.issueId!
    const sel = s.resolved[id]
    let people = DAS.filter((p) => !q || p.toLowerCase().includes(q))
    if (sel && !q) people = [sel, ...people.filter((p) => p !== sel)]
    return [
      ...people.map((p) => ({
        label: p,
        selected: sel === p,
        pick: () => { s.resolve(id, p); s.closeMenu(); s.toastMsg(`Matched to ${p} - remembered for the next import`) },
      })),
      { label: 'Skip these rows', selected: sel === 'Skip these rows', pick: () => { s.resolve(id, 'Skip these rows'); s.closeMenu() } },
    ]
  }

  if (m.kind === 'issStd') {
    const id = m.issueId!
    const sel = s.resolved[id]
    let stds = STD_NAMES.filter((d) => !q || d.toLowerCase().includes(q))
    if (sel && !q) stds = [sel, ...stds.filter((d) => d !== sel)]
    return [
      ...stds.map((d) => ({
        label: d,
        selected: sel === d,
        pick: () => { s.resolve(id, d); s.closeMenu(); s.toastMsg(`Mapped to ${d} - remembered for the next import`) },
      })),
      { label: 'Skip these rows', selected: sel === 'Skip these rows', pick: () => { s.resolve(id, 'Skip these rows'); s.closeMenu() } },
    ]
  }

  if (m.kind === 'issDate') {
    const id = m.issueId!
    const sel = s.resolved[id]
    return [
      ...DATE_FORMATS.map((f) => ({
        label: f,
        selected: sel === f,
        pick: () => { s.resolve(id, f); s.closeMenu(); s.toastMsg(`Dates will read as ${f}`) },
      })),
      { label: 'Skip these rows', selected: sel === 'Skip these rows', pick: () => { s.resolve(id, 'Skip these rows'); s.closeMenu() } },
    ]
  }

  if (m.kind === 'fOp') {
    return FILTER_OPS.map((o) => ({ label: o, selected: s.ff.op === o, pick: () => { s.setFf({ ...s.ff, op: o }); s.closeMenu() } }))
  }

  if (m.kind === 'fCol') {
    return COLS.map((c) => ({ label: c, selected: s.ff.col === c, pick: () => { s.setFf({ ...s.ff, col: c }); s.closeMenu() } }))
  }

  if (m.kind === 'batchKebab') {
    const b = m.batch!
    return [
      { label: 'View Mapping Used', pick: () => s.openG('mapping', { src: b.file }) },
      { label: 'Open Events', pick: () => { s.closeMenu(); s.toastMsg(b.roster ? 'Roster upserts have no events' : `Opening Events · Batch ${b.file}`) } },
      { label: 'View Skipped Rows', pick: () => s.openG('skipRows', { src: b.file }) },
      { label: 'Download Source File', pick: () => { s.closeMenu(); s.toastMsg(`Downloading ${b.file}`) } },
      {
        label: 'Roll Back Batch',
        pick: () => {
          s.closeMenu()
          // A roster upsert has no events to void, so it cannot be rolled back.
          s.toastMsg(b.roster
            ? 'Roster upserts cannot roll back - see Record Changes per associate'
            : `Rolled back - ${b.events} events voided, open coaching cancelled`)
        },
      },
    ]
  }

  return []
}
