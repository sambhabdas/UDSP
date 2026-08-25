import { useEffect, useState } from 'react'

// The console targets x-large and up, but the Inbox still has to fold: three
// columns ≥1180, compact three 920–1179, two columns + a Details drawer below.
export function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  )
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}
