'use client'

import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption2, caption2Strong, subtitle1, subtitle2 } from '../../ds/type'
import { KEY_DEFS, LINES, TEAM, fmtNum, initials, mmss } from './data'
import { CallControl, GhostButton, Helper, PadKey } from './parts'
import { FIELD } from './style'
import { ChatPanel, ContactsPanel, HistoryPanel, MessagesPanel, StatusPanel } from './panels'
import { useDialer } from './useDialer'
import type { DialerState, DialerTab } from './useDialer'

/**
 * The Dialer: a floating call widget that rides above whatever page you are on.
 *
 * It is one card with two lives. Out of a call it is a phone - line picker,
 * keypad, history, contacts, messages, status. In a call it becomes the call
 * itself, and the tab strip locks so you cannot wander off mid-conversation.
 *
 * Other pages reach it by dispatching a `udsp-dial` event rather than importing
 * it, which is what lets it sit in the shell and still be driven from anywhere.
 */
export function Dialer() {
  const s = useDialer()

  return (
    <div data-screen-label="Dialer" style={{ fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}>
      <Fab open={s.open} onToggle={s.toggle} />
      {s.open && <Card s={s} />}
    </div>
  )
}

function Fab({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={open ? 'Close the dialer' : 'Open the dialer'}
      onClick={onToggle}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 80,
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-circle)',
        background: hover ? 'var(--primary-hover)' : 'var(--primary)',
        color: 'var(--text-inverse)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-8)',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={open ? 'DlDismiss' : 'DlCall'} size={20} />
    </div>
  )
}

function Card({ s }: { s: DialerState }) {
  const inCall = !!s.call

  return (
    <div
      data-dialog-card=""
      style={{
        position: 'fixed',
        right: 20,
        bottom: 76,
        zIndex: 80,
        boxSizing: 'border-box',
        width: 292,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xlarge)',
        boxShadow: 'var(--elevation-dialog)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 96px)',
        overflow: 'hidden',
        transform: `translate(${s.drag.x}px, ${s.drag.y}px)`,
      }}
    >
      <TitleBar s={s} />
      {inCall ? <InCallBody s={s} /> : <KeypadBody s={s} />}
      <div style={{ flexShrink: 0, height: 1, background: 'var(--border-default)' }} />
      <TabStrip s={s} />
    </div>
  )
}

/** Grab anywhere on the title bar to move the card; the close button does not. */
function TitleBar({ s }: { s: DialerState }) {
  const origin = useRef({ x: 0, y: 0 })

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    origin.current = { x: e.clientX - s.drag.x, y: e.clientY - s.drag.y }
    const move = (ev: MouseEvent) =>
      s.setDrag({ x: ev.clientX - origin.current.x, y: ev.clientY - origin.current.y })
    const up = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      s.persist({ x: ev.clientX - origin.current.x, y: ev.clientY - origin.current.y })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-160) var(--size-160) var(--size-100) var(--size-160)',
        cursor: 'grab',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-small)',
          background: 'var(--primary)',
          color: 'var(--text-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="DlCallSm" size={10} />
      </span>
      <span style={body1Strong}>Dialer</span>
      <div style={{ flex: 1 }} />
      <GhostButton title="Close the dialer" onClick={s.toggle} onMouseDown={(e) => e.stopPropagation()}>
        <Icon name="DlDismiss" size={14} />
      </GhostButton>
    </div>
  )
}

const BODY: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'hidden auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--size-120)',
  padding: '0 var(--size-160) var(--size-160) var(--size-160)',
}

// ---- out of a call -----------------------------------------------------------

function KeypadBody({ s }: { s: DialerState }) {
  const inChat = s.tab === 'messages' && !!s.chatWith
  return (
    <div style={BODY}>
      {/* The line you are calling from is a property of every tab except a
          conversation, which has its own header. */}
      {!inChat && <LinePicker s={s} />}
      {s.lastLog && <LogCard s={s} />}
      {s.tab === 'keypad' && <Keypad s={s} />}
      {s.tab === 'history' && <HistoryPanel s={s} />}
      {s.tab === 'contacts' && <ContactsPanel s={s} />}
      {inChat && <ChatPanel s={s} />}
      {s.tab === 'messages' && !s.chatWith && <MessagesPanel s={s} />}
      {s.tab === 'status' && <StatusPanel s={s} />}
    </div>
  )
}

