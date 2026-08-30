'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2Strong, subtitle2 } from '../../ds/type'
import { Badge, Button, Field } from './parts'
import { addDays, fmt, fmtMonth, fmtY, same, weekday, weekName } from './date'
import type { Day } from './date'
import { money } from './fmt'
import { num } from './fmt'
import type { IvState } from './useInvoiceValidation'

/**
 * Change a rate.
 *
 * A rate is not one number but a timeline: it takes effect on a chosen day and
 * either runs open-ended from there or applies to that day alone. The three
 * preview cards spell out the day before, the day itself and the day after, so
 * the shape of the change is visible before it is saved.
 */
export function RateEditor({ s }: { s: IvState }) {
  const ed = s.editor
  if (!ed) return null

  const next = parseFloat(ed.rateVal) || 0
  const valid = next > 0
  const canSave = valid && next !== ed.rate

  return (
    <div
      onClick={() => { s.setEditor(null); s.setDpOpen(false) }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        padding: 'var(--size-320) var(--size-160)',
      }}
    >
      <div
        data-dialog-card=""
        data-dialog-loose=""
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 600,
          marginBlock: 'auto',
          flexShrink: 0,
          overflow: 'visible',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-160)',
          padding: 'var(--size-240)',
        }}
      >
        <span style={subtitle2}>Change a rate</span>

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
            <span style={{ flex: 1, minWidth: 0, ...body1Strong }}>{ed.name}</span>
            <Badge bg="var(--info-bg)" border="var(--info-border)" fg="var(--info-fg)" height={20}>
              On {fmtY(ed.from)}
            </Badge>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
          <Field
            label={ed.name === 'Packages' ? 'New rate per package' : ed.name === 'Training' ? 'New rate per training' : 'New rate per route'}
            value={ed.rateVal}
            onChange={(v) => s.patchEditor({ rateVal: v.replace(/[^0-9.]/g, '') })}
            prefix="$"
            width={140}
            align="right"
          />
          <FromPicker s={s} />
        </div>

        <CarrySection s={s} valid={valid} next={next} />

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
              {money(ed.units * ed.rate)}  →  {money(ed.units * next)}
            </span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{weekName(ed.week)} revenue</span>
          </div>
          {next !== ed.rate && (
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              {num(ed.units)} units this week · {money(Math.abs(ed.units * (next - ed.rate)))}
              {next > ed.rate ? ' more' : ' less'}
            </span>
          )}
        </div>

        {!valid && (
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
            }}
          >
            Enter a rate above $0.00.
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ flex: 1 }} />
          <Button onClick={() => { s.setEditor(null); s.setDpOpen(false) }}>Cancel</Button>
          <Button primary disabled={!canSave} onClick={s.saveRate}>Save rate</Button>
        </div>
      </div>
    </div>
  )
}

function FromPicker({ s }: { s: IvState }) {
  const ed = s.editor
  if (!ed) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>From</span>
      <span style={{ position: 'relative', display: 'flex' }}>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); s.setDpOpen(!s.dpOpen) }}
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
            border: `1px solid ${s.dpOpen ? 'var(--border-focus)' : 'var(--border-default)'}`,
            ...body1,
            cursor: 'pointer',
            transition: 'border-color var(--motion-hover)',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtY(ed.from)}</span>
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-secondary)' }}>
            <Icon name="SvChevron" size={16} />
          </span>
        </span>
        {s.dpOpen && <Calendar s={s} />}
      </span>
    </div>
  )
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function Calendar({ s }: { s: IvState }) {
  const ed = s.editor
  if (!ed) return null
  const month = s.dpMonth
  const first: Day = { y: month.y, m: month.m, d: 1 }
  const start = addDays(first, -weekday(first))
  const days = Array.from({ length: 35 }, (_, i) => addDays(start, i))

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
        <MonthStep dir={-1} s={s} />
        <span style={{ flex: 1, textAlign: 'center', ...body1Strong }}>{fmtMonth(month)}</span>
        <MonthStep dir={1} s={s} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {WEEKDAY_LABELS.map((l, i) => (
          <span key={i} style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...caption2Strong, color: 'var(--text-helper)' }}>
            {l}
          </span>
        ))}
        {days.map((d, i) => (
          <CalendarDay key={i} d={d} inMonth={d.m === month.m} selected={same(d, ed.from)} onPick={() => { s.patchEditor({ from: d }); s.setDpOpen(false) }} />
        ))}
      </div>
    </div>
  )
}

