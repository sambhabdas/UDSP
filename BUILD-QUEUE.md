# Remaining page build queue

Every page is transcribed from its `.dc.html` in `/home/akshatsw/Desktop/All Pages(1)/`,
which is the specification of record for structure as well as behaviour.

## Done this pass
- [x] `/finance/invoice-validation` - InvoiceValidation.dc.html (Finance portal complete)
- [x] `/surveys/responses` - Responses.dc.html (Surveys portal complete)

## Left to build
- [x] `/scheduling/schedule` - Schedule.dc.html (1571 lines)
- [x] `/scheduling/auto-schedule` - AutoSchedule.dc.html (1089)
- [x] `/scheduling/availability` - Availability.dc.html (1598)
- [x] `/scorecard/overview` - ScorecardOverview.dc.html (1263)
- [x] `/scorecard/performance-roster` - Associates.dc.html (1294)
- [x] `/scorecard/events` - ScorecardEvents.dc.html (992)
- [x] `/scorecard/standards` - Standards.dc.html (1161)
- [x] `/scorecard/coaching-library` - CoachingLibrary.dc.html (1182) + QuizMaker.dc.html (201) as a full-page overlay
- [x] `/scorecard/imports` - ScorecardImports.dc.html (1084)

## The recipe each page follows
1. Read the whole `.dc.html` - markup first, then the `renderVals()` script.
2. `src/features/<name>/`: `data.ts` (seed) · `calc.ts` (derivations) · `use<Name>.ts`
   (one hook, `export type XState = ReturnType<typeof useX>`) · `style.ts` (shared
   CSSProperties, kept out of `parts.tsx` so oxlint's `only-export-components` passes)
   · `parts.tsx` · view files · `<Name>Page.tsx`.
3. Route at `src/app/<portal>/<page>/page.tsx`, re-exporting the page component with
   a `Metadata` title.
4. Flip `built: true` on the entry in `src/shell/nav.ts`.
5. Verify: `npx tsc --noEmit`, `npx oxlint src/features/<name>`, `npx next build`,
   then DOM probes in the Browser pane against hand-computed figures.

## Standing constraints
- No `Date.now()`, `Math.random()`, `window`, or `toLocaleString` during render -
  SSR and the client must agree. Build dates from explicit y/m/d parts and format
  them by hand (see `src/features/invoice-validation/date.ts` and `fmt.ts`).
- Type styles come from `src/ds/type.ts` - a named style sets size, line-height and
  weight together; never compose a 17th style.
- Glyphs resolve through `src/ds/icons/glyphs.ts`; add a missing one by copying its
  entry across from the design project rather than inventing a path.
- Screenshots DO work in the in-app Browser pane (they did not when this file was
  first written). Use them: a visual pass caught two runtime bugs in one sweep -
  a sparkline seeded off `charCodeAt(4)` of a 4-character id, which made every
  coordinate NaN, and two blank column headers colliding on `key=""` - neither of
  which the DOM and arithmetic checks had ever surfaced. Read the console per page
  as well, from a fresh tab: the pane's console is cumulative across navigations,
  so an error can look like it belongs to whatever page you are on.
- `getComputedStyle` on a live element in the pane can report a stale background;
  clone the node onto `body` to read the real value.
- Behaviour every page shares lives in `src/ds/hooks.ts`, not in the page: the
  toast timer (`useToast`), the toast that carries an Undo payload
  (`useUndoToast`), menu placement (`anchorTo` · `anchorAt` · `clampLeft`) and
  `paginate`. A new page takes them from there rather than writing its own.
- Deployment values come from `src/config/env.ts`, and figures are formatted by
  `src/ds/format.ts` - never a bare `toLocaleString`, which would render one way
  on the server and another in a non-`en-US` browser.
- Every page is checked at 768, 834, 1440 and 1920. The document must never
  scroll sideways; a wide table gets one scroller around its header, its rows and
  its totals so the columns cannot drift apart. See "Responsive behaviour" in the
  readme for the `data-rsp-*` vocabulary.
- Padding variance is intentional, and the design file decides. Cards render at
  12, 16 or 20px and the page gutter is 20px except on the four board pages
  (Dispatch, Compliance, Work Summary, Associates) which their own files put at
  24px. This was reviewed and left as-is on 2026-09-03: the `.dc.html` files are
  the spec of record for spacing as much as for structure, so do not normalise
  it. The semantic tokens in `spacing.css` (`--space-card-padding` and friends)
  are mostly unused for the same reason - they state a decision the design files
  do not follow. Take that up as a design-system question, not a code change.
- No em or en dashes anywhere. The design files use a plain hyphen throughout -
  `Jul 12 - 18`, `Aug 21-22`, and a bare `-` for an empty cell.
- The rail's page flyout opens on a click and shuts on the next click of the
  same tile; moving to a different portal keeps it up, since the point of that
  click was to see what is in there. It used to fly out on hover, which meant it
  appeared whenever the pointer crossed the rail on its way somewhere else -
  removed by request on 2026-09-04, along with the rail's double-click-to-pin,
  which fought the new toggle. Double-clicking the panel still dismisses it, and
  the Keep panel open control still docks it.
- Sign-in credentials never take a `NEXT_PUBLIC_` name. That prefix is what
  tells Next to inline the value into the client bundle as plain text, so a
  password there is readable by anyone who opens devtools. Server-only values
  go through `src/auth/config.ts`; the public half is `src/config/env.ts`. If a
  client component ever needs to import the former, the design is wrong.
