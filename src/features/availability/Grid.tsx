'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2 } from '../../ds/type'
import { NEEDS, initialsOf, tint } from './data'
import type { Cell, Da } from './data'
import { dayName, shortDate } from './calc'
import { IconButton, Menu, MenuRow, SearchField, SmallButton } from './parts'
import { LABEL, NUM, UNAVAILABLE_FILL, UNAVAILABLE_SWATCH, dayBg } from './style'
import { WeekPicker } from './WeekPicker'
import type { AvailabilityState } from './useAvailability'

/**
 * The week grid.
 *
 * One row per associate, one column per day in the selected span. Clicking a
 * cell flips it; right-clicking opens the full editor. Approved time off is
 * deliberately not click-flippable — it is payroll data.
 */
export function Grid({ s }: { s: AvailabilityState }) {
  const gridCols = `minmax(170px,230px) repeat(${s.cols.length}, minmax(70px, 1fr))`

  return (
    <div
      data-rsp-page=""
      style={{ boxSizing: 'border-box', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200) var(--size-200) var(--size-200)' }}
    >
      <div style={{ boxSizing: 'border-box', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
        <Toolbar s={s} />

        {s.overridesCount === 0 && (
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', background: 'var(--primary-soft)', borderBottom: '1px solid var(--info-border)', ...caption1, color: 'var(--info-fg)' }}>
            Showing default patterns - no overrides in this week yet
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Header s={s} gridCols={gridCols} />
          {s.rows.map((da) => <Row key={da.id} s={s} da={da} gridCols={gridCols} />)}
        </div>

        <Pager s={s} />
        <Legend />
      </div>
    </div>
  )
}

function Toolbar({ s }: { s: AvailabilityState }) {
  const sortOpen = s.openDrop === 'sort'
  const copyOpen = s.openDrop === 'copysplit'
  // Copying the previous week is meaningless when there is no previous week.
  const noPrevious = s.copyMode === 'Copy previous week' && s.week === 30
  const filtersOn = s.gridFilterCount > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80) var(--size-120)', padding: 'var(--size-100) var(--space-cell-x)', borderBottom: '1px solid var(--border-subtle)' }}>
      <WeekPicker s={s} />

      <SearchField value={s.q} onChange={(v) => { s.setQ(v); s.setPage(1) }} placeholder="Search name or ID" width={240} />

      <span style={{ position: 'relative', display: 'flex' }}>
        <SortTrigger label={s.sort} onClick={(e) => { e.stopPropagation(); s.setOpenDrop(sortOpen ? null : 'sort') }} />
        {sortOpen && (
          <Menu width={160}>
            {(['Name', 'Unavailable days'] as const).map((o) => (
              <MenuRow key={o} selected={s.sort === o} onClick={(e) => { e.stopPropagation(); s.setSort(o); s.setOpenDrop(null) }}>{o}</MenuRow>
            ))}
          </Menu>
        )}
      </span>

      <span style={{ position: 'relative', display: 'flex' }}>
        <FunnelButton on={filtersOn} onClick={s.openFilters} />
      </span>

      <SmallButton icon="ArrowUpSize12ThemeRegular" onClick={() => s.setTab('Import')}>Import</SmallButton>

      <span style={{ position: 'relative', display: 'flex', order: 3 }}>
        <CopyButton
          label={s.copyMode}
          disabled={noPrevious}
          title={noPrevious ? 'No availability data in the previous week' : ''}
          onClick={() => runCopy(s)}
        />
        <CopyCaret
          disabled={noPrevious}
          onClick={(e) => { e.stopPropagation(); s.setOpenDrop(copyOpen ? null : 'copysplit') }}
        />
        {copyOpen && (
          <Menu width="100%">
            {['Copy previous week', 'Repeat pattern'].map((m) => (
              <MenuRow
                key={m}
                selected={s.copyMode === m}
                onClick={(e) => {
                  e.stopPropagation()
                  s.setCopyMode(m)
                  s.setOpenDrop(null)
                  if (m === 'Repeat pattern') s.openDlg('clearWeek')
                  else if (s.week !== 30) copyPrevious(s)
                }}
              >
                {m}
              </MenuRow>
            ))}
          </Menu>
        )}
      </span>
    </div>
  )
}

function runCopy(s: AvailabilityState) {
  if (s.copyMode === 'Copy previous week') {
    if (s.week === 30) return
    copyPrevious(s)
    return
  }
  s.openDlg('clearWeek')
}

function copyPrevious(s: AvailabilityState) {
  s.toastMsg('Copied effective values as this week’s overrides - time off excluded, falls back to pattern')
  s.log('Copy previous week', 'Effective values to overrides · PTO excluded')
}

function SortTrigger({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', width: 160, height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-60)', padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)', border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`, ...caption1, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'border-color var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="FnSort" size={12} /></span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>Sort: {label}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

function FunnelButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title="Filters"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: 'relative', boxSizing: 'border-box', width: 28, height: 28, display: 'flex',
        alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'transparent',
        border: '1px solid transparent', color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="FnFilter" size={16} />
    </div>
  )
}

function CopyButton({ label, disabled, title, onClick }: { label: string; disabled: boolean; title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', flex: 1, height: 28, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small) 0 0 var(--radius-small)',
        background: disabled ? 'var(--surface-subtle)' : hover ? 'var(--primary-hover)' : 'var(--primary)',
        border: `1px solid ${disabled ? 'var(--border-default)' : 'var(--primary)'}`, borderRight: 'none',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-inverse)',
        ...caption1Strong, whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

function CopyCaret({ disabled, onClick }: { disabled: boolean; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title="Copy previous week or repeat the pattern"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width: 26, height: 28, display: 'flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: '0 var(--radius-small) var(--radius-small) 0',
        background: disabled ? 'var(--surface-subtle)' : hover ? 'var(--primary-hover)' : 'var(--primary)',
        border: `1px solid ${disabled ? 'var(--border-default)' : 'var(--primary)'}`,
        borderLeft: `1px solid ${disabled ? 'var(--border-default)' : 'rgba(255,255,255,.35)'}`,
        color: disabled ? 'var(--text-disabled)' : 'var(--text-inverse)', cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

/** The sticky header: the sortable DA column, then a column per day. */
function Header({ s, gridCols }: { s: AvailabilityState; gridCols: string }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'grid', gridTemplateColumns: gridCols, background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
      <div
        data-fx=""
        tabIndex={0}
        role="button"
        onClick={() => { s.setSort('Name'); s.setSortDir(s.sort === 'Name' && s.sortDir === 'asc' ? 'desc' : 'asc') }}
        onMouseDown={(e) => e.preventDefault()}
        style={{ boxSizing: 'border-box', padding: 'var(--size-100) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-40)', ...LABEL, color: s.sort === 'Name' ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
      >
        DA ({s.filtered.length})
        <span style={{ display: 'flex' }}>
          <Icon name={s.sort === 'Name' ? (s.sortDir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
        </span>
      </div>

      {s.cols.map((col) => {
        const needs = NEEDS[col.week]
        const available = s.das.filter((d) => s.eff(d, col.dow, col.week).t === 'A').length
        const need = needs ? needs[col.dow] : null
        const short = need != null && available < need
        return (
          <div
            key={col.off}
            style={{ boxSizing: 'border-box', padding: 'var(--size-100) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', background: dayBg(col.dow), display: 'flex', alignItems: 'baseline', gap: 'var(--size-40)', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <span style={{ ...LABEL, color: 'var(--text-secondary)' }}>{dayName(col.dow)}</span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'center', ...caption2, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shortDate(col.off)}
            </span>
            <span
              title={need != null ? `Available vs roster - needs ${need}${short ? '' : ' met'}` : 'Available vs roster'}
              style={{ flexShrink: 0, ...caption2, fontWeight: 'var(--weight-semibold)', color: short ? 'var(--warning-fg)' : need != null ? 'var(--success-fg)' : 'var(--text-secondary)', ...NUM }}
            >
              ({available}/{s.das.length})
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Row({ s, da, gridCols }: { s: AvailabilityState; da: Da; gridCols: string }) {
  const [hover, hoverProps] = useHover()
  const [avBg, avFg] = tint(da.name)
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid var(--border-subtle)', background: hover ? 'var(--surface-subtle)' : undefined, transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 52, overflow: 'hidden', position: 'relative' }}>
        <span style={{ boxSizing: 'border-box', width: 24, height: 24, flexShrink: 0, borderRadius: 'var(--radius-circle)', background: avBg, color: avFg, display: 'flex', alignItems: 'center', justifyContent: 'center', ...caption2, fontWeight: 'var(--weight-semibold)' }}>
          {initialsOf(da.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ ...caption1Strong, overflow: 'hidden', textOverflow: 'ellipsis' }}>{da.name}</span>
            <span style={{ ...caption2, color: 'var(--text-helper)' }}>{da.tid}</span>
          </div>
          <EditPattern onClick={(e) => { e.stopPropagation(); s.openDlg('pattern', { da: da.id, days: da.pattern.slice(), effective: 'This week', note: da.note ?? '' }) }} />
        </div>
      </div>

      {s.cols.map((col) => (
        <GridCell key={col.off} s={s} da={da} day={col.dow} week={col.week} />
      ))}
    </div>
  )
}

function EditPattern({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer', alignSelf: 'flex-start', whiteSpace: 'nowrap', textDecoration: hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      Edit pattern
    </span>
  )
}

/** How each state paints. Unavailable is hatched, never a flat fill. */
function styleFor(cell: Cell): { bg: string; border: string; fg: string; label: string; weight: string } {
  if (cell.t === 'A') return { bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)', label: 'Available', weight: 'var(--weight-regular)' }
  if (cell.t === 'PTO') return { bg: 'var(--green-50)', border: 'var(--green-200)', fg: 'var(--green-700)', label: `Time off ✓ ${cell.h}h`, weight: 'var(--weight-semibold)' }
  return { bg: UNAVAILABLE_FILL, border: 'var(--border-default)', fg: 'var(--text-disabled)', label: 'Unavailable', weight: 'var(--weight-regular)' }
}

function GridCell({ s, da, day, week }: { s: AvailabilityState; da: Da; day: number; week: number }) {
  const [hover, hoverProps] = useHover()
  const cell = s.eff(da, day, week)
  const st = styleFor(cell)
  const isPto = cell.t === 'PTO'
  const mark = cell.src === 'manual' ? '✎' : cell.src === 'import' ? '⤴' : ''

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        // Approved time off carries hours and a reason; a single click must
        // not be able to throw those away.
        if (isPto) { s.toastMsg('Approved time off changes only from the right-click menu'); return }
        const next = cell.t === 'A' ? 'U' : 'A'
        const fromPattern = da.pattern[day] ? 'A' : 'U'
        // Flipping back to what the pattern already says clears the override
        // rather than pinning the same value twice.
        if (next === fromPattern) s.setCell(da.id, day, null, week)
        else s.setCell(da.id, day, { t: next, src: 'manual' }, week)
        s.log('Cell edit', `${da.name} · ${dayName(day)} to ${next === 'A' ? 'Available' : 'Unavailable'} · ✎`)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        s.openDlg('cell', {
          da: da.id, week, day,
          state: cell.t === 'A' ? 'Available' : cell.t === 'U' ? 'Unavailable' : 'Time off (approved)',
          hours: String(cell.h ?? 8), reason: cell.reason ?? '', applyTo: 'This day',
        })
      }}
      onMouseDown={(e) => e.preventDefault()}
      title={isPto ? `${cell.reason ?? ''} · approved time off changes only from the right-click menu` : ''}
      style={{ boxSizing: 'border-box', padding: 'var(--size-40)', borderLeft: '1px solid var(--border-subtle)', background: hover ? 'var(--surface-subtle)' : dayBg(day), display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, position: 'relative', cursor: 'pointer', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ boxSizing: 'border-box', width: '100%', height: '100%', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-small)', background: st.bg, border: `1px solid ${st.border}`, ...caption1, fontWeight: st.weight, color: st.fg, whiteSpace: 'nowrap' }}>
        {st.label}
      </span>
      {mark && (
        <span
          title={cell.src === 'manual' ? 'Manual override' : 'Imported'}
          style={{ position: 'absolute', top: 6, right: 8, ...caption2, lineHeight: 1, color: 'var(--text-secondary)' }}
        >
          {mark}
        </span>
      )}
    </div>
  )
}

function Pager({ s }: { s: AvailabilityState }) {
  const total = s.filtered.length
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-60) var(--space-cell-x)', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {total ? `Showing ${s.pageStart + 1} - ${Math.min(s.pageStart + 10, total)} of ${total}` : 'No rows'}
      </span>
      <div style={{ flex: 1 }} />
      <IconButton icon="SvChevron" rotate={90} color={s.currentPage > 1 ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (s.currentPage > 1) s.setPage(s.currentPage - 1) }} />
      <span style={{ ...caption1Strong, whiteSpace: 'nowrap' }}>Page {s.currentPage} of {s.pages}</span>
      <IconButton icon="SvChevron" rotate={-90} color={s.currentPage < s.pages ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (s.currentPage < s.pages) s.setPage(s.currentPage + 1) }} />
    </div>
  )
}

function Legend() {
  const items = [
    { label: 'Available', bg: 'var(--success-bg)', border: 'var(--success-border)' },
    { label: 'Unavailable', bg: UNAVAILABLE_SWATCH, border: 'var(--border-default)' },
    { label: 'Time off approved', bg: 'var(--green-50)', border: 'var(--green-200)' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-60) var(--space-cell-x)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
      {items.map((l) => (
        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <span style={{ boxSizing: 'border-box', width: 16, height: 12, borderRadius: 'var(--radius-small)', background: l.bg, border: `1px solid ${l.border}` }} />
          {l.label}
        </span>
      ))}
      <span style={{ ...caption1, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>✎ Manual · ⤴ Imported · No mark = pattern</span>
    </div>
  )
}
