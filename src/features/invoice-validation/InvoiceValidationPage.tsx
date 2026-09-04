'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, subtitle2 } from '../../ds/type'
import { Button, Kpi, Toast } from './parts'
import { Dashboard } from './Dashboard'
import { Validate } from './Validate'
import { RateEditor } from './RateEditor'
import { Dialogs } from './dialogs'
import { FilterDrawer } from './FilterDrawer'
import { billedTotal, hasInvoice, statusName, statusTone } from './calc'
import { weekName, weekRange } from './date'
import { money } from './fmt'
import { useInvoiceValidation } from './useInvoiceValidation'
import type { IvState } from './useInvoiceValidation'

/**
 * Invoice Validation - is Amazon paying what the week actually earned?
 *
 * Two tabs over the same records: the dashboard is every week and its state,
 * the validate tab is one week checked line by line. The KPI strip belongs to
 * whichever tab is showing, so the four numbers always describe what is below.
 */
export function InvoiceValidationPage() {
  const s = useInvoiceValidation()

  return (
    <div
      data-screen-label="Invoice Validation"
      data-rsp-page=""
      onClick={s.closeTransient}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        // The design file subtracts the header; the shell has already done it.
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        padding: 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <Toolbar s={s} />

      <div onScroll={s.closeTransient} style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div data-rsp-minw0="" style={{ minWidth: 1090, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
          <KpiStrip s={s} />
          {s.tab === 'dash' ? <Dashboard s={s} /> : <Validate s={s} />}
        </div>
      </div>

      <RateEditor s={s} />
      <Dialogs s={s} />
      <FilterDrawer s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

function Toolbar({ s }: { s: IvState }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-100) var(--size-200)' }}>
      {([['dash', 'Invoice dashboard'], ['val', 'Validate invoice']] as const).map(([id, label]) => {
        const on = s.tab === id
        return (
          <div
            key={id}
            role="button"
            tabIndex={0}
            onClick={() => { s.setTab(id); s.closeTransient() }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', cursor: 'pointer', paddingBottom: 'var(--size-40)' }}
          >
            <span style={{ ...subtitle2, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {label}
            </span>
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }} />}
          </div>
        )
      })}
      <div style={{ flex: 1 }} />

      {s.tab === 'dash' && (
        <>
          <Button icon="SvExport" onClick={() => s.toastMsg(`Exporting ${s.rows.length} invoices with the current filter.`)}>
            Export
          </Button>
          <Button
            primary
            onClick={() => {
              // Jump to the newest week still waiting on a decision.
              const target = [...s.elapsed].reverse().find((k) => s.inv[k].status === 'pending' && !s.inv[k].na)
              s.openWeek(target ?? s.elapsed[s.elapsed.length - 1])
            }}
          >
            Validate new invoice
          </Button>
        </>
      )}

      {s.tab === 'val' && (
        <>
          <WeekPicker s={s} />
          <Button
            icon="FnUpload"
            disabled={s.decided}
            onClick={s.upload}
            title={s.decided ? 'This invoice is decided. Revert it to pending before replacing it.' : 'PDF · one invoice covers one week'}
          >
            {s.parsing ? 'Reading the invoice' : s.isReplacing ? 'Keep the current invoice' : s.has ? 'Replace invoice' : 'Upload weekly invoice'}
          </Button>
        </>
      )}
    </div>
  )
}

function WeekPicker({ s }: { s: IvState }) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); s.setWeeksOpen(!s.weeksOpen) }}
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          width: 300,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: `1px solid ${s.weeksOpen ? 'var(--border-focus)' : 'var(--border-default)'}`,
          ...body1,
          cursor: 'pointer',
          transition: 'background var(--motion-hover), border-color var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {weekName(s.vWeek)} · {weekRange(s.vWeek)}
        </span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={16} />
        </span>
      </div>

      {s.weeksOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 36,
            right: 0,
            boxSizing: 'border-box',
            width: 340,
            maxHeight: 340,
            overflow: 'hidden auto',
            padding: 'var(--size-40)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          {[...s.elapsed].reverse().map((k) => (
            <WeekRow key={k} s={s} k={k} />
          ))}
        </div>
      )}
    </span>
  )
}

function WeekRow({ s, k }: { s: IvState; k: number }) {
  const [hover, hoverProps] = useHover()
  const i = s.inv[k]
  const on = k === s.vWeek
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { s.setWeeksOpen(false); s.setMenuRow(null); s.openWeek(k) }}
      style={{
        boxSizing: 'border-box',
        minHeight: 'var(--row-height)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--primary)' }}>
        {on && <Icon name="FnCheck" size={16} />}
      </span>
      <span>{weekName(k)}</span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', ...caption1, color: 'var(--text-secondary)' }}>
        {weekRange(k)}
      </span>
      <span style={{ ...caption1, color: statusTone(i).fg }}>{statusName(i)}</span>
    </div>
  )
}

/** Four numbers, and which four depends on the tab. */
function KpiStrip({ s }: { s: IvState }) {
  const tiles = s.tab === 'dash' ? dashTiles(s) : valTiles(s)
  return (
    <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 'var(--size-120)' }}>
      {tiles.map((t) => (
        <Kpi key={t.label} {...t} />
      ))}
    </div>
  )
}

function dashTiles(s: IvState) {
  let validated = 0
  let disputed = 0
  let pending = 0
  let stake = 0
  s.elapsed.forEach((n) => {
    const i = s.inv[n]
    if (i.na) return
    if (i.status === 'validated') validated += 1
    else if (i.status === 'dispute') { disputed += 1; stake += s.comparisonOf(n).atStake }
    else pending += 1
  })
  return [
    { icon: 'PgShieldCheckmark', label: 'Validated', value: String(validated), color: 'var(--success-fg)' },
    { icon: 'PgFlag', label: 'Under dispute', value: String(disputed), color: 'var(--text-primary)' },
    { icon: 'PgReceipt', label: 'Pending', value: String(pending), color: 'var(--text-primary)' },
    { icon: 'PgMoney', label: '$ at stake', value: money(stake), color: stake > 0 ? 'var(--red-600)' : 'var(--text-primary)' },
  ]
}

function valTiles(s: IvState) {
  const has = hasInvoice(s.cur)
  const c = has ? s.comparisonOf(s.vWeek) : null
  return [
    { icon: 'PgReceiptMoney', label: 'Invoice total', value: has ? money(billedTotal(s.weekFigures(s.vWeek))) : '-', color: 'var(--text-primary)' },
    {
      icon: 'PgShieldCheckmark',
      label: 'Check result',
      value: has ? (c!.count ? 'Mismatches' : 'All match') : '-',
      color: has ? (c!.count ? 'var(--red-600)' : 'var(--success-fg)') : 'var(--text-primary)',
    },
    { icon: 'PgFlag', label: 'Discrepancies', value: has ? String(c!.count) : '-', color: has && c!.count ? 'var(--red-600)' : 'var(--text-primary)' },
    { icon: 'PgMoney', label: '$ at stake', value: has ? money(c!.atStake) : '-', color: has && c!.atStake ? 'var(--red-600)' : 'var(--text-primary)' },
  ]
}
