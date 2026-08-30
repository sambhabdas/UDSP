'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1, subtitle2 } from '../../ds/type'
import { dateLabel } from './calc'
import { Dialogs } from './Dialogs'
import { LoadOutBoard } from './LoadOutBoard'
import { OnRoadBoard } from './OnRoadBoard'
import { RtsBoard } from './RtsBoard'
import { SetupBoard } from './SetupBoard'
import { HangUpPrompt, Menus } from './Menus'
import { IconSquare, Pill, Toast, ToolButton } from './parts'
import { useDispatch } from './useDispatch'
import type { DispatchState, Tab } from './useDispatch'

const TABS: [Tab, string][] = [
  ['loadout', 'Load Out'],
  ['onroad', 'On Road'],
  ['rts', 'Return to Station'],
  ['setup', 'Setup'],
]

/**
 * Dispatch: the station's day, in the order it happens.
 *
 * Load Out gets routes out of the door, On Road watches them, Return to Station
 * closes the count, and Setup holds the templates the first three send from.
 * All four read one day, so a change on one board is visible on the others.
 */
export function DispatchPage() {
  const s = useDispatch()

  return (
    <div
      data-screen-label="Dispatch"
      onClick={() => {
        if (s.menu) s.closeMenu()
        if (s.cal) s.setCal(null)
      }}
      style={{
        boxSizing: 'border-box',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-subtle)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
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
        {/* Editing a day that is not today reaches into things that are already
            counted, so the board says so before anything is touched. */}
        {s.dayOff < 0 && (
          <div
            role="status"
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-120) var(--size-160)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-medium)',
              ...caption1,
              color: 'var(--warning-fg)',
              textWrap: 'pretty',
            }}
          >
            ⚠ Editing a past day moves Work Summary’s launched count and Return to Station’s opening check — a
            locked Work Summary day absorbs it only on reopen
          </div>
        )}

        {s.tab === 'loadout' && <LoadOutBoard s={s} />}
        {s.tab === 'onroad' && <OnRoadBoard s={s} />}
        {s.tab === 'rts' && <RtsBoard s={s} />}
        {s.tab === 'setup' && <SetupBoard s={s} />}
      </div>

      <Dialogs s={s} />
      <Menus s={s} />
      {s.hang && <HangUpPrompt s={s} />}
      {s.toast && <Toast onUndo={s.undoSnap ? s.undo : undefined}>{s.toast}</Toast>}
    </div>
  )
}

function TopBar({ s }: { s: DispatchState }) {
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
        flexWrap: 'wrap',
      }}
    >
      {TABS.map(([id, label]) => (
        <TabButton key={id} label={label} active={s.tab === id} onPick={() => s.setTab(id)} />
      ))}

      <div style={{ flex: 1 }} />

      {/* Setup is not about a day, so the date stepper goes away there. */}
      {s.tab !== 'setup' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', position: 'relative' }}>
          {s.dayOff !== 0 && (
            <Pill bg="var(--surface-subtle)" border="var(--border-default)" fg="var(--text-secondary)">
              {s.dayOff < 0 ? 'past day' : 'future day'}
            </Pill>
          )}
          <IconSquare name="FnChevronLeft" title="Previous day" onClick={() => s.goDay(s.dayOff - 1)} />
          <DayButton s={s} />
          <IconSquare name="FnChevronRight" title="Next day" onClick={() => s.goDay(s.dayOff + 1)} />
          {s.cal && <Calendar s={s} />}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {s.tab === 'loadout' && (
        <>
          <ToolButton chevron onClick={(e) => s.openMenu(e, 'export')}>
            Export
          </ToolButton>
          <ToolButton primary chevron onClick={(e) => s.openMenu(e, 'import')}>
            Import
          </ToolButton>
        </>
      )}
      {s.tab === 'onroad' && (
        <ToolButton primary onClick={() => s.toastMsg('Itinerary import · reads the routing file and re-prices the board')}>
          Import Itineraries
        </ToolButton>
      )}
      {s.tab === 'rts' && (
        <ToolButton primary onClick={() => s.toastMsg('Closing import · reads the door scan file')}>
          Closing Import
        </ToolButton>
      )}
    </div>
  )
}

function TabButton({ label, active, onPick }: { label: string; active: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        background: !active && hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
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

function DayButton({ s }: { s: DispatchState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Pick a date"
      onClick={(e) => {
        e.stopPropagation()
        if (s.cal) {
          s.setCal(null)
          return
        }
        const base = new Date(2026, 6, 29 + s.dayOff)
        s.setCal({ x: 0, y: 0, m: base.getMonth(), yr: base.getFullYear() })
      }}
      style={{
        boxSizing: 'border-box',
        minWidth: 150,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {dateLabel(s.dayOff)}
    </div>
  )
}

const DOWS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function Calendar({ s }: { s: DispatchState }) {
  const c = s.cal!
  const anchor = new Date(2026, 6, 29)
  const startDow = new Date(c.yr, c.m, 1).getDay()
  const dim = new Date(c.yr, c.m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ]
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 34,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 244,
        boxSizing: 'border-box',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        padding: 'var(--size-120)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', marginBottom: 'var(--size-80)' }}>
        <IconSquare
          name="FnChevronLeft"
          title="Previous month"
          onClick={() => s.setCal({ ...c, m: c.m === 0 ? 11 : c.m - 1, yr: c.m === 0 ? c.yr - 1 : c.yr })}
        />
        <span style={{ flex: 1, textAlign: 'center', ...body1, fontWeight: 'var(--weight-semibold)' }}>
          {months[c.m]} {c.yr}
        </span>
        <IconSquare
          name="FnChevronRight"
          title="Next month"
          onClick={() => s.setCal({ ...c, m: c.m === 11 ? 0 : c.m + 1, yr: c.m === 11 ? c.yr + 1 : c.yr })}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 'var(--size-20)' }}>
        {DOWS.map((t, i) => (
          <span
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 24,
              ...caption1,
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-secondary)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((n, i) =>
          n === null ? (
            <span key={i} />
          ) : (
            <DayCell
              key={i}
              n={n}
              selected={Math.round((new Date(c.yr, c.m, n).getTime() - anchor.getTime()) / 86400000) === s.dayOff}
              onPick={() => {
                const off = Math.round((new Date(c.yr, c.m, n).getTime() - anchor.getTime()) / 86400000)
                s.goDay(off)
              }}
            />
          ),
        )}
      </div>
    </div>
  )
}

function DayCell({ n, selected, onPick }: { n: number; selected: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 28,
        borderRadius: 'var(--radius-small)',
        background: selected ? 'var(--primary)' : hover ? 'var(--surface-subtle)' : 'transparent',
        color: selected ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...caption1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        fontVariantNumeric: 'tabular-nums',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {n}
    </div>
  )
}
