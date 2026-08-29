import { useState } from 'react'
import { caption1, caption2Strong } from '../../ds/type.js'

// Non-component exports live here so parts.jsx stays fast-refresh clean.

export const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'

export const EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

// Monospace for machine strings — field names. The design file sets 11px;
// Caption 1's metrics keep them on the type ramp.
export const MONO = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  ...caption1,
}

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
