/* eslint-disable react/refs -- DialerState carries one ref, `chatScroller`,
   which is handed straight to `ref=` and never dereferenced here. The rule
   takes that to mean every `s.*` read in the file is a ref read. */
'use client'

import { Icon } from '../../ds/icons/Icon'
import { caption1, caption1Strong, caption2 } from '../../ds/type'
import { Avatar, GhostButton, Helper, ListRow } from './parts'
import { BARE_INPUT, FIELD } from './style'
import { EVERYONE, HISTORY, LINES, ROSTER, TEAM, THREADS, initials, matchName, tint } from './data'
import type { DialerState } from './useDialer'

const ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

// Direction decides the glyph, its colour, and whether the row reads as a miss.
const DIR_ICON: Record<string, [string, string]> = {
  out: ['DlOut', 'var(--success-fg)'],
  in: ['DlIn', 'var(--blue-700)'],
  missed: ['DlMissed', 'var(--danger-fg)'],
}

export function HistoryPanel({ s }: { s: DialerState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 296, overflow: 'hidden auto' }}>
      {HISTORY.map((h, i) => {
        const missed = h.dir === 'missed'
        const [glyph, glyphColor] = DIR_ICON[h.dir]
        return (
          <ListRow
            key={`${h.num}-${i}`}
            height={48}
            title="Tap to redial"
            onClick={() => s.dialPerson(matchName(h.num), h.num)}
          >
            <span
              style={{
                boxSizing: 'border-box',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-circle)',
                background: missed ? 'var(--danger-bg)' : 'var(--surface-subtle)',
                border: `1px solid ${missed ? 'var(--danger-border)' : 'var(--border-default)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: glyphColor,
                flexShrink: 0,
              }}
            >
              <Icon name={glyph} size={14} />
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...caption1Strong, ...ELLIPSIS, color: missed ? 'var(--danger-fg)' : 'var(--text-primary)' }}>
                {h.name}
              </span>
              <Helper>{h.meta}</Helper>
            </div>
            <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {h.when}
            </span>
          </ListRow>
        )
      })}
    </div>
  )
}

export function ContactsPanel({ s }: { s: DialerState }) {
  const q = s.cQuery.toLowerCase()
  const rows = EVERYONE().filter((p) => !q || p.name.toLowerCase().includes(q) || p.num.includes(q))

  return (
    <>
      <div style={{ ...FIELD, height: 'var(--control-height)', gap: 'var(--size-80)', padding: '0 var(--size-100)' }}>
        <span style={{ display: 'flex', color: 'var(--text-disabled)' }}>
          <Icon name="DlSearch" size={14} />
        </span>
        <input
          placeholder="Search team, DAs, contacts"
          value={s.cQuery}
          onChange={(e) => s.setCQuery(e.target.value)}
          style={BARE_INPUT}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 300, overflow: 'hidden auto' }}>
        {rows.length === 0 ? (
          <ListRow height={56}>
            <Avatar text="–" bg="var(--surface-subtle)" fg="var(--text-disabled)" />
            <span style={{ flex: 1, minWidth: 0, ...caption1Strong, ...ELLIPSIS, color: 'var(--text-helper)' }}>
              No matches
            </span>
          </ListRow>
        ) : (
          rows.map((p) => {
            const [avBg, avFg] = tint(p.name)
            return (
              <ListRow
                key={p.name}
                height={56}
                title="Tap to dial"
                // `active` is only set on roster people, so only they get the
                // local-time note under their name.
                onClick={() => s.dialPerson(p.name, p.num, p.active !== undefined ? localNow() : null)}
              >
                <Avatar text={initials(p.name)} bg={avBg} fg={avFg} dot={!!p.route} />
                <span style={{ flex: 1, minWidth: 0, ...caption1Strong, ...ELLIPSIS }}>{p.name}</span>
                <span style={{ display: 'flex', color: 'var(--text-disabled)', flexShrink: 0 }}>
                  <Icon name="DlCallSm" size={14} />
                </span>
              </ListRow>
            )
          })
        )}
      </div>
    </>
  )
}

const localNow = () => `local ${new Date().toTimeString().slice(0, 5)}`

export function MessagesPanel({ s }: { s: DialerState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 300, overflow: 'hidden auto' }}>
      {THREADS.map((m) => {
        const [avBg, avFg] = tint(m.name)
        return (
          <ListRow key={m.name} height={56} title="Open the conversation" onClick={() => { s.setChatWith(m.name); s.setChatDraft('') }}>
            <Avatar text={initials(m.name)} bg={avBg} fg={avFg} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...caption1Strong, ...ELLIPSIS }}>{m.name}</span>
              <span style={{ ...caption2, ...ELLIPSIS, color: m.unread ? 'var(--text-secondary)' : 'var(--text-helper)' }}>
                {m.snippet}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--size-40)', flexShrink: 0 }}>
              <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{m.when}</span>
              {m.unread && (
                <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-circle)', background: 'var(--primary)' }} />
              )}
            </div>
          </ListRow>
        )
      })}
      <span style={{ padding: 'var(--size-100) var(--size-80)', ...caption2, color: 'var(--text-helper)' }}>
        Replies happen in the Inbox. Tap a thread to open it there.
      </span>
    </div>
  )
}

export function ChatPanel({ s }: { s: DialerState }) {
  const name = s.chatWith ?? ''
  const [avBg, avFg] = tint(name)
  const person = ROSTER.find((p) => p.name === name)
  const onRoute = !!person?.route
  // The subtitle says where they are: the live route, off duty, or what kind of
  // contact they are when they are not on the roster at all.
  const sub = person?.route
    ? person.route.split(' · as of')[0]
    : person
      ? 'Off duty'
      : TEAM.some((t) => t.name === name)
        ? 'Team'
        : 'Contact'
  const canSend = s.chatDraft.trim() !== ''

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <GhostButton title="Back to messages" onClick={() => { s.setChatWith(null); s.setChatDraft('') }}>
          <Icon name="DlBack" size={14} />
        </GhostButton>
        <Avatar text={initials(name)} bg={avBg} fg={avFg} size={28} dot={onRoute} font={9} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...caption1Strong, ...ELLIPSIS }}>{name}</span>
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{sub}</span>
        </div>
        <span
          role="button"
          tabIndex={0}
          title={`Call ${name}`}
          onClick={s.chatCall}
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-small)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success-fg)',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Icon name="DlCallSm" size={14} />
        </span>
      </div>

      <div
        ref={s.chatScroller}
        style={{
          boxSizing: 'border-box',
          flex: 1,
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-80)',
          overflow: 'hidden auto',
          padding: 'var(--size-40) 0',
        }}
      >
        {s.chatMsgs.map((m, i) => (
          <div
            key={`${m.time}-${i}`}
            style={{
              alignSelf: m.isIn ? 'flex-start' : 'flex-end',
              maxWidth: '78%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: m.isIn ? undefined : 'flex-end',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                boxSizing: 'border-box',
                padding: 'var(--size-60) var(--size-100)',
                background: m.isIn ? 'var(--surface-subtle)' : 'var(--primary-soft)',
                border: `1px solid ${m.isIn ? 'var(--border-default)' : 'var(--blue-200)'}`,
                borderRadius: 'var(--radius-medium)',
                ...caption1,
                textWrap: 'pretty',
              }}
            >
              {m.text}
            </div>
            <span style={{ ...caption2, color: 'var(--text-helper)' }}>{m.isIn ? m.time : `${m.time} ✓✓`}</span>
          </div>
        ))}
      </div>

      <div style={{ ...FIELD, gap: 'var(--size-60)', padding: 'var(--size-40) var(--size-40) var(--size-40) var(--size-100)' }}>
        <input
          placeholder={`Message ${name.split(/[\s,]+/)[0]}…`}
          value={s.chatDraft}
          onChange={(e) => s.setChatDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') s.sendChat() }}
          style={BARE_INPUT}
        />
        <span
          role="button"
          tabIndex={0}
          title="Send"
          onClick={s.sendChat}
          style={{
            boxSizing: 'border-box',
            width: 26,
            height: 26,
            borderRadius: 'var(--radius-small)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: canSend ? 'var(--primary)' : 'var(--surface-card)',
            color: canSend ? 'var(--text-inverse)' : 'var(--text-disabled)',
            cursor: canSend ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'background var(--motion-hover)',
          }}
        >
          <Icon name="DlSend" size={14} />
        </span>
      </div>
    </div>
  )
}

/** One half of the availability toggle. Selected reads as a blue segment. */
function StatusSegment({
  label,
  dot,
  on,
  onClick,
}: {
  label: string
  dot: string
  on: boolean
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        flex: 1,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-60)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        fontSize: 'var(--caption-1-size)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dot }} />
      {label}
    </div>
  )
}

export function StatusPanel({ s }: { s: DialerState }) {
  // Two people can answer this line when you are available; one when you are not.
  const reachable = s.status === 'available' ? 2 : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: 'var(--size-40) 0' }}>
      <Helper>Your status controls inbound ringing on your line.</Helper>
      <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
        <StatusSegment label="Available" dot="var(--success-accent)" on={s.status === 'available'} onClick={() => s.setStatus('available')} />
        <StatusSegment label="Busy" dot="var(--danger-accent)" on={s.status === 'busy'} onClick={() => s.setStatus('busy')} />
      </div>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
        {reachable} reachable on {LINES[s.line].id} · 3 available
      </span>
    </div>
  )
}
