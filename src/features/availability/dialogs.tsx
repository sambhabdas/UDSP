'use client'

import { caption1, caption1Strong, caption2 } from '../../ds/type'

import { type Cell } from './data'
import { dayName, effective, numericDate } from './calc'
import { Button, DialogShell, Field, Input, PickerField, Seg } from './parts'
import type { AvailabilityState } from './useAvailability'

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const num = (v: unknown): number => (typeof v === 'number' ? v : 0)
const bools = (v: unknown): boolean[] => (Array.isArray(v) ? (v as boolean[]) : [])
const nums = (v: unknown): number[] => (Array.isArray(v) ? (v as number[]) : [])

const CELL_STATE_OPTIONS = ['Available', 'Unavailable', 'Time off (approved)', 'Pattern (clear override)']

export function Dialogs({ s }: { s: AvailabilityState }) {
  if (!s.dlg) return null
  if (s.dlg === 'cell') return <CellDialog s={s} />
  if (s.dlg === 'pattern') return <PatternDialog s={s} />
  if (s.dlg === 'range') return <RangeDialog s={s} />
  if (s.dlg === 'clearWeek' || s.dlg === 'clearDa') return <ClearDialog s={s} />
  if (s.dlg === 'rollback') return <RollbackDialog s={s} />
  // `coldRemove` is reachable from the batch menu but the design file gives it
  // no body, so it renders nothing — as it does there.
  return null
}

/**
 * One cell, in full.
 *
 * Approved time off needs a reason of its own, and clearing one warns that it
 * is payroll data the export already carried.
 */
function CellDialog({ s }: { s: AvailabilityState }) {
  const f = s.form
  const daId = str(f.da)
  const da = s.das.find((d) => d.id === daId)
  if (!da) return null
  const week = num(f.week)
  const day = num(f.day)
  const current = effective(s.overrides, da, day, week)
  const state = str(f.state)
  const isPto = state === 'Time off (approved)'
  const wasPto = current.t === 'PTO'
  const reason = str(f.reason).trim()
  const ok = !isPto || (reason.length >= 5 && reason.length <= 140)
  const applyTo = str(f.applyTo) || 'This day'

  const save = () => {
    // "Rest of this week" runs from the clicked day to Saturday.
    const days: number[] = []
    if (applyTo === 'Rest of this week') for (let d = day; d <= 6; d++) days.push(d)
    else days.push(day)

    const hours = parseInt(str(f.hours), 10) || 8
    days.forEach((d) => {
      if (state === 'Pattern (clear override)') s.setCell(daId, d, null, week)
      else if (isPto) s.setCell(daId, d, { t: 'PTO', h: hours, reason, src: 'manual' }, week)
      else s.setCell(daId, d, { t: state === 'Available' ? 'A' : 'U', src: 'manual' } as Cell, week)
    })

    const what = state === 'Pattern (clear override)'
      ? 'to pattern'
      : isPto ? `Time off · ${hours} h · ${reason}` : `to ${state}`
    const where = days.length > 1 ? `${dayName(day)} to Sat (${days.length} days)` : dayName(day)
    s.log(isPto ? 'Time off' : 'Cell edit', `${da.name} · ${where} ${what} · ✎`)
    s.closeDlg()
  }

  return (
    <DialogShell
      title={`${da.name} · ${dayName(day)} ${numericDate(s.cols.find((c) => c.week === week && c.dow === day)?.off ?? 0)}`}
      onClose={s.closeDlg}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button kind="primary" disabled={!ok} onClick={() => { if (ok) save() }}>Save</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <Field label="State">
          <SegRow options={CELL_STATE_OPTIONS} current={state} onPick={(o) => s.setF('state', o)} />
        </Field>
        <Field label="Apply to">
          <SegRow options={['This day', 'Rest of this week']} current={applyTo} onPick={(o) => s.setF('applyTo', o)} />
        </Field>
        {isPto && (
          <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
            <Field label="Hours">
              <Input value={str(f.hours)} onChange={(v) => s.setF('hours', v)} placeholder="8" />
            </Field>
            <Field label="Reason">
              <Input value={str(f.reason)} onChange={(v) => s.setF('reason', v)} placeholder="5 to 140 characters" />
            </Field>
          </div>
        )}
        {wasPto && !isPto && (
          <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-100)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-small)', ...caption1, color: 'var(--warning-fg)' }}>
            Clears {current.h} h of approved time off - payroll data the export carries; this week was exported Jul 25, re-export to send the change
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--size-160)' }}>
          <span
            onClick={() => s.openDlg('range', {
              da: daId, state: 'Time off (approved)', from: '', to: '',
              hours: String(parseInt(str(f.hours), 10) || 8),
              rdays: [true, true, true, true, true, true, true], reason: str(f.reason),
            })}
            onMouseDown={(e) => e.preventDefault()}
            style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}
          >
            Make it a range
          </span>
        </div>
      </div>
    </DialogShell>
  )
}

