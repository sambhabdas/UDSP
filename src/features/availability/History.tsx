'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import { SCHEDULE_SOURCE, batchTone } from './data'
import type { Batch } from './data'
import { Card, CardTitle, Chip, IconButton, SearchField } from './parts'
import { BATCH_COLS, BATCH_HEADS, LABEL, NUM, TILE_LABEL } from './style'
import type { AvailabilityState } from './useAvailability'

/** History - every import already run, and what it wrote. */
export function History({ s }: { s: AvailabilityState }) {
  const pending = s.batches.filter((b) => b.status === 'Needs review').reduce((a, b) => a + b.unmatched, 0)
  const tiles = [
    { label: 'Batches', value: String(s.batches.length), color: 'var(--blue-700)' },
    // A rolled-back batch wrote nothing that is still standing.
    { label: 'Cells written', value: String(s.batches.reduce((a, b) => a + (b.status === 'Rolled back' ? 0 : b.events), 0)), color: 'var(--success-fg)' },
    { label: 'Rows skipped', value: String(s.batches.reduce((a, b) => a + b.skipped, 0)), color: 'var(--text-secondary)' },
    { label: 'Pending remediation', value: String(pending), color: pending ? 'var(--warning-fg)' : 'var(--text-secondary)' },
  ]

  return (
    <div
      data-rsp-page=""
      style={{ boxSizing: 'border-box', flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-160) var(--size-200) var(--size-480) var(--size-200)' }}
    >
      <div style={{ minWidth: 1020, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--size-120)' }}>
          {tiles.map((t) => (
            <div key={t.label} style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ marginBottom: 'var(--size-40)', ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
              <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
            </div>
          ))}
        </div>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
            <CardTitle>Batches</CardTitle>
            <div style={{ flex: 1 }} />
            <FiltersButton s={s} />
            <SearchField value={s.bq} onChange={(v) => { s.setBq(v); s.setBPg(1) }} placeholder="Search source or file" width={240} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: BATCH_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
            {BATCH_HEADS.map(([k, label, justify], i) => (
              <div
                key={label || `col-${i}`}
                data-fx=""
                tabIndex={0}
                role="button"
                onClick={k ? () => s.sortBatches(k) : undefined}
                onMouseDown={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', justifyContent: justify, ...LABEL, color: 'var(--text-secondary)', cursor: k ? 'pointer' : 'default', whiteSpace: 'nowrap', borderRadius: 'var(--radius-small)' }}
              >
                <span>{label}</span>
                {k && (
                  <span style={{ display: 'flex', color: s.bSort === k ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                    <Icon name={s.bSort === k ? (s.bDir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
                  </span>
                )}
              </div>
            ))}
          </div>

          {s.batchSlice.map(({ b, i }) => <Row key={b.file + b.date} s={s} b={b} index={i} />)}

          {s.historyRows.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>No batches match.</span>
            </div>
          )}

          <Pager s={s} />
        </Card>
      </div>
    </div>
  )
}

function Row({ s, b, index }: { s: AvailabilityState; b: Batch; index: number }) {
  const tone = batchTone(b.status)
  const openIssues = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!b.skipped && !b.unmatched) { s.toastMsg('Every row in this batch landed'); return }
    s.setTab('Import')
    s.setImportType(b.source)
    s.setStep(5)
    s.closeMenu()
    s.toastMsg(`Review and run - resolve the rows from ${b.file}`)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: BATCH_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 'var(--row-height)', padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{b.date}</span>
      <span style={{ ...caption1Strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.source}</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.file}</span>
      <span style={{ textAlign: 'right', ...caption1, ...NUM }}>{b.rows}</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          s.toastMsg(b.source === SCHEDULE_SOURCE ? 'Jul 19 - 25 shift record · 41 rows' : `${b.events} cells written by ${b.file}`)
        }}
        style={{ textAlign: 'right', ...caption1, ...NUM }}
      >
        {b.events}
      </a>
      <a href="#" onClick={openIssues} style={{ textAlign: 'right', ...caption1, color: b.skipped ? 'var(--warning-fg)' : 'var(--text-secondary)', ...NUM }}>{b.skipped}</a>
      <a href="#" onClick={openIssues} style={{ textAlign: 'right', ...caption1, color: b.unmatched ? 'var(--warning-fg)' : 'var(--text-secondary)', ...NUM }}>{b.unmatched}</a>
      <span><Chip label={b.status} bg={tone.bg} fg={tone.fg} dot={tone.dot} /></span>
      <IconButton icon="SvMore" title="Batch actions" color="var(--primary)" onClick={(e) => s.openMenu(e, 'batchKebab', { batch: b, batchIndex: index })} />
    </div>
  )
}

function Pager({ s }: { s: AvailabilityState }) {
  const total = s.historyRows.length
  const pages: number[] = []
  for (let i = 1; i <= s.bMaxPg; i++) pages.push(i)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM, whiteSpace: 'nowrap' }}>
        Showing {total ? (s.bPage - 1) * 8 + 1 : 0} - {Math.min(s.bPage * 8, total)} of {total}
      </span>
      <div style={{ flex: 1 }} />
      <IconButton icon="SvChevron" rotate={90} bordered color={s.bPage > 1 ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (s.bPage > 1) s.setBPg(s.bPage - 1) }} />
      {pages.map((i) => (
        <PageChip key={i} n={i} on={i === s.bPage} onClick={() => s.setBPg(i)} />
      ))}
      <IconButton icon="SvChevron" rotate={-90} bordered color={s.bPage < s.bMaxPg ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (s.bPage < s.bMaxPg) s.setBPg(s.bPage + 1) }} />
    </div>
  )
}

function PageChip({ n, on, onClick }: { n: number; on: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 28,
        padding: '0 var(--size-60)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        color: on ? 'var(--blue-700)' : 'var(--text-primary)',
        ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        cursor: 'pointer', ...NUM,
      }}
      {...hoverProps}
    >
      {n}
    </div>
  )
}

function FiltersButton({ s }: { s: AvailabilityState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={s.openFilters}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-60)',
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.historyFilterCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...caption1Strong, whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {s.historyFilterCount > 0 && (
        <Chip label={String(s.historyFilterCount)} bg="var(--blue-100)" fg="var(--blue-700)" border="var(--blue-200)" />
      )}
    </div>
  )
}
