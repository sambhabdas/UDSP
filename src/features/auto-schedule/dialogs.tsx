'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { Field, Input, Seg, Tick } from './parts'
import { DAS, EXCLUSION_REASONS, daOf } from './data'
import type { Dept, Exclusion } from './data'
import { weekLabelShort } from '../schedule/date'
import type { AutoState } from './useAutoSchedule'

export function Dialogs({ s }: { s: AutoState }) {
  if (!s.dlg) return null
  const spec =
    s.dlg === 'exclude' ? excludeSpec(s)
      : s.dlg === 'template' ? templateSpec(s)
        : s.dlg === 'runConfirm' ? runConfirmSpec(s)
          : s.dlg === 'send' ? sendSpec(s)
            : discardSpec(s)
  return <Shell s={s} spec={spec} />
}

interface Spec {
  title: string
  width: string
  body: ReactNode
  cta: string
  ctaEnabled: boolean
  ctaDanger?: boolean
  onCta: () => void
}

function Shell({ s, spec }: { s: AutoState; spec: Spec }) {
  return (
    <div
      onClick={s.closeDlg}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 50,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'auto', padding: 'var(--size-320) var(--size-160)',
      }}
    >
      <div
        data-dialog-card=""
        data-dialog-loose=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        style={{
          boxSizing: 'border-box', width: spec.width, marginBlock: 'auto', flexShrink: 0,
          overflow: 'visible', background: 'var(--surface-raised)', borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column',
          gap: 'var(--size-160)', padding: 'var(--size-240)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
          <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>{spec.title}</span>
          <CloseButton onClick={s.closeDlg} />
        </div>
        {spec.body}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ flex: 1 }} />
          <DialogButton onClick={s.closeDlg}>Cancel</DialogButton>
          {spec.cta && (
            <DialogButton
              filled
              danger={spec.ctaDanger}
              disabled={!spec.ctaEnabled}
              onClick={() => { if (spec.ctaEnabled) spec.onCta() }}
            >
              {spec.cta}
            </DialogButton>
          )}
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
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
        borderRadius: 'var(--radius-small)', color: 'var(--text-secondary)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent', transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="DismissSize16ThemeRegular" size={14} />
    </span>
  )
}

function DialogButton({
  children, onClick, filled, danger, disabled,
}: {
  children: ReactNode
  onClick: () => void
  filled?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const base = danger ? 'var(--danger-accent)' : 'var(--primary)'
  const bg = disabled ? 'var(--surface-subtle)' : filled ? (hover ? (danger ? 'var(--danger-fg)' : 'var(--primary-hover)') : base) : hover ? 'var(--surface-subtle)' : 'var(--surface-card)'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)', background: bg,
        border: `1px solid ${disabled ? 'var(--border-default)' : filled ? base : 'var(--border-default)'}`,
        color: disabled ? 'var(--text-disabled)' : filled ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...caption1Strong, whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer', transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function CheckRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', cursor: 'pointer', ...caption1 }}>
      <Tick on={on} />
      {label}
    </div>
  )
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const list = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])

/**
 * Exclude — pick people, give a reason, optionally an end date.
 *
 * Exclusion is forward-only: it changes what the next run will do and never
 * touches a shift somebody already holds, so anyone picked who holds one gets
 * a warning saying exactly that.
 */
