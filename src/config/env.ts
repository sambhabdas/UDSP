// Deployment configuration, read once and in one place.
//
// Next.js only inlines `process.env.NEXT_PUBLIC_*` when it is written out
// literally, so every read below is a static property access — a lookup table
// or a computed key would compile to `undefined` in the browser bundle and the
// fallback would silently win everywhere.
//
// Nothing here is a secret. These values are compiled into the client bundle
// in plain text; a credential would be readable by anyone who loads the page.

/** Trim, and treat an empty or whitespace-only value as unset. */
const read = (value: string | undefined, fallback: string): string => {
  const v = value?.trim()
  return v ? v : fallback
}

export const env = {
  /** The rail monogram and the header wordmark. */
  brandName: read(process.env.NEXT_PUBLIC_BRAND_NAME, 'PacTrack'),
  /** The signed-in operator, until there is an auth provider to ask. */
  userName: read(process.env.NEXT_PUBLIC_USER_NAME, 'Kai Sato'),
  /** The station this build dispatches for. */
  stationCode: read(process.env.NEXT_PUBLIC_STATION_CODE, 'DBO1'),
  stationName: read(process.env.NEXT_PUBLIC_STATION_NAME, 'Joliet, IL'),
  companyLegalName: read(process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME, 'Cedar Ridge Logistics LLC'),
  /** The station's outbound SMS line, shown against every message it sends. */
  stationPhone: read(process.env.NEXT_PUBLIC_STATION_PHONE, '+1 (312) 555-6921'),
  /**
   * The locale and currency every figure on every page is formatted in.
   *
   * Fixed rather than taken from the visitor's browser: the server renders the
   * first paint, so a per-visitor locale would make the markup disagree with
   * itself at hydration — and an operator reading "1.204,50" where a colleague
   * reads "1,204.50" is a reconciliation bug, not a preference.
   */
  locale: read(process.env.NEXT_PUBLIC_LOCALE, 'en-US'),
  currency: read(process.env.NEXT_PUBLIC_CURRENCY, 'USD'),
} as const

export type Env = typeof env
