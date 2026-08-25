// Seed for Profit Projection, from ProfitProjection.dc.html's own data.
//
// The page is the DAILY P&L: one editable day, a range is a read-only sum. The
// week shown is Sun Jul 26 – Sat Aug 1, 2026, with the last day still projected
// because its Paycom file has not landed yet.

export const DAYS = [
  { l: 'Sun 26', full: 'Sun Jul 26', long: 'Sun Jul 26, 2026', routes: 30, clock: 30, hours: 285.3, otPct: 25.7, payroll: 8441.0, revenue: 11154.0, pkg: 6702, status: 'actual', mix: 'Step Van 15 + 2 · XL 8 · Large 4 · Adhoc 1' },
  { l: 'Mon 27', full: 'Mon Jul 27', long: 'Mon Jul 27, 2026', routes: 31, clock: 33, hours: 288.6, otPct: 16.3, payroll: 8025.0, revenue: 11549.0, pkg: 6929, status: 'actual', mix: 'Step Van 16 + 2 · XL 8 · Large 4 · Adhoc 1' },
  { l: 'Tue 28', full: 'Tue Jul 28', long: 'Tue Jul 28, 2026', routes: 33, clock: 37, hours: 322.7, otPct: 16.5, payroll: 9296.0, revenue: 12295.0, pkg: 7377, status: 'actual', mix: 'Step Van 17 + 2 · XL 8 · Large 5 · Adhoc 1' },
  { l: 'Wed 29', full: 'Wed Jul 29', long: 'Wed Jul 29, 2026', routes: 33, clock: 35, hours: 324.0, otPct: 20.3, payroll: 9422.9, revenue: 12287.04, pkg: 7392, status: 'actual', mix: 'Step Van 17 + 2 · XL 8 · Large 5 · Adhoc 1' },
  { l: 'Thu 30', full: 'Thu Jul 30', long: 'Thu Jul 30, 2026', routes: 35, clock: 36, hours: 330.1, otPct: 20.6, payroll: 9603.0, revenue: 12709.0, pkg: 7625, status: 'actual', mix: 'Step Van 18 + 2 · XL 9 · Large 5 · Adhoc 1' },
  { l: 'Fri 31', full: 'Fri Jul 31', long: 'Fri Jul 31, 2026', routes: 32, clock: 35, hours: 310.7, otPct: 18.5, payroll: 8974.0, revenue: 11900.0, pkg: 7140, status: 'actual', mix: 'Step Van 17 + 2 · XL 8 · Large 4 · Adhoc 1' },
  { l: 'Sat 1', full: 'Sat Aug 1', long: 'Sat Aug 1, 2026', routes: 31, clock: 31, hours: 284.5, otPct: 23.2, payroll: 8627.06, revenue: 11509.96, pkg: 6906, status: 'projected', mix: 'Step Van 16 + 2 · XL 8 · Large 4 · Adhoc 1' },
]

export const DEFAULT_DAY = 3 // Wed Jul 29 — the day the mock detail belongs to
export const WEEK_LABEL = 'Sun Jul 26 - Sat Aug 1'
export const BREAK_EVEN = 311.23
export const BLOCK_HOURS = 10 // the blocked hours per route the day chart marks

// Chart ceilings, so the bar heights are the design file's, not re-derived.
export const AXIS = {
  dailyPL: 13000,
  cprLo: 260,
  cprHi: 320,
  perRoute: 400,
  hours: 360,
  cost: 12000,
  staff: 40,
  dayHours: 12,
}

export const GRAINS = ['Day', 'Week', 'Pay period', 'Custom']

// Cost is payroll only — an adjustments surface was removed by owner decision
// on 2026-08-12 and must never be re-added here.
export const WEEK_BREAKDOWN = [
  { label: 'Regular pay', amt: 41330 },
  { label: 'Overtime', amt: 10428 },
  { label: 'Employer taxes', amt: 5693 },
  { label: 'Workers’ comp', amt: 4828 },
  { label: 'Bonus and adjustments', amt: 1225 },
]

// The one day with hand-checked figures rather than derived ones.
export const DAY3_BREAKDOWN = [
  { label: 'Regular pay', amt: 6229.44 },
  { label: 'Overtime', amt: 1590.89 },
  { label: 'Employer taxes', amt: 860.24 },
  { label: 'Workers’ comp', amt: 729.0 },
  { label: 'Bonus', amt: 13.33 },
]

