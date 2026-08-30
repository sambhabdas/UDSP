'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { fmt, parseT, resolveTemplate, smsSegments, whereOf } from './calc'
import { NOW, PEOPLE_POOL, VANS } from './data'
import { CheckBox, SearchField, ToolButton } from './parts'
import { BARE_INPUT } from './ui'
import type { DispatchState } from './useDispatch'

function Scrim({ onClose, children }: { onClose: () => void; children?: ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        padding: 'var(--size-320) var(--size-160)',
      }}
    >
      {children}
    </div>
  )
}

function Dialog({ width, label, children }: { width: number; label: string; children?: ReactNode }) {
  return (
    <div
      data-dialog-card=""
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={label}
      style={{
        boxSizing: 'border-box',
        width,
        marginBlock: 'auto',
        flexShrink: 0,
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-dialog)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-160)',
        padding: 'var(--size-240)',
      }}
    >
      {children}
    </div>
  )
}

function Foot({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        paddingTop: 'var(--size-120)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ flex: 1 }} />
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
      }}
    >
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={BARE_INPUT} />
    </span>
  )
}

/** Every dialog the boards can open. One switch so a board never has to know
 *  which component it is asking for. */
export function Dialogs({ s }: { s: DispatchState }) {
  if (!s.dlg) return null
  switch (s.dlg) {
    case 'p5':
      return <SendDialog s={s} />
    case 'p7':
      return <AddRowDialog s={s} />
    case 'p6':
      return <RescueDialog s={s} />
    case 'p9':
      return <WaveDialog s={s} />
    case 'p4':
      return <SwapDialog s={s} />
    case 'p3':
      return <AutoAssignDialog s={s} />
    default:
      return null
  }
}

/** P5 — the group send. It shows exactly who will get a message and who will
 *  not, because a send that silently skips people is worse than no send. */
function SendDialog({ s }: { s: DispatchState }) {
  const ids = (s.dlgData.ids as string[] | undefined) ?? []
  const isStatus = !!s.dlgData.status
  const [tmplIdx, setTmplIdx] = useState(() =>
    Math.max(0, s.tmpls.findIndex((t) => t.name === (isStatus ? 'Route Status' : 'Dispatch Info'))),
  )
  const tmpl = s.tmpls[tmplIdx] ?? s.tmpls[0]

  const targets = s.day.rows.filter((r) => ids.includes(r.id))
  const sendable = targets.filter((r) => r.emp && r.phone)
  const skipped = targets.filter((r) => !r.emp || !r.phone)

  const preview = resolveTemplate(tmpl.body, sendable[0], s.day, s.schedOff)
  const segs = smsSegments(preview)

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={620} label="Send info">
        <span style={subtitle1}>{isStatus ? 'Send a status update' : 'Send Dispatch Info'}</span>

        <Field label="Template">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {s.tmpls.map((t, i) => (
              <Choice key={t.name + i} label={t.name} on={i === tmplIdx} onPick={() => setTmplIdx(i)} />
            ))}
          </div>
        </Field>

        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-60)',
          }}
        >
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            Preview · {sendable[0]?.emp ?? 'nobody to preview against'}
          </span>
          <span style={{ ...body1, whiteSpace: 'pre-wrap', textWrap: 'pretty' }}>{preview || '-'}</span>
          <span style={{ ...caption1, color: segs > 3 ? 'var(--warning-fg)' : 'var(--text-helper)' }}>
            {preview.length} characters · {segs} segment{segs > 1 ? 's' : ''} each
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <span style={caption1Strong}>
            {sendable.length} {sendable.length === 1 ? 'person' : 'people'} will get this
          </span>
          {skipped.length > 0 && (
            <span style={{ ...caption1, color: 'var(--warning-fg)', textWrap: 'pretty' }}>
              ⚠ {skipped.length} skipped ·{' '}
              {skipped.map((r) => (r.emp ? `${r.emp.split(',')[0]} (no phone)` : 'row with no driver')).join(', ')}
            </span>
          )}
        </div>

        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
          <ToolButton
            primary
            onClick={() => {
              if (!sendable.length) {
                s.toastMsg('Nobody on this list can be texted')
                return
              }
              const stamp = fmt(NOW)
              if (isStatus) {
                const orSent = { ...s.day.orSent }
                sendable.forEach((r) => { orSent[r.id] = stamp })
                s.act(`Status sent to ${sendable.length}`, { orSent })
              } else {
                s.act(`Dispatch Info sent to ${sendable.length}`, {
                  rows: s.day.rows.map((r) =>
                    sendable.some((x) => x.id === r.id) ? { ...r, sent: stamp } : r,
                  ),
                })
              }
              s.closeDlg()
            }}
          >
            Send to {sendable.length}
          </ToolButton>
        </Foot>
      </Dialog>
    </Scrim>
  )
}

