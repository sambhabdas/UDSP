import { useMemo, useState } from 'react'

export interface HoverHandlers {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// Hover is a plate, not a colour change, and the .dc.html files express it as
// a `style-hover` attribute. In React it needs real state, so this hook hands
// back the flag plus the two listeners to spread onto the element.
export function useHover(): [boolean, HoverHandlers] {
  const [hover, setHover] = useState(false)
  const handlers = useMemo<HoverHandlers>(
    () => ({ onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) }),
    [],
  )
  return [hover, handlers]
}
