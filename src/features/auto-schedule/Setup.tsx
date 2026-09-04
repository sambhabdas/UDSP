'use client'

import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2 } from '../../ds/type'
import { Button, DropTrigger, Menu, MenuRow, Input, Section, Seg, Tick } from './parts'
import { LABEL, MATRIX_COLS, dayBg } from './style'
import {
  CAP_OPTIONS, RANK_SOURCES, SCORE_WINDOWS, WINDOW_OPTIONS,
  daOf, initialsOf, tint,
} from './data'
import { DAY_NAMES, fmtDay, weekLabelShort } from '../schedule/date'
import type { AutoState } from './useAutoSchedule'

/**
 * Setup - what the run should aim for and what it is allowed to do.
 *
 * Needs first (how many of each shift, each day), then the rules that gate the
 * fill, then who is out of the pool, then a review of whether the two can
 * actually be reconciled before the run is spent finding out.
 */
export function Setup({ s }: { s: AutoState }) {
  return (
    <div
      data-rsp-page=""
      style={{
        boxSizing: 'border-box', width: '100%', display: 'flex', flexDirection: 'column',
        gap: 'var(--size-160)', padding: 'var(--size-160) var(--size-200) var(--size-480) var(--size-200)',
      }}
    >
      <RunBar s={s} />
      <NeedsSection s={s} />
      <RulesSection s={s} />
      <ExcludedSection s={s} />
      <CoverageSection s={s} />
    </div>
  )
}

function RunBar({ s }: { s: AutoState }) {
  return (
    <div
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: 'var(--size-80) var(--size-120)', padding: 'var(--size-100) var(--space-cell-x)',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
      }}
    >
      <WeekPicker s={s} which="week" />
      <div style={{ flex: 1 }} />
      <Button primary onClick={s.runClick}>Run Auto Schedule</Button>
    </div>
  )
}

export function WeekPicker({ s, which }: { s: AutoState; which: 'week' | 'resweek' }) {
  const open = s.drop === which
  const value = which === 'week' ? s.week : s.resultWeek
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <DropTrigger strong width={220} onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : which) }}>
        Target week: {weekLabelShort(value)}
      </DropTrigger>
      {open && (
        <Menu width={220}>
          {[31, 32, 33].map((w) => (
            <MenuRow
              key={w}
              selected={value === w}
              onClick={(e) => {
                e.stopPropagation()
                if (which === 'week') s.setWeek(w)
                else {
                  s.setResultWeek(w)
                  const idx = s.runs.findIndex((r) => r.week === w)
                  s.setResultRun(idx >= 0 ? idx : 0)
                }
                s.setDrop(null)
              }}
            >
              <span style={{ flex: 1 }}>{weekLabelShort(w)}</span>
              <span style={{ color: 'var(--text-helper)' }}>
                {s.runs.some((r) => r.week === w && !r.discarded) ? 'Has a draft' : 'Empty'}
              </span>
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

/**
 * The needs matrix.
 *
 * A cell turns amber when it asks for more than the day has eligible people -
 * the run cannot fill it however it is configured, and it says so before you
 * spend a run finding out.
 */
function NeedsSection({ s }: { s: AutoState }) {
  return (
    <Section
      title="Needs"
      open={!!s.openSections[1]}
      onToggle={() => s.toggleSection(1)}
      action={
        <Button onClick={(e) => { e.stopPropagation(); s.openDlg('template', { name: '', code: '', perday: '', tstart: '', tlo: '', tli: '', tout: '' }) }}>
          + Shift template
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...LABEL }}>Shift template</div>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const on = !!s.runDays[i]
          return (
            <div
              key={i}
              onClick={() => s.setRunDays(s.runDays.map((v, j) => (j === i ? (v ? 0 : 1) : v)))}
              title={on ? 'Included in the run - click to skip this day' : 'Skipped by the run - click to include'}
              style={{
                boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)',
                borderLeft: '1px solid var(--border-subtle)', background: dayBg(i),
                display: 'flex', alignItems: 'center', gap: 'var(--size-40)',
                whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', userSelect: 'none',
              }}
            >
              <span style={{ ...LABEL, color: on ? 'var(--text-label)' : 'var(--text-disabled)' }}>{DAY_NAMES[i]}</span>
              <span style={{ flex: 1 }} />
              <Tick on={on} />
              <span style={{ flex: 1 }} />
              <span style={{ ...caption2, color: 'var(--text-secondary)' }}>{fmtDay(s.week, i)}</span>
            </div>
          )
        })}
      </div>

      {s.depts.map((dp) => (
        <div key={dp.id} style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-circle)', background: dp.dot, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dp.name}</span>
            <span style={{ color: 'var(--text-helper)' }}>{dp.qual ?? (dp.cap ? `Max ${dp.cap}/wk` : '')}</span>
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const need = s.needs[dp.id]?.[day] ?? 0
            const eligible = s.eligibleFor(dp, day)
            const short = need > eligible
            return (
              <div
                key={day}
                title={short ? `Needed ${need} · Eligible ${eligible}` : undefined}
                style={{ boxSizing: 'border-box', padding: 'var(--size-40)', borderLeft: '1px solid var(--border-subtle)', background: short ? 'var(--warning-bg)' : dayBg(day) }}
              >
                <Input
                  center
                  value={String(need)}
                  color={short ? 'var(--warning-fg)' : 'var(--text-primary)'}
                  border={short ? 'var(--warning-border)' : undefined}
                  onChange={(v) => s.setNeed(dp.id, day, Math.max(0, parseInt(v, 10) || 0))}
                />
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, background: 'var(--surface-subtle)' }}>
        <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--space-cell-x)', ...LABEL }}>Needed total</div>
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <div key={day} style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', borderLeft: '1px solid var(--border-subtle)', ...caption1Strong, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
            {s.neededOn(day)}
          </div>
        ))}
      </div>
    </Section>
  )
}