/** The standing weekly pattern — the fallback every cell derives from. */
function PatternDialog({ s }: { s: AvailabilityState }) {
  const f = s.form
  const daId = str(f.da)
  const da = s.das.find((d) => d.id === daId)
  if (!da) return null
  const days = nums(f.days)
  const effectiveFrom = str(f.effective) || 'This week'

  return (
    <DialogShell
      title="Weekly pattern"
      onClose={s.closeDlg}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button
            kind="primary"
            onClick={() => {
              const note = str(f.note).trim()
              s.setDas(s.das.map((d) => (d.id === daId ? { ...d, pattern: days.slice(), note: note || d.note } : d)))
              s.closeDlg()
              const off = days.map((v, i) => (v ? null : dayName(i))).filter(Boolean).join(' ')
              s.log('Pattern change', `${da.name} · ${off} unavailable · effective ${effectiveFrom.toLowerCase()}`)
              s.toastMsg('Pattern saved - this week forward re-derives')
            }}
          >
            Save pattern
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
        <span style={{ fontSize: 'var(--body-1-size)', lineHeight: 'var(--body-1-lh)', color: 'var(--text-secondary)', marginTop: 'calc(-1 * var(--size-80))' }}>{da.name}</span>
        <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const on = !!days[i]
            return (
              <span
                key={i}
                onClick={() => s.setF('days', days.map((v, j) => (j === i ? (v ? 0 : 1) : v)))}
                onMouseDown={(e) => e.preventDefault()}
                style={{ boxSizing: 'border-box', flex: 1, height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 'var(--radius-small)', background: on ? 'var(--success-bg)' : 'var(--surface-subtle)', border: `1px solid ${on ? 'var(--success-border)' : 'var(--border-default)'}`, cursor: 'pointer' }}
              >
                <span style={{ ...caption2, fontWeight: 'var(--weight-semibold)', color: on ? 'var(--success-fg)' : 'var(--text-disabled)' }}>{dayName(i)}</span>
                <span style={{ ...caption2, color: on ? 'var(--success-fg)' : 'var(--text-disabled)' }}>{on ? 'Available' : 'Unavailable'}</span>
              </span>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 'var(--size-120)', marginTop: 'var(--size-120)' }}>
          <Field label="Effective from">
            <SegRow options={['This week', 'Next week']} current={effectiveFrom} onPick={(o) => s.setF('effective', o)} />
          </Field>
          <Field label="Note (optional)">
            <Input value={str(f.note)} onChange={(v) => s.setF('note', v)} placeholder="School on Tuesdays" />
          </Field>
        </div>
      </div>
    </DialogShell>
  )
}

/** A block of days at once — a holiday, or a run of unavailability. */
function RangeDialog({ s }: { s: AvailabilityState }) {
  const f = s.form
  const daId = str(f.da)
  const da = s.das.find((d) => d.id === daId)
  if (!da) return null
  const state = str(f.state)
  const isPto = state === 'Time off (approved)'
  const rdays = bools(f.rdays)
  const daysOn = rdays.filter(Boolean).length
  const reason = str(f.reason).trim()
  const reasonOk = !isPto || (reason.length >= 5 && reason.length <= 140)
  const ok = reasonOk && daysOn > 0 && !!str(f.from).trim() && !!str(f.to).trim()

  return (
    <DialogShell
      title={`Add time off or unavailability - ${da.name}`}
      onClose={s.closeDlg}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button
            kind="primary"
            disabled={!ok}
            onClick={() => {
              if (!ok) return
              s.closeDlg()
              const hours = parseInt(str(f.hours), 10) || 8
              s.log('Range write', `${da.name} · ${str(f.from)} - ${str(f.to)} · ${state}${isPto ? ` · ${hours} h/day · ${reason}` : ''}`)
              s.toastMsg('Range written')
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <Field label="State">
          <SegRow options={['Time off (approved)', 'Unavailable']} current={state} onPick={(o) => s.setF('state', o)} />
        </Field>
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="From"><Input value={str(f.from)} onChange={(v) => s.setF('from', v)} placeholder="Aug 3" /></Field>
          <Field label="To"><Input value={str(f.to)} onChange={(v) => s.setF('to', v)} placeholder="Aug 14" /></Field>
          {isPto && <Field label="Hours per day"><Input value={str(f.hours)} onChange={(v) => s.setF('hours', v)} placeholder="8" /></Field>}
        </div>
        <Field label="Days of the week">
          <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const on = !!rdays[i]
              return (
                <span
                  key={i}
                  onClick={() => s.setF('rdays', rdays.map((v, j) => (j === i ? !v : v)))}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ boxSizing: 'border-box', flex: 1, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-small)', background: on ? 'var(--primary-soft)' : 'var(--surface-card)', border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`, ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--primary)' : 'var(--text-primary)', cursor: 'pointer' }}
                >
                  {dayName(i)}
                </span>
              )
            })}
          </div>
        </Field>
        {isPto && (
          <Field label="Reason">
            <Input value={str(f.reason)} onChange={(v) => s.setF('reason', v)} placeholder="5 to 140 characters" />
          </Field>
        )}
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
          Writes {daysOn * 2} cells across 2 weeks. 2 of these days are already scheduled; those shifts become hard violations on Schedule
        </span>
      </div>
    </DialogShell>
  )
}

