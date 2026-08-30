'use client'

import { body1Strong } from '../../ds/type'
import { useHover } from '../../ds/useHover'
import { CheckBox } from '../dispatch/parts'
import { Icon } from '../../ds/icons/Icon'
import { TYPE_HEADERS } from './data'
import type { TypeRow } from './useWorkSummary'
import {
  AddRow,
  BarButton,
  CountPill,
  Divider,
  EditCell,
  Label,
  Num,
  SearchBox,
  SelChip,
  TagChip,
  Th,
} from './parts'
import { CARD, CARD_BAR } from './style'
import type { WorkSummaryState } from './useWorkSummary'
import { int } from '../../ds/format'

/** The grid, shared by the head, every row, and the totals line. */
const COLS = '32px minmax(200px,1.4fr) 60px 100px 110px 90px 100px minmax(160px,1.2fr) 110px'

/**
 * Service Types: one row per kind of work the day could run, with what the
 * Amazon file allocated against what actually ran. Every count is editable,
 * because the file is regularly wrong and the day has to be made to add up.
 */
export function TypeTable({ s }: { s: WorkSummaryState }) {
  const allOn = s.visRows.length > 0 && s.visRows.every((r) => s.sel[r.t.id])
  const sorted = sortRows(s)

  return (
    <div style={CARD}>
      <div style={CARD_BAR}>
        <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>
          Service Types
        </span>
        <Divider />
        <BarButton
          title={s.selIds.length === 1 ? '' : 'Pick one type to edit'}
          onClick={() => {
            if (s.selIds.length !== 1) { s.toastMsg('Pick one type to edit'); return }
            if (s.guard()) return
            const t = s.types.find((x) => x.id === s.selIds[0])!
            s.setForm({ id: t.id, name: t.name, hrs: t.hrs, other: '', paid: t.paid, amz: t.amz, veh: t.veh.slice(), counts: t.fed ? 'fed' : 'typed' })
          }}
        >
          Edit
        </BarButton>
        <BarButton
          danger
          title="Retires the selection from today forward - past days keep their rows"
          onClick={() => {
            if (s.guard()) return
            if (!s.selIds.length) { s.toastMsg('Select the types to retire first'); return }
            const names = s.types.filter((t) => s.selIds.includes(t.id)).map((t) => `${t.name} (${t.hrs} hr)`)
            const snap = s.types
            s.setTypes(s.types.filter((t) => !s.selIds.includes(t.id)))
            s.setSel({})
            s.toastMsg(
              `${names.join(', ')} retired - its Rate Cards window closes and its Load Out band goes empty`,
              () => s.setTypes(snap),
            )
          }}
        >
          Remove
        </BarButton>
        <Divider />
        <CountPill title="Service types on the day">Total: {s.rows.length}</CountPill>
        {s.selIds.length > 0 && <SelChip n={s.selIds.length} onClear={() => s.setSel({})} />}
        <div style={{ flex: 1 }} />
        <SearchBox value={s.q} onChange={s.setQ} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1100 }}>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: 'var(--size-120)',
              alignItems: 'center',
              padding: 'var(--size-60) var(--size-160)',
              background: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <CheckBox
              on={allOn}
              title="Select every visible row"
              onClick={() => {
                const next: Record<string, boolean> = {}
                if (!allOn) s.visRows.forEach((r) => { next[r.t.id] = true })
                s.setSel(next)
              }}
            />
            {TYPE_HEADERS.map(([label, k]) => (
              <Th
                key={k}
                label={label}
                sortIcon={s.typeSort?.k === k ? (s.typeSort.dir === 1 ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
                sortColor={s.typeSort?.k === k ? 'var(--text-secondary)' : 'var(--text-disabled)'}
                // One click ascending, a second descending, a third clears it.
                onSort={() => s.setTypeSort(s.typeSort?.k === k ? (s.typeSort.dir === 1 ? { k, dir: -1 } : null) : { k, dir: 1 })}
              />
            ))}
          </div>

          {sorted.map((r) => (
            <Row key={r.t.id} r={r} s={s} />
          ))}

          <AddRow
            label="+ Add a service type"
            onClick={() => {
              if (s.guard()) return
              s.setTypes(s.types.concat([{ id: `t${Date.now()}`, name: '', hrs: 10, paid: 'DSP', amz: '', veh: [], fed: false }]))
              s.toastMsg('Empty row added - pick its service type on the row')
            }}
          />

          <div
            style={{
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: 'var(--size-120)',
              alignItems: 'center',
              minHeight: 40,
              padding: 'var(--size-40) var(--size-160)',
              background: 'var(--surface-subtle)',
            }}
          >
            <span />
            <span style={body1Strong}>Totals</span>
            <span />
            <Total>{s.totA}</Total>
            <Total>{s.totC}</Total>
            <Total>{s.totD}</Total>
            <Total>{int(s.totDel)}</Total>
            <span />
            <Total>{s.totRan}</Total>
          </div>
        </div>
      </div>
    </div>
  )
}

function Total({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 'var(--body-1-size)', fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </span>
  )
}