/**
 * The rules.
 *
 * Three kinds: switchable rules with a value, rules whose severity you choose,
 * and fixed policies that are shown greyed so their absence from the choices
 * is deliberate rather than an omission.
 */
function RulesSection({ s }: { s: AutoState }) {
  const cap = parseInt(s.vCap, 10)
  return (
    <Section title="Rules" open={!!s.openSections[2]} onToggle={() => s.toggleSection(2)}>
      <div style={{ padding: 'var(--size-40) var(--size-160) var(--size-160) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <span style={LABEL}>Work hour compliance</span>

        <RuleRow s={s} ruleKey="window" label="Rolling window">
          <ValueDrop s={s} id="vwindow" width={110} label={`${s.vWindow} days`} options={WINDOW_OPTIONS.map((d) => ({ label: `${d} days`, on: String(d) === s.vWindow, pick: () => s.setVWindow(String(d)) }))} />
        </RuleRow>

        <RuleRow s={s} ruleKey="cap" label="Max hours in window">
          <ValueDrop s={s} id="vcap" width={110} label={`${cap || 50} h`} options={CAP_OPTIONS.map((c) => ({ label: `${c} h`, on: String(c) === s.vCap, pick: () => s.setVCap(String(c)) }))} />
        </RuleRow>

        {cap > 0 && cap < 50 && (
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-100)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-small)', ...caption1, color: 'var(--warning-fg)' }}>
            Saving re-scores the open schedule - puts 3 shifts over the {cap} h cap; they land in Schedule’s violations at Hard
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
        <span style={LABEL}>Warning classification</span>
        {([
          { key: 'hours', label: 'Excluded DAs' },
          { key: 'deptCap', label: 'Department weekly cap' },
          { key: 'avail', label: 'Availability - plain Unavailable cells' },
        ] as const).map((r) => {
          const hard = s.enf[r.key] === 'Hard'
          return (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
              <RuleTick s={s} ruleKey={r.key} />
              <span style={{ flex: 1, minWidth: 0, ...caption1Strong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
              <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
                <Seg on={hard} onClick={() => s.setEnf({ ...s.enf, [r.key]: 'Hard' })}>Hard</Seg>
                <Seg
                  on={!hard}
                  onClick={() => {
                    s.setEnf({ ...s.enf, [r.key]: 'Soft' })
                    s.toastMsg('Global-live - the open schedule re-scores at the new severity')
                  }}
                >
                  Soft
                </Seg>
              </div>
            </div>
          )
        })}

        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
        <span style={LABEL}>Fixed policies</span>
        {[
          { label: 'Approved time off', meta: '', fixed: 'Hard' },
          { label: 'Required qualification', meta: 'Per department, from Schedule', fixed: 'Hard' },
          { label: 'Coaching gate', meta: 'Blocked: 1 DA - Patel, Dev', fixed: 'On' },
          { label: 'One shift per DA per day', meta: '', fixed: 'Hard' },
        ].map((r) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
            <Tick on fixed title="Always on - fixed by policy" />
            <span style={{ flex: 1, minWidth: 0, ...caption1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.label}
              <span style={{ color: 'var(--text-helper)' }}> {r.meta}</span>
            </span>
            <div title="Always on - fixed by policy" style={{ display: 'flex', gap: 'var(--size-40)' }}>
              {(r.fixed === 'On' ? ['On'] : ['Hard', 'Soft']).map((sg) => (
                <Seg key={sg} fixed on={sg === r.fixed}>{sg}</Seg>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
      <span style={{ padding: 'var(--size-120) var(--size-160) 0 var(--size-160)', ...LABEL }}>Ranking</span>
      <div style={{ padding: 'var(--size-120) var(--size-160) var(--size-160) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <RuleRow s={s} ruleKey="rankSource" label="Ranking source">
          <ValueDrop s={s} id="ranksource" width={200} label={s.rankSource} options={RANK_SOURCES.map((r) => ({ label: r, on: s.rankSource === r, pick: () => s.setRankSource(r) }))} />
        </RuleRow>
        <RuleRow s={s} ruleKey="scoreWin" label="Score window">
          <ValueDrop s={s} id="scorewin" width={170} label={`${s.scoreWin} days of events`} options={SCORE_WINDOWS.map((w) => ({ label: `${w} days of events`, on: s.scoreWin === w, pick: () => s.setScoreWin(w) }))} />
        </RuleRow>
      </div>
    </Section>
  )
}

function RuleRow({ s, ruleKey, label, children }: { s: AutoState; ruleKey: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
      <RuleTick s={s} ruleKey={ruleKey} />
      <span style={{ flex: 1, ...caption1Strong }}>{label}</span>
      {children}
    </div>
  )
}

function RuleTick({ s, ruleKey }: { s: AutoState; ruleKey: string }) {
  const on = s.rules[ruleKey] !== false
  return (
    <Tick
      on={on}
      title={on ? 'On for the next run - click to turn off' : 'Off - the next run skips this rule; click to turn on'}
      onClick={(e) => { e.stopPropagation(); s.toggleRule(ruleKey) }}
    />
  )
}

function ValueDrop({
  s, id, width, label, options,
}: {
  s: AutoState
  id: string
  width: number
  label: string
  options: { label: string; on: boolean; pick: () => void }[]
}) {
  const open = s.drop === id
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <DropTrigger width={width} onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : id) }}>
        {label}
      </DropTrigger>
      {open && (
        <Menu width={width}>
          {options.map((o) => (
            <MenuRow key={o.label} selected={o.on} onClick={(e) => { e.stopPropagation(); o.pick(); s.setDrop(null) }}>
              {o.label}
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

/** Who the run will not consider, and why. */
function ExcludedSection({ s }: { s: AutoState }) {
  return (
    <Section
      title="Excluded DAs"
      open={!!s.openSections[3]}
      onToggle={() => s.toggleSection(3)}
      action={
        <Button onClick={(e) => { e.stopPropagation(); s.openDlg('exclude', { picked: [], reason: null, q: '', until: '' }) }}>
          + Exclude DAs
        </Button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-40) var(--size-160) 0 var(--size-160)' }}>
        <RuleTick s={s} ruleKey="excluded" />
        <span style={LABEL}>Excluded DAs</span>
        <span style={{ ...caption1, color: 'var(--text-helper)' }}>{s.excluded.length} excluded</span>
      </div>
      <div style={{ padding: 'var(--size-120) var(--size-160) var(--size-160) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
        {s.excluded.map((e) => (
          <ExclusionChip key={e.da} s={s} exclusion={e} />
        ))}
        {s.excluded.length === 0 && (
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Nobody is excluded - every active DA is in the pool</span>
        )}
      </div>
    </Section>
  )
}

function ExclusionChip({ s, exclusion }: { s: AutoState; exclusion: { da: string; reason: string; until: string | null; note?: string | null } }) {
  const [hover, hoverProps] = useHover()
  const d = daOf(exclusion.da)
  const [avBg, avFg] = tint(d.name)
  // An exclusion with an end date is the one worth noticing - it lapses.
  const expiring = exclusion.until != null

  return (
    <div
      onClick={() => s.openDlg('exclude', {
        picked: [exclusion.da], reason: exclusion.reason, note: exclusion.note ?? '',
        until: exclusion.until ?? '', q: '', editId: exclusion.da,
      })}
      title={`${exclusion.note ? `${exclusion.note} · ` : ''}Click to edit · forward-only - shifts already held stay on the schedule`}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        minHeight: 32, padding: 'var(--size-20) var(--size-100)',
        border: `1px solid ${hover ? 'var(--border-strong)' : expiring ? 'var(--warning-border)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-small)', background: 'var(--surface-card)',
        ...caption1, cursor: 'pointer', transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span
        style={{
          boxSizing: 'border-box', width: 24, height: 24, flexShrink: 0,
          borderRadius: 'var(--radius-circle)', background: avBg, color: avFg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...caption2, fontWeight: 'var(--weight-semibold)',
        }}
      >
        {initialsOf(d.name)}
      </span>
      <span style={{ fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>{d.name}</span>
      <span style={{ color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{d.tid}</span>
      <span style={{ color: expiring ? 'var(--warning-fg)' : 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {exclusion.reason}{exclusion.until ? ` · Until ${exclusion.until}` : ''}
      </span>
      <span
        onClick={(e) => {
          e.stopPropagation()
          s.setExcluded(s.excluded.filter((v) => v.da !== exclusion.da))
          s.toastMsg(`${d.name} is eligible on the next run - shifts they hold are unaffected`)
        }}
        title="Remove - takes effect on the next run"
        style={{ display: 'flex', color: 'var(--text-secondary)', cursor: 'pointer', padding: 'var(--size-20)' }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" style={{ display: 'block' }}>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  )
}

/** Day by day: is what is asked for even possible? */
function CoverageSection({ s }: { s: AutoState }) {
  return (
    <Section title="Coverage review" open={!!s.openSections[4]} onToggle={() => s.toggleSection(4)}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 'var(--size-160)', padding: 'var(--size-60) var(--space-cell-x)', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', ...LABEL }}>
          <div style={{ width: 14, flexShrink: 0 }} />
          <div style={{ width: 60, flexShrink: 0 }}>Day</div>
          <div style={{ width: 80, flexShrink: 0 }}>Date</div>
          <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Needed</div>
          <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Eligible</div>
          <div style={{ flex: 1, minWidth: 100, textAlign: 'right' }}>Available</div>
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const needed = s.neededOn(day)
          const eligible = s.eligibleOn(day)
          const short = s.depts
            .map((dp) => ({ dp, need: s.needs[dp.id]?.[day] ?? 0, el: s.eligibleFor(dp, day) }))
            .filter((x) => x.el < x.need)
          const ok = short.length === 0 && eligible >= needed
          const on = !!s.runDays[day]
          return (
            <div
              key={day}
              style={{
                boxSizing: 'border-box', display: 'flex', gap: 'var(--size-160)', alignItems: 'center',
                minHeight: 'var(--row-height)', padding: 'var(--size-60) var(--space-cell-x)',
                borderBottom: '1px solid var(--border-subtle)', ...caption1,
              }}
            >
              <Tick
                on={on}
                title={on ? 'Included in the run - click to skip this day' : 'Skipped by the run - click to include'}
                onClick={(e) => { e.stopPropagation(); s.setRunDays(s.runDays.map((v, j) => (j === day ? (v ? 0 : 1) : v))) }}
              />
              <div style={{ width: 60, flexShrink: 0, color: 'var(--text-secondary)' }}>{DAY_NAMES[day]}</div>
              <div style={{ width: 80, flexShrink: 0, color: 'var(--text-secondary)' }}>{fmtDay(s.week, day)}</div>
              <div style={{ width: 80, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{needed}</div>
              <div style={{ width: 80, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{eligible}</div>
              <div
                title={short.map((x) => `${x.dp.id}: ${x.need} Needed · ${x.el} Eligible`).join(' · ')}
                style={{ flex: 1, minWidth: 100, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-60)' }}
              >
                <span style={{ ...caption2, color: 'var(--warning-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {short.map((x) => `${x.dp.id}: ${x.need} Needed · ${x.el} Eligible`).join(' · ')}
                </span>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: ok ? 'var(--success-fg)' : 'var(--warning-fg)' }}>
                  {ok ? '✓' : '⚠'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