function LinePicker({ s }: { s: DialerState }) {
  const line = LINES[s.line]
  return (
    <div style={{ position: 'relative' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => s.setLinesOpen(!s.linesOpen)}
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-120)',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-medium)',
          ...caption1,
          cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {line.id} · {line.num}
        </span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="DlChevron" size={12} />
        </span>
      </div>
      {s.linesOpen && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 0,
            right: 0,
            boxSizing: 'border-box',
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {LINES.map((l, i) => (
            <LineItem key={l.id} label={`${l.id} · ${l.num}`} on={i === s.line} onPick={() => { s.setLine(i); s.setLinesOpen(false) }} />
          ))}
        </div>
      )}
    </div>
  )
}

function LineItem({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-50)' : 'transparent',
        ...caption1,
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

/** What the last call left behind: where it was written, and how to correct it. */
function LogCard({ s }: { s: DialerState }) {
  const log = s.lastLog!
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-80) var(--size-100)',
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-60)',
      }}
    >
      <span style={{ ...caption2, color: 'var(--text-secondary)' }}>
        Call logged · {log.name} · {log.dur}
        {log.hasNote ? ' · with note' : ''} · to the Inbox timeline
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        {(['answered', 'voicemail'] as const).map((o) => {
          const on = log.outcome === o
          return (
            <span
              key={o}
              role="button"
              tabIndex={0}
              onClick={() => s.setLastLog({ ...log, outcome: o })}
              style={{
                boxSizing: 'border-box',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-small)',
                background: on ? 'var(--blue-100)' : 'var(--surface-card)',
                border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
                ...caption2,
                color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {o}
            </span>
          )
        })}
        <div style={{ flex: 1 }} />
        <span
          role="button"
          tabIndex={0}
          onClick={() => s.setLastLog(null)}
          style={{ ...caption2, color: 'var(--text-helper)', cursor: 'pointer' }}
        >
          Dismiss
        </span>
      </div>
    </div>
  )
}

