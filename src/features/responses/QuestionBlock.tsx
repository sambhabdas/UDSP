'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type'
import { Card, Menu, MenuRow, SearchField, SmallButton, Tip } from './parts'
import { ratingColor } from './data'
import type { Question } from './data'
import type { RespState } from './useResponses'

/**
 * One question and what came back for it.
 *
 * A rating gets five bars, a yes/no gets one split bar with the problem side
 * coloured red whichever side that is, a photo question gets thumbnails, and
 * free text has no summary worth drawing so it shows its answers directly.
 */
export function QuestionBlock({ s, q, index }: { s: RespState; q: Question; index: number }) {
  const open = !!s.openDetails[q.id]
  // Free text has nothing to chart, so its table is always on the page — the
  // button only decides whether it is the first three rows or all of them.
  const showTable = open || q.type === 'text'

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-160)' }}>
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            ...caption1Strong,
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          Q{index}
        </span>
        <span style={{ flex: 1, minWidth: 0, ...body1Strong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {q.title}
        </span>
        <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{q.answers} answers</span>
        <SmallButton onClick={() => s.toggleDetails(q.id)}>{open ? 'Hide answers' : 'View answers'}</SmallButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-160) var(--size-120) var(--size-160)' }}>
        {q.type === 'rating' && <RatingBars s={s} q={q} />}
        {q.type === 'yesno' && <YesNoBar s={s} q={q} />}
        {q.type === 'photo' && <Photos s={s} q={q} />}
        {showTable && <DetailTable s={s} q={q} open={open} />}
      </div>
    </Card>
  )
}