function sortRows(s: WorkSummaryState): TypeRow[] {
  const S = s.typeSort
  if (!S) return s.visRows
  const val = (r: TypeRow): string | number => {
    switch (S.k) {
      case 'name': return r.t.name.toLowerCase()
      case 'hrs': return r.t.hrs
      // A row with no file line sorts below every row that has one.
      case 'alloc': return r.f ? r.f.a : -1
      case 'cancel': return r.f ? r.f.c : -1
      case 'dropped': return r.f ? r.f.d : -1
      case 'delivered': return r.f ? r.f.del : -1
      case 'notes': return s.typeNotes[r.t.id]?.txt.toLowerCase() ?? '￿'
      case 'ran': return r.ran === null ? -1 : r.ran
    }
  }
  return s.visRows.slice().sort((a, b) => {
    const va = val(a)
    const vb = val(b)
    return (va < vb ? -1 : va > vb ? 1 : 0) * S.dir
  })
}

function Row({ r, s }: { r: TypeRow; s: WorkSummaryState }) {
  const t = r.t
  const on = !!s.sel[t.id]
  const note = s.typeNotes[t.id]
  const isEditing = (list: string) => s.edit?.list === list && s.edit.id === t.id
  const fileColor = r.f ? 'var(--text-primary)' : 'var(--text-secondary)'
  const cellTitle = s.locked ? 'Day locked' : 'Click to edit'
  const cellCursor = s.locked ? 'default' : 'text'
  // The fed row's count comes from the rescue table, so it is never typed.
  const isManual = !t.fed
  const dsp = t.paid === 'DSP'

  const numCell = (list: string, v0: string | number, display: React.ReactNode, color?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <EditCell
        editing={isEditing(list)}
        value={s.editVal}
        onChange={s.setEditVal}
        onCommit={s.commitEdit}
        onCancel={() => s.setEdit(null)}
        title={cellTitle}
        cursor={cellCursor}
        onStart={() => s.startEdit(list, t.id, v0)}
      >
        <Num color={color}>{display}</Num>
      </EditCell>
    </div>
  )

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 'var(--size-120)',
        alignItems: 'center',
        minHeight: 40,
        padding: 'var(--size-40) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : 'var(--surface-card)',
      }}
    >
      <CheckBox on={on} onClick={() => s.setSel({ ...s.sel, [t.id]: !on })} />

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
          <NameCell
            label={t.name || 'Pick a service type'}
            color={t.name ? 'var(--text-primary)' : 'var(--text-disabled)'}
            onClick={(e) => {
              if (s.guard()) return
              s.openMenu(e, 'swaptype', t.id)
            }}
          />
          <TagChip
            bg={dsp ? 'var(--danger-bg)' : 'var(--blue-50)'}
            border={dsp ? 'var(--danger-border)' : 'var(--blue-200)'}
            fg={dsp ? 'var(--danger-fg)' : 'var(--blue-700)'}
          >
            {t.paid}
          </TagChip>
        </div>
      </div>

      {numCell('hrs', t.hrs, String(t.hrs), 'var(--text-secondary)')}
      {numCell('fa', r.f ? r.f.a : '', r.f ? String(r.f.a) : '-', fileColor)}
      {numCell('fc', r.f ? r.f.c : '', r.f ? (r.f.c === 0 ? '-' : String(r.f.c)) : '-', fileColor)}
      {numCell('fd', r.f ? r.f.d : '', r.f ? (r.f.d === 0 ? '-' : String(r.f.d)) : '-', fileColor)}
      {numCell('fdel', r.f ? r.f.del : '', r.f ? int(r.f.del) : '-', fileColor)}

      <div style={{ minWidth: 0 }}>
        <EditCell
          inset
          editing={isEditing('tn')}
          value={s.editVal}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
          title={note ? `${note.who} · ${note.when}` : 'Add a note'}
          cursor={s.locked ? 'default' : 'text'}
          onStart={() => {
            if (s.locked) return
            s.setEdit({ list: 'tn', id: t.id })
            s.setEditVal(note ? note.txt : '')
          }}
        >
          <Label color={note ? 'var(--text-primary)' : 'var(--text-disabled)'}>
            {note ? note.txt : s.locked ? '-' : '+ note'}
          </Label>
        </EditCell>
      </div>

      <div style={{ minWidth: 0 }}>
        <EditCell
          inset
          gap
          editing={isEditing('ran')}
          value={s.editVal}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
          title={
            t.fed
              ? 'Fed by the rescue table’s Unpaid marks - never typed'
              : s.manual[t.id] !== undefined
                ? 'Typed count - click to edit'
                : 'Derived from the file - click to type an override'
          }
          cursor={isManual && !s.locked ? 'text' : 'default'}
          onStart={() => {
            if (!isManual || s.locked) return
            s.setEdit({ list: 'ran', id: t.id })
            s.setEditVal(r.ran === null ? '' : String(r.ran))
          }}
        >
          <span
            style={{
              fontSize: 'var(--body-1-size)',
              lineHeight: 'var(--body-1-lh)',
              fontWeight: 'var(--weight-semibold)',
              color: dsp ? 'var(--danger-fg)' : 'var(--blue-700)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {r.ran === null ? '-' : String(r.ran)}
          </span>
          {isManual && !s.locked && (
            <span style={{ display: 'flex', color: 'var(--text-disabled)' }}>
              <Icon name="FnEdit" size={12} />
            </span>
          )}
        </EditCell>
      </div>
    </div>
  )
}

/** The service-type name — a picker, not a text field. */
function NameCell({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
      title="Change the service type"
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        padding: '0 var(--size-60)',
        margin: '0 calc(var(--size-60) * -1)',
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Label color={color}>{label}</Label>
    </div>
  )
}
