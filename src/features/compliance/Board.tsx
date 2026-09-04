'use client'

import type { CSSProperties } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { CheckBox } from '../dispatch/parts'
import { CHIP_DEFS, NOW, SECOND_LUNCH, TONE } from './data'
import type { TileKey } from './data'
import type { RowEval } from './calc'
import { fmt, onARoute, onClock, remindable } from './calc'
import {
  BarButton,
  BlockLabel,
  CountPill,
  Divider,
  RowIcon,
  SearchBox,
  TallButton,
  Th,
  Toggle,
} from './parts'
import { CARD, CARD_BAR } from './style'
import type { ComplianceState, SortKey } from './useCompliance'

/** The board's grid, shared by the head row and every row under it. */
const COLS = '32px minmax(160px,1.1fr) 150px 150px minmax(200px,1.4fr) 150px 130px 110px'

/**
 * The Compliance board.
 *
 * Read top to bottom it is one argument: how much of the day is clean, what is
 * wrong with the rest, what the shape of the floor is right now, and then every
 * row with the two punches and the lunch that decide all of it.
 */
export function Board({ s }: { s: ComplianceState }) {
  if (!s.isToday) return <EmptyDay s={s} />

  const clean = s.evald.filter((x) => x.warns.length === 0).length
  const pct = Math.round((clean / (s.evald.length || 1)) * 100)
  const inN = s.evald.filter((x) => onClock(x.p)).length
  const outN = s.evald.filter((x) => x.p.out !== null).length
  const count = (k: string) => s.evald.filter((x) => x.warns.includes(k as never)).length

  return (
    <>
      {/* Compliance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <BlockLabel>Compliance</BlockLabel>
        <div
          style={{
            position: 'relative',
            height: 'var(--control-height)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--white)',
            border: '1px solid var(--green-600)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-600)' }} />
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
              // Below about a third the fill has not reached the label yet, so
              // white would be invisible against the empty track.
              color: pct >= 35 ? 'var(--white)' : 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {pct}% compliant · {clean} of {s.evald.length} clean
          </span>
        </div>
      </div>

      {/* Warnings · Auto-Remind */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', flex: 1, minWidth: 280 }}>
          <BlockLabel>Warnings</BlockLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap', minHeight: 24 }}>
            {CHIP_DEFS.map(([k, label, kind]) => {
              const n = count(k)
              if (n === 0) return null
              const on = s.filter?.t === 'chip' && s.filter.k === k
              const t = TONE[kind]
              return (
                <WarnChip
                  key={k}
                  label={`${n} ${label}`}
                  bg={on ? 'var(--blue-100)' : t[0]}
                  border={on ? 'var(--blue-200)' : t[1]}
                  fg={on ? 'var(--blue-700)' : t[2]}
                  onClick={() => s.toggleFilter({ t: 'chip', k })}
                />
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
            <BlockLabel>Auto-Remind</BlockLabel>
            <Toggle
              on={s.autoOn}
              onClick={() => s.setAutoOn(!s.autoOn)}
              title={s.autoOn ? 'Auto-Remind On' : 'Auto-Remind Off'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 24 }}>
            {s.autoOn && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 20,
                  padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-medium)',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success-fg)',
                  ...caption1,
                  fontWeight: 'var(--weight-semibold)',
                  whiteSpace: 'nowrap',
                }}
              >
                Lunch -{s.lead}m · Punch +{s.grace}m
              </span>
            )}
          </div>
        </div>
      </div>

      <Tiles s={s} inN={inN} />

      {/* The board */}
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
        <BoardBar s={s} />
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1180 }}>
            <Head s={s} />
            {s.vis.map((x) => (
              <Row key={x.p.id} x={x} s={s} />
            ))}
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-80) var(--size-160)' }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
                {s.evald.length} rows · {inN} in · {outN} out · {s.evald.length - inN - outN} not in
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function EmptyDay({ s }: { s: ComplianceState }) {
  return (
    <div
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
      <span
        style={{
          fontSize: 'var(--subtitle-1-size)',
          lineHeight: 'var(--subtitle-1-lh)',
          fontWeight: 'var(--weight-regular)',
          color: 'var(--text-secondary)',
        }}
      >
        {s.dayOff > 0
          ? 'Scheduled rows only - the day has not happened, so no score is claimed'
          : 'No punches and no roster for this day'}
      </span>
      <TallButton primary onClick={() => s.setImp({ file: null, fills: { in: true, out: true, ls: true, le: true } })}>
        Import Punches
      </TallButton>
    </div>
  )
}

function WarnChip({
  label,
  bg,
  border,
  fg,
  onClick,
}: {
  label: string
  bg: string
  border: string
  fg: string
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        ...caption1,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  )
}

