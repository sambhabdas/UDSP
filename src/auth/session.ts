/**
 * The signed session cookie.
 *
 * Web Crypto rather than `node:crypto` on purpose: this module is imported by
 * `middleware.ts`, which Next runs on the Edge runtime where `node:crypto` does
 * not exist. Web Crypto is available in both places, so one implementation
 * serves the middleware that reads the cookie and the route that writes it.
 *
 * The cookie carries who you are and when it expires, and an HMAC over both.
 * Without the signature a browser could simply write `user=admin` and be let
 * in - the value has to be something only the server can produce.
 *
 * This module reads no environment itself; the secret is passed in, so nothing
 * here can accidentally pull a server-only value into a client bundle.
 */

export const SESSION_COOKIE = 'udsp_session'

/** Eight hours - a shift, near enough, and short enough that a shared machine
 *  does not stay signed in overnight. */
export const SESSION_MAX_AGE = 8 * 60 * 60

interface Payload {
  /** Who signed in. */
  u: string
  /** Expiry, epoch seconds. */
  exp: number
}

const enc = new TextEncoder()

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// Typed as ArrayBuffer-backed rather than ArrayBufferLike: Web Crypto will not
// take a view that might sit on a SharedArrayBuffer.
const unb64url = (s: string): Uint8Array<ArrayBuffer> => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  const out = new Uint8Array(new ArrayBuffer(bin.length))
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export async function signSession(username: string, secret: string): Promise<string> {
  const payload: Payload = { u: username, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }
  const body = b64url(enc.encode(JSON.stringify(payload)))
  const mac = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body))
  return `${body}.${b64url(new Uint8Array(mac))}`
}

/** The username the token vouches for, or null if it is forged, tampered with,
 *  malformed or past its expiry. */
export async function readSession(token: string | undefined, secret: string): Promise<string | null> {
  if (!token) return null
  const [body, mac] = token.split('.')
  if (!body || !mac) return null
  try {
    // `verify` is constant-time, which matters: a byte-by-byte comparison would
    // let an attacker discover a valid signature one byte at a time.
    const ok = await crypto.subtle.verify('HMAC', await key(secret), unb64url(mac), enc.encode(body))
    if (!ok) return null
    const payload = JSON.parse(new TextDecoder().decode(unb64url(body))) as Payload
    if (typeof payload.u !== 'string' || typeof payload.exp !== 'number') return null
    if (payload.exp * 1000 < Date.now()) return null
    return payload.u
  } catch {
    return null
  }
}
