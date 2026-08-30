'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import {
  CATALOG,
  LAUNCHED,
  ME,
  RESCUE_POOL,
  STAMP_TIME,
  STATUS_TONES,
  UNMATCHED,
  UNMATCHED_DELIVERED,
} from './data'
import type { Status } from './data'
import { TypeTable } from './TypeTable'
import { RescueTable } from './RescueTable'
import { TypeDialog } from './TypeDialog'
import { IconSquare, TallButton, Toast } from './parts'
import { useWorkSummary } from './useWorkSummary'
import type { MenuKind, WorkSummaryState } from './useWorkSummary'
import { int } from '../../ds/format'

/**
 * Work Summary: what the day actually ran, and whether three sources agree
 * about it.
 *
 * The tiles at the top are the checks. Routes Ran against Load Out's launched
 * count is the one that matters — a gap means the Amazon file, Dispatch and the
 * yard are telling three different stories, and the two tables below are where
 * that gets reconciled before the day is locked against the invoice.
 */
export function WorkSummaryPage() {
  const s = useWorkSummary()

  return (
    <div
      data-screen-label="Work Summary"
      style={{
        boxSizing: 'border-box',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-subtle)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
      }}
    >
      <TopBar s={s} />

      <div
        data-rsp-page=""
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          boxSizing: 'border-box',
          padding: 'var(--size-200) var(--size-240) var(--size-320) var(--size-240)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-160)',
        }}
      >
        <Tiles s={s} />
        <TypeTable s={s} />
        <RescueTable s={s} />
      </div>

      <TypeDialog s={s} />
      <Menu s={s} />
      {s.toast && <Toast onUndo={s.undo ? () => { s.undo!(); s.clearToast() } : undefined}>{s.toast}</Toast>}
    </div>
  )
}

function TopBar({ s }: { s: WorkSummaryState }) {
  const [bg, border, fg, label] = STATUS_TONES[s.status]
  return (
    <div
      data-rsp-bar=""
      style={{
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-100) var(--size-240)',
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-default)',
        flexWrap: 'wrap',
      }}
    >
      <div
        data-pop=""
        role="button"
        tabIndex={0}
        title={s.statusStamp ? `set by ${s.statusStamp.who} · ${s.statusStamp.when}` : 'Pending from the moment the day exists'}
        onClick={(e) => s.openMenu(e, 'status', undefined, 280)}
        style={{
          boxSizing: 'border-box',
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--size-40)',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-medium)',
          background: bg,
          border: `1px solid ${border}`,
          color: fg,
          ...caption1Strong,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        <span>{label}</span>
        <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
          <Icon name="FnChevronRight" size={12} />
        </span>
      </div>

      <div style={{ flex: 1 }} />
      {/* The date sits dead centre of the bar, not between its neighbours. */}
      <div
        data-rsp-static=""
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
        }}
      >
        <IconSquare name="FnChevronLeft" title="Previous day" onClick={() => s.goDay(-1)} />
        <span style={{ minWidth: 130, textAlign: 'center', ...body1, fontWeight: 'var(--weight-semibold)' }}>
          {s.dateLabel}
        </span>
        <IconSquare name="FnChevronRight" title="Next day" onClick={() => s.goDay(1)} />
      </div>
      <div style={{ flex: 1 }} />

      <TallButton chevron onClick={(e) => s.openMenu(e, 'export')}>Export</TallButton>
      <TallButton
        primary
        onClick={() => {
          if (s.guard()) return
          s.setForm(s.blankForm())
        }}
      >
        + Add Service Type
      </TallButton>
    </div>
  )
}

