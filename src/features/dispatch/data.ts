// Seed for Dispatch, from Dispatch.dc.html's seedDay().
//
// One day of the station: the roster of rows that will launch, the rescues in
// flight, the standby bench, who called out, and what each route has done on
// road. Every board on the page reads this same day.

/** Clock minutes since midnight — the unit every time on this page uses. */
export type Minutes = number

/** The pinned clock the design file works from: 11:52. */
export const NOW: Minutes = 712
/** On Road works from a later clock, 14:41 — the boards are hours apart. */
export const ON_NOW: Minutes = 881
export const ME = 'R. GUTIERREZ'

/** Minutes a punch may be late before it counts as late. */
export const DEFAULT_GRACE = 10
/** Scheduled arrival sits this far before the wave, unless overridden. */
export const DEFAULT_SCHED_OFFSET = 15
export const DEFAULT_WAVE_OFFSET = 40

/** Something wrong with a row that dispatch has to see before launch. */
export interface RowWarning {
  k: string
  label: string
}

export interface LastCall {
  txt: string
  who: string
  when: string
}

/** A row on the Load Out roster: one route, one van, one driver. */
export interface Row {
  id: string
  /** Service type — the band the roster groups by. */
  band: string
  emp: string
  /** Transporter ID. Empty means the roster could not match the driver. */
  tr: string
  route: string
  van: string
  staging: string
  wave: Minutes | null
  punch: Minutes | null
  /** When the Dispatch Info SMS went out, if it has. */
  sent: string | null
  warn: RowWarning | null
  phone: boolean
  noDriver: boolean
  /** True when the scheduled arrival was typed rather than derived. */
  schedOv: boolean
  sched?: Minutes
  lastCall: LastCall | null
  inactive?: boolean
}

export interface RescueEnd {
  name: string
  van?: string
  origin?: string
  route?: string
  emp?: string
}

export interface Rescue {
  id: string
  rescuer: RescueEnd | null
  rescuing: RescueEnd & { route: string; van: string }
  where: { a: string; b: string }
  onPad: boolean
  totes: number | null
  sent: string | null
}

export interface BenchRow {
  id: string
  emp: string
  tr: string
  van: string
  wave: Minutes | null
  schedArr: Minutes | null
  punch: Minutes | null
  status: string
  quals: string
}

export interface OnCallRow {
  id: string
  emp: string
  tr: string
  phone: string
  contacted: { when: string; k: string } | null
  comingAt: string
  punch: Minutes | null
  quals: string
}

export interface CalledOutRow {
  id: string
  emp: string
  tr: string
  reason: string
  calledAt: string | null
  punch: Minutes | null
}

/** What a route has done on road. `st` is its pace against the plan. */
export interface Itinerary {
  st: 'done' | 'pace' | 'behind' | 'nodata'
  back?: Minutes
  /** [delivered, total] */
  pkg?: [number, number]
  /** [done, total] */
  stp?: [number, number]
  plan?: Minutes
  proj?: Minutes | null
  /** Minutes of overtime the projection implies. */
  ot?: number
  wrongVan?: string
  /** Set once a dispatcher types over the feed, with what the feed said. */
  manual?: boolean
  orig?: { pkg?: [number, number]; stp?: [number, number]; plan?: Minutes; st: Itinerary['st'] }
}

export interface OnRoadNote {
  txt: string
  issue: boolean
  who: string
  when: string
}

export interface Day {
  rows: Row[]
  resc: Rescue[]
  sb: BenchRow[]
  oc: OnCallRow[]
  co: CalledOutRow[]
  itin: Record<string, Itinerary>
  orMsgs: Record<string, { at: string; who: string }>
  orNotes: Record<string, OnRoadNote>
  orSent: Record<string, string>
  rtsCounts: Record<string, number>
  rtsNotes: Record<string, { txt: string; who: string; when: string }>
  rtsClosed: string | null
  unmatched: string[]
  /** Per-route corrections typed on the Return to Station board. */
  rtsOv?: Record<string, { route?: string; [k: string]: string | number | undefined }>
}

