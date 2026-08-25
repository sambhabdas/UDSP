import { useState } from 'react'
import { AppShell } from './shell/AppShell.jsx'
import { getPortal, firstPageOf, pageLabel } from './shell/nav.js'
import { InboxPage } from './features/inbox/InboxPage.jsx'
import { PayrollSetupPage } from './features/payroll/PayrollSetupPage.jsx'
import { ProfitProjectionPage } from './features/profit-projection/ProfitProjectionPage.jsx'
import { ProfitabilityPage } from './features/profitability/ProfitabilityPage.jsx'
import { NotBuilt } from './shell/NotBuilt.jsx'

// Built screens: Inbox (a single-page portal — the rail entry opens it
// directly) plus Payroll Setup and Profit Projection on Financial Management.
const SCREENS = {
  inbox: InboxPage,
  'finance/payroll-setup': PayrollSetupPage,
  'finance/profit-projection': ProfitProjectionPage,
  'finance/profitability': ProfitabilityPage,
}

export default function App() {
  const [portalId, setPortalId] = useState('finance')
  const [pageId, setPageId] = useState(firstPageOf('finance'))

  const selectPortal = (id) => {
    setPortalId(id)
    setPageId(firstPageOf(id))
  }

  const key = pageId ? `${portalId}/${pageId}` : portalId
  const Screen = SCREENS[key]
  const title = pageLabel(portalId, pageId)

  return (
    <AppShell
      portalId={portalId}
      pageId={pageId}
      onPortal={selectPortal}
      onPage={setPageId}
      title={title}
    >
      {Screen ? <Screen /> : <NotBuilt title={title} portal={getPortal(portalId).name} />}
    </AppShell>
  )
}
