# Remaining page build queue

Every page is transcribed from its `.dc.html` in `/home/akshatsw/Desktop/All Pages(1)/`,
which is the specification of record for structure as well as behaviour.

## Done this pass
- [x] `/finance/invoice-validation` — InvoiceValidation.dc.html (Finance portal complete)
- [x] `/surveys/responses` — Responses.dc.html (Surveys portal complete)

## Left to build
- [x] `/scheduling/schedule` — Schedule.dc.html (1571 lines)
- [x] `/scheduling/auto-schedule` — AutoSchedule.dc.html (1089)
- [x] `/scheduling/availability` — Availability.dc.html (1598)
- [x] `/scorecard/overview` — ScorecardOverview.dc.html (1263)
- [x] `/scorecard/performance-roster` — Associates.dc.html (1294)
- [x] `/scorecard/events` — ScorecardEvents.dc.html (992)
- [x] `/scorecard/standards` — Standards.dc.html (1161)
- [x] `/scorecard/coaching-library` — CoachingLibrary.dc.html (1182) + QuizMaker.dc.html (201) as a full-page overlay
- [x] `/scorecard/imports` — ScorecardImports.dc.html (1084)

## The recipe each page follows
1. Read the whole `.dc.html` — markup first, then the `renderVals()` script.
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
- No `Date.now()`, `Math.random()`, `window`, or `toLocaleString` during render —
  SSR and the client must agree. Build dates from explicit y/m/d parts and format
  them by hand (see `src/features/invoice-validation/date.ts` and `fmt.ts`).
- Type styles come from `src/ds/type.ts` — a named style sets size, line-height and
  weight together; never compose a 17th style.
- Glyphs resolve through `src/ds/icons/glyphs.ts`; add a missing one by copying its
  entry across from the design project rather than inventing a path.
- Screenshots do not work in the in-app Browser pane, so verification is DOM- and
  arithmetic-shaped. `getComputedStyle` on a live element there can report a stale
  background; clone the node onto `body` to read the real value.
- Behaviour every page shares lives in `src/ds/hooks.ts`, not in the page: the
  toast timer (`useToast`), the toast that carries an Undo payload
  (`useUndoToast`), menu placement (`anchorTo` · `anchorAt` · `clampLeft`) and
  `paginate`. A new page takes them from there rather than writing its own.
- Deployment values come from `src/config/env.ts`, and figures are formatted by
  `src/ds/format.ts` — never a bare `toLocaleString`, which would render one way
  on the server and another in a non-`en-US` browser.
- Every page is checked at 768, 834, 1440 and 1920. The document must never
  scroll sideways; a wide table gets one scroller around its header, its rows and
  its totals so the columns cannot drift apart. See "Responsive behaviour" in the
  readme for the `data-rsp-*` vocabulary.
