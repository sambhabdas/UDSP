// Number formatting, written out rather than delegated to `toLocaleString`, so
// the server and the browser cannot disagree about a thousands separator.

/** 41208 → "41,208" */
export function num(v: number): string {
  const neg = v < 0
  const s = String(Math.round(Math.abs(v)))
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ','
    out += s[i]
  }
  return neg ? `-${out}` : out
}

/** 349.2 → "$349.20". Always two decimals: these are invoice figures. */
export function money(v: number): string {
  const n = Math.abs(v)
  const whole = Math.floor(n + 1e-9)
  const cents = Math.round((n - whole) * 100)
  // Rounding the cents can carry into the whole part (e.g. 12.999).
  const carried = cents === 100
  return `${v < 0 ? '-' : ''}$${num(whole + (carried ? 1 : 0))}.${String(carried ? 0 : cents).padStart(2, '0')}`
}

/** A rate under a dollar keeps its cents but drops the grouping. */
export const rate = (v: number): string => (v < 1 ? `$${v.toFixed(2)}` : money(v))

/** "+2" / "−3" / "-" - the unit-difference column. */
export const signed = (v: number): string => (v === 0 ? '-' : `${v > 0 ? '+' : '−'}${num(Math.abs(v))}`)

/** The sign is read from the station's side: billed under what ran is red. */
export const signColor = (v: number): string =>
  v === 0 ? 'var(--text-secondary)' : v < 0 ? 'var(--red-600)' : 'var(--green-700)'