const R = (
  id: string,
  band: string,
  emp: string,
  tr: string,
  route: string,
  van: string,
  staging: string,
  wave: Minutes | null,
  punch: Minutes | null,
  sent: string | null,
  warn?: RowWarning | null,
  extra?: Partial<Row>,
): Row => ({
  id, band, emp, tr, route, van, staging, wave, punch, sent,
  warn: warn || null,
  phone: true,
  noDriver: !emp,
  schedOv: false,
  lastCall: null,
  ...extra,
})

export function seedDay(): Day {
  return {
    rows: [
      R('r1', 'DLX5', 'ALVARENGA, CARLOS', 'A3TP7284XQ', 'CX248', 'PACT03', 'STG.L.14, PAD E', 700, 681, '6:22'),
      R('r2', 'DLX5', 'BARRETO, LUIS', 'A3TP1190KD', 'CX250', 'PACT07', 'STG.L.02, PAD E', 700, 679, '6:22'),
      R('r3', 'DLX5', 'CANDIA, MARISOL', 'A3TP5521MB', 'CX255', 'PACT11', 'STG.L.06, PAD D', 700, 684, '6:22'),
      R('r4', 'DLX5', 'EGUEZ, RAMON', 'A3TP8830RE', 'CX261', 'PACT14', 'STG.L.08, PAD D', 700, 688, '6:22'),
      R('r5', 'DLX5', 'HUERTA, NADIA', 'A3TP3317NH', 'CX266', 'PACT18', 'STG.C.03, PAD B', 700, null, '6:22'),
      R('r6', 'DLX5', 'KOEHLER, BRETT', 'A3TP9042KB', 'CX259', 'PACT21', 'STG.C.11, PAD B', 700, null, '6:22'),
      R('r7', 'DLX5', 'DIAZ, DAVID', 'A3TP2764DD', 'CX252', 'PACT04', 'STG.R.06, PAD C', 705, null, '6:22', null, { schedOv: true, sched: 690 }),
      R('r8', 'DLX5', 'RAIGOSA, PETER', 'A3TP6109RP', 'CX272', 'PACT09', 'STG.R.02, PAD C', 705, 712, '6:22'),
      R('r9', 'DLX5', 'VACA, ELENA', 'A3TP4478VE', 'CX270', 'PACT23', 'STG.R.11, PAD A', 705, 691, '6:22', null, { schedOv: true, sched: 690 }),
      R('r10', 'DLX5', 'GARCIA, ANDY', 'A3TP7615GA', 'CX264', 'PACT31', 'STG.L.09, PAD E', 705, 693, '6:22', null, { lastCall: { txt: '6:12 - reached', who: ME, when: '6:12' } }),
      R('r11', 'DLX5', 'IBARRA, SOFIA', 'A3TP0286IS', 'CX268', 'PACT12', 'STG.L.11, PAD E', 705, null, '6:22'),
      R('r12', 'DLX5', 'JAUREGUI, MARCO', 'A3TP5930JM', 'CX274', 'PACT15', 'STG.L.13, PAD D', 705, 694, '6:22'),
      R('r13', 'DLX5', 'LEMUS, DANIELA', 'A3TP8147LD', 'CX276', 'PACT58', 'STG.C.05, PAD B', 705, null, '6:22', { k: 'cross', label: 'PACT58 is a Large Van - cross-category on a DLX5 row' }),
      R('r14', 'DLX5', 'MONTOYA, FELIX', 'A3TP3652MF', 'CX278', 'PACT24', 'STG.C.07, PAD B', 705, null, '6:22'),
      R('r15', 'DLX5', 'NAJERA, RUTH', 'A3TP9271NR', 'CX280', 'PACT19', 'STG.C.09, PAD B', 705, null, '6:22', { k: 'shop', label: 'PACT19 is In shop in Fleet' }),
      R('r16', 'DLX5', 'OCHOA, PRISCILA', 'A3TP1508OP', 'CX282', 'EP-04', 'STG.R.04, PAD C', 705, 701, '6:22', { k: 'dot', label: 'Not on EP-04\u2019s priority list - needs DOT' }),
      R('r17', 'DLX5', 'PANIAGUA, JORGE', '', 'CX284', 'PACT33', 'STG.R.08, PAD C', 705, null, '6:22', { k: 'tr', label: 'Transporter ID not found' }),
      R('r18', 'LV', 'QUINTERO, MAYA', 'A3TP6823QM', 'CX286', 'PACT52', 'STG.L.01, PAD F', 705, 690, '6:22'),
      R('r19', 'LV', 'RIOS, MARTIN', 'A3TP2094RM', 'CX290', 'PACT54', 'STG.L.03, PAD F', 705, null, '6:22'),
      R('r20', 'LV', 'TAPIA, GRISELDA', 'A3TP7346TG', 'CX292', 'PACT57', 'STG.L.05, PAD F', 705, 695, '6:22'),
      R('r21', 'LV', 'SANDOVAL, HUGO', 'A3TP4419SH', '', 'PACT55', '', null, 672, '6:22'),
      R('r22', 'CDV', 'URENA, BLANCA', 'A3TP8956UB', 'CX296', '', '', 705, 687, '6:22'),
      R('r23', 'CDV', 'VILLEGAS, OMAR', 'A3TP0673VO', 'CX298', '', '', 705, null, '6:22'),
      R('r24', 'DOT', 'ZAMBRANO, IKER', 'A3TP5287ZI', 'CX304', 'EP-06', 'STG.R.01, PAD G', 705, null, '6:22'),
      R('r25', 'DOT', 'ACEVEDO, PILAR', 'A3TP9410AP', 'CX306', 'EP-07', 'STG.R.03, PAD G', 705, 696, '6:22'),
      R('r26', 'DOT', 'ASUTAY, MELIH', 'A3TP3768AM', 'CX294', 'EP-01', 'STG.R.05, PAD G', 710, 696, '6:22'),
      R('r27', 'DOT', 'WOLDE, DANIEL', 'A3TP6031WD', 'CX300', 'EP-02', 'STG.R.07, PAD G', 710, 694, '6:22'),
      R('r28', 'DOT', 'YANEZ, ROCIO', 'A3TP1845YR', 'CX302', 'EP-03', 'STG.R.09, PAD G', 710, 701, '6:22'),
      R('r29', 'DOT', 'BELTRAN, OSCAR', 'A3TP7592BO', 'CX308', 'EP-05', 'STG.R.10, PAD G', 710, 699, '6:22'),
      R('r30', 'ADHOC', '', '', 'CX288', 'PACT44', 'STG.C.01, PAD A', 725, null, null),
      R('r31', 'ADHOC', 'HOLGUIN, PERLA', 'A3TP2360HP', 'CX310', 'PACT46', 'STG.C.02, PAD A', 725, null, '6:22', null, { phone: false })
    ],
    resc: [
      { id: 'x1', rescuer: { name: 'MENDEZ, GABRIEL', van: 'PACT41', origin: 'From Standby' }, rescuing: { name: 'DIAZ, DAVID', route: 'CX252', van: 'PACT04' }, where: { a: '1420 W Olympic Blvd', b: 'Los Angeles' }, onPad: false, totes: 32, sent: '11:49' },
      { id: 'x2', rescuer: null, rescuing: { name: 'CANDIA, MARISOL', route: 'CX255', van: 'PACT11' }, where: { a: '88 Mateo St', b: 'Arts District' }, onPad: false, totes: 41, sent: null },
      { id: 'x3', rescuer: { name: 'CRUZ, ADRIAN', van: 'PACT48', origin: '' }, rescuing: { name: 'EGUEZ, RAMON', route: 'CX261', van: 'PACT14' }, where: { a: '415 S Grand Ave', b: 'Downtown' }, onPad: false, totes: 23, sent: null }
    ],
    sb: [
      { id: 's1', emp: 'MENDEZ, GABRIEL', tr: 'A3TP4187MG', van: 'PACT41', wave: null, schedArr: null, punch: 698, status: 'on rescue', quals: 'DLX5 · CDV' },
      { id: 's2', emp: 'GARCIA, ANDY', tr: 'A3TP7615GA', van: '', wave: null, schedArr: null, punch: 693, status: 'activated', quals: 'DLX5' },
      { id: 's3', emp: 'STROSKA, ANGELO', tr: 'A3TP5044SA', van: '', wave: null, schedArr: 700, punch: null, status: 'waiting', quals: 'DLX5 · Large Van' }
    ],
    oc: [
      { id: 'o1', emp: 'FLORENDO, ROSS', tr: 'A3TP8823FR', phone: '(213) 555-0144', contacted: { when: '6:12', k: 'coming' }, comingAt: '8:30', punch: 506, quals: 'DLX5' }
    ],
    co: [
      { id: 'c1', emp: 'SUAZO, MARTIN', tr: 'A3TP6690SM', reason: 'No call / no show', calledAt: null, punch: 614 }
    ],
    itin: {
      r1: { st: 'done', back: 852, pkg: [218, 218], stp: [102, 102], plan: 1230, proj: null },
      r2: { st: 'done', back: 845, pkg: [196, 196], stp: [94, 94], plan: 1235, proj: null },
      r3: { st: 'pace', pkg: [88, 255], stp: [41, 118], plan: 1275, proj: 1268 },
      r4: { st: 'pace', pkg: [102, 240], stp: [50, 112], plan: 1280, proj: 1274 },
      r5: { st: 'pace', pkg: [96, 232], stp: [44, 108], plan: 1265, proj: 1260 },
      r6: { st: 'behind', pkg: [176, 248], stp: [88, 120], plan: 1255, proj: 1335, ot: 80 },
      r7: { st: 'behind', pkg: [127, 310], stp: [61, 138], plan: 1278, proj: 1333, ot: 55 },
      r8: { st: 'nodata', plan: 829 },
      r9: { st: 'pace', pkg: [120, 236], stp: [58, 110], plan: 1282, proj: 1276 },
      r10: { st: 'pace', pkg: [88, 214], stp: [40, 99], plan: 1270, proj: 1262 },
      r11: { st: 'pace', pkg: [94, 228], stp: [45, 106], plan: 1268, proj: 1264, wrongVan: 'Driving PACT18, assigned PACT12' },
      r12: { st: 'done', back: 838, pkg: [188, 188], stp: [90, 90], plan: 1240, proj: null },
      r13: { st: 'pace', pkg: [76, 208], stp: [36, 96], plan: 1262, proj: 1257 },
      r14: { st: 'pace', pkg: [104, 242], stp: [48, 114], plan: 1284, proj: 1280 },
      r15: { st: 'pace', pkg: [86, 220], stp: [42, 102], plan: 1272, proj: 1266 },
      r16: { st: 'behind', pkg: [110, 260], stp: [52, 121], plan: 1265, proj: 1262 },
      r17: { st: 'nodata' },
      r18: { st: 'pace', pkg: [98, 226], stp: [47, 105], plan: 1276, proj: 1270 },
      r19: { st: 'pace', pkg: [82, 218], stp: [39, 101], plan: 1269, proj: 1263 },
      r20: { st: 'done', back: 860, pkg: [204, 204], stp: [98, 98], plan: 1245, proj: null },
      r22: { st: 'pace', pkg: [90, 210], stp: [43, 98], plan: 1266, proj: 1259 },
      r23: { st: 'pace', pkg: [70, 198], stp: [33, 92], plan: 1260, proj: 1255 },
      r24: { st: 'pace', pkg: [112, 246], stp: [54, 115], plan: 1286, proj: 1281 },
      r25: { st: 'done', back: 866, pkg: [176, 176], stp: [84, 84], plan: 1250, proj: null },
      r26: { st: 'behind', pkg: [84, 190], stp: [40, 95], plan: 1245, proj: 1240 },
      r27: { st: 'done', back: 841, pkg: [168, 168], stp: [80, 80], plan: 1238, proj: null },
      r28: { st: 'done', back: 855, pkg: [172, 172], stp: [82, 82], plan: 1242, proj: null },
      r29: { st: 'done', back: 871, pkg: [180, 180], stp: [86, 86], plan: 1248, proj: null },
      r31: { st: 'pace', pkg: [24, 216], stp: [11, 100], plan: 1310, proj: 1305 }
    },
    orMsgs: { r8: { at: '13:20', who: 'R. GUTIERREZ' }, r13: { at: '13:05', who: 'R. GUTIERREZ' } },
    orNotes: {
      r8: { txt: 'Radio dead - called 13:15', issue: true, who: 'R. GUTIERREZ', when: '13:15' },
      r23: { txt: 'Locked gate at stop 41', issue: true, who: 'R. GUTIERREZ', when: '13:42' },
      r15: { txt: 'Dog at 4412 Alder St', issue: true, who: 'R. GUTIERREZ', when: '12:58' }
    },
    orSent: { r9: '13:10' },
    rtsCounts: { CX248: 2, CX250: 1, CX255: 8, CX261: 3, CX252: 12, CX272: 5, CX264: 1, CX268: 2, CX274: 0, CX276: 4, CX278: 2, CX282: 3, CX284: 1, CX286: 2, CX290: 3, CX292: 1, CX296: 2, CX304: 3, CX306: 1, CX294: 2, CX300: 1, CX302: 2, CX308: 1 },
    rtsNotes: { CX252: { txt: '1 short at the door', who: 'R. GUTIERREZ', when: '3:02' } },
    rtsClosed: null,
    unmatched: ['RDM_88214 - No driver', 'AV21|CX267 - glued code, no driver', 'NGUYEN, P - driver matched, route CX315 not on their rows']
  }
}

