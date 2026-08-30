'use client'

import type { MouseEvent } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2Strong, subtitle1 } from '../../ds/type'
import {
  addDays,
  cents,
  dayCost,
  dayRevenue,
  fmtD,
  fromIso,
  int,
  iso,
  money,
  pkgsOn,
  routesOn,
  trainingsOn,
  winOn,
} from './calc'
import { LOCKED_THROUGH, TODAY } from './data'
import { Dialog, DialogFoot, Field, GhostButton, Labelled, PrimaryButton, Scrim, Switch } from './parts'
import { BARE_INPUT } from './ui'
import type { RateCardsState } from './useRateCards'

// How far forward an open-ended change is costed when reporting its effect.
const CARRY_HORIZON = 120

export function RateEditor({ s }: { s: RateCardsState }) {
  const ed = s.editor
  if (!ed) return null

  const isRoute = ed.kind === 'route'
  const type = isRoute ? s.types.find((t) => t.id === ed.typeId) : undefined
  const list = type
    ? type.windows
    : ed.kind === 'training'
      ? s.trainWindows
      : s.pkgWindows

  const fromD = fromIso(ed.from)
  const toD = fromIso(ed.to)
  const cur = winOn(list, fromD)
  const oldRate = cur ? cur.rate : 0
  const newRate = parseFloat(ed.rate)
  const valid = !isNaN(newRate)
  const delta = valid ? newRate - oldRate : 0
  const fmt = isRoute || ed.kind === 'training' ? money : cents

  const unitsOn = (d: Date) =>
    isRoute && type ? routesOn(type, d) : ed.kind === 'training' ? trainingsOn(d) : pkgsOn(d)

  // What the change does to the day it starts on.
  const revBefore = dayRevenue(s.types, s.pkgWindows, fromD)
  const revAfter = revBefore + (valid ? unitsOn(fromD) * delta : 0)
  const cost = dayCost(s.types, fromD)
  const marginBefore = revBefore ? ((revBefore - cost) / revBefore) * 100 : 0
  const marginAfter = revAfter ? ((revAfter - cost) / revAfter) * 100 : 0

  // And to the days after it that are already priced — minus the ones payroll
  // has closed, which keep the old rate whatever this says.
  let laterDays = 0
  let laterUnits = 0
  let laterMoney = 0
  const stop = ed.carry ? addDays(fromD, CARRY_HORIZON) : toD
  for (let d = addDays(fromD, 1); d <= stop; d = addDays(d, 1)) {
    const n = unitsOn(d)
    if (!n) continue
    if (d <= LOCKED_THROUGH) continue
    laterDays += 1
    laterUnits += n
    laterMoney += n * (valid ? delta : 0)
  }

  const canSave = valid && newRate > 0 && (ed.carry || ed.to >= ed.from) && delta !== 0

  const unitWord = isRoute ? 'routes' : ed.kind === 'training' ? 'sessions' : 'packages'

  // Three days that say what the change means, in the order they happen.
  const cards = [
    { d: addDays(fromD, -1), rate: oldRate, state: 'Unchanged', tone: 'past' as const },
    { d: fromD, rate: valid ? newRate : oldRate, state: 'From · Changed here', tone: 'from' as const },
    ed.carry
      ? {
          d: addDays(fromD, 1),
          rate: valid ? newRate : oldRate,
          state: 'Until changed',
          tone: 'openend' as const,
        }
      : {
          d: addDays(toD, 1),
          rate: oldRate,
          state: `Back to ${fmt(oldRate)}`,
          tone: 'past' as const,
        },
  ]

  const tones = {
    past: {
      bg: 'var(--surface-card)',
      border: 'var(--border-default)',
      borderStyle: 'solid',
      rateColor: 'var(--text-secondary)',
      stateColor: 'var(--text-helper)',
    },
    from: {
      bg: 'var(--primary-soft)',
      border: 'var(--primary)',
      borderStyle: 'solid',
      rateColor: 'var(--info-fg)',
      stateColor: 'var(--info-fg)',
    },
    openend: {
      bg: 'var(--surface-card)',
      border: 'var(--primary)',
      borderStyle: 'dashed',
      rateColor: 'var(--info-fg)',
      stateColor: 'var(--info-fg)',
    },
  }

  const title = isRoute
    ? 'Change a rate'
    : ed.kind === 'training'
      ? 'Change the training rate'
      : 'Change the package rate'

  return (
    <Scrim onClose={s.closeEditor}>
      <Dialog width={600} label={title}>
        <span style={subtitle1}>{title}</span>

        {/* What is being changed, and on what day — stated before anything can
            be typed, because the day is the whole point. */}
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-40)',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--surface-card)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: 0, ...body1Strong }}>
              {isRoute && type
                ? `${type.name} · ${type.hours} hr`
                : ed.kind === 'training'
                  ? 'Per training'
                  : 'Delivered packages'}
            </span>
            <span
              style={{
                boxSizing: 'border-box',
                height: 20,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-medium)',
                background: 'var(--info-bg)',
                border: '1px solid var(--info-border)',
                ...caption1Strong,
                color: 'var(--info-fg)',
                whiteSpace: 'nowrap',
              }}
            >
              On {fmtD(fromD, true)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
          <Labelled
            label={
              isRoute
                ? 'New rate per route'
                : ed.kind === 'training'
                  ? 'New rate per training'
                  : 'New rate per package'
            }
          >
            <Field width={140} border={ed.error ? 'var(--danger-accent)' : 'var(--border-default)'}>
              <span style={{ ...body1, color: 'var(--text-helper)' }}>$</span>
              <input
                value={ed.rate}
                inputMode="decimal"
                onChange={(e) => s.patchEditor({ rate: e.target.value.replace(/[^0-9.]/g, '') })}
                style={{ ...BARE_INPUT, fontWeight: 'var(--weight-semibold)', textAlign: 'right' }}
              />
            </Field>
          </Labelled>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
          <Labelled label="From">
            <DateField
              value={ed.from}
              open={s.dpOpen === 'from'}
              onToggle={(e) => {
                e.stopPropagation()
                s.setDpOpen(s.dpOpen === 'from' ? null : 'from')
                s.setDpMonth(fromIso(ed.from))
              }}
              onPick={(k) => {
                // Picking the start past the end drags the end with it, rather
                // than leaving a window that ends before it begins.
                s.patchEditor({ from: k, to: k > ed.to ? k : ed.to })
                s.setDpOpen(null)
              }}
              s={s}
              selected={ed.from}
            />
          </Labelled>

          <Labelled
            label={<span style={{ color: ed.carry ? 'var(--text-secondary)' : 'var(--text-primary)' }}>To</span>}
          >
            {ed.carry ? (
              <NoEnd onClick={() => s.patchEditor({ carry: false })} />
            ) : (
              <DateField
                value={ed.to}
                open={s.dpOpen === 'to'}
                onToggle={(e) => {
                  e.stopPropagation()
                  s.setDpOpen(s.dpOpen === 'to' ? null : 'to')
                  s.setDpMonth(fromIso(ed.to))
                }}
                onPick={(k) => {
                  s.patchEditor({ to: k })
                  s.setDpOpen(null)
                }}
                s={s}
                selected={ed.to}
              />
            )}
          </Labelled>
        </div>

        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-120)',
            marginTop: 'var(--size-80)',
            padding: 'var(--size-120) var(--size-160)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
            <span style={{ flex: 1, minWidth: 0, ...body1Strong }}>Carry forward from this day</span>
            <Switch on={ed.carry} onClick={() => s.patchEditor({ carry: !ed.carry })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--size-80)' }}>
            {cards.map((c, i) => {
              const tone = tones[c.tone]
              return (
                <div
                  key={i}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: 'var(--size-100) var(--size-60)',
                    borderRadius: 'var(--radius-medium)',
                    background: tone.bg,
                    border: `1px ${tone.borderStyle} ${tone.border}`,
                  }}
                >
                  <span
                    style={{
                      ...body1Strong,
                      color: tone.rateColor,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt(c.rate)}
                  </span>
                  <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {fmtD(c.d)}
                    {c.tone === 'openend' ? ' →' : ''}
                  </span>
                  <span
                    style={{
                      ...caption1,
                      color: tone.stateColor,
                      textAlign: 'center',
                      textWrap: 'pretty',
                    }}
                  >
                    {c.state}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-100)',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-120)' }}>
            <span style={{ ...body1Strong, fontVariantNumeric: 'tabular-nums' }}>
              {money(revBefore)} → {money(revAfter)}
            </span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              {fmtD(fromD)} Revenue
            </span>
            <div style={{ flex: 1 }} />
            <span
              style={{
                ...caption1,
                fontVariantNumeric: 'tabular-nums',
                color: marginAfter >= marginBefore ? 'var(--success-fg)' : 'var(--danger-fg)',
              }}
            >
              {marginBefore.toFixed(1)}% → {marginAfter.toFixed(1)}%
            </span>
          </div>
          {laterDays > 0 && valid && delta !== 0 && (
            <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
              {laterDays} later {laterDays === 1 ? 'day' : 'days'} already priced ·{' '}
              {int(laterUnits)} {unitWord} · {money(Math.abs(laterMoney))}{' '}
              {laterMoney >= 0 ? 'more' : 'less'}
            </span>
          )}
        </div>

        {ed.error && (
          <div
            role="status"
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-120) var(--size-160)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-medium)',
              ...caption1,
              color: 'var(--danger-fg)',
              textWrap: 'pretty',
            }}
          >
            {ed.error}
          </div>
        )}

        <DialogFoot>
          <GhostButton onClick={s.closeEditor}>Cancel</GhostButton>
          <PrimaryButton enabled={canSave} onClick={s.commit}>
            Save rate
          </PrimaryButton>
        </DialogFoot>
      </Dialog>
    </Scrim>
  )
}

