// Vehicles' seed, lifted from Vehicles.dc.html.
//
// Every date that has to be compared carries a real Date beside its label, so
// sorting and "days until" never re-parse a display string. They are built from
// explicit y/m/d parts, which makes them the same on the server and the client.

/** The clock the whole page is read against — Jul 29, 2026. */
export const TODAY = new Date(2026, 6, 29)

export type Status = 'In service' | 'In shop' | 'Grounded' | 'Off fleet'

export interface VehicleType {
  name: string
  /** A DOT type can only be driven by a DOT-carded DA. */
  dot: boolean
  suits: string
  use: string
}

export interface Vehicle {
  id: string
  svcTypes: string[]
  name: string
  type: string
  vin: string
  /** The lessor's own ID, when there is one. */
  ext: string
  plate: string
  plateState: string
  year: number | string
  make: string
  model: string
  own: 'Owned' | 'Rented'
  inService: string
  status: Status
  expectedBack?: string
  backPast?: boolean
  vendor?: string
  offDate?: string
  offReason?: string
}

/** Who paid what share of a service record. */
export type Alloc = [string, number]

export interface ServiceRecord {
  id: string
  vid: string
  date: string
  d: Date
  cat: string
  vendor: string
  desc: string
  odo: string
  cost: number
  alloc: Alloc[]
  files?: FileRef[]
}

export interface FileRef {
  name: string
  type: string
  when: string
}

export interface Incident {
  id: string
  vid: string
  when: string
  what: string
  liability: string
  claim: string
  linked: number
  status: 'open' | 'closed'
  files?: FileRef[]
}

export interface Reminder {
  id: string
  vid: string
  name: string
  dueType: 'Date' | 'Mileage'
  dueMi?: number
  dueDate?: string
  dd?: Date
  repeat: string
  done?: boolean
}

export interface Renewal {
  id: string
  vid: string
  type: string
  name: string
  exp: string
  ed: Date
  /** A lease has to be given notice before it expires; that date rules instead. */
  notice?: string
  nd?: Date
  renewed: string
  cost: number | null
}

export interface PhotoSet {
  id: string
  vid: string
  date: string
  type: string
  note: string
  filled: string[]
  extras: number
  reason?: string
  files?: FileRef[]
}

export interface OdoReading {
  id: string
  vid: string
  date: string
  d: Date
  reading: number
  source: string
  by: string
  note: string
  time?: string
}

export interface StatusChange {
  vid: string
  date: string
  from: string
  to: string
  reason: string
  by: string
}

export interface RecordChange {
  vid: string
  date: string
  who: string
  what: string
  source: string
}

export interface DA {
  id: string
  name: string
  tid: string
  types: string[]
  dot: boolean
  active: boolean
}

export const TYPES: VehicleType[] = [
  { name: 'CDV', dot: true, suits: 'CDV 8 hr · DLX5 · Adhoc', use: '3 vehicles · 4 DAs · 3 service types' },
  { name: 'Small van', dot: false, suits: 'CDV 8 hr', use: '1 vehicle · 5 DAs · 1 service type' },
  { name: 'Large van', dot: false, suits: 'Nursery route 9 hr', use: '3 vehicles · 6 DAs · 1 service type' },
  { name: 'Extra-large van', dot: false, suits: 'Nursery route 10 hr', use: '1 vehicle · 2 DAs · 1 service type' },
  { name: 'Step van', dot: true, suits: 'Step Van 9 hr · Step Van 10 hr', use: '1 vehicle · 3 DAs · 2 service types' },
]

