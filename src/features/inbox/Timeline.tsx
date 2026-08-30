import type { CSSProperties } from 'react'
import type { Activity } from './data'
import { Icon } from '../../ds/icons/Icon'
import { body1, caption1, caption1Strong, caption2 } from '../../ds/type'

const bubble: CSSProperties = {
  boxSizing: 'border-box',
  padding: 'var(--size-80) var(--size-120)',
  borderRadius: 'var(--radius-medium)',
  ...body1,
  textWrap: 'pretty',
}

const stamp: CSSProperties = { ...caption2, color: 'var(--text-helper)' }

function DateDivider({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', ...stamp }}>— {text} —</div>
}

function SystemEvent({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-40)',
        ...stamp,
      }}
    >
      <Icon name="IbSystem" size={12} color="var(--text-helper)" />
      {text}
    </div>
  )
}

function InboundText({ text, time }: { text: string; time?: string }) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '62%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-40)',
      }}
    >
      <div
        style={{
          ...bubble,
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-default)',
        }}
      >
        {text}
      </div>
      <span style={stamp}>{time}</span>
    </div>
  )
}

function OutboundText({ text, time }: { text: string; time?: string }) {
  return (
    <div
      style={{
        alignSelf: 'flex-end',
        maxWidth: '62%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-40)',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          ...bubble,
          background: 'var(--primary-soft)',
          border: '1px solid var(--blue-200)',
        }}
      >
        {text}
      </div>
      {/* Delivery receipts only — no UDSP surface records a driver read anything. */}
      <span style={stamp}>{time} ✓✓</span>
    </div>
  )
}

function CallEntry({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-circle)',
            background: 'var(--green-100)',
            border: '1px solid var(--green-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="IbCall" size={12} color="var(--green-700)" />
        </span>
        <span style={{ ...caption1, color: 'var(--text-primary)' }}>{text}</span>
      </div>
      {/* The one dashed border in the system means "nothing here yet". */}
      <span
        style={{
          boxSizing: 'border-box',
          marginLeft: 32,
          maxWidth: 280,
          padding: 'var(--size-40) var(--size-80)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-small)',
          ...caption1,
          color: 'var(--text-helper)',
          cursor: 'text',
        }}
      >
        Add call note…
      </span>
    </div>
  )
}

function EmailEntry({ text, sub, dir }: { text: string; sub?: string; dir?: 'in' | 'out' }) {
  const outbound = dir === 'out'
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '62%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-40)',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-40)',
          padding: 'var(--size-80) var(--size-120)',
          background: outbound ? 'var(--primary-soft)' : 'var(--surface-subtle)',
          border: `1px solid ${outbound ? 'var(--blue-200)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <Icon name="IbMail" size={12} color="var(--blue-700)" />
          <span style={{ ...caption1Strong }}>{text}</span>
        </div>
        <span style={{ ...body1, textWrap: 'pretty' }}>{sub}</span>
      </div>
      <span style={{ alignSelf: 'flex-start', ...stamp }}>Email</span>
    </div>
  )
}

function InternalNote({ text }: { text: string }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: 'var(--size-60) var(--size-100)',
        background: 'var(--yellow-100)',
        border: '1px solid var(--yellow-200)',
        borderRadius: 'var(--radius-small)',
      }}
    >
      <Icon name="IbPin" size={12} color="var(--yellow-700)" />
      <span style={{ ...caption1, color: 'var(--yellow-800)' }}>{text}</span>
    </div>
  )
}

// Chronological, newest at the bottom. Every channel merges into one timeline —
// person-centric, not thread-centric.
export function Timeline({ feed }: { feed: Activity[] }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        padding: 'var(--size-160)',
      }}
    >
      {feed.map((m, i) => {
        const key = `${m.k}-${i}`
        if (m.k === 'date') return <DateDivider key={key} text={m.text} />
        if (m.k === 'sys') return <SystemEvent key={key} text={m.text} />
        if (m.k === 'in') return <InboundText key={key} text={m.text} time={m.time} />
        if (m.k === 'out') return <OutboundText key={key} text={m.text} time={m.time} />
        if (m.k === 'call') return <CallEntry key={key} text={m.text} />
        if (m.k === 'email')
          return <EmailEntry key={key} text={m.text} sub={m.sub} dir={m.dir} />
        if (m.k === 'note') return <InternalNote key={key} text={m.text} />
        return null
      })}
      {feed.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...caption1,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          No activity yet — start the conversation
        </div>
      )}
    </div>
  )
}
