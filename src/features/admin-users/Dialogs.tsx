import type { MouseEvent } from 'react'
import type { Da, User } from './data'
import type { UsersState } from './useAdminUsers'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, caption2 } from '../../ds/type'
import { ASSIGNABLE_ROLES, IMPORT_FIELDS, IMPORT_FILE, REMOVE_BODY, SEAT_CAP } from './data'
import {
  Btn,
  CheckBox,
  Labelled,
  Modal,
  ModalFoot,
  ModalHead,
  SearchField,
  TextField,
} from './parts'
import { mono as MONO } from '../../ds/type'

// ---- invite / edit a portal user -----------------------------------------

export function UserForm({ s }: { s: UsersState }) {
  const editing = !!s.form.editId
  return (
    <Modal title={editing ? 'Edit user' : 'Invite user'} onClose={() => s.setFormOpen(false)}>
      <ModalHead title={editing ? 'Edit user' : 'Invite user'} onClose={() => s.setFormOpen(false)} />

      <Labelled label="Email">
        <TextField
          value={s.form.email}
          onChange={(e) => s.patchForm({ email: e.target.value })}
          placeholder="name@company.com"
        />
      </Labelled>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
        <Labelled label="Full name" flex={1} min={200}>
          <TextField value={s.form.name} onChange={(e) => s.patchForm({ name: e.target.value })} />
        </Labelled>
        <Labelled label="Mobile" width={160}>
          <TextField value={s.form.mobile} onChange={(e) => s.patchForm({ mobile: e.target.value })} placeholder="+1" />
        </Labelled>
      </div>

      {/* The owner's post is not editable here — it moves only by transfer. */}
      {!s.editingOwner && (
        <Labelled label="Role">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {ASSIGNABLE_ROLES.map((r) => (
              <RolePick key={r} label={r} on={s.form.role === r} onPick={() => s.patchForm({ role: r })} />
            ))}
          </div>
        </Labelled>
      )}

      {/* An invite holds a seat, so a full plan blocks the send — and says so
          rather than failing at the last click. */}
      {!editing && s.seatsLeft <= 0 && (
        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-80) var(--size-120)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-small)',
            ...caption1,
            color: 'var(--warning-fg)',
            textWrap: 'pretty',
          }}
        >
          All {SEAT_CAP} seats are taken. Add seats on Billing & Subscription, or deactivate someone first.
        </div>
      )}

      <ModalFoot>
        <Btn onClick={() => s.setFormOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.canSubmitForm} onClick={s.submitForm}>
          {editing ? 'Save' : 'Send invite'}
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