/** P7 — add a row to the roster. */
function AddRowDialog({ s }: { s: DispatchState }) {
  const [band, setBand] = useState('DLX5')
  const [route, setRoute] = useState('')
  const [van, setVan] = useState('')
  const [staging, setStaging] = useState('')
  const [wave, setWave] = useState('')

  const waveM = parseT(wave)
  const ok = route.trim() !== '' && (wave === '' || waveM !== null)

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={560} label="Add a row">
        <span style={subtitle1}>Add a row</span>

        <Field label="Service type">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {s.svcReg.map((t) => (
              <Choice key={t.id} label={t.name} on={band === t.id} onPick={() => setBand(t.id)} />
            ))}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-120)' }}>
          <Field label="Route"><TextInput value={route} onChange={(v) => setRoute(v.toUpperCase())} placeholder="CX312" /></Field>
          <Field label="Van"><TextInput value={van} onChange={setVan} placeholder="PACT26" /></Field>
          <Field label="Staging"><TextInput value={staging} onChange={setStaging} placeholder="STG.L.14, PAD E" /></Field>
          <Field label="Wave"><TextInput value={wave} onChange={setWave} placeholder="7:05" /></Field>
        </div>

        <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
          The row starts with no driver. Seat one from the roster once it exists.
        </span>

        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
          <ToolButton
            primary
            onClick={() => {
              if (!ok) {
                s.toastMsg(wave !== '' && waveM === null ? 'Type the wave as h:mm, e.g. 7:05' : 'A row needs a route')
                return
              }
              s.act(`Row added · ${route}`, {
                rows: [
                  ...s.day.rows,
                  {
                    id: `n${Date.now()}`,
                    band,
                    emp: '',
                    tr: '',
                    route: route.trim().toUpperCase(),
                    van: van.trim(),
                    staging: staging.trim(),
                    wave: waveM,
                    punch: null,
                    sent: null,
                    warn: null,
                    phone: true,
                    noDriver: true,
                    schedOv: false,
                    lastCall: null,
                  },
                ],
              })
              s.closeDlg()
            }}
          >
            Add row
          </ToolButton>
        </Foot>
      </Dialog>
    </Scrim>
  )
}

/** P6 — create a rescue. A rescue with no rescuer is still worth creating: it
 *  puts the stranded driver on the board where somebody will see them. */
