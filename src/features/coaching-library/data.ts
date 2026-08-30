// Coaching Library — the modules a coaching assignment actually delivers, and
// the videos and quizzes they are built from.

export interface Module {
  name: string
  video: string | null
  dur: string
  quiz: string | null
  quizMeta: string | null
  /** [standard, category] — a module is paired to at most one standard. */
  pairs: [string, string][]
  d30: number
  compl: number | null
  active: boolean
  draft?: boolean
  retired?: boolean
  desc?: string
  ack?: string
}

export const SEED_MODULES: Module[] = [
  { name: 'Seatbelt Safety 101', video: 'Buckle Up Every Trip', dur: '4:12', quiz: 'Seatbelt Basics Quiz', quizMeta: '5 questions · Pass 4/5', pairs: [['Seatbelt', 'Safety']], d30: 6, compl: 83, active: true },
  { name: 'Safe Speed Coaching', video: 'Speed and Stopping Distance', dur: '6:05', quiz: 'Speed Rules Quiz', quizMeta: '5 questions · Pass 4/5', pairs: [['Speeding', 'Safety']], d30: 9, compl: 78, active: true },
  { name: 'Distraction-Free Driving', video: 'Eyes on the Road', dur: '5:24', quiz: 'Distraction Quiz', quizMeta: '4 questions · Pass 3/4', pairs: [['Distractions', 'Safety']], d30: 5, compl: 80, active: true },
  { name: 'Safe Following Distance', video: 'The Four Second Rule', dur: '3:48', quiz: 'Following Distance Quiz', quizMeta: '4 questions · Pass 4/4', pairs: [['Following Distance', 'Safety']], d30: 4, compl: 100, active: true },
  { name: 'Delivery Distance Rules', video: 'Deliver to the Door', dur: '4:55', quiz: 'DSB Rules Quiz', quizMeta: '6 questions · Pass 5/6', pairs: [['Delivered Over 50 Meters', 'DSB']], d30: 3, compl: 67, active: true },
  { name: 'Package Handling Basics', video: 'Handle With Care', dur: '5:10', quiz: 'Handling Quiz', quizMeta: '5 questions · Pass 4/5', pairs: [['Mishandled Package', 'CDF']], d30: 7, compl: 86, active: true },
  { name: 'Attendance Matters', video: 'Show Up Strong', dur: '2:58', quiz: 'Attendance Quiz', quizMeta: '3 questions · Pass 3/3', pairs: [['Unexcused Absence', 'Work Ethics']], d30: 2, compl: 50, active: true },
  { name: 'Damage Prevention', video: 'Protect the Van', dur: '7:02', quiz: 'Damage Quiz', quizMeta: '5 questions · Pass 4/5', pairs: [['Damage', 'Work Ethics']], d30: 4, compl: 75, active: true },
  { name: 'Peak Season Prep', video: 'Peak Week Playbook', dur: '8:15', quiz: null, quizMeta: null, pairs: [], d30: 1, compl: 100, active: false, draft: true },
  { name: 'Winter Driving', video: 'Ice and Snow Basics', dur: '6:40', quiz: 'Winter Quiz', quizMeta: '4 questions · Pass 3/4', pairs: [], d30: 0, compl: null, active: false, retired: true },
]

export interface Video {
  title: string
  dur: string
  cat: string
  /** How many modules use it; 0 means it is sitting unused. */
  used: number
  broken?: boolean
}

export const VIDEOS: Video[] = [
  { title: 'Buckle Up Every Trip', dur: '4:12', cat: 'Safety', used: 1 },
  { title: 'Speed and Stopping Distance', dur: '6:05', cat: 'Safety', used: 1 },
  { title: 'Eyes on the Road', dur: '5:24', cat: 'Safety', used: 1 },
  { title: 'The Four Second Rule', dur: '3:48', cat: 'Safety', used: 1 },
  { title: 'Deliver to the Door', dur: '4:55', cat: 'DSB', used: 1, broken: true },
  { title: 'Handle With Care', dur: '5:10', cat: 'CDF', used: 1 },
  { title: 'Show Up Strong', dur: '2:58', cat: 'Work Ethics', used: 1 },
  { title: 'Protect the Van', dur: '7:02', cat: 'Work Ethics', used: 1 },
  { title: 'Peak Week Playbook', dur: '8:15', cat: 'Helping PT', used: 1 },
  { title: 'Loading Dock Walkthrough', dur: '3:20', cat: 'Station', used: 0 },
  { title: 'Old Seatbelt Training 2024', dur: '5:45', cat: 'Safety', used: 0 },
]

export interface Quiz {
  name: string
  questions: number
  pass: string
  used: string
  avg: number
}

export const QUIZZES: Quiz[] = [
  { name: 'Seatbelt Basics Quiz', questions: 5, pass: '4/5', used: 'Seatbelt Safety 101', avg: 92 },
  { name: 'Speed Rules Quiz', questions: 5, pass: '4/5', used: 'Safe Speed Coaching', avg: 84 },
  { name: 'Distraction Quiz', questions: 4, pass: '3/4', used: 'Distraction-Free Driving', avg: 88 },
  { name: 'Following Distance Quiz', questions: 4, pass: '4/4', used: 'Safe Following Distance', avg: 95 },
  { name: 'DSB Rules Quiz', questions: 6, pass: '5/6', used: 'Delivery Distance Rules', avg: 76 },
  { name: 'Handling Quiz', questions: 5, pass: '4/5', used: 'Package Handling Basics', avg: 89 },
]

