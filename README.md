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

## Admin Contacts behaviour implemented

The station's phone directory as a **driver** needs it: not a list of names but
a list of *reasons to call*, each pointing at whoever answers. It grants nothing
and gates nothing, so a contact needs no invite and no seat — an outside
bookkeeper or a mechanic belongs here as readily as the owner, and `Job title`
is free text, never one of the five UDSP posts.

- **Reasons are the unit, and reach is stated honestly.** Every reason carries
  the number of contacts holding it. `0` is amber, because no driver will ever
  be offered it. `2 · hidden` is amber too — contacts hold it, but none of them
  are visible, so the reason is dark on the Help screen either way.
- **The contact form says what a save will change.** Picking a reason that
  nothing visible covers raises an amber line naming it — *"The Amazon app ·
  Locker code were dark on the Help screen until now."* Turning `Shown in the
  app` off retracts the claim, because a hidden contact lights nothing. Save is
  gated on who, phone and at least one reason.
- **Deleting names its consequences.** The confirm lists exactly the reasons
  that go dark — the ones no *other visible* contact covers — rather than
  claiming the whole set.
- **Retiring, not deleting, is how a reason ends.** A retired reason stays on
  the contacts that hold it, drawn with a dashed chip, and is never offered
  again: it disappears from the filter and from the form's picker.
- **Renaming propagates.** The name is what drivers read, so it cannot diverge
  per contact — a rename updates every chip and every list, and says so.
- **Order is the order the app renders.** Rows drag to reorder and renumber,
  and dragging is disabled while a column sort is active, because a manual
  order cannot be expressed through a sorted view. New contacts land last and
  the toast says so.
- **Reasons added from the form arrive already picked**, in a category that is
  matched to an existing one rather than duplicated.
- Search covers name, title and phone; the reason filter is a searchable
  multi-select whose picked entries float to the top; export states the count
  and that filters were applied.

## Admin Roles & Permissions behaviour implemented

The **single reference** every role gate in the product cites. Five posts plus
the DA, ten bands, six columns — and nothing on it is a control: the posts are
fixed in v1, so a capability moves only by moving the person to a different
post. Where a page's own role table disagrees with this matrix, the matrix wins.

- **The banner exists to end the search for an edit control.** *"These five
  posts and their rights are fixed. This page is a reference. Nothing on it can
  be edited."*
- **Picking a post holds its column still.** Clicking any chip — the DA one
  included — tints that column across all ten bands and dims the other five to
  40%, so you can read a post top-to-bottom without losing your place. It grants
  nothing and changes no right; the matrix is read-only either way. Clicking the
  same chip again clears it.
- **With nothing selected the Owner column stays tinted**, because it is not a
  variable: the Owner cannot reduce their own rights.
- **A dash means hidden, not disabled.** `—` is the post never seeing the page,
  its nav entry, or the portal's rail icon — not a greyed control it cannot
  press.
- **The one partial is named, not coloured.** Finance × Connections reads
  `Punch API tab only` in an amber pill rather than leaving a third colour to be
  decoded.
- **The DA chip is set apart** with a dashed outline, because a DA is not a
  portal user at all — and its `48` counts roster records, not accounts.
- Chips are keyboard-reachable: `Enter` and `Space` activate them, and the focus
  ring shows on keyboard focus only, never on click.

## Admin Users behaviour implemented

Two populations that are never the same list, on two tabs. A **portal user**
holds one of the five posts and consumes a seat. A **DA** is a roster driver
whose only surface is the phone app — no post, no seat, no email, and nothing on
this page ever takes a driver off the roster.

- **The owner row is protected and says why.** `Change role`, `Deactivate` and
  `Remove user` are dark on it with the reason on hover; the only way out is
  `Transfer ownership`. It is never bulk-selectable, and it stays pinned to the
  top under every sort.
- **Transfer ownership is confirmed by typing.** Only active non-owners can be
  offered it, the note names the consequence — *"You become a Sub Admin. This
  cannot be undone from your side."* — and the button stays dark until the typed
  address matches the picked person exactly.
- **Deactivate, don't delete.** `Remove user` is only ever live for an account
  with no history — an invite never accepted. Everyone else reads *"Deactivate
  instead. This account has history that must be kept."*
- **An invite holds a seat.** `Seats used` counts active + invited, turns amber
  at the cap, and a full plan blocks the send with the reason stated in the
  dialog rather than after the click. A duplicate email is refused and says
  whether to reactivate instead.
- **The filter drawer edits a draft.** Nothing reaches the table until `Apply`,
  so a half-built filter never churns the list underneath you; `Cancel`
  discards, per-section badges count what's picked, and searching the drawer
  forces matching sections open. The funnel turns blue while a filter is live.
  One drawer serves both tabs — it shows Role and Status on portal users, App
  state on DAs.
- **Coverage is the DA tab's point.** A red banner counts drivers with no
  account, because they cannot acknowledge coaching. `Invite all` sends what it
  can and **says what it skipped** — an invite goes by text, so a driver with no
  number on file cannot get one, and the banner correctly stays up until that
  gap is closed rather than reporting success.
- **`No number on file` is a fact, not a blank.** It reads in amber in the phone
  column, and in the invite picker that row stays visible and unselectable
  rather than quietly disappearing.
- **Revoking access leaves the driver on the roster**, and the toast says so.
- Bulk actions are computed from what is actually selected: a mixed selection
  offers `Deactivate n` · `Reactivate n` · `Resend invite n` together, and
  `Edit user` only appears when exactly one row is picked.

## Admin Billing & Subscription behaviour implemented

The DSP's own bill, in the DSP's own product. The thing not to confuse: this
page bills **UDSP to the DSP**. It has nothing to do with what Amazon pays the
DSP (Invoice Validation, Rate Cards) or what the DSP pays its drivers (Payroll
Setup) — three money stories, and no figure is shared between them.

- **Usage is metered, never blocked.** Passing an allowance bills the overage at
  the stated rate; it never stops a dispatcher texting a driver at 6am. The one
  hard stop in the product is the seat cap, and that stops an *invite*, not a
  day's work.
- **The overage accrues in the open.** A meter turns amber at 80% while still
  *within* the allowance — warned, not billed — and goes red past it with the
  cost so far. Switching the period to Jul 2026 carries one $14.16 SMS overage
  through the header chip, the telephony bill, the meter, and INV-2026-07's
  $363.16, which is $349 plus exactly that.
- **The period ties the meters to the bill they landed on.** The invoice for the
  period being read is tinted blue, so the usage above and the charge below are
  visibly the same month. That month is the **billing month** — not the Amazon
  week and not the pay period.
- **`Next invoice` is the plan fee only**, and says so: metered overage is added
  at close of period and is not knowable in advance.
- **Seats are portal users — active + invited.** Ultimate DA accounts are
  unlimited and never billed, stated on the number it protects, because it is
  the first pricing-shaped question a DSP asks.
- **UDSP never stores a card number.** The processor holds it and returns the
  last four and the expiry; `Update` opens the processor's own hosted form.
- **Cancelling says what it does before the act, not after.** The confirm needs
  the company's legal name typed exactly, and states that access continues to
  the end of the paid period, the account then goes read-only, no data is
  deleted, and export stays available throughout. Once cancelled, a banner
  replaces the danger zone and `Resume subscription` is one click while the
  period runs.
- Invoices search across number, date, status **and breakdown**, filter by year,
  sort on date/number/amount/status, and every amount carries its own plan +
  overage split on hover rather than being one opaque figure.

## Admin Company & Station behaviour implemented

Two things that are not the same. The **company** is the legal entity that signs
and gets paid; the **station** is the building Amazon dispatches from. Documents
carry the legal name — the display name is only what the product wears.

- **A pale brand colour cannot ship an unreadable rail.** The brand paints the
  icon rail and nothing else — pages keep the product palette — and every mark
  drawn on it derives from that colour's luminance: glyphs, the divider, the
  selection plate and the active pill all flip from white to near-black past the
  threshold. Picking a cream `#F2E9C9` turns the rail's furniture dark; the navy
  seed keeps it light.
