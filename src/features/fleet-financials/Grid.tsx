'use client'

import { body1, caption1 } from '../../ds/type'
import { VEHICLES } from './data'
import { cell, money, statusTone } from './calc'
import { Button, DotPill, FilterButton, IconButton, SearchBox, SectionTitle } from './parts'
import { CARD } from './style'
import type { FleetFinancialsState } from './useFleetFinancials'

/**
 * The money grid: insurance and lease by month, Amazon payments by week.
 *
 * It behaves like a spreadsheet on purpose — click and drag to select, type to
 * edit, ctrl+C / V / D / Z — because reconciling a lessor statement is a
 * spreadsheet job, and forcing it through a form would be slower than the
 * spreadsheet people would otherwise open instead.
 */
export function Grid({ s }: { s: FleetFinancialsState }) {
  const title = s.isIns ? 'Insurance' : s.isLease ? 'Lease' : 'Amazon Payments'
  const empty = s.rowIds.length === 0

  return (
    <div style={{ ...CARD, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
        <SectionTitle>{title}</SectionTitle>
        <div style={{ flex: 1 }} />
        <FilterButton count={s.fpCount} onClick={() => { s.setPf({ sts: { ...s.sSts }, inc: s.onlyIncomplete }); s.setFpOpen(true) }} />
        <SearchBox value={s.search} onChange={s.setSearch} />
        <Button primary icon="FnUpload" onClick={() => { s.setImportOpen(true); s.setImpStep(1); s.setImpFileName(''); s.setResolvedVan(null); s.setResolvePickerOpen(false) }}>
          Import
        </Button>
        <span style={{ position: 'relative', display: 'flex' }}>
          <IconButton name="FnMore" size={20} box={32} bordered title="More" onClick={(e) => { e.stopPropagation(); s.setKebabOpen(!s.kebabOpen) }} />
          {s.kebabOpen && (
            <div
              style={{
                position: 'absolute', top: 36, right: 0, boxSizing: 'border-box', width: 180,
                padding: 'var(--size-40)', background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
                boxShadow: 'var(--elevation-menu)', zIndex: 30, display: 'flex', flexDirection: 'column',
              }}
            >
              <MenuRow label="Change history" onClick={() => { s.setKebabOpen(false); s.setHistoryOpen(true) }} />
            </div>
          )}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ minWidth: s.isAmz ? 1180 : 1660 }}>
          <HeadRow s={s} />
          {empty ? (
            <EmptyGrid s={s} />
          ) : (
            <>
              {s.isAmz && (
                <>
                  <CountRow s={s} label="Peak routes" values={s.WK.map((w) => w.peak)} />
                  <CountRow s={s} label="Vehicles paid" values={s.WK.map((w) => w.paid)} />
                </>
              )}
              {s.rowIds.map((id, ri) => (
                <BodyRow key={id} id={id} ri={ri} s={s} />
              ))}
              <TotalsRow s={s} />
            </>
          )}
          {s.isAmz && !empty && <MonthTotal s={s} />}
        </div>
      </div>
    </div>
  )
}

const gridCols = (isAmz: boolean) =>
  isAmz ? '160px 180px 130px repeat(5,minmax(130px,1fr))' : '160px 180px 130px repeat(12,minmax(96px,1fr))'

/** The three identity columns stay put while the money scrolls sideways. */
const STICKY = [0, 160, 340]

function HeadRow({ s }: { s: FleetFinancialsState }) {
  const heads = [
    { label: 'Vehicle', align: 'left' as const, left: 0 },
    { label: 'VIN', align: 'left' as const, left: 160 },
    { label: 'Status', align: 'left' as const, left: 340 },
  ]
  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 5,
        display: 'grid', gridTemplateColumns: gridCols(s.isAmz), alignItems: 'stretch',
        background: 'var(--surface-subtle)',
        borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
      }}
    >
      {heads.map((h) => (
        <HeadCell key={h.label} label={h.label} align={h.align} left={h.left} />
      ))}
      {s.cols.map((c) => (
        <HeadCell key={String(c.id)} label={c.label} align="right" />
      ))}
    </div>
  )
}