function excludeSpec(s: AutoState): Spec {
  const f = s.form
  const picked = list(f.picked)
  const reason = str(f.reason)
  const editId = str(f.editId)
  const query = str(f.q)
  const ok = picked.length > 0 && !!reason
  const candidates = DAS
    .filter((d) => !s.excluded.some((e) => e.da === d.id))
    .filter((d) => !query || d.name.toLowerCase().includes(query.toLowerCase()))
  const withShifts = picked.filter((id) => s.runs.some((r) => !r.discarded && r.assigns.some((a) => a.da === id)))

  return {
    title: editId ? `Edit exclusion - ${daOf(editId).name}` : 'Exclude DAs from runs',
    width: '560px',
    cta: editId ? 'Save' : picked.length ? `Exclude ${picked.length}` : 'Exclude',
    ctaEnabled: ok,
    onCta: () => {
      const until = str(f.until).trim() || null
      const note = str(f.note).trim() || null
      if (editId) {
        s.setExcluded(s.excluded.map((e) => (e.da === editId ? { ...e, reason, note, until } : e)))
        s.closeDlg()
        s.toastMsg('Entry updated - the chip re-renders on every page that shows it')
      } else {
        const added: Exclusion[] = picked.map((id) => ({ da: id, reason, until, note }))
        s.setExcluded(s.excluded.concat(added))
        s.closeDlg()
        s.toastMsg('Excluded - future runs skip them; existing shifts stay put')
      }
    },
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        {!editId && (
          <Input value={query} onChange={(v) => s.setF('q', v)} placeholder="Search the roster" />
        )}
        {!editId && (
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', maxHeight: 180, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}>
            {candidates.map((d) => {
              const on = picked.includes(d.id)
              return (
                <div
                  key={d.id}
                  onClick={() => s.setF('picked', on ? picked.filter((x) => x !== d.id) : picked.concat([d.id]))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 28,
                    padding: '2px var(--size-120)', borderBottom: '1px solid var(--border-subtle)',
                    background: on ? 'var(--blue-50)' : 'transparent', cursor: 'pointer', ...caption1,
                  }}
                >
                  <Tick on={on} />
                  <span style={{ fontWeight: 'var(--weight-semibold)' }}>{d.name}</span>
                  <span style={{ color: 'var(--text-helper)' }}>{d.tid}</span>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--size-40)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ ...caption1Strong, marginRight: 'var(--size-40)' }}>Reason</span>
          {EXCLUSION_REASONS.map((r) => (
            <Seg key={r} on={reason === r} onClick={() => s.setF('reason', r)}>{r}</Seg>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="Until (optional)">
            <Input value={str(f.until)} onChange={(v) => s.setF('until', v)} placeholder="Aug 12" />
          </Field>
        </div>
        {withShifts.length > 0 && (
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-100)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-small)', ...caption1, color: 'var(--warning-fg)', textWrap: 'pretty' }}>
            {withShifts.map((id) => daOf(id).name).join(' · ')}
            {withShifts.length === 1 ? ' holds' : ' hold'} shifts on the schedule - exclusion does not remove them; clear them on Schedule
          </div>
        )}
      </div>
    ),
  }
}

/** Parse "07:00" into minutes past midnight, falling back when it is not one. */
const parseMin = (text: string, fallback: number): number => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim())
  return m && Number(m[2]) < 60 ? Number(m[1]) * 60 + Number(m[2]) : fallback
}

/**
 * A new shift template becomes a department: a row in the needs matrix whose
 * shift length is derived from the times you give it, minus the lunch.
 */