/**
 * Reverting to the pattern.
 *
 * Approved time off survives — it is payroll data, not a preference, so it can
 * only be cleared one cell at a time.
 */
function ClearDialog({ s }: { s: AvailabilityState }) {
  const one = s.dlg === 'clearDa' ? s.das.find((d) => d.id === str(s.form.da)) : null
  const w = s.overrides[s.week] ?? {}
  const ids = one ? [one.id] : Object.keys(w)
  let plain = 0
  let pto = 0
  let ptoHours = 0
  ids.forEach((id) => Object.keys(w[id] ?? {}).forEach((day) => {
    const o = w[id][Number(day)]
    if (o.t === 'PTO') { pto++; ptoHours += o.h ?? 0 }
    else plain++
  }))

  return (
    <DialogShell
      title={one ? `Clear ${one.name}’s overrides this week?` : 'Repeat the pattern this week?'}
      width={440}
      onClose={s.closeDlg}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button
            kind="danger"
            onClick={() => {
              const next = JSON.parse(JSON.stringify(s.overrides))
              const wk = next[s.week] ?? {}
              ids.forEach((id) => {
                if (!wk[id]) return
                Object.keys(wk[id]).forEach((day) => { if (wk[id][day].t !== 'PTO') delete wk[id][day] })
                if (Object.keys(wk[id]).length === 0) delete wk[id]
              })
              s.setOverridesDirect(next)
              s.closeDlg()
              s.log('Clear overrides', `${one ? one.name : 'week'} · ${plain} cells to pattern · PTO kept`)
              s.toastMsg(`Reverted ${plain} cells to pattern - time off kept`)
            }}
          >
            {one ? 'Clear' : 'Repeat pattern'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <span style={caption1}>Reverts {plain} overridden cells to pattern.</span>
        {pto > 0 && (
          <span style={{ ...caption1, color: 'var(--warning-fg)' }}>
            {pto} approved time-off days ({ptoHours} h) are kept - clear those from the cell menu
          </span>
        )}
      </div>
    </DialogShell>
  )
}

function RollbackDialog({ s }: { s: AvailabilityState }) {
  const i = num(s.form.i)
  const batch = s.batches[i]
  return (
    <DialogShell
      title="Roll back this import?"
      width={440}
      onClose={s.closeDlg}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button
            kind="danger"
            onClick={() => {
              s.setBatches(s.batches.map((b, bi) => (bi === i ? { ...b, status: 'Rolled back' } : b)))
              s.closeDlg()
              if (batch) {
                s.log('Roll back', `${batch.file} · ${batch.events} cells restored`)
                s.toastMsg('Rolled back')
              }
            }}
          >
            Roll back
          </Button>
        </>
      }
    >
      <span style={caption1}>
        Restores {batch ? batch.events : 0} cells to their pre-import values. Approved time off is never touched.
      </span>
    </DialogShell>
  )
}

function SegRow({ options, current, onPick }: { options: string[]; current: string; onPick: (o: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
      {options.map((o) => <Seg key={o} on={current === o} onClick={() => onPick(o)}>{o}</Seg>)}
    </div>
  )
}

// ── The three small form dialogs, and the record viewer ─────────────────────

const F_TITLES: Record<string, string> = { mv: 'Map value', filter: 'Add filter', source: 'Custom source' }
const F_SAVES: Record<string, string> = { mv: 'Map value', filter: 'Add filter', source: 'Add source' }

export function FormDialog({ s }: { s: AvailabilityState }) {
  if (!s.fDlg) return null
  const valid = s.fDlg === 'mv'
    ? !!s.mv.file.trim() && !!s.mv.std
    : s.fDlg === 'filter'
      // "Is empty" is the one operator that needs no value.
      ? s.ff.op === 'Is empty' || !!s.ff.val.trim()
      : s.cs.trim().length >= 2
  const close = () => { s.setFDlg(null); s.closeMenu() }

  return (
    <DialogShell
      title={F_TITLES[s.fDlg]}
      onClose={close}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" disabled={!valid} onClick={() => { if (valid) saveForm(s) }}>{F_SAVES[s.fDlg!]}</Button>
        </>
      }
    >
      {s.fDlg === 'mv' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          <Field label="File value">
            <Input value={s.mv.file} onChange={(v) => s.setMv({ ...s.mv, file: v })} placeholder="Value as it appears in the file" />
          </Field>
          <Field label="Cell state">
            <PickerField
              label={s.mv.std ?? 'Pick a state'}
              color={s.mv.std ? 'var(--text-primary)' : 'var(--text-helper)'}
              onClick={(e) => s.openMenu(e, 'mvStd')}
            />
          </Field>
        </div>
      )}
      {s.fDlg === 'filter' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          <Field label="Column">
            <PickerField label={s.ff.col} onClick={(e) => s.openMenu(e, 'fCol')} />
          </Field>
          <Field label="Operator">
            <PickerField label={s.ff.op} onClick={(e) => s.openMenu(e, 'fOp')} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Value">
              <Input value={s.ff.val} onChange={(v) => s.setFf({ ...s.ff, val: v })} placeholder="Value to keep" />
            </Field>
          </div>
        </div>
      )}
      {s.fDlg === 'source' && (
        <Field label="Source name">
          <Input value={s.cs} onChange={s.setCs} placeholder="Name the source" />
        </Field>
      )}
    </DialogShell>
  )
}