function RatingBars({ s, q }: { s: RespState; q: Question }) {
  const counts = q.counts ?? []
  const max = Math.max(...counts, 0)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        {counts.map((c, i) => {
          const n = 5 - i
          const key = `${q.id}-b${n}`
          const pct = q.answers ? Math.round((c / q.answers) * 100) : 0
          const w = max ? Math.round((c / max) * 100) : 0
          return (
            <div
              key={n}
              onMouseEnter={() => s.setHover(key)}
              onMouseLeave={() => s.setHover(null)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}
            >
              <span style={{ width: 10, flexShrink: 0, ...caption1, color: 'var(--text-secondary)', textAlign: 'right' }}>{n}</span>
              <div style={{ flex: 1, height: 16, borderRadius: 'var(--radius-small)', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    boxSizing: 'border-box',
                    width: `${w}%`,
                    height: '100%',
                    borderRadius: 'var(--radius-small)',
                    background: ratingColor(n),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 var(--size-60)',
                  }}
                >
                  {/* Under 30% the label will not fit inside the bar, so it
                      steps outside instead of being clipped. */}
                  {w >= 30 && (
                    <span style={{ ...caption2Strong, color: 'var(--white)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {c} · {pct}%
                    </span>
                  )}
                </div>
                {w < 30 && (
                  <span style={{ marginLeft: 'var(--size-60)', ...caption2Strong, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {c} · {pct}%
                  </span>
                )}
              </div>
              {s.hover === key && (
                <Tip
                  label={`Rated ${n}`}
                  value={`${c}${c === 1 ? ' answer' : ' answers'} · ${pct}%`}
                  style={{ left: 24, bottom: 'calc(100% + 4px)' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function YesNoBar({ s, q }: { s: RespState; q: Question }) {
  const yes = q.yes ?? 0
  const no = q.no ?? 0
  const total = yes + no
  // Which side is the problem depends on the question, not on the word.
  const yesBad = q.problem === 'Yes'
  const yesColor = yesBad ? 'var(--danger-accent)' : 'var(--success-accent)'
  const noColor = yesBad ? 'var(--success-accent)' : 'var(--danger-accent)'
  const pct = (v: number): number => (total ? Math.round((v / total) * 100) : 0)
  const tipYes = s.hover === `${q.id}-yes`
  const tipNo = s.hover === `${q.id}-no`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', maxWidth: 520 }}>
      <div style={{ position: 'relative', display: 'flex', height: 16, borderRadius: 'var(--radius-small)', background: 'var(--surface-subtle)' }}>
        <div
          onMouseEnter={() => s.setHover(`${q.id}-yes`)}
          onMouseLeave={() => s.setHover(null)}
          style={{
            boxSizing: 'border-box',
            width: `${pct(yes)}%`,
            background: yesColor,
            borderRadius: 'var(--radius-small) 0 0 var(--radius-small)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {total > 0 && yes / total >= 0.18 && (
            <span style={{ ...caption2Strong, color: 'var(--white)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {yes} · {pct(yes)}%
            </span>
          )}
        </div>
        <div
          onMouseEnter={() => s.setHover(`${q.id}-no`)}
          onMouseLeave={() => s.setHover(null)}
          style={{
            boxSizing: 'border-box',
            width: `${pct(no)}%`,
            background: noColor,
            borderRadius: '0 var(--radius-small) var(--radius-small) 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {total > 0 && no / total >= 0.18 && (
            <span style={{ ...caption2Strong, color: 'var(--white)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {no} · {pct(no)}%
            </span>
          )}
        </div>
        {(tipYes || tipNo) && (
          <Tip
            label={tipNo ? 'No' : 'Yes'}
            value={
              tipNo
                ? `${no}${no === 1 ? ' answer' : ' answers'} · ${pct(no)}%`
                : `${yes}${yes === 1 ? ' answer' : ' answers'} · ${pct(yes)}%`
            }
            style={{ left: tipNo ? '60%' : '8%', bottom: 'calc(100% + 4px)' }}
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--size-160)' }}>
        <LegendKey color={yesColor} fg={yesBad ? 'var(--danger-fg)' : 'var(--success-fg)'}>{yes} Yes</LegendKey>
        <LegendKey color={noColor} fg={yesBad ? 'var(--success-fg)' : 'var(--danger-fg)'}>{no} No</LegendKey>
      </div>
    </div>
  )
}

function LegendKey({ color, fg, children }: { color: string; fg: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, whiteSpace: 'nowrap', color: fg }}>
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: color, flexShrink: 0 }} />
      {children}
    </span>
  )
}

function Photos({ s, q }: { s: RespState; q: Question }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--size-100)', flexWrap: 'wrap' }}>
      {(q.photos ?? []).map((p, i) => (
        <div
          key={p.caption}
          onClick={() => s.setLightbox({ qid: q.id, idx: i })}
          style={{ boxSizing: 'border-box', width: 132, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', cursor: 'pointer' }}
        >
          <div style={{ height: 88, borderRadius: 'var(--radius-medium)', background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`, border: '1px solid var(--border-default)' }} />
          <span style={{ ...caption2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.caption}</span>
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {s.s.named ? `${p.driver} · ${p.route}` : p.when.split(',')[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

interface HeadDef {
  key: string | null
  label: string
  width?: number
}

function DetailTable({ s, q, open }: { s: RespState; q: Question; open: boolean }) {
  const named = s.s.named
  // Route only makes sense where a route produced the answer, which free text
  // does not carry even on a named survey.
  const showRoute = named && q.type !== 'text'
  const d = s.detailOf(q.id)
  const rows = s.detailRows(q)
  // Free text shows its first three answers until the table is opened in full.
  const shown = q.type === 'text' && !open ? rows.slice(0, 3) : rows

  const heads: HeadDef[] = [{ key: 'when', label: 'When', width: 100 }]
  if (named) heads.push({ key: 'driver', label: 'Driver', width: 150 })
  if (showRoute) heads.push({ key: 'route', label: 'Route', width: 64 })
  heads.push({ key: 'answer', label: 'Answer' })
  heads.push({ key: null, label: 'Actions', width: 56 })

  const drivers = ['All drivers', ...new Set(q.details.map((x) => x.driver).filter(Boolean) as string[])].sort((a, b) =>
    a === 'All drivers' ? -1 : b === 'All drivers' ? 1 : a.localeCompare(b),
  )

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', overflow: 'visible' }}>
      {open && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-80) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
          <SearchField width={220} value={d.query} onChange={(v) => s.patchDetail(q.id, { query: v })} />
          {named && <DriverFilter s={s} q={q} drivers={drivers} current={d.driver} />}
          <div style={{ flex: 1 }} />
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            {rows.length} of {q.details.length}
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 'var(--size-120)',
          padding: 'var(--size-60) var(--size-120)',
          background: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          ...caption2Strong,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
        }}
      >
        {heads.map((h) => (
          <SortHead key={h.label} s={s} q={q} head={h} active={d.col === h.key} dir={d.dir} />
        ))}
      </div>

      {shown.map((row, i) => (
        <DetailRow key={`${q.id}-${i}`} s={s} row={row} rid={`${q.id}-r${i}`} named={named} showRoute={showRoute} />
      ))}

      {rows.length === 0 && (
        <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 'var(--size-100) var(--size-120)', ...caption1, color: 'var(--text-helper)' }}>
          No answers match
        </div>
      )}
    </div>
  )
}

function SortHead({ s, q, head, active, dir }: { s: RespState; q: Question; head: HeadDef; active: boolean; dir: 'asc' | 'desc' }) {
  const [hover, hoverProps] = useHover()
  const sortable = head.key !== null
  return (
    <div
      role={sortable ? 'button' : undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={
        sortable
          ? (e) => {
              e.stopPropagation()
              s.patchDetail(q.id, { col: head.key, dir: active && dir === 'asc' ? 'desc' : 'asc' })
            }
          : undefined
      }
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        width: head.width,
        flex: head.width ? 'none' : 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: sortable ? 'pointer' : 'default',
        userSelect: 'none',
        borderRadius: 'var(--radius-small)',
        color: active || (hover && sortable) ? 'var(--text-primary)' : 'var(--text-label)',
      }}
      {...hoverProps}
    >
      {head.label}
      {sortable && (
        <span style={{ display: 'flex', color: active ? undefined : 'var(--text-disabled)' }}>
          <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
        </span>
      )}
    </div>
  )
}

function DriverFilter({ s, q, drivers, current }: { s: RespState; q: Question; drivers: string[]; current: string }) {
  const id = `driver-${q.id}` as const
  const open = s.drop === id
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : id); s.setMenuFor(null) }}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          boxSizing: 'border-box',
          width: 180,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          ...caption1,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{current}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {open && (
        <Menu width={180} top={31} maxHeight={200}>
          {drivers.map((name) => (
            <MenuRow
              key={name}
              small
              selected={current === name}
              onClick={(e) => { e.stopPropagation(); s.patchDetail(q.id, { driver: name }); s.setDrop(null) }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

function DetailRow({
  s,
  row,
  rid,
  named,
  showRoute,
}: {
  s: RespState
  row: { when: string; driver?: string; route?: string; answer: string }
  rid: string
  named: boolean
  showRoute: boolean
}) {
  const [hover, hoverProps] = useHover()
  const handled = s.handled.includes(rid)
  const menuOpen = s.menuFor === rid

  const items: { label: string; run: () => void }[] = []
  if (named) {
    items.push({ label: 'Open the driver', run: () => { s.setMenuFor(null); s.toastMsg(`Open: ${row.driver}`) } })
    if (row.route) items.push({ label: 'Open the van', run: () => { s.setMenuFor(null); s.toastMsg(`Open van on ${row.route}`) } })
    items.push({ label: 'Log an event', run: () => { s.setMenuFor(null); s.toastMsg(`Event prefilled: ${row.driver}`) } })
  }
  items.push({ label: handled ? 'Reopen' : 'Mark handled', run: () => s.toggleHandled(rid) })

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--size-120)',
        minHeight: 28,
        padding: 'var(--size-40) var(--size-120)',
        borderBottom: '1px solid var(--border-subtle)',
        ...caption1,
        background: hover ? 'var(--surface-subtle)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ width: 100, flexShrink: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.when}</div>
      {named && (
        <div style={{ width: 150, flexShrink: 0, fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.driver ?? '—'}
        </div>
      )}
      {showRoute && <div style={{ width: 64, flexShrink: 0, color: 'var(--text-secondary)' }}>{row.route ?? '—'}</div>}
      <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'baseline', gap: 'var(--size-60)' }}>
        <span style={{ flex: 1, minWidth: 0 }}>{row.answer}</span>
        {handled && (
          <span
            style={{
              boxSizing: 'border-box',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-40)',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              ...caption1Strong,
              color: 'var(--success-fg)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--success-accent)' }} />
            Handled
          </span>
        )}
      </div>
      <div style={{ width: 56, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <MoreButton onClick={(e) => { e.stopPropagation(); s.setMenuFor(menuOpen ? null : rid); s.setDrop(null) }} />
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 26,
              right: 0,
              boxSizing: 'border-box',
              minWidth: 170,
              padding: 'var(--size-40)',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--elevation-callout)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {items.map((m) => (
              <MenuRow key={m.label} height={32} padding="var(--size-120)" onClick={(e) => { e.stopPropagation(); m.run() }}>
                {m.label}
              </MenuRow>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MoreButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="SvMore" size={16} />
    </span>
  )
}
