'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2Strong } from '../../ds/type'
import { Button, DropTrigger, Menu, MenuRow, SearchField } from './parts'
import { LABEL } from './style'
import { MAX_WEEK, MIN_WEEK } from './data'
import { MONTH_NAMES, dateOf, daysInMonth, toSerial, weekLabel, weekday } from './date'
import type { SchedState } from './useSchedule'

/**
 * The card's one toolbar row.
 *
 * The week stepper is centred with `order` so it stays in the middle of the row
 * whatever wraps around it - the design file's own trick.
 */
export function Toolbar({ s }: { s: SchedState }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--size-80) var(--size-120)',
        padding: 'var(--size-100) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <SearchField width={240} value={s.q} onChange={s.setQ} placeholder="Search name or ID" />

      <span style={{ position: 'relative', display: 'flex' }}>
        <DropTrigger width={150} leadIcon="FnSort" onClick={(e) => { e.stopPropagation(); s.setDrop(s.drop === 'sort' ? null : 'sort') }}>
          Sort: {s.sort}
        </DropTrigger>
        {s.drop === 'sort' && (
          <Menu width={150}>
            {(['Rank', 'Name', 'Hours'] as const).map((o) => (
              <MenuRow key={o} selected={s.sort === o} onClick={(e) => { e.stopPropagation(); s.setSort(o); s.setDrop(null) }}>
                {o}
              </MenuRow>
            ))}
          </Menu>
        )}
      </span>

      <WeekStepper s={s} />

      <span style={{ order: 3, position: 'relative', display: 'flex' }}>
        <Button gap onClick={(e) => { e.stopPropagation(); s.setDrop(s.drop === 'actions' ? null : 'actions') }}>
          Actions
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={12} /></span>
        </Button>
        {s.drop === 'actions' && (
          <Menu width={180} align="right">
            <MenuRow onClick={(e) => { e.stopPropagation(); s.setDrop(null); s.openDlg('copy', { keep: {}, reason: '' }) }}>Copy last week…</MenuRow>
            <MenuRow onClick={(e) => { e.stopPropagation(); s.setDrop(null); s.openDlg('clear') }}>Clear draft…</MenuRow>
            <MenuRow onClick={(e) => { e.stopPropagation(); s.setDrop(null); s.openExport(true) }}>Export log…</MenuRow>
          </Menu>
        )}
      </span>

      <span style={{ order: 3, display: 'flex' }}>
        <Button
          title="Add or edit the shift templates - code, start time, length"
          onClick={() => s.openDlg('depts', { adding: true, name: '', code: '', start: '07:00', len: '10' })}
        >
          + Shift template
        </Button>
      </span>
      <span style={{ order: 3, display: 'flex' }}>
        <Button onClick={() => s.openAdd(null, null)}>+ Add shift</Button>
      </span>

      <span style={{ order: 3, position: 'relative', display: 'flex' }}>
        <Button primary onClick={() => s.openExport(false)}>Export</Button>
        {s.viol.hard.length > 0 && (
          <span
            title="Hard violations - the export will ask you to confirm them"
            style={{
              position: 'absolute', top: -6, right: -6,
              boxSizing: 'border-box', minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 'var(--radius-pill)', background: 'var(--danger-accent)', color: 'var(--text-inverse)',
              ...caption2Strong, lineHeight: '16px', textAlign: 'center',
            }}
          >
            {s.viol.hard.length}
          </span>
        )}
      </span>

      <FilterButton s={s} />
    </div>
  )
}

function FilterButton({ s }: { s: SchedState }) {
  const [hover, hoverProps] = useHover()
  const on = s.filtersApplied
  return (
    <div
      role="button"
      tabIndex={0}
      title="Filters"
      onClick={() => {
        s.setDrop(null)
        s.setFpQuery('')
        s.setFpDraft({ fViol: s.fViol, fNoShift: s.fNoShift, fExcluded: s.fExcluded })
        s.setFpOpen(true)
      }}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width: 28, height: 28, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'transparent',
        border: '1px solid transparent',
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="FnFilter" size={16} />
    </div>
  )
}

function WeekStepper({ s }: { s: SchedState }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        order: 2,
        margin: '0 auto',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
      }}
    >
      <StepButton title="Previous week" rotate={90} onClick={s.weekPrev} side="left" />
      <span style={{ position: 'relative', display: 'flex' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); s.setDrop(s.drop === 'week' ? null : 'week'); s.setCalMonth(null); s.setCalMenu(null) }}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            boxSizing: 'border-box', width: 190, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 var(--size-100)',
            background: 'transparent',
            borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)',
            ...caption1Strong, whiteSpace: 'nowrap', cursor: 'pointer',
          }}
        >
          {weekLabel(s.week)}
        </div>
        {s.drop === 'week' && <Calendar s={s} />}
      </span>
      <div
        role="button"
        tabIndex={0}
        onClick={() => s.setWeek(31)}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center',
          padding: '0 var(--size-100)', background: 'transparent',
          borderRight: '1px solid var(--border-subtle)',
          ...caption1Strong, color: 'var(--text-link)', whiteSpace: 'nowrap', cursor: 'pointer',
        }}
      >
        Today
      </div>
      <StepButton title="Next week" rotate={-90} onClick={s.weekNext} side="right" />
    </div>
  )
}

