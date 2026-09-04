// Number and money formatting.
//
// One implementation, pinned to the configured locale. Bare `toLocaleString()`
// follows whatever locale the runtime happens to have, which means the server
// and the browser can disagree about a thousands separator - a hydration
// mismatch, and a figure two operators read differently.

import { env } from '../config/env'

const group = new Intl.NumberFormat(env.locale)
const group2 = new Intl.NumberFormat(env.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const currency0 = new Intl.NumberFormat(env.locale, { style: 'currency', currency: env.currency, maximumFractionDigits: 0 })
const currency2 = new Intl.NumberFormat(env.locale, { style: 'currency', currency: env.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "1,204" - a whole number with thousands separators. */
export const int = (n: number): string => group.format(n)

/** "1,204.50" - always two decimals, no currency symbol. */
export const dec2 = (n: number): string => group2.format(n)

/** "$1,204.50". */
export const money = (n: number): string => currency2.format(n)

/** "$1,205" - rounded, for figures where the cents are noise. */
export const money0 = (n: number): string => currency0.format(Math.round(n))

/**
 * "-$1,204.50" - the sign outside the symbol.
 *
 * Accounting reads the minus before the currency; `Intl` puts it inside for
 * some locales, so the sign is applied by hand to keep ledgers scannable.
 */
export const signedMoney = (n: number): string => (n < 0 ? `-${money(Math.abs(n))}` : money(n))

/** The same at whole dollars - `-$1,204`, the way the fleet boards write it. */
export const signedMoney0 = (n: number): string => (n < 0 ? `-${money0(Math.abs(n))}` : money0(n))

/** "+12", "-31", "0" - the sign is part of the reading, so it is never dropped. */
export const signed = (n: number): string => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n)}`

/** `n` decimals, grouped. */
export const fixed = (n: number, digits: number): string =>
  new Intl.NumberFormat(env.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
