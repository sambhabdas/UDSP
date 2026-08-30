'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { fmt, whereOf } from './calc'
import { ME, NOW, PEOPLE_POOL, VANS } from './data'
import { SearchField } from './parts'
import type { DispatchState } from './useDispatch'

/**
 * The anchored popups the boards open — one component, because they all behave
 * the same way: positioned at the control, dismissed by the page's own click.
 */
export function Menus({ s }: { s: DispatchState }) {
  const m = s.menu
  if (!m) return null

  const items = buildItems(s, m.kind, m.extra)
  if (!items) return null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      role="menu"
      style={{
        position: 'fixed',
        left: m.x,
        ...(m.up ? { bottom: m.y } : { top: m.y }),
        zIndex: 90,
        boxSizing: 'border-box',
        minWidth: 220,
        maxWidth: 320,
        maxHeight: 320,
        overflow: 'hidden auto',
        padding: 'var(--size-40)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {items.search && (
        <div style={{ padding: 'var(--size-40)' }}>
          <SearchField value={s.menuQ} onChange={s.setMenuQ} placeholder={items.search} width="100%" />
        </div>
      )}
      {items.rows.length === 0 && (
        <span style={{ padding: 'var(--size-80)', ...caption1, color: 'var(--text-secondary)' }}>No match</span>
      )}
      {items.rows.map((it, i) =>
        it.divider ? (
          <div key={i} style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--size-40) 0' }} />
        ) : (
          <MenuRow key={i} item={it} onPick={() => { it.act?.(); if (!it.keepOpen) s.closeMenu() }} />
        ),
      )}
    </div>
  )
}

interface Item {
  label?: string
  hint?: string
  danger?: boolean
  on?: boolean
  divider?: boolean
  keepOpen?: boolean
  act?: () => void
}

function buildItems(
  s: DispatchState,
  kind: string,
  extra?: string | number | null,
): { rows: Item[]; search?: string } | null {
  const q = s.menuQ.trim().toLowerCase()
  const row = typeof extra === 'string' ? s.day.rows.find((r) => r.id === extra) : undefined

  if (kind === 'group') {
    return {
      rows: [
        { label: 'Service Type', on: s.group === 'type', act: () => s.setGroup('type') },
        { label: 'Wave', on: s.group === 'wave', act: () => s.setGroup('wave') },
      ],
    }
  }

  if (kind === 'cols') {
    const t = (k: 'staging' | 'sched' | 'punch') => () => s.setCols({ ...s.cols, [k]: !s.cols[k] })
    return {
      rows: [
        { label: 'Staging', on: s.cols.staging, act: t('staging'), keepOpen: true },
        { label: 'Scheduled', on: s.cols.sched, act: t('sched'), keepOpen: true },
        { label: 'Punched In', on: s.cols.punch, act: t('punch'), keepOpen: true },
      ],
    }
  }

  if (kind === 'export') {
    return {
      rows: ['CSV', 'XLSX'].map((x) => ({
        label: `Roster · ${x}`,
        act: () => s.toastMsg(`Export started · roster (${x})`),
      })),
    }
  }

  if (kind === 'import') {
    return {
      rows: [
        { label: 'Roster file', act: () => s.toastMsg('Roster import · matches on transporter ID') },
        { label: 'Staging file', act: () => s.toastMsg('Staging import · fills the staging column') },
      ],
    }
  }

  if (kind === 'van' && row) {
    const held = new Set(s.day.rows.filter((r) => r.id !== row.id).map((r) => r.van).filter(Boolean))
    const list = VANS.filter((v) => !q || v.id.toLowerCase().includes(q))
    return {
      search: 'Search vans',
      rows: [
        ...(row.van
          ? [{ label: 'Clear the van', danger: true, act: () => assignVan(s, row.id, '') }, { divider: true }]
          : []),
        ...list.map((v) => ({
          label: v.id,
          // A van that is out of service or already held says so rather than
          // being hidden — dispatch may still need to know it exists.
          hint:
            v.status !== 'In service'
              ? v.status
              : held.has(v.id)
                ? 'already on another row'
                : `${v.type} · ${v.rank}`,
          on: row.van === v.id,
          act: () => {
            if (v.status !== 'In service') {
              s.toastMsg(`${v.id} is ${v.status} in Fleet`)
              return
            }
            assignVan(s, row.id, v.id)
          },
        })),
      ],
    }
  }

  if (kind === 'emp' && row) {
    const pool = [
      ...s.day.sb.map((b) => ({ name: b.emp, tr: b.tr })),
      ...s.day.oc.map((o) => ({ name: o.emp, tr: o.tr })),
      ...PEOPLE_POOL.map((p) => ({ name: p.emp, tr: p.tr })),
    ].filter((p) => !q || p.name.toLowerCase().includes(q))
    return {
      search: 'Search people',
      rows: [
        ...(row.emp
          ? [
              {
                label: 'Empty the seat',
                danger: true,
                act: () =>
                  s.act(`${row.emp} taken off ${row.route}`, {
                    rows: s.day.rows.map((r) =>
                      r.id === row.id ? { ...r, emp: '', tr: '', noDriver: true } : r,
                    ),
                  }),
              },
              { divider: true },
            ]
          : []),
        ...pool.map((p) => {
          const w = whereOf(s.day, p.name)
          return {
            label: p.name,
            hint: w.hint,
            act: () =>
              s.act(`${p.name} seated on ${row.route}`, {
                rows: s.day.rows.map((r) =>
                  r.id === row.id ? { ...r, emp: p.name, tr: p.tr, noDriver: false } : r,
                ),
              }),
          }
        }),
      ],
    }
  }

  if (kind === 'row' && row) {
    return {
      rows: [
        { label: 'Swap the driver', act: () => s.openDlg('p4', { seat: row.id }) },
        { label: 'Set the wave', act: () => s.openDlg('p9', { ids: [row.id] }) },
        { label: 'Send Dispatch Info', act: () => s.openDlg('p5', { ids: [row.id] }) },
        { divider: true },
        {
          label: s.dismissed[row.id] ? 'Show issues again' : 'Dismiss the issues on this row',
          act: () => {
            if (s.dismissed[row.id]) {
              const next = { ...s.dismissed }
              delete next[row.id]
              s.setDismissed(next)
              return
            }
            s.setDismissed({
              ...s.dismissed,
              [row.id]: { who: ME, when: fmt(NOW), label: 'issues dismissed' },
            })
            s.toastMsg('Issues hidden on this row — the marker stays, with who hid them')
          },
        },
        {
          label: 'Remove the row',
          danger: true,
          act: () =>
            s.act(`Row removed · ${row.route || 'no route'}`, {
              rows: s.day.rows.filter((r) => r.id !== row.id),
            }),
        },
      ],
    }
  }

  return null
}

