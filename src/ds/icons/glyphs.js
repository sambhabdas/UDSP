// The design system's glyph tables, loaded the way the .dc.html helmet loads
// them and resolved in the same order the `icon-global.js` factory used.

import './shell-icons.js' // rail + chrome glyphs (was inline in icon-global.js)
import './page-icons.js' // window.PAGE_ICONS — Pg* page glyphs
import './inbox-icons.js' // extends PAGE_ICONS with the Ib* inbox glyphs
import './surveys-icons.js' // Sv* — the chevron and ⋮ Payroll Setup borrows
import './finance-icons.js' // Fn* — edit, upload, info, lock, lock-open
import './payroll-icons.js' // Fn* — sort, sort-up/down, check, dismiss, filter
import './icon-data.js' // window.FIG_ICONS — the fig_materialize fallback table

export function resolveGlyph(name) {
  return (
    (window.SHELL_ICONS || {})[name] ||
    (window.PAGE_ICONS || {})[name] ||
    (window.FIG_ICONS || {})[name] ||
    null
  )
}