function HeadCell({ label, align, left }: { label: string; align: 'left' | 'right'; left?: number }) {
  return (
    <div
      style={{
        position: left === undefined ? 'static' : 'sticky',
        left,
        zIndex: left === undefined ? 1 : 6,
        background: 'var(--surface-subtle)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
        padding: 'var(--size-100) var(--size-100)',
        textAlign: align,
        fontSize: 'var(--caption-1-size)', lineHeight: 'var(--caption-1-lh)',
        fontWeight: 'var(--weight-semibold)', letterSpacing: '.6px', textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}
    >
      <span>{label}</span>
    </div>
  )
}

/** Peak routes and Vehicles paid — context above the Amazon columns, not data. */
function CountRow({ s, label, values }: { s: FleetFinancialsState; label: string; values: number[] }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: gridCols(s.isAmz), alignItems: 'center',
        minHeight: 40, borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)',
      }}
    >
      <StickyCell left={STICKY[0]} bg="var(--surface-subtle)">
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </StickyCell>
      <StickyCell left={STICKY[1]} bg="var(--surface-subtle)" />
      <StickyCell left={STICKY[2]} bg="var(--surface-subtle)" borderRight />
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: 'var(--size-60) var(--size-100)', background: 'var(--surface-subtle)',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ ...body1, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function StickyCell({
  left,
  bg,
  borderRight,
  children,
}: {
  left: number
  bg: string
  borderRight?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'sticky', left, zIndex: 2, background: bg,
        display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box',
        padding: 'var(--size-60) var(--size-100)', minWidth: 0,
        borderRight: borderRight ? '1px solid var(--border-subtle)' : undefined,
      }}
    >
      {children}
    </div>
  )
}

