// Seed for Admin · Company & Station, from AdminCompanyStation.dc.html.
//
// Two things that are not the same: the COMPANY is the legal entity that signs
// and gets paid, the STATION is the building Amazon dispatches from. The legal
// name goes on documents; the display name is only what the product wears.

export const SEED = {
  legalName: 'Cedar Ridge Logistics LLC',
  displayName: 'Cedar Ridge',
  dspCode: 'PTLX',
  address: '2140 Industrial Dr, Joliet, IL 60436',
  supportEmail: '',
  supportPhone: '',
  slogan: '',
  brand: '#1B2A5B',
  logo: false,
  stationName: 'Joliet, IL',
  stationCode: 'DBO1',
  stationAddress: '2140 Industrial Dr, Joliet, IL 60436',
  tz: 'America/Chicago (CST/CDT)',
  weekStart: 'Sunday',
  dateFmt: 'Mon, Jul 29, 2026',
  currency: 'USD ($)',
  distance: 'Miles',
}

export const FALLBACK_BRAND = '#1B2A5B'

// Fields that ship with example text. Focusing one whose value is still the
// example clears it; leaving it empty puts the example back, so the demo never
// ends up with a blank required field.
export const SAMPLE_FIELDS = {
  legalName: SEED.legalName,
  dspCode: SEED.dspCode,
  address: SEED.address,
  displayName: SEED.displayName,
  stationName: SEED.stationName,
  stationAddress: SEED.stationAddress,
  stationCode: SEED.stationCode,
}

export const TIME_ZONES = [
  'America/New_York (EST/EDT)',
  'America/Chicago (CST/CDT)',
  'America/Denver (MST/MDT)',
  'America/Phoenix (MST)',
  'America/Los_Angeles (PST/PDT)',
]

export const WEEK_STARTS = ['Sunday', 'Monday']

// The rail the preview draws. Admin is the selected one because that is the
// portal you are standing in while you pick the colour.
export const PREVIEW_TILES = ['RailDispatch', 'RailInbox', 'RailFleet', 'RailFinance', 'RailAdmin']
export const PREVIEW_SELECTED = 'RailAdmin'

export const DEFAULT_DEFS = [
  {
    key: 'dateFmt',
    label: 'Date format',
    info: 'Presentation only. Applies product-wide including exports.',
    options: ['Mon, Jul 29, 2026', '07/29/2026'],
    sample: (v) => `Sample: ${v}`,
  },
  {
    key: 'currency',
    label: 'Currency',
    info: 'Presentation only. No conversion exists anywhere in UDSP.',
    options: ['USD ($)', 'CAD ($)'],
    sample: () => 'Sample: $1,284.50',
  },
  {
    key: 'distance',
    label: 'Distance',
    info: 'Re-labels only, never converts. A reminder set at 85,000 mi stays that distance.',
    options: ['Miles', 'Kilometers'],
    sample: (v) => `Sample: 85,000 ${v === 'Miles' ? 'mi' : 'km'}`,
  },
]

export const INFO = {
  dspCode: 'Stamped into export filenames. Not validated against Amazon.',
  displayName:
    'The wordmark prefix in the top bar and the company on the driver app. Documents keep the legal name.',
  slogan: 'Driver-facing. Renders under the company name on the app home screen.',
  brand:
    'Paints the icon rail only - pages keep the product palette. Glyph and divider colors derive from its luminance, so a pale color cannot ship an unreadable rail.',
  stationCode: 'Validated invoices carry this code.',
  weekStart:
    "Display only. The money week is Payroll Setup's Sun-Sat Amazon calendar and does not move.",
  tz: 'Every timestamp is stored in UTC and shown in station local time. Changing this re-renders history.',
}

export const TZ_CONFIRM = (zone) =>
  `Times across UDSP will re-render in ${zone}. Nothing that already happened moves. Every timestamp stays stored in UTC.`
