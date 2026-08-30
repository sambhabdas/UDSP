import { redirect } from 'next/navigation'
import { DEFAULT_ROUTE } from '../shell/nav'

// `/` is not a screen — the product always opens on a page of a portal.
export default function Index() {
  redirect(DEFAULT_ROUTE)
}