- **The preview is the whole point of the section.** Rail colour, display name,
  monogram initial and slogan all render live into a miniature of the real
  shell, so the brand is judged where it will actually appear rather than as a
  swatch. The monogram keeps the product blue — it is the app's mark, not the
  DSP's.
- **The slogan only appears once there is one.** It is driver-facing, so an
  empty one renders nothing rather than an empty line.
- **An invalid hex falls back rather than breaking.** The field keeps whatever
  you typed while the rail, the swatch and the logo tile all render the last
  valid colour.
- **Example text steps aside.** Focusing a field still holding its seeded
  example clears it; leaving it blank puts the example back, so the page never
  ends up with an empty legal name. Station fields only do this while unlocked.
- **The station is locked by default.** Its code is the one validated invoices
  carry, so it is not a field you edit in passing: `Edit` unlocks the three
  fields, and the code pill above them follows what you type.
- **`Week starts` is display only**, and says so — the money week is Payroll
  Setup's Sun–Sat Amazon calendar and does not move.
- **The defaults re-label, they never convert.** Switching Distance to
  Kilometers changes `85,000 mi` to `85,000 km` — the same number, because a
  reminder set at 85,000 mi stays that distance. Currency is the same promise:
  no conversion exists anywhere in UDSP.
- **Changing the time zone asks first**, and the confirm says the honest thing:
  times re-render, but nothing that already happened moves and every timestamp
  stays stored in UTC. Re-picking the zone already in force is not a change and
  raises nothing.

