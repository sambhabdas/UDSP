import { useState } from 'react'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import { DA_COUNT, DA_LABEL, DA_POST, LADDER } from './data'

// The chips sit on a light plate against dark text, so the ring is the neutral
// one rather than the primary ring the rest of the product uses.
const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'

// Selecting a post highlights its column across every band and dims the rest.
// It changes no right — the matrix is read-only either way — it just holds one
// column still while you read down it.
function Chip({
  label,
  count,
  on,
  dashed,
  onPick,
}: {
  label: string
  count: string
  on: boolean
  dashed?: boolean
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  const [focus, setFocus] = useState(false)

  const tone = dashed
    ? {
        bg: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: on ? 'var(--blue-200)' : 'var(--border-strong)',
        fg: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        countFg: 'var(--text-helper)',
        text: caption1,
      }
    : {
        bg: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: on ? 'var(--blue-200)' : 'var(--border-default)',
        fg: on ? 'var(--blue-700)' : 'var(--text-primary)',
        countFg: on ? 'var(--blue-700)' : 'var(--text-helper)',
        text: caption1Strong,
      }

  return (
    <span
      role="button"
      aria-pressed={on}
      tabIndex={0}
      onClick={onPick}
      // Clicking must not leave a focus ring behind — only keyboard should.
      onMouseDown={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick()
        }
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? tone.bg : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px ${dashed ? 'dashed' : 'solid'} ${tone.border}`,
        ...tone.text,
        color: tone.fg,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
      <span style={{ ...caption1, color: tone.countFg }}>{count}</span>
    </span>
  )
}

export function Ladder({
  selPost,
  onPick,
}: {
  selPost: string | null
  onPick: (post: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
      {LADDER.map((l) => (
        <Chip
          key={l.label}
          label={l.label}
          count={l.count}
          on={selPost === l.label}
          onPick={() => onPick(l.label)}
        />
      ))}
      {/* Set apart because a DA is not a portal user — the count is roster
          records, not accounts. */}
      <Chip
        dashed
        label={DA_LABEL}
        count={DA_COUNT}
        on={selPost === DA_POST}
        onPick={() => onPick(DA_POST)}
      />
    </div>
  )
}
