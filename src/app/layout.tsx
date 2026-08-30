import type { Metadata, Viewport } from 'next'
import { AppShell } from '../shell/AppShell'
import { BRAND } from '../shell/nav'
import '../ds/styles.css'
import '../app.css'

export const metadata: Metadata = {
  title: { default: `${BRAND} · Ultimate DSP`, template: `%s · ${BRAND}` },
  description: 'Dispatch, fleet, scorecard and finance operations for a delivery station.',
  // The icon is `app/icon.svg` — Next serves it and writes the <link> itself,
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

// The shell lives in the layout so the rail, the flyout and the header survive
// navigation — only the screen under them re-renders.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