export const SEG_COLORS = [
  'var(--blue-500)',
  'var(--yellow-500)',
  'var(--neutral-400)',
  'var(--green-500)',
  'var(--neutral-200)',
]
export const SEG_TEXT = [
  'var(--white)',
  'var(--neutral-900)',
  'var(--white)',
  'var(--white)',
  'var(--text-secondary)',
]

const DRAWN_PEOPLE = [
  { code: 'A1I9', name: 'LOPEZ CASTRO, ADRIAN', pos: 'Driver', reg: 8.0, ot: 3.35, regD: 180.0, otD: 113.06, bonus: 0 },
  { code: 'A1JB', name: 'SALINAS, ISAAC', pos: 'Driver', reg: 8.0, ot: 2.53, regD: 180.0, otD: 85.39, bonus: 0 },
  { code: 'A1C2', name: 'BELTRAN, MARCO', pos: 'Driver', reg: 8.0, ot: 2.5, regD: 180.0, otD: 84.38, bonus: 0 },
  { code: 'A1HU', name: 'JIMENEZ, JULIAN', pos: 'Driver', reg: 8.0, ot: 2.4, regD: 180.0, otD: 81.0, bonus: 0 },
  { code: 'A1D7', name: 'ASUTAY, EMRE', pos: 'Driver', reg: 8.0, ot: 2.35, regD: 180.0, otD: 79.31, bonus: 0 },
  { code: 'A1F3', name: 'GONZALEZ, RUBEN', pos: 'Driver', reg: 8.0, ot: 2.25, regD: 180.0, otD: 75.94, bonus: 0 },
  { code: 'A03Z', name: 'CASILLAS, JESUS', pos: 'Dispatch', reg: 8.53, ot: 0, regD: 192.0, otD: 0, bonus: 0 },
  { code: 'A1AJ', name: 'ALVARENGA, CHRISTIAN JOSEPH', pos: 'Driver', reg: 8.0, ot: 0.75, regD: 180.0, otD: 25.19, bonus: 19.69 },
  // A payroll code with no roster match — the row the page has to be honest about.
  { code: 'A1I4', name: 'KNOKE, MAIK', pos: null, reg: 8.0, ot: 1.82, regD: 180.0, otD: 61.43, bonus: 0, unmatched: true },
]

const LAST = ['RIVERA', 'NGUYEN', 'OKAFOR', 'PATEL', 'HERNANDEZ', 'KIM', 'JOHNSON', 'MARTINEZ', 'SILVA', 'THOMPSON', 'DIALLO', 'ROSSI', 'CHEN', 'GARCIA', 'WILSON', 'ADEYEMI', 'MORALES', 'BAKER', 'SANTOS', 'LEE', 'CRUZ', 'EVANS', 'FLORES', 'GRANT', 'IBARRA', 'JAMES']
const FIRST = ['MARIA', 'DAVID', 'CHIOMA', 'RAVI', 'LUIS', 'GRACE', 'TYLER', 'ANA', 'PEDRO', 'CLARA', 'MAMADOU', 'LUCA', 'WEI', 'SOFIA', 'MARK', 'TUNDE', 'ELENA', 'JOSH', 'RITA', 'MINJI', 'IVAN', 'HOLLY', 'DIEGO', 'NIA', 'HECTOR', 'TARA']

export const PEOPLE = DRAWN_PEOPLE.concat(
  Array.from({ length: 26 }, (_, i) => {
    const ot = ((i * 37) % 220) / 100
    return {
      code: 'A2' + String(10 + i),
      name: `${LAST[i]}, ${FIRST[i]}`,
      pos: 'Driver',
      reg: 8.0,
      ot,
      regD: 180.0,
      otD: Math.round(ot * 33.75 * 100) / 100,
      bonus: 0,
    }
  }),
)

// Day-view detail totals are the file's hand-checked figures for Wed Jul 29.
export const DAY_TOTALS = {
  people: '35 people',
  reg: '276.86',
  ot: '47.14',
  total: '324.00',
  regD: '$6,229.44',
  otD: '$1,590.89',
  bonus: '$26.67',
  cost: '$9,409.57',
  wc: '$729.00',
  taxes: '$860.24',
}

export const WEEK_COLUMNS = ['Packages', 'Revenue / route', 'Profit / route']
export const DAY_COLUMNS = ['Workers’ comp', 'Employer taxes', 'Rate']

