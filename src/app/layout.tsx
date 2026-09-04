import type { Metadata, Viewport } from 'next'
import { BRAND } from '../shell/nav'
import '../ds/styles.css'
import '../app.css'

export const metadata: Metadata = {
  title: { default: `${BRAND} · Ultimate DSP`, template: `%s · ${BRAND}` },
  description: 'Dispatch, fleet, scorecard and finance operations for a delivery station.',
  // The icon is `app/icon.svg` - Next serves it and writes the <link> itself,
  // which also answers the browser's unprompted /favicon.ico probe. Declaring
  // it here as well would emit a second, competing link.
}

// The console is a fixed-height application frame, so the visual viewport must
// not zoom out from under it on a phone.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/**
 * The document, and nothing else.
 *
 * The rail and header used to live here, which meant every route got them -
 * including the sign-in screen, which must not show the navigation of an app
 * you have not been let into yet. They now sit on `(console)/layout.tsx`, a
 * route group, so the URLs are unchanged and `/login` renders bare.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