function NoEnd({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title="Leave blank to run from the start date forever"
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 190,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...body1,
        color: 'var(--text-disabled)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      No end
    </span>
  )
}

function DateField({
  value,
  open,
  onToggle,
  onPick,
  s,
  selected,
}: {
  value: string
  open: boolean
  onToggle: (e: MouseEvent<HTMLSpanElement>) => void
  onPick: (iso: string) => void
  s: RateCardsState
  selected: string
}) {
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <span
        onClick={onToggle}
        style={{
          boxSizing: 'border-box',
          width: 190,
          height: 'var(--control-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: 'var(--surface-card)',
          border: `1px solid ${open ? 'var(--border-focus)' : 'var(--border-default)'}`,
          ...body1,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'border-color var(--motion-hover)',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fmtD(fromIso(value), true)}
        </span>
        <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-secondary)' }}>
          <Icon name="PgCalendarLtr" size={16} />
        </span>
      </span>
      {open && <DayPicker selected={selected} onPick={onPick} s={s} />}
    </span>
  )
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function DayPicker({
  selected,
  onPick,
  s,
}: {
  selected: string
  onPick: (iso: string) => void
  s: RateCardsState
}) {
  const base = s.dpMonth ?? fromIso(selected)
  const first = new Date(base.getFullYear(), base.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i)
    const k = iso(d)
    return {
      key: k,
      label: String(d.getDate()),
      inMonth: d.getMonth() === first.getMonth(),
      selected: k === selected,
      today: k === iso(TODAY),
    }
  })

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 36,
        left: 0,
        zIndex: 30,
        boxSizing: 'border-box',
        width: 252,
        padding: 'var(--size-120)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-callout)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-80)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <MonthStep title="Previous month" onClick={() => s.setDpMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1))}>
          <Icon name="ChevronLeft" size={16} />
        </MonthStep>
        <span style={{ flex: 1, textAlign: 'center', ...body1Strong }}>
          {first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <MonthStep title="Next month" onClick={() => s.setDpMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1))}>
          <Icon name="ChevronRight" size={16} />
        </MonthStep>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            style={{
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...caption2Strong,
              color: 'var(--text-helper)',
            }}
          >
            {w}
          </span>
        ))}
        {cells.map((c) => (
          <DayCell key={c.key} cell={c} onPick={() => onPick(c.key)} />
        ))}
      </div>
    </div>
  )
}

function MonthStep({
  children,
  title,
  onClick,
}: {
  children?: React.ReactNode
  title: string
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

function DayCell({
  cell,
  onPick,
}: {
  cell: { label: string; inMonth: boolean; selected: boolean; today: boolean }
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: cell.selected
          ? 'var(--primary)'
          : hover
            ? 'var(--surface-subtle)'
            : 'transparent',
        border: `1px solid ${!cell.selected && cell.today ? 'var(--primary)' : 'transparent'}`,
        ...caption1,
        fontWeight: cell.selected || cell.today ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: cell.selected
          ? 'var(--text-inverse)'
          : cell.inMonth
            ? 'var(--text-primary)'
            : 'var(--text-disabled)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {cell.label}
    </span>
  )
}
