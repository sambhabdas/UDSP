'use client'

import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import { fmt, punchState, ready, routeRows, schedOf, warnsOf, waveStateOf } from './calc'
import { BAND_DEFS, NOW } from './data'
import type { Minutes, Row } from './data'
import {
  BarButton,
  BarSearch,
  BlockLabel,
  CountPill,
  Divider,
  IconButton,
  IssueChip,
  RowIcon,
  SectionCard,
  Th,
} from './boardParts'
import { CheckBox, EditableCell } from './parts'
import type { DispatchState } from './useDispatch'

/**
 * Load Out: the board that gets routes out of the door.
 *
 * Read top to bottom it is the morning's argument - which waves are short, how
 * close the day is to launching, what is blocking it, then the roster itself
 * and everybody who is here but not on a route.
 */
export function LoadOutBoard({ s }: { s: DispatchState }) {
  const d = s.day
  const rows = d.rows

  const liveWarns = (r: Row) => (s.dismissed[r.id] ? [] : warnsOf(r, d))

  const waves = useMemo(
    () => [...new Set(rows.filter((r) => r.wave !== null).map((r) => r.wave as Minutes))].sort((a, b) => a - b),
    [rows],
  )

  const visRows = useMemo(() => {
    const F = s.filter
    const q = s.q.trim().toLowerCase()
    const passF = (r: Row): boolean => {
      if (!F) return true
      if (F.t === 'chip') {
        if (F.k === 'noVan') return !r.van
        if (F.k === 'noRoute') return !r.route
        if (F.k === 'noWave') return r.wave === null
        if (F.k === 'noDriver') return r.noDriver
        if (F.k === 'noStaging') return !r.staging
        if (F.k === 'sent') return !!r.sent
        if (F.k === 'punch') return r.punch === null
      }
      if (F.t === 'wave') return r.wave === F.v
      if (F.t === 'wavestate') return r.wave === F.v && waveStateOf(r, s.schedOff, s.grace) === F.s
      if (F.t === 'warn') return liveWarns(r).length > 0
      return true
    }
    const passQ = (r: Row) =>
      !q || [r.emp, r.tr, r.route, r.van, r.staging].some((x) => (x || '').toLowerCase().includes(q))
    return rows.filter((r) => passF(r) && passQ(r))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, s.filter, s.q, s.schedOff, s.grace, s.dismissed])

  const launchable = routeRows(rows)
  const readyN = launchable.filter(ready).length
  const readyPct = launchable.length ? Math.round((readyN / launchable.length) * 100) : 0
  const noVan = rows.filter((r) => !r.van).length
  const noRoute = rows.filter((r) => !r.route).length
  const noWave = rows.filter((r) => r.wave === null).length
  const noDrv = rows.filter((r) => r.noDriver).length
  const warnCount = rows.filter((r) => liveWarns(r).length > 0).length

  const targetRows = s.selIds.length ? rows.filter((r) => s.sel[r.id]) : visRows

  if (rows.length === 0) return <EmptyDay s={s} />

  return (
    <>
      {/* Waves */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <BlockLabel>Waves</BlockLabel>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
          {waves.map((w) => (
            <WaveBox key={w} w={w} s={s} waves={waves} />
          ))}
        </div>
      </div>

      {/* Readiness */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <BlockLabel>Readiness</BlockLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', flexWrap: 'wrap' }}>
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 260,
              height: 'var(--control-height)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--white)',
              border: '1px solid var(--neutral-400)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: `${readyPct}%`, height: '100%', background: 'var(--green-600)' }} />
            <span
              style={{
                position: 'absolute',
                left: 'var(--size-120)',
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                ...body1,
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--white)',
                whiteSpace: 'nowrap',
              }}
            >
              {readyN} of {launchable.length} routes are ready to launch
            </span>
          </div>
        </div>
      </div>

      {/* Issues · Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', flex: 1, minWidth: 280 }}>
          <BlockLabel>Issues</BlockLabel>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-60)',
              flexWrap: 'wrap',
              minHeight: 'var(--control-height)',
            }}
          >
            {[
              { k: 'noVan' as const, n: noVan, label: `${noVan} No Van` },
              { k: 'noRoute' as const, n: noRoute, label: `${noRoute} No Route` },
              { k: 'noWave' as const, n: noWave, label: `${noWave} No Wave` },
              { k: 'noDriver' as const, n: noDrv, label: `${noDrv} No Driver` },
            ]
              .filter((c) => c.n > 0)
              .map((c) => (
                <IssueChip
                  key={c.k}
                  on={s.filter?.t === 'chip' && s.filter.k === c.k}
                  onClick={() => s.toggleFilter({ t: 'chip', k: c.k })}
                >
                  {c.label}
                </IssueChip>
              ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', alignItems: 'flex-start' }}>
          <BlockLabel>Actions</BlockLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <BarButton primary onClick={() => s.openDlg('p3', { rows: rows.map((r) => r.id) })}>
              Auto-Assign Vans
            </BarButton>
            <BarButton
              primary
              title="Send the dispatch info SMS to every ready row"
              onClick={() => s.openDlg('p5', { ids: visRows.filter((r) => r.emp).map((r) => r.id) })}
            >
              Send Info
            </BarButton>
            <BarButton primary onClick={() => s.openDlg('p7')}>+ Row</BarButton>
            <BarButton primary onClick={() => s.setTab('setup')}>+ Service Type</BarButton>
          </div>
        </div>
      </div>

      <Roster s={s} visRows={visRows} targetRows={targetRows} warnCount={warnCount} liveWarns={liveWarns} waves={waves} />
      <Rescues s={s} />
      <Standby s={s} />
      <OnCall s={s} />
      <CalledOut s={s} />
    </>
  )
}

function EmptyDay({ s }: { s: DispatchState }) {
  return (
    <div
      data-screen-label="Load Out - empty day"
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-480) var(--size-240)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--size-160)',
      }}
    >
      <span style={{ fontSize: 'var(--subtitle-1-size)', lineHeight: 'var(--subtitle-1-lh)', color: 'var(--text-secondary)' }}>
        No roster yet
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <BarButton primary chevron onClick={(e) => s.openMenu(e, 'import')}>Import</BarButton>
        <BarButton onClick={() => s.openDlg('p7')}>+ Add Row</BarButton>
      </div>
    </div>
  )
}

/** One wave: the time, then Total / In / Missing, each a filter. The border is
 *  the wave's whole status. */
function WaveBox({ w, s, waves }: { w: Minutes; s: DispatchState; waves: Minutes[] }) {
  const rows = s.day.rows.filter((r) => r.wave === w)
  const nextWave = waves.find((x) => x > NOW)
  const short = rows.filter((r) => r.punch === null).length
  const allFuture = rows.every((r) => {
    const sc = schedOf(r, s.schedOff)
    return sc !== null && sc > NOW
  })
  const stroke =
    short === 0
      ? 'var(--success-accent)'
      : allFuture
        ? 'var(--border-default)'
        : w <= NOW || w === nextWave
          ? 'var(--danger-accent)'
          : 'var(--warning-accent)'
  const inN = rows.filter((r) => waveStateOf(r, s.schedOff, s.grace) === 'in').length
  const missN = rows.filter((r) => waveStateOf(r, s.schedOff, s.grace) === 'missing').length
  const chase = rows
    .filter((r) => r.punch === null && r.emp)
    .map((r) => r.emp.split(',')[0] + (r.lastCall ? ` · ${r.lastCall.txt}` : ''))
    .join('\n')

  const F = s.filter
  return (
    <div
      title={chase || 'Everyone in this wave has punched'}
      style={{
        boxSizing: 'border-box',
        flex: 1,
        minWidth: 210,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-80) var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: `1px solid ${stroke}`,
        boxShadow: `inset 0 0 0 1px ${stroke}`,
      }}
    >
      <span
        style={{
          fontSize: 'var(--subtitle-2-size)',
          lineHeight: 'var(--subtitle-2-lh)',
          fontWeight: 'var(--weight-semibold)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmt(w)}
      </span>
      <span style={{ flex: 1 }} />
      <WaveCount n={rows.length} label="Total" color="var(--text-primary)" on={F?.t === 'wave' && F.v === w} onPick={() => s.toggleFilter({ t: 'wave', v: w })} />
      <WaveCount n={inN} label="In" color="var(--success-fg)" on={F?.t === 'wavestate' && F.v === w && F.s === 'in'} onPick={() => s.toggleFilter({ t: 'wavestate', v: w, s: 'in' })} />
      <WaveCount n={missN} label="Missing" color="var(--danger-fg)" on={F?.t === 'wavestate' && F.v === w && F.s === 'missing'} onPick={() => s.toggleFilter({ t: 'wavestate', v: w, s: 'missing' })} />
    </div>
  )
}

function WaveCount({
  n,
  label,
  color,
  on,
  onPick,
}: {
  n: number
  label: string
  color: string
  on?: boolean
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 'var(--size-40)',
        height: 22,
        padding: '0 var(--size-60)',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'transparent',
        border: `1px solid ${on ? 'var(--blue-200)' : 'transparent'}`,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums', color }}>
        {n}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

const ROW_PAD = 'var(--size-40) var(--size-160)'
const HEAD_PAD = 'var(--size-60) var(--size-160)'

function Roster({
  s,
  visRows,
  targetRows,
  warnCount,
  liveWarns,
  waves,
}: {
  s: DispatchState
  visRows: Row[]
  targetRows: Row[]
  warnCount: number
  liveWarns: (r: Row) => { k: string; label: string }[]
  waves: Minutes[]
}) {
  const rows = s.day.rows
  const cols = s.cols
  const gridCols = [
    '36px',
    'minmax(150px,1.3fr)',
    'minmax(105px,1fr)',
    'minmax(78px,.9fr)',
    'minmax(88px,1fr)',
    ...(cols.staging ? ['minmax(120px,1.1fr)'] : []),
    'minmax(60px,.7fr)',
    ...(cols.sched ? ['minmax(72px,.8fr)'] : []),
    ...(cols.punch ? ['minmax(92px,.9fr)'] : []),
    '200px',
  ].join(' ')

  const sortRows = (list: Row[]): Row[] => {
    if (!s.sortKey) return list
    const dir = s.sortDir === 'asc' ? 1 : -1
    const severity = (r: Row) => {
      const sc = schedOf(r, s.schedOff)
      if (r.punch === null && sc !== null && NOW > sc + s.grace) return 3
      if (r.punch !== null && sc !== null && r.punch > sc + s.grace) return 2
      if (r.punch === null) return 1
      return 0
    }
    return list.slice().sort((a, b) => {
      if (s.sortKey === 'punch') return (severity(b) - severity(a)) * dir
      let av: string | number
      let bv: string | number
      if (s.sortKey === 'wave') { av = a.wave ?? 9999; bv = b.wave ?? 9999 }
      else if (s.sortKey === 'sched') { av = schedOf(a, s.schedOff) ?? 9999; bv = schedOf(b, s.schedOff) ?? 9999 }
      else { av = (a[s.sortKey as keyof Row] as string) || ''; bv = (b[s.sortKey as keyof Row] as string) || '' }
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir
    })
  }

  const bands =
    s.group === 'type'
      ? BAND_DEFS.map(([key, name]) => {
          const list = sortRows(visRows.filter((r) => r.band === key))
          const all = rows.filter((r) => r.band === key)
          const notes: string[] = []
          const nV = all.filter((r) => !r.van).length
          const nR = all.filter((r) => !r.route).length
          const nD = all.filter((r) => r.noDriver).length
          if (nV) notes.push(`${nV} No Van`)
          if (nR) notes.push(`${nR} No Route`)
          if (nD) notes.push(`${nD} No Driver`)
          return { key, name, count: all.length, list, note: notes.length ? `⚠ ${notes.join(' · ')}` : '' }
        }).filter((b) => b.list.length > 0)
      : [...waves.map((w) => w as Minutes | null), ...(rows.some((r) => r.wave === null) ? [null] : [])]
          .map((w) => ({
            key: `w${w}`,
            name: w === null ? 'No wave' : fmt(w),
            count: rows.filter((r) => r.wave === w).length,
            list: sortRows(visRows.filter((r) => r.wave === w)),
            note: '',
          }))
          .filter((b) => b.list.length > 0)

  const heads: { label: string; key?: string; align?: 'flex-start' | 'center' }[] = [
    { label: 'Employee', key: 'emp' },
    { label: 'Transporter' },
    { label: 'Route', key: 'route' },
    { label: 'Van', key: 'van' },
    ...(cols.staging ? [{ label: 'Staging' }] : []),
    { label: 'Wave', key: 'wave' },
    ...(cols.sched ? [{ label: 'Scheduled', key: 'sched' }] : []),
    ...(cols.punch ? [{ label: 'Punched In', key: 'punch' }] : []),
    { label: 'Actions', align: 'center' as const },
  ]

  const allVisOn = visRows.length > 0 && visRows.every((r) => s.sel[r.id])
  const open = !s.panels.roster

  return (
    <SectionCard
      title="Roster"
      open={open}
      onToggle={() => s.togglePanel('roster')}
      buttons={
        <>
          <BarButton title="Send the dispatch info SMS to the selected rows" onClick={() => s.openDlg('p5', { ids: targetRows.filter((r) => r.emp).map((r) => r.id) })}>Send Info</BarButton>
          <BarButton title="Auto-assign vans to the selected rows" onClick={() => s.openDlg('p3', { rows: targetRows.map((r) => r.id) })}>Assign Vans</BarButton>
          <BarButton title="Set the wave for the selected rows" onClick={() => s.openDlg('p9', { ids: targetRows.map((r) => r.id) })}>Set Wave</BarButton>
          <BarButton chevron onClick={(e) => s.openMenu(e, 'move')}>Move To</BarButton>
          <BarButton chevron onClick={(e) => s.openMenu(e, 'more')}>More</BarButton>
        </>
      }
      pills={
        <>
          <CountPill title="Rows on the roster">Total: {rows.length}</CountPill>
          {warnCount > 0 && (
            <IssueChip on={s.filter?.t === 'warn'} onClick={() => s.toggleFilter({ t: 'warn' })}>
              Issues: {warnCount}
            </IssueChip>
          )}
          {s.selIds.length > 0 && (
            <>
              <Divider />
              <CountPill>{s.selIds.length} selected</CountPill>
            </>
          )}
        </>
      }
      search={<BarSearch value={s.q} onChange={s.setQ} placeholder="Filter the sheet" />}
      primary={
        <>
          <IconButton name="PgGrid" title={`Group: ${s.group === 'type' ? 'Service Type' : 'Wave'}`} onClick={(e) => s.openMenu(e, 'group')} />
          <IconButton name="PgTable" title="Columns" onClick={(e) => s.openMenu(e, 'cols')} />
        </>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1140 }}>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: 'var(--size-120)',
              alignItems: 'center',
              padding: HEAD_PAD,
              background: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <CheckBox
              on={allVisOn}
              title="Select every visible row"
              onClick={() => {
                const next: Record<string, boolean> = {}
                if (!allVisOn) visRows.forEach((r) => { next[r.id] = true })
                s.setSel(next)
              }}
            />
            {heads.map((h) => (
              <Th
                key={h.label}
                label={h.label}
                align={h.align}
                sortable={!!h.key}
                active={s.sortKey === h.key}
                dir={s.sortDir}
                onSort={() => {
                  s.setSortDir(s.sortKey === h.key && s.sortDir === 'asc' ? 'desc' : 'asc')
                  s.setSortKey(h.key as string)
                }}
              />
            ))}
          </div>

          {bands.map((b) => (
            <Band key={b.key} band={b} s={s} gridCols={gridCols} liveWarns={liveWarns} />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

/** A band header is blue: it is a grouping of the sheet, not a row of it. */
function Band({
  band,
  s,
  gridCols,
  liveWarns,
}: {
  band: { key: string; name: string; count: number; list: Row[]; note: string }
  s: DispatchState
  gridCols: string
  liveWarns: (r: Row) => { k: string; label: string }[]
}) {
  const isCol = !!s.collapsed[band.key]
  const allOn = band.list.length > 0 && band.list.every((r) => s.sel[r.id])
  const [hover, hoverProps] = useHover()
  return (
    <>
      <div
        onClick={() => s.setCollapsed({ ...s.collapsed, [band.key]: !isCol })}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: HEAD_PAD,
          background: 'var(--blue-50)',
          borderBottom: '1px solid var(--blue-200)',
          cursor: 'pointer',
        }}
      >
        <CheckBox
          on={allOn}
          onClick={(e) => {
            e.stopPropagation()
            const next = { ...s.sel }
            band.list.forEach((r) => { next[r.id] = !allOn })
            s.setSel(next)
          }}
        />
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 'var(--radius-small)',
            background: hover ? 'var(--blue-100)' : 'transparent',
            color: 'var(--blue-700)',
            transform: `rotate(${isCol ? '0deg' : '90deg'})`,
            transition: 'transform .12s ease',
          }}
          {...hoverProps}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M5.7 3.3a1 1 0 0 0 0 1.4L9 8l-3.3 3.3a1 1 0 1 0 1.4 1.4l4-4a1 1 0 0 0 0-1.4l-4-4a1 1 0 0 0-1.4 0Z" />
          </svg>
        </span>
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--blue-700)' }}>
          {band.name}
        </span>
        <span style={{ ...caption1Strong, color: 'var(--blue-700)' }}>Total: {band.count}</span>
        <div style={{ flex: 1 }} />
        {band.note && (
          <span style={{ ...caption1Strong, color: 'var(--warning-fg)' }}>{band.note}</span>
        )}
      </div>

      {!isCol && band.list.map((r) => (
        <RosterRow key={r.id} r={r} s={s} gridCols={gridCols} warns={liveWarns(r)} />
      ))}
    </>
  )
}

function RosterRow({
  r,
  s,
  gridCols,
  warns,
}: {
  r: Row
  s: DispatchState
  gridCols: string
  warns: { k: string; label: string }[]
}) {
  const [hover, hoverProps] = useHover()
  const on = !!s.sel[r.id]
  const sched = schedOf(r, s.schedOff)
  const ps = punchState(r, { schedOff: s.schedOff, grace: s.grace })
  const sendable = !!(r.emp && r.phone) && s.isToday
  const isE = (f: string) => s.edit?.list === 'r' && s.edit.id === r.id && s.edit.f === f
  const cell: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: 'var(--size-120)',
        alignItems: 'center',
        minHeight: 40,
        padding: ROW_PAD,
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...body1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <CheckBox on={on} onClick={(e) => { e.stopPropagation(); s.setSel({ ...s.sel, [r.id]: !on }) }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        {r.noDriver ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => s.openMenu(e, 'emp', r.id)}
            title="Seat a driver"
            style={{ ...caption1Strong, color: 'var(--warning-fg)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Seat a driver
          </span>
        ) : (
          <span onClick={() => s.toastMsg(`Opens the Associates profile · ${r.emp}`)} title={r.emp} style={{ ...cell, cursor: 'pointer' }}>
            {r.emp}
          </span>
        )}
        {warns.length > 0 && (
          <span title={warns.map((w) => w.label).join(' · ')} style={{ display: 'flex', color: 'var(--warning-fg)', flexShrink: 0, cursor: 'help' }}>
            <Icon name="FnInfo" size={14} />
          </span>
        )}
      </div>

      <div style={{ ...cell, color: r.tr ? 'var(--text-secondary)' : 'var(--warning-fg)' }} title={r.tr || 'Transporter ID not found'}>
        {r.tr || (r.noDriver ? '-' : 'Not found')}
      </div>

      <EditableCell
        editing={isE('route')}
        value={s.editVal}
        display={r.route || '-'}
        color={r.route ? 'var(--text-primary)' : 'var(--text-secondary)'}
        onStart={() => s.startEdit('r', r.id, 'route', r.route)}
        onChange={s.setEditVal}
        onCommit={s.commitEdit}
        onCancel={() => s.setEdit(null)}
      />

      <span
        role="button"
        tabIndex={0}
        onClick={(e) => s.openMenu(e, 'van', r.id)}
        style={{ ...cell, cursor: 'pointer', color: r.van ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {r.van || '-'}
      </span>

      {s.cols.staging && (
        <EditableCell
          editing={isE('staging')}
          value={s.editVal}
          display={r.staging || '-'}
          color={r.staging ? 'var(--text-primary)' : 'var(--text-secondary)'}
          onStart={() => s.startEdit('r', r.id, 'staging', r.staging)}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
        />
      )}

      <EditableCell
        editing={isE('wave')}
        value={s.editVal}
        display={r.wave === null ? '-' : fmt(r.wave)}
        color={r.wave === null ? 'var(--text-secondary)' : 'var(--text-primary)'}
        onStart={() => s.startEdit('r', r.id, 'wave', r.wave === null ? '' : fmt(r.wave))}
        onChange={s.setEditVal}
        onCommit={s.commitEdit}
        onCancel={() => s.setEdit(null)}
      />

      {s.cols.sched && (
        <EditableCell
          editing={isE('sched')}
          value={s.editVal}
          display={sched === null ? '-' : fmt(sched)}
          color={sched === null ? 'var(--text-secondary)' : 'var(--text-primary)'}
          onStart={() => s.startEdit('r', r.id, 'sched', sched === null ? '' : fmt(sched))}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
          title={r.schedOv ? 'Typed by hand - the wave offset no longer applies to this row' : undefined}
        />
      )}

      {s.cols.punch && (
        <span title={ps.title} style={{ ...cell, color: ps.color, fontWeight: ps.weight }}>
          {ps.txt}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-60)' }}>
        <RowIcon
          name="DlCallSm"
          title={r.noDriver ? 'No driver on the row' : !r.phone ? 'No phone on file' : `Call ${r.emp}`}
          color="var(--success-fg)"
          enabled={!r.noDriver && r.phone}
          onClick={() => s.setHang({ list: 'r', id: r.id, name: r.emp })}
        />
        <RowIcon
          name={r.sent ? 'PgSendFilled' : 'PgSend'}
          title={
            r.sent ? `Sent ${r.sent} - click to resend with current values`
              : !r.emp ? 'No driver to text'
              : !r.phone ? 'No phone on file'
              : !s.isToday ? 'Sends are for today only'
              : 'Send the Dispatch Info SMS'
          }
          color="var(--success-fg)"
          enabled={sendable}
          onClick={() => s.openDlg('p5', { ids: [r.id] })}
        />
        <RowIcon name="FnMore" title="More" color="var(--text-secondary)" onClick={(e) => s.openMenu(e, 'row', r.id)} />
      </div>
    </div>
  )
}


// ---- the bench ---------------------------------------------------------------
//
// Four lists of people who are here but not on a route. They share one card
// shape: a checkbox column, a handful of columns, and an action cluster that
// always ends in the same overflow dot.

/** Header strip above a bench table. */
function BenchHead({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 'var(--size-120)',
        alignItems: 'center',
        padding: HEAD_PAD,
        background: 'var(--surface-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {children}
    </div>
  )
}

/** One bench row. `dim` steps back somebody who has already been placed. */
function BenchRowShell({
  cols,
  dim,
  children,
}: {
  cols: string
  dim?: boolean
  children: ReactNode
}) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 'var(--size-120)',
        alignItems: 'center',
        minHeight: 40,
        padding: ROW_PAD,
        borderBottom: '1px solid var(--border-subtle)',
        opacity: dim ? 0.55 : 1,
      }}
    >
      {children}
    </div>
  )
}

/** The plain caption-1 cell that most bench columns are. */
function Cell({
  children,
  color,
  mono,
  bold,
  title,
  nums,
}: {
  children: ReactNode
  color?: string
  mono?: boolean
  bold?: boolean
  title?: string
  nums?: boolean
}) {
  return (
    <span
      title={title}
      style={{
        ...caption1,
        color: color ?? 'var(--text-primary)',
        fontFamily: mono ? 'var(--font-mono, ui-monospace, monospace)' : undefined,
        fontWeight: bold ? 'var(--weight-semibold)' : undefined,
        fontVariantNumeric: nums ? 'tabular-nums' : undefined,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </span>
  )
}

function BenchEmpty({ children }: { children: ReactNode }) {
  return (
    <div style={{ boxSizing: 'border-box', padding: 'var(--size-240)', display: 'flex', justifyContent: 'center' }}>
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>{children}</span>
    </div>
  )
}

/** Toggle every row of a bench list on or off in one go. */
function toggleAll<T extends { id: string }>(
  list: T[],
  selected: Record<string, boolean>,
  set: (v: Record<string, boolean>) => void,
) {
  const all = list.length > 0 && list.every((x) => selected[x.id])
  const next: Record<string, boolean> = { ...selected }
  list.forEach((x) => {
    if (all) delete next[x.id]
    else next[x.id] = true
  })
  set(next)
}

const RESC_COLS = '24px 1.1fr 90px 1.1fr 90px 1.2fr 70px 200px'

function Rescues({ s }: { s: DispatchState }) {
  const d = s.day
  const unassigned = d.resc.filter((x) => !x.rescuer).length
  const rescOn = s.filter?.t === 'rescUn'
  const q = s.qResc.trim().toLowerCase()
  const vis = (rescOn ? d.resc.filter((x) => !x.rescuer) : d.resc).filter(
    (x) =>
      !q ||
      [x.rescuer?.name ?? '', x.rescuing.emp ?? '', x.rescuing.route, x.where.a]
        .join(' ')
        .toLowerCase()
        .includes(q),
  )
  const allOn = d.resc.length > 0 && d.resc.every((x) => s.selResc[x.id])
  const selN = Object.values(s.selResc).filter(Boolean).length

  const sendSel = () => {
    const sel = d.resc.filter((x) => s.selResc[x.id] && x.rescuer)
    const list = sel.length ? sel : d.resc.filter((x) => x.rescuer)
    if (!list.length) { s.toastMsg('No assigned rescues to send to'); return }
    const ids = new Set(list.map((x) => x.id))
    s.setDay({ resc: d.resc.map((y) => (ids.has(y.id) ? { ...y, sent: fmt(NOW) } : y)) })
    s.toastMsg(`Meet-up SMS sent · ${list.length} ${list.length === 1 ? 'rescue' : 'rescues'}`)
  }

  return (
    <SectionCard
      title="Rescues"
      open={!s.panels.resc}
      onToggle={() => s.togglePanel('resc')}
      buttons={<BarButton onClick={sendSel}>Send Info</BarButton>}
      pills={
        <>
          <CountPill title="Rescues today">Total: {d.resc.length}</CountPill>
          {unassigned > 0 && (
            <IssueChip on={rescOn} onClick={() => s.toggleFilter({ t: 'rescUn' })}>
              Issues: {unassigned}
            </IssueChip>
          )}
          {selN > 0 && (
            <>
              <Divider />
              <CountPill>{selN} selected</CountPill>
            </>
          )}
        </>
      }
      search={<BarSearch value={s.qResc} onChange={s.setQResc} placeholder="Filter the list" />}
      primary={<BarButton primary onClick={() => s.openDlg('p6')}>+ Add Rescue</BarButton>}
    >
      {d.resc.length === 0 ? (
        <BenchEmpty>No rescues today</BenchEmpty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1040 }}>
            <BenchHead cols={RESC_COLS}>
              <CheckBox on={allOn} title="Select all" onClick={() => toggleAll(d.resc, s.selResc, s.setSelResc)} />
              <Th label="Rescuer" /><Th label="Van" /><Th label="Rescuing" /><Th label="Route" />
              <Th label="Where" /><Th label="Totes" /><Th label="Actions" align="center" />
            </BenchHead>
            {vis.map((x) => {
              const isE = s.edit?.list === 'resc' && s.edit.id === x.id
              return (
                <BenchRowShell key={x.id} cols={RESC_COLS}>
                  <CheckBox
                    on={!!s.selResc[x.id]}
                    onClick={() => s.setSelResc({ ...s.selResc, [x.id]: !s.selResc[x.id] })}
                  />
                  {x.rescuer ? (
                    <Cell>{x.rescuer.name}</Cell>
                  ) : (
                    <Cell color="var(--warning-fg)">- Not assigned</Cell>
                  )}
                  <Cell color={x.rescuer?.van ? 'var(--text-primary)' : 'var(--text-secondary)'}>
                    {x.rescuer?.van || '-'}
                  </Cell>
                  <Cell>{x.rescuing.name}</Cell>
                  <Cell mono color="var(--text-secondary)">{x.rescuing.route}</Cell>
                  {x.onPad ? (
                    <span style={{ justifySelf: 'start', ...PAD_PILL }}>{x.where.a}</span>
                  ) : (
                    <Cell title={x.where.b}>{x.where.a}</Cell>
                  )}
                  <EditableCell
                    editing={isE}
                    value={s.editVal}
                    display={x.totes === null ? '-' : String(x.totes)}
                    color={x.totes === null ? 'var(--text-secondary)' : 'var(--text-primary)'}
                    onStart={() => s.startEdit('resc', x.id, 'totes', x.totes)}
                    onChange={s.setEditVal}
                    onCommit={s.commitEdit}
                    onCancel={() => s.setEdit(null)}
                  />
                  <ActionCluster>
                    <RowIcon
                      name="DlCallSm"
                      title={x.rescuer ? `Call ${x.rescuer.name}` : 'No rescuer yet'}
                      color={x.rescuer ? 'var(--success-fg)' : 'var(--text-disabled)'}
                      enabled={!!x.rescuer}
                      onClick={() => s.setHang({ list: 'resc', id: x.id, name: x.rescuer!.name })}
                    />
                    {x.rescuer ? (
                      <BarButton
                        tone={x.sent ? 'green-solid' : 'green'}
                        title={x.sent ? `Sent ${x.sent} - click to resend` : 'Send the meet-up SMS to both drivers'}
                        onClick={() => {
                          s.setDay({ resc: d.resc.map((y) => (y.id === x.id ? { ...y, sent: fmt(NOW) } : y)) })
                          s.toastMsg('Meet-up SMS sent to both drivers')
                        }}
                      >
                        Send Info
                      </BarButton>
                    ) : (
                      <BarButton tone="blue" onClick={() => s.openDlg('p6', { door: 3, editId: x.id })}>
                        Assign
                      </BarButton>
                    )}
                    <RowIcon
                      name="FnMore"
                      title="More actions"
                      color="var(--primary)"
                      onClick={() => s.toastMsg('Row actions · reassign, move the meet point, close the rescue')}
                    />
                  </ActionCluster>
                </BenchRowShell>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

const SB_COLS = '24px 1.2fr 1fr 1fr .6fr 1fr 1fr 1fr 230px'

/** Standby status tones, straight out of the design file's `stTone`. */
const ST_TONE: Record<string, [string, string, string, string]> = {
  waiting: ['var(--surface-card)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)'],
  activated: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)'],
  'on rescue': ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)'],
}
const ST_DEFAULT: [string, string, string, string] = [
  'var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)',
]

function Standby({ s }: { s: DispatchState }) {
  const d = s.day
  const q = s.qSb.trim().toLowerCase()
  const vis = d.sb.filter((b) => !q || `${b.emp} ${b.tr} ${b.van}`.toLowerCase().includes(q))
  const allOn = d.sb.length > 0 && d.sb.every((b) => s.sel[b.id])
  const selN = d.sb.filter((b) => s.sel[b.id]).length
  const targets = selN ? d.sb.filter((b) => s.sel[b.id]) : d.sb
  const usedVans = new Set(d.rows.map((r) => r.van).filter(Boolean))

  return (
    <SectionCard
      title="Standby"
      open={!s.panels.sb}
      onToggle={() => s.togglePanel('sb')}
      buttons={
        <>
          <BarButton onClick={() => s.openDlg('p5', { ids: targets.map((b) => b.id), kind: 'sb' })}>Send Info</BarButton>
          <BarButton onClick={() => s.openDlg('p9', { ids: targets.map((b) => b.id), kind: 'sb' })}>Set Wave</BarButton>
          <BarButton chevron onClick={(e) => s.openMenu(e, 'sbmove')}>Move To</BarButton>
        </>
      }
      pills={
        <>
          <CountPill title="On standby today">Total: {d.sb.length}</CountPill>
          {selN > 0 && (
            <>
              <Divider />
              <CountPill>{selN} selected</CountPill>
            </>
          )}
        </>
      }
      search={<BarSearch value={s.qSb} onChange={s.setQSb} placeholder="Filter the list" />}
      primary={<BarButton primary onClick={() => s.openDlg('p8', { seg: 'sb' })}>+ Add</BarButton>}
    >
      {d.sb.length === 0 ? (
        <BenchEmpty>Nobody on standby</BenchEmpty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1120 }}>
            <BenchHead cols={SB_COLS}>
              <CheckBox on={allOn} title="Select all" onClick={() => toggleAll(d.sb, s.sel, s.setSel)} />
              <Th label="Associate" /><Th label="Transporter" /><Th label="Van Held" /><Th label="Wave" />
              <Th label="Scheduled Arrival" /><Th label="Punched In" /><Th label="Status" /><Th label="Actions" align="center" />
            </BenchHead>
            {vis.map((b) => {
              const ps = punchState(b, { schedOff: s.schedOff, grace: s.grace, isBench: true })
              // A standby who is late for a *scheduled* arrival reads red even
              // though nothing is waiting on them yet.
              const late = b.schedArr !== null && b.punch === null && NOW > b.schedArr + s.grace
              const tone = ST_TONE[b.status] ?? ST_DEFAULT
              const dim = b.status === 'activated' || b.status === 'done'
              const isE = (f: string) => s.edit?.list === 'sb' && s.edit.id === b.id && s.edit.f === f
              return (
                <BenchRowShell key={b.id} cols={SB_COLS} dim={dim}>
                  <CheckBox on={!!s.sel[b.id]} onClick={() => s.setSel({ ...s.sel, [b.id]: !s.sel[b.id] })} />
                  <Cell>{b.emp}</Cell>
                  <Cell mono color="var(--text-secondary)">{b.tr}</Cell>
                  <Cell color={b.van ? 'var(--text-primary)' : 'var(--text-secondary)'}>
                    {b.van || '-'}
                    {b.van && usedVans.has(b.van) && (
                      <span title="This van is also on a roster row" style={{ marginLeft: 'var(--size-60)', color: 'var(--warning-fg)' }}>⚠</span>
                    )}
                  </Cell>
                  <EditableCell
                    editing={isE('wave')} value={s.editVal}
                    display={b.wave === null ? '-' : fmt(b.wave)}
                    color={b.wave === null ? 'var(--text-secondary)' : 'var(--text-primary)'}
                    onStart={() => s.startEdit('sb', b.id, 'wave', b.wave === null ? '' : fmt(b.wave))}
                    onChange={s.setEditVal} onCommit={s.commitEdit} onCancel={() => s.setEdit(null)}
                  />
                  <EditableCell
                    editing={isE('schedArr')} value={s.editVal}
                    display={b.schedArr === null ? '-' : fmt(b.schedArr)}
                    color={b.schedArr === null ? 'var(--text-secondary)' : 'var(--text-primary)'}
                    onStart={() => s.startEdit('sb', b.id, 'schedArr', b.schedArr === null ? '' : fmt(b.schedArr))}
                    onChange={s.setEditVal} onCommit={s.commitEdit} onCancel={() => s.setEdit(null)}
                  />
                  <Cell
                    nums
                    title={ps.title}
                    color={late ? 'var(--danger-fg)' : ps.color}
                    bold={late || ps.weight === 'var(--weight-semibold)'}
                  >
                    {late ? `Not yet · ${NOW - b.schedArr!} late` : ps.txt}
                  </Cell>
                  <span
                    role="button"
                    tabIndex={0}
                    title="Change the status"
                    onClick={() => s.toastMsg('Pick a status · waiting, activated, on rescue')}
                    style={{
                      justifySelf: 'start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--size-40)',
                      height: 20,
                      padding: '0 var(--size-80)',
                      borderRadius: 'var(--radius-medium)',
                      background: tone[0],
                      border: `1px solid ${tone[1]}`,
                      color: tone[2],
                      ...caption1Strong,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tone[3] }} />
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                  <ActionCluster>
                    <RowIcon
                      name="DlCallSm" title={`Call ${b.emp}`} color="var(--success-fg)"
                      onClick={() => s.setHang({ list: 'sb', id: b.id, name: b.emp })}
                    />
                    <BarButton tone="blue" onClick={() => s.openDlg('p4', { incomer: { list: 'sb', id: b.id } })}>
                      Swap In
                    </BarButton>
                    <BarButton
                      tone={b.status === 'on rescue' ? 'green-solid' : 'blue'}
                      title={b.status === 'on rescue' ? 'On a rescue now' : `Open Add Rescue with ${b.emp} as the rescuer`}
                      onClick={() => {
                        if (b.status === 'on rescue') { s.toastMsg(`${b.emp} is already on a rescue`); return }
                        s.openDlg('p6', { door: 2, sbId: b.id, rescuer: { name: b.emp, van: b.van, origin: 'from standby' } })
                      }}
                    >
                      Add To Rescue
                    </BarButton>
                    <RowIcon name="FnMore" title="More actions" color="var(--primary)" onClick={(e) => s.openMenu(e, 'sbmove', b.id)} />
                  </ActionCluster>
                </BenchRowShell>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

const OC_COLS = '24px 1.2fr 140px 170px 100px 130px 170px'

const CONTACT_WORD: Record<string, string> = { coming: 'Coming', noanswer: 'No answer', notcoming: 'Not coming' }

function OnCall({ s }: { s: DispatchState }) {
  const d = s.day
  const q = s.qOc.trim().toLowerCase()
  const vis = d.oc.filter((o) => !q || `${o.emp} ${o.phone}`.toLowerCase().includes(q))
  const allOn = d.oc.length > 0 && d.oc.every((o) => s.selOc[o.id])
  const selN = Object.values(s.selOc).filter(Boolean).length

  return (
    <SectionCard
      title="On Call"
      open={!s.panels.oc}
      onToggle={() => s.togglePanel('oc')}
      buttons={
        <>
          <BarButton onClick={() => s.openDlg('p5', { ids: d.oc.map((o) => o.id), kind: 'oc' })}>Call In</BarButton>
          <BarButton chevron onClick={(e) => s.openMenu(e, 'ocmove')}>Move To</BarButton>
        </>
      }
      pills={
        <>
          <CountPill title="On call today">Total: {d.oc.length}</CountPill>
          {selN > 0 && (
            <>
              <Divider />
              <CountPill>{selN} selected</CountPill>
            </>
          )}
        </>
      }
      search={<BarSearch value={s.qOc} onChange={s.setQOc} placeholder="Filter the list" />}
      primary={<BarButton primary onClick={() => s.openDlg('p8', { seg: 'oc' })}>+ Add</BarButton>}
    >
      {d.oc.length === 0 ? (
        <BenchEmpty>Nobody on call</BenchEmpty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 980 }}>
            <BenchHead cols={OC_COLS}>
              <CheckBox on={allOn} title="Select all" onClick={() => toggleAll(d.oc, s.selOc, s.setSelOc)} />
              <Th label="Associate" /><Th label="Phone" /><Th label="Contacted" /><Th label="Coming At" />
              <Th label="Punched In" /><Th label="Actions" align="center" />
            </BenchHead>
            {vis.map((o) => {
              // Swap In only lights up once somebody has said they are coming.
              const coming = o.contacted?.k === 'coming'
              const isE = s.edit?.list === 'oc' && s.edit.id === o.id
              return (
                <BenchRowShell key={o.id} cols={OC_COLS}>
                  <CheckBox on={!!s.selOc[o.id]} onClick={() => s.setSelOc({ ...s.selOc, [o.id]: !s.selOc[o.id] })} />
                  <Cell>{o.emp}</Cell>
                  <Cell mono color="var(--text-secondary)">{o.phone}</Cell>
                  <Cell
                    color={
                      !o.contacted ? 'var(--text-secondary)'
                        : o.contacted.k === 'coming' ? 'var(--success-fg)'
                          : o.contacted.k === 'notcoming' ? 'var(--danger-fg)' : 'var(--text-primary)'
                    }
                  >
                    {o.contacted ? `${o.contacted.when} - ${CONTACT_WORD[o.contacted.k] ?? o.contacted.k}` : '-'}
                  </Cell>
                  <EditableCell
                    editing={isE} value={s.editVal}
                    display={coming && o.comingAt ? o.comingAt : '-'}
                    color={coming && o.comingAt ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    onStart={() => { if (coming) s.startEdit('oc', o.id, 'comingAt', o.comingAt) }}
                    onChange={s.setEditVal} onCommit={s.commitEdit} onCancel={() => s.setEdit(null)}
                  />
                  <Cell
                    nums
                    title={o.punch !== null ? 'Arrived and not placed' : 'No punch yet'}
                    color={o.punch !== null ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  >
                    {o.punch !== null ? fmt(o.punch) : 'Not yet'}
                  </Cell>
                  <ActionCluster>
                    <RowIcon
                      name="DlCallSm" title={`Call ${o.emp}`} color="var(--success-fg)"
                      onClick={() => s.setHang({ list: 'oc', id: o.id, name: o.emp })}
                    />
                    <BarButton
                      tone={coming ? 'blue' : undefined}
                      disabled={!coming}
                      title={coming ? `Swap ${o.emp} into a seat` : 'Lights up when Contacted reads coming'}
                      onClick={() => s.openDlg('p4', { incomer: { list: 'oc', id: o.id } })}
                    >
                      Swap In
                    </BarButton>
                    <RowIcon name="FnMore" title="More actions" color="var(--primary)" onClick={(e) => s.openMenu(e, 'ocmove', o.id)} />
                  </ActionCluster>
                </BenchRowShell>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

const CO_COLS = '24px 1.2fr 1.6fr 110px 130px 150px'

function CalledOut({ s }: { s: DispatchState }) {
  const d = s.day
  const q = s.qCo.trim().toLowerCase()
  const vis = d.co.filter((c) => !q || `${c.emp} ${c.reason}`.toLowerCase().includes(q))
  const allOn = d.co.length > 0 && d.co.every((c) => s.selCo[c.id])
  const selN = Object.values(s.selCo).filter(Boolean).length

  const bringBack = (ids: string[]) => {
    const list = d.co.filter((c) => ids.includes(c.id))
    if (!list.length) { s.toastMsg('Nobody selected'); return }
    s.act(
      list.length === 1 ? `${list[0].emp} back on Standby` : `${list.length} back on Standby`,
      {
        co: d.co.filter((c) => !ids.includes(c.id)),
        sb: d.sb.concat(
          list.map((c) => ({
            id: `sb-${c.id}`, emp: c.emp, tr: c.tr, van: '',
            wave: null, schedArr: null, punch: c.punch, status: 'waiting', quals: 'DLX5',
          })),
        ),
      },
    )
  }

  return (
    <SectionCard
      title="Called Out"
      open={!s.panels.co}
      onToggle={() => s.togglePanel('co')}
      buttons={
        <BarButton
          tone="amber"
          title="Bring the selected people back to Standby"
          onClick={() => bringBack(selN ? d.co.filter((c) => s.selCo[c.id]).map((c) => c.id) : d.co.map((c) => c.id))}
        >
          Bring Back
        </BarButton>
      }
      pills={
        <>
          <CountPill title="Called out today">Total: {d.co.length}</CountPill>
          {selN > 0 && (
            <>
              <Divider />
              <CountPill>{selN} selected</CountPill>
            </>
          )}
        </>
      }
      search={<BarSearch value={s.qCo} onChange={s.setQCo} placeholder="Filter the list" />}
      primary={<BarButton primary onClick={() => s.openDlg('p8', { seg: 'co' })}>+ Add</BarButton>}
    >
      {d.co.length === 0 ? (
        <BenchEmpty>Nobody called out</BenchEmpty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>
            <BenchHead cols={CO_COLS}>
              <CheckBox on={allOn} title="Select all" onClick={() => toggleAll(d.co, s.selCo, s.setSelCo)} />
              <Th label="Associate" /><Th label="Reason" /><Th label="Called In At" />
              <Th label="Punched In" /><Th label="Actions" align="center" />
            </BenchHead>
            {vis.map((c) => {
              const isE = s.edit?.list === 'co' && s.edit.id === c.id
              return (
                <BenchRowShell key={c.id} cols={CO_COLS}>
                  <CheckBox on={!!s.selCo[c.id]} onClick={() => s.setSelCo({ ...s.selCo, [c.id]: !s.selCo[c.id] })} />
                  <Cell>{c.emp}</Cell>
                  <EditableCell
                    editing={isE} value={s.editVal} display={c.reason || '-'}
                    onStart={() => s.startEdit('co', c.id, 'reason', c.reason)}
                    onChange={s.setEditVal} onCommit={s.commitEdit} onCancel={() => s.setEdit(null)}
                  />
                  <Cell nums color="var(--text-secondary)">{c.calledAt || '-'}</Cell>
                  <Cell
                    nums
                    title={c.punch !== null ? 'Punched in after calling out' : 'No punch'}
                    color={c.punch !== null ? 'var(--warning-fg)' : 'var(--text-secondary)'}
                    bold={c.punch !== null}
                  >
                    {c.punch !== null ? fmt(c.punch) : 'Not yet'}
                  </Cell>
                  <ActionCluster>
                    <RowIcon
                      name="DlCallSm" title={`Call ${c.emp}`} color="var(--success-fg)"
                      onClick={() => s.setHang({ list: 'co', id: c.id, name: c.emp })}
                    />
                    <BarButton tone="amber" onClick={() => bringBack([c.id])}>Bring Back</BarButton>
                    <RowIcon name="FnMore" title="More actions" color="var(--primary)" onClick={(e) => s.openMenu(e, 'comove', c.id)} />
                  </ActionCluster>
                </BenchRowShell>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

/** The centred icon-and-button cluster every table row ends with. */
function ActionCluster({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-60)' }}>
      {children}
    </div>
  )
}

/** "On pad" reads as a blue chip rather than an address. */
const PAD_PILL: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 20,
  padding: '0 var(--size-80)',
  borderRadius: 'var(--radius-medium)',
  background: 'var(--blue-50)',
  border: '1px solid var(--blue-200)',
  color: 'var(--blue-700)',
  ...caption1Strong,
}