/** The seven counts across the middle. Each one is also a filter. */
function Tiles({ s, inN }: { s: ComplianceState; inN: number }) {
  const live = (pred: (x: RowEval) => boolean) => s.evald.filter((x) => onClock(x.p) && pred(x)).length
  const openWork = (x: RowEval, kinds: string[]) => !!x.work && kinds.includes(x.work.kind) && !x.work.left
  const routes = new Set(
    s.evald
      .filter((x) => onARoute(x.work))
      .map((x) => (x.work!.label.match(/CX\d+/) ?? [''])[0])
      .filter(Boolean),
  )
  const missedOrClosing =
    s.evald.filter((x) => x.warns.includes('missed')).length || s.evald.filter((x) => x.warns.includes('closing')).length

  const defs: { k: TileKey; label: string; value: string; title: string; color: string }[] = [
    { k: 'in', label: 'Punched In', value: String(inN), title: 'An in-punch and no out-punch', color: 'var(--success-fg)' },
    { k: 'routes', label: 'Routes Today', value: String(routes.size), title: 'Distinct routes on the board today', color: 'var(--blue-700)' },
    { k: 'onroutes', label: 'On Routes', value: String(live((x) => onARoute(x.work))), title: 'Punched-in rows on a route or a rescue', color: 'var(--blue-700)' },
    { k: 'rescues', label: 'Rescues', value: String(live((x) => openWork(x, ['rescue']))), title: 'Punched-in rows working a rescue', color: 'var(--blue-700)' },
    { k: 'ops', label: 'OPS · Training', value: String(live((x) => openWork(x, ['ops', 'training']))), title: 'Punched-in rows on OPS or Training with the work still open', color: 'var(--text-primary)' },
    { k: 'standby', label: 'Standby', value: String(live((x) => openWork(x, ['standby']))), title: 'Punched-in rows on Standby', color: 'var(--text-primary)' },
    { k: 'lunches', label: 'Lunches', value: `${live((x) => x.p.ls !== null)}/${inN}`, title: 'Taken over due - click for the chase list', color: missedOrClosing ? 'var(--danger-fg)' : 'var(--text-primary)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--size-120)' }}>
      {defs.map((t) => (
        <Tile key={t.k} {...t} on={s.filter?.t === 'tile' && s.filter.k === t.k} onClick={() => s.toggleFilter({ t: 'tile', k: t.k })} />
      ))}
    </div>
  )
}

function Tile({
  label,
  value,
  title,
  color,
  on,
  onClick,
}: {
  label: string
  value: string
  title: string
  color: string
  on: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-50)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-120) var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-60)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span
        style={{
          ...caption1,
          fontWeight: 'var(--weight-semibold)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          lineHeight: '20px',
          fontWeight: 'var(--weight-semibold)',
          letterSpacing: '-0.3px',
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function BoardBar({ s }: { s: ComplianceState }) {
  const allOn = s.vis.length > 0 && s.vis.every((x) => s.sel[x.p.id])
  return (
    <div style={{ ...CARD_BAR, flexWrap: 'wrap' }}>
      <CheckBox
        on={allOn}
        title="Select every visible row"
        onClick={() => {
          const next: Record<string, boolean> = {}
          if (!allOn) s.vis.forEach((x) => { next[x.p.id] = true })
          s.setSel(next)
        }}
      />
      <Divider />
      <BarButton chevron onClick={(e) => s.openMenu(e, 'assign')}>Assign Work</BarButton>
      <BarButton
        tone="amber"
        minWidth={0}
        title={s.remindables.map((x) => x.p.name).join(', ') || 'Nobody remindable'}
        onClick={() => s.doRemind(s.remindables)}
      >
        Remind {s.remindables.length}
      </BarButton>
      <BarButton title="Add a driver to the board" onClick={(e) => s.openMenu(e, 'addrow')}>+ Add Row</BarButton>
      <Divider />
      <CountPill title="Rows on the board">Total: {s.evald.length}</CountPill>
      {s.selIds.length > 0 && (
        <>
          <Divider />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--size-60)',
              height: 24,
              padding: '0 var(--size-100)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--blue-50)',
              border: '1px solid var(--blue-200)',
            }}
          >
            <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--blue-700)' }}>
              {s.selIds.length} selected
            </span>
            <span
              role="button"
              tabIndex={0}
              title="Clear the selection"
              onClick={() => s.setSel({})}
              style={{ display: 'flex', color: 'var(--blue-700)', cursor: 'pointer' }}
            >
              <Icon name="FnDismiss" size={12} />
            </span>
          </div>
        </>
      )}
      <div style={{ flex: 1 }} />
      <SearchBox value={s.q} onChange={s.setQ} placeholder="Find anyone" />
    </div>
  )
}

