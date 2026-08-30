import type { Route } from 'next'
import { env } from '../config/env'

// The rail, taken from Shell.dc.html — the canonical shell.
//
// Nine portals in four groups. `Shell.dc.html` draws a divider before
// `scorecard`, `finance` and `admin`, which gives 4 · 3 · 1 · 1 and agrees with
// both page specs that pin their own position: Inbox is "2nd of 9 · group 1 of
// 4" (Inbox §3.0) and Financial Management is "8th of 9 · group 3 of 4, alone
// between dividers" (Payroll Setup §3.0).
//
// `label` is the rail tooltip — the portal's full name. `name` is the short
// form the nav heading uses. They differ for Scorecard and Admin.
//
// A portal with no `pages` is a single-page portal: the rail entry opens the
// page directly. A portal WITH pages opens them as a panel floating against the
// rail, below the header; the shell file draws that same list as a permanent
// pane-2 column, and it was made a popup by request, so the page keeps the full
// width whenever it is shut. The order and the icons below are the shell file's.

// Branding is deployment data, not code: a second station running this build
// changes it without a rebuild of the source. Re-exported from the env module
// so the shell keeps its existing imports.
export const BRAND = env.brandName
export const USER_NAME = env.userName

export interface NavPage {
  id: string
  label: string
  icon: string
  /** Set once a real screen exists behind the entry; otherwise it lands on the
   *  not-built state. The route table is what decides, so this only drives copy. */
  built?: boolean
}

export interface Portal {
  id: string
  label: string
  name: string
  icon: string
  /** Multi-page portals open a flyout; single-page portals open `page` directly. */
  pages?: NavPage[]
  page?: string
  /** Single-page portals carry the flag themselves. */
  built?: boolean
}

// Portals that start a new group — the rail draws a rule above each.
const GROUP_STARTS = new Set(['scorecard', 'finance', 'admin'])

export const PORTALS: Portal[] = [
  {
    id: 'dispatch',
    label: 'Dispatch',
    name: 'Dispatch',
    icon: 'RailDispatch',
    pages: [
      { id: 'dispatch', label: 'Dispatch', icon: 'PgSend', built: true },
      { id: 'compliance', label: 'Compliance', icon: 'PgShield', built: true },
      { id: 'work-summary', label: 'Work Summary', icon: 'PgDocument', built: true },
    ],
  },
  { id: 'inbox', label: 'Inbox', name: 'Inbox', icon: 'RailInbox', page: 'Inbox', built: true },
  {
    id: 'fleet',
    label: 'Fleet',
    name: 'Fleet',
    icon: 'RailFleet',
    pages: [
      { id: 'fleet-dashboard', label: 'Fleet Dashboard', icon: 'PgGrid', built: true },
      { id: 'vehicles', label: 'Vehicles', icon: 'PgVehicleCar', built: true },
      { id: 'fleet-financials', label: 'Fleet Financials', icon: 'PgMoney', built: true },
    ],
  },
  { id: 'general', label: 'General', name: 'General', icon: 'RailGeneral', page: 'Associates', built: true },
  {
    id: 'scorecard',
    label: 'Scorecard & Performance Analytics Hub',
    name: 'Scorecard',
    icon: 'RailScorecard',
    pages: [
      { id: 'overview', label: 'Overview', icon: 'PgDataTrending', built: true },
      { id: 'performance-roster', label: 'Performance Roster', icon: 'PgPeopleList', built: true },
      { id: 'events', label: 'Events', icon: 'PgFlag', built: true },
      { id: 'standards', label: 'Standards', icon: 'PgRuler', built: true },
      { id: 'coaching-library', label: 'Coaching Library', icon: 'PgBookOpen', built: true },
      { id: 'imports', label: 'Imports', icon: 'PgArrowImport', built: true },
    ],
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    name: 'Scheduling',
    icon: 'RailScheduling',
    pages: [
      { id: 'schedule', label: 'Schedule', icon: 'PgCalendarLtr', built: true },
      { id: 'auto-schedule', label: 'Auto Schedule', icon: 'PgCalendarSync', built: true },
      { id: 'availability', label: 'Availability', icon: 'PgPersonAvailable', built: true },
    ],
  },
  {
    id: 'surveys',
    label: 'Surveys',
    name: 'Surveys',
    icon: 'RailSurveys',
    pages: [
      { id: 'surveys', label: 'Surveys', icon: 'PgTaskListSquareLtr', built: true },
      { id: 'responses', label: 'Responses', icon: 'PgChatMultiple', built: true },
    ],
  },
  {
    id: 'finance',
    label: 'Financial Management',
    name: 'Financial Management',
    icon: 'RailFinance',
    pages: [
      { id: 'payroll-setup', label: 'Payroll Setup', icon: 'PgPayment', built: true },
      { id: 'invoice-validation', label: 'Invoice Validation', icon: 'PgReceipt', built: true },
      { id: 'profitability', label: 'Profitability', icon: 'PgDataTrending', built: true },
      { id: 'profit-projection', label: 'Profit Projection', icon: 'PgArrowTrending', built: true },
      { id: 'rate-cards', label: 'Rate Cards', icon: 'PgTable', built: true },
    ],
  },
  {
    id: 'admin',
    label: 'Admin Portal',
    name: 'Admin Portal',
    icon: 'RailAdmin',
    pages: [
      { id: 'users', label: 'Users', icon: 'PgPerson', built: true },
      { id: 'roles', label: 'Roles & Permissions', icon: 'PgKey', built: true },
      { id: 'contacts', label: 'Contacts', icon: 'PgContactCard', built: true },
      { id: 'company-station', label: 'Company & Station', icon: 'PgBuilding', built: true },
      { id: 'connections', label: 'Connections', icon: 'PgLink', built: true },
      { id: 'billing', label: 'Billing & Subscription', icon: 'PgPayment', built: true },
    ],
  },
]

