// The Dialer's seed, lifted from Dialer.dc.html. Everything the widget shows —
// lines, people, call history, message threads — is fixed data; nothing here is
// generated, so the server and the client render the same thing.

import { env } from '../../config/env'

export interface Line {
  id: string
  num: string
}

/** Somebody the dialer can reach. `route` is set only while they are out. */
export interface Person {
  name: string
  num: string
  active?: boolean
  route?: string | null
}

export type CallDirection = 'in' | 'out' | 'missed'

export interface HistoryEntry {
  name: string
  num: string
  dir: CallDirection
  outcome: string
  meta: string
  when: string
}

export interface Thread {
  name: string
  snippet: string
  when: string
  unread: boolean
}

export interface ChatMsg {
  /** Inbound is theirs, outbound is ours. The design file carries both flags. */
  isIn: boolean
  text: string
  time: string
}

export const LINES: Line[] = [
  { id: env.stationCode, num: env.stationPhone },
  { id: 'DBO2', num: '+1 (312) 555-7404' },
]

export const ROSTER: Person[] = [
  { name: 'ALVARENGA, C', num: '310-555-2210', active: true, route: null },
  { name: 'ASUTAY, YUSUF', num: '310-555-8841', active: true, route: 'On route · RT-07 · Van 108 · as of 14:41' },
  { name: 'DIAZ, DAVID', num: '310-555-6583', active: true, route: 'On route · RT-12 · Van 114 · as of 14:41' },
  { name: 'GARCIA, ANDY', num: '310-555-3327', active: false, route: null },
  { name: 'MENDEZ, GABRIEL', num: '310-555-9016', active: true, route: null },
  { name: 'RAIGOSA, O', num: '310-555-4478', active: true, route: 'On route · RT-03 · Van 121 · as of 14:41' },
  { name: 'SHAW, KELLY', num: '310-555-7752', active: true, route: null },
  { name: 'WOODS, TANYA', num: '310-555-1183', active: true, route: null },
]

export const TEAM: Person[] = [
  { name: 'Ana Torres', num: '312-555-0144' },
  { name: 'Devon Blake', num: '312-555-0192' },
]

export const NAMED_CONTACTS: Person[] = [
  { name: 'Route Ready Tires', num: '312-555-4610' },
  { name: 'Midway Fleet Service', num: '312-555-2280' },
]

export const HISTORY: HistoryEntry[] = [
  { name: 'DIAZ, DAVID', num: '3105556583', dir: 'out', outcome: 'answered', meta: 'Outbound · answered · 04:12', when: '22 min' },
  { name: 'MENDEZ, GABRIEL', num: '3105559016', dir: 'in', outcome: 'answered', meta: 'Inbound · answered · 01:30', when: '1 h' },
  { name: '+1 310-555-0187', num: '3105550187', dir: 'missed', outcome: 'missed', meta: 'Inbound · missed', when: '2 h' },
  { name: 'WOODS, TANYA', num: '3105551183', dir: 'out', outcome: 'voicemail', meta: 'Outbound · voicemail', when: '3 h' },
  { name: 'Route Ready Tires', num: '3125554610', dir: 'out', outcome: 'answered', meta: 'Outbound · answered · 02:05', when: 'Yesterday' },
  { name: 'ASUTAY, YUSUF', num: '3105558841', dir: 'in', outcome: 'answered', meta: 'Inbound · answered · 00:48', when: 'Yesterday' },
]

export const THREADS: Thread[] = [
  { name: 'DIAZ, DAVID', snippet: 'Left the package at the dock door, photo attached', when: '12 min', unread: true },
  { name: 'MENDEZ, GABRIEL', snippet: 'Running 10 late from lunch', when: '1 h', unread: true },
  { name: 'Ana Torres', snippet: 'Can you cover DBO2 till 15:00?', when: '2 h', unread: false },
  { name: 'WOODS, TANYA', snippet: 'Van 121 tire light is on again', when: 'Yesterday', unread: false },
  { name: 'RAIGOSA, O', snippet: 'Got it, heading back now', when: 'Yesterday', unread: false },
]

export const CHAT_SEED: Record<string, ChatMsg[]> = {
  'DIAZ, DAVID': [
    { isIn: true, text: 'Dock gate was locked, went around back', time: '13:58' },
    { isIn: false, text: 'Good call. Photo the drop for the record', time: '14:02' },
    { isIn: true, text: 'Left the package at the dock door, photo attached', time: '14:29' },
  ],
  'MENDEZ, GABRIEL': [
    { isIn: false, text: 'You good to be back by 13:30?', time: '13:04' },
    { isIn: true, text: 'Running 10 late from lunch', time: '13:41' },
  ],
  'Ana Torres': [
    { isIn: true, text: 'Can you cover DBO2 till 15:00?', time: '12:36' },
    { isIn: false, text: 'On it', time: '12:38' },
  ],
  'WOODS, TANYA': [
    { isIn: true, text: 'Van 121 tire light is on again', time: 'Yesterday 17:12' },
    { isIn: false, text: 'Swing by the shop before load out tomorrow', time: 'Yesterday 17:20' },
  ],
  'RAIGOSA, O': [
    { isIn: false, text: 'Last stop cancelled, RTS when done', time: 'Yesterday 16:02' },
    { isIn: true, text: 'Got it, heading back now', time: 'Yesterday 16:05' },
  ],
}

/** The 3×4 pad. `✱` and `#` dial but do not count toward the ten digits. */
export const KEY_DEFS: [string, string][] = [
  ['1', 'voicemail'], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['✱', ''], ['0', ''], ['#', ''],
]

export const EVERYONE = (): Person[] => [...TEAM, ...ROSTER, ...NAMED_CONTACTS]

/** Avatar tints, picked from the name so a person keeps their colour. */
const TINTS: [string, string][] = [
  ['var(--blue-100)', 'var(--blue-700)'],
  ['var(--green-100)', 'var(--green-700)'],
  ['var(--yellow-100)', 'var(--yellow-700)'],
  ['var(--red-100)', 'var(--red-700)'],
]

export function tint(name: string): [string, string] {
  const sum = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return TINTS[sum % TINTS.length]
}

export function initials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** 3-3-4 as you type; the field never shows a half-formed separator. */
export function fmtNum(d: string): string {
  if (!d) return ''
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

export function mmss(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}

/** A number the address book knows gets its name; anything else stays a number. */
export function matchName(num: string): string {
  const hit = EVERYONE().find((p) => p.num.replace(/\D/g, '') === num)
  return hit ? hit.name : `+1 ${fmtNum(num)}`
}

/** Strip to ten digits, tolerating a leading country code and any punctuation. */
export function tenDigits(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10)
}
