/**
 * The sign-in credentials and the cookie secret.
 *
 * SERVER ONLY. None of these names carry the `NEXT_PUBLIC_` prefix, which is
 * exactly the point: Next inlines a `NEXT_PUBLIC_*` read into the client bundle
 * as plain text, so a password put there would be readable by anyone who opened
 * devtools. These are read on the server and never sent to the browser - the
 * browser only ever receives the signed cookie.
 *
 * Never import this module from a client component. `src/config/env.ts` is the
 * public half, and is the only one a screen should need.
 */

const required = (name: string, value: string | undefined): string => {
  const v = value?.trim()
  if (v) return v
  // Failing loudly at the first request beats booting a console that quietly
  // lets everyone in, or one that refuses a correct password.
  throw new Error(
    `${name} is not set. Copy .env.example to .env.local and fill it in - the app cannot check a sign-in without it.`,
  )
}

export const authConfig = () => ({
  username: required('AUTH_USERNAME', process.env.AUTH_USERNAME),
  password: required('AUTH_PASSWORD', process.env.AUTH_PASSWORD),
  /** Signs the session cookie. Changing it signs everyone out. */
  secret: required('AUTH_SECRET', process.env.AUTH_SECRET),
})

/**
 * A comparison whose duration does not depend on how much of the input matched.
 *
 * `a === b` returns as soon as two bytes differ, and that timing difference is
 * enough to recover a secret one character at a time over many attempts. This
 * always walks the whole length.
 */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  // Length alone still leaks, so compare against a fixed span and fold the
  // length difference into the result rather than returning early.
  let diff = x.length ^ y.length
  const n = Math.max(x.length, y.length)
  for (let i = 0; i < n; i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}
