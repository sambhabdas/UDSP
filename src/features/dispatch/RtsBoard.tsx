'use client'

import { useMemo } from 'react'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1 } from '../../ds/type'
import { MISSING_FROM_FILE, fmt, rtsBoard } from './calc'
import type { RtsRow } from './calc'
import { ME, NOW } from './data'
import { Chip, EditableCell, Pill, SearchField, ToolButton } from './parts'
import { CARD, COL_HEAD, SECTION_LABEL } from './ui'
import type { DispatchState } from './useDispatch'

const COLS = '32px 92px minmax(140px,1.1fr) minmax(150px,1fr) 84px 72px 84px 72px 84px 84px minmax(140px,1fr)'

/**
 * Return to Station: the day's arithmetic, closed at the door.
 *
 * Out minus delivered is what the file says came back; `Counted` is what a
 * person actually counted. The board exists for the gap between those two, so a
 * route that has not been counted stays visibly open rather than defaulting to
 * agreement.
 */
export function RtsBoard({ s }: { s: DispatchState }) {
  const d = s.day
  const B = useMemo(() => rtsBoard(d), [d])

  if (d.rows.length === 0) {
    return (
      <div
        data-screen-label="Return to Station - empty day"
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
          Nothing launched, so nothing to close
        </span>
        <ToolButton onClick={() => s.setTab('loadout')}>Go to Load Out</ToolButton>
      </div>
    )
  }

  const q = (s.qResc || '').trim().toLowerCase()
  const vis = B.rows.filter(
    (r) => !q || [r.route, r.emp, r.note?.txt ?? ''].some((x) => (x || '').toLowerCase().includes(q)),
  )

  const sum = (f: (r: RtsRow) => number) => B.rows.reduce((a, r) => a + f(r), 0)
  const totOut = sum((r) => r.out)
  const totDel = sum((r) => r.delivered)
  const totRecon = sum((r) => r.recon)
  const totRet = sum((r) => r.returned)
  const countedRows = B.rows.filter((r) => r.recon > 0 && r.counted !== undefined)
  const openRows = B.rows.filter((r) => r.recon > 0 && r.counted === undefined)
  const totCount = countedRows.reduce((a, r) => a + (r.counted ?? 0), 0)
  const short = B.rows.filter((r) => r.counted !== undefined && r.counted !== r.recon)
  const issues = B.rows.filter((r) => r.inNote)

  const warnBits: string[] = []
  if (openRows.length) warnBits.push(`${openRows.length} routes not counted`)
  if (short.length) warnBits.push(`${short.length} short at the door`)
  warnBits.push(`${MISSING_FROM_FILE} missing from the closing file`)

  const closed = d.rtsClosed

  return (
    <div data-screen-label="Return to Station" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={SECTION_LABEL}>Return to Station</span>

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
          <SearchField value={s.qResc} onChange={s.setQResc} placeholder="Search route or driver" width={240} />
          {issues.length > 0 && <Chip label={`${issues.length} flagged on road`} warn />}
          <div style={{ flex: 1 }} />
          {closed ? (
            <Pill bg="var(--success-bg)" border="var(--success-border)" fg="var(--success-fg)" dot="var(--success-accent)">
              Closed · {closed}
            </Pill>
          ) : (
            <ToolButton
              onClick={() => {
                // Counting every route is the precondition, and the button says
                // so rather than closing on an incomplete count.
                if (openRows.length) {
                  s.toastMsg(`${openRows.length} routes still have no door count — count them before closing the day`)
                  return
                }
                s.act(`Day closed by ${ME} · ${fmt(NOW)}`, { rtsClosed: `${ME} · ${fmt(NOW)}` })
              }}
              primary
            >
              Close the day
            </ToolButton>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: 'var(--size-60) var(--size-160)',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-default)',
            ...caption1,
            color: 'var(--warning-fg)',
            flexWrap: 'wrap',
            rowGap: 'var(--size-60)',
          }}
        >
          ⚠ {warnBits.join(' · ')}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1180 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: COLS,
                alignItems: 'center',
                gap: 'var(--size-80)',
                padding: 'var(--size-80) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderBottom: '1px solid var(--border-default)',
                ...COL_HEAD,
              }}
            >
              <span />
              <div>Route</div>
              <div>Driver</div>
              <div>Service type</div>
              <div style={{ textAlign: 'right' }}>Stops</div>
              <div style={{ textAlign: 'right' }}>Out</div>
              <div style={{ textAlign: 'right' }}>Delivered</div>
              <div style={{ textAlign: 'right' }}>Recon</div>
              <div style={{ textAlign: 'right' }}>Counted</div>
              <div style={{ textAlign: 'right' }}>Returned</div>
              <div>Notes</div>
            </div>

            {vis.map((r) => (
              <RtsRowView key={r.route} r={r} s={s} />
            ))}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: COLS,
                alignItems: 'center',
                gap: 'var(--size-80)',
                minHeight: 44,
                padding: 'var(--size-40) var(--space-cell-x)',
                background: 'var(--surface-subtle)',
                borderTop: '1px solid var(--border-default)',
                ...body1Strong,
                color: 'var(--text-secondary)',
              }}
            >
              <span />
              <div>{B.rows.length} routes</div>
              <div />
              <div />
              <div />
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{totOut}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{totDel}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{totRecon}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{totCount}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{totRet}</div>
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RtsRowView({ r, s }: { r: RtsRow; s: DispatchState }) {
  const [hover, hoverProps] = useHover()
  const countEditing = s.edit?.list === 'rts' && s.edit.id === r.route && s.edit.f === 'counted'
  const noteEditing = s.edit?.list === 'rts' && s.edit.id === r.route && s.edit.f === 'note'
  // Counted against recon is the whole reconciliation: a mismatch is a real
  // discrepancy, and an uncounted route is simply not done yet.
  const mismatch = r.counted !== undefined && r.counted !== r.recon
  const uncounted = r.recon > 0 && r.counted === undefined

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        alignItems: 'center',
        gap: 'var(--size-80)',
        minHeight: 44,
        padding: 'var(--size-40) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...body1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span>
        {r.inNote && (
          <span title={`${r.inNote.txt} — ${r.inNote.who} · ${r.inNote.when}`} style={{ color: 'var(--danger-fg)', cursor: 'help' }}>
            ●
          </span>
        )}
      </span>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>{r.route}</div>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.emp}>
        {r.emp}
      </div>
      <div style={{ ...caption1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.type}
      </div>
      <div style={{ textAlign: 'right', ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
        {r.stops}
      </div>
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.out}</div>
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.delivered}</div>
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.recon}</div>
      <div style={{ textAlign: 'right' }}>
        <EditableCell
          editing={countEditing}
          value={s.editVal}
          display={
            r.counted === undefined ? (
              <span style={{ color: uncounted ? 'var(--warning-fg)' : 'var(--text-secondary)' }}>
                {uncounted ? 'Count' : '-'}
              </span>
            ) : (
              <span style={{ color: mismatch ? 'var(--danger-fg)' : 'var(--success-fg)', fontWeight: 'var(--weight-semibold)' }}>
                {r.counted}
              </span>
            )
          }
          onStart={() => s.startEdit('rts', r.route, 'counted', r.counted)}
          onChange={s.setEditVal}
          onCommit={s.commitEdit}
          onCancel={() => s.setEdit(null)}
          align="right"
          title={mismatch ? `Counted ${r.counted} against ${r.recon} reconciled` : undefined}
        />
      </div>
      <div
        style={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: r.returned !== r.recon ? 'var(--danger-fg)' : 'var(--text-primary)',
        }}
        title={r.returned !== r.recon ? `${r.recon - r.returned} did not physically come back` : undefined}
      >
        {r.returned}
      </div>
      <EditableCell
        editing={noteEditing}
        value={s.editVal}
        display={
          r.note ? (
            <span title={`${r.note.who} · ${r.note.when}`}>{r.note.txt}</span>
          ) : (
            <span style={{ color: 'var(--text-disabled)' }}>Add a note</span>
          )
        }
        onStart={() => s.startEdit('rts', r.route, 'note', r.note?.txt ?? '')}
        onChange={s.setEditVal}
        onCommit={s.commitEdit}
        onCancel={() => s.setEdit(null)}
      />
    </div>
  )
}