function Keypad({ s }: { s: DialerState }) {
  const valid = s.digits.length === 10
  const line = LINES[s.line]

  return (
    <>
      {s.context && (
        <span style={{ ...caption1, color: 'var(--text-helper)', textAlign: 'center' }}>
          {s.context.name}
          {s.context.local ? ` · ${s.context.local}` : ''}
        </span>
      )}

      <div style={{ ...FIELD, height: 44, gap: 'var(--size-80)', padding: '0 var(--size-120)' }}>
        <span style={{ ...body1, color: 'var(--text-helper)', flexShrink: 0 }}>+1</span>
        <input
          value={fmtNum(s.digits)}
          onChange={(e) => s.typeNumber(e.target.value)}
          onPaste={(e) => {
            e.preventDefault()
            s.typeNumber(e.clipboardData.getData('text'))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) {
              e.currentTarget.blur()
              s.startCall()
            }
          }}
          inputMode="tel"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            ...subtitle2,
            letterSpacing: '.5px',
            color: 'var(--text-primary)',
            padding: 0,
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        {s.digits.length > 0 && (
          <GhostButton title="Delete the last digit" onClick={s.backspace}>
            <Icon name="DlBackspace" size={16} />
          </GhostButton>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-80)' }}>
        {KEY_DEFS.map(([digit, sub]) => (
          <PadKey key={digit} digit={digit} sub={sub} height={46} onPress={() => s.press(digit)} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--size-60) 0 var(--size-20) 0' }}>
        <div
          role="button"
          tabIndex={0}
          title={valid ? `Call ${fmtNum(s.digits)} from ${line.id}` : 'Enter a 10-digit number'}
          onClick={s.startCall}
          style={{
            boxSizing: 'border-box',
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-circle)',
            background: valid ? 'var(--green-600)' : 'var(--surface-subtle)',
            color: valid ? 'var(--text-inverse)' : 'var(--text-disabled)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: valid ? 'pointer' : 'default',
            transition: 'background var(--motion-hover)',
          }}
        >
          <Icon name="DlCall" size={20} />
        </div>
      </div>
    </>
  )
}

// ---- in a call ---------------------------------------------------------------

function InCallBody({ s }: { s: DialerState }) {
  const call = s.call!
  const live = call.phase === 'connected' && !s.hold
  const line = LINES[s.line]
  const noteDirty = s.note.trim() !== '' && s.note !== s.savedNote

  return (
    <div style={BODY}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-40)',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-pill)',
            background: live ? 'var(--success-bg)' : 'var(--surface-subtle)',
            border: `1px solid ${live ? 'var(--success-border)' : 'var(--border-default)'}`,
            ...caption2Strong,
            color: live ? 'var(--success-fg)' : 'var(--text-secondary)',
          }}
        >
          {call.phase === 'dialing' ? 'Calling…' : s.hold ? '● On hold' : '● Connected'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-60)', padding: 'var(--size-40) 0' }}>
        <span
          style={{
            boxSizing: 'border-box',
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-circle)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--caption-1-size)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-secondary)',
          }}
        >
          {initials(call.name)}
        </span>
        <span style={body1Strong}>{call.name}</span>
        <Helper>+1 {fmtNum(call.num)} · via {line.id}</Helper>
        {call.route && (
          <span
            style={{
              boxSizing: 'border-box',
              height: 18,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              ...caption2Strong,
              color: 'var(--success-fg)',
              whiteSpace: 'nowrap',
            }}
          >
            {call.route}
          </span>
        )}
        {/* A figure space holds the row's height while the call is still ringing. */}
        <span style={{ ...subtitle1, fontVariantNumeric: 'tabular-nums' }}>
          {call.phase === 'connected' ? mmss(s.seconds) : ' '}
        </span>
      </div>

      {s.transferTo && (
        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-60) var(--size-80)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-small)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-60)',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, ...caption2, color: 'var(--text-secondary)' }}>
            Transferring to {s.transferTo}… caller on hold
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={s.cancelTransfer}
            style={{ ...caption2, color: 'var(--text-link)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Cancel transfer
          </span>
        </div>
      )}

      {s.notice && (
        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-60) var(--size-80)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-small)',
            ...caption2,
            color: 'var(--warning-fg)',
          }}
        >
          {s.notice}
        </div>
      )}

      {s.dtmf && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-60)', justifyItems: 'center' }}>
            {KEY_DEFS.map(([digit]) => (
              <PadKey key={digit} digit={digit} height={38} onPress={() => s.press(digit)} />
            ))}
          </div>
          <Helper center>{s.dtmfSent ? `Sent: ${s.dtmfSent}` : 'Tones go to the callee’s menu'}</Helper>
        </>
      )}

      {s.transferPick && <TransferPicker s={s} />}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--size-120)' }}>
        <CallControl label="Mute" icon="DlMicOff" on={s.mute} onPress={() => s.setMute(!s.mute)} />
        <CallControl label={s.hold ? 'On hold' : 'Hold'} icon="DlPause" on={s.hold} onPress={() => s.setHold(!s.hold)} />
        <CallControl label="Keypad" icon="DlDialpad" on={s.dtmf} onPress={() => { s.setDtmf(!s.dtmf); s.setTransferPick(false) }} />
        <CallControl label="Transfer" icon="DlSwap" on={s.transferPick} onPress={() => { s.setTransferPick(!s.transferPick); s.setDtmf(false) }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-60)',
            padding: 'var(--size-40) var(--size-40) var(--size-40) var(--size-80)',
            // Dashed, because the note is not saved until you say so.
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)',
          }}
        >
          <input
            placeholder="Add call note…"
            value={s.note}
            onChange={(e) => s.setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && s.note.trim()) s.setSavedNote(s.note) }}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...caption1,
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
          {noteDirty && <SaveNote onSave={() => s.setSavedNote(s.note)} />}
        </div>
        {s.savedNote && s.note === s.savedNote && (
          <span style={{ ...caption2, color: 'var(--success-fg)' }}>
            Note saved to this call. Edits are stamped who · when.
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 'var(--size-40)' }}>
        <EndCall onEnd={s.endCall} />
      </div>
    </div>
  )
}

