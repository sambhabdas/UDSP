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

export const BRAND = 'PacTrack'
export const USER_NAME = 'Kai Sato'

// Portals that start a new group — the rail draws a rule above each.
const GROUP_STARTS = new Set(['scorecard', 'finance', 'admin'])

export const PORTALS = [
  {
    id: 'dispatch',
    label: 'Dispatch',
    name: 'Dispatch',
    icon: 'RailDispatch',
    pages: [
      { id: 'dispatch', label: 'Dispatch', icon: 'PgSend' },
      { id: 'compliance', label: 'Compliance', icon: 'PgShield' },
      { id: 'work-summary', label: 'Work Summary', icon: 'PgDocument' },
    ],
  },
  { id: 'inbox', label: 'Inbox', name: 'Inbox', icon: 'RailInbox', page: 'Inbox' },
  {
    id: 'fleet',
    label: 'Fleet',
    name: 'Fleet',
    icon: 'RailFleet',
    pages: [
      { id: 'fleet-dashboard', label: 'Fleet Dashboard', icon: 'PgGrid' },
      { id: 'vehicles', label: 'Vehicles', icon: 'PgVehicleCar' },
      { id: 'fleet-financials', label: 'Fleet Financials', icon: 'PgMoney' },
    ],
  },
  { id: 'general', label: 'General', name: 'General', icon: 'RailGeneral', page: 'Associates' },
  {
    id: 'scorecard',
    label: 'Scorecard & Performance Analytics Hub',
    name: 'Scorecard',
    icon: 'RailScorecard',
    pages: [
      { id: 'overview', label: 'Overview', icon: 'PgDataTrending' },
      { id: 'performance-roster', label: 'Performance Roster', icon: 'PgPeopleList' },
      { id: 'events', label: 'Events', icon: 'PgFlag' },
      { id: 'standards', label: 'Standards', icon: 'PgRuler' },
      { id: 'coaching-library', label: 'Coaching Library', icon: 'PgBookOpen' },
      { id: 'imports', label: 'Imports', icon: 'PgArrowImport' },
    ],
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    name: 'Scheduling',
    icon: 'RailScheduling',
    pages: [
      { id: 'schedule', label: 'Schedule', icon: 'PgCalendarLtr' },
      { id: 'auto-schedule', label: 'Auto Schedule', icon: 'PgCalendarSync' },
      { id: 'availability', label: 'Availability', icon: 'PgPersonAvailable' },
    ],
  },
  {
    id: 'surveys',
    label: 'Surveys',
    name: 'Surveys',
    icon: 'RailSurveys',
    pages: [
      { id: 'surveys', label: 'Surveys', icon: 'PgTaskListSquareLtr' },
      { id: 'responses', label: 'Responses', icon: 'PgChatMultiple' },
    ],
  },
  {
    id: 'finance',
    label: 'Financial Management',
    name: 'Financial Management',
    icon: 'RailFinance',
    pages: [
      { id: 'payroll-setup', label: 'Payroll Setup', icon: 'PgPayment', built: true },
      { id: 'invoice-validation', label: 'Invoice Validation', icon: 'PgReceipt' },
      { id: 'profitability', label: 'Profitability', icon: 'PgDataTrending', built: true },
      { id: 'profit-projection', label: 'Profit Projection', icon: 'PgArrowTrending', built: true },
      { id: 'rate-cards', label: 'Rate Cards', icon: 'PgTable' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin Portal',
    name: 'Admin Portal',
    icon: 'RailAdmin',
    pages: [
      { id: 'users', label: 'Users', icon: 'PgPerson' },
      { id: 'roles', label: 'Roles & Permissions', icon: 'PgKey' },
      { id: 'contacts', label: 'Contacts', icon: 'PgContactCard' },
      { id: 'company-station', label: 'Company & Station', icon: 'PgBuilding' },
      { id: 'connections', label: 'Connections', icon: 'PgLink' },
      { id: 'billing', label: 'Billing & Subscription', icon: 'PgPayment' },
    ],
  },
]

export const startsGroup = (id) => GROUP_STARTS.has(id)

export const getPortal = (id) => PORTALS.find((p) => p.id === id)

export function firstPageOf(portalId) {
  const p = getPortal(portalId)
  return p && p.pages ? p.pages[0].id : null
}

export function pageLabel(portalId, pageId) {
  const p = getPortal(portalId)
  if (!p) return ''
  if (!p.pages) return p.page || p.name
  const page = p.pages.find((x) => x.id === pageId)
  return page ? page.label : p.name
}