export const VEHICLES: Vehicle[] = [
  { id: 'v103', svcTypes: ['CDV'], name: 'Van 103', type: 'Small van', vin: '1FTBW2CM3LKB07322', ext: '', plate: '7XKW441', plateState: 'CA', year: 2023, make: 'Ford', model: 'Transit 250', own: 'Owned', inService: 'Mar 4, 2023', status: 'In service' },
  { id: 'v105', svcTypes: ['CDV', 'Adhoc'], name: 'Van 105', type: 'CDV', vin: '1FDWE3FS2PDC18804', ext: 'U-40102', plate: '3JKX509', plateState: 'CA', year: 2023, make: 'Ford', model: 'E-450', own: 'Rented', inService: 'Feb 3, 2024', status: 'In service' },
  { id: 'v108', svcTypes: ['CDV', 'DLX5'], name: 'Van 108', type: 'CDV', vin: '1FDWE3FS5MDC10428', ext: 'U-40188', plate: '', plateState: '', year: 2024, make: 'Ford', model: 'E-450', own: 'Rented', inService: 'Jan 12, 2024', status: 'Grounded' },
  { id: 'v110', svcTypes: ['CDV'], name: 'Van 110', type: 'Small van', vin: '1FTBW2CM8LKA90217', ext: '', plate: '5HGT772', plateState: 'CA', year: 2022, make: 'Ford', model: 'Transit 250', own: 'Owned', inService: 'Mar 22, 2023', status: 'In service' },
  { id: 'v112', svcTypes: ['Nursery route'], name: 'Van 112', type: 'Large van', vin: '1FTBW3XM6PKA55231', ext: '', plate: '8ABC123', plateState: 'CA', year: 2023, make: 'Ford', model: 'Transit 350', own: 'Owned', inService: 'Jul 2, 2026', status: 'In service' },
  { id: 'v114', svcTypes: ['Nursery route'], name: 'Van 114', type: 'Large van', vin: '1FTBW2CM6NKA45872', ext: 'U-40213', plate: '9DPL208', plateState: 'CA', year: 2024, make: 'Ford', model: 'Transit 350', own: 'Rented', inService: 'Feb 12, 2024', status: 'In shop', expectedBack: 'Jul 26, 2026', backPast: true, vendor: "Bob's Auto" },
  { id: 'v116', svcTypes: ['Nursery route'], name: 'Van 116', type: 'Extra-large van', vin: '3C6TRVDG9RE201553', ext: 'U-40276', plate: '7NMW214', plateState: 'CA', year: 2024, make: 'Ram', model: 'ProMaster 3500', own: 'Rented', inService: 'Aug 8, 2024', status: 'In service' },
  { id: 'v117', svcTypes: ['Nursery route'], name: 'Van 117', type: 'Extra-large van', vin: '3C6TRVAG5RE118427', ext: '', plate: '4QRS871', plateState: 'CA', year: 2025, make: 'Ram', model: 'ProMaster 3500', own: 'Rented', inService: 'Feb 2, 2025', status: 'In service' },
  { id: 'v119', svcTypes: ['Step Van'], name: 'Van 119', type: 'Step van', vin: '4UZAANFA2SFD31190', ext: 'U-40305', plate: '2WXV630', plateState: 'CA', year: 2023, make: 'Freightliner', model: 'MT45', own: 'Rented', inService: 'Sep 15, 2023', status: 'In service' },
  { id: 'v121', svcTypes: ['Step Van'], name: 'Van 121', type: 'Step van', vin: '4UZAANFA8SFC24817', ext: 'U-40331', plate: '6TRV882', plateState: 'CA', year: 2022, make: 'Freightliner', model: 'MT45', own: 'Rented', inService: 'Aug 19, 2022', status: 'In shop', expectedBack: 'Aug 4, 2026', vendor: 'Ace Collision' },
  { id: 'v124', svcTypes: ['Nursery route'], name: 'Van 124', type: 'Large van', vin: '1FTBW2CM9PKB60112', ext: '', plate: '2MNP334', plateState: 'CA', year: 2024, make: 'Ford', model: 'Transit 350', own: 'Rented', inService: 'May 30, 2024', status: 'In service' },
  { id: 'v096', svcTypes: ['CDV'], name: 'Van 96', type: 'CDV', vin: '1FDWE3FN8KDC33951', ext: '', plate: '5RRT610', plateState: 'CA', year: 2021, make: 'Ford', model: 'E-450', own: 'Rented', inService: 'Jun 1, 2021', status: 'Off fleet', offDate: 'Mar 14, 2026', offReason: 'Returned to lessor' },
]

