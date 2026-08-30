'use client'

import { caption1, caption1Strong, caption2Strong, subtitle2 } from '../../ds/type'
import { Field, PrimaryButton } from './parts'
import { BARE_INPUT, CARD } from './ui'
import type { RateCardsState } from './useRateCards'

/** A thread against the rates themselves — why a number moved, in words, next
 *  to the number. */
export function Notes({ s }: { s: RateCardsState }) {
  const ready = s.noteText.trim().length > 0
  return (
    <div style={{ ...CARD, gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span style={subtitle2}>Notes</span>
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            ...caption1Strong,
            color: 'var(--text-secondary)',
          }}
        >
          {s.notes.length}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <Field width="100%">
          <input
            value={s.noteText}
            placeholder="Add a note about the rates…"
            onChange={(e) => s.setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && s.noteText.trim()) s.postNote()
            }}
            style={BARE_INPUT}
          />
        </Field>
        <PrimaryButton enabled={ready} onClick={s.postNote}>
          Post
        </PrimaryButton>
      </div>

      {s.notes.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-100)' }}>
          <span
            style={{
              boxSizing: 'border-box',
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: 'var(--radius-circle)',
              background: 'var(--info-bg)',
              border: '1px solid var(--info-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...caption2Strong,
              color: 'var(--info-fg)',
            }}
          >
            {n.author
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
              <span style={caption1Strong}>{n.author}</span>
              <span style={{ ...caption1, color: 'var(--text-helper)' }}>{n.at}</span>
            </div>
            <span style={{ ...caption1, color: 'var(--text-primary)', textWrap: 'pretty' }}>
              {n.text}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