function MonthStep({ dir, s }: { dir: 1 | -1; s: IvState }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title={dir === 1 ? 'Next month' : 'Previous month'}
      onClick={(e) => {
        e.stopPropagation()
        const m = s.dpMonth.m + dir
        const y = s.dpMonth.y + (m < 0 ? -1 : m > 11 ? 1 : 0)
        s.setDpMonth({ y, m: (m + 12) % 12, d: 1 })
      }}
      style={{
        boxSizing: 'border-box',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transform: dir === -1 ? 'rotate(180deg)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="SvChevron" size={16} />
    </span>
  )
}

function CalendarDay({ d, inMonth, selected, onPick }: { d: Day; inMonth: boolean; selected: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onPick() }}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: selected ? 'var(--primary)' : hover ? 'var(--surface-subtle)' : 'transparent',
        border: `1px solid ${selected ? 'var(--primary)' : 'transparent'}`,
        ...caption1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: selected ? 'var(--text-inverse)' : inMonth ? 'var(--text-primary)' : 'var(--text-disabled)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {d.d}
    </span>
  )
}

function CarrySection({ s, valid, next }: { s: IvState; valid: boolean; next: number }) {
  const ed = s.editor
  if (!ed) return null
  const shown = valid ? next : ed.rate
  const before = addDays(ed.from, -1)
  const after = addDays(ed.from, 1)

  const cards = [
    { rate: money(ed.rate), day: fmt(before), state: 'Unchanged', tone: 'past' as const },
    { rate: money(shown), day: fmt(ed.from), state: 'From this day', tone: 'from' as const },
    ed.carry
      ? { rate: money(shown), day: `${fmt(after)} →`, state: 'Until changed', tone: 'openend' as const }
      : { rate: money(ed.rate), day: fmt(after), state: `Back to ${money(ed.rate)}`, tone: 'past' as const },
  ]

  const tones = {
    past: { bg: 'var(--surface-card)', border: 'var(--border-default)', borderStyle: 'solid', rateColor: 'var(--text-secondary)', stateColor: 'var(--text-helper)' },
    from: { bg: 'var(--primary-soft)', border: 'var(--primary)', borderStyle: 'solid', rateColor: 'var(--info-fg)', stateColor: 'var(--info-fg)' },
    openend: { bg: 'var(--surface-card)', border: 'var(--primary)', borderStyle: 'dashed', rateColor: 'var(--info-fg)', stateColor: 'var(--info-fg)' },
  }

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        padding: 'var(--size-120) var(--size-160)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
        <span style={{ flex: 1, minWidth: 0, ...body1Strong }}>Carry forward from this day</span>
        <span
          role="switch"
          aria-checked={ed.carry}
          tabIndex={0}
          onClick={() => s.patchEditor({ carry: !ed.carry })}
          style={{
            boxSizing: 'border-box',
            width: 36,
            height: 18,
            flexShrink: 0,
            borderRadius: 9,
            padding: 2,
            background: ed.carry ? 'var(--primary)' : 'var(--neutral-400)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: ed.carry ? 'flex-end' : 'flex-start',
            cursor: 'pointer',
            transition: 'background var(--motion-hover)',
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 'var(--radius-circle)', background: 'var(--white)' }} />
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-80)' }}>
        {cards.map((cd, i) => {
          const t = tones[cd.tone]
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
                background: t.bg,
                border: `1px ${t.borderStyle} ${t.border}`,
              }}
            >
              <span style={{ ...body1Strong, color: t.rateColor, fontVariantNumeric: 'tabular-nums' }}>{cd.rate}</span>
              <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{cd.day}</span>
              <span style={{ ...caption1, color: t.stateColor, textAlign: 'center' }}>{cd.state}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
