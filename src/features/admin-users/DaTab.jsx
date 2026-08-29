import { Icon } from '../../ds/icons/Icon.jsx'
import { caption1, caption1Strong } from '../../ds/type.js'
import { DA_HEADS, DA_TONE, INVITE_STAMP, WHY } from './data.js'
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
} from './parts.jsx'
import { MONO, TONES } from './ui.js'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function DaTab({ s }) {
  const kpis = [
    { label: 'Active', value: String(s.daActiveN), color: 'var(--success-fg)' },
    { label: 'Invited', value: String(s.daInvitedN), color: s.daInvitedN ? 'var(--warning-fg)' : 'var(--text-primary)' },
    { label: 'Not invited', value: String(s.daNotN), color: s.daNotN ? 'var(--danger-fg)' : 'var(--text-primary)' },
  ]

  return (
    <>
      {/* Coverage is the point of this tab: a driver with no account cannot
          acknowledge coaching, so the gap is stated before the numbers. */}
      {s.daNotN > 0 && (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-100)',
            padding: 'var(--size-80) var(--size-120)',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-medium)',
            ...caption1,
            color: 'var(--danger-fg)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, textWrap: 'pretty' }}>
            {s.daNotN} DAs have no Ultimate DA account - they cannot acknowledge coaching
          </span>
          <div
            onClick={s.inviteAll}
            style={{
              boxSizing: 'border-box',
              height: 24,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-100)',
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-card)',
              border: '1px solid var(--danger-border)',
              ...caption1Strong,
              color: 'var(--danger-fg)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Invite all
          </div>
        </div>
      )}

      <KpiGrid items={kpis} />

      <TableCard>
        <Toolbar>
          <SearchField
            value={s.daQuery}
            onChange={(e) => s.setDaQuery(e.target.value)}
            placeholder="Search name or transporter ID"
          />
          <FilterButton applied={s.applied} onClick={s.openFilters} />
          <div style={{ flex: 1 }} />
          {s.daSel.length > 0 && <DaBulkBar s={s} />}
          <SmallButton icon={<Icon name="ArrowUpSize12ThemeRegular" size={12} />} onClick={() => s.openImport('da')}>
            Import
          </SmallButton>
          <SmallButton primary onClick={s.openDaInvite}>
            + Invite DA
          </SmallButton>
        </Toolbar>

        <TableScroll minWidth={900}>
          <HeadRow>
            {DA_HEADS.map((h) => (
              <HeadCell key={h.label} h={h} sort={s.daSort} onSort={() => s.daSortBy(h.k)} />
            ))}
          </HeadRow>

          {s.visibleDas.map((d, i) => (
            <DaRow key={d.id} d={d} s={s} flip={i >= s.visibleDas.length - 3 && s.visibleDas.length > 4} />
          ))}

          {s.visibleDas.length === 0 && <ZeroState text="No drivers match these filters" onClear={s.clearDaFilters} />}
        </TableScroll>
      </TableCard>
    </>
  )
}

function DaRow({ d, s, flip }) {
  const noPhone = !d.phone
  const tone = DA_TONE[d.state]

  return (
    <Row fg="var(--text-primary)">
      <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <CheckBox
          on={s.daSel.includes(d.id)}
          onClick={(e) => {
            e.stopPropagation()
            s.toggleDaSel(d.id)
          }}
        />
      </div>

      <div style={{ flex: 1.4, minWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'var(--weight-semibold)' }}>
        {d.name}
      </div>
      <div style={{ width: 120, flexShrink: 0, ...MONO, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {d.tid}
      </div>
      {/* No number is a fact you have to act on, not a blank. */}
      <div
        style={{
          width: 120,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          color: noPhone ? 'var(--warning-fg)' : 'var(--text-primary)',
        }}
      >
        {noPhone ? 'No number on file' : d.phone}
      </div>

      <div style={{ width: 104, flexShrink: 0, display: 'flex' }}>
        <StatusPill tone={tone}>{cap(d.state)}</StatusPill>
      </div>

      <div style={{ width: 90, flexShrink: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.invitedOn}</div>
      <div style={{ width: 90, flexShrink: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.lastSeen}</div>

      <RowMenu
        flip={flip}
        minWidth={190}
        open={s.menuFor === `da${d.id}`}
        onToggle={(e) => {
          e.stopPropagation()
          s.setOpenDrop(null)
          s.setMenuFor(s.menuFor === `da${d.id}` ? null : `da${d.id}`)
        }}
        items={daMenuItems(d, s)}
      />
    </Row>
  )
}

// Revoking takes the app account away and leaves the driver on the roster —
// this page never removes anyone from the roster.
function daMenuItems(d, s) {
  const noPhone = !d.phone
  const canResend = d.state !== 'active' && !noPhone
  return [
    canResend
      ? {
          label: 'Re-send invite',
          act: () => s.setDaState([d.id], { state: 'invited', invitedOn: INVITE_STAMP }, `Invite sent: ${d.name}`),
        }
      : { label: 'Re-send invite', why: d.state === 'active' ? WHY.daActive : WHY.noNumber },
    d.state === 'not invited'
      ? { label: 'Revoke access', why: WHY.noAccount }
      : {
          label: 'Revoke access',
          danger: true,
          act: () =>
            s.setDaState(
              [d.id],
              { state: 'not invited', invitedOn: '-', lastSeen: '-' },
              `Access revoked: ${d.name} · the driver stays on the roster`,
            ),
        },
    {
      label: 'Open profile',
      act: () => {
        s.setMenuFor(null)
        s.toast(`Open profile: ${d.name}`)
      },
    },
  ]
}

function DaBulkBar({ s }) {
  const picked = s.das.filter((d) => s.daSel.includes(d.id))
  const invitable = picked.filter((d) => d.state === 'not invited' && d.phone).map((d) => d.id)
  const noPhoneSel = picked.filter((d) => d.state === 'not invited' && !d.phone).length
  const resend = picked.filter((d) => d.state === 'invited').map((d) => d.id)
  const revokable = picked.filter((d) => d.state !== 'not invited').map((d) => d.id)

  return (
    <>
      {picked.length === 1 && (
        <ToneButton tone={TONES.blue} onClick={() => s.toast(`Open profile: ${picked[0].name}`)}>
          Open profile
        </ToneButton>
      )}
      {invitable.length > 0 && (
        <ToneButton
          tone={TONES.blue}
          onClick={() =>
            s.setDaState(
              invitable,
              { state: 'invited', invitedOn: INVITE_STAMP },
              `${invitable.length === 1 ? 'Invite' : `${invitable.length} invites`} sent by text${
                noPhoneSel ? ` · skipped ${noPhoneSel} with no number on file` : ''
              }`,
            )
          }
        >
          Invite {invitable.length}
        </ToneButton>
      )}
      {resend.length > 0 && (
        <ToneButton
          tone={TONES.warning}
          onClick={() => s.toast(`${resend.length === 1 ? 'Invite' : `${resend.length} invites`} re-sent by text`)}
        >
          Resend invite {resend.length}
        </ToneButton>
      )}
      {revokable.length > 0 && (
        <ToneButton
          tone={TONES.danger}
          onClick={() =>
            s.setDaState(
              revokable,
              { state: 'not invited', invitedOn: '-', lastSeen: '-' },
              `Access revoked · ${revokable.length} ${revokable.length === 1 ? 'driver stays' : 'drivers stay'} on the roster`,
            )
          }
        >
          Revoke access {revokable.length}
        </ToneButton>
      )}
    </>
  )
}
