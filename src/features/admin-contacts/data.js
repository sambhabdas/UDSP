// Seed for Admin · Contacts, from AdminContacts.dc.html.
//
// The station's phone directory as a DRIVER needs it: not a list of names but a
// list of reasons, each pointing at whoever answers. A directory and nothing
// else — it grants nothing, gates nothing and stores no account, so a contact
// needs no invite and no seat. `Job title` is free text and is never one of the
// five UDSP posts.

const CATEGORY_OF = {
  1: 'On the road', 2: 'On the road', 3: 'On the road',
  4: 'Emergency', 5: 'Emergency', 6: 'Emergency',
  7: 'Payroll', 8: 'Payroll', 9: 'Payroll', 10: 'Payroll',
  11: 'HR', 12: 'HR', 13: 'HR',
  14: 'Vehicle', 15: 'Vehicle',
  16: 'Tech', 17: 'Tech',
}

export const SEED_REASONS = [
  { id: 1, name: 'Running late', urgent: false },
  { id: 2, name: 'Van trouble', urgent: false },
  { id: 3, name: 'Route problem', urgent: false },
  { id: 4, name: 'Accident', urgent: true },
  { id: 5, name: 'Injury', urgent: true },
  { id: 6, name: 'Police stop', urgent: true },
  { id: 7, name: 'Payroll', urgent: false },
  { id: 8, name: 'Bonus', urgent: false },
  { id: 9, name: 'Overtime', urgent: false },
  { id: 10, name: 'Pay stub', urgent: false },
  { id: 11, name: 'Time off', urgent: false },
  { id: 12, name: 'Benefits', urgent: false },
  { id: 13, name: 'A complaint', urgent: false },
  { id: 14, name: 'Fuel card', urgent: false },
  { id: 15, name: 'Damage', urgent: false },
  { id: 16, name: 'The Amazon app', urgent: false },
  { id: 17, name: 'Your device', urgent: false },
].map((r) => ({ ...r, retired: false, cat: CATEGORY_OF[r.id] || 'Other' }))

// Reasons are many-to-many: one person can hold Payroll, Bonus and Overtime,
// and "Van trouble" can sit on both the desk and the fleet coordinator.
export const SEED_CONTACTS = [
  { id: 1, who: 'Dispatch desk', title: 'Station line', phone: '+1 815 555 0100', shown: true, reasons: [1, 2, 3, 4, 5, 6] },
  { id: 2, who: 'Dana Whitfield', title: 'Owner', phone: '(815) 555-0114', shown: true, reasons: [13, 15] },
  { id: 3, who: 'Priya Raman', title: 'Payroll Specialist', phone: '(815) 555-0187', shown: true, reasons: [7, 8, 9, 10] },
  { id: 4, who: 'Marisol Ortega', title: 'HR - Bright HR Ltd', phone: '(312) 555-0446', shown: true, reasons: [11, 12, 13] },
  { id: 5, who: 'Fleet coordinator', title: 'Station line', phone: '+1 815 555 0142', shown: false, reasons: [2, 15, 14] },
]

// Station lines come from Connections → Phone lines; the phone field suggests
// them rather than making the owner retype a number.
export const STATION_LINES = [
  { name: 'DBO1', number: '+1 815 555 0100' },
  { name: 'DBO1-Rescue', number: '+1 815 555 0142' },
]

export const EXPORT_FORMATS = ['CSV', 'XLSX']

export const CHIP_LIMIT = 4 // reason chips shown on a directory row before "+n"
export const CHOSEN_LIMIT = 3 // chosen chips shown in the form before "+n …"

export const REASONS_HELP =
  'A reason with no contact is never shown to a driver. Dashed = nobody visible covers it. ' +
  'Urgent reasons pin to the top of the Help screen. Retiring keeps it on its contacts, greyed — there is no delete.'

export const TITLE_HELP =
  'Free text — what they do at the company, not one of the five UDSP posts.'
