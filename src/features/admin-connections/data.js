// Seed for Admin · Connections, from AdminConnections.dc.html.
//
// Three things UDSP plugs into, and none of them overlap: the PUNCH API brings
// worked hours in, the MAILBOX sends and receives email in the Inbox, and PHONE
// LINES carry text and calls. Losing one never degrades the others.

export const TABS = [
  { id: 'punch', label: 'Punch API' },
  { id: 'mail', label: 'Mailbox' },
  { id: 'lines', label: 'Phone lines' },
]

// ---- punch ----------------------------------------------------------------

export const PROVIDERS = ['Paycom', 'ADP', 'Not connected']
export const ENVIRONMENTS = ['Production', 'Sandbox']
export const INTERVALS = ['Every 15 min', 'Every 30 min', 'Every hour']

// The two the file import cannot supply — the reason the API is worth wiring.
export const PUNCH_FIELDS = [
  'ee_code',
  'date',
  'punch_in',
  'punch_out',
  'break_minutes',
  'worked_hours',
  'ot_hours',
  'labor_code (optional)',
]
export const API_ONLY_FIELDS = ['worked_hours', 'ot_hours']

export const PUNCH_READS = [
  { label: 'Compliance', text: "Day-scoped. Today's board, re-read all day." },
  { label: 'Associates - Timecard', text: 'Period-keyed. The pay period, per DA, per day.' },
]

// ---- mailbox --------------------------------------------------------------

export const MAIL_PROVIDERS = [
  { name: 'Google Workspace', sub: 'OAuth - no password stored' },
  { name: 'Microsoft 365', sub: 'OAuth - no password stored' },
  { name: 'IMAP / SMTP', sub: 'Host, port, username, app password' },
]

export const IMAP = 'IMAP / SMTP'
export const SYNC_WINDOWS = ['Last 30 days', 'Last 90 days', 'Everything']

export const MAIL_SCOPE_NOTE =
  'Read-only scope is not enough - UDSP sends as well as reads. Without a mailbox the Inbox Email tab is disabled; text and calls are unaffected.'

// ---- phone lines ----------------------------------------------------------

// Ring-group members are portal users. A driver never rings.
export const USER_POOL = [
  ['Dana Whitfield', 'Available'],
  ['Priya Raman', 'Available'],
  ['Marcus Bell', 'Away'],
  ['Elena Cruz', 'Available'],
  ['Tommy Nguyen', 'On a call'],
  ['Gene Park', 'Away'],
]

export const PRESENCE_DOT = {
  Available: 'var(--success-accent)',
  'On a call': 'var(--warning-accent)',
  Away: 'var(--neutral-400)',
}

export const GREETINGS = ['Record', 'Upload', 'Text to speech']
export const TTS = 'Text to speech'
export const ASSIGN_KINDS = ['Dispatch', 'Rescue', 'User']

// Numbers the provider has available but nobody holds yet.
export const NUMBER_POOL = [
  '+1 815 555 0177',
  '+1 815 555 0189',
  '+1 312 555 0158',
  '+1 630 555 0171',
]

export const SEED_LINES = [
  {
    id: 1,
    name: 'DBO1',
    number: '+1 815 555 0100',
    noAnswer: 'Voicemail',
    vm: 'Greeting set',
    isDefault: true,
    greeting: TTS,
    callerId: 'DBO1 Dispatch',
    assigned: 'Dispatch',
    members: [
      { name: 'Elena Cruz', status: 'Available' },
      { name: 'Tommy Nguyen', status: 'On a call' },
      { name: 'Marcus Bell', status: 'Away' },
    ],
    greetScript: 'You have reached Cedar Ridge dispatch. Leave a message.',
  },
  {
    id: 2,
    name: 'DBO1-Rescue',
    number: '+1 815 555 0142',
    noAnswer: 'Forward to DBO1',
    vm: 'Default greeting',
    isDefault: false,
    greeting: TTS,
    callerId: 'DBO1 Rescue',
    assigned: 'Rescue',
    members: [
      { name: 'Elena Cruz', status: 'Available' },
      { name: 'Dana Whitfield', status: 'Available' },
    ],
    greetScript: 'You have reached Cedar Ridge rescue. Leave a message.',
  },
]

export const SEED_RESERVED = [
  { number: '+1 815 555 0163', since: '06/02' },
  { number: '+1 312 555 0146', since: '07/18' },
]

export const RESERVE_STAMP = '08/17'

export const LINE_HEADS = [
  { k: 'name', label: 'Line', flex: 1, min: 110 },
  { k: 'number', label: 'Number', w: 120 },
  { k: 'assigned', label: 'Assigned to', w: 110 },
  { k: 'na', label: 'No answer', w: 120 },
  { k: 'default', label: 'Default', w: 56 },
  { k: null, label: 'Actions', w: 56, center: true },
]

export const WHY = {
  alreadyDefault: 'Already the default.',
  defaultUndeletable: 'The default line cannot be deleted.',
}

export const DELETE_BODY =
  'Call history is kept. The ring group is emptied. The number is released back to the provider and cannot be reclaimed.'

export const RELEASE_BODY = 'The number returns to the provider and cannot be reclaimed.'

export const INFO = {
  provider:
    'One intake. Choosing one replaces the other - the old credentials are discarded and the next refresh comes from the new system.',
  apiKey: 'Write-only. Once saved it renders as dots and can be replaced, never read back.',
  fields: 'Matched on Paycom EE code. Never creates a roster record. No dollars - pay rates are on the roster.',
  mailbox:
    'Sends and receives email in the Inbox Email tab. Nothing else - SMS and calls go out through a station phone line. A disconnect keeps every message already in the Inbox.',
  senderName: 'What recipients see on outgoing email from the Inbox.',
  syncHistory: 'How far back the first sync pulls mail into the Inbox.',
  callerId: "What the driver's phone shows, so they answer instead of screening an unknown number.",
  ringGroup: 'Members are portal users, never drivers. A DA never rings.',
}

export const BANNER = {
  punchOn: (provider, env) => `Connected - ${provider} · ${env} · connected Jun 2 by Dana Whitfield`,
  punchOff:
    'Not connected - punch times still land from the Compliance file import. Worked hours and overtime arrive only with the API.',
  mailOn: (addr) => `Connected - ${addr} · connected May 12 by Dana Whitfield`,
  mailOff: 'Not connected - the Inbox Email tab is disabled. Text and calls are unaffected.',
  lines: (n) => `Connected - ${n} ${n === 1 ? 'line' : 'lines'} · provider Twilio · connected Apr 3 by Dana Whitfield`,
}