// ---- registries -------------------------------------------------------------
//
// The bands the roster groups by. OPS and Trainer are not route bands: they
// hold people who are here but not launching, and the counts keep them apart.

export const BAND_DEFS: [string, string][] = [
  ['DLX5', 'DLX5 Delivery Associate'],
  ['LV', 'Large Van'],
  ['CDV', 'CDV'],
  ['DOT', 'DOT Step Van Driver'],
  ['ADHOC', 'Adhoc'],
  ['OPS', 'Operations (OPS)'],
  ['TRAINER', 'Trainer'],
]

/** The bands that actually launch a route. */
export const ROUTE_BANDS = ['DLX5', 'LV', 'CDV', 'DOT', 'ADHOC']

export interface ServiceType {
  id: string
  name: string
  hours: number
  veh: string
}

export const SEED_SERVICE_TYPES: ServiceType[] = [
  { id: 'DLX5', name: 'DLX5 Delivery Associate', hours: 10, veh: 'Delivery Van' },
  { id: 'LV', name: 'Large Van', hours: 10, veh: 'Large Van' },
  { id: 'CDV', name: 'CDV', hours: 8, veh: 'CDV' },
  { id: 'DOT', name: 'DOT Step Van Driver', hours: 10, veh: 'Step Van' },
  { id: 'ADHOC', name: 'Adhoc', hours: 10, veh: 'Delivery Van' },
]

