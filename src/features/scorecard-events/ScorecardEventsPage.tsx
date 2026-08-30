'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { signed } from './data'
import { Dialogs } from './dialogs'
import { FilterPanel } from './FilterPanel'
import { FloatingMenu } from './FloatingMenu'
import { AllTable, DoneTable, OpenTable, Pager } from './Tables'
import { Button, Checkbox, GridHead, SearchField, SortHead, Toast } from './parts'
import { CARD_TITLES, COLS, HEADS, NUM, TILE_LABEL } from './style'
import { useEvents, type Tab } from './useEvents'

/**
 * Events.
 *
 * The coaching cycle end to end: the ledger of what scored, the chase list of
 * what is still owed, and the record of what was closed — each with its own
 * headline figures, its own columns, and its own filters.
 */
export function ScorecardEventsPage() {
  const s = useEvents()
  return (
    <div
      data-screen-label="Events"
      onClick={() => { if (s.menu) s.closeMenu() }}
      style={{
        boxSizing: 'border-box', height: 'calc(100vh - var(--header-height))', minHeight: 0,
        display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-200)',
        background: 'var(--surface-page)', fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)', overflow: 'hidden',
      }}
    >
      <Tabs s={s} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div data-rsp-minw0="" style={{ minWidth: 1120, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
          <Strip s={s} />
          <div style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Toolbar s={s} />
            {s.tab === 'open' && s.selCount > 0 && <BulkBar s={s} />}
            <Head s={s} />
            {s.tab === 'all' && <AllTable s={s} />}
            {s.tab === 'open' && <OpenTable s={s} />}
            {s.tab === 'done' && <DoneTable s={s} />}
            <Pager s={s} />
          </div>
        </div>
      </div>

      <FilterPanel s={s} />
      <Dialogs s={s} />
      <FloatingMenu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

const TABS: [Tab, string][] = [['all', 'All'], ['open', 'Open'], ['done', 'Completed']]

function Tabs({ s }: { s: ReturnType<typeof useEvents> }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-200)' }}>
      {TABS.map(([id, label]) => {
        const on = s.tab === id
        return (
          <div
            key={id}
            data-fx=""
            tabIndex={0}
            role="button"
            onClick={() => s.pickTab(id)}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', cursor: 'pointer', paddingBottom: 'var(--size-40)' }}
          >
            <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {label}
            </span>
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }} />}
          </div>
        )
      })}
      <div style={{ flex: 1 }} />
      <Button icon="SvExport" onClick={() => s.toastMsg(`Exported ${s.tab === 'all' ? 'ledger' : s.tab === 'open' ? 'chase list' : 'completions'} · CSV`)}>
        Export
      </Button>
    </div>
  )
}

/** Each tab has its own headline figures. */
function Strip({ s }: { s: ReturnType<typeof useEvents> }) {
  const blanked = s.tab === 'all' && s.applied.voided
  const tiles =
    s.tab === 'all'
      ? [
        { label: 'Events', value: blanked ? '-' : String(s.totals.events), color: blanked ? 'var(--text-disabled)' : 'var(--blue-700)', click: s.go(`Events · ${s.datePreset}`) },
        { label: 'Deductions', value: blanked ? '-' : signed(s.totals.deductions), color: blanked ? 'var(--text-disabled)' : 'var(--danger-fg)', click: s.go('Events · Deductions') },
        { label: 'Bonuses', value: blanked ? '-' : signed(s.totals.bonuses), color: blanked ? 'var(--text-disabled)' : 'var(--success-fg)', click: s.go('Events · Bonuses') },
        { label: 'Coaching Open', value: blanked ? '-' : '6', color: 'var(--text-primary)', click: () => s.pickTab('open') },
        { label: 'Overdue', value: blanked ? '-' : '2', color: blanked ? 'var(--text-disabled)' : 'var(--danger-fg)', click: () => { s.pickTab('open'); s.setApplied({ ...s.applied, blocked: true }) } },
      ]
      : s.tab === 'open'
        ? [
          { label: 'Open Coaching', value: String(s.openCount), color: 'var(--blue-700)', click: () => s.setApplied({ ...s.applied, blocked: false }) },
          { label: 'Overdue', value: '2', color: 'var(--danger-fg)', click: () => s.setApplied({ ...s.applied, blocked: true }) },
          { label: 'Due Today', value: '1', color: 'var(--warning-fg)', click: () => s.setApplied({ ...s.applied, blocked: false }) },
          { label: 'Shift Blocked', value: '2', color: 'var(--danger-fg)', click: () => s.setApplied({ ...s.applied, blocked: true }) },
        ]
        : [
          { label: 'Completed', value: '33', color: 'var(--success-fg)', click: s.go('Coaching Library') },
          { label: 'Average Time', value: '2.8 days', color: 'var(--text-primary)', click: s.go('Coaching Library') },
          { label: 'Average Quiz Score', value: '87%', color: 'var(--success-fg)', click: s.go('Coaching Library') },
          { label: 'Repeat Within 30 Days', value: '9%', color: 'var(--warning-fg)', click: () => s.setApplied({ ...s.applied, repeats: true }) },
        ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiles.length},1fr)`, gap: 'var(--size-120)' }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          data-fx=""
          tabIndex={0}
          role="button"
          onClick={t.click}
          style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
            <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
          </div>
          <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
        </div>
      ))}
    </div>
  )
}

function Toolbar({ s }: { s: ReturnType<typeof useEvents> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
      <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{CARD_TITLES[s.tab]}</span>
      <div style={{ flex: 1 }} />
      <FiltersButton s={s} />
      <SearchField value={s.search} onChange={s.setSearch} placeholder="Search associate or standard" width={220} />
      <Button kind="primary" onClick={() => { s.resetEvent(); s.openDlg('event') }}>+ Log Manual Event</Button>
    </div>
  )
}

function FiltersButton({ s }: { s: ReturnType<typeof useEvents> }) {
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

/** Only the Open tab has bulk actions — the other two have nothing to act on. */
function BulkBar({ s }: { s: ReturnType<typeof useEvents> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-80) var(--size-160)', background: 'var(--blue-50)', borderTop: '1px solid var(--blue-200)' }}>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--blue-700)' }}>{s.selCount} selected</span>
      <Button kind="primary" onClick={() => { const n = s.selCount; s.setSel({}); s.toastMsg(`Reminders sent to ${n} associates`) }}>Send Reminder</Button>
      <Button onClick={() => { s.setRe({ module: null, due: '7' }); s.openDlg('reassign', { kind: 'reassign', label: `${s.selCount} assignments` }) }}>Reassign Module</Button>
      <Button onClick={() => { s.setEx({ date: '2026-08-22', reason: '' }); s.openDlg('extend', { label: `${s.selCount} assignments` }) }}>Extend Due Date</Button>
      <div style={{ flex: 1 }} />
      <Button onClick={() => s.setSel({})}>Clear</Button>
    </div>
  )
}

function Head({ s }: { s: ReturnType<typeof useEvents> }) {
  return (
    <GridHead cols={COLS[s.tab]}>
      {s.tab === 'open' && <Checkbox on={s.allSelected} onClick={(e) => { e.stopPropagation(); s.selectAll() }} />}
      {HEADS[s.tab].map(([k, label, justify]) => (
        <SortHead
          key={label}
          label={label}
          justify={justify}
          active={k != null && s.sort.k === k}
          dir={s.sort.d}
          onClick={k ? () => s.sortBy(k) : undefined}
        />
      ))}
    </GridHead>
  )
}
