'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../ds/icons/Icon'
import { useHover } from '../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle2 } from '../ds/type'
import { initials, tint } from '../ds/avatar'
import { useViewportWidth } from '../ds/useViewportWidth'
import {
  BRAND,
  PORTALS,
  USER_NAME,
  getPortal,
  hrefOf,
  startsGroup,
} from './nav'
import type { NavPage, Portal } from './nav'
import { Dialer } from '../features/dialer/Dialer'

// Rail geometry and states are Shell.dc.html's, not invented here:
//  · 48px rail, 40×36 tiles at 2px/4px margins, 8px top and 6px bottom padding
//  · groups separated by a 1px white-at-14% rule, plus one under the monogram
//  · selection is a 2px white pill bar at the tile's left edge and the FILLED
//    glyph - no background plate, and the selected tile takes no hover plate
//  · hover is white at 8% with the glyph lifting to pure white
const RAIL_DIVIDER = 'rgba(255,255,255,.14)'
const RAIL_HOVER = 'rgba(255,255,255,.08)'

function RailDivider({ margin }: { margin: string }) {
  return <div style={{ height: 1, background: RAIL_DIVIDER, margin }} />
}

function RailTile({
  portal,
  active,
  onClick,
}: {
  portal: Portal
  active: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      title={portal.label}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: 'var(--rail-tile-width)',
        height: 'var(--rail-tile-height)',
        margin: 'var(--size-20) var(--size-40) 0 var(--size-40)',
        borderRadius: 'var(--radius-medium)',
        // The active tile never takes a hover plate - its bar already carries it.
        background: !active && hover ? RAIL_HOVER : 'transparent',
        color: active || hover ? 'var(--white)' : 'var(--on-dark-icon)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background var(--motion-hover), color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            width: 2,
            height: 28,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--white)',
          }}
        />
      )}
      <Icon name={active ? `${portal.icon}Filled` : portal.icon} size={20} />
    </div>
  )
}

