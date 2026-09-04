import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, readSession } from './auth/session'

/**
 * The gate. Every console route goes through here, so a page cannot be reached
 * by typing its URL, and a screen never has to check for itself.
 *
 * Running here rather than in a layout matters: a layout check runs after the
 * route's own code has already been entered, whereas this redirects before the
 * page is rendered at all.
 *
 * `proxy.ts` is Next 16's name for what used to be `middleware.ts`; the old
 * file convention still works but warns on every build.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const secret = process.env.AUTH_SECRET
  // A missing secret cannot mean "let everyone in". Send them to the sign-in
  // screen, which reports the misconfiguration rather than pretending.
  const user = secret ? await readSession(request.cookies.get(SESSION_COOKIE)?.value, secret) : null

  if (pathname === '/login') {
    // Already signed in? The sign-in screen has nothing to offer.
    return user ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }

  if (user) return NextResponse.next()

  const url = new URL('/login', request.url)
  // Remember where they were headed so signing in finishes the journey rather
  // than dumping them on the default page.
  if (pathname !== '/') url.searchParams.set('next', pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  // Everything except Next's own assets, the sign-in endpoints, and the icons a
  // browser fetches before it has any cookie to send.
  matcher: ['/((?!_next/static|_next/image|api/login|api/logout|favicon.ico|icon.svg).*)'],
}
