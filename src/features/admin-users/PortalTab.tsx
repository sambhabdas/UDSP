import type { User } from './data'
import type { MenuItemSpec } from './parts'
import type { UsersState } from './useAdminUsers'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import { ASSIGNABLE_ROLES, SEAT_CAP, STATUS_TONE, USER_HEADS, WHY } from './data'
import {
  CheckBox,
  FilterButton,
  HeadCell,
  HeadRow,
  KpiGrid,
  Row,
  RowMenu,
  SearchField,
  SmallButton,
  StatusPill,
  TableCard,
  TableScroll,
  ToneButton,
  Toolbar,
  ZeroState,
} from './parts'
import { TONES } from './ui'

export function PortalTab({ s }: { s: UsersState }) {
  const kpis = [
    { label: 'Active', value: String(s.activeN), color: 'var(--success-fg)' },
    { label: 'Invited', value: String(s.invitedN), color: s.invitedN ? 'var(--warning-fg)' : 'var(--text-secondary)' },
    { label: 'Deactivated', value: String(s.deactN), color: 'var(--text-secondary)' },
    {
      label: 'Seats used',
      value: `${s.seatsUsed} / ${SEAT_CAP}`,
      color: s.seatsUsed >= SEAT_CAP ? 'var(--warning-fg)' : 'var(--blue-700)',
    },
  ]

  return (
    <>
      <KpiGrid items={kpis} />

      <TableCard>
        <Toolbar>
          <SearchField
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            placeholder="Search name or email"
          />
          <FilterButton applied={s.applied} onClick={s.openFilters} />
          <div style={{ flex: 1 }} />
          {s.sel.length > 0 && <BulkBar s={s} />}
          <SmallButton icon={<Icon name="ArrowUpSize12ThemeRegular" size={12} />} onClick={() => s.openImport('portal')}>
            Import
          </SmallButton>
          <SmallButton primary onClick={s.openInvite}>
            + Invite user
          </SmallButton>
        </Toolbar>

        <TableScroll minWidth={960}>
          <HeadRow>
            {USER_HEADS.map((h) => (
              <HeadCell key={h.label} h={h} sort={s.sort} onSort={() => h.k && s.sortBy(h.k)} />
            ))}
          </HeadRow>

          {s.visibleUsers.map((u, i) => (
            <UserRow key={u.id} u={u} s={s} flip={i >= s.visibleUsers.length - 3 && s.visibleUsers.length > 4} />
          ))}

          {s.visibleUsers.length === 0 && (
            <ZeroState text="No users match these filters" onClear={s.clearPortalFilters} />
          )}
        </TableScroll>
      </TableCard>
    </>
  )
}

function UserRow({ u, s, flip }: { u: User; s: UsersState; flip: boolean }) {
  const isOwner = u.role === 'Owner'
  const off = u.status === 'Deactivated'
  const fg = off ? 'var(--text-disabled)' : 'var(--text-primary)'
  const subFg = off ? 'var(--text-disabled)' : 'var(--text-secondary)'
  const tone = STATUS_TONE[u.status]

  return (
    <Row fg={fg}>
      <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {/* The owner is never bulk-selectable — nothing bulk applies to it. */}
        {!isOwner && (
          <CheckBox
            on={s.sel.includes(u.id)}
            onClick={(e) => {
              e.stopPropagation()
              s.toggleSel(u.id)
            }}
          />
        )}
      </div>

      <NameCell name={u.name} onOpen={() => s.openEdit(u)} />

      <div style={{ width: 110, flexShrink: 0, color: subFg, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {u.mobile}
      </div>
      <div style={{ flex: 1.6, minWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: subFg }}>
        {u.email}
      </div>

      <div style={{ width: 120, flexShrink: 0, display: 'flex' }}>
        {isOwner ? (
          <span
            style={{
              boxSizing: 'border-box',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--blue-100)',
              border: '1px solid var(--blue-200)',
              ...caption1Strong,
              color: 'var(--blue-700)',
              whiteSpace: 'nowrap',
            }}
          >
            Owner
          </span>
        ) : (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.role}</span>
        )}
      </div>

      <div style={{ width: 116, flexShrink: 0, color: subFg, whiteSpace: 'nowrap' }}>{u.lastActive}</div>

      <div style={{ width: 104, flexShrink: 0, display: 'flex' }}>
        <StatusPill tone={tone}>{u.status}</StatusPill>
      </div>

      <RowMenu
        flip={flip}
        open={s.menuFor === u.id}
        onToggle={(e) => {
          e.stopPropagation()
          s.setOpenDrop(null)
          s.setMenuFor(s.menuFor === u.id ? null : u.id)
        }}
        items={menuItems(u, s)}
      />
    </Row>
  )
}