function SideRail({
  active,
  onSelect,
  hidden,
  nextStep,
  onStep,
}: {
  active: string
  onSelect: (id: string) => void
  hidden: boolean
  /** What the control at the foot of the rail will do next. */
  nextStep: 'unpin-panel' | 'hide-rail'
  onStep: () => void
}) {
  return (
    <div
      // The rail animates its own width the way the panel does, so retracting
      // hands the space to the page rather than sliding a bar over it.
      style={{
        width: hidden ? 0 : 'var(--rail-width)',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width var(--duration-fast) var(--curve-easy-ease)',
      }}
      aria-hidden={hidden || undefined}
    >
    <nav
      data-rail=""
      style={{
        boxSizing: 'border-box',
        width: 'var(--rail-width)',
        // The retract wrapper is a plain block, so the rail has to claim the
        // full height itself - without this it shrinks to its tiles and the
        // dark column stops short of the bottom of the window.
        height: '100%',
        flexShrink: 0,
        background: 'var(--surface-inverse)',
        borderRadius: 'var(--radius-none)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 'var(--size-80) 0 var(--size-60) 0',
      }}
    >
      <div
        title={BRAND}
        style={{
          margin: '0 var(--size-40)',
          padding: 'var(--size-40)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-small)',
            background: 'var(--primary)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...caption1,
            fontWeight: 'var(--weight-bold)',
          }}
        >
          {BRAND.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <RailDivider margin="var(--size-100) var(--size-80) var(--size-40) var(--size-80)" />

      {PORTALS.map((portal) => (
        <Fragment key={portal.id}>
          {startsGroup(portal.id) && <RailDivider margin="var(--size-100) var(--size-80)" />}
          <RailTile
            portal={portal}
            active={portal.id === active}
            onClick={() => onSelect(portal.id)}
          />
        </Fragment>
      ))}

      <div style={{ flex: 1 }} />

      {/* One control, two steps: put the page list away, then the rail itself.
          Each step names what it will do, so neither is a guess. */}
      <CollapseTile step={nextStep} onClick={onStep} />
    </nav>
    </div>
  )
}

// The control at the foot of the rail - 16px chevron, pointing the way the
// sidebar will move.
function CollapseTile({
  step,
  onClick,
}: {
  step: 'unpin-panel' | 'hide-rail'
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  const label = step === 'unpin-panel' ? 'Unpin panel' : 'Hide sidebar'
  return (
    <div
      title={label}
      aria-label={label}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        boxSizing: 'border-box',
        width: 'var(--rail-tile-width)',
        height: 'var(--rail-tile-height)',
        margin: '0 var(--size-40) var(--size-20) var(--size-40)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? RAIL_HOVER : 'transparent',
        color: hover ? 'var(--white)' : 'var(--on-dark-icon)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background var(--motion-hover), color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="ChevronLeft" size={16} />
    </div>
  )
}

/** The way back once the whole sidebar is gone: a slim tab against the left
 *  edge of the content, the only thing left to click. */
function ShowSidebarTab({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Show sidebar"
      aria-label="Show sidebar"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30,
        boxSizing: 'border-box',
        width: 18,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0 var(--radius-medium) var(--radius-medium) 0',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderLeft: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        boxShadow: 'var(--elevation-menu)',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="ChevronRight" size={16} />
    </div>
  )
}

// A page row, styled as Shell.dc.html styles its pane-2 rows: the asymmetric
// radius, the neutral selected plate with a 2px primary bar, and the filled
// glyph in primary when selected.
function PanelItem({
  page,
  active,
  onClick,
}: {
  page: NavPage
  active: boolean
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        height: 'var(--row-height)',
        flexShrink: 0,
        borderRadius:
          'var(--radius-medium) var(--radius-small) var(--radius-small) var(--radius-medium)',
        // A selected row keeps its plate on hover; only an unselected one lifts.
        background: active
          ? 'var(--surface-selected)'
          : hover
            ? 'var(--surface-subtle)'
            : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
          }}
        />
      )}
      <span
        style={{
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          display: 'flex',
          flexShrink: 0,
          color: active ? 'var(--primary)' : 'var(--text-secondary)',
        }}
      >
        <Icon name={active ? `${page.icon}Filled` : page.icon} size={16} />
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(active ? body1Strong : body1),
          color: 'var(--text-primary)',
        }}
      >
        {page.label}
      </span>
    </div>
  )
}

