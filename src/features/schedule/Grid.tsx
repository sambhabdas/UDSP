'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type'
import { Menu, MenuRow } from './parts'
import { LABEL } from './style'
import { HOURS_CAP, HOURS_WARN, TIERS, initialsOf, tint } from './data'
import type { Da } from './data'
import { DAY_NAMES, fmtDay, fmtT } from './date'
import type { SchedState } from './useSchedule'

/** The grid's one column template - the name rail plus seven equal days. */
const COLS = 'minmax(170px,230px) repeat(7, minmax(76px, 1fr))'

/** Weekends carry a tint the whole column deep. */
const dayBg = (i: number): string => (i === 0 || i === 6 ? 'var(--surface-subtle)' : 'transparent')

export function Grid({ s }: { s: SchedState }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
      <DayHeader s={s} />
      {s.hasDraft ? (
        <>
          <Pool s={s} />
          {s.rows.map((da) => (
            <Row key={da.id} s={s} da={da} />
          ))}
          {s.rows.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>No rows match</span>
              <span onClick={s.clearFilters} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>Clear filters</span>
            </div>
          )}
        </>
      ) : (
        <EmptyState s={s} />
      )}
    </div>
  )
}

function DayHeader({ s }: { s: SchedState }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: COLS,
        background: 'var(--surface-subtle)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', display: 'flex', alignItems: 'center' }}>
        <span style={LABEL}>Driver associate</span>
      </div>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const scheduled = s.shifts.filter((x) => x.day === i).length
        const needed = s.needs ? s.depts.reduce((a, dp) => a + (s.needs?.[dp.id]?.[i] ?? 0), 0) : 0
        return (
          <div
            key={i}
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-60) var(--size-80)',
              background: dayBg(i),
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--size-40)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <span style={LABEL}>{DAY_NAMES[i]}</span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', ...caption2, color: 'var(--text-secondary)' }}>
              {fmtDay(s.week, i)}
            </span>
            <span
              title={`${scheduled} scheduled of ${needed} needed`}
              style={{
                flexShrink: 0,
                ...caption2Strong,
                color: scheduled < needed ? 'var(--warning-fg)' : 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              ({scheduled}/{needed})
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * The unassigned row.
 *
 * One chip per department per day showing filled-of-needed. A chip with an
 * opening is dashed and draggable - dropping it on a DA is how a need becomes
 * a shift.
 */
function Pool({ s }: { s: SchedState }) {
  const openCount = (): number => {
    if (!s.needs) return 0
    let n = 0
    s.depts.forEach((dp) => (s.needs?.[dp.id] ?? []).forEach((need, day) => { n += Math.max(0, need - s.filled(dp.id, day)) }))
    return n
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: COLS, borderBottom: '1px solid var(--border-default)', background: 'var(--surface-card)' }}>
      <div
        onClick={() => s.setPoolOpen(!s.poolOpen)}
        style={{ boxSizing: 'border-box', padding: 'var(--size-80) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: s.poolOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform var(--motion-move)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
        <span style={LABEL}>Unassigned</span>
        {!s.poolOpen && (
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            {openCount() ? `${openCount()} open` : 'None open'}
          </span>
        )}
      </div>

      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
        const chips = s.needs
          ? s.depts.flatMap((dp) => {
              const need = s.needs?.[dp.id]?.[day] ?? 0
              if (!need) return []
              const f = s.filled(dp.id, day)
              return [{ dp, need, f, open: f < need }]
            })
          : []
        return (
          <div
            key={day}
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-60)',
              borderLeft: '1px solid var(--border-subtle)',
              background: dayBg(day),
              display: 'flex',
              flexFlow: 'row wrap',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
              gap: 'var(--size-40)',
            }}
          >
            {s.poolOpen && chips.map(({ dp, need, f, open }) => (
              <span
                key={dp.id}
                draggable={open}
                onDragStart={(e) => { e.stopPropagation(); s.setDrag({ dept: dp.id, day }) }}
                onClick={(e) => {
                  e.stopPropagation()
                  s.openDlg('need', { dept: dp.id, day, val: String(need), reason: '' })
                }}
                title={open ? 'Drag onto an eligible DA to fill · click to edit the needed count' : 'Filled · click to edit the needed count'}
                style={{
                  boxSizing: 'border-box',
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--size-40)',
                  padding: '0 var(--size-60)',
                  borderRadius: 'var(--radius-small)',
                  background: open ? 'var(--surface-card)' : 'var(--surface-subtle)',
                  border: `1px ${open ? 'dashed' : 'solid'} ${open ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                  ...caption2,
                  fontWeight: open ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  cursor: open ? 'grab' : 'pointer',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dp.c.dot, flexShrink: 0 }} />
                {dp.code} {f}/{need}
              </span>
            ))}
            {s.poolOpen && chips.length === 0 && <span style={{ ...caption2, color: 'var(--text-disabled)' }}>-</span>}
          </div>
        )
      })}
    </div>
  )
}

function Row({ s, da }: { s: SchedState; da: Da }) {
  const [hover, hoverProps] = useHover()
  const tier = TIERS[da.tier]
  const [avBg, avFg] = tint(da.name)

  // While a shift is being dragged onto this row, the hours cell previews what
  // the total would become rather than what it is.
  const dragLen = s.drag ? s.deptOf(s.drag.dept).len : 0
  const previewing = !!(s.drag && s.dragHover && s.dragHover.da === da.id)
  const hours = s.weekHours(da.id) + (previewing ? dragLen - (s.drag?.shift ? s.lenOf(s.drag.shift) : 0) : 0)
  const hoursColor = hours > HOURS_CAP ? 'var(--danger-fg)' : hours >= HOURS_WARN ? 'var(--warning-fg)' : 'var(--text-secondary)'
  const hoursWeight = hours >= HOURS_WARN ? 'var(--weight-semibold)' : 'var(--weight-regular)'

  const deptTags = [...new Set(s.shifts.filter((x) => x.da === da.id).map((x) => x.dept))].map((id) => s.deptOf(id))

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        borderBottom: '1px solid var(--border-subtle)',
        // A blocked DA's whole row washes red - they cannot take any shift.
        background: hover ? 'var(--surface-subtle)' : da.blocked ? 'var(--red-50)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 60, overflow: 'hidden' }}>
        <span
          style={{
            boxSizing: 'border-box', width: 24, height: 24, flexShrink: 0,
            borderRadius: 'var(--radius-circle)', background: avBg, color: avFg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', ...caption2Strong,
          }}
        >
          {initialsOf(da.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ ...caption1Strong, overflow: 'hidden', textOverflow: 'ellipsis' }}>{da.name}</span>
            <span
              title={da.tier === 'At risk' ? 'Counts as at risk' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 4, ...caption2Strong, color: tier.fg, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tier.dot }} />
              {da.tier}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {deptTags.map((dp) => (
              <span key={dp.id} title={dp.name} style={{ display: 'flex', alignItems: 'center', gap: 3, ...caption2Strong, color: dp.c.fg, whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dp.c.dot }} />
                {dp.code}
              </span>
            ))}
            <span
              title={previewing ? 'Including the shift being dragged' : hours > HOURS_CAP ? 'Over the 50 h cap' : hours >= HOURS_WARN ? 'Near the 50 h cap' : undefined}
              style={{ ...caption2, fontWeight: hoursWeight, color: hoursColor, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
            >
              {hours} h
            </span>
            {da.blocked && (
              <span
                title="Overdue blocking coaching - unschedulable until the DA acknowledges the module"
                style={{
                  boxSizing: 'border-box', height: 18, display: 'flex', alignItems: 'center',
                  padding: '0 var(--size-40)', borderRadius: 'var(--radius-medium)',
                  background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                  ...caption2Strong, lineHeight: '1', color: 'var(--danger-fg)', whiteSpace: 'nowrap', cursor: 'help',
                }}
              >
                Blocked
              </span>
            )}
            {da.noWork && s.hasDraft && (
              <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>No work last wk</span>
            )}
          </div>
        </div>
      </div>

      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
        <Cell key={day} s={s} da={da} day={day} />
      ))}
    </div>
  )
}

function Cell({ s, da, day }: { s: SchedState; da: Da; day: number }) {
  const [hover, hoverProps] = useHover()
  const shift = s.shiftAt(da.id, day)
  const av = s.availOf(da.id, day)
  const ex = s.exclusionOf(da.id)
  const dp = shift ? s.deptOf(shift.dept) : null
  const isHardViol = !!shift && s.viol.hard.some((v) => v.shift === shift)

  const dragHovering = !!(s.drag && s.dragHover && s.dragHover.da === da.id && s.dragHover.day === day)
  const dragSelf = !!(s.drag?.shift && s.drag.fromDa === da.id && s.drag.fromDay === day)

  // What the cell says while something hovers over it: whether the drop would
  // land, need a reason, or be refused outright.
  let dropHint = ''
  let dropColor = 'var(--primary)'
  let dropBg = 'var(--blue-50)'
  if (dragHovering && !dragSelf && s.drag) {
    if (s.drag.shift && shift) dropHint = '⇄ Swap'
    else {
      const chk = s.check(da.id, day, s.drag.dept, s.drag.shift ?? null)
      if (!chk.ok) { dropHint = 'Blocked'; dropColor = 'var(--danger-accent)'; dropBg = 'var(--red-50)' }
      else if (chk.soft.length) { dropHint = '⚠ Reason'; dropColor = 'var(--warning-accent)'; dropBg = 'var(--yellow-50)' }
      else dropHint = s.drag.shift ? 'Move' : 'Assign'
    }
  }

  const plusKey = `plus:${da.id}:${day}`
  const ctxKey = `ctx:${da.id}:${day}`
  const plusOpen = s.drop === plusKey
  const ctxOpen = s.drop === ctxKey
  const empty = !shift && av.t === 'A' && !da.blocked && !ex

  const removeShift = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!shift) return
    s.snap()
    s.removeShift(shift)
    s.setDrop(null)
    s.log('Remove shift', `${DAY_NAMES[day]} ${shift.dept} · ${da.name}`)
    s.toastMsg(`Removed - ${da.name} · ${DAY_NAMES[day]} ${s.deptOf(shift.dept).code}`, true)
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); if (!shift && av.t === 'A' && !da.blocked) s.openAdd(da.id, day) }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!s.drag) return
        if (s.dragHover?.da !== da.id || s.dragHover?.day !== day) s.setDragHover({ da: da.id, day })
      }}
      onDrop={(e) => { e.preventDefault(); s.handleDrop(da.id, day) }}
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-40)',
        borderLeft: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : dayBg(day),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
        position: 'relative',
        // The cell has to stop clipping while its own menu is open.
        overflow: plusOpen || ctxOpen ? 'visible' : 'hidden',
        zIndex: plusOpen || ctxOpen ? 30 : undefined,
        cursor: shift ? 'default' : av.t === 'A' && !da.blocked ? 'pointer' : 'default',
        boxShadow: dragHovering && !dragSelf ? `inset 0 0 0 1px ${dropColor}` : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {!shift && av.t === 'U' && <Hatched>Unavailable</Hatched>}

      {!shift && av.t === 'A' && ex && (
        <Hatched
          title={`Excluded from auto runs - ${ex.reason}${ex.until ? ` · until ${ex.until}` : ''} · manual assignment stays legal`}
          color="var(--text-secondary)"
        >
          {ex.reason}
        </Hatched>
      )}

      {!shift && av.t === 'PTO' && (
        <span
          title={av.reason}
          style={{
            boxSizing: 'border-box', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
            padding: 'var(--size-40) var(--size-60)', borderRadius: 'var(--radius-small)',
            background: 'var(--green-50)', border: '1px solid var(--green-200)', color: 'var(--green-700)',
            overflow: 'hidden', cursor: 'help',
          }}
        >
          <span style={{ ...caption1Strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Time off ✓</span>
          <span style={{ ...caption2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{av.h} h approved</span>
        </span>
      )}

      {shift && dp && (
        <>
          <span
            draggable
            onDragStart={(e) => { e.stopPropagation(); s.setDrag({ dept: shift.dept, shift, fromDa: da.id, fromDay: day }) }}
            onClick={(e) => { e.stopPropagation(); s.openDlg('shift', { shift, confirmRemove: false }) }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); s.setDrop(ctxOpen ? null : ctxKey) }}
            title={
              `${fmtT(s.startOf(shift))} - ${fmtT(s.startOf(shift) + s.lenOf(shift) * 60)}` +
              (isHardViol ? ' · hard violation - open for the fix' : ` · ${shift.note ? `${shift.note} · ` : ''}click for details · drag to move or swap`)
            }
            style={{
              boxSizing: 'border-box', position: 'relative', width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
              padding: 'var(--size-40) var(--size-60)', borderRadius: 'var(--radius-small)',
              background: dp.c.bg, border: `1px solid ${dp.c.bd}`,
              boxShadow: isHardViol ? 'inset 0 0 0 1.5px var(--danger-accent)' : 'none',
              backgroundImage: dp.striped ? 'repeating-linear-gradient(45deg, rgba(255,255,255,.55) 0 5px, transparent 5px 10px)' : undefined,
              color: dp.c.fg, overflow: 'hidden', cursor: 'grab',
              opacity: dragSelf ? 0.45 : 1,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', ...caption1Strong, whiteSpace: 'nowrap' }}>
              {dp.code}
              {shift.manual && (
                <span title="Added or changed by hand" style={{ width: 5, height: 5, borderRadius: 'var(--radius-circle)', background: dp.c.fg, flexShrink: 0 }} />
              )}
            </span>
            <span style={{ ...caption2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fmtT(s.startOf(shift))} · {s.lenOf(shift)}h
            </span>
            <RemoveX color={dp.c.fg} onClick={removeShift} />
          </span>

          {ctxOpen && (
            <Menu width={140} top="calc(100% - 10px)" centered>
              <MenuRow onClick={(e) => { e.stopPropagation(); s.setDrop(null); s.openDlg('shift', { shift, confirmRemove: false }) }}>
                Details…
              </MenuRow>
              <MenuRow danger onClick={removeShift}>Remove shift</MenuRow>
            </Menu>
          )}
        </>
      )}

      {empty && (
        <>
          <PlusButton onClick={(e) => { e.stopPropagation(); s.setDrop(plusOpen ? null : plusKey) }} />
          {plusOpen && <PlusMenu s={s} da={da} day={day} />}
        </>
      )}

      {dropHint && (
        <span
          style={{
            position: 'absolute', inset: 3, border: `1px dashed ${dropColor}`, borderRadius: 'var(--radius-small)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...caption1, color: dropColor, background: dropBg, pointerEvents: 'none',
          }}
        >
          {dropHint}
        </span>
      )}
    </div>
  )
}

/** The diagonal-hatch plate an unusable cell wears. */
function Hatched({ children, title, color = 'var(--text-disabled)' }: { children: React.ReactNode; title?: string; color?: string }) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: 'repeating-linear-gradient(45deg, var(--neutral-100) 0 6px, var(--border-subtle) 6px 12px)',
        ...caption2, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        cursor: title ? 'help' : undefined,
      }}
    >
      {children}
    </span>
  )
}

function RemoveX({ color, onClick }: { color: string; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title="Remove shift"
      style={{
        position: 'absolute', top: 0, right: 4,
        fontSize: 20, lineHeight: 1, fontWeight: 300, color,
        opacity: hover ? 1 : 0.45, cursor: 'pointer',
        transition: 'opacity var(--motion-hover)',
      }}
      {...hoverProps}
    >
      ×
    </span>
  )
}

function PlusButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title="Assign from the open needs"
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hover ? 'var(--text-secondary)' : 'var(--text-disabled)',
        ...body1Strong, lineHeight: '1', cursor: 'pointer',
        transition: 'color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      +
    </span>
  )
}

/** The open needs for this day, offered against this DA's own eligibility. */
function PlusMenu({ s, da, day }: { s: SchedState; da: Da; day: number }) {
  const items = s.needs
    ? s.depts.filter((dp) => dp.active && (s.needs?.[dp.id]?.[day] ?? 0) > 0).map((dp) => {
        const need = s.needs?.[dp.id]?.[day] ?? 0
        const f = s.filled(dp.id, day)
        return { dp, need, f, open: f < need }
      })
    : []

  const pick = (deptId: string, open: boolean) => {
    if (!open) return
    s.setDrop(null)
    const chk = s.check(da.id, day, deptId, null)
    if (!chk.ok) { s.toastMsg(`Refused - ${chk.hard[0]}`); return }
    const commit = (reason?: string) => {
      s.snap()
      s.assign(da.id, day, deptId)
      s.closeDlg()
      s.log('Assign', `${DAY_NAMES[day]} ${deptId} · ${da.name}${reason ? ` · ${reason}` : ''}`)
      s.toastMsg(`Assigned ${da.name} · ${DAY_NAMES[day]} ${s.deptOf(deptId).code}`, true)
    }
    if (chk.soft.length) s.openReason('Assign with a warning', chk.soft, commit)
    else commit()
  }

  return (
    <Menu width={160} top="calc(100% - 10px)" centered>
      {items.length === 0 && (
        <MenuRow onClick={(e) => e.stopPropagation()}>
          <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--border-strong)', flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left', color: 'var(--text-disabled)' }}>No needs this day</span>
        </MenuRow>
      )}
      {items.map(({ dp, need, f, open }) => (
        <MenuRow
          key={dp.id}
          onClick={(e) => { e.stopPropagation(); pick(dp.id, open) }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dp.c.dot, flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left', color: open ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
            {dp.code} · {fmtT(dp.start)}
          </span>
          <span style={{ color: 'var(--text-helper)', fontVariantNumeric: 'tabular-nums' }}>{f}/{need}</span>
        </MenuRow>
      ))}
    </Menu>
  )
}

function EmptyState({ s }: { s: SchedState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-480) var(--size-240)' }}>
      <span style={body1Strong}>No draft yet</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
        Run Auto Schedule to generate this week, or copy last week and edit it here
      </span>
      <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
        <a
          href="/scheduling/auto-schedule"
          style={{
            boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
            padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
            background: 'var(--primary)', color: 'var(--text-inverse)',
            ...caption1Strong, cursor: 'pointer', textDecoration: 'none',
          }}
        >
          Run Auto Schedule
        </a>
        <div
          role="button"
          tabIndex={0}
          onClick={() => s.openDlg('copy', { keep: {}, reason: '' })}
          style={{
            boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
            padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            ...caption1Strong, cursor: 'pointer',
          }}
        >
          Copy last week
        </div>
      </div>
    </div>
  )
}