function StepButton({ title, rotate, onClick, side }: { title: string; rotate: number; onClick: () => void; side: 'left' | 'right' }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width: 30, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: side === 'left' ? 'var(--radius-small) 0 0 var(--radius-small)' : '0 var(--radius-small) var(--radius-small) 0',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: `rotate(${rotate}deg)`, color: 'var(--primary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

/**
 * The two-month picker.
 *
 * Only the weeks the page holds are reachable, so days outside them are greyed
 * rather than hidden - the shape of the month stays readable.
 */
function Calendar({ s }: { s: SchedState }) {
  const minSerial = toSerial(dateOf(MIN_WEEK, 0))
  const maxOffset = (MAX_WEEK - MIN_WEEK) * 7 + 6
  const monthLo = dateOf(MIN_WEEK, 0).m
  const monthHi = dateOf(MAX_WEEK, 6).m
  const m = Math.max(monthLo, Math.min(s.calMonth ?? dateOf(s.week, 0).m, monthHi - 1))
  const canPrev = m > monthLo
  const canNext = m + 1 < monthHi

  return (
    <Menu width={492} centered>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: 'var(--size-80)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <CalStep title="Previous month" rotate={90} enabled={canPrev} onClick={() => s.setCalMonth(m - 1)} />
          <div style={{ flex: 1 }} />
          <span style={{ position: 'relative', display: 'flex' }}>
            <DropTrigger width={120} onClick={(e) => { e.stopPropagation(); s.setCalMenu(s.calMenu === 'month' ? null : 'month') }}>
              <span style={{ fontWeight: 'var(--weight-semibold)' }}>{MONTH_NAMES[m]}</span>
            </DropTrigger>
            {s.calMenu === 'month' && (
              <Menu width={120} z={41}>
                {Array.from({ length: monthHi - monthLo }, (_, i) => monthLo + i).map((mm) => (
                  <MenuRow key={mm} selected={mm === m} onClick={(e) => { e.stopPropagation(); s.setCalMonth(mm); s.setCalMenu(null) }}>
                    {MONTH_NAMES[mm]}
                  </MenuRow>
                ))}
              </Menu>
            )}
          </span>
          <span style={{ position: 'relative', display: 'flex' }}>
            <DropTrigger width={84} onClick={(e) => { e.stopPropagation(); s.setCalMenu(s.calMenu === 'year' ? null : 'year') }}>
              <span style={{ fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>2026</span>
            </DropTrigger>
            {s.calMenu === 'year' && (
              <Menu width={84} z={41}>
                <MenuRow selected onClick={(e) => { e.stopPropagation(); s.setCalMenu(null) }}>2026</MenuRow>
              </Menu>
            )}
          </span>
          <div style={{ flex: 1 }} />
          <CalStep title="Next month" rotate={-90} enabled={canNext} onClick={() => s.setCalMonth(m + 1)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          {[m, m + 1].map((mm) => (
            <MonthGrid key={mm} s={s} month={mm} minSerial={minSerial} maxOffset={maxOffset} />
          ))}
        </div>
      </div>
    </Menu>
  )
}

function CalStep({ title, rotate, enabled, onClick }: { title: string; rotate: number; enabled: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={(e) => { e.stopPropagation(); if (enabled) onClick() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        color: enabled ? 'var(--primary)' : 'var(--text-disabled)',
        background: enabled && hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: `rotate(${rotate}deg)` }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

function MonthGrid({ s, month, minSerial, maxOffset }: { s: SchedState; month: number; minSerial: number; maxOffset: number }) {
  const first = { y: 2026, m: month, d: 1 }
  const lead = weekday(first)
  const dim = daysInMonth(2026, month)
  const todaySerial = toSerial({ y: 2026, m: 7, d: 18 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={{ boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LABEL }}>
        {MONTH_NAMES[month].toUpperCase()} 2026
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 2 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} style={{ boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LABEL }}>
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`lead${i}`} />)}
        {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
          const serial = toSerial({ y: 2026, m: month, d })
          const off = serial - minSerial
          const inRange = off >= 0 && off <= maxOffset
          const wk = MIN_WEEK + Math.floor(off / 7)
          const inSelected = inRange && wk === s.week
          const dow = ((serial + 4) % 7 + 7) % 7
          // The two ends of the open week get the solid fill, so the span reads
          // at a glance without colouring five days in between.
          const isEdge = inSelected && (dow === 0 || dow === 6)
          const isToday = serial === todaySerial
          return (
            <CalDay
              key={d}
              label={String(d)}
              title={inRange ? (inSelected ? 'The open week' : 'Pick any day to open its week') : undefined}
              enabled={inRange}
              bg={isEdge ? 'var(--primary)' : inSelected ? 'var(--blue-50)' : 'transparent'}
              fg={isEdge ? 'var(--text-inverse)' : !inRange ? 'var(--text-disabled)' : isToday ? 'var(--primary)' : inSelected ? 'var(--blue-700)' : 'var(--text-primary)'}
              bold={isEdge || isToday}
              onClick={() => { if (inRange) { s.setWeek(wk); s.setDrop(null); s.setCalMonth(null); s.setCalMenu(null) } }}
            />
          )
        })}
      </div>
    </div>
  )
}

function CalDay({
  label, title, enabled, bg, fg, bold, onClick,
}: {
  label: string
  title?: string
  enabled: boolean
  bg: string
  fg: string
  bold: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  const solid = bg === 'var(--primary)'
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      style={{
        boxSizing: 'border-box', height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: solid ? bg : hover && enabled ? 'var(--surface-subtle)' : bg,
        ...caption1,
        fontWeight: bold ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: fg,
        fontVariantNumeric: 'tabular-nums',
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}
