'use client'

import { Icon } from '../../ds/icons/Icon'
import { caption1, caption1Strong, caption2, body1 } from '../../ds/type'
import { Button, DropTrigger, Menu, MenuRow, Section, Seg } from './parts'
import { COVERAGE_COLS, LABEL, SKIP_COLS } from './style'
import { DAS, TIERS, daOf, deptOf } from './data'
import type { Run } from './solver'
import { DAY_NAMES, fmtDay, weekLabelShort } from '../schedule/date'
import { WeekPicker } from './Setup'
import type { AutoState } from './useAutoSchedule'

/**
 * Result - what the run did, and why.
 *
 * Three readings of the same run: how well it covered the week, every
 * assignment it made in the order it made them, and, for everyone it passed
 * over, the reason it passed over them.
 */
export function Result({ s }: { s: AutoState }) {
  const run = s.currentRun
  return (
    <div
      data-rsp-page=""
      style={{
        boxSizing: 'border-box', width: '100%', display: 'flex', flexDirection: 'column',
        gap: 'var(--size-160)', padding: 'var(--size-160) var(--size-200) var(--size-480) var(--size-200)',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
          gap: 'var(--size-80) var(--size-120)', padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
        }}
      >
        <WeekPicker s={s} which="resweek" />
        <div style={{ flex: 1 }} />
        <Button primary onClick={(e) => { e.stopPropagation(); s.openDlg('send') }}>Send to Schedule</Button>
        <Button
          primary
          onClick={(e) => {
            e.stopPropagation()
            const name = run ? weekLabelShort(run.week).replace(/[^A-Za-z0-9]+/g, '_') : 'week'
            s.toastMsg(`Exported - run_summary_${name}.csv downloaded`)
          }}
        >
          Export
        </Button>
        <Button primary onClick={(e) => { e.stopPropagation(); s.setTab('Setup') }}>Re-run</Button>
        <Button danger onClick={(e) => { e.stopPropagation(); if (run) s.openDlg('discard') }}>Delete draft</Button>
      </div>

      {!run && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-480) 0' }}>
          <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>No runs yet</span>
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Set the needs and rules on Setup, then run</span>
          <Button primary onClick={() => s.setTab('Setup')}>Open Setup</Button>
        </div>
      )}

      {run && (
        <>
          <RunSummary s={s} run={run} />
          <AssignmentLog s={s} run={run} />
          <SkippedDas s={s} run={run} />
        </>
      )}
    </div>
  )
}

