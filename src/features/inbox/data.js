// Avatar tinting and initials are DS-level rules — see ds/avatar.js.
export { initials, tint } from '../../ds/avatar.js'

// Seed for the Inbox portal.
//
// The shape and the values come straight from Inbox.dc.html's `seed()` — the
// design file is the specification of record, so the people, timelines and
// counts are reproduced verbatim rather than re-invented.

const person = (id, name, extra) => ({
  id,
  name,
  role: 'DA · Station DBO1',
  phone: '+1 (555) 012-3345',
  email: id + '@mail.com',
  tid: 'TR-88F2K1',
  tenure: '14 mo',
  onRoute: false,
  route: null,
  score: 12,
  atRisk: false,
  tier: 'Tier 1',
  blocked: false,
  openEvents: 0,
  coaching: '—',
  unread: 0,
  missed: false,
  timeline: [],
  tasks: [],
  doneTasks: [],
  ...extra,
})

export function seedPeople() {
  return [
    person('marcus', 'Marcus Johnson', {
      onRoute: true,
      route: 'RT-12 · Van 114',
      score: -85,
      atRisk: true,
      tier: 'Tier 3',
      blocked: true,
      openEvents: 3,
      coaching: '1 (due 2 d)',
      phone: '+1 (555) 012-3345',
      email: 'marcus.j@mail.com',
      tasks: [
        { label: 'Rescue pickup — stops 41–60', status: 'assigned', done: false },
        { label: 'RTS check-in · 17:30', status: 'pending', done: false },
      ],
      last: { ch: 'text', snip: "Van won't start at stop 41", t: '2m' },
      timeline: [
        { k: 'date', text: 'Yesterday' },
        { k: 'in', text: 'Ended route, van parked', time: '18:22' },
        { k: 'out', text: 'Great work today', time: '18:30' },
        { k: 'date', text: 'Today' },
        { k: 'sys', text: '09:02 · Route RT-12 assigned via Dispatch' },
        { k: 'in', text: "Van won't start at stop 41 — need help", time: '09:31' },
        { k: 'call', text: 'Outbound call · 2:34 · answered' },
        {
          k: 'email',
          dir: 'out',
          text: 'Rescue confirmation',
          sub: 'Rescue driver Sam Rivera is picking up stops 41–60. Stay with the van until he arrives.',
        },
        { k: 'note', text: 'Note · prefers text over call — JD' },
        { k: 'out', text: 'Rescue is on the way — stay put at stop 41', time: '09:41' },
        { k: 'in', text: 'ok thank you', time: '09:42' },
      ],
    }),
    person('aisha', 'Aisha Karim', {
      last: { ch: 'call', snip: 'Missed call · no message', t: '9m', miss: true },
      unread: 1,
      missed: true,
      score: 44,
      timeline: [
        { k: 'date', text: 'Today' },
        { k: 'call', text: 'Inbound call · missed' },
      ],
    }),
    person('dev', 'Dev Patel', {
      last: { ch: 'email', snip: 'Re: schedule swap', t: '22m' },
      unread: 2,
      score: 31,
      timeline: [
        { k: 'date', text: 'Today' },
        { k: 'email', text: 'Re: schedule swap', sub: 'Can I move Thursday to Friday?' },
      ],
    }),
    person('sam', 'Sam Rivera', {
      onRoute: true,
      route: 'RT-4 · Van 102',
      last: { ch: 'text', snip: 'Got it, heading back', t: '1h' },
      score: 58,
      timeline: [
        { k: 'date', text: 'Today' },
        { k: 'out', text: 'Bring the van to bay 2 when you land', time: '13:05' },
        { k: 'in', text: 'Got it, heading back', time: '13:12' },
      ],
    }),
    person('tanya', 'Tanya Woods', {
      last: { ch: 'call', snip: 'Call · 3:12', t: '2h' },
      score: 25,
      timeline: [
        { k: 'date', text: 'Today' },
        { k: 'call', text: 'Outbound call · 3:12 · answered' },
      ],
    }),
    person('luis', 'Luis Mora', {
      last: { ch: 'text', snip: 'Left keys in the lockbox', t: '4h' },
      score: 40,
      timeline: [
        { k: 'date', text: 'Today' },
        { k: 'in', text: 'Left keys in the lockbox', time: '10:04' },
      ],
    }),
    person('priya', 'Priya Nair', {
      last: { ch: 'email', snip: 'Timesheet question', t: '1d' },
      score: 66,
      timeline: [
        { k: 'date', text: 'Yesterday' },
        { k: 'email', text: 'Timesheet question', sub: 'Tuesday shows 7.5 h — should be 9' },
      ],
    }),
    person('omar', 'Omar Diallo', {
      last: { ch: 'text', snip: 'Running 10 late', t: '1d' },
      score: 18,
      timeline: [
        { k: 'date', text: 'Yesterday' },
        { k: 'in', text: 'Running 10 late', time: '07:48' },
        { k: 'out', text: 'Noted — wave 2 holds for you', time: '07:52' },
      ],
    }),
    person('kelly', 'Kelly Shaw', {
      last: { ch: 'call', snip: 'Call · 0:47', t: '2d' },
      score: 51,
      timeline: [],
    }),
    person('jordan', 'Jordan Fox', {
      last: { ch: 'email', snip: 'PTO request', t: '2d' },
      score: 37,
      timeline: [{ k: 'email', text: 'PTO request', sub: 'Aug 21–22, family trip' }],
    }),
  ]
}

// The channel chips map onto activity kinds; `All` clears the selection.
export const CHANNEL_KINDS = {
  Texts: ['in', 'out'],
  Calls: ['call'],
  Emails: ['email'],
  Notes: ['note'],
  System: ['sys'],
}

export const FILTERS = ['All', 'Unread', 'Missed']
export const CHANNELS = ['All', 'Texts', 'Calls', 'Emails', 'Notes', 'System']
export const COMPOSER_TABS = ['Text', 'Email', 'Note']
export const EMOJIS = ['👍', '🙏', '😀', '😅', '🎉', '❤️', '🚚', '✅']

// The station's designated SMS line — Connections → Phone lines (Inbox §3.3).
export const STATION_LINE = 'from: DBO1 · +1 (312) 555-6921'
