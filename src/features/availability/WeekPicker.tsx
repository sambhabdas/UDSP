'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import { MAX_OFFSET, MAX_RANGE_DAYS, MIN_OFFSET } from './data'
import { MONTH_NAMES, dayOfOffset, monthCells, rangeLabel } from './calc'
import { LABEL } from './style'
import { Menu, MenuRow } from './parts'
import type { AvailabilityState } from './useAvailability'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * The week stepper: arrows, a label that opens a two-month calendar, and Today.
 *
 * The calendar picks a *range* - first click sets the start, second the end -
 * and refuses anything longer than a fortnight.
 */
export function WeekPicker({ s }: { s: AvailabilityState }) {
  const open = s.openDrop === 'week'
  const lo = dayOfOffset(MIN_OFFSET).m
  const hi = dayOfOffset(MAX_OFFSET).m
  const shown = Math.max(lo, Math.min(s.calMonth ?? dayOfOffset(s.selStart).m, hi - 1))
  const canPrev = shown > lo
  const canNext = shown + 1 < hi

  return (
    <div style={{ display: 'flex', alignItems: 'center', order: 2, margin: '0 auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)' }}>
      <Arrow title="Previous week" rotate={90} radius="var(--radius-small) 0 0 var(--radius-small)" onClick={() => s.stepWeek(-1)} />

      <span style={{ position: 'relative', display: 'flex' }}>
        <LabelButton
          onClick={(e) => {
            e.stopPropagation()
            s.setOpenDrop(open ? null : 'week')
            s.setCalMonth(null)
            s.setCalMenu(null)
            s.setCalPend(null)
          }}
        >
          {rangeLabel(s.selStart, s.selEnd)}
        </LabelButton>

        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 31, left: '50%', transform: 'translateX(-50%)',
              boxSizing: 'border-box', width: 492, padding: 'var(--size-120)',
              background: 'var(--surface-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)',
              zIndex: 40, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
              <MonthArrow rotate={90} enabled={canPrev} title="Previous month" onClick={() => { if (canPrev) { s.setCalMonth(shown - 1); s.setCalMenu(null) } }} />
              <div style={{ flex: 1 }} />
              <MonthDrop s={s} shown={shown} lo={lo} hi={hi} />
              <YearDrop s={s} />
              <div style={{ flex: 1 }} />
              <MonthArrow rotate={-90} enabled={canNext} title="Next month" onClick={() => { if (canNext) { s.setCalMonth(shown + 1); s.setCalMenu(null) } }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
              {[shown, shown + 1].map((m) => (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
                  <span style={{ boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LABEL }}>
                    {MONTH_NAMES[m].toUpperCase()} 2026
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 2 }}>
                    {DOW.map((d, i) => (
                      <span key={`${d}-${i}`} style={{ boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LABEL }}>{d}</span>
                    ))}
                    {monthCells(2026, m, s.selStart, s.selEnd, s.calPend, MIN_OFFSET, MAX_OFFSET, MAX_RANGE_DAYS).map((c) => (
                      <CalendarDay key={c.key} cell={c} onPick={() => { if (c.off !== null && c.inRange) s.pickCalendarDay(c.off) }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </span>

      <TodayButton onClick={s.goToday} />
      <Arrow title="Next week" rotate={-90} radius="0 var(--radius-small) var(--radius-small) 0" onClick={() => s.stepWeek(1)} />
    </div>
  )
}

function Arrow({ title, rotate, radius, onClick }: { title: string; rotate: number; radius: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: radius, background: hover ? 'var(--surface-subtle)' : 'transparent', cursor: 'pointer', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: `rotate(${rotate}deg)`, color: 'var(--primary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

function LabelButton({ children, onClick }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', width: 210, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-60)', padding: '0 var(--size-100)', background: hover ? 'var(--surface-subtle)' : 'transparent', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', ...caption1Strong, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function TodayButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', padding: '0 var(--size-100)', background: hover ? 'var(--surface-subtle)' : 'transparent', borderRight: '1px solid var(--border-subtle)', ...caption1Strong, color: 'var(--text-link)', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      Today
    </div>
  )
}

function MonthArrow({ rotate, enabled, title, onClick }: { rotate: number; enabled: boolean; title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-small)', color: enabled ? 'var(--primary)' : 'var(--text-disabled)', cursor: enabled ? 'pointer' : 'default', background: enabled && hover ? 'var(--surface-subtle)' : 'transparent', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: `rotate(${rotate}deg)` }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

function MonthDrop({ s, shown, lo, hi }: { s: AvailabilityState; shown: number; lo: number; hi: number }) {
  const open = s.calMenu === 'month'
  const months: number[] = []
  for (let m = lo; m <= hi - 1; m++) months.push(m)
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <PickerButton width={120} onClick={() => s.setCalMenu(open ? null : 'month')}>{MONTH_NAMES[shown]}</PickerButton>
      {open && (
        <Menu width={120} z={41}>
          {months.map((m) => (
            <MenuRow key={m} selected={m === shown} onClick={(e) => { e.stopPropagation(); s.setCalMonth(m); s.setCalMenu(null) }}>
              {MONTH_NAMES[m]}
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

/** The calendar only ever spans 2026, so the year picker has one entry. */
function YearDrop({ s }: { s: AvailabilityState }) {
  const open = s.calMenu === 'year'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <PickerButton width={84} numeric onClick={() => s.setCalMenu(open ? null : 'year')}>2026</PickerButton>
      {open && (
        <Menu width={84} z={41}>
          <MenuRow selected onClick={(e) => { e.stopPropagation(); s.setCalMenu(null) }}>2026</MenuRow>
        </Menu>
      )}
    </span>
  )
}

function PickerButton({ children, width, numeric, onClick }: { children: React.ReactNode; width: number; numeric?: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', width, height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-60)', padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)', border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`, background: 'var(--surface-card)', ...caption1Strong, fontVariantNumeric: numeric ? 'tabular-nums' : undefined, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'border-color var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ flex: 1, textAlign: 'left' }}>{children}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

function CalendarDay({ cell, onPick }: { cell: ReturnType<typeof monthCells>[number]; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  if (cell.off === null) return <div style={{ height: 28 }} />
  const bg = cell.isEdge ? 'var(--primary)' : hover && cell.inRange ? 'var(--surface-subtle)' : cell.inSelection ? 'var(--blue-50)' : 'transparent'
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onPick() }}
      onMouseDown={(e) => e.preventDefault()}
      title={cell.hint}
      style={{
        boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-small)', background: bg, ...caption1,
        fontWeight: cell.isEdge || cell.isToday ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: cell.isEdge ? 'var(--text-inverse)' : !cell.inRange ? 'var(--text-disabled)' : cell.isToday ? 'var(--primary)' : cell.inSelection ? 'var(--blue-700)' : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums', cursor: cell.inRange ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {cell.label}
    </div>
  )
}