/** Filled over needed, per department and per day, with the run's settings under it. */
function RunSummary({ s, run }: { s: AutoState; run: Run }) {
  const open = s.drop === 'run'
  return (
    <Section
      title="Run summary"
      open={!!s.openSections[5]}
      onToggle={() => s.toggleSection(5)}
      lead={
        <span style={{ position: 'relative', display: 'flex' }}>
            <DropTrigger onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : 'run') }}>{run.when}</DropTrigger>
            {open && (
              <Menu width={260}>
                {s.runs.map((r, i) => (
                  <MenuRow
                    key={i}
                    selected={i === s.currentIndex}
                    onClick={(e) => { e.stopPropagation(); s.setResultRun(i); s.setResultWeek(r.week); s.setDrop(null) }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{weekLabelShort(r.week)} · {r.when}</span>
                    <span style={{ color: 'var(--text-helper)' }}>{r.discarded ? 'Discarded' : `${r.assigns.length}/${r.total}`}</span>
                  </MenuRow>
                ))}
              </Menu>
          )}
        </span>
      }
    >
      <div style={{ padding: 'var(--size-40) var(--size-160) var(--size-160) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COVERAGE_COLS, background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...LABEL }}>Shift template</div>
            {DAY_NAMES.map((d) => (
              <div key={d} style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', textAlign: 'center', ...LABEL }}>{d}</div>
            ))}
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', textAlign: 'right', ...LABEL }}>Total</div>
          </div>

          {s.depts.map((dp) => {
            const need = (run.needs[dp.id] ?? []).reduce((a, b) => a + b, 0)
            const got = run.assigns.filter((a) => a.dept === dp.id).length
            const missing = Math.max(0, need - got)
            return (
              <div key={dp.id} style={{ display: 'grid', gridTemplateColumns: COVERAGE_COLS, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-circle)', background: dp.dot, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dp.name}</span>
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const dayNeed = run.needs[dp.id]?.[day] ?? 0
                  const dayGot = run.assigns.filter((a) => a.dept === dp.id && a.day === day).length
                  const short = dayGot < dayNeed
                  const zero = short && dayGot === 0
                  const idle = dayNeed === 0 && dayGot === 0
                  return (
                    <div
                      key={day}
                      title={short ? `${dayNeed - dayGot} missing` : undefined}
                      style={{
                        boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)',
                        borderLeft: '1px solid var(--border-subtle)',
                        background: zero ? 'var(--danger-bg)' : short ? 'var(--warning-bg)' : 'transparent',
                        textAlign: 'center', ...caption1,
                        fontWeight: short ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                        color: idle ? 'var(--text-disabled)' : zero ? 'var(--danger-fg)' : short ? 'var(--warning-fg)' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {idle ? '-' : `${dayGot}/${dayNeed}`}
                    </div>
                  )
                })}
                <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-40)', ...caption1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontWeight: missing ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                      color: missing && got === 0 ? 'var(--danger-fg)' : missing ? 'var(--warning-fg)' : 'var(--text-primary)',
                    }}
                  >
                    {got}/{need}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>· {need ? Math.round((got / need) * 100) : 100}%</span>
                  {missing > 0 && <span style={{ color: 'var(--warning-fg)', fontWeight: 'var(--weight-semibold)' }}>· {missing} Missing</span>}
                </div>
              </div>
            )
          })}

          <div style={{ display: 'grid', gridTemplateColumns: COVERAGE_COLS, background: 'var(--surface-subtle)' }}>
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...LABEL }}>Total</div>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const need = s.depts.reduce((a, dp) => a + (run.needs[dp.id]?.[day] ?? 0), 0)
              const got = run.assigns.filter((a) => a.day === day).length
              const short = got < need
              return (
                <div
                  key={day}
                  style={{
                    boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)',
                    textAlign: 'center', ...caption1,
                    fontWeight: short ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    color: short ? 'var(--warning-fg)' : 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {got}/{need}
                </div>
              )
            })}
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-40)', ...caption1Strong, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {run.assigns.length}/{run.total}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 'var(--weight-regular)' }}>
                · {run.total ? Math.round((run.assigns.length / run.total) * 100) : 100}%
              </span>
            </div>
          </div>
        </div>

        <span style={{ ...caption2, color: 'var(--text-helper)' }}>
          Snapshot: Window {s.vWindow} d · Cap {run.capSnap} h · Score window {s.scoreWin} d · Excluded {s.excluded.length}
        </span>
      </div>
    </Section>
  )
}

