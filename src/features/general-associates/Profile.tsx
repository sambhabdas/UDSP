'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { Avatar, IconButton, Link, Pill, SmallButton } from './parts'
import { CARD } from './style'
import { TONES, initialsOf, signed, tierOf } from './calc'
import type { Tone } from './calc'
import { dial } from '../dialer/dial'
import type { GaState, Tab } from './useGeneralAssociates'

const TABS: [Tab, string][] = [
  ['overview', 'Overview'],
  ['schedule', 'Schedule'],
  ['performance', 'Performance'],
  ['dispatch', 'Dispatch'],
  ['timecard', 'Timecard'],
  ['docs', 'Documents'],
]

/**
 * The profile header - who they are, what you can do to them, and the strip of
 * standing facts that gates everything else.
 *
 * The strip is the summary of record: clear-to-work or blocked, the tier and
 * its net, any exclusion, and the route they are on. Each pill jumps to the tab
 * that can act on it.
 */
export function ProfileHeader({ s }: { s: GaState }) {
  const cur = s.cur
  const tier = tierOf(cur.net)
  const udaTone: Tone =
    cur.uda === 'active'
      ? TONES.ok
      : { bg: 'var(--surface-subtle)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }

  const strip: { tone: Tone; dot?: string; label: string; tab: Tab; title?: string }[] = [
    cur.blocked
      ? { tone: TONES.danger, label: 'Blocked', tab: 'performance', title: 'An overdue blocking assignment gates the shift' }
      : { tone: TONES.ok, label: 'Clear To Work', tab: 'performance' },
    {
      tone: { bg: 'var(--surface-subtle)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: tier.dot },
      label: `${tier.label} · net ${signed(cur.net)}`,
      tab: 'performance',
      title: 'All-time net of non-voided Events',
    },
  ]
  if (cur.excluded) {
    strip.push({
      tone: TONES.mut,
      label: `Excluded · ${cur.excluded.reason} · until ${cur.excluded.until}`,
      tab: 'schedule',
    })
  }
  if (cur.onRoute) {
    strip.push({
      tone: TONES.ok,
      label: `On Route · ${cur.onRoute}`,
      tab: 'dispatch',
      title: 'As fresh as the last itineraries import',
    })
  }

  return (
    <div style={CARD}>
      {cur.status === 'inactive' && (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-60) var(--size-160)',
            background: 'var(--danger-bg)',
            borderBottom: '1px solid var(--danger-border)',
          }}
        >
          <span style={{ ...caption1Strong, color: 'var(--danger-fg)' }}>Inactive - since {cur.inactiveSince}</span>
        </div>
      )}

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          padding: 'var(--size-160)',
          flexWrap: 'wrap',
        }}
      >
        <Avatar initials={initialsOf(cur.name)} size={56} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <span style={subtitle1}>{cur.name}</span>
            {cur.quals.map((q) => (
              <Pill key={q} height={20} radius="var(--radius-medium)">
                {q}
              </Pill>
            ))}
            <Pill title="Ultimate DA account" tone={udaTone} height={20}>
              Ultimate DA · {cur.uda}
            </Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
            <Copyable text={cur.tr} onClick={() => s.toastMsg(`${cur.tr} copied`)} />
            <Copyable
              text={cur.ee ? `EE ${cur.ee}` : 'No payroll ID'}
              color={cur.ee ? 'var(--text-secondary)' : 'var(--warning-fg)'}
              onClick={() =>
                s.toastMsg(cur.ee ? `EE ${cur.ee} copied` : 'No payroll ID on the record - add it in Edit Associate')
              }
            />
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{cur.phone}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{cur.email || 'No email'}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              Started {cur.started} · {cur.tenure} mo
            </span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Delivery Associate</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <SmallButton onClick={() => s.toastMsg(`Opens the Inbox with ${cur.name} selected`)}>Message</SmallButton>
          <IconButton
            name="DlCallSm"
            title="Call"
            color="var(--success-fg)"
            onClick={() => dial(cur.name, cur.phone)}
          />
          <SmallButton onClick={() => s.toastMsg(`Opens the Events manual panel prefilled with ${cur.name}`)}>
            + Log Event
          </SmallButton>
          <SmallButton onClick={() => s.editDa(cur)}>Edit Associate</SmallButton>
          <SmallButton primary onClick={s.openCoach}>
            Assign Coaching
          </SmallButton>
          <IconButton pop name="FnMore" title="More actions" onClick={(e) => s.openMenu(e, 'hdrMore', null, 260)} />
        </div>
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-160) var(--size-120) var(--size-160)',
          flexWrap: 'wrap',
        }}
      >
        {strip.map((p) => (
          <span
            key={p.label}
            role="button"
            tabIndex={0}
            title={p.title}
            onClick={() => s.setTab(p.tab)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--size-40)',
              height: 24,
              padding: '0 var(--size-100)',
              borderRadius: 'var(--radius-pill)',
              background: p.tone.bg,
              border: `1px solid ${p.tone.border}`,
              color: p.tone.fg,
              ...caption1Strong,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: p.tone.dot, flexShrink: 0 }} />
            {p.label}
          </span>
        ))}
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-40)',
          padding: '0 var(--size-160)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {TABS.map(([id, label]) => {
          const active = s.tab === id
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => {
                s.setTab(id)
                s.closeMenu()
              }}
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--size-120)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  ...body1,
                  fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 'var(--size-120)',
                    right: 'var(--size-120)',
                    bottom: 0,
                    height: 2,
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--primary)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The two IDs are monospaced and copy on click, which the hover colour says. */
function Copyable({ text, color = 'var(--text-secondary)', onClick }: { text: string; color?: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title="Copy"
      onClick={onClick}
      style={{
        fontFamily: 'Consolas, ui-monospace, monospace',
        ...caption1,
        color: hover ? 'var(--primary)' : color,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {text}
    </span>
  )
}

/** The link back to the roster. The profile is a view, not a route. */
export function BackLink({ s }: { s: GaState }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
      <Link onClick={s.goBack}>← All Associates</Link>
    </div>
  )
}
