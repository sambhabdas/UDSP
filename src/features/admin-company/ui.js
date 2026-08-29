import { useState } from 'react'
import { caption1Strong, caption2Strong } from '../../ds/type.js'

// Non-component exports live here so parts.jsx stays fast-refresh clean.

export const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'

// This page's section headings are Caption 1; the headings nested inside the
// Branding card step down to Caption 2.
export const SECTION_EYEBROW = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

export const SUB_EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

// Monospace for a machine string. The design file sets 11px; Caption 1's
// metrics keep it on the type ramp.
export const MONO = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: 'var(--caption-1-size)',
  lineHeight: 'var(--caption-1-lh)',
  fontWeight: 'var(--weight-semibold)',
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
