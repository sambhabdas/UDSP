// Responses - what came back from the surveys the drivers were sent.
//
// Two surveys, and the difference between them shapes the whole page: the
// route-end survey is named, so every answer carries a driver and a route and
// the people who did not answer can be chased. The weekly pulse is anonymous,
// so none of that exists and the page hides it rather than showing empty cells.

export type QuestionType = 'rating' | 'yesno' | 'text' | 'photo'

export interface Answer {
  when: string
  driver?: string
  route?: string
  answer: string
}

export interface Photo {
  when: string
  driver?: string
  route?: string
  caption: string
  /** The two ends of the placeholder gradient, as design tokens. */
  g1: string
  g2: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  answers: number
  /** rating */
  avg?: string
  /** rating - counts for 5, 4, 3, 2, 1, in that order. */
  counts?: number[]
  /** yesno */
  yes?: number
  no?: number
  /** Which of the two answers is the one worth chasing. */
  problem?: 'Yes' | 'No'
  /** text - shown before the full table is opened. */
  samples?: Answer[]
  photos?: Photo[]
  details: Answer[]
}

export interface Kpi {
  label: string
  value: string
  sub?: string
  color: string
}

export interface NotAnswered {
  name: string
  route: string
  ago: string
  reminded: boolean
}

export interface Survey {
  name: string
  /** Named surveys carry a driver on every answer; anonymous ones never do. */
  named: boolean
  meta: string
  timeline: { day: string; n: number }[]
  kpis: Kpi[]
  questions: Question[]
  notAnswered: NotAnswered[]
  outstanding: number
  alreadyReminded: number
}

