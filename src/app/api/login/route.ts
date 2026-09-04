import { NextResponse } from 'next/server'
import { authConfig, safeEqual } from '../../../auth/config'
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from '../../../auth/session'

/**
 * Checks a sign-in and, if it holds, hands back a signed cookie.
 *
 * The check happens here rather than in the page because the password lives in
 * a server-only environment variable. A client-side comparison would need the
 * expected value in the browser, which would mean shipping it.
 */
export async function POST(request: Request) {
  let username = ''
  let password = ''
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown }
    username = typeof body.username === 'string' ? body.username : ''
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const cfg = authConfig()
  // Both halves are always compared, so a wrong username and a wrong password
  // take the same time and the response cannot say which was wrong.
  const ok = safeEqual(username, cfg.username) && safeEqual(password, cfg.password)
  if (!ok) {
    return NextResponse.json({ error: 'That username and password do not match.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, await signSession(cfg.username, cfg.secret), {
    httpOnly: true, // script cannot read it, so an XSS bug cannot steal the session
    sameSite: 'lax', // survives a normal link into the app, not a cross-site POST
    secure: process.env.NODE_ENV === 'production', // dev is plain http on localhost
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}
