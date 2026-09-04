'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { HOURS_OPTIONS, VEHICLE_TYPES } from './data'
import { TallButton } from './parts'
import type { WorkSummaryState } from './useWorkSummary'

/**
 * Add / Edit Service Type.
 *
 * The two things that identify a type are its name and its hours - together
 * they are the key, so the form refuses a pair that already exists. Everything
 * else is what the type does: who pays, what Amazon calls it, and which vans
 * may run it.
 */
export function TypeDialog({ s }: { s: WorkSummaryState }) {
  const f = s.form
  if (!f) return null
  const close = () => { s.setForm(null); s.setMenu(null) }
  const set = (over: Partial<typeof f>) => s.setForm({ ...f, ...over })

  return (
    <div
      onClick={close}
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
          width: 672,
          maxHeight: '86vh',
          overflow: 'auto',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
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
          <span style={{ flex: 1, ...subtitle1 }}>{f.id ? 'Edit Service Type' : 'Add Service Type'}</span>
          <CloseGlyph onClick={close} />
        </div>

        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-200)',
            padding: 'var(--size-200)',
          }}
        >
          <TwoUp>
            <Field label="Service Type">
              <TextInput value={f.name} onChange={(v) => set({ name: v })} placeholder="Extra Large Van" />
            </Field>
            <Field label="Hours">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
                {HOURS_OPTIONS.map((h) => {
                  const on = f.hrs === h
                  return (
                    <div
                      key={h}
                      role="button"
                      tabIndex={0}
                      onClick={() => set({ hrs: h, other: '' })}
                      style={{
                        boxSizing: 'border-box',
                        height: 'var(--control-height)',
                        minWidth: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 var(--size-80)',
                        borderRadius: 'var(--radius-medium)',
                        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
                        background: on ? 'var(--blue-50)' : 'var(--surface-card)',
                        color: on ? 'var(--blue-700)' : 'var(--text-primary)',
                        fontSize: 'var(--body-1-size)',
                        fontWeight: 'var(--weight-semibold)',
                        cursor: 'pointer',
                      }}
                    >
                      {h}
                    </div>
                  )
                })}
                {/* Anything the four presets do not cover gets typed. */}
                <input
                  value={f.other}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '')
                    set({ other: v, hrs: parseFloat(v) || f.hrs })
                  }}
                  placeholder="Other"
                  style={{
                    boxSizing: 'border-box',
                    width: 72,
                    height: 'var(--control-height)',
                    padding: '0 var(--size-80)',
                    borderRadius: 'var(--radius-medium)',
                    border: '1px solid var(--border-default)',
                    outline: 'none',
                    ...body1,
                    textAlign: 'center',
                    color: 'var(--text-primary)',
                    background: 'var(--surface-card)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>
            </Field>
          </TwoUp>

          <TwoUp>
            <Field label="Paid By">
              <Segmented
                options={['Amazon', 'DSP']}
                value={f.paid}
                onPick={(v) => set({ paid: v as 'Amazon' | 'DSP' })}
              />
            </Field>
            {/* Only a type with no Amazon name can take its count from rescues. */}
            {!f.amz && (
              <Field label="Counts">
                <Segmented
                  options={['typed', 'fed']}
                  labels={{ typed: 'Typed', fed: 'Fed By Rescues' }}
                  value={f.counts}
                  onPick={(v) => set({ counts: v as 'typed' | 'fed' })}
                />
              </Field>
            )}
          </TwoUp>

          <Field label="Amazon Service Type Name">
            <TextInput
              value={f.amz}
              onChange={(v) => set({ amz: v })}
              placeholder="Standard Parcel - Extra Large Van - US"
            />
          </Field>

          <Field label="Allowed Vehicle Types">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
              {VEHICLE_TYPES.map((v) => {
                const on = f.veh.includes(v)
                return (
                  <div
                    key={v}
                    role="button"
                    tabIndex={0}
                    onClick={() => set({ veh: on ? f.veh.filter((y) => y !== v) : [...f.veh, v] })}
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
                    {on ? `${v}  ×` : `+ ${v}`}
                  </div>
                )
              })}
            </div>
          </Field>
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
          <TallButton onClick={close}>Cancel</TallButton>
          <TallButton onClick={() => s.saveType(true)}>Save And Add Another</TallButton>
          <TallButton primary onClick={() => s.saveType(false)}>Save</TallButton>
        </div>
      </div>
    </div>
  )
}

function TwoUp({ children }: { children: ReactNode }) {
  return (
    <div
      data-rsp-c2=""
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--size-160)' }}
    >
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
      <span style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>{label}</span>
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
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: 'var(--control-height)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        outline: 'none',
        ...body1,
        color: 'var(--text-primary)',
        background: 'var(--surface-card)',
      }}
    />
  )
}

/** A joined pair of buttons that behave as one choice. */
function Segmented({
  options,
  labels,
  value,
  onPick,
}: {
  options: string[]
  labels?: Record<string, string>
  value: string
  onPick: (v: string) => void
}) {
  return (
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
      {options.map((o) => {
        const on = value === o
        return (
          <div
            key={o}
            role="button"
            tabIndex={0}
            onClick={() => onPick(o)}
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
            {labels?.[o] ?? o}
          </div>
        )
      })}
    </div>
  )
}

function CloseGlyph({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name="FnDismiss" size={20} />
    </div>
  )
}
