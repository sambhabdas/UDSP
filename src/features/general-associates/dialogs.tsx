'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { Button, Field, IconButton } from './parts'
import { FIELD_LABEL, PAIR } from './style'
import { EXCLUSION_REASONS, MODULES, QUALS, VEH_TYPES } from './data'
import type { GaState } from './useGeneralAssociates'

/** The shell all three dialogs sit in — backdrop, title bar, body, footer. */
function Dialog({
  title,
  width,
  onClose,
  children,
  footer,
  scroll,
}: {
  title: string
  width: number
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  /** The Associate form is tall enough to need its own scroller. */
  scroll?: boolean
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
      }}
    >
      <div
        data-dialog-card=""
        data-pop=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width,
          maxHeight: scroll ? '86vh' : undefined,
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: '0 var(--size-200)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ flex: 1, ...subtitle1 }}>{title}</span>
          <IconButton name="FnDismiss" title="Close" size={32} glyph={20} color="var(--text-secondary)" onClick={onClose} />
        </div>

        <div
          style={{
            boxSizing: 'border-box',
            flex: scroll ? 1 : undefined,
            minHeight: scroll ? 0 : undefined,
            overflow: scroll ? 'auto' : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-200)',
            padding: 'var(--size-200)',
          }}
        >
          {children}
        </div>

        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--size-80)',
            padding: 'var(--size-160) var(--size-200)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}

/** A toggleable chip — "+ DOT" off, "DOT  ×" on. */
function ChipToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        ...caption1Strong,
        cursor: 'pointer',
      }}
    >
      {on ? `${label}  ×` : `+ ${label}`}
    </div>
  )
}

function ChipRow({ label, options, chosen, onToggle }: { label: string; options: string[]; chosen: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={FIELD_LABEL}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
        {options.map((v) => (
          <ChipToggle key={v} label={v} on={chosen.includes(v)} onClick={() => onToggle(v)} />
        ))}
      </div>
    </div>
  )
}