## Admin Connections behaviour implemented

Three things UDSP plugs into, on three tabs, and none of them overlap: the
**punch API** brings worked hours in, the **mailbox** sends and receives email
in the Inbox, and **phone lines** carry text and calls. Losing one never
degrades the others, and every banner says exactly what still works without it.

- **Each tab carries its own health dot**, so a broken connection is visible
  from whichever tab you happen to be standing on.
- **Disconnecting the punch API says what survives.** The banner turns amber and
  reads *"punch times still land from the Compliance file import. Worked hours
  and overtime arrive only with the API."* — and in the field contract,
  `worked_hours` and `ot_hours` are the two rendered in amber, because they are
  exactly what the file cannot supply. Credentials and the contract disappear
  with the provider; switching providers says the old credentials were
  discarded.
- **The API key is write-only.** It renders as dots and can be replaced, never
  read back.
- **One store, two reads.** Compliance is day-scoped and Associates→Timecard is
  period-keyed — the same store answering two questions, which is why the boards
  cannot disagree.
- **A read-only mail grant is not enough**, and the page says so: UDSP sends as
  well as reads. Disconnecting keeps every message already in the Inbox. The
  IMAP path derives the address from the username and host — `ops` +
  `imap.cedarridge.com` becomes `ops@cedarridge.com`.
- **The default line is protected on both counts.** `Set as default` and
  `Delete line` are both dark on it, each with its reason.
- **Deleting a line takes its forwards with it.** Any other line whose no-answer
  was `Forward to <that line>` falls back to `Voicemail` rather than forwarding
  into nothing — verified by deleting the line `DBO1-Rescue` pointed at.
- **`Move to reserved` is the way out that keeps the number.** Releasing is
  irreversible, so the alternative sits in the same dialog, and deleting needs
  the line name typed exactly.
- **A reserved number is what reserving it was for.** The add-line picker offers
  reserved numbers first and tags them, and using one removes it from the
  reserved table. The reserve picker offers only numbers nobody holds.
- **Ring-group members are portal users, never drivers** — a DA never rings —
  and each carries a presence dot.
- The voicemail script field only exists while the greeting is `Text to speech`;
  a line's no-answer choices never include forwarding to itself.

## Admin Portal spacing

The six Admin Portal pages share one vertical rhythm: **20px top padding, 32px
bottom, and a 20px gap between sections**, with the sticky tab bars and toolbars
taking the same 20px top edge.

`AdminContacts.dc.html` and `AdminCompanyStation.dc.html` specify that rhythm;
`AdminUsers`, `AdminRoles`, `AdminConnections` and `AdminBilling` specify a
tighter `16 / 24` with a 16px gap. Stepping between admin pages therefore shifted
the top edge and the section rhythm by 4px each time. **Owner-decided:** adopt
the roomier Contacts / Company & Station spacing everywhere, overriding the four
design files that draw it tighter. The width caps are untouched — Billing still
centres at 980px and Company & Station at 760px, as drawn.

