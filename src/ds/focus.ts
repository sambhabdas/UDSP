import { useMemo, useState } from 'react'

// A focus ring is a keyboard affordance, and it was written out separately in
// five features before it moved here.
//
// Two rings, both a white gap inside a neutral-900 stroke so they read on the
// card, the subtle plate and the tinted plates alike. The inset variant is for
// controls that sit flush in a row or a scroller, where an outer ring would be
// clipped by the very box it needs to escape.
export const FOCUS_RING = '0 0 0 1px #FFFFFF, 0 0 0 3px var(--neutral-900)'
export const INSET_FOCUS_RING = 'inset 0 0 0 1px #FFFFFF, inset 0 0 0 3px var(--neutral-900)'

export interface FocusHandlers {
  tabIndex: 0
  onMouseDown: (e: { preventDefault: () => void }) => void
  onFocus: () => void
  onBlur: () => void
}

// Clicking must not leave a ring behind - preventDefault on mousedown keeps
// focus off the element, so :focus only ever means keyboard.
export function useFocusRing(): [boolean, FocusHandlers] {
  const [focus, setFocus] = useState(false)
  const handlers = useMemo<FocusHandlers>(
    () => ({
      tabIndex: 0,
      onMouseDown: (e) => e.preventDefault(),
      onFocus: () => setFocus(true),
      onBlur: () => setFocus(false),
    }),
    [],
  )
  return [focus, handlers]
}
