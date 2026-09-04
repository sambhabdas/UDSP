'use client'

import { useHover } from '../../ds/useHover'
import { CheckBox } from '../dispatch/parts'
import { RESC_HEADERS } from './data'
import type { Rescue } from './data'
import {
  AddRow,
  BarButton,
  CountPill,
  Divider,
  EditCell,
  Label,
  Num,
  SelChip,
  TagChip,
  Th,
} from './parts'
import { CARD, CARD_BAR } from './style'
import type { WorkSummaryState } from './useWorkSummary'

const COLS = '32px minmax(200px,1.3fr) 90px minmax(150px,1fr) 70px 110px minmax(150px,1fr) 130px'

/**
 * Rescues: the rows Dispatch streams in, and the one question this page asks of
 * each - did Amazon pay for it? An unmarked assigned rescue is the honesty
 * light; an Unpaid one feeds the DSP service-type row and the route-hour count.
 */
export function RescueTable({ s }: { s: WorkSummaryState }) {
  const allOn = s.resc.length > 0 && s.resc.every((x) => s.sel2[x.id])
  const sorted = sortRescues(s)

  return (
    <div style={CARD}>
      <div style={CARD_BAR}>
        <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>
          Rescues
        </span>
        <Divider />
        <BarButton onClick={() => s.setMark(s.sel2Ids, 'paid')}>Mark Paid</BarButton>
        <BarButton onClick={() => s.setMark(s.sel2Ids, 'unpaid')}>Mark Unpaid</BarButton>
        <Divider />
        <CountPill title="Rescues on the day">Total: {s.resc.length}</CountPill>
        {s.sel2Ids.length > 0 && <SelChip n={s.sel2Ids.length} onClear={() => s.setSel2({})} />}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1000 }}>
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
                if (!allOn) s.resc.forEach((x) => { next[x.id] = true })
                s.setSel2(next)
              }}
            />
            {RESC_HEADERS.map(([label, k]) => (
              <Th
                key={k}
                label={label}
                sortIcon={s.rescSort?.k === k ? (s.rescSort.dir === 1 ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
                sortColor={s.rescSort?.k === k ? 'var(--text-secondary)' : 'var(--text-disabled)'}
                onSort={() => s.setRescSort(s.rescSort?.k === k ? (s.rescSort.dir === 1 ? { k, dir: -1 } : null) : { k, dir: 1 })}
              />
            ))}
          </div>

          {sorted.map((x) => (
            <Row key={x.id} x={x} s={s} />
          ))}

          <AddRow
            label="+ Add a rescue"
            onClick={() => {
              if (s.guard()) return
              s.setResc(s.resc.concat([{ id: `x${Date.now()}`, rescuer: null, rescued: '', route: '', where: '-', totes: null, assigned: false }]))
              s.toastMsg('Empty rescue added - pick the rescued driver on the row')
            }}
          />
        </div>
      </div>
    </div>
  )
}

function sortRescues(s: WorkSummaryState): Rescue[] {
  const S = s.rescSort
  if (!S) return s.resc
  const val = (x: Rescue): string | number => {
    switch (S.k) {
      case 'pair': return `${x.rescuer ?? ''}${x.rescued}`.toLowerCase()
      case 'route': return x.route
      case 'where': return x.where.toLowerCase()
      case 'totes': return x.totes === null ? -1 : x.totes
      case 'state': return x.assigned ? 0 : 1
      case 'notes': return s.rescNotes[x.id]?.txt.toLowerCase() ?? '￿'
      case 'paid': {
        const m = s.marks[x.id] ?? null
        return m === 'paid' ? 0 : m === 'unpaid' ? 1 : 2
      }
    }
  }
  return s.resc.slice().sort((a, b) => {
    const va = val(a)
    const vb = val(b)
    return (va < vb ? -1 : va > vb ? 1 : 0) * S.dir
  })
}