/** Every assignment the run made, in the order it made them. */
function AssignmentLog({ s, run }: { s: AutoState; run: Run }) {
  const rows = run.assigns.filter(
    (a) =>
      (s.logDay === 'All' || DAY_NAMES[a.day] === s.logDay) &&
      (!s.flagsOnly || a.flag) &&
      (!s.logQuery || daOf(a.da).name.toLowerCase().includes(s.logQuery.toLowerCase())),
  )
  return (
    <Section
      title="Assignment log"
      open={!!s.openSections[6]}
      onToggle={() => s.toggleSection(6)}
      action={<Button primary onClick={(e) => { e.stopPropagation(); s.toastMsg('Exported - assignment_log.csv downloaded') }}>Export</Button>}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--space-cell-x)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        {['All', ...DAY_NAMES].map((d, i) => (
          <Seg key={d} on={s.logDay === d} onClick={() => s.setLogDay(d)}>
            {i > 0 ? `${d}, ${fmtDay(run.week, i - 1)}` : d}
          </Seg>
        ))}
        <div style={{ flex: 1 }} />
        <span
          onClick={() => s.setFlagsOnly(!s.flagsOnly)}
          style={{
            boxSizing: 'border-box', height: 24, display: 'flex', alignItems: 'center',
            padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
            background: s.flagsOnly ? 'var(--warning-bg)' : 'var(--surface-card)',
            border: `1px solid ${s.flagsOnly ? 'var(--warning-border)' : 'var(--border-default)'}`,
            ...caption1Strong, color: s.flagsOnly ? 'var(--warning-fg)' : 'var(--text-secondary)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Flags only
        </span>
        <span data-field="" style={{ boxSizing: 'border-box', width: 180, height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-60)', padding: '0 var(--size-100)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)' }}>
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-disabled)' }}>
            <Icon name="SearchGlyph" size={16} />
          </span>
          <input
            placeholder="Search DA"
            value={s.logQuery}
            onChange={(e) => s.setLogQuery(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...caption1, color: 'var(--text-primary)', padding: 0 }}
          />
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--size-160)', padding: 'var(--size-80) var(--space-cell-x)', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', ...LABEL }}>
        <div style={{ width: 60, flexShrink: 0 }}>Day</div>
        <div style={{ width: 90, flexShrink: 0 }}>Department</div>
        <div style={{ flex: 1.2, minWidth: 120 }}>DA</div>
        <div style={{ width: 50, flexShrink: 0 }}>Rank</div>
        <div style={{ width: 56, flexShrink: 0, textAlign: 'right' }}>Score</div>
        <div style={{ width: 80, flexShrink: 0 }}>Tier</div>
        <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Hours after</div>
        <div style={{ flex: 1, minWidth: 100 }}>Flags</div>
      </div>

      <div style={{ maxHeight: 340, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}>
        {rows.map((a, i) => {
          const d = daOf(a.da)
          const t = TIERS[d.tier]
          const dp = deptOf(a.dept, s.depts)
          return (
            <div
              key={i}
              style={{
                boxSizing: 'border-box', display: 'flex', gap: 'var(--size-160)', alignItems: 'center',
                minHeight: 'var(--row-height)', padding: 'var(--size-60) var(--space-cell-x)',
                borderBottom: '1px solid var(--border-subtle)', ...caption1,
              }}
            >
              <div style={{ width: 60, flexShrink: 0, color: 'var(--text-secondary)' }}>{DAY_NAMES[a.day]}</div>
              <div style={{ width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-40)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dp?.dot }} />
                {a.dept}
              </div>
              <div style={{ flex: 1.2, minWidth: 120, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ width: 50, flexShrink: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>#{a.rank}</div>
              <div style={{ width: 56, flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{a.score > 0 ? '+' : ''}{a.score}</div>
              <div style={{ width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', ...caption2, fontWeight: 'var(--weight-semibold)', color: t.fg }}>
                <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: t.dot }} />
                {d.tier}
              </div>
              <div style={{ width: 80, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{a.hoursAfter} h</div>
              <div style={{ flex: 1, minWidth: 100, color: a.flag ? 'var(--warning-fg)' : 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.flag || '-'}</div>
            </div>
          )
        })}
        {rows.length === 0 && (
          <div style={{ padding: 'var(--size-160) var(--space-cell-x)', ...caption1, color: 'var(--text-secondary)' }}>No rows match</div>
        )}
      </div>
    </Section>
  )
}

/** Everyone the run passed over, and the reason it gives for each day. */
function SkippedDas({ s, run }: { s: AutoState; run: Run }) {
  const days = [0, 1, 2, 3, 4, 5, 6]
  const rows = DAS.filter((d) => days.some((day) => run.skipsByDay[day]?.[d.id]))
  return (
    <Section title="Skipped DAs" open={!!s.openSections[7]} onToggle={() => s.toggleSection(7)}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: SKIP_COLS, background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...LABEL }}>DA</div>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', textAlign: 'center', ...LABEL }}>{d}</div>
          ))}
        </div>
        {rows.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: SKIP_COLS, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...caption1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
            {days.map((day) => {
              const reason = run.skipsByDay[day]?.[d.id]
              const [label, bg, fg, weight] = skipCell(reason)
              return (
                <div
                  key={day}
                  title={reason ? cap(reason) : undefined}
                  style={{
                    boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)',
                    borderLeft: '1px solid var(--border-subtle)', background: bg,
                    textAlign: 'center', ...caption2, fontWeight: weight, color: fg,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Section>
  )
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** A skip reason toned by how absolute it is: refusal, ceiling, or just the ranking. */
function skipCell(reason: string | undefined): [string, string, string, string] {
  if (!reason) return ['-', 'transparent', 'var(--text-disabled)', 'var(--weight-regular)']
  const head = reason.split(' - ')[0]
  const label = head === 'ranked below the cut' ? 'Below cut' : head === 'dept cap reached' ? 'Dept cap' : cap(head)
  if (head === 'blocked' || head === 'not qualified') return [label, 'var(--danger-bg)', 'var(--danger-fg)', 'var(--weight-semibold)']
  if (head === 'excluded' || head === 'at cap' || head === 'dept cap reached') return [label, 'var(--warning-bg)', 'var(--warning-fg)', 'var(--weight-semibold)']
  if (head === 'unavailable') return [label, 'var(--surface-subtle)', 'var(--text-secondary)', 'var(--weight-regular)']
  return [label, 'transparent', 'var(--text-secondary)', 'var(--weight-regular)']
}
