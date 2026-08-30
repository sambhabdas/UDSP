'use client'

import { Icon } from '../../ds/icons/Icon'
import { body1, caption1, caption1Strong, caption2, subtitle2 } from '../../ds/type'
import { addDays, addMonths, days, fmtD, fromIso, money, cents } from './calc'
import { ZOOM_STEPS } from './data'
import type { RateWindow, ServiceType } from './data'
import { TinySquare } from './parts'
import { CARD } from './ui'
import type { RateCardsState } from './useRateCards'

/** One drawn stretch of the axis: a rate window, or the gap before a type
 *  existed at all. */
interface Band {
  left: string
  width: string
  bg: string
  border: string
  borderStyle: 'solid' | 'dashed'
  fg: string
  weight: string
  label: string
  title: string
  cursor: string
  onClick?: () => void
}

export function RateTimeline({ s }: { s: RateCardsState }) {
  const axisA = s.tlAnchor
  const axisB = addDays(addMonths(s.tlAnchor, s.tlMonths), -1)
  const span = days(axisA, axisB) + 1
  const pct = (d: Date) => Math.max(0, Math.min(100, (days(axisA, d) / span) * 100))

  const tickStep = Math.ceil(s.tlMonths / 8)
  const ticks: { label: string; left: string }[] = []
  for (let m = 0; m < s.tlMonths; m += tickStep) {
    const d = addMonths(s.tlAnchor, m)
    ticks.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      left: `${pct(d)}%`,
    })
  }

  const bandsFor = (
    windows: RateWindow[],
    opts: { dsp: boolean; fmt: (n: number) => string; onOpen?: (from: string) => void },
  ): Band[] =>
    windows.flatMap((w) => {
      const a = fromIso(w.from)
      const b = w.to ? fromIso(w.to) : axisB
      if (b < axisA || a > axisB) return []
      const left = pct(a)
      const right = pct(addDays(b, 1))
      const open = !w.to
      const bounded = !!w.bounded
      const off = w.paid === false
      // Under ~6% of the axis there is no room for the figure, so the band
      // carries its colour alone and the title carries the detail.
      const wide = right - left > 6
      const dsp = opts.dsp
      return [
        {
          left: `${left}%`,
          width: `${Math.max(0.4, right - left)}%`,
          bg: dsp || off
            ? 'var(--surface-subtle)'
            : bounded
              ? 'var(--warning-accent)'
              : open
                ? 'var(--primary-soft)'
                : 'var(--surface-subtle)',
          border: dsp || off
            ? 'var(--border-default)'
            : bounded
              ? 'var(--warning-accent)'
              : open
                ? 'var(--primary)'
                : 'var(--border-default)',
          borderStyle: 'solid' as const,
          fg: dsp || off ? 'var(--text-helper)' : open ? 'var(--info-fg)' : 'var(--text-secondary)',
          weight: open && !off ? 'var(--weight-semibold)' : 'var(--weight-regular)',
          label: dsp
            ? '$0.00 · DSP-paid'
            : off
              ? wide ? 'Not paid per package' : ''
              : wide ? opts.fmt(w.rate) + (open ? ' →' : '') : '',
          cursor: dsp ? 'default' : 'pointer',
          title:
            (dsp ? 'Locked at $0.00' : off ? 'Not paid' : opts.fmt(w.rate)) +
            ' · ' +
            fmtD(a) +
            ' – ' +
            (w.to ? fmtD(b) : 'no end') +
            ' · set by ' +
            w.by +
            ' on ' +
            w.at,
          onClick: dsp ? undefined : () => opts.onOpen?.(w.from),
        },
      ]
    })

  const rows = s.types.map((t: ServiceType) => {
    const dsp = t.paidBy === 'DSP'
    const created = fromIso(t.created)
    const bands: Band[] = []
    // Before a type existed it ran nothing — said outright rather than left as
    // empty track that could read as "no rate set".
    if (days(axisA, created) > 0) {
      bands.push({
        left: '0%',
        width: `${pct(created)}%`,
        bg: 'var(--surface-card)',
        border: 'var(--border-default)',
        borderStyle: 'dashed',
        fg: 'var(--text-helper)',
        weight: 'var(--weight-regular)',
        label: 'Not a service type yet',
        title: `${t.name} ${t.hours} hr did not exist before ${fmtD(created, true)}`,
        cursor: 'default',
      })
    }
    bands.push(
      ...bandsFor(t.windows, {
        dsp,
        fmt: money,
        onOpen: (from) => s.openEditor(t.id, from),
      }),
    )
    return {
      key: t.id,
      name: t.name,
      hours: `${t.hours} hr`,
      dsp,
      bands,
    }
  })

  rows.push({
    key: 'packages',
    name: 'Packages',
    hours: 'Per pkg',
    dsp: false,
    bands: bandsFor(s.pkgWindows, {
      dsp: false,
      fmt: cents,
      onOpen: (from) => s.openEditor(null, from, 'package'),
    }),
  })

  const wA = Math.max(0, pct(s.rangeStart))
  const wB = Math.min(100, pct(addDays(s.rangeEnd, 1)))

  return (
    <div style={{ ...CARD, marginTop: 'var(--size-360)', padding: 'var(--size-160)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) 0',
          marginBottom: 'var(--size-80)',
        }}
      >
        <span style={subtitle2}>Rate timeline</span>
        <div style={{ flex: 1 }} />
        <TinySquare title="Earlier" onClick={s.tlPrev}>
          <Icon name="ChevronLeft" size={16} />
        </TinySquare>
        <TinySquare title="Later" onClick={s.tlNext}>
          <Icon name="ChevronRight" size={16} />
        </TinySquare>
        <span
          style={{
            width: 1,
            height: 16,
            flexShrink: 0,
            background: 'var(--border-default)',
            margin: '0 var(--size-60)',
          }}
        />
        <TinySquare
          title="Show more months"
          onClick={s.zoomOut}
          color={s.zoomIndex < ZOOM_STEPS.length - 1 ? 'var(--text-primary)' : 'var(--text-disabled)'}
          cursor={s.zoomIndex < ZOOM_STEPS.length - 1 ? 'pointer' : 'default'}
        >
          -
        </TinySquare>
        <span
          style={{
            ...caption1,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            minWidth: 64,
            textAlign: 'center',
          }}
        >
          {s.tlMonths} Months
        </span>
        <TinySquare
          title="Show fewer months"
          onClick={s.zoomIn}
          color={s.zoomIndex > 0 ? 'var(--text-primary)' : 'var(--text-disabled)'}
          cursor={s.zoomIndex > 0 ? 'pointer' : 'default'}
        >
          +
        </TinySquare>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            marginBottom: 'var(--size-60)',
          }}
        >
          <div style={{ width: 180, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
            {ticks.map((t) => (
              <span
                key={t.label}
                style={{
                  position: 'absolute',
                  top: 4,
                  left: t.left,
                  transform: 'translateX(-50%)',
                  ...caption1Strong,
                  color: 'var(--text-helper)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {rows.map((row) => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', height: 40 }}>
            <div style={{ width: 180, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ...caption1,
                  color: row.dsp ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
              >
                {row.name}
              </span>
              <span
                style={{
                  boxSizing: 'border-box',
                  height: 20,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)',
                  ...caption1Strong,
                  color: row.dsp ? 'var(--text-secondary)' : 'var(--primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.hours}
              </span>
            </div>
            <div style={{ flex: 1, position: 'relative', height: 40 }}>
              {/* The range the tables are priced over, marked on the axis. */}
              <div
                style={{
                  position: 'absolute',
                  left: `${wA}%`,
                  width: `${Math.max(0.6, wB - wA)}%`,
                  top: 0,
                  bottom: 0,
                  background: 'var(--primary-soft)',
                  opacity: 0.6,
                }}
              />
              {row.bands.map((b, i) => (
                <div
                  key={i}
                  onClick={b.onClick}
                  title={b.title}
                  style={{
                    position: 'absolute',
                    top: 6,
                    height: 28,
                    left: b.left,
                    width: b.width,
                    minWidth: 4,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-small)',
                    background: b.bg,
                    border: `1px ${b.borderStyle} ${b.border}`,
                    ...body1,
                    fontWeight: b.weight,
                    color: b.fg,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    cursor: b.cursor,
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', height: 18 }}>
          <div style={{ width: 180, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: `${(wA + wB) / 2}%`,
                transform: 'translateX(-50%)',
                ...caption2,
                color: 'var(--primary)',
                whiteSpace: 'nowrap',
              }}
            >
              this week
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-200)',
          flexWrap: 'wrap',
          marginTop: 'var(--size-120)',
          paddingTop: 'var(--size-120)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <Key bg="var(--primary-soft)" border="var(--primary)">In force now</Key>
        <Key bg="var(--surface-subtle)" border="var(--border-default)">Closed by a later change</Key>
        <Key bg="var(--warning-accent)" border="var(--warning-accent)">Ended on a date you set</Key>
      </div>
    </div>
  )
}

function Key({ bg, border, children }: { bg: string; border: string; children?: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        ...body1,
        color: 'var(--text-secondary)',
      }}
    >
      <span
        style={{ width: 16, height: 12, borderRadius: 2, background: bg, border: `1px solid ${border}`, flexShrink: 0 }}
      />
      {children}
    </span>
  )
}