export const SERVICE: ServiceRecord[] = [
  { id: 's1', vid: 'v114', date: 'Jul 18, 2026', d: new Date(2026, 6, 18), cat: 'Repair', vendor: "Bob's Auto", desc: 'Transmission replaced', odo: '92,104', cost: 4820, alloc: [['Warranty', 3900], ['Out of pocket', 920]] },
  { id: 's2', vid: 'v114', date: 'Jul 2, 2026', d: new Date(2026, 6, 2), cat: 'Preventive', vendor: 'QuickLube Rialto', desc: 'Oil change and filters', odo: '91,210', cost: 146, alloc: [['Out of pocket', 146]] },
  { id: 's3', vid: 'v121', date: 'Jul 22, 2026', d: new Date(2026, 6, 22), cat: 'Bodywork', vendor: 'Ace Collision', desc: 'Rear door panel replaced', odo: '128,116', cost: 1840, alloc: [['Insurance', 1340], ['Out of pocket', 500]] },
  { id: 's4', vid: 'v108', date: 'Jul 15, 2026', d: new Date(2026, 6, 15), cat: 'Repair', vendor: 'Rialto Truck Service', desc: 'Brake caliper seized, replaced pair', odo: '41,872', cost: 690, alloc: [['Out of pocket', 690]] },
  { id: 's5', vid: 'v103', date: 'Jun 28, 2026', d: new Date(2026, 5, 28), cat: 'Fees / compliance', vendor: 'CA DMV', desc: 'Registration renewal', odo: '', cost: 412, alloc: [['Out of pocket', 412]] },
  { id: 's6', vid: 'v117', date: 'Jun 12, 2026', d: new Date(2026, 5, 12), cat: 'Preventive', vendor: 'QuickLube Rialto', desc: 'Tire rotation and alignment', odo: '38,401', cost: 220, alloc: [['Out of pocket', 220]] },
  { id: 's7', vid: 'v096', date: 'Apr 2, 2026', d: new Date(2026, 3, 2), cat: 'Repair', vendor: 'Rialto Truck Service', desc: 'Final invoice, coolant leak', odo: '154,902', cost: 380, alloc: [['FIF', 380]] },
  { id: 's8', vid: 'v105', date: 'Jul 8, 2026', d: new Date(2026, 6, 8), cat: 'Preventive', vendor: 'QuickLube Rialto', desc: 'Oil change and cabin filter', odo: '46,900', cost: 152, alloc: [['Out of pocket', 152]] },
  { id: 's9', vid: 'v110', date: 'Jun 20, 2026', d: new Date(2026, 5, 20), cat: 'Preventive', vendor: 'Rialto Truck Service', desc: 'Tire rotation and balance', odo: '32,780', cost: 210, alloc: [['Out of pocket', 210]] },
  { id: 's10', vid: 'v116', date: 'Jul 11, 2026', d: new Date(2026, 6, 11), cat: 'Repair', vendor: 'Ram of San Bernardino', desc: 'Brake pads and rotors, front axle', odo: '60,540', cost: 540, alloc: [['Warranty', 540]] },
  { id: 's11', vid: 'v119', date: 'Jul 5, 2026', d: new Date(2026, 6, 5), cat: 'Preventive', vendor: 'QuickLube Rialto', desc: 'Oil change and DEF top-up', odo: '87,200', cost: 188, alloc: [['Out of pocket', 188]] },
  { id: 's12', vid: 'v119', date: 'May 30, 2026', d: new Date(2026, 4, 30), cat: 'Repair', vendor: 'Freightliner of Fontana', desc: 'Alternator replaced', odo: '84,310', cost: 960, alloc: [['Insurance', 700], ['Out of pocket', 260]] },
  { id: 's13', vid: 'v124', date: 'Jul 25, 2026', d: new Date(2026, 6, 25), cat: 'Repair', vendor: 'Rialto Truck Service', desc: 'Side door roller replaced', odo: '36,050', cost: 430, alloc: [['Out of pocket', 430]] },
]

export const INCIDENTS: Incident[] = [
  { id: 'i1', vid: 'v114', when: 'Jul 29, 08:10', what: 'Rear door caved in the yard, found at morning check', liability: 'Unknown', claim: 'CLM-88213', linked: 0, status: 'open' },
  { id: 'i2', vid: 'v121', when: 'Jul 20, 18:42', what: 'Backed into a pole at the station, rear door damage', liability: 'Ours', claim: '', linked: 1, status: 'closed' },
  { id: 'i3', vid: 'v108', when: 'Jul 15, 07:55', what: 'Brake pedal went soft on the morning route, van towed in', liability: 'Ours', claim: '', linked: 1, status: 'closed' },
  { id: 'i4', vid: 'v116', when: 'Jul 10, 19:20', what: 'Scrape along the right side from a parking bollard', liability: 'Third party', claim: 'CLM-87550', linked: 1, status: 'open' },
]

