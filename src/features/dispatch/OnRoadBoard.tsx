'use client'

import { useMemo } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { fmt, onRoadBoard, routeTone, urgency } from './calc'
import type { BoardItem } from './calc'
import { CheckBox, Chip, EditableCell, Pill, SearchField, ToolButton } from './parts'
import { CARD, COL_HEAD, SECTION_LABEL } from './ui'
import type { DispatchState } from './useDispatch'

/**
 * On Road: what is happening out there, and who needs help.
 *
 * The board is ordered by urgency rather than by route number — late first,
 * done last — because the point of the screen is triage, not enumeration.
 */
export function OnRoadBoard({ s }: { s: DispatchState }) {
  const d = s.day
  const B = useMemo(() => onRoadBoard(d), [d])

  if (d.rows.length === 0) {
    return (
      <div
        data-screen-label="On Road - empty day"
        style={{
          ...CARD,
          padding: 'var(--size-480) var(--size-240)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--size-160)',
        }}
      >
        <span style={{ fontSize: 'var(--subtitle-1-size)', lineHeight: 'var(--subtitle-1-lh)', color: 'var(--text-secondary)' }}>
          Nothing has launched yet
        </span>
        <ToolButton onClick={() => s.setTab('loadout')}>Go to Load Out</ToolButton>
      </div>
    )
  }

  const pace = B.rows.filter((b) => !b.done && b.st === 'pace')
  const behind = B.rows.filter((b) => !b.done && b.st === 'behind')
  const late = B.rows.filter((b) => b.late)
  const nodata = B.rows.filter((b) => !b.done && (b.st === 'nodata' || b.st === 'preimport'))
  const rescOut = B.resc.filter((b) => !b.done)
  const doneRows = B.all.filter((b) => b.done)
  const issues = B.rows.filter((b) => b.note?.issue)
  const waved = B.rows.filter((b) => b.msgsOff)

  const chips: { k: string; label: string; tone: 'green' | 'warn' | 'danger' | 'blue' | 'muted' }[] = [
    { k: 'pace', label: `${pace.length} On Pace`, tone: 'green' },
    { k: 'behind', label: `${behind.length} Behind`, tone: 'warn' },
    { k: 'late', label: `${late.length} Late RTS`, tone: 'danger' },
    { k: 'nodata', label: `${nodata.length} No Data`, tone: 'warn' },
    { k: 'resc', label: `${rescOut.length} Rescue Out`, tone: 'blue' },
    { k: 'done', label: `${doneRows.length} Done`, tone: 'muted' },
    { k: 'issues', label: `${issues.length} Issues`, tone: 'danger' },
    { k: 'waved', label: `${waved.length} Waved Off`, tone: 'muted' },
  ]

  const F = s.orFilter
  const passF = (b: BoardItem): boolean => {
    if (!F) return true
    if (F === 'pace') return b.kind === 'route' && !b.done && b.st === 'pace'
    if (F === 'behind') return b.kind === 'route' && !b.done && b.st === 'behind'
    if (F === 'late') return b.late
    if (F === 'nodata') return b.kind === 'route' && !b.done && (b.st === 'nodata' || b.st === 'preimport')
    if (F === 'resc') return b.kind === 'rescue' && !b.done
    if (F === 'done') return b.done
    if (F === 'issues') return !!b.note?.issue
    if (F === 'waved') return b.msgsOff
    return true
  }
  const q = s.orQ.trim().toLowerCase()
  const passQ = (b: BoardItem) => {
    if (!q) return true
    const hay =
      b.kind === 'route'
        ? [b.r.emp, b.r.route, b.r.van, b.note?.txt ?? '']
        : [b.x.rescuer?.name ?? '', b.x.rescuing.name, b.x.rescuing.route]
    return hay.some((x) => (x || '').toLowerCase().includes(q))
  }

  const vis = B.all.filter((b) => passF(b) && passQ(b)).sort((a, b) => urgency(a) - urgency(b))
  const routesDone = B.rows.filter((b) => b.done).length
  const pct = B.rows.length ? Math.round((routesDone / B.rows.length) * 100) : 0
  const allOn = vis.length > 0 && vis.every((b) => s.orSel[b.id])

  const gridCols = [
    '32px',
    'minmax(150px,1.1fr)',
    '104px',
    '104px',
    ...(s.orCols.van ? ['96px'] : []),
    'minmax(120px,.9fr)',
    'minmax(84px,.6fr)',
    'minmax(170px,1.2fr)',
    ...(s.orCols.notes ? ['minmax(130px,.9fr)'] : []),
    '140px',
  ].join(' ')

  return (
    <div data-screen-label="On Road" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={SECTION_LABEL}>On Road</span>

      <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
        <div
          data-rsp-wrap=""
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-100) var(--size-160)',
            flexWrap: 'wrap',
            rowGap: 'var(--size-60)',
          }}
        >
          <SearchField value={s.orQ} onChange={s.setOrQ} placeholder="Search driver or route" width={240} />
          <div style={{ flex: 1 }} />
          {s.orSel && Object.values(s.orSel).some(Boolean) && (
            <Chip
              label={`${Object.values(s.orSel).filter(Boolean).length} selected`}
              on
              onPick={() => s.setOrSel({})}
            />
          )}
          <ToolButton
            primary
            onClick={() => {
              const targets = vis.filter((b) => !b.done && !b.msgsOff)
              if (!targets.length) {
                s.toastMsg('Nobody to message — every route here is done or waved off')
                return
              }
              s.openDlg('p5', { ids: targets.filter((b) => b.kind === 'route').map((b) => b.id), status: true })
            }}
          >
            Send Status
          </ToolButton>
        </div>

        {/* The one line that says how the day is going. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: 'var(--size-60) var(--size-160)',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            rowGap: 'var(--size-60)',
          }}
        >
          <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {routesDone} of {B.rows.length} routes back · {pct}%
          </span>
          <div
            style={{
              width: 120,
              height: 6,
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-subtle)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success-accent)' }} />
          </div>
          {chips
            .filter((c) => !c.label.startsWith('0 '))
            .map((c) => (
              <Chip
                key={c.k}
                label={c.label}
                warn={c.tone === 'warn' || c.tone === 'danger'}
                on={F === c.k}
                onPick={() => s.setOrFilter(F === c.k ? null : c.k)}
              />
            ))}
          <div style={{ flex: 1 }} />
          <span style={{ ...caption1, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
            Feed {s.orFresh}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1180 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                alignItems: 'center',
                gap: 'var(--size-80)',
                padding: 'var(--size-80) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderBottom: '1px solid var(--border-default)',
                ...COL_HEAD,
              }}
            >
              <CheckBox
                on={allOn}
                onClick={() => {
                  const next: Record<string, boolean> = {}
                  if (!allOn) vis.forEach((b) => { next[b.id] = true })
                  s.setOrSel(next)
                }}
              />
              <div>Driver</div>
              <div>Status</div>
              <div>Route</div>
              {s.orCols.van && <div>Van</div>}
              <div>Pkg Prog</div>
              <div>Stop Prog</div>
              <div>RTS · Plan → Proj</div>
              {s.orCols.notes && <div>Notes</div>}
              <div style={{ textAlign: 'center' }}>Actions</div>
            </div>

            {vis.map((b) => (
              <OnRoadRow key={b.id} b={b} s={s} gridCols={gridCols} />
            ))}

            {vis.length === 0 && (
              <div style={{ padding: 'var(--size-240)', textAlign: 'center', ...caption1, color: 'var(--text-secondary)' }}>
                Nothing matches this filter
              </div>
            )}
          </div>
        </div>
      </div>

      {d.unmatched.length > 0 && (
        <div
          role="status"
          style={{
            ...CARD,
            marginTop: 'var(--size-80)',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-40)',
          }}
        >
          <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--warning-fg)' }}>
            {d.unmatched.length} rows in the itinerary file matched nothing on this board
          </span>
          {d.unmatched.map((u) => (
            <span key={u} style={{ ...caption1, color: 'var(--warning-fg)' }}>
              {u}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function OnRoadRow({ b, s, gridCols }: { b: BoardItem; s: DispatchState; gridCols: string }) {
  const [hover, hoverProps] = useHover()
  const on = !!s.orSel[b.id]
  const tone = routeTone(b)
  const isRoute = b.kind === 'route'

  const driver = isRoute ? b.r.emp : (b.x.rescuer?.name ?? 'No rescuer')
  const route = isRoute ? b.r.route : b.x.rescuing.route
  const van = isRoute ? b.r.van : (b.x.rescuer?.van ?? '')

  let pkgTxt = '-'
  let stpTxt = '-'
  let rtsTxt = '- → -'
  let rtsColor = 'var(--text-primary)'
  let otChip = ''

  if (isRoute) {
    const it = b.it
    if (b.st === 'nodata' || b.st === 'preimport' || !it) {
      pkgTxt = 'Not In File'
      rtsTxt = b.plan === null ? '- → -' : `${fmt(b.plan)} → Not Back`
      rtsColor = b.plan === null ? 'var(--text-secondary)' : 'var(--danger-fg)'
    } else {
      pkgTxt = it.pkg ? `${it.pkg[0]}/${it.pkg[1]}${it.pkg[0] === it.pkg[1] ? ' ✓' : ''}` : '-'
      stpTxt = it.stp ? `${it.stp[0]}/${it.stp[1]}${it.stp[0] === it.stp[1] ? ' ✓' : ''}` : '-'
      if (b.done) {
        rtsTxt = `Back ${fmt(it.back)} ✓`
        rtsColor = 'var(--success-fg)'
      } else {
        rtsTxt = `${fmt(b.plan)} → ${fmt(it.proj)}`
        if (it.ot) otChip = `+${it.ot}m`
        if (b.late) rtsColor = 'var(--danger-fg)'
      }
    }
  } else {
    pkgTxt = b.x.totes === null ? '-' : `${b.x.totes} totes`
    stpTxt = '-'
    rtsTxt = b.x.onPad ? 'On pad' : b.x.where.a
    rtsColor = 'var(--text-secondary)'
  }

  const noteEditing = s.edit?.list === 'or' && s.edit.id === b.id

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        alignItems: 'center',
        gap: 'var(--size-80)',
        minHeight: 44,
        padding: 'var(--size-40) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        // A finished route steps back rather than leaving the board, so the
        // count still adds up.
        opacity: b.done ? 0.55 : 1,
        ...body1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <CheckBox on={on} onClick={(e) => { e.stopPropagation(); s.setOrSel({ ...s.orSel, [b.id]: !on }) }} />

      <span
        onClick={() => driver && s.toastMsg(`Opens the Associates profile · ${driver}`)}
        style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={driver}
      >
        {driver}
      </span>

      <Pill bg={tone.bg} border={tone.border} fg={tone.fg} dot={tone.dot}>
        {tone.label}
      </Pill>

      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route}</span>
      {s.orCols.van && (
        <span style={{ color: van ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{van || '-'}</span>
      )}

      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          color: pkgTxt === 'Not In File' ? 'var(--text-secondary)' : 'var(--text-primary)',
        }}
      >
        {pkgTxt}
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{stpTxt}</span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        <span style={{ color: rtsColor, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{rtsTxt}</span>
        {otChip && (
          <Pill bg="var(--warning-bg)" border="var(--warning-border)" fg="var(--warning-fg)" title="Projected overtime">
            {otChip}
          </Pill>
        )}
      </span>

      {s.orCols.notes && (
        <EditableCell
          editing={noteEditing}
          value={s.editVal}
          display={
            b.note ? (
              <span style={{ color: b.note.issue ? 'var(--danger-fg)' : 'var(--text-secondary)' }} title={`${b.note.who} · ${b.note.when}`}>
                {b.note.txt}
              </span>
            ) : (
              <span style={{ color: 'var(--text-disabled)' }}>Add a note</span>
            )
          }
          onStart={() => s.startEdit('or', b.id, 'note', b.note?.txt ?? '')}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-40)' }}>
        <Act
          name="DlCallSm"
          title={driver ? `Call ${driver}` : 'Nobody to call'}
          color={driver ? 'var(--success-fg)' : 'var(--text-disabled)'}
          enabled={!!driver}
          onClick={() => s.setHang({ list: 'or', id: b.id, name: driver })}
        />
        <Act
          name={b.sent ? 'PgSendFilled' : 'PgSend'}
          title={b.done ? 'Route is back' : b.msgsOff ? 'Messages waved off for this route' : 'Send a status SMS'}
          color={b.done || b.msgsOff ? 'var(--text-disabled)' : 'var(--success-fg)'}
          enabled={!b.done && !b.msgsOff}
          onClick={() => s.openDlg('p5', { ids: [b.id], status: true })}
        />
        {isRoute && !b.done && (
          <Act
            name="PgPeopleList"
            title="Send a rescue to this route"
            color="var(--text-secondary)"
            enabled
            onClick={() => s.openDlg('p10', { rescuingId: b.id })}
          />
        )}
      </div>
    </div>
  )
}

function Act({
  name,
  title,
  color,
  enabled,
  onClick,
}: {
  name: string
  title: string
  color: string
  enabled: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        if (enabled) onClick()
      }}
      style={{
        width: 24,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: hover && enabled ? 'var(--surface-subtle)' : 'transparent',
        color,
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </span>
  )
}
