# Ultimate DSP - console

Next.js + TypeScript implementation of the Ultimate DSP dispatch console.
Eleven screens are built so far, across the Inbox, Surveys, Financial
Management and Admin portals.

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | production build - every nav route is pre-rendered |
| `npm start` | serve the production build |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run lint` | oxlint |

## Configuration

`.env` holds the deployment's branding and station identity - the values a
second station running this same build would change - and the sign-in
credentials. `.env.example` is the same file, committed as documentation; copy
it to `.env.local`, which is gitignored.

The two halves are kept apart on purpose:

- **`NEXT_PUBLIC_*`** (brand, station, locale) is compiled into the client
  bundle in plain text. **No secret belongs on a `NEXT_PUBLIC_` name.** Read
  through `src/config/env.ts`, which any screen may import.
- **Everything else** (`AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET`) is read
  on the server only, through `src/auth/config.ts`, which no client component
  imports. See "Auth" below.

## Auth

One shared account, behind `src/proxy.ts`. Signing in posts to `/api/login`,
which compares against server-only environment variables and answers with a
signed, httpOnly cookie; the middleware checks that cookie on every request and
redirects to `/login?next=...` when it is missing, so a page cannot be reached
by typing its URL.

**The credentials are never in the browser.** `AUTH_USERNAME`, `AUTH_PASSWORD`
and `AUTH_SECRET` deliberately carry no `NEXT_PUBLIC_` prefix: Next inlines a
`NEXT_PUBLIC_*` read into the client bundle as plain text, so a password there
would be readable by anyone who opened devtools. They are read on the server
only, by `src/auth/config.ts`, which no client component imports.

| Piece | Where |
| --- | --- |
| Credentials, timing-safe compare | `src/auth/config.ts` (server only) |
| Cookie signing and reading | `src/auth/session.ts` (Web Crypto, so middleware can use it) |
| The gate | `src/proxy.ts` |
| Sign in / sign out | `src/app/api/login`, `src/app/api/logout` |
| The screen | `src/features/login/LoginPage.tsx` |

The cookie is `httpOnly` (script cannot read it, so an XSS bug cannot steal the
session), `sameSite=lax`, `secure` in production, and expires after 8 hours. It
carries an HMAC over the username and expiry, so a browser cannot forge one by
writing `user=admin` - a tampered or hand-made token is refused.

`src/auth/session.ts` uses Web Crypto rather than `node:crypto` because
middleware runs on the Edge runtime, where `node:crypto` does not exist. One
implementation then serves both the middleware that reads the cookie and the
route that writes it.

The shell moved to `src/app/(console)/layout.tsx` so that `/login`, which sits
outside that route group, renders without the rail and header - an app you have
not been let into should not show you its navigation. A route group changes no
URLs.

**This is a gate, not user management.** One shared credential in an environment
file is fine for a staging box; real operators with individual accounts, roles
and an audit trail need an identity provider behind it. `Admin > Users` draws
that world but does not yet drive it.

## Responsive behaviour

Every page is checked at 640, 700, 760, 768, 834, 1440 and 1920 - a window is
not always a whole screen, so the tablet end is sampled below 768 as well. Two
rules hold at all of them:

- **The document never scrolls sideways.** Whatever a page needs, it fits.
- **A wide table scrolls inside its own container, not the page.** Its header,
  its rows and its totals share one scroller, so a column can never drift away
  from the heading that names it.

Most of this is done from `src/app.css` rather than per-page media queries: a
page marks the element that has to adapt with a `data-rsp-*` attribute, and one
stylesheet says what each attribute means at each width.

| Attribute | At ≤1023 (unless noted) |
| --- | --- |
| `data-rsp-page` | the page's own padding steps down (also at ≤1279) |
| `data-rsp-bar` · `data-rsp-wrap` | the row wraps instead of squeezing |
| `data-rsp-c2` · `data-rsp-rail` | a two-column grid becomes one |
| `data-rsp-kpi` | the KPI strip re-flows |
| `data-rsp-scroll` + `data-rsp-minw` | the block scrolls sideways below a floor |
| `data-rsp-static` | a centred bar item rejoins the flow once the bar wraps |
| `data-rsp-minw0` | a flex child is allowed to shrink past its content |

Overlays are governed separately, because a floating surface is laid out in
pixels - 880 for the fleet ledger, 672 for an import, 360 for a filter drawer -
and those numbers know nothing about the window. There are two kinds:

- `data-dialog-card` is a **dialog**, floating in the middle. Capped on both
  axes, with a 16px gutter.
- `data-dialog-drawer` is a **drawer**, anchored to an edge and spanning the
  full height. That full height is what makes it a drawer rather than a tall
  dialog, so it takes the width cap only and keeps 48px of scrim beside it to
  click on to dismiss. Capping its height leaves a gap at the bottom.

Both scroll rather than clip once capped. `data-dialog-loose` opts out the four
dialogs whose own dropdowns are meant to escape their box; each of those sits in
a scrim that scrolls instead.

## Dashes

The design files use a plain hyphen throughout - `Jul 12 - 18`, `Aug 21-22`, and
a bare `-` for an empty cell - and contain no em or en dashes at all. The code
follows them: there are none in `src/`, in copy or in comments.

Below 640 the shell's rail and header start to dominate the page, and no design
file draws a phone layout, so that is where the checking stops.

## Routing

The URL is the nav model written down: `/finance/payroll-setup`, `/inbox`, and
so on, so every page the rail can reach can also be linked, bookmarked and
reloaded. All thirty are pre-rendered.

Each built page has its own route segment under `app/`, four lines long, whose
only job is to import one screen. Everything else - the real nav entries with
no screen yet, and anything that is not a nav entry at all - falls through to
`app/[...slug]/page.tsx`.

The split is a bundling decision, not a stylistic one. One catch-all serving
every screen means one module graph, and the measurement was blunt: Roles &
Permissions, a read-only reference page, was shipping the Inbox, the payroll
calendar, every chart and all eleven seed sets - 1,317 kB of JavaScript. Per
route it is now 691-764 kB, most of that the React and Next runtime the pages
share.

`nav.ts` carries the `built` flag that says which of those pages exist, and
`BUILT_COUNT` is derived from it - the not-built state quotes that number
rather than one written down by hand.

The shell lives in `src/app/layout.tsx`, so the rail, the panel and the header
survive navigation and only the screen under them re-renders. It reads the
current route from `usePathname()` rather than being handed it.

Every screen is a client component: the product is one long interaction, and
there is no data to fetch on the server. Two things follow from server
rendering that a client-only build never had to think about, and both are
handled rather than worked around - `useViewportWidth` uses
`useSyncExternalStore` with a documented server snapshot, and the persisted
chart order in Profitability is read from `localStorage` after mount, never
during render. Either one read eagerly would disagree with the server's HTML.

## Types

State hooks export their shape rather than declaring it twice:

```ts
export type PayrollState = ReturnType<typeof usePayrollSetup>
```

The `{ s }` prop every section takes is typed against that, so a hook and the
components reading it cannot drift.

## Sources of truth

Two documents govern this code, and they answer different questions:

| Question | Answer lives in |
| --- | --- |
| What does the shell look like? | `Shell.dc.html` in the Claude Design project (`8ec264f5-…`) |
| What does a page look like? | `Inbox.dc.html`, `PayrollSetup.dc.html`, `ProfitProjection.dc.html`, `Profitability.dc.html` in the same project |
| What does it do? | the matching `.md` under `Project Details/` |
| Where does it sit in the nav? | each page's §3.0 "Shell placement" table |
| What are the tokens and rules? | `Design System/` - `Design System.dc.html` is canonical |

Where the design file and this readme disagree, the design file wins.

## Layout

```
src/
  config/
    env.ts                 every deployment value, read once and in one place
  ds/                      the design system, consumed not re-invented
    styles.css             entry point - imports every token file
    format.ts              the number, money and percent formatters, all pinned
                           to one locale so no two operators read a figure apart
    hooks.ts               useToast · anchorTo/anchorAt/clampLeft · paginate -
                           the behaviour every page had rewritten for itself
    charts/ChartKit.tsx    axes, plot, legend, tooltip, bars, lines, gauge - shared
    charts/chartTokens.ts  the card shell and the line-path helper
    tokens/*.css           colors · typography · spacing · radius · elevation · motion
    type.ts                the Fluent ramp as style objects (size and leading are paired),
                           plus the two documented composites and the mono face
    focus.ts               the two focus rings and the keyboard-only hook
    useHover.ts            the .dc.html `style-hover` attribute, as a hook
    useViewportWidth.ts    the three Inbox breakpoints, SSR-safe
    components/Chip.tsx    filter pill + status pill
    components/Toast.tsx   the confirmation line, in the two sizes pages ask for
    icons/                 glyph tables and the <Icon> component
  app/
    layout.tsx             <html>, the stylesheets, and the shell around every page
    inbox/page.tsx         one four-line segment per built screen, so each route
    admin/roles/page.tsx     bundles only the screen it renders
    …
    [...slug]/page.tsx     the fallback: real nav entries with no screen yet
    not-found.tsx          an address that matches no portal
  shell/
    nav.ts                 the rail's 9 entries in 4 groups + each portal's pages,
                           and the URL each one resolves to
    AppShell.tsx           48px rail · collapsible pane-2 panel · 48px header,
                           driven by the route
    NotBuilt.tsx           honest stub for nav entries with no page yet
  features/inbox/
    InboxPage.tsx          the three columns, the breakpoints, the dialer FAB
    RecentsPanel.tsx       search · All/Unread/Missed · person rows
    ActivityPanel.tsx      person header · channel chips · timeline · composer
    Timeline.tsx           one renderer per activity kind
    Composer.tsx           Text / Email / Note + the Call button
    DecisionRail.tsx       profile · route · performance · tasks
    useInbox.ts            all shared state and the queue rules
    data.ts                seed, verbatim from the design file's `seed()`
  features/profit-projection/
    ProfitProjectionPage.tsx  sticky toolbar, sections, dialog, toast
    Toolbar.tsx            grain · range stepper · lock · export
    Summary.tsx            projection inputs · the money · what moves it · cost breakdown
    DetailTable.tsx        day-by-day (week) or who-was-paid (day)
    ImportDialog.tsx       the Paycom intake, mapped and split before it lands
    Notes.tsx              a thread against the week or the day
    charts/ChartKit.tsx    axes, plot, legend, tooltip, stacked bar, line
    charts/WeekCharts.tsx  daily P&L · cost per route · per-route · reg vs OT · workforce
    charts/DayCharts.tsx   hours per route
    useProfitProjection.ts all state
    calc.ts                formatters and the derived maths
    data.ts                the week's seven days, people, import fixtures
  features/profitability/
    ProfitabilityPage.tsx  toolbar, summary, the seven trends, history
    Toolbar.tsx            period picker · range · inputs · compare · export
    Summary.tsx            current-period strip · the money · what moves it
    charts/Charts.tsx      the seven trend charts, drag-reorderable
    HistoryTable.tsx       sortable history + the filter panel
    useProfitability.ts    all state, including the persisted chart order
    calc.ts                derived figures, comparison bases, deltas
    data.ts                sixteen pay periods and the projected current one
  features/payroll/
    PayrollSetupPage.tsx   Calendar/Upload tabs, year + pay-period pickers
    CalendarTab.tsx        setup form · the 26-row calendar · lock bar
    UploadTab.tsx          Paycom drop zone · manual entry · figures · post bar
    PayrollDialogs.tsx     lock · unlock · post · revert · discard
    usePayrollSetup.ts     all state, plus the generate and pay-date rules
    calendar.ts            Amazon-week maths - the only date logic in the app
    data.ts                seed, verbatim from the design file's constructor
    table.ts               the scroll wrapper dense tables share
  features/surveys/
    SurveysPage.tsx        KPIs · the survey table · send dialog
    SurveyMaker.tsx        the maker, which takes the page over while it is open
    QuestionEditor.tsx     one question, collapsed or expanded
    SurveyPreview.tsx      the driver's side, answerable
    SendDialog.tsx         audience · timing · the anonymity promise, restated
    useSurveys.ts          list, filters, send state
    useSurveyMaker.ts      the survey being built
    parts.tsx              the page's own controls
    ui.ts                  segment tones and this page's eyebrow
    data.ts                four surveys, the roster, the templates
  features/admin-users/    portal users and Ultimate DA accounts, two populations
  features/admin-roles/    the read-only capability matrix, six posts
  features/admin-contacts/ the driver's phone directory, keyed by reason
  features/admin-company/  company vs station, and the live brand preview
  features/admin-connections/ punch API · mailbox · phone lines
  features/admin-billing/  what UDSP charges the DSP, metered
  features/dispatch/
    DispatchPage.tsx       tabs, the day stepper, the calendar
    LoadOutBoard.tsx       waves · roster · rescues · bench
    OnRoadBoard.tsx        what is out there, ordered by trouble
    RtsBoard.tsx           the closing count, and the day close
    SetupBoard.tsx         the SMS templates every send reads from
    Dialogs.tsx            send · add row · rescue · wave · swap · auto-assign
    Menus.tsx              the anchored pickers, and the after-a-call prompt
    useDispatch.ts         one day of state, shared by all four boards
    calc.ts                waves, punch states, warnings, the two board models
    data.ts                one seeded day, verbatim from the design file
    ui.ts                  the style constants parts.tsx would break refresh on
  features/rate-cards/
    RateCardsPage.tsx      the page: two tables, the timeline, the notes
    RateTable.tsx          Amazon Route Rates + the Others card
    RateTimeline.tsx       every window drawn against a months axis
    RateEditor.tsx         the dated change, its preview and both day pickers
    AddServiceDialog.tsx   name + hours + paid by, or pick from Work Summary
    FilterPanel.tsx        hours · paid by · to, applied as a set
    Notes.tsx              a thread against the rates
    useRateCards.ts        all state
    calc.ts                windows, counts, revenue, and the write itself
    data.ts                six service types and their rate history
    ui.ts                  the style constants parts.tsx would break refresh on
```

## Navigation

The rail is taken from **`Shell.dc.html`**, the canonical shell - order, groups,
geometry, icons and states all come from there rather than being invented:

- Nine portals: Dispatch · Inbox · Fleet · General - Scorecard · Scheduling ·
  Surveys - Financial Management - Admin Portal. The shell draws a divider
  before Scorecard, Finance and Admin, giving **4 · 3 · 1 · 1**, which agrees
  with both page specs that pin their own position (Inbox "2nd of 9 · group 1 of
  4"; Financial Management "8th of 9 · group 3 of 4, alone between dividers").
- 48px rail, 40×36 tiles at 2px/4px margins, a 24px brand monogram at Small
  radius, and 1px white-at-14% rules between groups.
- **Selection is a 2px white pill bar at the tile's left edge plus the filled
  glyph - no background plate**, and the active tile takes no hover plate.
  Hover elsewhere is white at 8% with the glyph lifting to pure white.
- Page rows carry their own 16px glyph, and when selected take the neutral
  `--surface-selected` plate, a 2px primary bar, the filled glyph in primary and
  Body 1 Strong.

The **top bar** is the shell's too: a Subtitle 2 wordmark that truncates with an
ellipsis, a search field that swaps to a white plate with a blue border on focus
(the `[data-field]` rule in `app.css`, so no state of its own) and narrows from
240px to 180px below 1024, and a 32px persona tinted by a hash of the name -
`ds/avatar.ts`, the same rule the Inbox avatars use.

The shell's wordmark is `brand + portal name` - **PacTrack Financial
Management** - because the panel beside it already says which page you are on.

A portal with no `pages` is a single-page portal - Inbox and General - and its
rail entry opens the page directly. Every other portal draws its page list as a
**permanent pane-2 column**, in the content row below the header and flush with
the rail, exactly where `Shell.dc.html` puts it. It is part of the layout, not a
layer over it: the page sits beside the panel rather than under it.

Collapsing is a width animation, and the mechanism is the design file's. The
**wrapper** animates its width between `--panel-width` and `0` over
`--duration-fast` on `--curve-easy-ease`; the `<nav>` inside keeps its full
212px and fades over `--duration-faster` on `--curve-linear`. Animating the
wrapper rather than the nav is what lets the page grow into the space instead of
watching a squashed panel. Both read from the motion tokens, so
`prefers-reduced-motion: reduce` collapses them to 1ms for free.

The chevron at the foot of the rail walks the sidebar away in **two steps**, and
each step names what it will do: **Collapse panel** puts the page list away and
hands its 212px to the screen, then **Hide sidebar** takes the 48px rail too, so
a 1440px window gives the page all 1440. A portal with no page list - Inbox,
General - skips the first step. Once the rail is gone a slim tab against the
left edge is the only thing left to click, and **Show sidebar** brings both
back. A double-click on the panel puts it away.

**The flyout opens on a click, not on hover.** Clicking a rail tile shows that
portal's pages; clicking the same tile again puts them away, so a double-click
opens and shuts. Moving to a different portal keeps the list up, since seeing
what is in there was the point of the click. Picking a page navigates and closes
the flyout. Hiding the rail is a deliberate choice, so unlike the page list it is
never taken away by a resize - only by asking for it.

Two departures, both to keep the product usable outside the design file's
desktop frame:

- The rail retracting at all is an addition: `Shell.dc.html` collapses the page
  list and keeps its rail. Dispatch is 1,120px of board before the chrome, which
  is what made the last 48px worth reclaiming.
- The flyout used to open on hover, which meant it appeared whenever the pointer
  crossed the rail on its way somewhere else. That was invented here - the shell
  file's only `hover` is `style-hover`, the tile highlight - and it is gone. The
  panel is now opened deliberately or not at all.
- Below **900px** the panel starts collapsed - a 48px rail plus a 212px panel
  leaves a 375px phone 115px of page. It is still an ordinary collapse: the
  control works, and picking a page puts the panel away again. A preference
  belongs to the size class it was expressed in, so crossing that fold hands the
  choice back to the viewport rather than carrying a desktop "keep it open" onto
  a phone.
- The design file's nav simply clips; Scorecard's six rows plus the heading need
  250px, so a short viewport scrolls them rather than losing one.

`Shell.dc.html` also remembers the page you were last on **per portal**, so
leaving Financial Management on Profitability and coming back returns you there
rather than to Payroll Setup. That is reproduced.

Eleven pages are built. Every other entry is listed because it is the real
navigation, and renders a stub that says so.

### Icons

The design file's helmet loads its glyph tables as scripts that assign onto
`window`, then installs a `window.Icon` factory that polls for them. Here each
table is a plain ESM export, `ds/icons/glyphs.ts` merges them in the same order
the helmet loaded them, and `Icon.tsx` re-expresses the factory as a React
component - so nothing polls, and nothing touches a global. That last part is
what lets an icon render in the server's HTML at all: there is no `window`
there to assign to.

Resolution order is unchanged: shell wins over page, and the `FIG_ICONS`
fallback table is last.

- `page-icons.ts`, `inbox-icons.ts` - verbatim from the design project.
- `shell-icons.ts` - the glyph table that was inline inside `icon-global.js`,
  lifted out so the ESM component can read it. Same data, same names.
- `icon-data.ts` - the fallback table, trimmed. The design system generates 266
  of these; three are referenced, and the other 263 were 189 kB of glyph data in
  the shared bundle of every route, including pages that render nothing but a
  not-built notice. The full table is in `Design System/assets/icons/` - copy an
  entry across by name to use another. A name with no entry is not an error:
  `Icon` renders an empty box of the right size.

### Typography

Segoe UI on the Fluent web ramp - all **16 named styles** live in `ds/type.ts`,
cross-checked against Design System §2ty.

A named style is a complete decision: size, line-height *and* weight travel
together. That is why nothing exports a bare weight - composing `subtitle1`
with a regular weight would invent a 17th style the ramp does not have. Spread
one style and nothing else:

```jsx
import { body1Strong, caption1 } from '../../ds/type'

<span style={{ ...body1Strong }}>{person.name}</span>   // Body 1 Strong 14/20/600
```

Three weights only: regular 400, semibold 600, bold 700. Bold is reserved for
marks and monograms.

Segoe UI is a Windows font. On Linux, fontconfig substitutes **Selawik** -
Microsoft's own metric-compatible open replacement - so the ramp lays out
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
  writes are on the task card - `+ Add task` and the done checkbox, which holds
  the check for a beat before filing the task under Done.
- **Breakpoints** (Inbox). ≥1180 three columns · 920-1179 compact three · 640-919 two
  columns with the rail as a `$shadow28` drawer behind a Details button ·
  **<640 single column**, where Recents becomes a matching left drawer behind a
  Recents button and the dialer gets its own strip so it cannot cover the send
  control. The first three are the design file's; the fourth is an addition -
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
  within 0-14 days of the period end, and an overlap with a locked year is
  blocked by name (`W2 + W3 · 2027 already belong to 2026 · P25`). A *gap*
  between calendars only warns - you can still continue.
- **Draft → lock.** A generated calendar is a preview: every pay date is
  hand-editable (each edit re-checked against the period end, the 14-day cap and
  the previous period's pay date) until `Confirm & lock` commits it.
- **Unlock is audited.** It needs both the year typed back and a reason before
  the button enables, and it recalculates nothing - cancelling restores the
  locked calendar exactly as it was.
- **Upload.** Keyed to a locked pay period, never free dates. Re-upload replaces
  the period's figures; a posted period must be reverted first. Extraction shows
  gross pay and employer taxes per group, an absent group prints blank rather
  than a lying zero, and unmapped position names declare the money they exclude.
- **Post / revert.** Posting names every figure and the grand total before it
  commits; reverting requires a reason. Both toast in past tense.
- **Narrow widths.** The page has no breakpoints of its own - the dense tables
  scroll inside their own card (`table.ts`) so the page body never scrolls
  sideways, and the panel collapses rather than crowding the page.

## Profit Projection behaviour implemented

The **daily** P&L: one editable day, and a range is a read-only sum. Payroll-side
only - the vehicle economy lives on Fleet Financials and is never reconciled here.

- **Two grains in one page.** Week shows five trend charts and a day-by-day
  table; picking a day (from the grain menu, a table row, or any chart column)
  swaps in the projection inputs, an hours-per-route chart and the per-person
  payroll detail.
- **Projected days are marked twice** - dashed outlines in the charts, amber
  italics in the table - so "not actual yet" never rests on colour alone.
- **The intake is honest before it lands.** The import dialog names every column
  it mapped, splits the file into days, and says per day whether the cost is new,
  replaces an earlier import, or is skipped because the day is locked. Codes that
  match no roster record are counted and named rather than quietly dropped.
- **Empty is stated, not faked.** Stepping off the seeded week gives em-dash KPIs
  and "No days in range" instead of invented figures.

## Profitability behaviour implemented

Profit per **2-week pay period** - the grain Payroll Setup's locked calendar
defines - with an always-on projection of the period in flight.

- **The current period is projected, and says so.** Its revenue is the real W32
  invoice plus W33 priced at the trailing revenue-per-route; its cost is the
  trailing cost-per-route. The `Inputs` popover names which of the three inputs
  are real, and a strip keeps the current period one click away while you read a
  closed one.
- **Four comparison bases.** Previous period, same period last year, trailing-3
  average, or none - every KPI and diagnostic restates its delta against the
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

- **`Regular vs overtime` and `Workforce utilization` pair two y-axes** - hours
  on the left, dollars on the right. That is the one chart form the guidance
  calls out by name as an anti-pattern, because the crossover point between two
  scales is an artefact of where you put the axes. The design file specifies it,
  so it is built as drawn.
- **Profitability pairs two y-axes twice as well** - `Regular vs overtime` and
  `Workforce utilization` again, for the same reason and with the same caveat.
- **The series palette FAILs two of the six colour checks.** `yellow-500` sits
  above the lightness band and `neutral-400` reads as grey (deliberately - it is
  the neutral "cost" series). Green↔grey separation is ΔE 7.2 under deuteranopia,
  inside the 6-8 band that is legal *only* with secondary encoding, and
  green/grey/yellow fall below 3:1 against the card. The relief the rule asks for
  is already present - every chart has a legend, hover tooltips carry the
  figures, and the Detail table below states every number - so the palette is
  kept, since these are the design system's own chart steps. Worth revisiting at
  DS level rather than per page.
- **Profitability's four-series distribution palette passes both separation
  checks** (ΔE 15.3 under CVD, 20.9 normal) and fails only the lightness band,
  because `blue-300` and `yellow-300` are deliberately light tints - `blue-500`
  and `blue-300` read as one Driver/Dispatch family, which is the point.

## Admin Contacts behaviour implemented

The station's phone directory as a **driver** needs it: not a list of names but
a list of *reasons to call*, each pointing at whoever answers. It grants nothing
and gates nothing, so a contact needs no invite and no seat - an outside
bookkeeper or a mechanic belongs here as readily as the owner, and `Job title`
is free text, never one of the five UDSP posts.

- **Reasons are the unit, and reach is stated honestly.** Every reason carries
  the number of contacts holding it. `0` is amber, because no driver will ever
  be offered it. `2 · hidden` is amber too - contacts hold it, but none of them
  are visible, so the reason is dark on the Help screen either way.
- **The contact form says what a save will change.** Picking a reason that
  nothing visible covers raises an amber line naming it - *"The Amazon app ·
  Locker code were dark on the Help screen until now."* Turning `Shown in the
  app` off retracts the claim, because a hidden contact lights nothing. Save is
  gated on who, phone and at least one reason.
- **Deleting names its consequences.** The confirm lists exactly the reasons
  that go dark - the ones no *other visible* contact covers - rather than
  claiming the whole set.
- **Retiring, not deleting, is how a reason ends.** A retired reason stays on
  the contacts that hold it, drawn with a dashed chip, and is never offered
  again: it disappears from the filter and from the form's picker.
- **Renaming propagates.** The name is what drivers read, so it cannot diverge
  per contact - a rename updates every chip and every list, and says so.
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
the DA, ten bands, six columns - and nothing on it is a control: the posts are
fixed in v1, so a capability moves only by moving the person to a different
post. Where a page's own role table disagrees with this matrix, the matrix wins.

- **The banner exists to end the search for an edit control.** *"These five
  posts and their rights are fixed. This page is a reference. Nothing on it can
  be edited."*
- **Picking a post holds its column still.** Clicking any chip - the DA one
  included - tints that column across all ten bands and dims the other five to
  40%, so you can read a post top-to-bottom without losing your place. It grants
  nothing and changes no right; the matrix is read-only either way. Clicking the
  same chip again clears it.
- **With nothing selected the Owner column stays tinted**, because it is not a
  variable: the Owner cannot reduce their own rights.
- **A dash means hidden, not disabled.** `-` is the post never seeing the page,
  its nav entry, or the portal's rail icon - not a greyed control it cannot
  press.
- **The one partial is named, not coloured.** Finance × Connections reads
  `Punch API tab only` in an amber pill rather than leaving a third colour to be
  decoded.
- **The DA chip is set apart** with a dashed outline, because a DA is not a
  portal user at all - and its `48` counts roster records, not accounts.
- Chips are keyboard-reachable: `Enter` and `Space` activate them, and the focus
  ring shows on keyboard focus only, never on click.

## Admin Users behaviour implemented

Two populations that are never the same list, on two tabs. A **portal user**
holds one of the five posts and consumes a seat. A **DA** is a roster driver
whose only surface is the phone app - no post, no seat, no email, and nothing on
this page ever takes a driver off the roster.

- **The owner row is protected and says why.** `Change role`, `Deactivate` and
  `Remove user` are dark on it with the reason on hover; the only way out is
  `Transfer ownership`. It is never bulk-selectable, and it stays pinned to the
  top under every sort.
- **Transfer ownership is confirmed by typing.** Only active non-owners can be
  offered it, the note names the consequence - *"You become a Sub Admin. This
  cannot be undone from your side."* - and the button stays dark until the typed
  address matches the picked person exactly.
- **Deactivate, don't delete.** `Remove user` is only ever live for an account
  with no history - an invite never accepted. Everyone else reads *"Deactivate
  instead. This account has history that must be kept."*
- **An invite holds a seat.** `Seats used` counts active + invited, turns amber
  at the cap, and a full plan blocks the send with the reason stated in the
  dialog rather than after the click. A duplicate email is refused and says
  whether to reactivate instead.
- **The filter drawer edits a draft.** Nothing reaches the table until `Apply`,
  so a half-built filter never churns the list underneath you; `Cancel`
  discards, per-section badges count what's picked, and searching the drawer
  forces matching sections open. The funnel turns blue while a filter is live.
  One drawer serves both tabs - it shows Role and Status on portal users, App
  state on DAs.
- **Coverage is the DA tab's point.** A red banner counts drivers with no
  account, because they cannot acknowledge coaching. `Invite all` sends what it
  can and **says what it skipped** - an invite goes by text, so a driver with no
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
Setup) - three money stories, and no figure is shared between them.

- **Usage is metered, never blocked.** Passing an allowance bills the overage at
  the stated rate; it never stops a dispatcher texting a driver at 6am. The one
  hard stop in the product is the seat cap, and that stops an *invite*, not a
  day's work.
- **The overage accrues in the open.** A meter turns amber at 80% while still
  *within* the allowance - warned, not billed - and goes red past it with the
  cost so far. Switching the period to Jul 2026 carries one $14.16 SMS overage
  through the header chip, the telephony bill, the meter, and INV-2026-07's
  $363.16, which is $349 plus exactly that.
- **The period ties the meters to the bill they landed on.** The invoice for the
  period being read is tinted blue, so the usage above and the charge below are
  visibly the same month. That month is the **billing month** - not the Amazon
  week and not the pay period.
- **`Next invoice` is the plan fee only**, and says so: metered overage is added
  at close of period and is not knowable in advance.
- **Seats are portal users - active + invited.** Ultimate DA accounts are
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
carry the legal name - the display name is only what the product wears.

- **A pale brand colour cannot ship an unreadable rail.** The brand paints the
  icon rail and nothing else - pages keep the product palette - and every mark
  drawn on it derives from that colour's luminance: glyphs, the divider, the
  selection plate and the active pill all flip from white to near-black past the
  threshold. Picking a cream `#F2E9C9` turns the rail's furniture dark; the navy
  seed keeps it light.
- **The preview is the whole point of the section.** Rail colour, display name,
  monogram initial and slogan all render live into a miniature of the real
  shell, so the brand is judged where it will actually appear rather than as a
  swatch. The monogram keeps the product blue - it is the app's mark, not the
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
- **`Week starts` is display only**, and says so - the money week is Payroll
  Setup's Sun-Sat Amazon calendar and does not move.
- **The defaults re-label, they never convert.** Switching Distance to
  Kilometers changes `85,000 mi` to `85,000 km` - the same number, because a
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
  and overtime arrive only with the API."* - and in the field contract,
  `worked_hours` and `ot_hours` are the two rendered in amber, because they are
  exactly what the file cannot supply. Credentials and the contract disappear
  with the provider; switching providers says the old credentials were
  discarded.
- **The API key is write-only.** It renders as dots and can be replaced, never
  read back.
- **One store, two reads.** Compliance is day-scoped and Associates→Timecard is
  period-keyed - the same store answering two questions, which is why the boards
  cannot disagree.
- **A read-only mail grant is not enough**, and the page says so: UDSP sends as
  well as reads. Disconnecting keeps every message already in the Inbox. The
  IMAP path derives the address from the username and host - `ops` +
  `imap.cedarridge.com` becomes `ops@cedarridge.com`.
- **The default line is protected on both counts.** `Set as default` and
  `Delete line` are both dark on it, each with its reason.
- **Deleting a line takes its forwards with it.** Any other line whose no-answer
  was `Forward to <that line>` falls back to `Voicemail` rather than forwarding
  into nothing - verified by deleting the line `DBO1-Rescue` pointed at.
- **`Move to reserved` is the way out that keeps the number.** Releasing is
  irreversible, so the alternative sits in the same dialog, and deleting needs
  the line name typed exactly.
- **A reserved number is what reserving it was for.** The add-line picker offers
  reserved numbers first and tags them, and using one removes it from the
  reserved table. The reserve picker offers only numbers nobody holds.
- **Ring-group members are portal users, never drivers** - a DA never rings -
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
design files that draw it tighter. The width caps are untouched - Billing still
centres at 980px and Company & Station at 760px, as drawn.

Admin Roles' capability bands sit on that page gap and carry a 12px margin of
their own, so band-to-band is `20 + 12 = 32`. They live inside the matrix's
horizontal scroller, which is a flex column carrying the page's gap so the
rhythm survives the move - a plain block wrapper would have collapsed it to the
12px margin alone.

## Surveys behaviour implemented

A survey is a question a driver answers on the phone app. Two things govern the
whole page: **anonymity is a promise**, and **a driver with no Ultimate DA
account cannot receive anything**.

- **Only what can happen is offered.** `Send now` is live only on an Active
  survey - a draft says *"Activate it first. Drafts cannot be sent"*, an archived
  one says *"Archived. Activate it first"*. `View answers` is live only once
  there are answers. Both stay in place and explain themselves rather than
  vanishing.
- **A survey holding answers is archived, never deleted.** `Delete` is dark with
  the count it would destroy - *"Archive instead. This survey holds 156
  answers."* - and live only on an empty draft.
- **The send dialog states the anonymity promise twice**: as a chip on the
  survey, and again above the send button - *"you will see answers but never who
  gave them."*
- **Drivers with no app account stay visible and unselectable.** Hiding them
  would hide the reason the count is short; instead the picker marks them and a
  red panel says how many cannot receive it and why.
- **Each audience counts what it is a count of.** "Everyone on the roster" reads
  *32 of 36*; "everyone who ran today" reads *22 of 24, resolved at send time*;
  hand-picking reads *n of 8 shown, 2 not selectable*.
- **The maker is the page, not a dialog.** A survey gets built, so it takes the
  screen over and comes back with a toast.
- **Four sections that summarise themselves shut** - question count and how many
  are required, the trigger, the attribution, the reminder - so the whole survey
  is legible without opening anything.
- **A template sets every section at once.** Picking `Weekly pulse` fills the
  name, three questions, the weekly trigger, Anonymous, and the 2-day reminder.
- **Length is called out while it is still being built.** Once more than half
  the questions are required: *"3 of 3 questions are required. Long required
  surveys get skipped."*
- Questions collapse to one draggable line and expand to the full editor, one at
  a time; `Choice` seeds two options and refuses to drop below two.
- **The preview is the driver's side, and answerable** - rating dots, yes/no and
  choices all respond - so the station can feel the length before shipping it.
  Its caption restates the attribution in the driver's own words.

## Dispatch behaviour implemented

Four boards over one day, in the order the day happens. A change on one is
visible on the others, because they all read the same day rather than four
copies of it.

**Load Out** gets routes out of the door. The waves strip is the morning in one
line - every count is a filter, so "who is missing from the 11:45 wave" is one
click. A wave's stroke is its whole status: green once everybody has punched,
red when the wave is now or next and somebody is not in, amber while it is still
ahead, grey when nobody is even due. The tooltip is the chase list, and it
carries what happened on the last call, so the next person to chase does not
repeat it.

The grace window is the point of the punch column: inside it a punch is simply
on time, and only past it does the cell start counting minutes. A row with no
scheduled arrival cannot be late, so it reports the punch plainly instead of
inventing a verdict. Retyping a wave drops a hand-typed scheduled arrival -
the offset is the rule again unless somebody overrides it afresh.

Duplicate warnings are the ones that matter most: one van cannot have two
holders, and a route code on two rows is the code On Road matches and Return to
Station closes by. Dismissing them hides the warning but keeps a marker naming
who hid it and when.

**On Road** is triage, so it sorts by trouble rather than by route number -
late first, done last, and a finished route dims rather than leaving the board
so the count still adds up. Rescues sit in the same list as routes, because
from dispatch's side they are both things that are out.

**Return to Station** is the day's arithmetic. Out minus delivered is what the
file says came back; `Counted` is what a person counted at the door; `Returned`
is what physically arrived. The board exists for the gaps between those three,
so an uncounted route stays visibly open rather than defaulting to agreement,
and the day refuses to close while any remain.

**Setup** holds the SMS templates the other three send from. Each one's badge
names where it is used, so an edit shows its blast radius before the edit. The
preview resolves against a real row - a status template previews against a route
that is actually behind - and the segment counter flags the cost past three
segments rather than hiding it.

Every send says who will get it *and who will not*: the group send skips the one
driver with no phone on file and names them. Every destructive edit is one
`Undo` away for six seconds, restoring the whole day rather than guessing at an
inverse.

> The design file is ~509 kB - three of the other pages combined. All four
> boards are built. Of its overlays, the ones the boards actually open are
> built: the group send, add row, create rescue, set wave, swap driver,
> auto-assign vans, the van and people pickers, the row menu, and the
> after-a-call prompt. Its deeper import wizards (roster, staging, itinerary and
> closing files) are toasts rather than flows, since there is no file to parse.
>
> Two things it does that would not survive server rendering are done
> differently: out-of-week route counts are seeded from the day index rather
> than `Date.getTime()`, which is timezone-dependent; and its `dialer-icons.js`
> self-heal script is unnecessary here, because the glyph tables are ESM exports
> merged once in a fixed order rather than scripts racing over `window`.
> `ds/icons/dispatch-icons.ts` carries the six glyphs it needs that no other
> built page does, rather than the two whole tables it loads for them.

## Rate Cards behaviour implemented

A rate is never a number, it is a dated **window**, and every figure on the page
is priced with the window in force on the day it belongs to. That one rule is
what the page exists to make visible.

- The table prices the seeded week day by day. Changing Step Van from $360 to
  $400 on Wed Jul 29 leaves Sun-Tue at $360 and prices Wed-Sat at $400 -
  $43,600 for the week, not 114 × $400 - and the row grows a **2 rates** chip so
  one total can never imply one price.
- The editor states the day before anything can be typed, then shows three
  cards - the day before, the day itself, the day after - so "from here on" and
  "for one day only" are visibly different gestures. Carry forward off adds a
  To date and puts the old rate back the day after it ends.
- It costs the change on the day (`$12,287.04 → $12,967.04`, margin
  `21.0% → 25.2%`) and, separately, the days after it that are already priced.
  Both are stated before Save, never after.
- Payroll closes days behind it. A change dated into them is accepted for the
  days it can reach and says what it could not: *6 locked days keep the old
  rate*. Every change can be undone from its toast for six seconds.
- `Unpaid Rescues` is DSP-paid, so its rate is locked at $0.00 - the cell is
  still clickable, because a locked control that says nothing is worse than one
  that explains itself.
- Packages and training are switched with the same dated editor, not a silent
  toggle: turning them off is a change with a date like any other.
- The timeline draws every window against a months axis, marks the range the
  tables are priced over, and says outright where a type did not exist yet
  rather than leaving blank track that could read as "no rate set". A window
  someone ended by hand is coloured apart from one a later change closed.
- Adding a service type either takes a name and hours or picks one Work Summary
  already knows, then opens the editor straight away - because a type with no
  rate is not finished.

> `RateCards.dc.html` also computes a grain picker, a range stepper, an export
> menu, an earned-revenue summary and a margin line that **its own markup never
> renders**. They are left out rather than invented, so the range is the file's
> own default: the week of Sun Jul 26 - Sat Aug 1, 2026. The same gap appears in
> `AdminBilling.dc.html` and `AdminUsers.dc.html`.
>
> Two things the file does that would not survive server rendering are done
> differently: its out-of-week route counts are seeded from `Date.getTime()`,
> which is timezone-dependent, so they are seeded from the day index instead;
> and its icon polling is unnecessary here because the glyph tables are ESM.

## Not built yet

Called out so nothing reads as an oversight:

- The dialer widget, the in-timeline search field, the `+ Contact` button and
  the person-row ⋮ menu (`Mark unread` / `Mark unhandled`).
- Unknown-number and named-contact rows, and their one-card rail variant.
- The `Include inactive` toggle - `Inbox.md` §3.1 puts it on the filter row, but
  `Inbox.dc.html` shows three pills, and the design file wins until it changes.
- Attachments, voicemail playback, send-failure retry, and the loading and
  error states.
- Dispatch tasks are local state. No page in the Dispatch portal defines a task
  store yet (`Inbox.md` §3.4, Card 4), so nothing is persisted.
- Dispatch's Compliance and Work Summary pages are not built; the Dispatch board
  itself is.
- Invoice Validation, and the six portals with nothing built yet. Their nav entries are real routes and land on the not-built state,
  which names the gap rather than pretending the entry does something.
- Profitability's `Over workforce` diagnostic reads `-`: no page defines a
  staffing plan, so it states the gap rather than showing a number. Export is a
  staged interaction.
- Profit Projection's `Pay period` grain renders the week view; the pay-period
  boundaries come from Payroll Setup's locked calendar and are not wired across
  yet. Its import, overrides and export are staged interactions, not real ones.
- Header search is presentational - the field is there, nothing queries yet.
- Payroll Setup is not role-gated. `Payroll Setup.md` §1 restricts `Unlock year`
  to Owner and Sub Admin and bars Operations from the page entirely; there is no
  auth layer yet, so the control is always shown and the dialog states the rule
  in words instead.
- Upload is simulated on a timer - there is no file picker and no XLSX parsing.
- Admin Contacts is not role-gated and not persisted: reasons, contacts and
  their order are in-memory state, so a reload restores the seed. Export is a
  staged interaction - it toasts a count and writes no file.
- The phone field suggests the two station lines as fixed seeds; nothing reads
  Connections → Phone lines yet.
- Admin Roles is a static reference: the matrix ships with the product, and the
  ladder counts are seed values. §3.6's `Loading` (skeleton count pills),
  `Error` (`· -` per chip with a `Retry`) and the greyed `0` for a post nobody
  holds are therefore not built - no query exists to fail.

### Where Admin Roles departs from `Roles & Permissions.md`

The design file is the specification of record, so these follow it:

- **`Manager 2`, not `Manager 1`.** §3.2 gives Manager a count of 1; the design
  file gives 2.
- **The chips are clickable.** §3.2 says the DA chip "goes nowhere" and §4 says
  no chip is clickable; the design file makes all six select a column. Built as
  drawn - it is a reading aid over a read-only table, not a grant.
- **No band-header clarifiers.** §3.3 puts *"Operations is the dispatcher"* on
  the DISPATCH header and a driver-editing note on PEOPLE. The design file's
  band model carries a `note` field but never fills or renders it, so the
  headers are bare. The driver-editing line survives - it is the footnote under
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
- Admin Users is not role-gated and not persisted - users, DAs and their states
  are in-memory, so a reload restores the seed. Import is staged: it names a
  fixed file and toasts, with no file picker and no CSV parsing. `Open profile`
  and `Resend invite` toast rather than doing anything.

### Where Admin Users departs from `AdminUsers.dc.html`

- **The table scrolls sideways inside its own box.** The design file gives the
  card `overflow:visible` and fixed column widths that total ~960px, so on any
  narrower screen the whole page - sticky tab bar included - would scroll
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
- **KPI cards use `minmax(min(180px, 100%), 1fr)`** - the design file's
  `minmax(180px, 1fr)` cannot shrink below 180px on a phone.
- **The `roleDrop` / `statusDrop` / `appDrop` dropdowns in the design file's
  logic are dead code** - the markup never renders them, because the filter
  drawer replaced them. They are not built.
- Admin Billing is not role-gated and not persisted. Spec §1 rule 2 makes
  `Change plan`, `Add seats`, `Update` card and `Cancel` **Owner-only**, with a
  Sub Admin seeing them disabled-with-the-reason rather than hidden; there is no
  auth layer, so they are live for everyone and the reason is stated in the
  tooltip instead. Every control on the page toasts rather than opening a real
  plan chooser, seat picker or processor form.
- Its unreachable states are therefore not built: the **failed-payment** banner
  and its day 0 / 7 / 14 schedule (§3.7 rule 4), the **card-expiry** amber strip
  within 30 days (§3.4 - the seed card expires 03/28), the **trial** plan card,
  the **seat-cap** amber bar (the seed sits at 8 of 12), and the *"No invoices
  yet - the first one is issued Sep 1, 2026"* empty state, which cannot occur
  with 11 seeded invoices. The filtered-empty state is built.

### Where Admin Billing departs from `AdminBilling.dc.html`

- **The danger zone is added.** The design file builds the entire cancel dialog
  - legal-name confirmation and all - plus `cancelled`, `notCancelled` and
  `resume` in its logic, and then renders **no control that reaches any of it**.
  Spec §3.6 requires a red-bordered `Cancel subscription` card, and §3.7 requires
  the *"Cancelled - access continues to Aug 31, 2026"* banner with `Resume`. The
  design file's own logic and the spec agree here; only its markup is missing,
  so the markup was written rather than leaving ~60 lines unreachable. Flagged
  because it is the one place this page adds a control the design file does not
  draw.
- **Storage is deliberately left out.** Spec §3.3 lists a third meter
  (`2.1 GB / 50 GB`, the only one that cannot be exceeded) and the design file
  still carries `gb` in its period data and a `gbCap` constant - but it renames
  the section to **"Telephony uses"** and its meter array holds SMS and voice
  only. The rename reads as intent, so storage stays out and the unused data
  with it.
- **The invoice table scrolls sideways below ~560px** instead of forcing the
  page to, and its last rows' menus open upward so the scroller cannot clip
  them - the same fix as Admin Users and Admin Contacts.
- **The cell grids use `minmax(min(Npx, 100%), 1fr)`** so they collapse on a
  phone rather than overflowing.
- Admin Company & Station is not role-gated and not persisted - every field is
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
- Admin Connections is not role-gated and not persisted - providers, mailbox,
  lines and reserved numbers are in-memory, so a reload restores the seed. Every
  connection is staged: `Test connection` always succeeds, no OAuth flow opens,
  no provider is actually called, and the number pool is a fixed list rather
  than a live inventory. `Record` and `Upload` greetings set the mode without a
  recorder or a file picker.
- **The Admin Portal is now complete** - all six pages are built.

### Where Admin Connections departs from `AdminConnections.dc.html`

- **Both tables scroll sideways in their own boxes** rather than letting the
  page scroll - the lines table needs ~700px and the reserved table ~360px, and
  the design file gives neither a scroller.
- **A scroller that clips horizontally clips vertically too**, and a two-row
  table is shorter than its own row menu - it cannot contain one in either
  direction. Rather than flip the menu, each scroller grows by a fixed amount
  while a menu inside it is open. The drawer's assign-user popover, which sits
  at the very bottom of an open drawer, opens upward instead.
- **The lines banner counts live** (`1 line` / `2 lines`) instead of the design
  file's hardcoded `2 lines`, which would have gone stale the moment a line was
  added or deleted.
- **Punch field names use Caption 1's metrics** rather than the design's 11px,
  which is off the type ramp.
- Surveys is not role-gated and not persisted: surveys, answers and the roster
  are in-memory, so a reload restores the seed. `Send`, `Export`, `Duplicate`,
  `Pause`/`Activate`, `Archive`, `Delete`, `Preview on my phone` and
  `View answers` all toast rather than doing anything. Saving from the maker
  toasts and returns; it does not write the survey back to the list.
- Responses - the Surveys portal's second page - is not built yet.
