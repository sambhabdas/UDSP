import { useState } from 'react'
import { caption2Strong } from '../../ds/type.js'

// Non-component exports live here so parts.jsx stays fast-refresh clean.

export const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'

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