Admin Roles' capability bands sit on that page gap and carry a 12px margin of
their own, so band-to-band is `20 + 12 = 32`. They live inside the matrix's
horizontal scroller, which is a flex column carrying the page's gap so the
rhythm survives the move — a plain block wrapper would have collapsed it to the
12px margin alone.

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
- The two other Financial Management pages, and the six portals with nothing
  built yet.
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
- Admin Contacts is not role-gated and not persisted: reasons, contacts and
  their order are in-memory state, so a reload restores the seed. Export is a
  staged interaction — it toasts a count and writes no file.
- The phone field suggests the two station lines as fixed seeds; nothing reads
  Connections → Phone lines yet.
- Admin Roles is a static reference: the matrix ships with the product, and the
  ladder counts are seed values. §3.6's `Loading` (skeleton count pills),
  `Error` (`· —` per chip with a `Retry`) and the greyed `0` for a post nobody
  holds are therefore not built — no query exists to fail.

### Where Admin Roles departs from `Roles & Permissions.md`

The design file is the specification of record, so these follow it:

- **`Manager 2`, not `Manager 1`.** §3.2 gives Manager a count of 1; the design
  file gives 2.
- **The chips are clickable.** §3.2 says the DA chip "goes nowhere" and §4 says
  no chip is clickable; the design file makes all six select a column. Built as
  drawn — it is a reading aid over a read-only table, not a grant.
- **No band-header clarifiers.** §3.3 puts *"Operations is the dispatcher"* on
  the DISPATCH header and a driver-editing note on PEOPLE. The design file's
  band model carries a `note` field but never fills or renders it, so the
  headers are bare. The driver-editing line survives — it is the footnote under
  the two-splits divider.
- **No `locked` marker on the Owner column.** §3.3 asks for one beside the
  tint; the design file tints only.
- **The matrix scrolls sideways below ~1160px** rather than being clipped. The
  design file puts `overflow:hidden` on each band card, which would cut
  `Punch API tab only` off on a narrow screen. All ten bands share one scroller
  so their columns stay aligned with each other.
- **The two bottom panels use `minmax(min(320px, 100%), 1fr)`.** The design
  file's `minmax(320px, 1fr)` cannot shrink below 320px and forces the whole
  page to scroll horizontally on a phone.
- Admin Users is not role-gated and not persisted — users, DAs and their states
  are in-memory, so a reload restores the seed. Import is staged: it names a
  fixed file and toasts, with no file picker and no CSV parsing. `Open profile`
  and `Resend invite` toast rather than doing anything.

### Where Admin Users departs from `AdminUsers.dc.html`

- **The table scrolls sideways inside its own box.** The design file gives the
  card `overflow:visible` and fixed column widths that total ~960px, so on any
  narrower screen the whole page — sticky tab bar included — would scroll
  horizontally. The toolbar stays outside the scroller.
- **Row menus on the last rows open upward.** A downward menu would be clipped
  by that scroller. The same fix was applied to Admin Contacts, where the last
  row's menu was being cut off by 108px.
- **The seat cap is stated in the invite dialog**, not only as a toast after the
  click. The design already disables the button at the cap; the banner explains
  it.
- **Transporter IDs, filenames and column chips use Caption 1's metrics**
  rather than the design file's 11px, which is off the type ramp. They stay
  monospace and the 12-character ID still clears its column.
- **KPI cards use `minmax(min(180px, 100%), 1fr)`** — the design file's
  `minmax(180px, 1fr)` cannot shrink below 180px on a phone.
- **The `roleDrop` / `statusDrop` / `appDrop` dropdowns in the design file's
  logic are dead code** — the markup never renders them, because the filter
  drawer replaced them. They are not built.
- Admin Billing is not role-gated and not persisted. Spec §1 rule 2 makes
  `Change plan`, `Add seats`, `Update` card and `Cancel` **Owner-only**, with a
  Sub Admin seeing them disabled-with-the-reason rather than hidden; there is no
  auth layer, so they are live for everyone and the reason is stated in the
  tooltip instead. Every control on the page toasts rather than opening a real
  plan chooser, seat picker or processor form.
