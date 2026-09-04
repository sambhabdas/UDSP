import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NotBuilt } from '../../../shell/NotBuilt'
import { BUILT_COUNT, allRoutes, pageLabel, resolveRoute } from '../../../shell/nav'

// The fallback half of the nav. Every built page has its own route segment under
// `app/`, which takes precedence over this catch-all; what is left are the real
// nav entries with no screen behind them yet, plus anything that is not a nav
// entry at all.
//
// Keeping them apart is what keeps the bundles apart: one catch-all serving all
// eleven screens meant one module graph, and every page shipped every other
// page's code and seed data.
export function generateStaticParams() {
  return allRoutes('unbuilt').map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const route = resolveRoute((await params).slug)
  return route ? { title: pageLabel(route.portal.id, route.pageId) } : {}
}

export default async function PortalPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const route = resolveRoute((await params).slug)
  if (!route) notFound()

  const { portal, pageId } = route
  return (
    <NotBuilt
      title={pageLabel(portal.id, pageId)}
      portal={portal.name}
      builtCount={BUILT_COUNT}
    />
  )
}
