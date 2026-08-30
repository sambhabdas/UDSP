'use client'

import { useHover } from '../../ds/useHover'
import { body1, subtitle2 } from '../../ds/type'
import { NOW, kindOfWorkType } from './data'
import { fmt } from './calc'
import { Board } from './Board'
import { MessageSetup } from './MessageSetup'
import { ImportDialog } from './ImportDialog'
import { IconSquare, TallButton, Toast } from './parts'
import { useCompliance } from './useCompliance'
import type { ComplianceState } from './useCompliance'

/**
 * Compliance: the punch and lunch board for the day.
 *
 * Two tabs share one page — the board itself, and the message setup that
 * decides when the reminders it sends go out. The thresholds set on the second
 * tab move the first tab's warnings, so they are one screen, not two.
 */
export function CompliancePage() {
  const s = useCompliance()

  return (
    <div
      data-screen-label="Compliance"
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
        {s.tab === 'board' ? <Board s={s} /> : <MessageSetup s={s} />}
      </div>

      <ImportDialog s={s} />
      <Menu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

const TABS: [ComplianceState['tab'], string][] = [
  ['board', 'Compliance'],
  ['setup', 'Message Setup'],
]

function TopBar({ s }: { s: ComplianceState }) {
  const isBoard = s.tab === 'board'
  return (
    <div
      data-rsp-bar=""
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-240)',
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {TABS.map(([id, label]) => (
        <Tab key={id} label={label} active={s.tab === id} onClick={() => { s.setTab(id); s.setMenu(null) }} />
      ))}
      <div style={{ flex: 1 }} />
      {/* The day stepper and the two actions belong to the board only. */}
      {isBoard && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <IconSquare name="FnChevronLeft" title="Previous day" onClick={() => s.goDay(-1)} />
          <span style={{ minWidth: 130, textAlign: 'center', ...body1, fontWeight: 'var(--weight-semibold)' }}>
            {s.dateLabel}
          </span>
          <IconSquare name="FnChevronRight" title="Next day" onClick={() => s.goDay(1)} />
        </div>
      )}
      <div style={{ flex: 1 }} />
      {isBoard && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <TallButton chevron onClick={(e) => s.openMenu(e, 'export')}>Export</TallButton>
          <TallButton primary onClick={() => s.setImp({ file: null, fills: { in: true, out: true, ls: true, le: true } })}>
            Import Punches
          </TallButton>
        </div>
      )}
    </div>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          ...subtitle2,
          fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 'var(--size-120)',
            right: 'var(--size-120)',
            bottom: 0,
            height: 2,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
          }}
        />
      )}
    </div>
  )
}

interface MenuItem {
  divider?: boolean
  label: string
  color: string
  on: () => void
}

/**
 * The one popover the page has. Its contents depend on what opened it; the
 * three pickers also float a search field over the control they came from, so
 * you can type past a long list without losing your place.
 */
function Menu({ s }: { s: ComplianceState }) {
  const M = s.menu
  if (!M) return null
  const items = menuItems(s, M.kind)
  const searchable = M.kind !== 'export'

  return (
    <>
      {searchable && (
        <input
          data-pop=""
          autoFocus
          value={s.menuQ}
          onChange={(e) => s.setMenuQ(e.target.value)}
          placeholder={M.kind === 'addrow' ? 'Search drivers' : 'Search or type a new work'}
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
          width: M.w,
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
            <MenuRow key={`${m.label}-${i}`} label={m.label} color={m.color} onClick={m.on} />
          ),
        )}
      </div>
    </>
  )
}

function MenuRow({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        flexShrink: 0,
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-60) var(--size-100)',
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

function menuItems(s: ComplianceState, kind: NonNullable<ComplianceState['menu']>['kind']): MenuItem[] {
  const mq = s.menuQ.trim().toLowerCase()
  const items: MenuItem[] = []

  if (kind === 'assign' || kind === 'assignRow') {
    const typed = s.menuQ.trim()
    // A name that is not already a work type can be created on the spot.
    if (mq && !s.workTypes.some((w) => w.toLowerCase() === mq)) {
      items.push({
        label: `Add "${typed}"`,
        color: 'var(--blue-700)',
        on: () => s.addWorkType(typed, s.menuTargets(true)),
      })
    }
    s.workTypes
      .filter((w) => !mq || w.toLowerCase().includes(mq))
      .forEach((w) =>
        items.push({
          label: w,
          color: 'var(--text-primary)',
          on: () => {
            const ids = s.menuTargets(true)
            s.assignWork(w, kindOfWorkType(w), ids)
            s.toastMsg(`${w} assigned to ${ids.length} - stamped set ${fmt(NOW)}`)
          },
        }),
      )
    items.push({ divider: true, label: '', color: '', on: () => {} })
    // These two act on the selection only — never on the whole board.
    items.push({ label: 'End work now', color: 'var(--text-primary)', on: () => s.endWork(s.menuTargets(false)) })
    items.push({ label: 'Clear Work', color: 'var(--danger-fg)', on: () => s.clearWork(s.menuTargets(false)) })
    return items
  }

  if (kind === 'addrow') {
    const onBoard = new Set(s.people.map((p) => p.name))
    s.addPool
      .filter((n) => !onBoard.has(n) && (!mq || n.toLowerCase().includes(mq)))
      .forEach((n) => items.push({ label: n, color: 'var(--text-primary)', on: () => s.addRow(n) }))
    if (!items.length) {
      items.push({ label: 'Everyone is on the board', color: 'var(--text-secondary)', on: () => {} })
    }
    return items
  }

  ;['CSV', 'XLSX'].forEach((o) =>
    items.push({
      label: o,
      color: 'var(--text-primary)',
      on: () => {
        s.setMenu(null)
        s.toastMsg(`${o} exported - the visible board`)
      },
    }),
  )
  return items
}
