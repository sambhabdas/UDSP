'use client'

import { MONTHS_FULL, TABS, VEHICLES } from './data'
import { cell, money } from './calc'
import { Dashboard } from './Dashboard'
import { Grid } from './Grid'
import { FilterDrawer, HistoryDrawer, ImportDialog, RetroDialog } from './dialogs'
import { Button, PeriodPicker, SelSummary, Toast } from './parts'
import { useFleetFinancials } from './useFleetFinancials'
import type { FleetFinancialsState } from './useFleetFinancials'
import { subtitle2 } from '../../ds/type'

/**
 * Fleet Financials: what the fleet earns and what it costs.
 *
 * A dashboard that nets the three money streams per van, and three grids that
 * are where those streams actually get typed in and reconciled against the
 * lessor's, the insurer's and Amazon's own statements.
 */
export function FleetFinancialsPage() {
  const s = useFleetFinancials()

  return (
    <div
      data-screen-label="Fleet Financials"
      data-rsp-page=""
      onClick={s.pageClick}
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
      <TopBar s={s} />

      {/* The dashboard scrolls as a page; a grid keeps its own scroller so its
          sticky header and frozen columns stay put. */}
      <div style={{ flex: 1, minHeight: 0, overflow: s.isGrid ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <div
          data-rsp-minw0=""
          style={{ minWidth: 1120, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}
        >
          {s.isDash ? <Dashboard s={s} /> : <Grid s={s} />}
        </div>
      </div>

      <RetroDialog s={s} />
      <ImportDialog s={s} />
      <HistoryDrawer s={s} />
      <FilterDrawer s={s} />
      <Selection s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

function TopBar({ s }: { s: FleetFinancialsState }) {
  const label = s.monthly ? `Year · ${s.year}` : `Month · ${MONTHS_FULL[s.month]} ${s.year}`
  const items = s.monthly
    ? [2025, 2026, 2027].map((y) => ({ key: y, label: String(y) }))
    : MONTHS_FULL.map((m, i) => ({ key: i, label: `${m} 2026` }))

  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-100) var(--size-200)' }}>
      {TABS.map(([id, tabLabel]) => {
        const on = s.tab === id
        return (
          <div
            key={id}
            role="button"
            tabIndex={0}
            onClick={() => { s.setTab(id as typeof s.tab); s.setEdit(null); s.setOnlyIncomplete(false); s.setSel(null) }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', cursor: 'pointer', paddingBottom: 'var(--size-40)' }}
          >
            <span
              style={{
                ...subtitle2,
                fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {tabLabel}
            </span>
            {on && (
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }} />
            )}
          </div>
        )
      })}

      <div style={{ flex: 1 }} />

      <PeriodPicker
        label={label}
        open={s.periodOpen}
        items={items}
        current={s.monthly ? s.year : s.month}
        onToggle={(e) => { e.stopPropagation(); s.setPeriodOpen(!s.periodOpen) }}
        onPick={(key) => {
          if (s.monthly) s.setYear(Number(key))
          else s.setMonth(Number(key))
          s.setPeriodOpen(false)
        }}
      />

      <Button icon="SvExport" onClick={() => doExport(s)}>Export</Button>
    </div>
  )
}

/** Build a CSV of whatever is on screen and hand it to the browser. */
function doExport(s: FleetFinancialsState) {
  const periodPlain = s.monthly ? String(s.year) : `${MONTHS_FULL[s.month]} ${s.year}`
  let head: string[]
  let lines: (string | number)[][]
  let name: string

  if (s.isDash) {
    head = ['Vehicle', 'VIN', 'Status', 'Days', 'Amazon in', 'Lease', 'Insurance', 'Service OOP', 'NET', 'Margin %']
    lines = VEHICLES.filter(s.match).map((v) => {
      const a = s.amazonOf(v.id)
      const net = s.vanNetOf(v)
      return [
        v.name, v.vin, v.status, v.days, a,
        cell(s.cells, 'lease', v.id, s.month) ?? '',
        cell(s.cells, 'ins', v.id, s.month) ?? '',
        v.oop, net, a > 0 ? ((net / a) * 100).toFixed(1) : '',
      ]
    })
    name = `unit-economics-${periodPlain.toLowerCase().replace(/ /g, '-')}.csv`
  } else {
    head = ['Vehicle', 'VIN', 'Status'].concat(s.cols.map((c) => c.label))
    lines = s.rowIds.map((id) => {
      const v = VEHICLES.find((x) => x.id === id)
      const identity: (string | number)[] = [v ? v.name : 'Fleet (unallocated)', v ? v.vin : '', v ? v.status : '']
      return identity.concat(s.cols.map((c) => cell(s.cells, s.gridTab, id, c.id) ?? ''))
    })
    name = `${s.isIns ? 'insurance' : s.isLease ? 'lease' : 'amazon-payments'}-${periodPlain.toLowerCase().replace(/ /g, '-')}.csv`
  }

  const csv = [head, ...lines]
    .map((r) => r.map((x) => (/[",\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : x)).join(','))
    .join('\n')
  const a = document.createElement('a')
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
  a.download = name
  a.click()
  s.toastMsg(`Exported ${name}`)
}

/** The read-out that appears once more than one cell is held. */
function Selection({ s }: { s: FleetFinancialsState }) {
  if (!s.sel || !s.isGrid) return null
  let count = 0
  let sum = 0
  s.rowIds.forEach((id, r) =>
    s.cols.forEach((c, ci) => {
      if (!s.inSel(r, ci)) return
      const v = cell(s.cells, s.gridTab, id, c.id)
      if (v !== null) { count++; sum += v }
    }),
  )
  if (count <= 1) return null
  return <SelSummary>{`${count} cells · Sum ${money(sum, true)} · Avg ${money(sum / count, true)}`}</SelSummary>
}
