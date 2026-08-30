import type { CSSProperties } from 'react'

// A dense multi-column table cannot fold, so it scrolls inside its own card.
// The page itself must never scroll horizontally.
export const tableScroll: CSSProperties = { overflowX: 'auto', overflowY: 'hidden' }
export const tableMin: CSSProperties = { minWidth: 660 }
