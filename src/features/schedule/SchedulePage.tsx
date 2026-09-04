'use client'

import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2 } from '../../ds/type'
import { Button, SearchField, Tick, Toast } from './parts'
import { LABEL } from './style'
import { Toolbar } from './Toolbar'
import { Grid } from './Grid'
import { Dialogs } from './dialogs'
import { useSchedule } from './useSchedule'
import type { SchedState } from './useSchedule'

/**
 * Schedule - the week as it stands, and every way to change it.
 *
 * One card holds the whole thing: toolbar, the issue chips, the grid, and the
 * legend that decodes it. Nothing is committed silently - a soft warning takes
 * a typed reason, and every act is one Undo away.
 */
export function SchedulePage() {
  const s = useSchedule()

  return (
    <div
      data-screen-label="Schedule"
      onClick={() => { if (s.drop) s.setDrop(null) }}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        // The design file subtracts the header; the shell has already done it.
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <div
        data-rsp-page=""
        style={{
          boxSizing: 'border-box',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-80)',
          padding: 'var(--size-160) var(--size-200) var(--size-200) var(--size-200)',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            overflow: 'hidden',
          }}
        >
          <Toolbar s={s} />
          <IssueChips s={s} />
          <Grid s={s} />
          <Legend s={s} />
        </div>
      </div>

      <Dialogs s={s} />
      <FilterDrawer s={s} />
      {s.toast && <Toast onUndo={s.toastUndo ? s.undo : undefined}>{s.toast}</Toast>}
    </div>
  )
}

/**
 * The issues band.
 *
 * One chip per rule that is currently broken, hard ones first. Clicking a chip
 * narrows the grid to the people it names - the fastest route from "what is
 * wrong" to "who do I fix".
 */
function IssueChips({ s }: { s: SchedState }) {
  const total = s.viol.hard.length + s.viol.soft.length
  if (total === 0) return null

  const groups: Record<string, { rule: string; sev: 'hard' | 'soft'; n: number }> = {}
  s.viol.hard.forEach((v) => {
    groups[v.rule] ??= { rule: v.rule, sev: 'hard', n: 0 }
    groups[v.rule].n += 1
  })
  s.viol.soft.forEach((v) => {
    groups[v.rule] ??= { rule: v.rule, sev: 'soft', n: 0 }
    groups[v.rule].n += 1
  })

  const list = Object.values(groups).sort((a, b) => (a.sev === 'hard' ? 0 : 1) - (b.sev === 'hard' ? 0 : 1))

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-60) var(--space-cell-x)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={LABEL}>Issues</span>
      {list.map((g) => {
        const on = s.fIssue === g.rule
        const tone = g.sev === 'hard'
          ? { bg: 'var(--danger-bg)', bd: on ? 'var(--danger-accent)' : 'var(--danger-border)', fg: 'var(--danger-fg)' }
          : { bg: 'var(--warning-bg)', bd: on ? 'var(--warning-accent)' : 'var(--warning-border)', fg: 'var(--warning-fg)' }
        return (
          <span
            key={g.rule}
            role="button"
            tabIndex={0}
            title={on ? 'Showing only these people - click to clear' : `${g.sev === 'hard' ? 'Hard violation' : 'Soft warning'} - click to show only these people`}
            onClick={(e) => { e.stopPropagation(); s.setFIssue(on ? null : g.rule) }}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              boxSizing: 'border-box', height: 22, display: 'flex', alignItems: 'center', gap: 'var(--size-60)',
              padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
              background: tone.bg, border: `1px solid ${tone.bd}`,
              ...caption1Strong, color: tone.fg, whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >
            {g.n} {g.rule}
            {on && <span style={{ fontWeight: 'var(--weight-regular)' }}>×</span>}
          </span>
        )
      })}
      <div style={{ flex: 1 }} />
      <Button onClick={() => s.openDlg('viol')}>Violations</Button>
      <Button onClick={() => s.openDlg('stats')}>Week stats</Button>
    </div>
  )
}

/** What every fill and outline on the grid means. */
function Legend({ s }: { s: SchedState }) {
  const items = s.depts.filter((d) => d.active).map((d) => ({
    label: d.name, bg: d.c.bg, border: d.c.bd, borderStyle: 'solid',
    stripes: d.striped ? 'repeating-linear-gradient(45deg, rgba(255,255,255,.55) 0 3px, transparent 3px 6px)' : undefined,
  })).concat([
    { label: 'Time off approved', bg: 'var(--green-50)', border: 'var(--green-200)', borderStyle: 'solid', stripes: undefined },
    { label: 'Violation', bg: 'var(--surface-card)', border: 'var(--danger-accent)', borderStyle: 'solid', stripes: undefined },
    { label: 'Unavailable', bg: 'var(--surface-subtle)', border: 'var(--border-default)', borderStyle: 'solid', stripes: 'repeating-linear-gradient(45deg, var(--neutral-100) 0 3px, var(--border-subtle) 3px 6px)' },
    { label: 'Open need', bg: 'var(--surface-card)', border: 'var(--border-strong)', borderStyle: 'dashed', stripes: undefined },
    { label: 'Manual - dot on the block', bg: 'var(--surface-card)', border: 'var(--border-default)', borderStyle: 'solid', stripes: 'radial-gradient(circle at center, var(--text-secondary) 1.5px, transparent 2px)' },
  ])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-60) var(--space-cell-x)', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)', flexWrap: 'wrap' }}>
      {items.map((l) => (
        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', ...caption2, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <span
            style={{
              boxSizing: 'border-box', width: 14, height: 10, borderRadius: 'var(--radius-small)',
              background: l.bg, border: `1px ${l.borderStyle} ${l.border}`, backgroundImage: l.stripes,
            }}
          />
          {l.label}
        </span>
      ))}
    </div>
  )
}