function assignVan(s: DispatchState, id: string, van: string) {
  const row = s.day.rows.find((r) => r.id === id)
  s.act(van ? `${van} on ${row?.route ?? 'the row'}` : 'Van cleared', {
    rows: s.day.rows.map((r) => (r.id === id ? { ...r, van } : r)),
  })
}

function MenuRow({ item, onPick }: { item: Item; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        minHeight: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: item.on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        fontWeight: item.on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: item.danger ? 'var(--danger-fg)' : 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </span>
      {item.hint && (
        <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {item.hint}
        </span>
      )}
    </div>
  )
}

/**
 * After a call, the only question worth asking is what happened — the answer is
 * what the wave box shows next time somebody looks at who is missing.
 */
export function HangUpPrompt({ s }: { s: DispatchState }) {
  const h = s.hang!
  const outcomes = ['reached', 'no answer', 'voicemail', 'coming in', 'not coming']
  return (
    <div
      onClick={() => s.setHang(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        zIndex: 75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-160)',
      }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Log the call"
        style={{
          boxSizing: 'border-box',
          width: 420,
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-120)',
          padding: 'var(--size-240)',
        }}
      >
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>
          Called {h.name.split(',')[0]} — what happened?
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          {outcomes.map((o) => (
            <MenuRow
              key={o}
              item={{ label: o }}
              onPick={() => {
                if (h.list === 'r') {
                  s.setDay({
                    rows: s.day.rows.map((r) =>
                      r.id === h.id ? { ...r, lastCall: { txt: `${fmt(NOW)} - ${o}`, who: ME, when: fmt(NOW) } } : r,
                    ),
                  })
                }
                s.setHang(null)
                s.toastMsg(`Logged · ${h.name.split(',')[0]} · ${o}`)
              }}
            />
          ))}
        </div>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
          The outcome shows on the wave box, so the next person to chase knows what already happened.
        </span>
      </div>
    </div>
  )
}