function RolePick({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

// ---- remove a portal user -------------------------------------------------

export function RemoveDialog({ s }: { s: UsersState }) {
  const u = s.users.find((x) => x.id === s.removeId)
  if (!u) return null
  return (
    <Modal title={`Remove ${u.name}?`} width={440} onClose={() => s.setRemoveId(null)}>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Remove {u.name}?</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{REMOVE_BODY}</span>
      <ModalFoot>
        <Btn onClick={() => s.setRemoveId(null)}>Cancel</Btn>
        <Btn tone="danger" onClick={s.removeUser}>
          Remove user
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// ---- transfer ownership ---------------------------------------------------

export function TransferDialog({ s }: { s: UsersState }) {
  return (
    <Modal title="Transfer ownership" onClose={() => s.setTransferOpen(false)}>
      <ModalHead title="Transfer ownership" onClose={() => s.setTransferOpen(false)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          <span style={{ ...caption2, color: 'var(--text-helper)' }}>New owner</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
            {s.transferTargets.map((t) => (
              <TargetRow
                key={t.id}
                t={t}
                on={s.transferTarget === t.id}
                onPick={() => s.setTransferTarget(t.id)}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-80) var(--size-120)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-small)',
            ...caption1,
            color: 'var(--warning-fg)',
            textWrap: 'pretty',
          }}
        >
          {s.transferPick
            ? `${s.transferPick.name} becomes the owner. You become a Sub Admin. This cannot be undone from your side.`
            : 'Pick the new owner. Only active users can take ownership.'}
        </div>

        {/* Typing the exact address is the confirmation — there is no undo. */}
        <div
          data-field=""
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-80) var(--size-120)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          <span style={{ ...caption2, color: 'var(--text-helper)' }}>Type the new owner&apos;s email to confirm</span>
          <input
            value={s.transferEmail}
            onChange={(e) => s.setTransferEmail(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-family)',
              ...body1,
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
        </div>
      </div>

      <ModalFoot>
        <Btn onClick={() => s.setTransferOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.transferReady} onClick={s.commitTransfer}>
          Transfer
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

function TargetRow({ t, on, onPick }: { t: User; on: boolean; onPick: () => void }) {
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        padding: 'var(--size-80) var(--size-120)',
        background: on ? 'var(--blue-50)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 14,
          height: 14,
          borderRadius: 'var(--radius-circle)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {on && <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--primary)' }} />}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          ...(on ? caption1Strong : caption1),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {t.name}
      </span>
      <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{t.email}</span>
    </div>
  )
}

// ---- invite DAs -----------------------------------------------------------

export function DaInviteDialog({ s }: { s: UsersState }) {
  const n = s.daInviteSel.length
  return (
    <Modal title="Invite DA" onClose={() => s.setDaInviteOpen(false)}>
      <ModalHead title="Invite DA" onClose={() => s.setDaInviteOpen(false)} />

      <SearchField
        width="100%"
        value={s.daInviteQ}
        onChange={(e) => s.setDaInviteQ(e.target.value)}
        placeholder="Search name or transporter ID"
      />

      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-medium)',
          overflow: 'hidden auto',
          maxHeight: 240,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {s.daInviteCandidates.map((d) => (
          <CandidateRow key={d.id} d={d} on={s.daInviteSel.includes(d.id)} onToggle={() => s.toggleDaInvite(d)} />
        ))}
        {s.daInviteCandidates.length === 0 && (
          <div style={{ padding: 'var(--size-160)', ...caption1, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {s.daInviteQ ? 'No match' : 'Everyone on the roster already has an account'}
          </div>
        )}
      </div>

      <ModalFoot>
        <Btn onClick={() => s.setDaInviteOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={n === 0} onClick={s.commitDaInvite}>
          {n > 1 ? `Send ${n} invites` : 'Send invite'}
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// The invite goes by text, so a driver with no number cannot be picked — the
// row stays visible and says why rather than disappearing.
function CandidateRow({ d, on, onToggle }: { d: Da; on: boolean; onToggle: () => void }) {
  const noPhone = !d.phone
  return (
    <div
      onClick={onToggle}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--size-120)',
        borderBottom: '1px solid var(--border-subtle)',
        background: on ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        cursor: noPhone ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
    >
      <CheckBox on={on} dim={noPhone} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'var(--weight-semibold)',
          color: noPhone ? 'var(--text-disabled)' : 'var(--text-primary)',
        }}
      >
        {d.name}
      </span>
      <span style={{ ...MONO, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.tid}</span>
      <span
        style={{
          width: 130,
          flexShrink: 0,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          color: noPhone ? 'var(--warning-fg)' : 'var(--text-secondary)',
        }}
      >
        {noPhone ? 'No number on file' : d.phone}
      </span>
    </div>
  )
}

// ---- import ---------------------------------------------------------------

export function ImportDialog({ s }: { s: UsersState }) {
  const title = s.importFor === 'da' ? 'Import DAs' : 'Import users'
  return (
    <Modal title={title} onClose={() => s.setImportOpen(false)}>
      <ModalHead title={title} onClose={() => s.setImportOpen(false)} />

      {!s.importFile ? (
        <DropZone onPick={() => s.setImportFile(IMPORT_FILE[s.importFor])} />
      ) : (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-100)',
            padding: 'var(--size-80) var(--size-120)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)',
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...MONO,
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            {s.importFile}
          </span>
          <ClearFile onClick={() => s.setImportFile('')} />
        </div>
      )}

      <Labelled label="Columns">
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
          {IMPORT_FIELDS[s.importFor].map((f) => (
            <span
              key={f}
              style={{
                boxSizing: 'border-box',
                height: 24,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-small)',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-subtle)',
                ...MONO,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </Labelled>

      <ModalFoot>
        <Btn onClick={() => s.setImportOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.importFile} onClick={s.commitImport}>
          Import
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

function DropZone({ onPick }: { onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        minHeight: 88,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-40)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-card)' : 'var(--surface-subtle)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="ArrowUpSize16ThemeRegular" size={16} />
      </span>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Drop a CSV here, or browse</span>
    </div>
  )
}

function ClearFile({ onClick }: { onClick: (e: MouseEvent<HTMLSpanElement>) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      aria-label="Clear file"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="DismissSize16ThemeRegular" size={16} />
    </span>
  )
}