export const SURVEYS: Record<string, Survey> = {
  route: {
    name: 'End of route',
    named: true,
    meta: '156 answers',
    timeline: [
      { day: 'Sun 07/26', n: 21 }, { day: 'Mon 07/27', n: 24 }, { day: 'Tue 07/28', n: 26 }, { day: 'Wed 07/29', n: 23 },
      { day: 'Thu 07/30', n: 22 }, { day: 'Fri 07/31', n: 18 }, { day: 'Sat 08/01', n: 22 },
    ],
    kpis: [
      { label: 'Total responses', value: '156', sub: 'of 186 routes closed', color: 'var(--text-primary)' },
      { label: 'Completion rate', value: '84%', sub: '30 not answered', color: 'var(--success-fg)' },
      { label: 'Flagged answers', value: '34', color: 'var(--danger-fg)' },
    ],
    questions: [
      {
        id: 'q1', type: 'rating', title: 'How did the route go?', avg: '4.1', counts: [72, 50, 22, 8, 4], answers: 156,
        details: [
          { when: 'Jul 29, 20:14', driver: 'DIAZ, DAVID', route: 'CX252', answer: '2 / 5' },
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: '4 / 5' },
          { when: 'Jul 29, 19:40', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: '5 / 5' },
          { when: 'Jul 29, 19:18', driver: 'WOODS, TANYA', route: 'CX248', answer: '4 / 5' },
          { when: 'Jul 28, 21:03', driver: 'RAIGOSA, O', route: 'CX255', answer: '3 / 5' },
          { when: 'Jul 28, 20:41', driver: 'SHAW, KELLY', route: 'CX262', answer: '5 / 5' },
        ],
      },
      {
        id: 'q2', type: 'yesno', title: 'Did you finish on time?', yes: 139, no: 17, problem: 'No', answers: 156,
        details: [
          { when: 'Jul 29, 20:14', driver: 'DIAZ, DAVID', route: 'CX252', answer: 'No' },
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: 'Yes' },
          { when: 'Jul 29, 19:40', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: 'Yes' },
          { when: 'Jul 29, 19:18', driver: 'WOODS, TANYA', route: 'CX248', answer: 'Yes' },
          { when: 'Jul 28, 21:03', driver: 'RAIGOSA, O', route: 'CX255', answer: 'No' },
        ],
      },
      {
        id: 'q3', type: 'yesno', title: 'Any problem with the van?', yes: 11, no: 145, problem: 'Yes', answers: 156,
        details: [
          { when: 'Jul 29, 20:14', driver: 'DIAZ, DAVID', route: 'CX252', answer: 'Yes · "Sliding door sticks - had to force it all day."' },
          { when: 'Jul 28, 21:03', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: 'Yes · "Tyre pressure light on since Friday."' },
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: 'No' },
          { when: 'Jul 29, 19:40', driver: 'WOODS, TANYA', route: 'CX248', answer: 'No' },
        ],
      },
      {
        id: 'q4', type: 'yesno', title: 'Any problem with the route?', yes: 19, no: 137, problem: 'Yes', answers: 156,
        details: [
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: 'Yes · "Apartment block 4400 has no access code."' },
          { when: 'Jul 29, 19:40', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: 'No' },
          { when: 'Jul 29, 19:18', driver: 'DIAZ, DAVID', route: 'CX252', answer: 'No' },
        ],
      },
      {
        id: 'q6', type: 'photo', title: 'Photo of anything we should see', answers: 4,
        photos: [
          { when: 'Jul 29, 20:14', driver: 'DIAZ, DAVID', route: 'CX252', caption: 'Sliding door track', g1: 'var(--neutral-200)', g2: 'var(--neutral-400)' },
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', caption: 'Blocked apartment gate', g1: 'var(--neutral-100)', g2: 'var(--neutral-400)' },
          { when: 'Jul 28, 21:03', driver: 'ASUTAY, YUSUF', route: 'CX294', caption: 'Tyre pressure warning', g1: 'var(--blue-200)', g2: 'var(--blue-300)' },
          { when: 'Jul 27, 19:40', driver: 'WOODS, TANYA', route: 'CX248', caption: 'Locker 12 keypad', g1: 'var(--green-200)', g2: 'var(--green-300)' },
        ],
        details: [
          { when: 'Jul 29, 20:14', driver: 'DIAZ, DAVID', route: 'CX252', answer: 'Photo · Sliding door track' },
          { when: 'Jul 29, 19:52', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: 'Photo · Blocked apartment gate' },
          { when: 'Jul 28, 21:03', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: 'Photo · Tyre pressure warning' },
          { when: 'Jul 27, 19:40', driver: 'WOODS, TANYA', route: 'CX248', answer: 'Photo · Locker 12 keypad' },
        ],
      },
      {
        id: 'q5', type: 'text', title: 'Anything the station should know?', answers: 42,
        samples: [
          { when: 'Jul 29, 19:40', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: '"Second day the pad was blocked at 11:30."' },
          { when: 'Jul 28, 20:41', driver: 'WOODS, TANYA', route: 'CX248', answer: '"Locker 12 code changed, dispatch has the old one."' },
        ],
        details: [
          { when: 'Jul 29, 19:40', driver: 'ASUTAY, YUSUF', route: 'CX294', answer: '"Second day the pad was blocked at 11:30."' },
          { when: 'Jul 28, 20:41', driver: 'WOODS, TANYA', route: 'CX248', answer: '"Locker 12 code changed, dispatch has the old one."' },
          { when: 'Jul 28, 20:12', driver: 'DIAZ, DAVID', route: 'CX252', answer: '"Gate 3 scanner is still down."' },
          { when: 'Jul 27, 19:58', driver: 'MENDEZ, GABRIEL', route: 'CX241', answer: '"New guy at 4400 signs for the whole block, works fine."' },
        ],
      },
    ],
    notAnswered: [
      { name: 'SUAZO, MARCO', route: 'CX271', ago: '2 days ago', reminded: true },
      { name: 'VEGA, MARIA', route: 'CX288', ago: '2 days ago', reminded: true },
      { name: 'ALVARENGA, C', route: 'CX248', ago: '1 day ago', reminded: false },
      { name: 'GARCIA, ANDY', route: 'CX255', ago: '1 day ago', reminded: false },
    ],
    outstanding: 12,
    alreadyReminded: 18,
  },

  weekly: {
    name: 'Weekly pulse',
    named: false,
    meta: '15 answers',
    timeline: [
      { day: 'Sun 08/09', n: 0 }, { day: 'Mon 08/10', n: 0 }, { day: 'Tue 08/11', n: 0 }, { day: 'Wed 08/12', n: 1 },
      { day: 'Thu 08/13', n: 5 }, { day: 'Fri 08/14', n: 9 }, { day: 'Sat 08/15', n: 0 },
    ],
    kpis: [
      { label: 'Total responses', value: '15', sub: 'of 32 reachable drivers', color: 'var(--text-primary)' },
      { label: 'Completion rate', value: '47%', sub: '17 not answered', color: 'var(--warning-fg)' },
      { label: 'Flagged answers', value: '3', color: 'var(--danger-fg)' },
    ],
    questions: [
      {
        id: 'w1', type: 'rating', title: 'How was this week overall?', avg: '3.6', counts: [4, 6, 3, 1, 1], answers: 15,
        details: [
          { when: 'Aug 14', answer: '4 / 5' }, { when: 'Aug 14', answer: '3 / 5' }, { when: 'Aug 13', answer: '5 / 5' },
          { when: 'Aug 13', answer: '2 / 5' }, { when: 'Aug 13', answer: '4 / 5' },
        ],
      },
      {
        id: 'w2', type: 'rating', title: 'Do you feel safe on your routes?', avg: '4.2', counts: [8, 4, 2, 1, 0], answers: 15,
        details: [
          { when: 'Aug 14', answer: '5 / 5' }, { when: 'Aug 14', answer: '4 / 5' },
          { when: 'Aug 13', answer: '5 / 5' }, { when: 'Aug 13', answer: '3 / 5' },
        ],
      },
      {
        id: 'w3', type: 'text', title: 'One thing we should change', answers: 9,
        samples: [
          { when: 'Aug 14', answer: '"Wave 2 keeps starting before the vans are staged."' },
          { when: 'Aug 13', answer: '"Water in the vans during heat waves."' },
        ],
        details: [
          { when: 'Aug 14', answer: '"Wave 2 keeps starting before the vans are staged."' },
          { when: 'Aug 13', answer: '"Water in the vans during heat waves."' },
          { when: 'Aug 13', answer: '"Post the rescue list earlier."' },
        ],
      },
      {
        id: 'w4', type: 'text', title: 'One thing we should keep doing', answers: 7,
        samples: [{ when: 'Aug 14', answer: '"The morning huddle actually helps."' }],
        details: [
          { when: 'Aug 14', answer: '"The morning huddle actually helps."' },
          { when: 'Aug 12', answer: '"Same vans for the same drivers."' },
        ],
      },
    ],
    notAnswered: [],
    outstanding: 0,
    alreadyReminded: 0,
  },
}

export const RANGES = ['This week', 'Last week', 'Last 7 days', 'Last 30 days', 'Custom']

/** Rating bands: 4 and 5 are good, 3 is the middle, 1 and 2 are the problem. */
export const ratingColor = (n: number): string =>
  n >= 4 ? 'var(--success-accent)' : n === 3 ? 'var(--warning-accent)' : 'var(--danger-accent)'