/** Docks the panel beside the page, or hands it back to hover. */
function PinToggle({ pinned, onClick }: { pinned: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  const label = pinned ? 'Unpin panel' : 'Keep panel open'
  return (
    <div
      role="button"
      tabIndex={0}
      title={label}
      aria-label={label}
      aria-pressed={pinned}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onClick()
      }}
      onDoubleClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      style={{
        boxSizing: 'border-box',
        width: 24,
        height: 24,
        flexShrink: 0,
        marginLeft: 'var(--size-40)',
        borderRadius: 'var(--radius-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover), color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {/* Left sends it away, right pushes the page over to make room. */}
      <Icon name={pinned ? 'ChevronLeft' : 'ChevronRight'} size={16} />
    </div>
  )
}

/**
 * Pane 2, in one of two modes.
 *
 * Pinned, it is Shell.dc.html's column in the content row: the wrapper animates
 * its width and the page beside it grows into the space. Unpinned, it is a
 * flyout - the same nav, laid over the page instead of beside it, so brushing
 * the rail to check where you are does not reflow a wide table underneath.
 */
function PortalPanel({
  portal,
  activePage,
  open,
  floating,
  onSelect,
  onDismiss,
  onTogglePin,
}: {
  portal: Portal
  activePage: string | null
  open: boolean
  floating: boolean
  onSelect: (id: string) => void
  onDismiss: () => void
  onTogglePin: () => void
}) {
  const wrapper: CSSProperties = floating
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        width: 'var(--panel-width)',
        // It slides in from under the rail rather than fading in place, so the
        // movement says where it came from and where it will go back to.
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        boxShadow: open ? 'var(--elevation-menu)' : 'none',
        transition:
          'transform var(--duration-fast) var(--curve-easy-ease), opacity var(--duration-faster) var(--curve-linear)',
      }
    : {
        width: open ? 'var(--panel-width)' : 0,
        minWidth: 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width var(--duration-fast) var(--curve-easy-ease)',
      }

  return (
    <div style={wrapper} aria-hidden={!open || undefined}>
      <nav
        data-panel=""
        aria-label={portal.name}
        // Shell.dc.html: double-clicking the panel puts it away.
        onDoubleClick={onDismiss}
        style={{
          boxSizing: 'border-box',
          width: 'var(--panel-width)',
          height: '100%',
          background: 'var(--surface-card)',
          borderRight: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-none)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-20)',
          padding: 'var(--size-120) var(--size-80)',
          overflow: 'hidden',
          // The floating wrapper already fades; a docked one fades its contents
          // so the rows do not squash as the column narrows.
          opacity: floating || open ? 1 : 0,
          transition: 'opacity var(--duration-faster) var(--curve-linear)',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            height: 'var(--row-height)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-120)',
            margin: 'var(--size-40) 0 var(--size-60) 0',
          }}
        >
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...body1Strong,
              color: 'var(--text-primary)',
            }}
          >
            {portal.name}
          </span>
          <PinToggle pinned={!floating} onClick={onTogglePin} />
        </div>

        {/* The design file's nav simply clips; six rows plus the heading need
            250px, so a short viewport scrolls them rather than losing one. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          {portal.pages?.map((page) => (
            <PanelItem
              key={page.id}
              page={page}
              active={page.id === activePage}
              onClick={() => onSelect(page.id)}
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

// The top bar, from Shell.dc.html: the wordmark, a search field that swaps to a
// white plate on focus, and a 32px persona. Resting chrome, so a hairline and
// no shadow - the stroke-instead-of-key-shadow rule.
const SEARCH_NARROW_BELOW = 1024

function Header({ wordmark }: { wordmark: string }) {
  const searchWidth = useViewportWidth() < SEARCH_NARROW_BELOW ? 180 : 240
  const [avatarBg, avatarFg] = tint(USER_NAME)

  // The persona is the way out. A full navigation rather than a router push:
  // the middleware has to see the request without the cookie to send us to the
  // sign-in screen, and a client-side transition would not carry it there.
  const signOut = () => {
    void fetch('/api/logout', { method: 'POST' }).finally(() => window.location.assign('/login'))
  }

  return (
    <header
      style={{
        boxSizing: 'border-box',
        height: 'var(--header-height)',
        flexShrink: 0,
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-none)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        padding: '0 var(--size-200)',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: 'max-content',
          maxWidth: '100%',
          flexShrink: 1,
          minWidth: 0,
          paddingRight: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...subtitle2,
          color: 'var(--text-primary)',
        }}
      >
        {wordmark}
      </div>
      <div style={{ flex: 1 }} />

      {/* The focus swap - white plate, blue border - is the [data-field] rule
          in app.css, so it needs no state of its own. */}
      <span
        data-field=""
        style={{
          boxSizing: 'border-box',
          width: searchWidth,
          height: 'var(--control-height)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: 'var(--surface-page)',
          border: '1px solid var(--border-default)',
        }}
      >
        <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
        <input
          placeholder="Search routes, drivers…"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-family)',
            ...caption1,
            color: 'var(--text-primary)',
            padding: 0,
          }}
        />
      </span>

      <span
        role="button"
        tabIndex={0}
        aria-label={`${USER_NAME} - sign out`}
        title={`${USER_NAME} - sign out`}
        onClick={signOut}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            signOut()
          }
        }}
        style={{
          marginLeft: 'var(--size-40)',
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-circle)',
          background: avatarBg,
          color: avatarFg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          // The shell sets line-height:1 here; the flex centring already does
          // that job, so the paired Caption 1 Strong is kept instead.
          ...caption1Strong,
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        {initials(USER_NAME)}
      </span>
    </header>
  )
}

// Below this the rail and a 212px panel leave the page under 120px, so the
// panel starts put away. It is still a normal collapse - the control works.
const PANEL_FOLD = 900