export interface VanReg {
  id: string
  type: string
  status: string
  /** Where the driver sits on this van's priority list, if at all. */
  rank: string
}

export const VANS: VanReg[] = [
  { id: 'PACT26', type: 'Delivery Van', status: 'In service', rank: '#1 on PACT26’s list' },
  { id: 'PACT49', type: 'Delivery Van', status: 'In service', rank: 'not listed' },
  { id: 'PACT35', type: 'CDV', status: 'In service', rank: '#3 on PACT35’s list' },
  { id: 'PACT61', type: 'Large Van', status: 'In service', rank: '#2 on PACT61’s list' },
  { id: 'EP-08', type: 'Step Van', status: 'In service', rank: 'not listed' },
  { id: 'PACT62', type: 'Delivery Van', status: 'In shop', rank: 'not listed' },
  { id: 'PACT63', type: 'Large Van', status: 'Grounded', rank: 'not listed' },
]

export const SERVICE_CATALOG: { name: string; hours: number; veh: string; paid: string }[] = [
  { name: 'DLX5 Delivery Associate', hours: 10, veh: 'Delivery Van', paid: 'Amazon' },
  { name: 'Large Van', hours: 10, veh: 'Large Van', paid: 'Amazon' },
  { name: 'CDV', hours: 8, veh: 'CDV', paid: 'Amazon' },
  { name: 'DOT Step Van Driver', hours: 10, veh: 'Step Van', paid: 'Amazon' },
  { name: 'Step Van', hours: 9, veh: 'Step Van', paid: 'Amazon' },
  { name: 'Step Van', hours: 10, veh: 'Step Van', paid: 'Amazon' },
  { name: 'XL Van', hours: 9, veh: 'Large Van', paid: 'Amazon' },
  { name: 'Cargo Van', hours: 8, veh: 'Delivery Van', paid: 'Amazon' },
  { name: 'Nursery Route', hours: 10, veh: 'Delivery Van', paid: 'Amazon' },
  { name: 'Adhoc', hours: 10, veh: 'Delivery Van', paid: 'DSP' },
  { name: 'Standby', hours: 4, veh: '', paid: 'DSP' },
  { name: 'Unpaid Rescues', hours: 4, veh: '', paid: 'DSP' },
]