const toggle = (arr: string[], v: string): string[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

/**
 * Add / Edit Associate.
 *
 * The transporter ID is the identity every import joins on, so editing locks
 * it: changing it would orphan the record's whole history rather than rename it.
 */
export function DaDialog({ s }: { s: GaState }) {
  const f = s.form
  if (s.dlg !== 'da' || !f) return null
  return (
    <Dialog
      scroll
      width={672}
      title={f.id ? 'Edit Associate' : 'Add Associate'}
      onClose={s.closeDlg}
      footer={
        <>
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button primary onClick={s.saveDa}>
            Save
          </Button>
        </>
      }
    >
      <div data-rsp-c2="" style={PAIR}>
        <Field
          label="Transporter ID"
          value={f.tr}
          disabled={!!f.id}
          placeholder="A3TP0000XX"
          onChange={(v) => s.patchForm({ tr: v.toUpperCase() })}
        />
        <Field label="Name" value={f.nm} placeholder="LAST, FIRST" onChange={(v) => s.patchForm({ nm: v.toUpperCase() })} />
      </div>
      <div data-rsp-c2="" style={PAIR}>
        <Field
          label="Paycom EE Code"
          value={f.ee}
          nums
          placeholder="40118"
          onChange={(v) => s.patchForm({ ee: v.replace(/[^0-9]/g, '') })}
        />
        <Field label="Phone" value={f.ph} nums placeholder="(213) 555-0100" onChange={(v) => s.patchForm({ ph: v })} />
      </div>
      <div data-rsp-c2="" style={PAIR}>
        <Field label="Email" value={f.em} placeholder="name@mail.com" onChange={(v) => s.patchForm({ em: v })} />
        <Field
          label="ADP File Number"
          value={f.adp}
          nums
          placeholder="2214"
          onChange={(v) => s.patchForm({ adp: v.replace(/[^0-9]/g, '') })}
        />
      </div>
      <div data-rsp-c2="" style={PAIR}>
        <Field
          label="Hourly Rate"
          value={f.rate}
          nums
          placeholder="$21.50"
          onChange={(v) => {
            const n = v.replace(/[^0-9.]/g, '')
            s.patchForm({ rate: n ? `$${n}` : '' })
          }}
        />
        <Field
          label="OT Rate"
          value={f.ot}
          nums
          placeholder="$32.25"
          onChange={(v) => {
            const n = v.replace(/[^0-9.]/g, '')
            s.patchForm({ ot: n ? `$${n}` : '' })
          }}
        />
      </div>
      <ChipRow label="Qualifications" options={QUALS} chosen={f.quals} onToggle={(v) => s.patchForm({ quals: toggle(f.quals, v) })} />
      <ChipRow label="Allowed Vehicle Types" options={VEH_TYPES} chosen={f.veh} onToggle={(v) => s.patchForm({ veh: toggle(f.veh, v) })} />
    </Dialog>
  )
}

/** Assign Coaching — one module, a due window, and whether it gates the shift. */
export function CoachDialog({ s }: { s: GaState }) {
  const c = s.coachForm
  if (s.dlg !== 'coach' || !c) return null
  const opts = MODULES.filter(([name]) => !c.q || name.toLowerCase().includes(c.q.toLowerCase()))
  return (
    <Dialog
      width={560}
      title="Assign Coaching"
      onClose={s.closeDlg}
      footer={
        <>
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button primary onClick={s.saveCoach}>
            Assign
          </Button>
        </>
      }
    >
      <span style={subtitle1}>{s.cur.name}</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <span style={FIELD_LABEL}>Module</span>
        <Field value={c.q} placeholder="Search active modules" onChange={(v) => s.patchCoach({ q: v })} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-medium)',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          {opts.map(([name, cat]) => (
            <ModuleRow key={name} name={name} cat={cat} on={c.module === name} onClick={() => s.patchCoach({ module: name })} />
          ))}
        </div>
      </div>

      <div data-rsp-c2="" style={PAIR}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
          <span style={FIELD_LABEL}>Due Within</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
            <Field
              value={c.due}
              width={72}
              align="center"
              nums
              onChange={(v) => s.patchCoach({ due: v.replace(/[^0-9]/g, '') })}
            />
            <span style={{ ...body1, color: 'var(--text-secondary)' }}>days</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
          <span style={FIELD_LABEL}>Blocks Shift When Overdue</span>
          <div style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center' }}>
            <div
              role="switch"
              aria-checked={c.block}
              tabIndex={0}
              onClick={() => s.patchCoach({ block: !c.block })}
              style={{
                boxSizing: 'border-box',
                width: 36,
                height: 20,
                borderRadius: 'var(--radius-pill)',
                background: c.block ? 'var(--primary)' : 'var(--neutral-400)',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 'var(--radius-circle)',
                  background: 'var(--white)',
                  boxShadow: 'var(--shadow-2)',
                  transform: `translateX(${c.block ? 16 : 0}px)`,
                  transition: 'transform var(--duration-faster) var(--curve-easy-ease)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function ModuleRow({ name, cat, on, onClick }: { name: string; cat: string; on: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        minHeight: 36,
        padding: 'var(--size-40) var(--size-100)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-50)' : 'var(--surface-card)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ boxSizing: 'border-box', width: 16, display: 'flex', justifyContent: 'center', color: 'var(--blue-700)' }}>
        {on && <Icon name="FnCheck" size={12} />}
      </span>
      <span
        style={{
          flex: 1,
          ...body1,
          fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
          color: on ? 'var(--blue-700)' : 'var(--text-primary)',
        }}
      >
        {name}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{cat}</span>
    </div>
  )
}

/**
 * Exclude From Auto-Schedule.
 *
 * "Other" is the only reason that cannot stand on its own — it needs the note
 * to say what it actually was, or the exclusion is unauditable later.
 */
export function ExclDialog({ s }: { s: GaState }) {
  const x = s.exclForm
  if (s.dlg !== 'excl' || !x) return null
  return (
    <Dialog
      width={480}
      title="Exclude From Auto-Schedule"
      onClose={s.closeDlg}
      footer={
        <>
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button primary onClick={s.saveExcl}>
            Exclude
          </Button>
        </>
      }
    >
      <span style={subtitle1}>{s.cur.name}</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <span style={FIELD_LABEL}>Reason</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}
        >
          {EXCLUSION_REASONS.map((r) => {
            const on = x.reason === r
            return (
              <div
                key={r}
                role="button"
                tabIndex={0}
                onClick={() => s.patchExcl({ reason: r })}
                style={{
                  boxSizing: 'border-box',
                  height: 'var(--control-height)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 var(--size-120)',
                  background: on ? 'var(--blue-50)' : 'var(--surface-card)',
                  color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
                  ...body1,
                  fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  cursor: 'pointer',
                  borderRight: '1px solid var(--border-default)',
                }}
              >
                {r}
              </div>
            )
          })}
        </div>
      </div>

      <div data-rsp-c2="" style={PAIR}>
        <Field
          label="Until"
          value={x.until}
          placeholder="MM/DD/YYYY - blank = until removed"
          onChange={(v) => s.patchExcl({ until: v })}
        />
        <Field label="Note" value={x.note} placeholder="Required when Other" onChange={(v) => s.patchExcl({ note: v })} />
      </div>
    </Dialog>
  )
}
