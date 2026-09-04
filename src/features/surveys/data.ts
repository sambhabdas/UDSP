// Seed for Surveys, from Surveys.dc.html and SurveyMaker.dc.html.
//
// A survey is a question a driver answers on the phone app. The station never
// sees who gave an anonymous answer - that promise is made at build time and
// restated every time the survey is sent.

export type SurveyStatus = 'Active' | 'Draft' | 'Archived'

/** A question as the seed spells it - the kind string still carries its
 *  follow-up and optional markers; the maker normalises those away. */
export interface SeedQuestion {
  text: string
  kind: string
  required: boolean
  options?: string[]
  scale?: number
}

export interface Survey {
  id: string
  name: string
  type: string
  fires: string
  qs: number
  resp: string
  respMuted: boolean
  answers: 'named' | 'anonymous'
  status: SurveyStatus
  responses: number
  who: string
  firesSetting: string
  reminder: string
  questions: SeedQuestion[]
  /** Why the response count is empty, shown on the row's title. */
  hoverNote?: string
}

export const SEED_SURVEYS: Survey[] = [
  {
    id: 'route-end',
    name: 'End of route',
    type: 'Route-end',
    fires: 'When a route closes on RTS',
    qs: 6,
    resp: '156',
    respMuted: false,
    answers: 'named',
    status: 'Active',
    responses: 156,
    who: 'The driver on that route',
    firesSetting: 'When a route closes',
    reminder: 'Once, next morning',
    questions: [
      { text: 'How did the route go?', kind: 'Rating 1-5', required: true },
      { text: 'Did you finish on time?', kind: 'Yes / No', required: true },
      { text: 'Any problem with the van?', kind: 'Yes / No + follow-up', required: true },
      { text: 'Any problem with the route?', kind: 'Yes / No + follow-up', required: false },
      { text: 'Anything the station should know?', kind: 'Long text', required: false },
      { text: 'Photo of anything we should see', kind: 'Photo, optional', required: false },
    ],
  },
  {
    id: 'weekly',
    name: 'Weekly pulse',
    type: 'Weekly',
    fires: 'Fridays 18:00, station time',
    qs: 5,
    resp: '15',
    respMuted: false,
    answers: 'anonymous',
    status: 'Active',
    responses: 15,
    who: 'Everyone on the roster',
    firesSetting: 'Fridays 18:00, station time',
    reminder: 'Once after 2 days',
    questions: [
      { text: 'How was this week overall?', kind: 'Rating 1-5', required: true },
      { text: 'Do you feel safe on your routes?', kind: 'Rating 1-5', required: true },
      { text: 'Is dispatch communication clear?', kind: 'Rating 1-5', required: false },
      { text: 'One thing we should keep doing', kind: 'Short text', required: false },
      { text: 'One thing we should change', kind: 'Short text', required: false },
    ],
  },
  {
    id: 'newhire',
    name: 'New hire week 1',
    type: 'New hire',
    fires: 'First 5 routes only',
    qs: 4,
    resp: '',
    respMuted: true,
    answers: 'named',
    status: 'Draft',
    responses: 0,
    hoverNote: 'Has not been sent yet',
    who: 'New hires on their first 5 routes',
    firesSetting: 'First 5 routes only',
    reminder: 'None',
    questions: [
      { text: 'Was your onboarding clear?', kind: 'Yes / No', required: true },
      { text: 'Did your trainer answer your questions?', kind: 'Yes / No', required: true },
      { text: 'How confident do you feel?', kind: 'Rating 1-5', required: true },
      { text: 'What almost tripped you up today?', kind: 'Short text', required: false },
    ],
  },
  {
    id: 'peak',
    name: 'Peak season check-in',
    type: 'Weekly',
    fires: 'Ended Jan 6, 2026',
    qs: 7,
    resp: '412 total',
    respMuted: true,
    answers: 'anonymous',
    status: 'Archived',
    responses: 412,
    who: 'Everyone on the roster',
    firesSetting: 'Ended Jan 6, 2026',
    reminder: 'Once after 2 days',
    questions: [
      { text: 'How manageable was this week’s volume?', kind: 'Rating 1-5', required: true },
      { text: 'Were your routes fairly loaded?', kind: 'Rating 1-5', required: true },
      { text: 'Did you get your breaks?', kind: 'Yes / No', required: true },
      { text: 'How is your energy level?', kind: 'Rating 1-5', required: false },
      { text: 'Any safety concerns this week?', kind: 'Yes / No + follow-up', required: true },
      { text: 'What would make peak easier?', kind: 'Long text', required: false },
      { text: 'Anything else?', kind: 'Long text', required: false },
    ],
  },
]

// A driver with no Ultimate DA account cannot receive a survey at all.
export interface RosterEntry {
  id: number
  name: string
  band: string
  /** A driver with no Ultimate DA account cannot receive a survey at all. */
  app: boolean
}

export const ROSTER: RosterEntry[] = [
  { id: 1, name: 'ALVARENGA, C', band: 'Step Van', app: true },
  { id: 2, name: 'ASUTAY, YUSUF', band: 'DOT Step Van', app: true },
  { id: 3, name: 'DIAZ, DAVID', band: 'Step Van', app: true },
  { id: 4, name: 'GARCIA, ANDY', band: 'CDV', app: false },
  { id: 5, name: 'MENDEZ, GABRIEL', band: 'Large Van', app: true },
  { id: 6, name: 'RAIGOSA, O', band: 'Step Van', app: true },
  { id: 7, name: 'SHAW, KELLY', band: 'CDV', app: false },
  { id: 8, name: 'WOODS, TANYA', band: 'Step Van', app: true },
]