- Its unreachable states are therefore not built: the **failed-payment** banner
  and its day 0 / 7 / 14 schedule (§3.7 rule 4), the **card-expiry** amber strip
  within 30 days (§3.4 — the seed card expires 03/28), the **trial** plan card,
  the **seat-cap** amber bar (the seed sits at 8 of 12), and the *"No invoices
  yet — the first one is issued Sep 1, 2026"* empty state, which cannot occur
  with 11 seeded invoices. The filtered-empty state is built.

### Where Admin Billing departs from `AdminBilling.dc.html`

- **The danger zone is added.** The design file builds the entire cancel dialog
  — legal-name confirmation and all — plus `cancelled`, `notCancelled` and
  `resume` in its logic, and then renders **no control that reaches any of it**.
  Spec §3.6 requires a red-bordered `Cancel subscription` card, and §3.7 requires
  the *"Cancelled — access continues to Aug 31, 2026"* banner with `Resume`. The
  design file's own logic and the spec agree here; only its markup is missing,
  so the markup was written rather than leaving ~60 lines unreachable. Flagged
  because it is the one place this page adds a control the design file does not
  draw.
- **Storage is deliberately left out.** Spec §3.3 lists a third meter
  (`2.1 GB / 50 GB`, the only one that cannot be exceeded) and the design file
  still carries `gb` in its period data and a `gbCap` constant — but it renames
  the section to **"Telephony uses"** and its meter array holds SMS and voice
  only. The rename reads as intent, so storage stays out and the unused data
  with it.
- **The invoice table scrolls sideways below ~560px** instead of forcing the
  page to, and its last rows' menus open upward so the scroller cannot clip
  them — the same fix as Admin Users and Admin Contacts.
- **The cell grids use `minmax(min(Npx, 100%), 1fr)`** so they collapse on a
  phone rather than overflowing.
- Admin Company & Station is not role-gated and not persisted — every field is
  in-memory, so a reload restores the seed. There is no Save for the company or
  branding blocks (only the station has an explicit lock), no file picker behind
  `Upload logo`, and nothing downstream actually consumes the brand colour, the
  display name or the defaults yet: the live preview is the only consumer.

### Where Admin Company & Station departs from `AdminCompanyStation.dc.html`

- **The branding divider comes off when the columns wrap.** The design file puts
  a fixed `border-left` and 24px indent on the preview column; once the card is
  narrow enough for the two columns to stack, that leaves a rule against nothing
  and a dead indent. A media query in `app.css` drops both at the wrap point.
  The design's 1.2 : 1 ratio is kept as-is when they sit side by side.
- **The `Defaults` grid is `repeat(auto-fit, minmax(min(300px, 100%), 1fr))`**
  rather than a hard `repeat(2, 1fr)`, and each cell owns its own hairline via
  the negative-margin trick the design file itself uses elsewhere. The fixed
  two-column version put a 300px time-zone field into a ~155px cell on a phone,
  and its per-cell `divider`/`top` values were only correct at exactly two
  columns.
- **The 40px logo monogram is Subtitle 2 Bold and `logo.svg` is Caption 1**,
  rather than the design's raw 18px and 11px, which are off the type ramp.
- Admin Connections is not role-gated and not persisted — providers, mailbox,
  lines and reserved numbers are in-memory, so a reload restores the seed. Every
  connection is staged: `Test connection` always succeeds, no OAuth flow opens,
  no provider is actually called, and the number pool is a fixed list rather
  than a live inventory. `Record` and `Upload` greetings set the mode without a
  recorder or a file picker.
- **The Admin Portal is now complete** — all six pages are built.

### Where Admin Connections departs from `AdminConnections.dc.html`

- **Both tables scroll sideways in their own boxes** rather than letting the
  page scroll — the lines table needs ~700px and the reserved table ~360px, and
  the design file gives neither a scroller.
- **A scroller that clips horizontally clips vertically too**, and a two-row
  table is shorter than its own row menu — it cannot contain one in either
  direction. Rather than flip the menu, each scroller grows by a fixed amount
  while a menu inside it is open. The drawer's assign-user popover, which sits
  at the very bottom of an open drawer, opens upward instead.
- **The lines banner counts live** (`1 line` / `2 lines`) instead of the design
  file's hardcoded `2 lines`, which would have gone stale the moment a line was
  added or deleted.
- **Punch field names use Caption 1's metrics** rather than the design's 11px,
  which is off the type ramp.