export const REMINDERS: Reminder[] = [
  { id: 'r1', vid: 'v114', name: 'Oil change', dueType: 'Mileage', dueMi: 85000, repeat: 'every 5,000 miles' },
  { id: 'r2', vid: 'v114', name: 'Tire rotation', dueType: 'Date', dueDate: 'Aug 12, 2026', dd: new Date(2026, 7, 12), repeat: 'every 6 months' },
  { id: 'r3', vid: 'v103', name: 'Tire rotation', dueType: 'Date', dueDate: 'Aug 12, 2026', dd: new Date(2026, 7, 12), repeat: 'none' },
  { id: 'r4', vid: 'v121', name: 'Brake pads', dueType: 'Date', dueDate: 'Jul 20, 2026', dd: new Date(2026, 6, 20), repeat: 'none' },
  { id: 'r5', vid: 'v108', name: 'Oil change', dueType: 'Date', dueDate: 'Sep 3, 2026', dd: new Date(2026, 8, 3), repeat: 'none' },
  { id: 'r6', vid: 'v112', name: 'Oil change', dueType: 'Mileage', dueMi: 12000, repeat: 'none' },
  { id: 'r7', vid: 'v105', name: 'Oil change', dueType: 'Mileage', dueMi: 52000, repeat: 'every 5,000 miles' },
  { id: 'r8', vid: 'v110', name: 'Tire rotation', dueType: 'Date', dueDate: 'Oct 2, 2026', dd: new Date(2026, 9, 2), repeat: 'every 6 months' },
  { id: 'r9', vid: 'v116', name: 'Brake inspection', dueType: 'Mileage', dueMi: 65000, repeat: 'none' },
  { id: 'r10', vid: 'v119', name: 'Oil change', dueType: 'Date', dueDate: 'Aug 20, 2026', dd: new Date(2026, 7, 20), repeat: 'every 3 months' },
]

export const RENEWALS: Renewal[] = [
  { id: 'n1', vid: 'v114', type: 'Registration', name: 'CA', exp: 'Aug 3, 2026', ed: new Date(2026, 7, 3), renewed: 'Aug 1, 2025', cost: 412 },
  { id: 'n2', vid: 'v114', type: 'Inspection', name: 'Annual', exp: 'Aug 24, 2026', ed: new Date(2026, 7, 24), renewed: 'Aug 20, 2025', cost: 90 },
  { id: 'n3', vid: 'v114', type: 'Lease', name: 'Fleetco 40213', exp: 'Feb 12, 2027', ed: new Date(2027, 1, 12), notice: 'Nov 12, 2026', nd: new Date(2026, 10, 12), renewed: 'Feb 12, 2025', cost: null },
  { id: 'n4', vid: 'v121', type: 'Permit', name: 'City of Rialto', exp: 'Jul 12, 2026', ed: new Date(2026, 6, 12), renewed: 'Jul 10, 2025', cost: 120 },
  { id: 'n5', vid: 'v108', type: 'Registration', name: 'CA', exp: 'Aug 3, 2026', ed: new Date(2026, 7, 3), renewed: 'Aug 1, 2025', cost: 386 },
  { id: 'n6', vid: 'v103', type: 'Registration', name: 'CA', exp: 'Jun 28, 2027', ed: new Date(2027, 5, 28), renewed: 'Jun 28, 2026', cost: 412 },
  { id: 'n7', vid: 'v105', type: 'Registration', name: 'CA', exp: 'Nov 12, 2026', ed: new Date(2026, 10, 12), renewed: 'Nov 12, 2025', cost: 398 },
  { id: 'n8', vid: 'v110', type: 'Registration', name: 'CA', exp: 'Sep 18, 2026', ed: new Date(2026, 8, 18), renewed: 'Sep 18, 2025', cost: 402 },
  { id: 'n9', vid: 'v110', type: 'Inspection', name: 'Annual', exp: 'Feb 3, 2027', ed: new Date(2027, 1, 3), renewed: 'Feb 3, 2026', cost: 90 },
  { id: 'n10', vid: 'v112', type: 'Registration', name: 'CA', exp: 'Dec 5, 2026', ed: new Date(2026, 11, 5), renewed: 'Dec 5, 2025', cost: 410 },
  { id: 'n11', vid: 'v116', type: 'Registration', name: 'CA', exp: 'Aug 30, 2026', ed: new Date(2026, 7, 30), renewed: 'Aug 30, 2025', cost: 415 },
  { id: 'n12', vid: 'v116', type: 'Lease', name: 'Fleetco 40276', exp: 'Mar 1, 2027', ed: new Date(2027, 2, 1), notice: 'Dec 1, 2026', nd: new Date(2026, 11, 1), renewed: 'Mar 1, 2025', cost: null },
  { id: 'n13', vid: 'v117', type: 'Registration', name: 'CA', exp: 'Oct 22, 2026', ed: new Date(2026, 9, 22), renewed: 'Oct 22, 2025', cost: 415 },
  { id: 'n14', vid: 'v119', type: 'Registration', name: 'CA', exp: 'Jul 31, 2026', ed: new Date(2026, 6, 31), renewed: 'Jul 31, 2025', cost: 405 },
  { id: 'n15', vid: 'v119', type: 'Permit', name: 'City of Rialto', exp: 'Oct 10, 2026', ed: new Date(2026, 9, 10), renewed: 'Oct 10, 2025', cost: 120 },
  { id: 'n16', vid: 'v124', type: 'Registration', name: 'CA', exp: 'Jan 15, 2027', ed: new Date(2027, 0, 15), renewed: 'Jan 15, 2026', cost: 408 },
]