function saveForm(s: AvailabilityState) {
  if (s.fDlg === 'mv') {
    const file = s.mv.file.trim().toUpperCase()
    s.setVmap(s.vmap.concat([[file, s.mv.std!]]))
    s.setFDlg(null)
    s.toastMsg(`${file} now writes ${s.mv.std}`)
    return
  }
  if (s.fDlg === 'filter') {
    const label = s.ff.op === 'Is empty' ? `${s.ff.col} is empty` : `${s.ff.col} ${s.ff.op.toLowerCase()} ${s.ff.val.trim()}`
    s.setFilters(s.filters.concat([label]))
    s.setFDlg(null)
    s.toastMsg('Filter added - rows failing it will skip')
    return
  }
  const name = s.cs.trim()
  s.setCustomSources(s.customSources.concat([name]))
  s.setImportType(name)
  s.setFDlg(null)
  s.toastMsg(`${name} added - upload a file and map it, then Save as preset`)
}

const G_TITLES: Record<string, string> = { mapping: 'Mapping used', skipRows: 'Skipped rows', matches: 'Remembered matches' }

export function RecordDialog({ s }: { s: AvailabilityState }) {
  if (!s.gDlg) return null
  const rows = recordRows(s)
  const close = () => { s.setGDlg(null); s.setGCtx(null) }

  return (
    <DialogShell
      title={G_TITLES[s.gDlg]}
      onClose={close}
      footer={<><div style={{ flex: 1 }} /><Button onClick={close}>Close</Button></>}
    >
      <span style={{ ...caption1Strong, fontFamily: 'var(--font-mono)' }}>{s.gCtx?.file ?? s.gCtx?.src ?? ''}</span>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)' }}>
        {rows.map((r) => (
          <div key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 40, padding: 'var(--size-60) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ width: 170, flexShrink: 0, ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.value}</span>
            <span style={{ flex: 1, ...caption1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.detail}</span>
            {r.actionLabel && (
              <a href="#" onClick={(e) => { e.preventDefault(); r.action?.() }} style={{ ...caption1, whiteSpace: 'nowrap' }}>{r.actionLabel}</a>
            )}
          </div>
        ))}
      </div>
    </DialogShell>
  )
}

interface RecordRow {
  value: string
  detail: string
  actionLabel?: string
  action?: () => void
}

function recordRows(s: AvailabilityState): RecordRow[] {
  if (s.gDlg === 'mapping') {
    return [
      { value: 'DA match', detail: s.mapping.daCol },
      { value: 'Date column', detail: s.mapping.dayCol },
      { value: 'Value column', detail: s.mapping.valCol },
      { value: 'Value map', detail: `${s.vmap.length} values` },
      { value: 'Filters', detail: s.filters.join(' · ') || 'None' },
    ]
  }
  if (s.gDlg === 'skipRows') {
    const ctx = s.gCtx
    const rows: RecordRow[] = []
    if (ctx?.skipped) rows.push({ value: 'Skipped rows', detail: `${ctx.skipped} rows` })
    if (ctx?.unmatched) rows.push({ value: 'No roster match', detail: `${ctx.unmatched} rows · queued` })
    return rows.length ? rows : [{ value: 'Nothing skipped', detail: 'Every row landed' }]
  }
  return s.remembered.map(([from, to]) => ({
    value: from,
    detail: `Matches ${to}`,
    actionLabel: 'Remove',
    action: () => {
      s.setRemembered(s.remembered.filter((x) => x[0] !== from))
      s.toastMsg(`${from} will queue for remediation on the next run`)
    },
  }))
}
