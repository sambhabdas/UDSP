'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { BATCH_STATUSES, BUILT_IN_SOURCES } from './data'
import { Button, IconButton, SearchField } from './parts'
import type { AvailabilityState, GridFilters, HistoryFilters } from './useAvailability'

interface FilterRow {
  label: string
  meta: string
  on: boolean
  radio?: boolean
  pick: () => void
}

interface Section {
  id: string
  label: string
  count: number
  rows: FilterRow[]
}

/**
 * The filter drawer.
 *
 * It edits a copy and only writes it back on Apply, and it serves both tabs -
 * the grid filters rows and cells, History filters batches.
 */
export function FilterPanel({ s }: { s: AvailabilityState }) {
  if (!s.fp) return null
  const sections = s.tab === 'History' ? historySections(s) : gridSections(s)
  const q = s.fpQ.trim().toLowerCase()
  const shown = sections
    .map((sec) => ({ sec, rows: q ? sec.rows.filter((r) => r.label.toLowerCase().includes(q)) : sec.rows }))
    .filter(({ sec, rows }) => !q || rows.length || sec.label.toLowerCase().includes(q))
  const dirty = sections.some((sec) => sec.count > 0)

  return (
    <div onClick={s.cancelFilters} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 48, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Filters"
        style={{ boxSizing: 'border-box', width: 320, maxWidth: '88vw', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-raised)', borderLeft: '1px solid var(--border-default)', boxShadow: 'var(--elevation-menu)' }}
      >
        <div data-rsp-page="" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>Filters</span>
          <IconButton icon="DismissSize16ThemeRegular" onClick={s.cancelFilters} />
        </div>

        <div style={{ flexShrink: 0, padding: '0 var(--size-200) var(--size-160) var(--size-200)' }}>
          <SearchField value={s.fpQ} onChange={s.setFpQ} placeholder="Search filters" width="100%" />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', borderTop: '1px solid var(--border-subtle)' }}>
          {shown.map(({ sec, rows }) => {
            const open = q ? true : s.fpOpenSecs.includes(sec.id)
            return (
              <div key={sec.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <SectionHead
                  label={sec.label}
                  count={sec.count}
                  open={open}
                  onToggle={() => s.setFpOpenSecs(
                    s.fpOpenSecs.includes(sec.id) ? s.fpOpenSecs.filter((i) => i !== sec.id) : s.fpOpenSecs.concat(sec.id),
                  )}
                />
                {open && (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
                    {rows.map((r) => <Option key={r.label} row={r} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div data-rsp-page="" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
          <ClearAll dirty={dirty} onClick={() => clearAll(s)} />
          <div style={{ flex: 1 }} />
          <Button onClick={s.cancelFilters}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

function clearAll(s: AvailabilityState) {
  if (s.tab === 'History') s.setHDraft({ srcs: [], sts: [] })
  else s.setDraft({ unavailOnly: false, excluded: 'All', states: [], sources: [] })
}

/** The grid's four groups: rows, roster, cell state and provenance. */
function gridSections(s: AvailabilityState): Section[] {
  const d = s.gridDraft
  const set = (patch: Partial<GridFilters>) => s.setDraft({ ...d, ...patch })
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v))

  const countState = (t: string) => {
    let n = 0
    s.das.forEach((da) => s.cols.forEach((c) => { if (s.eff(da, c.dow, c.week).t === t) n++ }))
    return String(n)
  }
  const countSource = (src: string) => {
    let n = 0
    s.das.forEach((da) => s.cols.forEach((c) => { if (s.eff(da, c.dow, c.week).src === src) n++ }))
    return String(n)
  }

  return [
    {
      id: 'rows',
      label: 'Rows',
      count: d.unavailOnly ? 1 : 0,
      rows: [{ label: 'Has unavailability this week', meta: '', on: d.unavailOnly, pick: () => set({ unavailOnly: !d.unavailOnly }) }],
    },
    {
      id: 'roster',
      label: 'Roster',
      count: d.excluded !== 'All' ? 1 : 0,
      rows: (['All DAs', 'Excluded only', 'Not excluded'] as const).map((label) => {
        const v = (label === 'All DAs' ? 'All' : label) as GridFilters['excluded']
        return { label, meta: '', on: d.excluded === v, radio: true, pick: () => set({ excluded: v }) }
      }),
    },
    {
      id: 'state',
      label: 'Cell state',
      count: d.states.length,
      rows: ([['Available', 'A'], ['Unavailable', 'U'], ['Time off', 'PTO']] as const).map(([label, t]) => ({
        label, meta: countState(t), on: d.states.includes(t), pick: () => set({ states: toggle(d.states, t) }),
      })),
    },
    {
      id: 'source',
      label: 'Source',
      count: d.sources.length,
      rows: ([['Manual', 'manual'], ['Imported', 'import'], ['Pattern', 'pattern']] as const).map(([label, src]) => ({
        label, meta: countSource(src), on: d.sources.includes(src), pick: () => set({ sources: toggle(d.sources, src) }),
      })),
    },
  ]
}

function historySections(s: AvailabilityState): Section[] {
  const d = s.historyDraft
  const set = (patch: Partial<HistoryFilters>) => s.setHDraft({ ...d, ...patch })
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v))
  const sources = [...BUILT_IN_SOURCES, ...s.customSources]

  return [
    {
      id: 'hsrc',
      label: 'Source',
      count: d.srcs.length,
      rows: sources.map((src) => ({
        label: src,
        meta: String(s.batches.filter((b) => b.source === src).length),
        on: d.srcs.includes(src),
        pick: () => set({ srcs: toggle(d.srcs, src) }),
      })),
    },
    {
      id: 'hst',
      label: 'Status',
      count: d.sts.length,
      rows: BATCH_STATUSES.map((st) => ({
        label: st,
        meta: String(s.batches.filter((b) => b.status === st).length),
        on: d.sts.includes(st),
        pick: () => set({ sts: toggle(d.sts, st) }),
      })),
    },
  ]
}

function SectionHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', height: 40, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-200)', cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined, transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1Strong, color: 'var(--text-primary)' }}>{label}</span>
      {count > 0 && (
        <span style={{ boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: 'var(--blue-100)', border: '1px solid var(--blue-200)', ...caption1Strong, color: 'var(--blue-700)', fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </span>
      )}
      <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: `rotate(${open ? 0 : -90}deg)`, transition: 'transform var(--duration-fast) var(--curve-easy-ease)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

function Option({ row }: { row: FilterRow }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={row.pick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)', ...caption1, whiteSpace: 'nowrap', cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined, transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      <span
        style={{
          boxSizing: 'border-box', width: 14, height: 14,
          // A radio for a pick-one group, a box for a pick-many one.
          borderRadius: row.radio ? 'var(--radius-circle)' : 'var(--radius-small)',
          border: `1px solid ${row.on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: row.on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-inverse)', fontSize: 'var(--caption-2-size)', flexShrink: 0,
        }}
      >
        {row.on ? (row.radio ? '•' : '✓') : ''}
      </span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{row.label}</span>
      <span style={{ color: 'var(--text-helper)', fontVariantNumeric: 'tabular-nums' }}>{row.meta}</span>
    </div>
  )
}

function ClearAll({ dirty, onClick }: { dirty: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => { if (dirty) onClick() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{ ...caption1, color: dirty ? 'var(--text-link)' : 'var(--text-disabled)', cursor: dirty ? 'pointer' : 'default', whiteSpace: 'nowrap', textDecoration: dirty && hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      Clear all
    </span>
  )
}
