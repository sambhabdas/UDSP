'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1 } from '../../ds/type'
import { MODULES, namesIn } from './data'
import type { StandardsState } from './useStandards'

interface Item {
  label: string
  selected?: boolean
  pick: () => void
}

export function FloatingMenu({ s }: { s: StandardsState }) {
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

function itemsFor(s: StandardsState): Item[] {
  const m = s.menu
  if (!m) return []

  if (m.kind === 'catKebab') {
    const idx = m.catIndex!
    const c = s.cats[idx]
    return [
      {
        label: 'Rename or Recolor',
        pick: () => { s.setCatForm({ idx, name: c.name, color: c.dot }); s.openG('cat', { idx }) },
      },
      {
        label: 'Delete',
        pick: () => {
          s.closeMenu()
          // A category has to be emptied first - its standards would be orphaned.
          if (c.rows.length) { s.toastMsg(`Move or delete its ${c.rows.length} standards first`); return }
          s.setCats(s.cats.filter((_, i) => i !== idx))
          s.toastMsg(`${c.name} deleted`)
        },
      },
    ]
  }

  if (m.kind === 'tierKebab') {
    const name = m.tierName!
    const t = s.tiers.find((x) => x.name === name)!
    const tiers = s.ladder
    const i = tiers.findIndex((x) => x.name === name)
    return [
      {
        label: 'Edit',
        pick: () => {
          s.closeMenu()
          s.setTierDlg('edit')
          s.setTe({ orig: t.name, name: t.name, from: t.from === null ? '' : String(t.from), color: t.color, risk: t.risk, note: t.note ?? '', lowest: t.from === null })
        },
      },
      {
        label: 'Delete',
        pick: () => {
          s.closeMenu()
          if (s.tiers.length <= 1) { s.toastMsg('At least one tier must exist'); return }
          s.openG('confirm', { kind: 'delTier', tier: t.name, lines: deleteTierLines(s, i) })
        },
      },
    ]
  }

  if (m.kind === 'rowKebab') {
    return rowItems(s)
  }

  if (m.kind === 'cat') {
    return s.cats
      .map((c) => ({
        label: c.name,
        selected: s.mk.cat === c.name && !s.mk.catNew,
        pick: () => { s.setMk({ ...s.mk, cat: c.name, catColor: c.dot, catNew: false }); s.closeMenu() },
      }))
      .concat([{
        label: 'New Category',
        selected: false,
        pick: () => { s.setCatDlg(true); s.setStdDlg(false); s.setMk({ ...s.mk, catName: '', catColor: 'var(--blue-400)' }); s.closeMenu() },
      }])
  }

  if (m.kind === 'mkModule') {
    return [{ label: 'None', selected: !s.mk.module, pick: () => { s.setMk({ ...s.mk, module: null, auto: false }); s.closeMenu() } }]
      .concat(MODULES.map((mod) => ({ label: mod, selected: s.mk.module === mod, pick: () => { s.setMk({ ...s.mk, module: mod }); s.closeMenu() } })))
  }

  if (m.kind === 'pairModule2') {
    return MODULES.map((mod) => ({
      label: mod,
      selected: s.pairForm.module === mod,
      pick: () => { s.setPairForm({ ...s.pairForm, module: mod }); s.closeMenu() },
    }))
  }

  return []
}

function rowItems(s: StandardsState): Item[] {
  const ref = s.menu!.ref!
  const c = s.cats[ref.c]
  const r = c.rows[ref.r]

  const items: Item[] = [
    { label: 'Edit', pick: () => s.openMaker(c, r, ref) },
    {
      label: r.module ? 'Replace Module' : 'Pair Module',
      pick: () => {
        s.setPairForm({ module: r.module, due: String(r.due ?? 7) })
        s.openG('pair', { c: ref.c, r: ref.r, first: !r.module })
      },
    },
    {
      label: 'View Edit History',
      pick: () => {
        const rows = r.edited
          ? [{
            when: r.editedHint!.includes('You') ? 'Aug 18, 10:40' : 'Aug 5, 14:12',
            who: r.editedHint!.includes('You') ? 'You' : 'K. Ortiz',
            field: 'Negative points',
            change: r.editedHint!.split('· ').pop()!,
          }]
          : []
        s.openG('history', { name: r.name, rows })
      },
    },
  ]

  if (r.module) {
    items.push({
      label: 'Unpair Module',
      pick: () => {
        s.setRow(ref, { ...r, module: null, auto: false, due: null })
        s.closeMenu()
        s.toastMsg('Unpaired - auto coach turned off')
      },
    })
  }

  items.push({
    label: r.inactive ? 'Activate' : 'Deactivate',
    pick: () => {
      s.setRow(ref, { ...r, inactive: !r.inactive })
      s.closeMenu()
      s.toastMsg(r.inactive ? `${r.name} activated` : `${r.name} deactivated - scores nothing until reactivated`)
    },
  })

  if (r.edited) {
    items.push({
      label: 'Reset to Default',
      pick: () => {
        s.setRow(ref, { ...r, neg: 8, edited: false, editedHint: '' })
        s.closeMenu()
        s.toastMsg('Reset to default points - pairing and active state untouched')
      },
    })
  }

  if (r.custom) {
    items.push({
      label: 'Delete',
      pick: () => s.openG('confirm', {
        kind: 'delStd', c: ref.c, r: ref.r, name: r.name,
        lines: [
          { txt: 'Past events keep their stamped points.', color: 'var(--text-primary)' },
          { txt: `${r.module ? 'Its open coaching assignments are cancelled. ' : ''}Import rows mapped to it will be skipped and reported.`, color: 'var(--text-secondary)' },
        ],
      }),
    })
  }

  return items
}

/** Deleting a tier hands its band to a neighbour - say which, and who moves. */
function deleteTierLines(s: StandardsState, i: number) {
  const tiers = s.ladder
  const t = tiers[i]
  const names = namesIn(tiers, i)
  const isLowest = t.from === null
  const landing = isLowest ? tiers[i - 1].name : tiers[i + 1] ? tiers[i + 1].name : tiers[i - 1].name
  const lines = [{
    txt: names.length ? `${names.length} associates move to ${landing}.` : 'No associates sit in this band today.',
    color: 'var(--text-primary)',
  }]
  if (isLowest) {
    lines.push({ txt: `${tiers[i - 1].name} becomes the lowest tier - its band becomes ${tiers[i - 1].from! - 1} and below.`, color: 'var(--text-secondary)' })
  }
  if (t.risk && !s.tiers.some((x) => x.name !== t.name && x.risk)) {
    lines.push({ txt: 'No tier will count as at risk after this delete.', color: 'var(--warning-fg)' })
  }
  return lines
}