/** The six checks. A red one means two sources disagree about the day. */
function Tiles({ s }: { s: WorkSummaryState }) {
  const d = s.hasData
  const defs = [
    {
      label: 'Routes Ran',
      value: d ? `${s.totRan} / ${s.expected}` : '-',
      color: d && s.gap !== 0 ? 'var(--danger-fg)' : 'var(--success-fg)',
      border: d && s.gap !== 0 ? 'var(--warning-accent)' : 'var(--border-default)',
      title: `This page’s sum against Load Out’s ${LAUNCHED} launched rows plus ${s.unpaidN} unpaid mark - the closing number renders once Return to Station closes the day`,
    },
    {
      label: 'Route-Hrs',
      value: d ? String(s.routeHrs) : '-',
      color: 'var(--text-primary)',
      border: 'var(--border-default)',
      title: 'Sum of routes ran times hours per row',
    },
    {
      label: 'Delivered',
      value: d ? `${int(s.totDel)} +${UNMATCHED_DELIVERED}` : '-',
      color: 'var(--text-primary)',
      border: 'var(--border-default)',
      title: `Mapped rows, plus ${UNMATCHED_DELIVERED} delivered on ${UNMATCHED.length} unmatched file rows`,
    },
    {
      label: 'Rescues',
      value: d ? `${s.resc.length} / ${s.resc.length}` : '-',
      color: 'var(--success-fg)',
      border: 'var(--border-default)',
      title: 'Rescue rows stream from Dispatch - a matching pair means the sync is clean',
    },
    {
      label: 'Unpaid Rescues',
      value: d ? String(s.unpaidN) : '-',
      color: s.unpaidN ? 'var(--danger-fg)' : 'var(--text-primary)',
      border: 'var(--border-default)',
      title: 'Rescues marked Unpaid - the fed row’s count',
    },
    {
      label: 'Not Marked',
      value: d ? String(s.notMarked) : '-',
      color: s.notMarked ? 'var(--danger-fg)' : 'var(--text-primary)',
      border: s.notMarked ? 'var(--warning-accent)' : 'var(--border-default)',
      title: 'Rescues nobody has checked against the invoice yet - the honesty light',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--size-120)' }}>
      {defs.map((t) => (
        <div
          key={t.label}
          title={t.title}
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: `1px solid ${t.border}`,
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-60) var(--size-80)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-60)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              lineHeight: '12px',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '.6px',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.label}
          </span>
          <span
            style={{
              fontSize: 16,
              lineHeight: '22px',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '-0.3px',
              color: t.color,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface MenuItem {
  divider?: boolean
  label: string
  sub?: string
  check?: boolean
  color?: string
  weight?: string
  bg?: string
  on: () => void
}

/**
 * The one popover the page has. The three pickers also float a search field
 * over the control that opened them, so a long catalog can be typed past.
 */
function Menu({ s }: { s: WorkSummaryState }) {
  const M = s.menu
  if (!M) return null
  const items = menuItems(s, M.kind, M.extra)
  const searchable = M.kind === 'addtype' || M.kind === 'addresc' || M.kind === 'swaptype'

  return (
    <>
      {searchable && (
        <input
          data-pop=""
          autoFocus
          value={s.menuQ}
          onChange={(e) => s.setMenuQ(e.target.value)}
          placeholder={M.kind === 'addresc' ? 'Search a driver or route' : 'Search service types'}
          style={{
            position: 'fixed',
            left: M.tx,
            top: M.ty,
            width: M.tw,
            height: M.th,
            boxSizing: 'border-box',
            padding: '0 var(--size-80)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-small)',
            background: 'var(--white)',
            outline: 'none',
            ...body1,
            color: 'var(--text-primary)',
            zIndex: 91,
          }}
        />
      )}
      <div
        data-pop=""
        style={{
          position: 'fixed',
          left: M.x,
          top: M.y,
          width: s.menuW,
          maxHeight: 320,
          overflow: 'auto',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--elevation-menu)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-40)',
          padding: 'var(--size-40)',
        }}
      >
        {items.map((m, i) =>
          m.divider ? (
            <div key={`d${i}`} style={{ height: 1, background: 'var(--border-default)', margin: 'var(--size-40) 0' }} />
          ) : (
            <MenuRow key={`${m.label}-${i}`} item={m} />
          ),
        )}
      </div>
    </>
  )
}

function MenuRow({ item }: { item: MenuItem }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={item.on}
      style={{
        boxSizing: 'border-box',
        flexShrink: 0,
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-60) var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : (item.bg ?? 'var(--surface-card)'),
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {/* The tick column is always there, so labels line up whether or not
          anything in the list is currently chosen. */}
      <span style={{ boxSizing: 'border-box', width: 16, display: 'flex', justifyContent: 'center', color: 'var(--blue-700)' }}>
        {item.check && <Icon name="FnCheck" size={12} />}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span
          style={{
            ...body1,
            fontWeight: item.weight ?? 'var(--weight-regular)',
            color: item.color ?? 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </span>
        {item.sub && (
          <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.sub}
          </span>
        )}
      </div>
    </div>
  )
}

const STATUS_OPTS: [Status, string, string][] = [
  ['pending', 'Pending', 'var(--warning-fg)'],
  ['match', 'Match With Amazon · Lock', 'var(--success-fg)'],
  ['disputed', 'Disputed', 'var(--danger-fg)'],
]

function menuItems(s: WorkSummaryState, kind: MenuKind, extra?: string): MenuItem[] {
  const mq = s.menuQ.trim().toLowerCase()

  if (kind === 'status') {
    return STATUS_OPTS.map(([id, label, color]) => ({
      label,
      color,
      check: s.status === id,
      bg: s.status === id ? 'var(--blue-50)' : 'var(--surface-card)',
      weight: s.status === id ? 'var(--weight-semibold)' : 'var(--weight-regular)',
      sub: id === 'match' ? 'Locking makes the day read-only' : '',
      on: () => {
        s.setStatus(id)
        s.setStatusStamp({ who: ME, when: STAMP_TIME })
        s.setMenu(null)
        // Locking a day that does not add up is allowed — but it is said out loud.
        if (id === 'match' && s.gap !== 0) {
          s.toastMsg(`Locked with a mismatch - routes do not match Dispatch · ${s.totRan} vs ${s.expected}`)
        } else if (id === 'match') {
          s.toastMsg('Day locked - read-only until the status moves off Match')
        } else if (id === 'disputed') {
          s.toastMsg('Disputed - the day stays editable while evidence lands')
        } else {
          s.toastMsg('Reopened - logged, streams re-sync and the checks recompute')
        }
      },
    }))
  }

  if (kind === 'export') {
    return ['CSV', 'XLSX'].map((o) => ({
      label: o,
      on: () => {
        s.setMenu(null)
        s.toastMsg(`${o} exported - tiles and both tables`)
      },
    }))
  }

  if (kind === 'unmatched') {
    return UNMATCHED.map((u) => ({
      label: u.raw,
      sub: `allocated ${u.a} · delivered ${u.del} - click to add the type`,
      on: () => {
        // The hours are in the raw string; pull them out so the form opens filled.
        const hm = / (\d+(?:\.\d+)?) hr/.exec(u.raw)
        s.setMenu(null)
        s.setForm(s.blankForm({ hrs: hm ? parseFloat(hm[1]) : 8, amz: u.raw.replace(/ - \d+.*$/, '') }))
      },
    }))
  }

  if (kind === 'addtype' || kind === 'swaptype') {
    const items: MenuItem[] = []
    // A type already on the day at the same hours is not offered again.
    const catalog = CATALOG.filter(
      (c) => !s.types.some((x) => x.name.toLowerCase() === c.name.toLowerCase() && x.hrs === c.hrs),
    )
    if (mq && !catalog.some((c) => c.name.toLowerCase() === mq)) {
      items.push({
        label: `Add "${s.menuQ.trim()}"`,
        color: 'var(--blue-700)',
        on: () => {
          s.setMenu(null)
          s.setForm(s.blankForm({ id: kind === 'swaptype' ? (extra ?? null) : null, name: s.menuQ.trim() }))
        },
      })
    }
    catalog
      .filter((c) => !mq || c.name.toLowerCase().includes(mq))
      .forEach((c) =>
        items.push({
          label: c.name,
          sub: `${c.hrs} hr · ${c.amz ? 'Amazon' : 'DSP'} · ${c.veh.length ? c.veh.join(', ') : 'No allowed vehicle types'}`,
          on: () => {
            if (s.guard()) return
            if (kind === 'swaptype') {
              s.setTypes(
                s.types.map((x) =>
                  x.id === extra
                    ? { ...x, name: c.name, hrs: c.hrs, paid: c.amz ? 'Amazon' : 'DSP', amz: c.amz, veh: c.veh.slice() }
                    : x,
                ),
              )
              s.setMenu(null)
              s.setMenuQ('')
              s.toastMsg(`Row set to ${c.name} · ${c.hrs} hr - counts re-match on the next file read`)
            } else {
              s.setTypes(
                s.types.concat([{
                  id: `t${Date.now()}`, name: c.name, hrs: c.hrs,
                  paid: c.amz ? 'Amazon' : 'DSP', amz: c.amz, veh: c.veh.slice(), fed: false,
                }]),
              )
              s.setMenu(null)
              s.setMenuQ('')
              s.toastMsg(`${c.name} · ${c.hrs} hr added - its row appears from today forward`)
            }
          },
        }),
      )
    items.push({ divider: true, label: '', on: () => {} })
    items.push({
      label: '+ New Service Type',
      color: 'var(--blue-700)',
      weight: 'var(--weight-semibold)',
      on: () => {
        s.setMenu(null)
        s.setForm(s.blankForm({ name: s.menuQ.trim() }))
      },
    })
    return items
  }

  if (kind === 'addresc') {
    const items: MenuItem[] = []
    RESCUE_POOL.filter(([name]) => !s.resc.some((x) => x.rescued === name))
      .filter(([name, route]) => !mq || name.toLowerCase().includes(mq) || route.toLowerCase().includes(mq))
      .forEach(([name, route]) =>
        items.push({
          label: name,
          sub: route,
          on: () => {
            if (s.guard()) return
            if (extra) {
              s.setResc(s.resc.map((x) => (x.id === extra ? { ...x, rescued: name, route } : x)))
              s.setMenu(null)
              s.setMenuQ('')
              s.toastMsg(`Rescue set for ${name} · ${route} - assign the rescuer on Dispatch`)
            } else {
              s.setResc(
                s.resc.concat([{ id: `x${Date.now()}`, rescuer: null, rescued: name, route, where: '-', totes: null, assigned: false }]),
              )
              s.setMenu(null)
              s.setMenuQ('')
              s.toastMsg(`Rescue added for ${name} · ${route} - assign the rescuer on Dispatch`)
            }
          },
        }),
      )
    if (!items.length) items.push({ label: 'No matches', color: 'var(--text-secondary)', on: () => {} })
    return items
  }

  const cur = extra ? (s.marks[extra] ?? null) : null
  return [
    { label: 'Paid - by Amazon', check: cur === 'paid', color: 'var(--success-fg)', on: () => s.setMark([extra!], 'paid') },
    {
      label: 'Unpaid - ours',
      check: cur === 'unpaid',
      color: 'var(--danger-fg)',
      sub: 'Counts under Unpaid Rescues (DSP)',
      on: () => s.setMark([extra!], 'unpaid'),
    },
    { label: 'Not marked', check: cur === null, on: () => s.setMark([extra!], null) },
  ]
}