export const startsGroup = (id: string): boolean => GROUP_STARTS.has(id)

export const getPortal = (id: string): Portal | undefined => PORTALS.find((p) => p.id === id)

export function firstPageOf(portalId: string): string | null {
  return getPortal(portalId)?.pages?.[0].id ?? null
}

export function pageLabel(portalId: string, pageId: string | null): string {
  const p = getPortal(portalId)
  if (!p) return ''
  if (!p.pages) return p.page ?? p.name
  return p.pages.find((x) => x.id === pageId)?.label ?? p.name
}

// ---- routing ---------------------------------------------------------------
//
// The URL is the nav model written down: /finance/payroll-setup, /inbox. Every
// path the rail can reach exists as a real route, so a page can be linked,
// bookmarked and reloaded — none of which a state-only shell could do.

// The cast is the one place typed routes cannot help: every path is a catch-all
// segment built from this table, so the table — not the type — is the guarantee,
// and `resolveRoute` is what enforces it at the other end.
export function hrefOf(portalId: string, pageId?: string | null): Route {
  const page = pageId ?? firstPageOf(portalId)
  return (page ? `/${portalId}/${page}` : `/${portalId}`) as Route
}

/** Every reachable path, as segments, optionally narrowed to the built or the
 *  unbuilt half. A built page has its own route file; the catch-all only has to
 *  pre-render the rest. */
export function allRoutes(only?: 'built' | 'unbuilt'): string[][] {
  const want = (built: boolean) => only === undefined || (only === 'built') === built
  return PORTALS.flatMap((p) =>
    p.pages
      ? p.pages.filter((pg) => want(!!pg.built)).map((pg) => [p.id, pg.id])
      : want(!!p.built)
        ? [[p.id]]
        : [],
  )
}

/** How many pages actually exist. The `built` flags are the source: each one
 *  has a route file of its own under `app/`, and the flag is what the rail and
 *  the not-built state both read. */
export const BUILT_COUNT = allRoutes('built').length

/** Reads a catch-all slug back into the nav model, rejecting anything unknown. */
export function resolveRoute(slug: string[] | undefined): { portal: Portal; pageId: string | null } | null {
  const [portalId, pageId] = slug ?? []
  const portal = portalId ? getPortal(portalId) : undefined
  if (!portal) return null
  if (!portal.pages) return pageId ? null : { portal, pageId: null }
  if (!pageId) return null
  return portal.pages.some((p) => p.id === pageId) ? { portal, pageId } : null
}

/** Where the app opens: the first page of the first portal that has a screen. */
export const DEFAULT_ROUTE = '/finance/payroll-setup' as Route