function RescueDialog({ s }: { s: DispatchState }) {
  const [rescuing, setRescuing] = useState('')
  const [rescuer, setRescuer] = useState('')
  const [where, setWhere] = useState('')
  const [onPad, setOnPad] = useState(false)
  const [totes, setTotes] = useState('')

  const rows = s.day.rows.filter((r) => r.emp)
  const target = rows.find((r) => r.emp === rescuing)

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={600} label="Create a rescue">
        <span style={subtitle1}>Create a rescue</span>

        <Field label="Who needs rescuing">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap', maxHeight: 120, overflow: 'auto' }}>
            {rows.map((r) => (
              <Choice key={r.id} label={`${r.emp.split(',')[0]} · ${r.route}`} on={rescuing === r.emp} onPick={() => setRescuing(r.emp)} />
            ))}
          </div>
        </Field>

        <Field label="Rescuer">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {s.day.sb.map((b) => (
              <Choice
                key={b.id}
                label={`${b.emp.split(',')[0]} · ${b.status}`}
                on={rescuer === b.emp}
                onPick={() => setRescuer(rescuer === b.emp ? '' : b.emp)}
              />
            ))}
          </div>
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            Leave it empty to put the rescue on the board unassigned.
          </span>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--size-120)' }}>
          <Field label="Where"><TextInput value={where} onChange={setWhere} placeholder="1420 W Olympic Blvd" /></Field>
          <Field label="Totes"><TextInput value={totes} onChange={(v) => setTotes(v.replace(/[^0-9]/g, ''))} placeholder="32" /></Field>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', cursor: 'pointer' }}>
          <CheckBox on={onPad} onClick={() => setOnPad(!onPad)} />
          <span style={body1}>Meeting on the pad</span>
        </label>

        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
          <ToolButton
            primary
            onClick={() => {
              if (!target) {
                s.toastMsg('Pick the driver who needs rescuing')
                return
              }
              const bench = s.day.sb.find((b) => b.emp === rescuer)
              s.act(`Rescue created for ${target.emp.split(',')[0]}`, {
                resc: [
                  ...s.day.resc,
                  {
                    id: `x${Date.now()}`,
                    rescuer: rescuer ? { name: rescuer, van: bench?.van ?? '', origin: 'From Standby' } : null,
                    rescuing: { name: target.emp, route: target.route, van: target.van },
                    where: { a: onPad ? 'On pad' : where, b: '' },
                    onPad,
                    totes: totes === '' ? null : parseInt(totes),
                    sent: null,
                  },
                ],
              })
              s.closeDlg()
            }}
          >
            Create rescue
          </ToolButton>
        </Foot>
      </Dialog>
    </Scrim>
  )
}

/** P9 — set the wave on a set of rows at once. */
function WaveDialog({ s }: { s: DispatchState }) {
  const ids = (s.dlgData.ids as string[] | undefined) ?? []
  const [v, setV] = useState('')
  const t = parseT(v)

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={480} label="Set the wave">
        <span style={subtitle1}>Set the wave</span>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {ids.length} {ids.length === 1 ? 'row' : 'rows'}. Scheduled arrival follows at {s.schedOff} minutes before,
          except on rows where it was typed by hand.
        </span>
        <Field label="Wave"><TextInput value={v} onChange={setV} placeholder="7:05" /></Field>
        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
          <ToolButton
            primary
            onClick={() => {
              if (t === null) {
                s.toastMsg('Type the wave as h:mm, e.g. 7:05')
                return
              }
              s.act(`Wave set to ${fmt(t)} · ${ids.length} rows`, {
                rows: s.day.rows.map((r) =>
                  ids.includes(r.id) ? { ...r, wave: t, schedOv: false, sched: undefined } : r,
                ),
              })
              s.closeDlg()
            }}
          >
            Set wave
          </ToolButton>
        </Foot>
      </Dialog>
    </Scrim>
  )
}

/** P4 — swap who holds a row. The list says where each person already is, so a
 *  swap that would strand somebody else is visible before it happens. */