// The shell is the layout, so it reads the route rather than being handed it -
// which is what makes every page linkable, bookmarkable and reloadable.
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [portalId, pageId] = useMemo(() => {
    const [p, pg] = pathname.split('/').filter(Boolean)
    return [getPortal(p ?? '') ? (p as string) : 'finance', pg ?? null] as const
  }, [pathname])

  const portal = getPortal(portalId)!
  const hasPanel = !!portal.pages

  // Shell.dc.html remembers the page you were last on per portal, so coming
  // back to a portal returns you to your page rather than to its first one.
  const lastPage = useRef<Record<string, string>>({})
  useEffect(() => {
    if (pageId) lastPage.current[portalId] = pageId
  }, [portalId, pageId])

  // The panel does not stay open by default. It flies out over the page when a
  // rail tile is clicked, and docks beside the page only when asked - a
  // preference that belongs to the size class it was expressed in, since
  // docking a 212px column on a 375px screen would leave the page 115px wide.
  const narrow = useViewportWidth() < PANEL_FOLD
  const [pref, setPref] = useState<{ pinned: boolean; narrow: boolean } | null>(null)
  const pinned = hasPanel && !narrow && pref?.narrow === narrow && pref.pinned
  const setPinned = (v: boolean) => setPref({ pinned: v, narrow })

  // The rail is a separate choice from the page list, and a deliberate one, so
  // it is never taken away by a resize - only by asking for it.
  const [railHidden, setRailHidden] = useState(false)

  // The flyout opens on a click and shuts on the next one. It used to fly out
  // on hover, which meant it appeared whenever the pointer crossed the rail on
  // its way somewhere else - so the panel is only ever opened deliberately now.
  const [shown, setShown] = useState(false)
  const panelOpen = hasPanel && !railHidden && (pinned || shown)
  const closePanel = () => setShown(false)

  // One control, walked in steps: undock the page list first, then the rail.
  // A portal with no docked list skips straight to the rail.
  const nextStep: 'unpin-panel' | 'hide-rail' = pinned ? 'unpin-panel' : 'hide-rail'
  const step = () => {
    if (pinned) setPinned(false)
    else {
      setRailHidden(true)
      closePanel()
    }
  }
  const showSidebar = () => setRailHidden(false)

  const go = (id: string, page?: string | null) =>
    router.push(hrefOf(id, page ?? lastPage.current[id] ?? null))

  // A rail tile toggles its own portal: the first click shows the pages, so the
  // next click is the page you want, and clicking the same tile again puts the
  // list away. Moving to a different portal keeps the list up, since the point
  // of that click was to see what is in there.
  const handleRail = (id: string) => {
    const hasPages = !!getPortal(id)?.pages
    setShown(hasPages && !(id === portalId && shown))
    go(id)
  }

  const handlePage = (id: string) => {
    go(portalId, id)
    // A flyout has done its job once a page has been picked; a docked panel is
    // there on purpose and stays.
    if (!pinned) closePanel()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideRail
        active={portalId}
        onSelect={handleRail}
        hidden={railHidden}
        nextStep={nextStep}
        onStep={step}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* The panel shows which page you are on, so the wordmark does not. */}
        <Header wordmark={`${BRAND} ${portal.name}`} />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
          {railHidden && <ShowSidebarTab onClick={showSidebar} />}
          {hasPanel && (
            <PortalPanel
              portal={portal}
              activePage={pageId}
              open={panelOpen}
              floating={!pinned}
              onSelect={handlePage}
              onDismiss={() => (pinned ? setPinned(false) : closePanel())}
              onTogglePin={() => {
                if (pinned) setPinned(false)
                else {
                  setPinned(true)
                  closePanel()
                }
              }}
            />
          )}
          {/* Reaching for the page puts a flyout away - the touch path's
              equivalent of moving the pointer off the rail. */}
          <main
            style={{ flex: 1, minWidth: 0, minHeight: 0 }}
            onPointerDown={() => {
              if (!pinned && panelOpen) closePanel()
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* The dialer belongs to no page: it floats over all of them, and pages
          reach it by dispatching `udsp-dial`. */}
      <Dialer />
    </div>
  )
}