function BodyRow({ id, ri, s }: { id: string; ri: number; s: FleetFinancialsState }) {
  const v = VEHICLES.find((x) => x.id === id)
  const isUnalloc = id === 'unalloc'
  const off = !!v?.off
  const solidBg = off || isUnalloc ? 'var(--surface-subtle)' : 'var(--surface-card)'
  const t = v ? statusTone(v.status) : null

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: gridCols(s.isAmz), alignItems: 'center',
        minHeight: isUnalloc ? 48 : 44,
        borderBottom: '1px solid var(--border-subtle)',
        background: off || isUnalloc ? 'var(--surface-subtle)' : 'transparent',
      }}
    >
      <div
        style={{
          position: 'sticky', left: STICKY[0], zIndex: 2, background: solidBg,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
          padding: 'var(--size-60) var(--size-100)', minWidth: 0, height: '100%', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <span
            style={{
              ...body1,
              fontWeight: isUnalloc ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              color: off ? 'var(--text-secondary)' : 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {isUnalloc ? 'Fleet (unallocated)' : v!.name}
          </span>
        </div>
      </div>

      <span
        style={{
          position: 'sticky', left: STICKY[1], zIndex: 2, background: solidBg,
          display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box',
          padding: 'var(--size-60) var(--size-100)',
          ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        {isUnalloc ? '' : v!.vin}
      </span>

      <div
        style={{
          position: 'sticky', left: STICKY[2], zIndex: 2, background: solidBg,
          display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box',
          padding: 'var(--size-60) var(--size-100)', borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {v && t && <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{v.status}</DotPill>}
      </div>

      {s.cols.map((c, ci) => (
        <MoneyCell key={String(c.id)} s={s} vid={id} colId={c.id} ci={ci} ri={ri} />
      ))}
    </div>
  )
}

function MoneyCell({
  s,
  vid,
  colId,
  ci,
  ri,
}: {
  s: FleetFinancialsState
  vid: string
  colId: string | number
  ci: number
  ri: number
}) {
  const val = cell(s.cells, s.gridTab, vid, colId)
  const locked = s.locked(vid, ci)
  const editing = !!s.edit && s.edit.tab === s.gridTab && s.edit.vid === vid && String(s.edit.col) === String(colId)
  const selected = !locked && s.inSel(ri, ci)
  const isFocus = !!s.sel && s.sel.f.r === ri && s.sel.f.c === ci
  const ended = s.isAmz ? s.WK[ci].ended : Number(colId) < 6

  return (
    <div
      data-cell={locked ? 'false' : 'true'}
      role={locked ? undefined : 'button'}
      tabIndex={locked ? undefined : 0}
      title={
        locked
          ? 'Off fleet. No charge can be recorded for this period.'
          : ended ? 'This period has ended. An edit will ask for a reason.' : ''
      }
      onMouseDown={
        locked
          ? undefined
          : (e) => {
              if (e.button !== 0) return
              const cur = s.sel
              // Shift extends the range, ctrl toggles one cell in or out of it,
              // and a plain click starts a fresh one.
              if (e.shiftKey && cur) {
                s.setSel({ a: cur.a, f: { r: ri, c: ci }, extras: cur.extras })
                s.setDragging(true)
              } else if ((e.ctrlKey || e.metaKey) && cur) {
                const extras = { ...cur.extras }
                const k = `${ri}|${ci}`
                extras[k] = extras[k] === undefined ? !s.inSel(ri, ci) : !extras[k]
                s.setSel({ a: cur.a, f: { r: ri, c: ci }, extras })
                s.setDragging(false)
              } else {
                s.setSel({ a: { r: ri, c: ci }, f: { r: ri, c: ci }, extras: {} })
                s.setDragging(true)
              }
            }
      }
      onMouseEnter={
        locked ? undefined : () => { if (s.dragging && s.sel) s.setSel({ a: s.sel.a, f: { r: ri, c: ci }, extras: s.sel.extras }) }
      }
      onDoubleClick={locked ? undefined : () => s.startEdit(s.gridTab, vid, colId, val)}
      style={{
        position: 'relative', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-40)',
        padding: editing ? 0 : 'var(--size-60) var(--size-100)',
        background: locked ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        boxShadow: editing
          ? 'inset 0 0 0 2px var(--primary)'
          : isFocus ? 'inset 0 0 0 1.5px var(--primary)' : 'none',
        cursor: locked ? 'default' : 'cell',
        borderLeft: '1px solid var(--border-subtle)',
        userSelect: 'none',
      }}
    >
      {editing ? (
        <input
          autoFocus
          value={s.editValue}
          onChange={(e) => {
            // Only one leading $, and only digits behind it.
            let v = e.target.value.replace(/[^0-9.$,-]/g, '').replace(/\$/g, '')
            if (v !== '') v = `$${v}`
            s.setEditValue(v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') s.commitEdit()
            if (e.key === 'Escape') s.setEdit(null)
          }}
          onBlur={() => s.setEdit(null)}
          style={{
            boxSizing: 'border-box', width: '100%', height: '100%', minWidth: 0,
            textAlign: 'right', border: 'none', background: 'transparent',
            padding: '0 var(--size-100)', ...body1,
            fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)',
          }}
        />
      ) : (
        <span
          style={{
            ...body1,
            color: locked ? 'var(--text-disabled)' : val !== null && val < 0 ? 'var(--danger-fg)' : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {locked ? '-' : val === null ? '' : money(val, true)}
        </span>
      )}

      {/* The fill handle, on the focus cell only — drag it down to copy. */}
      {isFocus && !editing && !s.dragging && (
        <span
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); s.setDragging(true); s.setFillDrag(true) }}
          title="Drag down to fill"
          style={{
            position: 'absolute', right: -3, bottom: -3, width: 7, height: 7,
            background: 'var(--primary)', border: '1px solid var(--surface-card)',
            cursor: 'crosshair', zIndex: 3,
          }}
        />
      )}
    </div>
  )
}

function TotalsRow({ s }: { s: FleetFinancialsState }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: gridCols(s.isAmz), alignItems: 'center',
        minHeight: 44, background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)',
      }}
    >
      <span
        style={{
          position: 'sticky', left: STICKY[0], zIndex: 2, background: 'var(--surface-subtle)',
          display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box',
          padding: 'var(--size-60) var(--size-100)', ...body1, fontWeight: 'var(--weight-semibold)',
        }}
      >
        Total
      </span>
      <span style={{ position: 'sticky', left: STICKY[1], zIndex: 2, background: 'var(--surface-subtle)', height: '100%' }} />
      <span style={{ position: 'sticky', left: STICKY[2], zIndex: 2, background: 'var(--surface-subtle)', height: '100%', borderRight: '1px solid var(--border-subtle)' }} />
      {s.cols.map((c) => {
        let t = 0
        s.rowIds.forEach((id) => {
          const v = cell(s.cells, s.gridTab, id, c.id)
          if (v !== null) t += v
        })
        return (
          <span
            key={String(c.id)}
            style={{
              textAlign: 'right', padding: 'var(--size-60) var(--size-100)',
              ...body1, fontWeight: 'var(--weight-semibold)',
              fontVariantNumeric: 'tabular-nums', borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            {money(t, true)}
          </span>
        )
      })}
    </div>
  )
}

/** Amazon only: the month's total against what the statement claimed. */
function MonthTotal({ s }: { s: FleetFinancialsState }) {
  let total = 0
  s.WK.forEach((w) => {
    VEHICLES.forEach((v) => { total += cell(s.cells, 'amz', v.id, w.id) ?? 0 })
    total += cell(s.cells, 'amz', 'unalloc', w.id) ?? 0
  })

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: 'var(--size-80) var(--size-200)',
        padding: 'var(--size-120) var(--size-160)', borderTop: '1px solid var(--border-default)',
      }}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Month total {money(total, true)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>Statement total (as filed)</span>
        <input
          value={s.stmt}
          onChange={(e) => s.setStmt(e.target.value)}
          placeholder="-"
          style={{
            width: 140, height: 'var(--control-height)', boxSizing: 'border-box',
            textAlign: 'right', padding: '0 var(--size-80)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)', ...body1, fontVariantNumeric: 'tabular-nums',
          }}
        />
      </div>
    </div>
  )
}

function EmptyGrid({ s }: { s: FleetFinancialsState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-480) var(--size-240)' }}>
      <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>
        No vehicles match
      </span>
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>Try a different search or clear the status filter.</span>
      <div style={{ marginTop: 'var(--size-40)' }}>
        <Button onClick={() => { s.setSearch(''); s.setSSts({}) }}>Clear filters</Button>
      </div>
    </div>
  )
}

export function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box', minHeight: 'var(--row-height)',
        display: 'flex', alignItems: 'center', padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)', ...body1, cursor: 'pointer',
      }}
    >
      {label}
    </div>
  )
}