const HEADS: { label: string; k: SortKey | null; align?: CSSProperties['alignItems'] }[] = [
  { label: 'Driver', k: 'name' },
  { label: 'Punched In', k: 'in' },
  { label: 'Scheduled', k: 'sched' },
  { label: 'Working On', k: 'work' },
  { label: 'Lunch Start', k: 'ls' },
  { label: 'Lunch End', k: 'le' },
  { label: 'Actions', k: null, align: 'flex-end' },
]

function Head({ s }: { s: ComplianceState }) {
  const S = s.sortC
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 'var(--size-120)',
        alignItems: 'center',
        padding: 'var(--size-60) var(--size-160)',
        background: 'var(--surface-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 2,
      }}
    >
      <span />
      {HEADS.map((h) => (
        <Th
          key={h.label}
          label={h.label}
          align={h.align}
          sortable={!!h.k}
          sortIcon={S && S.k === h.k ? (S.dir === 1 ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
          sortColor={S && S.k === h.k ? 'var(--text-secondary)' : 'var(--text-disabled)'}
          onSort={() => {
            if (!h.k) return
            // One click ascending, a second descending, a third clears it.
            s.setSortC(S && S.k === h.k ? (S.dir === 1 ? { k: h.k, dir: -1 } : null) : { k: h.k, dir: 1 })
          }}
        />
      ))}
    </div>
  )
}