export interface Kpi {
  label: string
  value: string
  sub: string
  color: string
}

export const KPIS: Kpi[] = [
  { label: 'Active surveys', value: '2', sub: 'collecting right now', color: 'var(--text-primary)' },
  { label: 'Responses · 7 days', value: '171', sub: 'across both surveys', color: 'var(--text-primary)' },
  { label: 'Route-end completion', value: '84%', sub: '156 of 186 routes', color: 'var(--success-fg)' },
  { label: 'Weekly completion', value: '47%', sub: '15 of 32 drivers', color: 'var(--warning-fg)' },
]

export const STATUS_TONE: Record<SurveyStatus, { dot: string; fg: string }> = {
  Active: { dot: 'var(--success-accent)', fg: 'var(--success-fg)' },
  Draft: { dot: 'var(--neutral-400)', fg: 'var(--text-secondary)' },
  Archived: { dot: 'var(--neutral-400)', fg: 'var(--text-secondary)' },
}

// Audiences resolve at send time, not at pick time - "everyone who ran today"
// is a question asked when the send fires.
export type AudienceId = 'roster' | 'pick' | 'today'

export interface Audience {
  id: AudienceId
  label: string
  count?: number
  of?: number
  ofText?: string
  excluded?: number
}

export const AUDIENCES: Audience[] = [
  { id: 'roster', label: 'Everyone on the roster', count: 32, of: 36, ofText: 'of 36 active on the roster', excluded: 4 },
  { id: 'pick', label: 'Choose drivers' },
  { id: 'today', label: 'Everyone who ran today', count: 22, of: 24, ofText: 'of 24 who ran today, resolved at send time', excluded: 2 },
]

export const WHENS = ['Now', 'Schedule for…']

// ---- Survey Maker ---------------------------------------------------------

export type QuestionKind =
  | 'Rating'
  | 'Yes / No'
  | 'Choice'
  | 'Short text'
  | 'Long text'
  | 'Photo'
  | 'Number'

export const KINDS: QuestionKind[] = ['Rating', 'Yes / No', 'Choice', 'Short text', 'Long text', 'Photo', 'Number']

export type TriggerId = 'route' | 'weekly' | 'newhire' | 'manual'

export const TRIGGERS: { id: TriggerId; label: string; audience: string }[] = [
  { id: 'route', label: 'When a route ends', audience: 'The driver who ran it, at close' },
  { id: 'weekly', label: 'Every week', audience: 'Everyone on the roster · Fridays 18:00, station time' },
  { id: 'newhire', label: "A new hire's first routes", audience: 'Their first 5 routes only' },
  { id: 'manual', label: 'Only when I send it', audience: 'Pick the drivers each time' },
]

export const REMINDERS = ['None', 'Once, the next morning', 'Once after 2 days']

export const TRIGGER_CONTEXT: Record<TriggerId, string> = {
  route: 'CX252 · closed 19:41',
  weekly: 'Friday 18:00 · station time',
  newhire: 'Route 3 of 5',
  manual: 'Sent by the station',
}

export interface Template {
  trigger: TriggerId
  attribution: 'Named' | 'Anonymous'
  reminder: string
  questions: SeedQuestion[]
}

export const TEMPLATES: Record<string, Template> = {
  'End of route': {
    trigger: 'route',
    attribution: 'Named',
    reminder: 'Once, the next morning',
    questions: [
      { text: 'How did the route go?', kind: 'Rating', required: true, scale: 5 },
      { text: 'Did you finish on time?', kind: 'Yes / No', required: true },
      { text: 'Any problem with the van?', kind: 'Yes / No', required: true },
      { text: 'Anything the station should know?', kind: 'Long text', required: false },
    ],
  },
  'Weekly pulse': {
    trigger: 'weekly',
    attribution: 'Anonymous',
    reminder: 'Once after 2 days',
    questions: [
      { text: 'How was this week overall?', kind: 'Rating', required: true, scale: 5 },
      { text: 'Do you feel safe on your routes?', kind: 'Rating', required: true, scale: 5 },
      { text: 'One thing we should change', kind: 'Short text', required: false },
    ],
  },
  'New hire week 1': {
    trigger: 'newhire',
    attribution: 'Named',
    reminder: 'None',
    questions: [
      { text: 'Was your onboarding clear?', kind: 'Yes / No', required: true },
      { text: 'How confident do you feel?', kind: 'Rating', required: true, scale: 5 },
      { text: 'What almost tripped you up today?', kind: 'Short text', required: false },
    ],
  },
}

export const NOT_SENT_TWICE = 'A driver already holding an unanswered copy is not sent a second one.'
export const ANON_WARNING =
  'Because this survey is anonymous, you will see answers but never who gave them.'
export const ATTRIBUTION_NOTE =
  'Named answers carry the driver and their route. Anonymous answers never do.'
export const NO_APP_NOTE =
  'They have no Ultimate DA account, so they are excluded from the send and the count.'
