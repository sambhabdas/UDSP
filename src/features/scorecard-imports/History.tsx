'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { comma, statusTone } from './data'
import type { Batch } from './data'
import { Chip, Empty, GridHead, IconButton, Pager, SearchField, SortHead } from './parts'
import { BATCH_COLS, BATCH_HEADS, CARD, NUM, TILE_LABEL } from './style'
import type { ImportsState } from './useImports'

/** History — every batch already run, and what it did. */
export function History({ s }: { s: ImportsState }) {
  const tiles = [
    { label: 'Batches', value: '6', color: 'var(--blue-700)' },
    { label: 'Events Created', value: '172', color: 'var(--success-fg)' },
    { label: 'Rows Skipped', value: '2,874', color: 'var(--text-secondary)' },
    { label: 'Pending Remediation', value: '5', color: 'var(--warning-fg)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <div key={t.label} style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
              <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
            </div>
            <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
          </div>
        ))}
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Batches</span>
          <Chip label={String(s.batches.length)} bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" />
          <div style={{ flex: 1 }} />
          <FiltersButton s={s} />
          <SearchField value={s.hq} onChange={s.setHq} placeholder="Search source or file" width={220} />
        </div>

        <GridHead cols={BATCH_COLS}>
          {BATCH_HEADS.map(([k, label, justify], i) => (
            <SortHead
              key={label || `col-${i}`}
              label={label}
              justify={justify}
              active={k != null && s.bSort.k === k}
              dir={s.bSort.d}
              onClick={k ? () => s.sortBatches(k) : undefined}
            />
          ))}
        </GridHead>

        {s.pageBatches.slice.map((b) => <Row key={b.file + b.date} s={s} b={b} />)}
        {s.batches.length === 0 && <Empty>No batches match.</Empty>}
        <Pager page={s.pageBatches} setPage={s.setBPg} />
      </div>
    </div>
  )
}

function Row({ s, b }: { s: ImportsState; b: Batch }) {
  const tone = statusTone(b.status)
  const openIssues = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!b.skipped && !b.unmatched) { s.toastMsg('Every row in this batch landed'); return }
    s.setTab('import')
    s.setSrc(b.source)
    s.setStep(5)
    s.closeMenu()
    s.toastMsg(`Review and Run - resolve the rows from ${b.file}`)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: BATCH_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{b.date}</span>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.source}</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.file}</span>
      <span style={{ textAlign: 'right', ...body1, ...NUM }}>{comma(b.rows)}</span>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); s.toastMsg(b.roster ? 'Roster upserts have no events' : `Opening Events · Batch ${b.file}`) }}
        style={{ textAlign: 'right', ...body1, ...NUM }}
      >
        {b.roster ? 'Roster upsert' : b.events}
      </a>
      <a href="#" onClick={openIssues} style={{ textAlign: 'right', ...body1, color: b.skipped ? 'var(--warning-fg)' : 'var(--text-secondary)', ...NUM }}>{comma(b.skipped)}</a>
      <a href="#" onClick={openIssues} style={{ textAlign: 'right', ...body1, color: b.unmatched ? 'var(--warning-fg)' : 'var(--text-secondary)', ...NUM }}>{b.unmatched}</a>
      <span><Chip label={b.status} bg={tone.bg} fg={tone.fg} dot={tone.dot} /></span>
      <IconButton icon="FnMore" color="var(--primary)" onClick={(e) => s.openMenu(e, 'batchKebab', { batch: b })} />
    </div>
  )
}

export function FiltersButton({ s }: { s: ImportsState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.filterCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {s.filterCount > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 var(--size-40)', borderRadius: 'var(--radius-pill)', background: 'var(--primary)', color: 'var(--text-inverse)', ...caption1, fontWeight: 'var(--weight-semibold)' }}>
          {s.filterCount}
        </span>
      )}
    </div>
  )
}