export const PHOTOS: PhotoSet[] = [
  { id: 'p1', vid: 'v114', date: 'Jul 21, 2026', type: 'Post-trip', note: 'Post-repair walkaround', filled: ['front', 'back', 'left', 'right', 'interior'], extras: 2 },
  { id: 'p2', vid: 'v114', date: 'Jul 9, 2026', type: 'Damage', note: 'Transmission tow-out', filled: ['front', 'left'], extras: 3 },
  { id: 'p3', vid: 'v121', date: 'Jul 20, 2026', type: 'Damage', note: 'Rear door, pole strike', filled: ['back'], extras: 4 },
  { id: 'p4', vid: 'v103', date: 'Jul 27, 2026', type: 'Pre-trip', note: '', filled: ['front', 'back', 'left', 'right', 'interior'], extras: 0 },
  { id: 'p5', vid: 'v105', date: 'Jul 25, 2026', type: 'Pre-trip', note: '', filled: ['front', 'back', 'left', 'right', 'interior'], extras: 1 },
  { id: 'p6', vid: 'v108', date: 'Jul 15, 2026', type: 'Damage', note: 'Tow-in condition record', filled: ['front', 'left'], extras: 2 },
  { id: 'p7', vid: 'v110', date: 'Jul 15, 2026', type: 'Post-trip', note: '', filled: ['front', 'back', 'interior'], extras: 0 },
  { id: 'p8', vid: 'v116', date: 'Jul 11, 2026', type: 'Damage', note: 'Right-side scrape, bollard', filled: ['right'], extras: 3 },
  { id: 'p9', vid: 'v119', date: 'Jul 28, 2026', type: 'Pre-trip', note: '', filled: ['front', 'back', 'left', 'right', 'interior'], extras: 0 },
]