function SaveNote({ onSave }: { onSave: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onSave}
      style={{
        boxSizing: 'border-box',
        height: 22,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--primary-hover)' : 'var(--primary)',
        color: 'var(--text-inverse)',
        ...caption2Strong,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Save
    </span>
  )
}

function EndCall({ onEnd }: { onEnd: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEnd}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-200)',
        borderRadius: 'var(--radius-pill)',
        background: hover ? 'var(--danger-fg)' : 'var(--red-500)',
        color: 'var(--text-inverse)',
        ...caption1,
        fontWeight: 'var(--weight-semibold)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}>
        <Icon name="DlCallEnd" size={16} />
      </span>
      End call
    </div>
  )
}

/** Hand the caller to a teammate or to a line's ring group. */
function TransferPicker({ s }: { s: DialerState }) {
  const targets = [
    ...TEAM.map((t) => ({
      name: t.name,
      kind: 'user',
      back: `${t.name.split(' ')[0]} didn’t pick up. You’re back with the caller.`,
    })),
    ...LINES.map((l) => ({
      name: `${l.id} ring group`,
      kind: 'line',
      back: 'Nobody picked up. You’re back with the caller.',
    })),
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        overflow: 'hidden',
      }}
    >
      {targets.map((t) => (
        <TransferTarget key={t.name} name={t.name} kind={t.kind} onPick={() => s.transferTo_(t.name, t.back)} />
      ))}
    </div>
  )
}

function TransferTarget({ name, kind, onPick }: { name: string; kind: string; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        height: 32,
        padding: '0 var(--size-100)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </span>
      <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{kind}</span>
    </div>
  )
}

// ---- the tab strip -----------------------------------------------------------

interface TabDef {
  id: DialerTab
  label: string
  icon: string | null
  iconF?: string
  title: string
}

function TabStrip({ s }: { s: DialerState }) {
  const inCall = !!s.call

  const tabs: TabDef[] = [
    { id: 'history', label: 'History', icon: 'DlHistory', iconF: 'DlHistoryF', title: 'Last 50 calls' },
    { id: 'contacts', label: 'Contacts', icon: 'DlPerson', iconF: 'DlPersonF', title: 'Team, DAs and saved contacts' },
    { id: 'keypad', label: inCall ? 'In call' : 'Keypad', icon: 'DlDialpad', iconF: 'DlDialpadF', title: 'Dial pad' },
    { id: 'messages', label: 'Messages', icon: 'DlChat', iconF: 'DlChatF', title: 'Recent messages' },
    {
      id: 'status',
      // In a call you are busy whatever your status says, so the tab says so.
      label: inCall ? 'Busy · in call' : s.status === 'available' ? 'Available' : 'Busy',
      icon: null,
      title: 'Inbound ringing status',
    },
  ]

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        padding: 'var(--size-100) var(--size-80) var(--size-120) var(--size-80)',
      }}
    >
      {tabs.map((t) => {
        // A call takes the strip out of service - no tab reads as active, and
        // nothing responds, until it ends.
        const active = s.tab === t.id && !inCall
        return (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            title={t.title}
            onClick={() => {
              if (inCall) return
              s.setTab(t.id)
              s.setLinesOpen(false)
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--size-40)',
              cursor: inCall ? 'default' : 'pointer',
              minWidth: 48,
              paddingTop: 'var(--size-40)',
            }}
          >
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: -9,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 28,
                  height: 2,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--primary)',
                }}
              />
            )}
            <span style={{ display: 'flex', color: active ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {t.icon === null ? (
                <StatusDot inCall={inCall} available={s.status === 'available'} />
              ) : (
                <Icon name={active && t.iconF ? t.iconF : t.icon} size={16} />
              )}
            </span>
            <span
              style={{
                ...caption2,
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: active ? 'var(--primary)' : 'var(--text-helper)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** The status tab draws a traffic light instead of a glyph. */
function StatusDot({ inCall, available }: { inCall: boolean; available: boolean }) {
  const color = inCall ? 'var(--neutral-400)' : available ? 'var(--success-accent)' : 'var(--danger-accent)'
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
    </span>
  )
}
