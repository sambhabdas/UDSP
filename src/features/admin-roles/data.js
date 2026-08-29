// Seed for Admin · Roles & Permissions, from AdminRoles.dc.html.
//
// The single reference every role gate in the product cites. Nothing here is a
// control: the five posts are fixed in v1, so a capability moves only by moving
// the person to a different post. Where a page's own role table disagrees with
// this matrix, this matrix is right.

export const POSTS = ['Owner', 'Sub Admin', 'Manager', 'Operations', 'Finance', 'DA']

// Cell values. A named partial is spelled out rather than left as a colour.
export const FULL = 'F'
export const READ = 'R'
export const DASH = '-'
export const PUNCH = 'P'

// Counts come from Users (portal accounts) except DA, which counts roster
// records — a DA is not a portal user at all.
export const LADDER = [
  { label: 'Owner', count: '1' },
  { label: 'Sub Admin', count: '1' },
  { label: 'Manager', count: '2' },
  { label: 'Operations', count: '3' },
  { label: 'Finance', count: '1' },
]

export const DA_POST = 'DA'
export const DA_LABEL = 'DA · phone app only'
export const DA_COUNT = '48'

const band = (name) => ({ isBand: true, band: name })
const row = (cap, cells) => ({ isBand: false, cap, cells })

// Ten bands, six columns. The whole matrix is always visible — bands never
// collapse, because the page's job is comparison.
const FLAT = [
  band('People'),
  row('Roster & people · Associates', [FULL, FULL, FULL, FULL, FULL, DASH]),
  row('Per-DA hourly rate / OT rate · cost of labour', [FULL, FULL, FULL, FULL, FULL, DASH]),
  row('Delete permanently · zero-history DA', [FULL, FULL, DASH, DASH, DASH, DASH]),
  band('Performance'),
  row('Scores · events · standards · coaching', [FULL, FULL, FULL, FULL, DASH, DASH]),
  row('Scorecard imports', [FULL, FULL, FULL, FULL, DASH, DASH]),
  band('Scheduling'),
  row('Schedule · Availability · Auto Schedule', [FULL, FULL, FULL, FULL, DASH, DASH]),
  band('Dispatch'),
  row('Load Out · On Road · Return to Station · Compliance', [FULL, FULL, FULL, FULL, DASH, DASH]),
  row('Work Summary', [FULL, FULL, FULL, FULL, READ, DASH]),
  row('Dispatch config · Setup · service types', [FULL, FULL, FULL, FULL, DASH, DASH]),
  band('Fleet'),
  row('Vehicles · Fleet Dashboard · vehicle types', [FULL, FULL, FULL, FULL, DASH, DASH]),
  row('Fleet Financials', [FULL, FULL, FULL, DASH, FULL, DASH]),
  band('Money'),
  row('Rate Cards', [FULL, FULL, FULL, DASH, FULL, DASH]),
  row('Payroll Setup · Invoice Validation · Profitability', [FULL, FULL, FULL, DASH, FULL, DASH]),
  row('Profit Projection', [FULL, FULL, FULL, DASH, FULL, DASH]),
  row('Unlock year · unlock day · batch revert', [FULL, FULL, DASH, DASH, DASH, DASH]),
  band('Surveys'),
  row('Surveys · Survey Maker · Responses', [FULL, FULL, FULL, FULL, DASH, DASH]),
  row('Delete a survey · permanent', [FULL, FULL, DASH, DASH, DASH, DASH]),
  band('Comms & exports'),
  row('Inbox · Dialer', [FULL, FULL, FULL, FULL, DASH, DASH]),
  row('Exports · of whatever the post can see', [FULL, FULL, FULL, FULL, FULL, DASH]),
  band('Admin Portal'),
  row('Users · Roles & Permissions', [FULL, FULL, DASH, DASH, DASH, DASH]),
  row('Contacts', [FULL, FULL, READ, DASH, DASH, DASH]),
  row('Company & Station', [FULL, FULL, READ, DASH, DASH, DASH]),
  row('Connections', [FULL, FULL, READ, DASH, PUNCH, DASH]),
  row('Billing & Subscription', [FULL, READ, DASH, DASH, DASH, DASH]),
  band('Ultimate DA'),
  row('Ultimate DA (planned) · coaching + own score', [DASH, DASH, DASH, DASH, DASH, FULL]),
]

export const BANDS = FLAT.reduce((out, m) => {
  if (m.isBand) out.push({ band: m.band, rows: [] })
  else out[out.length - 1].rows.push(m)
  return out
}, [])

export const BANNER = {
  lead: 'These five posts and their rights are fixed.',
  rest: 'This page is a reference. Nothing on it can be edited.',
}

// The prose form of the money boundary — the split people misread most.
export const SPLITS = [
  {
    label: 'Operations',
    text: 'Runs the station and the day: dispatch, people, performance, scheduling, fleet. Sees what a driver costs. Never sees what Amazon pays.',
  },
  {
    label: 'Finance',
    text: 'Runs the money: the finance portal, Fleet Financials, and Work Summary, where the invoice actuals come from. No dispatch board.',
  },
]

export const SPLIT_FOOTNOTE = 'Every post except DA can edit a driver, Finance included.'

// Stated here, enforced elsewhere. This panel names the invariants; it does not
// implement them.
export const PROTECTED_RULES = [
  'Only the account owner can change the owner.',
  'Transfer ownership is owner-only.',
  'A post cannot edit its own column.',
  'Unlock, void, permanent delete and batch rollback are owner and sub admin only.',
  'Only the owner can cancel the subscription.',
]