export const ODO: OdoReading[] = [
  { id: 'o1', vid: 'v114', date: 'Jul 27, 2026', d: new Date(2026, 6, 27), reading: 92347, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o2', vid: 'v114', date: 'Jul 18, 2026', d: new Date(2026, 6, 18), reading: 92104, source: 'Service record', by: 'K. Ortiz', note: 'Transmission replaced' },
  { id: 'o3', vid: 'v114', date: 'Jul 2, 2026', d: new Date(2026, 6, 2), reading: 91210, source: 'Service record', by: 'K. Ortiz', note: 'Oil change' },
  { id: 'o4', vid: 'v103', date: 'Jul 27, 2026', d: new Date(2026, 6, 27), reading: 58204, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o5', vid: 'v121', date: 'Jul 22, 2026', d: new Date(2026, 6, 22), reading: 128116, source: 'Service record', by: 'K. Ortiz', note: '' },
  { id: 'o6', vid: 'v108', date: 'Jul 18, 2026', d: new Date(2026, 6, 18), reading: 41872, source: 'Manual', by: 'M. Chen', note: '' },
  { id: 'o7', vid: 'v117', date: 'Jul 25, 2026', d: new Date(2026, 6, 25), reading: 40230, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o8', vid: 'v124', date: 'Jul 26, 2026', d: new Date(2026, 6, 26), reading: 36114, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o9', vid: 'v096', date: 'Mar 14, 2026', d: new Date(2026, 2, 14), reading: 154902, source: 'Manual', by: 'K. Ortiz', note: 'Handback reading' },
  { id: 'o10', vid: 'v105', date: 'Jul 24, 2026', d: new Date(2026, 6, 24), reading: 47890, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o11', vid: 'v105', date: 'Jul 8, 2026', d: new Date(2026, 6, 8), reading: 46900, source: 'Service record', by: 'K. Ortiz', note: 'Oil change' },
  { id: 'o12', vid: 'v110', date: 'Jul 26, 2026', d: new Date(2026, 6, 26), reading: 33412, source: 'Manual', by: 'M. Chen', note: '' },
  { id: 'o13', vid: 'v110', date: 'Jun 20, 2026', d: new Date(2026, 5, 20), reading: 32780, source: 'Service record', by: 'K. Ortiz', note: 'Tire rotation' },
  { id: 'o14', vid: 'v116', date: 'Jul 27, 2026', d: new Date(2026, 6, 27), reading: 61209, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o15', vid: 'v116', date: 'Jul 11, 2026', d: new Date(2026, 6, 11), reading: 60540, source: 'Service record', by: 'K. Ortiz', note: 'Brake pads' },
  { id: 'o16', vid: 'v119', date: 'Jul 28, 2026', d: new Date(2026, 6, 28), reading: 88340, source: 'Manual', by: 'D. Reyes', note: '' },
  { id: 'o17', vid: 'v119', date: 'Jul 5, 2026', d: new Date(2026, 6, 5), reading: 87200, source: 'Service record', by: 'K. Ortiz', note: 'Oil change' },
]

/** Which DAs are ranked for which vehicle, best first. */
export const PRIO: Record<string, string[]> = {
  v114: ['d1', 'd2', 'd4', 'd6', 'd3', 'd8'],
  v103: ['d2', 'd5', 'd7', 'd1'],
  v121: ['d4', 'd9', 'd3'],
  v112: ['d1', 'd5', 'd6', 'd2', 'd7'],
  v108: ['d9', 'd4', 'd1', 'd5', 'd2', 'd6'],
  v117: ['d5', 'd2'],
  v124: ['d6', 'd1', 'd2', 'd7', 'd8'],
  v105: ['d8', 'd2', 'd9'],
  v110: ['d1', 'd7'],
  v116: ['d5', 'd6'],
  v119: ['d4', 'd9', 'd2'],
}

export const STATUS_HIST: StatusChange[] = [
  { vid: 'v114', date: 'Jul 18, 2026', from: 'In shop', to: 'In service', reason: "Transmission replaced - Bob's Auto", by: 'K. Ortiz' },
  { vid: 'v114', date: 'Jul 9, 2026', from: 'In service', to: 'In shop', reason: "Transmission slipping - sent to Bob's Auto", by: 'D. Reyes' },
  { vid: 'v114', date: 'Mar 2, 2026', from: 'Grounded', to: 'In service', reason: 'Bodywork complete - Ace Collision', by: 'K. Ortiz' },
  { vid: 'v114', date: 'Feb 20, 2026', from: 'In service', to: 'Grounded', reason: 'Rear-ended in the station lot', by: 'K. Ortiz' },
  { vid: 'v114', date: 'Feb 12, 2024', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v096', date: 'Mar 14, 2026', from: 'In service', to: 'Off fleet', reason: 'Returned to lessor', by: 'J. Doe' },
  { vid: 'v096', date: 'Jun 1, 2021', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v103', date: 'Mar 4, 2023', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v105', date: 'Feb 3, 2024', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v108', date: 'Jul 17, 2026', from: 'In service', to: 'Grounded', reason: 'Brake failure on route - towed in', by: 'D. Reyes' },
  { vid: 'v108', date: 'Jan 12, 2024', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v110', date: 'Mar 22, 2023', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v112', date: 'Jul 2, 2026', from: '-', to: 'In service', reason: 'Vehicle created', by: 'R. Alvarez' },
  { vid: 'v116', date: 'Jul 14, 2026', from: 'In shop', to: 'In service', reason: 'Brake pads replaced under warranty', by: 'K. Ortiz' },
  { vid: 'v116', date: 'Jul 11, 2026', from: 'In service', to: 'In shop', reason: 'Brake pads and rotors worn', by: 'D. Reyes' },
  { vid: 'v116', date: 'Aug 8, 2024', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v117', date: 'Feb 2, 2025', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v119', date: 'Sep 15, 2023', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v121', date: 'Jul 20, 2026', from: 'In service', to: 'In shop', reason: 'Rear door damage - Ace Collision', by: 'D. Reyes' },
  { vid: 'v121', date: 'Aug 19, 2022', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
  { vid: 'v124', date: 'May 30, 2024', from: '-', to: 'In service', reason: 'Vehicle created', by: 'J. Doe' },
]

export const REC_CHANGES: RecordChange[] = [
  { vid: 'v114', date: 'Jul 29, 2026', who: 'K. Ortiz', what: 'Expected back → Jul 26, 2026', source: 'Change status popup' },
  { vid: 'v114', date: 'Jul 21, 2026', who: 'J. Doe', what: 'Type  Step van → Large van', source: 'Edit vehicle popup' },
  { vid: 'v114', date: 'Jul 14, 2026', who: 'R. Alvarez', what: 'External / lessor ID  - → U-40213', source: 'Vehicle file import' },
  { vid: 'v114', date: 'Feb 12, 2024', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v103', date: 'Jun 30, 2026', who: 'K. Ortiz', what: 'Plate  - → 7XKW441', source: 'Edit vehicle popup' },
  { vid: 'v103', date: 'Mar 4, 2023', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v105', date: 'Jul 14, 2026', who: 'R. Alvarez', what: 'External / lessor ID  - → U-40102', source: 'Vehicle file import' },
  { vid: 'v105', date: 'Feb 3, 2024', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v108', date: 'Jul 14, 2026', who: 'R. Alvarez', what: 'External / lessor ID  - → U-40188', source: 'Vehicle file import' },
  { vid: 'v108', date: 'Jan 12, 2024', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v110', date: 'Mar 22, 2023', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v112', date: 'Jul 2, 2026', who: 'R. Alvarez', what: 'Vehicle created', source: 'Vehicle file import' },
  { vid: 'v116', date: 'Aug 8, 2024', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v117', date: 'Feb 2, 2025', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v119', date: 'Sep 15, 2023', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v121', date: 'Aug 19, 2022', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v124', date: 'May 30, 2024', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
  { vid: 'v096', date: 'Jun 1, 2021', who: 'J. Doe', what: 'Vehicle created', source: 'Add vehicle popup' },
]

export const DAS: DA[] = [
  { id: 'd1', name: 'Alvarez, Rosa', tid: 'PACT03', types: ['Large van', 'Small van'], dot: false, active: true },
  { id: 'd2', name: 'Chen, Marcus', tid: 'PACT11', types: ['Large van', 'Small van', 'CDV'], dot: true, active: true },
  { id: 'd3', name: 'Douglas, Kim', tid: 'PACT18', types: ['Step van'], dot: true, active: false },
  { id: 'd4', name: 'Foster, Jamal', tid: 'PACT22', types: ['Step van', 'Large van'], dot: true, active: true },
  { id: 'd5', name: 'Ibarra, Tomas', tid: 'PACT27', types: ['Small van', 'Large van', 'Extra-large van'], dot: false, active: true },
  { id: 'd6', name: 'Nguyen, Lily', tid: 'PACT31', types: ['Large van', 'Extra-large van'], dot: false, active: true },
  { id: 'd7', name: 'Okafor, Sam', tid: 'PACT35', types: ['Small van', 'Large van'], dot: false, active: true },
  { id: 'd8', name: 'Price, Dana', tid: 'PACT39', types: ['CDV'], dot: false, active: true },
  { id: 'd9', name: 'Ruiz, Elena', tid: 'PACT44', types: ['Step van', 'CDV'], dot: true, active: true },
]

export const SVC_CATS = ['Repair', 'Preventive', 'Bodywork', 'Fees / compliance']
export const REN_TYPES = ['Registration', 'Inspection', 'Permit', 'Lease']
export const PAYERS = ['All', 'Out of pocket', 'Amazon', 'FIF', 'Insurance', 'Warranty']
export const PAYER_OPTS = ['Out of pocket', 'Amazon', 'FIF', 'Insurance', 'Warranty']
export const STATUSES: Status[] = ['In service', 'In shop', 'Grounded', 'Off fleet']
/** The service types a vehicle can be tagged with. */
export const SVC_CATALOG = ['CDV', 'DLX5', 'Adhoc', 'Nursery route', 'Step Van']
export const PHOTO_SLOTS = ['front', 'back', 'left', 'right', 'interior']
export const SET_TYPES = ['Pre-trip', 'Post-trip', 'Damage', 'After repair', 'Return']
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
