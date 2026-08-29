import { useState } from 'react'
import { caption1, caption2Strong } from '../../ds/type.js'

// Non-component exports live here so parts.jsx stays fast-refresh clean.

export const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'
export const INSET_FOCUS_RING = 'inset 0 0 0 1px #FFFFFF, inset 0 0 0 3px var(--neutral-900)'

// A bulk action wears the colour of what it does.
export const TONES = {
  blue: { bg: 'var(--blue-100)', border: 'var(--blue-200)', fg: 'var(--blue-700)', hoverBg: 'var(--blue-200)' },
  danger: { bg: 'var(--danger-bg)', border: 'var(--danger-border)', fg: 'var(--danger-fg)', hoverBg: 'var(--danger-border)' },
  success: { bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)', hoverBg: 'var(--success-border)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)', hoverBg: 'var(--warning-border)' },
}

// Monospace for machine strings — transporter IDs, filenames, column names.
// The design file sets these at 11px; Caption 1's metrics keep them on the type
// ramp and the 12-character ID still clears its column.
export const MONO = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  ...caption1,
}

export const EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

// Clicking must not leave a ring behind — preventDefault on mousedown keeps
// focus off the element, so :focus only ever means keyboard.
export function useFocusRing() {
  const [focus, setFocus] = useState(false)
  return [
    focus,
    {
      tabIndex: 0,
      onMouseDown: (e) => e.preventDefault(),
      onFocus: () => setFocus(true),
      onBlur: () => setFocus(false),
    },
  ]
}
