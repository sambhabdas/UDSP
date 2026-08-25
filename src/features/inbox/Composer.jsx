import { useRef, useState } from 'react'
import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, body1Strong, caption2 } from '../../ds/type.js'
import { COMPOSER_TABS, EMOJIS, STATION_LINE } from './data.js'

function IconAction({ name, size = 16, title, color = 'var(--text-secondary)', onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        cursor: 'pointer',
        background: hover
          ? color === 'var(--primary)'
            ? 'var(--primary-soft)'
            : 'var(--surface-subtle)'
          : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={size} />
    </span>
  )
}

function CallButton({ onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--green-200)' : 'var(--green-100)',
        border: '1px solid var(--green-200)',
        color: 'var(--green-700)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="IbCall" size={16} />
      Call
    </div>
  )
}

// Fixed at the bottom of the activity window. Typed channels only — Call is a
// button that opens the floating dialer, never a tab.
export function Composer({
  tab,
  onTab,
  firstName,
  draft,
  onDraft,
  subject,
  onSubject,
  canSend,
  onSend,
  onCall,
}) {
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textarea = useRef(null)

  const placeholder =
    tab === 'Text'
      ? `Text ${firstName}…`
      : tab === 'Email'
        ? 'Write the email…'
        : 'Internal note — never visible to the DA'

  // Text: Enter sends, Shift+Enter is a newline. Email and Note commit from the
  // button, so Enter stays a newline there.
  const onKeyDown = (e) => {
    if (tab === 'Text' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const grow = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const appendEmoji = (ch) => {
    onDraft(draft + ch)
    setEmojiOpen(false)
  }

  return (
    <>
      <div style={{ height: 1, background: 'var(--border-default)', flexShrink: 0 }} />
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) var(--size-160) var(--size-120) var(--size-160)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-160)' }}>
          {COMPOSER_TABS.map((t) => (
            <div
              key={t}
              onClick={() => onTab(t)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--size-40)',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  ...(tab === t ? body1Strong : body1),
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {t}
              </span>
              <span
                style={{
                  height: 2,
                  borderRadius: 'var(--radius-small)',
                  background: tab === t ? 'var(--primary)' : 'transparent',
                }}
              />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <CallButton onClick={onCall} />
        </div>

        {tab === 'Email' && (
          <input
            data-field=""
            placeholder="Subject"
            value={subject}
            onChange={(e) => onSubject(e.target.value)}
            style={{
              boxSizing: 'border-box',
              height: 'var(--control-height)',
              padding: '0 var(--size-120)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              outline: 'none',
              ...body1,
              color: 'var(--text-primary)',
            }}
          />
        )}

        <div
          data-field=""
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)',
            padding: 'var(--size-80) var(--size-80) var(--size-40) var(--size-80)',
          }}
        >
          <textarea
            ref={textarea}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => {
              grow(e.target)
              onDraft(e.target.value)
            }}
            onKeyDown={onKeyDown}
            rows={1}
            style={{
              boxSizing: 'border-box',
              width: '100%',
              minHeight: 20,
              maxHeight: 120,
              resize: 'none',
              padding: '0 var(--size-40)',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...body1,
              color: 'var(--text-primary)',
              overflowY: 'auto',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-20)',
              marginTop: 'var(--size-40)',
            }}
          >
            <div style={{ flex: 1 }} />
            <span style={{ position: 'relative', display: 'flex' }}>
              <IconAction
                name="IbEmoji"
                title="Emoji"
                color={emojiOpen ? 'var(--primary)' : 'var(--text-secondary)'}
                onClick={() => setEmojiOpen((v) => !v)}
              />
              {emojiOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 34,
                    right: 0,
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 28px)',
                    gap: 'var(--size-20)',
                    padding: 'var(--size-60)',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-medium)',
                    boxShadow: 'var(--elevation-menu)',
                    zIndex: 10,
                  }}
                >
                  {EMOJIS.map((ch) => (
                    <EmojiCell key={ch} ch={ch} onPick={() => appendEmoji(ch)} />
                  ))}
                </div>
              )}
            </span>
            <IconAction name="IbAttach" title="Attach" />
            <IconAction name="IbTemplates" size={14} title="Templates" />
            <IconAction
              name="PgSend"
              title={tab === 'Note' ? 'Save note' : 'Send'}
              color={canSend ? 'var(--primary)' : 'var(--text-disabled)'}
              onClick={canSend ? onSend : undefined}
            />
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }} />
          {/* One station line per station — the number every UDSP text comes from. */}
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            {STATION_LINE}
          </span>
        </div>
      </div>
    </>
  )
}

function EmojiCell({ ch, onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onPick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        lineHeight: 1,
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {ch}
    </span>
  )
}
