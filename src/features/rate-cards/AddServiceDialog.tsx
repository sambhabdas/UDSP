'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, subtitle2 } from '../../ds/type'
import { REGISTRY } from './data'
import type { PaidBy } from './data'
import { Dialog, DialogFoot, Field, GhostButton, Labelled, PrimaryButton, Scrim } from './parts'
import { BARE_INPUT } from './ui'
import type { RateCardsState } from './useRateCards'

export function AddServiceDialog({ s }: { s: RateCardsState }) {
  const picked = s.addPick ? REGISTRY.find((g) => g.name + g.hours === s.addPick) : undefined

  return (
    <Scrim onClose={() => s.setAddOpen(false)}>
      <Dialog width={560} label="Add a service type">
        <span style={subtitle2}>Add a service type</span>

        <Labelled label="Name">
          <Field>
            <input
              value={s.addName}
              placeholder="Cargo Van"
              onChange={(e) => {
                s.setAddName(e.target.value)
                s.setAddPick(null)
              }}
              style={BARE_INPUT}
            />
          </Field>
        </Labelled>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
          <Labelled label="Hours" width={120}>
            <Field>
              <input
                value={s.addHours}
                inputMode="numeric"
                placeholder="8"
                onChange={(e) => {
                  s.setAddHours(e.target.value.replace(/[^0-9]/g, ''))
                  s.setAddPick(null)
                }}
                style={BARE_INPUT}
              />
              <span style={{ fontSize: 'var(--caption-1-size)', color: 'var(--text-helper)' }}>hr</span>
            </Field>
          </Labelled>

          <Labelled label="Paid by">
            <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
              {(['Amazon', 'DSP'] as PaidBy[]).map((p) => (
                <PaidOption key={p} label={p} on={s.addPaid === p} onPick={() => s.setAddPaid(p)} />
              ))}
            </div>
          </Labelled>
        </div>

        {/* The registry is the honest path: these already exist on Work Summary,
            so picking one keeps the two lists talking about the same thing. */}
        <Labelled label="Or pick one from Work Summary">
          <span style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Field
              border={s.addMenuOpen ? 'var(--border-focus)' : 'var(--border-default)'}
              onClick={(e) => {
                e.stopPropagation()
                s.setAddMenuOpen(true)
              }}
            >
              <input
                value={s.addQuery}
                placeholder={
                  picked ? `${picked.name} · ${picked.hours} hr` : 'Search service types…'
                }
                onChange={(e) => {
                  s.setAddQuery(e.target.value)
                  s.setAddMenuOpen(true)
                }}
                style={BARE_INPUT}
              />
              <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-secondary)' }}>
                <Icon name="SvChevron" size={16} />
              </span>
            </Field>

            {s.addMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 36,
                  left: 0,
                  right: 0,
                  zIndex: 30,
                  boxSizing: 'border-box',
                  maxHeight: 200,
                  overflow: 'hidden auto',
                  padding: 'var(--size-40)',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-medium)',
                  boxShadow: 'var(--elevation-menu)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--size-20)',
                }}
              >
                {s.registryMatches.map((g) => (
                  <RegistryRow
                    key={g.name + g.hours}
                    name={g.name}
                    hours={`${g.hours} hr`}
                    paidBy={g.paidBy}
                    on={s.addPick === g.name + g.hours}
                    onPick={() => {
                      s.setAddPick(g.name + g.hours)
                      s.setAddName('')
                      s.setAddHours('')
                      s.setAddQuery('')
                      s.setAddMenuOpen(false)
                    }}
                  />
                ))}
                {s.registryMatches.length === 0 && (
                  <span style={{ padding: 'var(--size-80)', ...caption1, color: 'var(--text-secondary)' }}>
                    No match
                  </span>
                )}
              </div>
            )}
          </span>
        </Labelled>

        <DialogFoot>
          <GhostButton onClick={() => s.setAddOpen(false)}>Cancel</GhostButton>
          <PrimaryButton enabled={s.addReady} onClick={s.commitAdd}>
            Add
          </PrimaryButton>
        </DialogFoot>
      </Dialog>
    </Scrim>
  )
}

function PaidOption({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: on
          ? 'var(--primary-soft)'
          : hover
            ? 'var(--surface-subtle)'
            : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary-hover)' : 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

function RegistryRow({
  name,
  hours,
  paidBy,
  on,
  onPick,
}: {
  name: string
  hours: string
  paidBy: string
  on: boolean
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        height: 'var(--row-height)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...body1 }}>{name}</span>
      <span style={{ ...body1Strong, color: 'var(--primary)' }}>{hours}</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{paidBy}</span>
    </div>
  )
}
