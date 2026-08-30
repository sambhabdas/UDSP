import { useSyncExternalStore } from 'react'

// The console targets x-large and up, but the Inbox still has to fold: three
// columns ≥1180, compact three 920–1179, two columns + a Details drawer below.
//
// There is no window on the server, so the first render has to agree with what
// the server rendered or React tears the tree down. `useSyncExternalStore` is
// the honest way to say that: the server snapshot is a documented assumption,
// and React swaps to the real width immediately after hydration.
const SSR_WIDTH = 1440

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

export function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => SSR_WIDTH,
  )
}