// ---- Import dialog ----

export const IMPORT_FILE = {
  name: 'Paycom daily export · Jul 15 - Jul 31.xlsx',
  meta: '579 rows · 161 employee codes · 17 days · 2.1 MB',
}

export const MAP_ROWS = [
  { src: 'DATE', becomes: 'The day', sample: '2026-07-29' },
  { src: 'Employee_Code', becomes: 'Person · matched to the roster', sample: 'A1I9' },
  { src: 'Employee_Name', becomes: 'Name shown on the day', sample: 'LOPEZ CASTRO, ADRIAN' },
  { src: 'Regular', becomes: 'Regular pay $ · ÷ roster rate = regular hours ($22.50 when blank)', sample: '180.00' },
  { src: 'Overtime_Hours_(Weighted)', becomes: 'Overtime pay $ · ÷ their OT rate = overtime hours (1.5 × hourly, then $33.75, when blank)', sample: '113.06' },
  { src: 'Non_Worked_Hours_Bonus_Earning', becomes: 'Non-worked bonus $ · counted at half', sample: '19.69' },
  { src: 'Overtime · Double_Weighted_OT', becomes: 'Not used · zero in every row', sample: '0.00', unused: true, mapIt: true },
]

const NEW_DAY = { what: 'New day · cost lands', whatC: 'var(--success-fg)' }
const REPLACES = { what: 'Replaces what is there · imported once before', whatC: 'var(--warning-fg)' }

export const SPLIT_BASE = [
  { day: 'Wed Jul 15', people: 34, gross: '$7,614.03', ...NEW_DAY },
  { day: 'Thu Jul 16', people: 36, gross: '$8,102.88', ...REPLACES },
  { day: 'Fri Jul 17', people: 35, gross: '$7,988.41', what: 'Skipped · the day is locked', whatC: 'var(--text-disabled)', dim: true, unlock: true },
  { day: 'Sat Jul 18', people: 31, gross: '$7,206.19', ...NEW_DAY },
]

export const SPLIT_EXTRA = [
  ['Sun Jul 19', 30, '$6,884.15'], ['Mon Jul 20', 33, '$7,461.20'], ['Tue Jul 21', 35, '$7,902.66'],
  ['Wed Jul 22', 34, '$7,733.48'], ['Thu Jul 23', 36, '$8,077.10'], ['Fri Jul 24', 35, '$7,943.30'],
  ['Sat Jul 25', 31, '$7,188.52'], ['Sun Jul 26', 30, '$6,921.07'], ['Mon Jul 27', 33, '$7,398.75'],
  ['Tue Jul 28', 37, '$8,166.90'], ['Wed Jul 29', 35, '$7,820.33'], ['Thu Jul 30', 36, '$8,024.61'],
  ['Fri Jul 31', 35, '$7,942.05'],
  // The first seven land as new days; the rest replace an earlier import.
].map(([day, people, gross], i) => ({ day, people, gross, ...(i < 7 ? NEW_DAY : REPLACES) }))

export const SPLIT_TOTALS = { days: '17 days', people: '579', gross: '$131,486.72', what: '14 new · 2 replaced · 1 skipped' }

export const UNMATCHED_CODES = {
  headline: '159 of 161 codes matched the roster · 2 did not',
  detail: 'A1I4 KNOKE, MAIK · A1K2 OSEI, DANIEL',
}

// ---- Notes ----

export const SEED_NOTES_WEEK = [
  { author: 'N. Shazu', when: 'Sat Aug 1, 7:40 pm', text: 'Tue was 4 people over · two trainees rode along, not a scheduling miss.', initials: 'NS', avBg: 'var(--blue-100)', avFg: 'var(--blue-700)' },
  { author: 'M. Rivera', when: 'Fri Jul 31, 9:12 am', text: 'Sat still projected · the Paycom file lands Monday morning.', initials: 'MR', avBg: 'var(--green-100)', avFg: 'var(--success-fg)' },
]

export const SEED_NOTES_DAY = {
  3: [{ author: 'N. Shazu', when: 'Thu Jul 30, 8:15 am', text: 'Dearest day of the week · two rescues ran long. Cost per route $288.61 against a $311.23 break-even.', initials: 'NS', avBg: 'var(--blue-100)', avFg: 'var(--blue-700)' }],
}