// The owner row is protected: everything that would reduce it is dark, and the
// only way out is Transfer ownership. Everyone else can be deactivated, but
// only an account with no history — an invite never accepted — can be removed.
function menuItems(u: User, s: UsersState): MenuItemSpec[] {
  if (u.role === 'Owner') {
    return [
      { label: 'Edit user', act: () => s.openEdit(u) },
      { label: 'Change role', why: WHY.ownerLocked },
      { label: 'Deactivate', why: WHY.ownerLocked },
      { label: 'Remove user', why: WHY.ownerLocked },
      { label: 'Transfer ownership', act: s.openTransfer },
    ]
  }
  const zeroHistory = u.status === 'Invited'
  return [
    { label: 'Edit user', act: () => s.openEdit(u) },
    { label: 'Change role', act: () => s.openEdit(u) },
    u.status === 'Invited'
      ? { label: 'Resend invite', act: () => { s.setMenuFor(null); s.toast(`Invite re-sent: ${u.email}`) } }
      : { label: 'Resend invite', why: WHY.noInviteToResend },
    u.status === 'Deactivated'
      ? { label: 'Reactivate', act: () => s.setStatus([u.id], 'Active', `Reactivated: ${u.name}`) }
      : { label: 'Deactivate', act: () => s.setStatus([u.id], 'Deactivated', `Deactivated: ${u.name}`) },
    zeroHistory
      ? { label: 'Remove user', danger: true, act: () => { s.setRemoveId(u.id); s.setMenuFor(null) } }
      : { label: 'Remove user', why: WHY.hasHistory },
  ]
}

function NameCell({ name, onOpen }: { name: string; onOpen: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onOpen}
      style={{
        flex: 1.4,
        minWidth: 120,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: 'var(--weight-semibold)',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
      }}
      {...hoverProps}
    >
      {name}
    </div>
  )
}

function BulkBar({ s }: { s: UsersState }) {
  const picked = s.users.filter((u) => s.sel.includes(u.id))
  const act = picked.filter((u) => u.status === 'Active').map((u) => u.id)
  const deact = picked.filter((u) => u.status === 'Deactivated').map((u) => u.id)
  const inv = picked.filter((u) => u.status === 'Invited').map((u) => u.id)
  const n = (k: number) => (k === 1 ? ' user' : ' users')

  return (
    <>
      {picked.length === 1 && (
        <ToneButton tone={TONES.blue} onClick={() => s.openEdit(picked[0])}>
          Edit user
        </ToneButton>
      )}
      {act.length > 0 && (
        <ToneButton
          tone={TONES.danger}
          onClick={() => s.setStatus(act, 'Deactivated', `Deactivated ${act.length}${n(act.length)}`)}
        >
          Deactivate {act.length}
        </ToneButton>
      )}
      {deact.length > 0 && (
        <ToneButton
          tone={TONES.success}
          onClick={() => s.setStatus(deact, 'Active', `Reactivated ${deact.length}${n(deact.length)}`)}
        >
          Reactivate {deact.length}
        </ToneButton>
      )}
      {inv.length > 0 && (
        <ToneButton
          tone={TONES.warning}
          onClick={() => s.toast(`${inv.length === 1 ? 'Invite' : `${inv.length} invites`} re-sent`)}
        >
          Resend invite {inv.length}
        </ToneButton>
      )}
      <BulkRole s={s} />
    </>
  )
}

function BulkRole({ s }: { s: UsersState }) {
  const open = s.openDrop === 'bulkRole'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <ToneButton
        tone={TONES.blue}
        onClick={(e) => {
          e.stopPropagation()
          s.setMenuFor(null)
          s.setOpenDrop(open ? null : 'bulkRole')
        }}
        trailing={
          <span style={{ display: 'flex' }}>
            <Icon name="SvChevron" size={12} />
          </span>
        }
      >
        Change role {s.sel.length}
      </ToneButton>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 31,
            right: 0,
            boxSizing: 'border-box',
            width: 150,
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <RoleRow key={r} label={r} onPick={() => s.setRole(s.sel, r)} />
          ))}
        </div>
      )}
    </span>
  )
}

function RoleRow({ label, onPick }: { label: string; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}
