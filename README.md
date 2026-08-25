# Ultimate DSP — console

React + Vite implementation of the Ultimate DSP dispatch console. Two screens
are built so far: the **Inbox** portal and **Payroll Setup**, 1st of 5 on the
Financial Management panel.

```bash
npm install
npm run dev
```

## Sources of truth

Two documents govern this code, and they answer different questions:

| Question | Answer lives in |
| --- | --- |
| What does the shell look like? | `Shell.dc.html` in the Claude Design project (`8ec264f5-…`) |
| What does a page look like? | `Inbox.dc.html`, `PayrollSetup.dc.html`, `ProfitProjection.dc.html`, `Profitability.dc.html` in the same project |
| What does it do? | the matching `.md` under `Project Details/` |
| Where does it sit in the nav? | each page's §3.0 "Shell placement" table |
| What are the tokens and rules? | `Design System/` — `Design System.dc.html` is canonical |

Where the design file and this readme disagree, the design file wins.

## Layout

```
src/
  ds/                      the design system, consumed not re-invented
    styles.css             entry point — imports every token file
    charts/ChartKit.jsx    axes, plot, legend, tooltip, bars, lines, gauge — shared
    charts/chartTokens.js  the card shell and the line-path helper
    tokens/*.css           colors · typography · spacing · radius · elevation · motion
    type.js                the Fluent ramp as style objects (size and leading are paired)
    useHover.js            the .dc.html `style-hover` attribute, as a hook
    useViewportWidth.js    the three Inbox breakpoints
    components/Chip.jsx    filter pill + status pill
    icons/                 glyph tables and the <Icon> component
  shell/
    nav.js                 the rail's 9 entries in 4 groups + each portal's pages
    AppShell.jsx           48px rail · portal flyout · 48px header
    NotBuilt.jsx           honest stub for nav entries with no page yet
  features/inbox/
    InboxPage.jsx          the three columns, the breakpoints, the dialer FAB
    RecentsPanel.jsx       search · All/Unread/Missed · person rows
    ActivityPanel.jsx      person header · channel chips · timeline · composer
    Timeline.jsx           one renderer per activity kind
    Composer.jsx           Text / Email / Note + the Call button
    DecisionRail.jsx       profile · route · performance · tasks
    useInbox.js            all shared state and the queue rules
    data.js                seed, verbatim from the design file's `seed()`
  features/profit-projection/
    ProfitProjectionPage.jsx  sticky toolbar, sections, dialog, toast
    Toolbar.jsx            grain · range stepper · lock · export
    Summary.jsx            projection inputs · the money · what moves it · cost breakdown
    DetailTable.jsx        day-by-day (week) or who-was-paid (day)
    ImportDialog.jsx       the Paycom intake, mapped and split before it lands
    Notes.jsx              a thread against the week or the day
    charts/ChartKit.jsx    axes, plot, legend, tooltip, stacked bar, line
    charts/WeekCharts.jsx  daily P&L · cost per route · per-route · reg vs OT · workforce
    charts/DayCharts.jsx   hours per route
    useProfitProjection.js all state
    calc.js                formatters and the derived maths
    data.js                the week's seven days, people, import fixtures
  features/profitability/
    ProfitabilityPage.jsx  toolbar, summary, the seven trends, history
    Toolbar.jsx            period picker · range · inputs · compare · export
    Summary.jsx            current-period strip · the money · what moves it
    charts/Charts.jsx      the seven trend charts, drag-reorderable
    HistoryTable.jsx       sortable history + the filter panel
    useProfitability.js    all state, including the persisted chart order
    calc.js                derived figures, comparison bases, deltas
    data.js                sixteen pay periods and the projected current one
  features/payroll/
    PayrollSetupPage.jsx   Calendar/Upload tabs, year + pay-period pickers
    CalendarTab.jsx        setup form · the 26-row calendar · lock bar
    UploadTab.jsx          Paycom drop zone · manual entry · figures · post bar
    PayrollDialogs.jsx     lock · unlock · post · revert · discard
    usePayrollSetup.js     all state, plus the generate and pay-date rules
    calendar.js            Amazon-week maths — the only date logic in the app
    data.js                seed, verbatim from the design file's constructor
    table.js               the scroll wrapper dense tables share
```

## Navigation

The rail is taken from **`Shell.dc.html`**, the canonical shell — order, groups,
geometry, icons and states all come from there rather than being invented:

