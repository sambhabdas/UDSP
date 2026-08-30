// The design system's glyph tables, merged in the order the .dc.html helmet
// loaded them and resolved the way its `icon-global.js` factory resolved them.

import shell from './shell-icons' // rail + chrome glyphs
import page from './page-icons' // the Pg* page glyphs
import inbox from './inbox-icons' // the Ib* inbox glyphs
import surveys from './surveys-icons' // Sv* — the chevron and ⋮ Payroll Setup borrows
import finance from './finance-icons' // Fn* — edit, upload, info, lock, lock-open
import payroll from './payroll-icons' // Fn* — sort, sort-up/down, check, dismiss, filter
import dispatch from './dispatch-icons' // Fn* glyphs only Dispatch uses
import dialer from './dialer-icons' // Dl* — the Dialer widget, which is on every route
import fig from './icon-data' // the fig_materialize fallback table

export interface Glyph {
  viewBox: string
  body: string
}

// Later tables extend earlier ones under the same PAGE_ICONS name, so the merge
// order is the load order. Shell wins over page, and the fallback table is last.
const GLYPHS: Record<string, Glyph> = {
  ...fig,
  ...page,
  ...inbox,
  ...surveys,
  ...finance,
  ...payroll,
  ...dispatch,
  ...dialer,
  ...shell,
}

// A missing name is not an error: the pages ask for glyphs the table may not
// carry, and `Icon` renders an empty box of the right size rather than a gap.
export function resolveGlyph(name: string): Glyph | null {
  return GLYPHS[name] ?? null
}
