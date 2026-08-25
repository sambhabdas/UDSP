import { Fragment, useEffect, useRef, useState } from 'react'
import { Icon } from '../ds/icons/Icon.jsx'
import { useHover } from '../ds/useHover.js'
import { body1, body1Strong, caption1, caption1Strong, subtitle2 } from '../ds/type.js'
import { initials, tint } from '../ds/avatar.js'
import { useViewportWidth } from '../ds/useViewportWidth.js'
import { BRAND, PORTALS, USER_NAME, getPortal, startsGroup } from './nav.js'

// Rail geometry and states are Shell.dc.html's, not invented here:
//  · 48px rail, 40×36 tiles at 2px/4px margins, 8px top and 6px bottom padding
//  · groups separated by a 1px white-at-14% rule, plus one under the monogram
//  · selection is a 2px white pill bar at the tile's left edge and the FILLED
//    glyph — no background plate, and the selected tile takes no hover plate
//  · hover is white at 8% with the glyph lifting to pure white
const RAIL_DIVIDER = 'rgba(255,255,255,.14)'
const RAIL_HOVER = 'rgba(255,255,255,.08)'

function RailDivider({ margin }) {
  return <div style={{ height: 1, background: RAIL_DIVIDER, margin }} />
}

function RailTile({ portal, active, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      title={portal.label}
      onClick={(e) => {
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
        // The active tile never takes a hover plate — its bar already carries it.
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

function SideRail({ active, onSelect }) {
  return (
    <nav
      data-rail=""
      style={{
        boxSizing: 'border-box',
        width: 'var(--rail-width)',
        flexShrink: 0,
        // Above the panel, so a panel sliding out disappears under the rail
        // rather than across it. The shell's own overflow keeps it off-screen.
        position: 'relative',
        zIndex: 50,
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
    </nav>
  )
}

// A page row, styled as Shell.dc.html styles its pane-2 rows: the asymmetric
// radius, the neutral selected plate with a 2px primary bar, and the filled
// glyph in primary when selected.
function FlyoutItem({ page, active, onClick }) {
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

// The pane-2 list, floating: it fills the content row, flush against the rail
// and starting below the header — the header spans across in front of it, as it
// does in Shell.dc.html, where the panel is nested inside the row under the
// header rather than beside it. Shell.dc.html gives its own floating panel
// $shadow16, so that is the step used here rather than the menu step.
function PortalFlyout({ portal, activePage, open, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    // Only listen while open — the panel stays mounted once shut so it can
    // animate out, and a hidden panel must not swallow clicks or Escape.
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    const onDown = (e) => {
      // The rail is excluded on purpose. Closing here on mousedown and then
      // letting the tile's click reopen on the next task would mean a tile
      // could never toggle its own flyout shut — the tile owns that.
      if (e.target.closest && e.target.closest('[data-rail]')) return
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, onClose])

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={portal.name}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        boxSizing: 'border-box',
        width: 'var(--panel-width)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-20)',
        padding: 'var(--size-120) var(--size-80)',
        background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-none)',
        boxShadow: 'var(--shadow-16)',
        overflow: 'hidden',
        zIndex: 40,
        // Enters from off-screen, so it decelerates in over the drawer duration;
        // exits accelerate away over the shorter exit duration. Both read from
        // the motion tokens, which collapse to 1ms under prefers-reduced-motion.
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition: open
          ? 'transform var(--duration-gentle) var(--curve-decelerate-max),' +
            ' opacity var(--duration-faster) var(--curve-linear),' +
            ' visibility 0s'
          : 'transform var(--duration-faster) var(--curve-accelerate-max),' +
            ' opacity var(--duration-faster) var(--curve-linear),' +
            ' visibility 0s linear var(--duration-faster)',
      }}
      aria-hidden={open ? undefined : true}
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
      </div>
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
        {portal.pages.map((page) => (
          <FlyoutItem
            key={page.id}
            page={page}
            active={page.id === activePage}
            onClick={() => onSelect(page.id)}
          />
        ))}
      </div>
    </div>
  )
}

// The top bar, from Shell.dc.html: the wordmark, a search field that swaps to a
// white plate on focus, and a 32px persona. Resting chrome, so a hairline and
// no shadow — the stroke-instead-of-key-shadow rule.
const SEARCH_NARROW_BELOW = 1024

function Header({ wordmark }) {
  const searchWidth = useViewportWidth() < SEARCH_NARROW_BELOW ? 180 : 240
  const [avatarBg, avatarFg] = tint(USER_NAME)
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

      {/* The focus swap — white plate, blue border — is the [data-field] rule
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
        title={USER_NAME}
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

export function AppShell({ portalId, pageId, onPortal, onPage, title, children }) {
  const [flyoutId, setFlyoutId] = useState(null)
  // The panel is mounted from the first render, closed, so opening it is a plain
  // state flip with a from-state already in the DOM for the transition to run
  // against. Mounting on demand would need a frame to pass before flipping, and
  // requestAnimationFrame does not fire in a background or non-compositing tab —
  // the panel would open with no animation, or not appear to open at all.
  // `rendered` is the portal it draws; it outlives `flyoutId` so the contents do
  // not blank halfway through the slide out.
  const [rendered, setRendered] = useState(
    () => (getPortal(portalId).pages ? portalId : PORTALS.find((p) => p.pages).id),
  )

  const openPanel = (id) => {
    setRendered(id)
    setFlyoutId(id)
  }
  const closePanel = () => setFlyoutId(null)

  // Clicking a portal that owns pages opens its flyout without navigating;
  // a single-page portal opens its page directly.
  const handleRail = (id) => {
    const portal = getPortal(id)
    if (!portal.pages) {
      closePanel()
      onPortal(id)
      return
    }
    if (flyoutId === id) closePanel()
    else openPanel(id)
  }

  const panelPortal = rendered ? getPortal(rendered) : null

  // Shell.dc.html's wordmark is `brand + portal name`, because its always-open
  // pane-2 panel shows which page you are on. That panel is a popup here, so
  // the page is appended when it would otherwise be invisible.
  const portal = getPortal(portalId)
  const wordmark =
    title && title !== portal.name
      ? `${BRAND} ${portal.name} · ${title}`
      : `${BRAND} ${portal.name}`

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideRail active={portalId} onSelect={handleRail} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header wordmark={wordmark} />

        {/* The panel is a child of this row, so it can never cover the header. */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
          {panelPortal && (
            <PortalFlyout
              portal={panelPortal}
              open={flyoutId === rendered}
              activePage={rendered === portalId ? pageId : null}
              onClose={closePanel}
              onSelect={(id) => {
                if (rendered !== portalId) onPortal(rendered)
                onPage(id)
                closePanel()
              }}
            />
          )}
          <main style={{ flex: 1, minWidth: 0, minHeight: 0 }}>{children}</main>
        </div>
      </div>
    </div>
  )
}
