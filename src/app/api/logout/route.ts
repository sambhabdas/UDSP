import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '../../../auth/session'

/** Drops the session cookie. A POST, not a GET, so a stray link or a prefetch
 *  cannot sign someone out. */
export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