/** People the roster knows but who are not on today's board. */
export const PEOPLE_POOL: { emp: string; tr: string; quals: string }[] = [
  { emp: 'MARIN, TERESA', tr: 'A3TP0912MT', quals: 'DLX5' },
  { emp: 'POLANCO, RUBEN', tr: 'A3TP7768PR', quals: 'DLX5 · DOT' },
  { emp: 'DELACRUZ, SAM', tr: 'A3TP3395DS', quals: 'CDV' },
  { emp: 'CRUZ, ADRIAN', tr: 'A3TP8802CA', quals: 'DLX5 · Large Van' },
]

export interface Template {
  name: string
  /** Where the template is used, so an edit's blast radius is visible. */
  badge: string
  seeded: boolean
  body: string
}

export const SEED_TEMPLATES: Template[] = [
  {
    name: 'Dispatch Info', badge: 'Load Out · Send Info', seeded: true,
    body: 'Good morning {Employee}\nYou are rostered for: {Day, Date}\nScheduled Arrival Time: {Scheduled}\nWave Time: {Wave}\nVehicle: {Van}\nRoute: {Route}\nStaging: {Staging}',
  },
  {
    name: 'Prime Week Notice', badge: 'Load Out · P5 Checkbox', seeded: true,
    body: 'Prime Week is running - expect a heavier load and plan your breaks early. Thank you.',
  },
  {
    name: 'Rescue Meet-Up · Rescuer', badge: 'Load Out P6 + On Road P10 · To the rescuer', seeded: true,
    body: 'Rescue: you are rescuing {Rescuing} on {Rescuing Route} at {Where}{Totes}.\nContact: {Rescuing Phone}\nCall dispatch if you cannot make the meet.',
  },
  {
    name: 'Rescue Meet-Up · Rescued', badge: 'Load Out P6 + On Road P10 · To the rescued driver', seeded: true,
    body: 'Rescue: {Rescuer} is meeting you at {Where}{Totes}.\nContact: {Rescuer Phone}\nStay at the meet point.',
  },
  {
    name: 'Route Status', badge: 'On Road · Send Status', seeded: true,
    body: 'Hi {Employee} - {Stops done} of {Stops} stops done, {Pkgs left} packages left, projected back {Proj RTS}. Reply or call dispatch if that looks wrong.',
  },
  {
    name: 'Behind Check-In', badge: 'On Road · Send Status (Behind / Late)', seeded: true,
    body: 'Hi {Employee} - you are running behind pace ({Stops done}/{Stops} stops, projected back {Proj RTS}). Do you need a rescue? Call dispatch.',
  },
  {
    name: 'Availability Check', badge: 'Extra · P5 Template', seeded: false,
    body: '{Employee}, are you available to come in today? Reply YES with your arrival time or NO.',
  },
]