function templateSpec(s: AutoState): Spec {
  const f = s.form
  const name = str(f.name).trim()
  const code = str(f.code).trim()
  const ok = name.length >= 2 && code.length >= 2 && !s.depts.some((d) => d.id.toLowerCase() === code.toLowerCase())

  return {
    title: 'Add a shift template',
    width: '560px',
    cta: 'Add',
    ctaEnabled: ok,
    onCta: () => {
      const start = parseMin(str(f.tstart), 420)
      const lunchOut = parseMin(str(f.tlo), Math.min(start + 240, 1380))
      const lunchIn = parseMin(str(f.tli), lunchOut + 30)
      const out = parseMin(str(f.tout), start + 630)
      const len = Math.max(1, Math.round((out - start - (lunchIn - lunchOut)) / 6) / 10)
      const dots = ['var(--red-500)', 'var(--green-500)']
      const id = code.toUpperCase()
      const dept: Dept = { id, name, len, cap: null, qual: null, dot: dots[s.depts.length % 2] }
      s.setDepts(s.depts.concat([dept]))
      const perDay = Math.max(0, parseInt(str(f.perday), 10) || 0)
      s.addNeedRow(id, perDay)
      s.closeDlg()
      s.toastMsg(`${name} added - set its per-day counts in the matrix`)
    },
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="Name"><Input value={str(f.name)} onChange={(v) => s.setF('name', v)} placeholder="Deluxe" /></Field>
          <Field label="Code"><Input value={str(f.code)} onChange={(v) => s.setF('code', v)} placeholder="DLX" /></Field>
          <Field label="Shifts per day"><Input value={str(f.perday)} onChange={(v) => s.setF('perday', v)} placeholder="3" /></Field>
        </div>
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="Start"><Input value={str(f.tstart)} onChange={(v) => s.setF('tstart', v)} placeholder="07:00" /></Field>
          <Field label="Lunch out"><Input value={str(f.tlo)} onChange={(v) => s.setF('tlo', v)} placeholder="11:00" /></Field>
          <Field label="Lunch in"><Input value={str(f.tli)} onChange={(v) => s.setF('tli', v)} placeholder="11:30" /></Field>
          <Field label="Day out"><Input value={str(f.tout)} onChange={(v) => s.setF('tout', v)} placeholder="17:30" /></Field>
        </div>
      </div>
    ),
  }
}

/** Running over a week that already holds a draft is a replacement, so it asks. */
function runConfirmSpec(s: AutoState): Spec {
  const f = s.form
  const target = s.runs.find((r) => r.week === s.week && !r.discarded)
  const manual = s.week === 31 ? 2 : 0
  return {
    title: `Replace the ${weekLabelShort(s.week)} draft?`,
    width: '440px',
    cta: 'Run and replace',
    ctaEnabled: true,
    onCta: s.executeRun,
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <span style={caption1}>
          This week already holds a draft
          {target ? ` from the ${target.when.split(',')[0]} run` : ''}
          {manual ? ` - including ${manual} manual shifts and 1 swap since` : ''}.
        </span>
        <CheckRow label={`Keep manual shifts (${manual})`} on={f.keepManual !== false} onClick={() => s.setF('keepManual', f.keepManual === false)} />
        <CheckRow label="Keep swaps (1)" on={f.keepSwaps !== false} onClick={() => s.setF('keepSwaps', f.keepSwaps === false)} />
      </div>
    ),
  }
}

function sendSpec(s: AutoState): Spec {
  const run = s.currentRun
  return {
    title: 'Send the draft to Schedule?',
    width: '440px',
    cta: 'Send',
    ctaEnabled: true,
    onCta: () => { s.closeDlg(); s.toastMsg('Sent - the draft is live on Schedule') },
    body: (
      <span style={caption1}>
        Writes {run ? run.assigns.length : 0} shifts into {weekLabelShort(run ? run.week : s.week)} on Schedule. Manual edits made there stay put.
      </span>
    ),
  }
}

/** Deleting a draft removes the shifts but keeps the run and its trace. */
function discardSpec(s: AutoState): Spec {
  const run = s.currentRun
  return {
    title: `Delete the ${weekLabelShort(run ? run.week : s.week)} draft?`,
    width: '440px',
    cta: 'Delete',
    ctaEnabled: !!run,
    ctaDanger: true,
    onCta: () => {
      if (!run) return
      s.setRuns(s.runs.map((r) => (r === run ? { ...r, discarded: true } : r)))
      s.closeDlg()
      s.toastMsg('Draft discarded - the trace stays readable')
    },
    body: (
      <span style={caption1}>
        Removes {run ? run.assigns.length : 0} shifts written by the {run ? run.when.split(',')[0] : ''} run. The run record and its decision trace are kept.
      </span>
    ),
  }
}