- Nine portals: Dispatch · Inbox · Fleet · General — Scorecard · Scheduling ·
  Surveys — Financial Management — Admin Portal. The shell draws a divider
  before Scorecard, Finance and Admin, giving **4 · 3 · 1 · 1**, which agrees
  with both page specs that pin their own position (Inbox "2nd of 9 · group 1 of
  4"; Financial Management "8th of 9 · group 3 of 4, alone between dividers").
- 48px rail, 40×36 tiles at 2px/4px margins, a 24px brand monogram at Small
  radius, and 1px white-at-14% rules between groups.
- **Selection is a 2px white pill bar at the tile's left edge plus the filled
  glyph — no background plate**, and the active tile takes no hover plate.
  Hover elsewhere is white at 8% with the glyph lifting to pure white.
- Page rows carry their own 16px glyph, and when selected take the neutral
  `--surface-selected` plate, a 2px primary bar, the filled glyph in primary and
  Body 1 Strong.

The **top bar** is the shell's too: a Subtitle 2 wordmark that truncates with an
ellipsis, a search field that swaps to a white plate with a blue border on focus
(the `[data-field]` rule in `app.css`, so no state of its own) and narrows from
240px to 180px below 1024, and a 32px persona tinted by a hash of the name —
`ds/avatar.js`, the same rule the Inbox avatars use.

The shell's wordmark is `brand + portal name`, because its always-open pane-2
panel shows which page you are on. That panel is a popup here, so the page is
appended when it would otherwise be invisible: **PacTrack Financial Management ·
Payroll Setup**, but plain **PacTrack Inbox** where portal and page are one.

A portal with no `pages` is a single-page portal — Inbox and General — and its
rail entry opens the page directly. Every other portal opens its page list as a
**panel floating against the rail**: click the tile to toggle it, click a page to
go there, Escape or a click outside closes it.

The panel is nested inside the content row, below the header and flush with the
rail — the same place `Shell.dc.html` puts it — so the **header spans the full
width in front of it** and opening the panel never covers the wordmark. It fills
that row top to bottom, floats over the page without shifting it, keeps its
heading pinned, and scrolls its rows when a portal has more pages than the
window is tall.

It **slides** in and out, on the motion tokens: entering from off-screen it
decelerates over `--duration-gentle` (250ms, the drawer step) on
`--curve-decelerate-max`; leaving, it accelerates away over `--duration-faster`
on `--curve-accelerate-max` — the system's "enters decelerate, exits accelerate"
rule. Because both read from the tokens, `prefers-reduced-motion: reduce`
collapses them to 1ms for free. The rail sits above the panel so a panel sliding
out disappears *under* it rather than across it.

The panel is mounted from the first render rather than on demand, so opening is a
plain state flip with a from-state already in the DOM. Mounting on demand would
need a frame to pass before flipping, and `requestAnimationFrame` does not fire
in a background or non-compositing tab — the panel would open with no animation,
or appear not to open at all. While shut it is `visibility: hidden`,
`pointer-events: none` and `aria-hidden`, and its Escape and outside-click
listeners are detached.

Only Payroll Setup and Inbox are built. Every other entry is listed because it
is the real navigation, and renders a stub that says so.

> `Shell.dc.html` draws the page list as a permanent pane-2 side panel, as do
> the page specs (Payroll Setup §3.0, "Pane-2 nav item"). It was made a popup by
> request — the one place this code knowingly departs from the design files. The
> list's order, icons and row styling are still the shell's.

### Icons

The design file's helmet loads four scripts and then installs a `window.Icon`
factory. Here the four glyph tables are imported for their side effects by
`ds/icons/glyphs.js`, and `Icon.jsx` re-expresses the factory as a React
component, so nothing polls for a global.

Resolution order is unchanged: `SHELL_ICONS` → `PAGE_ICONS` → `FIG_ICONS`.

- `page-icons.js`, `inbox-icons.js` — verbatim from the design project.
- `shell-icons.js` — the glyph table that was inline inside `icon-global.js`,
  lifted out so the ESM component can read it. Same data, same names.
- `icon-data.js` — the `FIG_ICONS` fallback table, copied from
  `Design System/assets/icons/`. The Inbox uses none of its 96 glyphs, so it is
  ~190 kB of the bundle you can drop from `glyphs.js` if no later page needs it.

### Typography

Segoe UI on the Fluent web ramp — all **16 named styles** live in `ds/type.js`,
cross-checked against Design System §2ty.

A named style is a complete decision: size, line-height *and* weight travel
together. That is why nothing exports a bare weight — composing `subtitle1`
with a regular weight would invent a 17th style the ramp does not have. Spread
one style and nothing else:

```jsx
import { body1Strong, caption1 } from '../../ds/type.js'

<span style={{ ...body1Strong }}>{person.name}</span>   // Body 1 Strong 14/20/600
```

Three weights only: regular 400, semibold 600, bold 700. Bold is reserved for
marks and monograms.

Segoe UI is a Windows font. On Linux, fontconfig substitutes **Selawik** —
Microsoft's own metric-compatible open replacement — so the ramp lays out
identically; on macOS the stack falls through to San Francisco, which carries
it closely enough. A machine with neither falls back to Helvetica/Arial, where
weight 600 becomes a synthesised bold; self-hosting Selawik would close that
gap.

## Inbox behaviour implemented

- **Shared team queue.** A deliberate row click clears unread and missed for
  everyone. First-load auto-selection clears nothing.
- **Person-centric timeline.** Texts, calls, emails, notes and system events
  merge into one feed per person; the channel chips cut it without touching the
  composer.
- **Composer.** Text is the default; Enter sends and Shift+Enter is a newline.
  Email shows a subject field and will not send without it. Note commits with
  `Save note`, appends a 📌 row, and does **not** bump Recents or create unread.
  Drafts are held per person.
- **Recents ordering.** A send bumps the row to the top with its snippet; a note
  does not.
- **Decision rail.** Read-only context with one jump link per card. Its only
  writes are on the task card — `+ Add task` and the done checkbox, which holds
  the check for a beat before filing the task under Done.
- **Breakpoints** (Inbox). ≥1180 three columns · 920–1179 compact three · 640–919 two
  columns with the rail as a `$shadow28` drawer behind a Details button ·
  **<640 single column**, where Recents becomes a matching left drawer behind a
  Recents button and the dialer gets its own strip so it cannot cover the send
  control. The first three are the design file's; the fourth is an addition —
  below 640 the two-column grid needed more width than the viewport had, and
  because the page is `overflow: hidden` the composer was pushed off-screen and
  became unreachable rather than merely scrolled.
- **Dialer FAB.** The bottom-right toggle (📞 ↔ ✕). The widget itself is
  specified on the Dialer page and is not built here.

## Payroll Setup behaviour implemented

- **Calendar.** Pick the Sunday that starts payroll #1 and its pay date; all 26
  biweekly periods generate from there, with the pay-date gap fixed once and
  applied to all of them. Weeks carry Amazon's real numbers, year-qualified
  (`W6 + W7 · 2026`), and are never re-based to the calendar's own year.
- **Guards on generate.** A non-Sunday seed is refused, the pay date must land
  within 0–14 days of the period end, and an overlap with a locked year is
  blocked by name (`W2 + W3 · 2027 already belong to 2026 · P25`). A *gap*
  between calendars only warns — you can still continue.
- **Draft → lock.** A generated calendar is a preview: every pay date is
  hand-editable (each edit re-checked against the period end, the 14-day cap and
  the previous period's pay date) until `Confirm & lock` commits it.
- **Unlock is audited.** It needs both the year typed back and a reason before
  the button enables, and it recalculates nothing — cancelling restores the
  locked calendar exactly as it was.
- **Upload.** Keyed to a locked pay period, never free dates. Re-upload replaces
  the period's figures; a posted period must be reverted first. Extraction shows
  gross pay and employer taxes per group, an absent group prints blank rather
  than a lying zero, and unmapped position names declare the money they exclude.
- **Post / revert.** Posting names every figure and the grand total before it
  commits; reverting requires a reason. Both toast in past tense.
- **Narrow widths.** The page has no breakpoints of its own — the dense tables
  scroll inside their own card (`table.js`) so the page body never scrolls
  sideways, and the flyout keeps itself on screen when its tile sits low.

## Profit Projection behaviour implemented

The **daily** P&L: one editable day, and a range is a read-only sum. Payroll-side
only — the vehicle economy lives on Fleet Financials and is never reconciled here.

- **Two grains in one page.** Week shows five trend charts and a day-by-day
  table; picking a day (from the grain menu, a table row, or any chart column)
  swaps in the projection inputs, an hours-per-route chart and the per-person
  payroll detail.
- **Projected days are marked twice** — dashed outlines in the charts, amber
  italics in the table — so "not actual yet" never rests on colour alone.
- **The intake is honest before it lands.** The import dialog names every column
  it mapped, splits the file into days, and says per day whether the cost is new,
  replaces an earlier import, or is skipped because the day is locked. Codes that
  match no roster record are counted and named rather than quietly dropped.
- **Empty is stated, not faked.** Stepping off the seeded week gives em-dash KPIs
  and "No days in range" instead of invented figures.

## Profitability behaviour implemented

Profit per **2-week pay period** — the grain Payroll Setup's locked calendar
defines — with an always-on projection of the period in flight.

- **The current period is projected, and says so.** Its revenue is the real W32
  invoice plus W33 priced at the trailing revenue-per-route; its cost is the
  trailing cost-per-route. The `Inputs` popover names which of the three inputs
  are real, and a strip keeps the current period one click away while you read a
  closed one.
- **Four comparison bases.** Previous period, same period last year, trailing-3
  average, or none — every KPI and diagnostic restates its delta against the
  chosen basis, and each one knows whether up is good.
- **Provisional is not the same as closed.** P12 has a disputed week, so it
  carries a warning marker, reads *Provisional*, and is excluded from the
  trailing average and the table's closed-period average. P11 was restated and
  says when and by how much.
- **Seven trend charts, drag-reorderable.** Drag any chart's header onto another
  to swap them; the order persists in `localStorage`.
- **History.** Sixteen periods, sortable on every column, searchable by id, year,
  dates or source, with a year filter and an average row that counts only closed,
  non-provisional periods.

### A note on the charts

Findings from running the palettes through the `dataviz` validator, all left as
the design files specify:

- **`Regular vs overtime` and `Workforce utilization` pair two y-axes** — hours
  on the left, dollars on the right. That is the one chart form the guidance
  calls out by name as an anti-pattern, because the crossover point between two
  scales is an artefact of where you put the axes. The design file specifies it,
  so it is built as drawn.
- **Profitability pairs two y-axes twice as well** — `Regular vs overtime` and
  `Workforce utilization` again, for the same reason and with the same caveat.
- **The series palette FAILs two of the six colour checks.** `yellow-500` sits
  above the lightness band and `neutral-400` reads as grey (deliberately — it is
  the neutral "cost" series). Green↔grey separation is ΔE 7.2 under deuteranopia,
  inside the 6–8 band that is legal *only* with secondary encoding, and
  green/grey/yellow fall below 3:1 against the card. The relief the rule asks for
  is already present — every chart has a legend, hover tooltips carry the
  figures, and the Detail table below states every number — so the palette is
  kept, since these are the design system's own chart steps. Worth revisiting at
  DS level rather than per page.
- **Profitability's four-series distribution palette passes both separation
  checks** (ΔE 15.3 under CVD, 20.9 normal) and fails only the lightness band,
  because `blue-300` and `yellow-300` are deliberately light tints — `blue-500`
  and `blue-300` read as one Driver/Dispatch family, which is the point.

## Not built yet

Called out so nothing reads as an oversight:

- The dialer widget, the in-timeline search field, the `+ Contact` button and
  the person-row ⋮ menu (`Mark unread` / `Mark unhandled`).
- Unknown-number and named-contact rows, and their one-card rail variant.
- The `Include inactive` toggle — `Inbox.md` §3.1 puts it on the filter row, but
  `Inbox.dc.html` shows three pills, and the design file wins until it changes.
- Attachments, voicemail playback, send-failure retry, and the loading and
  error states.
- Dispatch tasks are local state. No page in the Dispatch portal defines a task
  store yet (`Inbox.md` §3.4, Card 4), so nothing is persisted.
- The two other Financial Management pages, and the six other portals.
- Profitability's `Over workforce` diagnostic reads `—`: no page defines a
  staffing plan, so it states the gap rather than showing a number. Export is a
  staged interaction.
- Profit Projection's `Pay period` grain renders the week view; the pay-period
  boundaries come from Payroll Setup's locked calendar and are not wired across
  yet. Its import, overrides and export are staged interactions, not real ones.
- Header search is presentational — the field is there, nothing queries yet.
- Payroll Setup is not role-gated. `Payroll Setup.md` §1 restricts `Unlock year`
  to Owner and Sub Admin and bars Operations from the page entirely; there is no
  auth layer yet, so the control is always shown and the dialog states the rule
  in words instead.
- Upload is simulated on a timer — there is no file picker and no XLSX parsing.