function SwapDialog({ s }: { s: DispatchState }) {
  const seat = s.dlgData.seat as string | undefined
  const row = s.day.rows.find((r) => r.id === seat)
  const [q, setQ] = useState('')

  const candidates = [
    ...s.day.sb.map((b) => ({ name: b.emp, tr: b.tr })),
    ...s.day.oc.map((o) => ({ name: o.emp, tr: o.tr })),
    ...PEOPLE_POOL.map((p) => ({ name: p.emp, tr: p.tr })),
  ].filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={560} label="Swap the driver">
        <span style={subtitle1}>Swap the driver</span>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {row?.route} · {row?.van || 'no van'} — currently {row?.emp || 'nobody'}
        </span>
        <SearchField value={q} onChange={setQ} placeholder="Search people" width="100%" />
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 260, overflow: 'auto' }}>
          {candidates.map((c) => {
            const w = whereOf(s.day, c.name)
            return (
              <PersonRow
                key={c.tr}
                name={c.name}
                hint={w.hint}
                dot={w.dot}
                onPick={() => {
                  if (!row) return
                  s.act(`${c.name} seated on ${row.route}`, {
                    rows: s.day.rows.map((r) =>
                      r.id === row.id ? { ...r, emp: c.name, tr: c.tr, noDriver: false } : r,
                    ),
                  })
                  s.closeDlg()
                }}
              />
            )
          })}
          {candidates.length === 0 && (
            <span style={{ padding: 'var(--size-120)', ...caption1, color: 'var(--text-secondary)' }}>No match</span>
          )}
        </div>
        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
        </Foot>
      </Dialog>
    </Scrim>
  )
}

/** P3 — fill empty vans from the fleet, saying what it would do first. */
function AutoAssignDialog({ s }: { s: DispatchState }) {
  const ids = (s.dlgData.rows as string[] | undefined) ?? []
  const rows = s.day.rows.filter((r) => ids.includes(r.id) && !r.van)
  const held = new Set(s.day.rows.map((r) => r.van).filter(Boolean))
  const free = VANS.filter((v) => v.status === 'In service' && !held.has(v.id))
  const pairs = rows.slice(0, free.length).map((r, i) => ({ r, v: free[i] }))
  const shortBy = rows.length - pairs.length

  return (
    <Scrim onClose={s.closeDlg}>
      <Dialog width={560} label="Auto-assign vans">
        <span style={subtitle1}>Auto-assign vans</span>
        {rows.length === 0 ? (
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>Every row in this set already has a van.</span>
        ) : (
          <>
            <span style={{ ...body1, color: 'var(--text-secondary)' }}>
              {pairs.length} of {rows.length} rows can be filled from the {free.length} vans in service and unheld.
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 240, overflow: 'auto' }}>
              {pairs.map(({ r, v }) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-80)',
                    padding: 'var(--size-60) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    ...body1,
                  }}
                >
                  <span style={{ flex: 1 }}>{r.route} · {r.emp || 'no driver'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>→</span>
                  <span style={{ fontWeight: 'var(--weight-semibold)' }}>{v.id}</span>
                  <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{v.rank}</span>
                </div>
              ))}
            </div>
            {shortBy > 0 && (
              <span style={{ ...caption1, color: 'var(--warning-fg)', textWrap: 'pretty' }}>
                ⚠ {shortBy} {shortBy === 1 ? 'row' : 'rows'} will still have no van — the fleet has none left in service.
              </span>
            )}
          </>
        )}
        <Foot>
          <ToolButton onClick={s.closeDlg}>Cancel</ToolButton>
          {pairs.length > 0 && (
            <ToolButton
              primary
              onClick={() => {
                const map = new Map(pairs.map((p) => [p.r.id, p.v.id]))
                s.act(`${pairs.length} vans assigned`, {
                  rows: s.day.rows.map((r) => (map.has(r.id) ? { ...r, van: map.get(r.id) as string } : r)),
                })
                s.closeDlg()
              }}
            >
              Assign {pairs.length}
            </ToolButton>
          )}
        </Foot>
      </Dialog>
    </Scrim>
  )
}

function Choice({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary-hover)' : 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

function PersonRow({
  name,
  hint,
  dot,
  onPick,
}: {
  name: string
  hint: string
  dot: string
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        minHeight: 36,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        ...body1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dot, flexShrink: 0 }} />
        {hint}
      </span>
    </div>
  )
}