/** The shared filter drawer - two sections, a draft, and Apply. */
function FilterDrawer({ s }: { s: SchedState }) {
  if (!s.fpOpen || !s.fpDraft) return null
  const d = s.fpDraft
  const q = s.fpQuery.trim().toLowerCase()

  const sections = [
    {
      id: 'rows',
      label: 'Rows',
      count: (d.fViol ? 1 : 0) + (d.fNoShift ? 1 : 0),
      rows: [
        { label: 'Only rows with violations', on: d.fViol, radio: false, pick: () => s.setFpDraft({ ...d, fViol: !d.fViol }) },
        { label: 'Hide DAs with no shifts', on: d.fNoShift, radio: false, pick: () => s.setFpDraft({ ...d, fNoShift: !d.fNoShift }) },
      ],
    },
    {
      id: 'roster',
      label: 'Roster',
      count: d.fExcluded === 'All' ? 0 : 1,
      rows: ['All DAs', 'Excluded only', 'Not excluded'].map((label, i) => {
        const value = ['All', 'Excluded only', 'Not excluded'][i]
        return { label, on: d.fExcluded === value, radio: true, pick: () => s.setFpDraft({ ...d, fExcluded: value }) }
      }),
    },
  ]

  const visible = sections
    .map((sec) => ({ sec, rows: q ? sec.rows.filter((r) => r.label.toLowerCase().includes(q)) : sec.rows }))
    .filter((x) => !q || x.rows.length > 0 || x.sec.label.toLowerCase().includes(q))

  const dirty = d.fViol || d.fNoShift || d.fExcluded !== 'All'

  return (
    <div
      onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        role="dialog"
        aria-label="Filters"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 320, maxWidth: '88vw', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: 'var(--surface-raised)', borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--elevation-menu)',
        }}
      >
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Filters</span>
          <CloseButton onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }} />
        </div>
        <div style={{ flexShrink: 0, padding: '0 var(--size-200) var(--size-160) var(--size-200)' }}>
          <SearchField flex value={s.fpQuery} onChange={s.setFpQuery} placeholder="Search filters" />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', borderTop: '1px solid var(--border-subtle)' }}>
          {visible.map(({ sec, rows }) => {
            const open = !!q || !s.fpClosed.includes(sec.id)
            return (
              <div key={sec.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <SectionHead
                  label={sec.label}
                  count={sec.count}
                  open={open}
                  onToggle={() => s.setFpClosed((c) => (c.includes(sec.id) ? c.filter((x) => x !== sec.id) : [...c, sec.id]))}
                />
                {open && (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
                    {rows.map((r) => (
                      <OptionRow key={r.label} label={r.label} on={r.on} radio={r.radio} onPick={r.pick} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
          <span
            onClick={() => { if (dirty) s.setFpDraft({ fViol: false, fNoShift: false, fExcluded: 'All' }) }}
            style={{ ...caption1, color: dirty ? 'var(--text-link)' : 'var(--text-disabled)', cursor: dirty ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
          >
            Clear all
          </span>
          <div style={{ flex: 1 }} />
          <Button onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }}>Cancel</Button>
          <Button
            primary
            onClick={() => {
              s.setFViol(d.fViol)
              s.setFNoShift(d.fNoShift)
              s.setFExcluded(d.fExcluded)
              s.setFpOpen(false)
              s.setFpDraft(null)
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" style={{ display: 'block' }}>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function SectionHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 40, display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: '0 var(--size-200)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1Strong }}>{label}</span>
      {count > 0 && (
        <span
          style={{
            boxSizing: 'border-box', height: 20, display: 'flex', alignItems: 'center',
            padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
            background: 'var(--blue-100)', border: '1px solid var(--blue-200)',
            ...caption1Strong, color: 'var(--blue-700)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
      <span
        style={{
          display: 'flex', color: 'var(--text-secondary)',
          transform: `rotate(${open ? '0deg' : '-90deg'})`,
          transition: 'transform var(--duration-fast) var(--curve-easy-ease)',
        }}
      >
        <svg viewBox="0 0 12 12" width="12" height="12" style={{ display: 'block' }}>
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}

function OptionRow({ label, on, radio, onPick }: { label: string; on: boolean; radio: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        ...caption1, whiteSpace: 'nowrap', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Tick on={on} radio={radio} />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  )
}
