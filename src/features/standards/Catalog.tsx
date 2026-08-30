'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import type { Category, StandardRow } from './data'
import { Button, Chip, IconButton, SearchField, SortHead, Toggle } from './parts'
import { CARD, CAT_COLS, CAT_HEADS, NUM, TILE_LABEL } from './style'
import type { Ref, StandardsState } from './useStandards'

/** Standards — the catalogue, grouped by category, with drag between groups. */
export function Catalog({ s }: { s: StandardsState }) {
  const tiles = [
    { label: 'Categories', value: String(s.stats.categories), color: 'var(--text-primary)' },
    { label: 'Standards', value: String(s.stats.standards), color: 'var(--blue-700)' },
    { label: 'Custom', value: String(s.stats.custom), color: 'var(--blue-700)' },
    { label: 'Coaching Paired', value: String(s.stats.paired), color: 'var(--text-primary)' },
    { label: 'Auto Coach On', value: String(s.stats.autoOn), color: 'var(--success-fg)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <div key={t.label} style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
              <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
            </div>
            <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <SearchField value={s.search} onChange={s.setSearch} placeholder="Search standards" width={220} />
        <FiltersButton s={s} />
        <div style={{ flex: 1 }} />
        <Button kind="primary" onClick={() => { s.setCatEditIdx(null); s.setMk({ ...s.mk, catNew: true, catName: '', catColor: 'var(--blue-400)' }); s.setCatDlg(true) }}>+ New Category</Button>
        <Button kind="primary" onClick={() => { s.setStdDlg(true); s.setCoachDrawer(false); s.setMk({ ...s.mk, mode: 'new', catNew: false, name: '', desc: '', dir: 'neg', neg: '', pos: '', per: 'Event', active: true, module: null, auto: false, due: '7', srcCat: null, srcRow: null }) }}>+ New Standard</Button>
      </div>

      {s.shownCats.map(({ cat, ci, rows }) => (
        <CategoryCard key={cat.name} s={s} cat={cat} ci={ci} rows={rows} />
      ))}

      {s.shownCats.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)' }}>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>No standards match.</span>
        </div>
      )}
    </div>
  )
}

function FiltersButton({ s }: { s: StandardsState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.filterCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {s.filterCount > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 var(--size-40)', borderRadius: 'var(--radius-pill)', background: 'var(--primary)', color: 'var(--text-inverse)', ...caption1, fontWeight: 'var(--weight-semibold)' }}>
          {s.filterCount}
        </span>
      )}
    </div>
  )
}

function CategoryCard({ s, cat, ci, rows }: { s: StandardsState; cat: Category; ci: number; rows: { r: StandardRow; ri: number }[] }) {
  return (
    <div
      onDragOver={(e) => { if (s.drag) e.preventDefault() }}
      onDrop={(e) => { e.preventDefault(); s.dropOn(ci, cat.name) }}
      style={{ ...CARD, border: `1px solid ${s.drag !== null ? 'var(--blue-200)' : 'var(--border-default)'}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: cat.dot }} />
        <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{cat.name}</span>
        {cat.custom && <Chip label="Custom" bg="var(--blue-50)" fg="var(--blue-700)" />}
        <div style={{ flex: 1 }} />
        <IconButton
          icon="FnEdit"
          onClick={() => { s.setCatDlg(true); s.setStdDlg(false); s.setCatEditIdx(ci); s.closeMenu(); s.setMk({ ...s.mk, catNew: false, catName: cat.name, catColor: cat.dot }) }}
        />
        {cat.custom && <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'catKebab', { catIndex: ci })} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: CAT_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
        <span />
        {CAT_HEADS.map(([k, label, justify]) => (
          <SortHead
            key={label}
            label={label}
            justify={justify}
            active={k != null && s.catSort.k === k}
            dir={s.catSort.d}
            onClick={k ? () => s.sortCatalog(k) : undefined}
          />
        ))}
      </div>

      {rows.map(({ r, ri }) => (
        <Row key={r.name} s={s} cat={cat} r={r} ref_={{ c: ci, r: ri }} />
      ))}
    </div>
  )
}

function Row({ s, cat, r, ref_ }: { s: StandardsState; cat: Category; r: StandardRow; ref_: Ref }) {
  const dragging = s.drag?.c === ref_.c && s.drag?.r === ref_.r
  return (
    <div
      draggable
      onDragStart={(e) => { s.setDrag(ref_); e.dataTransfer.effectAllowed = 'move' }}
      style={{
        display: 'grid', gridTemplateColumns: CAT_COLS, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)',
        // An inactive standard is still listed, but visibly out of play.
        opacity: r.inactive ? '.55' : '1',
        background: dragging ? 'var(--blue-50)' : 'transparent',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', cursor: 'grab' }}>
        <Icon name="FnDrag" size={16} />
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
        {r.custom && <Chip label="Custom" bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" />}
        {r.edited && <Chip label="Edited" bg="var(--warning-bg)" fg="var(--warning-fg)" title={r.editedHint} />}
        {r.inactive && <Chip label="Inactive" bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" />}
      </div>
      <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: r.neg ? 'var(--danger-fg)' : 'var(--text-disabled)', ...NUM }}>
        {r.neg ? `-${r.neg}` : '-'}
      </span>
      <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: r.pos ? 'var(--success-fg)' : 'var(--text-disabled)', ...NUM }}>
        {r.pos ? `+${r.pos}` : '-'}
      </span>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.per}</span>
      <span style={{ ...body1, color: r.module ? 'var(--text-primary)' : 'var(--warning-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {r.module ?? 'Not paired'}
      </span>
      <div style={{ display: 'flex' }}>
        <Toggle
          on={r.auto}
          disabled={!r.module}
          title={r.module ? undefined : 'Pair a module first'}
          onClick={() => s.toggleAuto(ref_, r)}
        />
      </div>
      <span style={{ textAlign: 'right', ...body1, color: 'var(--text-secondary)', ...NUM }}>
        {r.module && r.auto && r.due ? `${r.due} days` : '-'}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--size-40)' }}>
        <Button kind="primary" small icon="FnEdit" onClick={() => s.openMaker(cat, r, ref_)}>Edit</Button>
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'rowKebab', { ref: ref_ })} />
      </div>
    </div>
  )
}