/** The template questions a quiz opens with when you edit an existing one. */
export const SEED_QUESTIONS: { text: string; options: string[]; correct: number }[] = [
  { text: 'When must the seatbelt be on?', options: ['Only on highways', 'Any time the van is moving', 'Only above 25 mph', 'When a trainer rides along'], correct: 1 },
  { text: 'What do you do before reversing?', options: ['Honk twice and go', 'Check mirrors and back slowly'], correct: 1 },
  { text: 'A dog is loose at the stop. What first?', options: ['Deliver anyway', 'Stay in the van and mark the stop', 'Call the customer from the doorstep'], correct: 1 },
  { text: 'How often are seatbelt checks run?', options: ['Weekly', 'Every trip', 'Monthly'], correct: 1 },
  { text: 'Who is responsible for passenger belts?', options: ['The passenger', 'The driver', 'Dispatch'], correct: 1 },
]

export const CATS = ['Safety', 'DSB', 'CDF', 'DVIC', 'Work Ethics', 'Helping PT', 'Station']

export const DAS = [
  'Marcus Webb', 'Tina Alvarez', 'Jorge Ruiz', 'Dana Kim', 'Leah Grant', 'Chris Boone',
  'Omar Haddad', 'Nina Torres', 'David Park', 'Maria Lopez', 'Sam Ortiz', 'Alex Chen', 'Priya Shah',
]

/** Standards with no module yet — what "Link Standard" can choose from. */
export const STD_POOL: [string, string][] = [
  ['Sign and Signal', 'Safety'], ['DVIC Not Done', 'DVIC'], ['DVIC Under 90 Seconds', 'DVIC'],
  ['Violence', 'Work Ethics'], ['Order Refusal', 'Work Ethics'], ['Intentional Wrong Punch', 'Work Ethics'],
  ['Staging Errors', 'Station'], ['Late Van Return', 'Station'],
]

export const GAPS = ['Sign and Signal', 'Violence', 'Order Refusal', 'Intentional Wrong Punch', 'DVIC Not Done']

export const SEED_ARCHIVED: Record<string, boolean> = { 'Old Seatbelt Training 2024': true }

export function catTone(c: string): { bg: string; fg: string } {
  if (c === 'Safety') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)' }
  if (c === 'DSB') return { bg: 'var(--blue-50)', fg: 'var(--blue-700)' }
  if (c === 'CDF') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }
  if (c === 'Helping PT') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)' }
}

const THUMB_PAIRS: Record<string, [string, string]> = {
  Safety: ['#991B1B', '#FCA5A5'],
  DSB: ['#1E3A8A', '#60A5FA'],
  CDF: ['#92400E', '#FBBF24'],
  DVIC: ['#475569', '#94A3B8'],
  'Work Ethics': ['#92400E', '#D97706'],
  'Helping PT': ['#065F46', '#6EE7B7'],
  Station: ['#1E40AF', 'var(--blue-300)'],
}

/**
 * A video's poster frame. Variants 0–3 are generated from the category's own
 * two colours; variant 4 is the neutral fill that stands in for an upload.
 */
export function thumbCss(cat: string, variant = 0): string {
  const p = THUMB_PAIRS[cat] ?? ['#1E3A8A', '#60A5FA']
  if (variant === 4) return 'linear-gradient(135deg, #111827, #475569)'
  if (variant === 3) return `radial-gradient(circle at 30% 30%, ${p[1]}, ${p[0]})`
  return `linear-gradient(${[135, 45, 205, 315][variant]}deg, ${p[0]}, ${p[1]})`
}

const ADDED: Record<string, string> = {
  'Buckle Up Every Trip': 'Jun 2, 2026', 'Speed and Stopping Distance': 'Jun 2, 2026',
  'Eyes on the Road': 'Jun 9, 2026', 'The Four Second Rule': 'Jun 9, 2026',
  'Deliver to the Door': 'Jun 24, 2026', 'Handle With Care': 'Jul 3, 2026',
  'Show Up Strong': 'Jul 3, 2026', 'Protect the Van': 'Jul 15, 2026',
  'Peak Week Playbook': 'Aug 1, 2026', 'Loading Dock Walkthrough': 'Aug 8, 2026',
}

export const addedOf = (title: string): string => ADDED[title] ?? 'Aug 2026'

export const initialsOf = (title: string): string =>
  title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const usedLabel = (used: number): string =>
  used ? `In ${used} ${used > 1 ? 'modules' : 'module'}` : 'Not used yet'

export const statusOf = (m: Module): string =>
  m.draft ? 'Draft' : m.retired ? 'Retired' : m.active ? 'Active' : 'Inactive'

export const PAGE_SIZE = 8

/** The seed questions in the shape the quiz maker wants them. */
export const makerSeed = (): { text: string; options: { t: string }[]; correct: number }[] =>
  SEED_QUESTIONS.map((q) => ({ text: q.text, options: q.options.map((t) => ({ t })), correct: q.correct }))
