'use client'

import { Icon } from '../../../ds/icons/Icon'
import { body1, body1Strong, caption1 } from '../../../ds/type'
import { eligible, uTone } from '../calc'
import { Button, DotPill, IconButton, MenuItem, SectionTitle } from '../parts'
import { CARD } from '../style'
import type { VehiclesState } from '../useVehicles'

/**
 * Who gets this van, in order. The list is drag-ordered, and each row says
 * whether that DA is actually allowed to take it - a rank on somebody who is
 * deactivated or uncarded is a hole in the plan, not a preference.
 */
export function PriorityTab({ s }: { s: VehiclesState }) {
  const v = s.pv
  const list = s.prio[v.id] ?? []
  const setList = (arr: string[]) => {
    s.setPrio({ ...s.prio, [v.id]: arr })
    s.setDragIdx(null)
  }

  const q = s.prioQuery.trim().toLowerCase()
  const options = s.das.filter(
    (d) => !list.includes(d.id) && eligible(d.id, v, s.types).ok && (!q || `${d.name} ${d.tid}`.toLowerCase().includes(q)),
  )

  return (
    <div style={{ ...CARD, maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Priority</SectionTitle>
        <div style={{ flex: 1 }} />
        <Button primary onClick={() => s.openDlg('picker', { vid: v.id, tags: [] })}>+ Add DA</Button>
      </div>

      {list.map((daId, i) => {
        const da = s.das.find((d) => d.id === daId) ?? { id: daId, name: '-', tid: '-', types: [], dot: false, active: false }
        const el = eligible(daId, v, s.types)
        const t = uTone(el.ok ? 'green' : 'amber')
        return (
          <div
            key={daId}
            draggable
            onDragStart={() => s.setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const from = s.dragIdx
              if (from === null || from === i) return
              const arr = list.slice()
              const [m] = arr.splice(from, 1)
              arr.splice(i, 0, m)
              setList(arr)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--size-120)',
              minHeight: 48, padding: 'var(--size-60) var(--size-160)',
              borderTop: '1px solid var(--border-subtle)',
              background: s.dragIdx === i ? 'var(--blue-50)' : 'transparent',
              cursor: 'grab',
            }}
          >
            <span style={{ display: 'flex', color: 'var(--text-disabled)' }}>
              <Icon name="FnDrag" size={16} />
            </span>
            <span style={{ width: 24, ...body1Strong, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {i + 1}
            </span>
            <span
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--surface-subtle)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)',
              }}
            >
              {da.name.split(', ').map((x) => x[0]).reverse().join('')}
            </span>
            <span style={{ flex: 1, ...body1Strong }}>{da.name}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{da.tid}</span>
            <span>
              <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{el.ok ? 'Eligible' : el.why}</DotPill>
            </span>
            <IconButton
              name="FnDismiss"
              bordered
              onClick={() => s.setPrio({ ...s.prio, [v.id]: list.filter((x) => x !== daId) })}
            />
          </div>
        )
      })}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ display: 'flex', color: 'var(--text-disabled)', visibility: 'hidden' }}>
          <Icon name="FnDrag" size={16} />
        </span>
        <span style={{ width: 24, ...body1Strong, color: 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums' }}>
          {list.length + 1}
        </span>
        <input
          value={s.prioQuery}
          onChange={(e) => { s.setPrioQuery(e.target.value); s.setPrioOpen(true) }}
          onFocus={() => { if (options.length) s.setPrioOpen(true) }}
          onBlur={() => setTimeout(() => { s.setPrioOpen(false); s.setPrioQuery('') }, 150)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Add a DA"
          style={{ flex: 1, minWidth: 0, height: 28, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
        />
        {s.prioOpen && options.length > 0 && (
          <div
            style={{
              position: 'absolute', top: 44, left: 56,
              boxSizing: 'border-box', width: 320, maxHeight: 220, overflow: 'auto',
              padding: 'var(--size-40)', background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--elevation-menu)', zIndex: 30,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {options.map((d) => (
              <MenuItem
                key={d.id}
                label={d.name}
                meta={d.tid}
                onMouseDown={(e) => { e.stopPropagation(); setList(list.concat([d.id])); s.setPrioQuery(''); s.setPrioOpen(false) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
