import { networkInterfaces } from 'node:os'
import type { NextConfig } from 'next'

// `next dev` prints a Network URL as well as localhost, and Next 16 refuses to
// serve /_next/* to an origin it was not told about. Opening the app on that
// LAN address then loads the server-rendered HTML but none of the client
// chunks: the page looks right and does nothing, because React never hydrates.
//
// The addresses are read off the machine rather than written down, so a new
// DHCP lease or a second interface does not quietly break the app again.
// DEV_ORIGINS covers anything not on this host — a phone over a tunnel, a
// container, a hostname.
function localAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((iface) => iface ?? [])
    .filter((n) => !n.internal)
    .map((n) => n.address)
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Every screen is a client component — the product is one long interaction,
  // not a document. Typed routes keep the nav honest against the route tree.
  typedRoutes: true,
  // Dev only; `next build` output is unaffected.
  allowedDevOrigins: [
    ...localAddresses(),
    ...(process.env.DEV_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ],
}

export default nextConfig