function Row({ x, s }: { x: Rescue; s: WorkSummaryState }) {
  const on = !!s.sel2[x.id]
  const mark = s.marks[x.id] ?? null
  const note = s.rescNotes[x.id]
  const isEditing = (list: string) => s.edit?.list === list && s.edit.id === x.id
  const cellTitle = s.locked ? 'Day locked' : 'Click to edit'
  const cellCursor = s.locked ? 'default' : 'text'
  // Nothing ran on an unassigned rescue, so there is nothing to pay for.
  const paidable = x.assigned && !s.locked

  const cell = (list: string, v0: string | number, display: React.ReactNode, color?: string, ellipsis?: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <EditCell
        editing={isEditing(list)}
        value={s.editVal}
        onChange={s.setEditVal}
        onCommit={s.commitEdit}
        onCancel={() => s.setEdit(null)}
        title={cellTitle}
        cursor={cellCursor}
        onStart={() => s.startEdit(list, x.id, v0)}
      >
        {ellipsis ? (
          <span
            style={{
              fontSize: 'var(--body-1-size)',
              lineHeight: 'var(--body-1-lh)',
              color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {display}
          </span>
        ) : (
          <Num color={color}>{display}</Num>
        )}
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
      <CheckBox on={on} onClick={() => s.setSel2({ ...s.sel2, [x.id]: !on })} />

      <PairCell
        label={x.rescued ? `${x.rescuer ?? 'Not Assigned'} → ${x.rescued}` : 'Pick the rescued driver'}
        color={!x.rescued ? 'var(--text-disabled)' : x.rescuer ? 'var(--text-primary)' : 'var(--danger-fg)'}
        // Only a rescue with nobody on it is still a choice.
        pickable={!x.rescued}
        onClick={(e) => {
          if (s.guard()) return
          if (x.rescued) return
          s.openMenu(e, 'addresc', x.id)
        }}
      />

      {cell('xrt', x.route, x.route)}
      {cell('xwh', x.where === '-' ? '' : x.where, x.where, 'var(--text-secondary)', true)}
      {cell('xto', x.totes === null ? '' : x.totes, x.totes === null ? '-' : String(x.totes))}

      <TagChip
        height={20}
        justifySelf="start"
        bg={x.assigned ? 'var(--surface-subtle)' : 'var(--warning-bg)'}
        border={x.assigned ? 'var(--border-default)' : 'var(--warning-border)'}
        fg={x.assigned ? 'var(--text-secondary)' : 'var(--warning-fg)'}
      >
        {x.assigned ? 'Assigned' : 'Unassigned'}
      </TagChip>

      <div style={{ minWidth: 0 }}>
        <EditCell
          inset
          editing={isEditing('rn')}
          value={s.editVal}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
          title={note ? `${note.who} · ${note.when}` : 'Add a note'}
          cursor={s.locked ? 'default' : 'text'}
          onStart={() => {
            if (s.locked) return
            s.setEdit({ list: 'rn', id: x.id })
            s.setEditVal(note ? note.txt : '')
          }}
        >
          <Label color={note ? 'var(--text-primary)' : 'var(--text-disabled)'}>
            {note ? note.txt : s.locked ? '-' : '+ note'}
          </Label>
        </EditCell>
      </div>

      <PaidCell
        title={
          !x.assigned
            ? 'Unassigned - nothing to pay for'
            : mark === 'unpaid'
              ? 'Counts under Unpaid Rescues (DSP)'
              : mark === 'paid'
                ? 'Amazon covered it'
                : 'Nobody has checked the invoice yet'
        }
        cursor={paidable ? 'pointer' : 'default'}
        onClick={(e) => {
          if (!paidable) {
            s.toastMsg(x.assigned ? 'Day locked' : 'Nothing ran - an unassigned rescue has nothing to pay for')
            return
          }
          s.openMenu(e, 'paid', x.id, 180)
        }}
      >
        <TagChip
          height={20}
          // Not Marked reads as an outline, because it is an unanswered question.
          dashed={!mark}
          bg={mark === 'paid' ? 'var(--success-bg)' : mark === 'unpaid' ? 'var(--danger-bg)' : 'var(--surface-card)'}
          border={mark === 'paid' ? 'var(--success-border)' : mark === 'unpaid' ? 'var(--danger-border)' : 'var(--warning-border)'}
          fg={
            !x.assigned
              ? 'var(--text-disabled)'
              : mark === 'paid'
                ? 'var(--success-fg)'
                : mark === 'unpaid'
                  ? 'var(--danger-fg)'
                  : 'var(--warning-fg)'
          }
        >
          {mark === 'paid' ? 'Paid' : mark === 'unpaid' ? 'Unpaid' : 'Not Marked'}
        </TagChip>
      </PaidCell>
    </div>
  )
}

function PairCell({
  label,
  color,
  pickable,
  onClick,
}: {
  label: string
  color: string
  pickable: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
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
        cursor: pickable ? 'pointer' : 'default',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Label color={color}>{label}</Label>
    </div>
  )
}

function PaidCell({
  title,
  cursor,
  onClick,
  children,
}: {
  title: string
  cursor: 'pointer' | 'default'
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  children: React.ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        minWidth: 0,
        padding: '0 var(--size-60)',
        margin: '0 calc(var(--size-60) * -1)',
        borderRadius: 'var(--radius-small)',
        cursor,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