/** One line of the board - every cell says what it says because of `warns`. */
function Row({ x, s }: { x: RowEval; s: ComplianceState }) {
  const p = x.p
  const w = x.warns
  const on = !!s.sel[p.id]
  const out = p.out !== null
  const rem = s.reminded[p.id]
  const canRemind = remindable(x)

  // Punched In
  let inTxt = '-'
  let inColor = 'var(--text-primary)'
  let inWeight = 'var(--weight-regular)'
  let inTitle = ''
  if (p.future) {
    inColor = 'var(--text-secondary)'
  } else if (p.inP === null && w.includes('snI')) {
    const late = NOW - p.sched!
    inTxt = 'Missing'
    inColor = 'var(--danger-fg)'
    inWeight = 'var(--weight-semibold)'
    inTitle = `${Math.floor(late / 60)}h ${late % 60}m past scheduled with no punch`
  } else if (p.inP === null) {
    inColor = 'var(--text-secondary)'
  } else if (out) {
    inTxt = fmt(p.inP)
    inColor = 'var(--text-secondary)'
    inTitle = `Punched out ${fmt(p.out)}`
  } else if (w.includes('noOut')) {
    inTxt = fmt(p.inP)
    inColor = 'var(--danger-fg)'
    inWeight = 'var(--weight-semibold)'
    inTitle = 'Work ended with no out-punch - the fix is a punch in Paycom, re-imported'
  } else if (w.includes('lateIn')) {
    inTxt = fmt(p.inP)
    inColor = 'var(--danger-fg)'
    inWeight = 'var(--weight-semibold)'
    inTitle = `${p.inP - p.sched!} minutes past scheduled, beyond the ${s.grace}-minute grace`
  } else {
    inTxt = fmt(p.inP)
    inColor = 'var(--success-fg)'
  }

  // Lunch Start
  let lsTxt = '-'
  let lsColor = 'var(--text-secondary)'
  let lsWeight = 'var(--weight-regular)'
  let lsTitle = ''
  if (p.future || p.inP === null) {
    lsTxt = '-'
  } else if (w.includes('missed')) {
    lsTxt = 'Missing'
    lsColor = 'var(--danger-fg)'
    lsWeight = 'var(--weight-semibold)'
    lsTitle = `The window closed ${fmt(x.close)} with no start`
  } else if (w.includes('closing')) {
    lsColor = 'var(--danger-fg)'
    lsWeight = 'var(--weight-semibold)'
    lsTitle = `The window closes ${fmt(x.close)} · ${x.close! - NOW} minutes left`
  } else if (p.ls !== null && w.includes('lateL')) {
    lsTxt = fmt(p.ls)
    lsColor = 'var(--danger-fg)'
    lsWeight = 'var(--weight-semibold)'
    lsTitle = `Started late - the window closed ${fmt(x.close)}`
  } else if (p.ls !== null) {
    lsTxt = fmt(p.ls)
    lsColor = 'var(--success-fg)'
    // Still on the clock after a first lunch means a second one is coming.
    if (p.le !== null && p.out === null && p.inP + SECOND_LUNCH < 1440) {
      lsTitle = `2nd lunch due by ${fmt(p.inP + SECOND_LUNCH)}`
    }
  } else {
    lsTitle = `Due by ${fmt(x.close)}`
  }

  // Lunch End
  let leTxt = '-'
  let leColor = 'var(--text-secondary)'
  let leWeight = 'var(--weight-regular)'
  let leTitle = ''
  if (p.le !== null && w.includes('shortL')) {
    leTxt = fmt(p.le)
    leColor = 'var(--danger-fg)'
    leWeight = 'var(--weight-semibold)'
    leTitle = `${p.le - p.ls!} minutes - under the 30-minute minimum`
  } else if (p.le !== null) {
    leTxt = fmt(p.le)
    leColor = 'var(--success-fg)'
  }

  const cell = (color: string, weight?: string): CSSProperties => ({
    ...body1,
    fontWeight: weight,
    color,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  })

  // Work is only editable while somebody is on the clock today.
  const workEditable = p.inP !== null && !out && !p.future

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 'var(--size-120)',
        alignItems: 'center',
        minHeight: 40,
        padding: 'var(--size-40) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : 'var(--surface-card)',
        // Gone home, or not started - the row is still there but stepped back.
        opacity: out || p.future ? 0.55 : 1,
      }}
    >
      <CheckBox on={on} onClick={() => s.setSel({ ...s.sel, [p.id]: !on })} />

      <NameCell name={p.name} onClick={() => s.toastMsg(`Opens the Associates profile · ${p.name}`)} />

      <span title={inTitle} style={cell(inColor, inWeight)}>{inTxt}</span>

      <span
        title={p.sched === null ? 'Punched in with no Load Out schedule for the day' : `Scheduled ${fmt(p.sched)} on Load Out`}
        style={cell(p.sched === null ? 'var(--danger-fg)' : p.future ? 'var(--text-secondary)' : 'var(--text-primary)')}
      >
        {p.sched === null ? 'Not Scheduled' : fmt(p.sched)}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!x.work && p.inP !== null && !out ? (
          <AssignPill onClick={(e) => s.openMenu(e, 'assignRow', p.id)} />
        ) : x.work ? (
          <WorkCell
            label={x.work.label}
            color={p.future ? 'var(--text-secondary)' : 'var(--text-primary)'}
            title={x.work.left ? `Left ${x.work.left}` : x.work.set ? `Set ${x.work.set}` : ''}
            editable={workEditable}
            onClick={(e) => s.openMenu(e, 'assignRow', p.id)}
          />
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span title={lsTitle} style={cell(lsColor, lsWeight)}>{lsTxt}</span>
      </div>

      <span title={leTitle} style={cell(leColor, leWeight)}>{leTxt}</span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-60)' }}>
        <RowIcon
          name="DlCallSm"
          title={out ? 'Punched out' : `Call ${p.name}`}
          color={out ? 'var(--text-disabled)' : 'var(--success-fg)'}
          enabled={!out}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('udsp-dial', { detail: { name: p.name, number: '(213) 555-0100' } }),
            )
          }
        />
        <RowIcon
          name={rem ? 'PgSendFilled' : 'PgSend'}
          title={
            rem
              ? `Reminded ${rem.at} · ${rem.mode} - click to re-send`
              : canRemind
                ? 'Sends the reminder this row needs'
                : 'Nothing to remind'
          }
          color={rem ? 'var(--success-fg)' : canRemind ? 'var(--text-secondary)' : 'var(--text-disabled)'}
          enabled={canRemind || !!rem}
          onClick={() => s.doRemind([x])}
        />
      </div>
    </div>
  )
}

function NameCell({ name, onClick }: { name: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Open the Associates profile"
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        padding: '0 var(--size-60)',
        margin: '0 calc(var(--size-60) * -1)',
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <span style={{ ...caption1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
    </div>
  )
}

/** An empty seat: a dashed control that opens the same picker as the bar. */
function AssignPill({ onClick }: { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        alignSelf: 'stretch',
        boxSizing: 'border-box',
        height: 28,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: '1px dashed var(--border-strong, var(--neutral-400))',
        color: 'var(--text-secondary)',
        ...caption1,
        fontWeight: 'var(--weight-semibold)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <span>Assign Work</span>
      <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
        <Icon name="FnChevronRight" size={12} />
      </span>
    </div>
  )
}

function WorkCell({
  label,
  color,
  title,
  editable,
  onClick,
}: {
  label: string
  color: string
  title: string
  editable: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  if (!editable) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', minWidth: 0 }}>
        <span title={title} style={{ ...body1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
      </div>
    )
  }
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
      title="Change the work"
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        minWidth: 0,
        padding: '0 var(--size-60)',
        margin: '0 calc(var(--size-60) * -1)',
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  )
}
