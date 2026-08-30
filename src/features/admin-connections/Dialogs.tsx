import type { AddLineForm, ConnectionsState } from './useConnections'
import type { PickerState } from './NumberPicker'
import { caption1 } from '../../ds/type'
import { ASSIGN_KINDS, DELETE_BODY, INFO, RELEASE_BODY, SYNC_WINDOWS, USER_POOL } from './data'
import { NumberPicker } from './NumberPicker'
import {
  Btn,
  ChipRow,
  Field,
  Labelled,
  Modal,
  ModalFoot,
  ModalHead,
  OptionRow,
  Select,
  SmallButton,
  TestResult,
} from './parts'

// ---- add a line -----------------------------------------------------------

export function AddLineDialog({ s }: { s: ConnectionsState }) {
  // The picker speaks its own field names; the add-line form spells the number
  // search `numQuery`, so the two are translated at the boundary.
  const state: PickerState = {
    number: s.al.number,
    query: s.al.numQuery,
    area: s.al.area,
    areaQuery: s.al.areaQuery,
  }
  const patch = (p: Partial<PickerState>) => {
    const out: Partial<AddLineForm> = {}
    if ('number' in p) out.number = p.number
    if ('query' in p) out.numQuery = p.query
    if ('area' in p) out.area = p.area
    if ('areaQuery' in p) out.areaQuery = p.areaQuery
    s.patchAl(out)
  }

  return (
    <Modal title="Add a line" onClose={() => s.setAddOpen(false)}>
      <ModalHead title="Add a line" onClose={() => s.setAddOpen(false)} />

      <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
        <Labelled label="Line name" flex={1} min={200}>
          <Field value={s.al.name} onChange={(e) => s.patchAl({ name: e.target.value })} placeholder="DBO1-Night" />
        </Labelled>
        <Labelled label="Choose phone number" flex={1} min={240}>
          <NumberPicker
            pool={s.addPool}
            state={state}
            patch={patch}
            openKey="al"
            openDrop={s.openDrop}
            setOpenDrop={s.setOpenDrop}
            reservedNumbers={s.reservedNumbers}
            filterNumbers={s.filterNumbers}
            areaOptions={s.areaOptions}
          />
        </Labelled>
      </div>

      <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Labelled label="Assigned to" flex={1} min={200}>
          <ChipRow options={ASSIGN_KINDS} value={s.al.assign} onPick={(v) => s.patchAl({ assign: v })} />
        </Labelled>
        {/* Only asked for once the answer matters. */}
        {s.al.assign === 'User' && (
          <Labelled label="User" flex={1} min={200}>
            <Select
              width={200}
              muted={!s.al.user}
              label={s.al.user || 'Pick a user'}
              open={s.openDrop === 'al-user'}
              onToggle={(e) => {
                e.stopPropagation()
                s.setOpenDrop(s.openDrop === 'al-user' ? null : 'al-user')
              }}
            >
              {USER_POOL.map((p) => (
                <OptionRow
                  key={p[0]}
                  on={s.al.user === p[0]}
                  onPick={() => {
                    s.patchAl({ user: p[0] })
                    s.setOpenDrop(null)
                  }}
                >
                  {p[0]}
                </OptionRow>
              ))}
            </Select>
          </Labelled>
        )}
      </div>

      <ModalFoot>
        <Btn onClick={() => s.setAddOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.addReady} onClick={s.commitAddLine}>
          Connect line
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// ---- connect a mailbox ----------------------------------------------------

export function MailConnectDialog({ s }: { s: ConnectionsState }) {
  const m = s.mailForm
  const title = `Connect ${m.provider}`

  return (
    <Modal title={title} onClose={() => s.setMailOpen(false)}>
      <ModalHead title={title} onClose={() => s.setMailOpen(false)} />

      {s.mailIsOauth ? (
        <Labelled label="Mailbox address">
          <Field value={m.email} onChange={(e) => s.patchMail({ email: e.target.value })} placeholder="dispatch@company.com" />
        </Labelled>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
            <Labelled label="Host" flex={1} min={200}>
              <Field value={m.host} onChange={(e) => s.patchMail({ host: e.target.value })} placeholder="imap.company.com" />
            </Labelled>
            <Labelled label="Port" width={100}>
              <Field
                inputMode="numeric"
                value={m.port}
                onChange={(e) => s.patchMail({ port: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="993"
              />
            </Labelled>
          </div>
          <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
            <Labelled label="Username" flex={1} min={200}>
              <Field value={m.user} onChange={(e) => s.patchMail({ user: e.target.value })} placeholder="dispatch@company.com" />
            </Labelled>
            <Labelled label="App password" flex={1} min={160}>
              <Field type="password" value={m.pass} onChange={(e) => s.patchMail({ pass: e.target.value })} />
            </Labelled>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
        <Labelled label="Sender name" info={INFO.senderName} flex={1} min={200}>
          <Field value={m.name} onChange={(e) => s.patchMail({ name: e.target.value })} placeholder="Cedar Ridge dispatch" />
        </Labelled>
        <Labelled label="Sync history" info={INFO.syncHistory} flex={1} min={220}>
          <ChipRow options={SYNC_WINDOWS} value={m.sync} onPick={(v) => s.patchMail({ sync: v })} />
        </Labelled>
      </div>

      <ModalFoot
        lead={
          <>
            <SmallButton onClick={s.testMail}>Test connection</SmallButton>
            {s.mailTest && <TestResult>{s.mailTest}</TestResult>}
          </>
        }
      >
        <Btn onClick={() => s.setMailOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.mailReady} onClick={s.commitMail}>
          Connect
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// ---- delete a line --------------------------------------------------------

export function DeleteLineDialog({ s }: { s: ConnectionsState }) {
  const l = s.lines.find((x) => x.id === s.deleteFor)
  if (!l) return null
  const ready = s.delText.trim() === l.name

  return (
    <Modal title={`Delete ${l.name}?`} width={440} onClose={() => s.setDeleteFor(null)}>
      <ModalHead title={`Delete ${l.name}?`} onClose={() => s.setDeleteFor(null)} />
      <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{DELETE_BODY}</span>

      <Labelled label="Type the line name to confirm">
        <Field value={s.delText} onChange={(e) => s.setDelText(e.target.value)} placeholder={l.name} />
      </Labelled>

      {/* The way out that keeps the number: releasing it is irreversible, so
          the alternative sits next to the irreversible button. */}
      <ModalFoot lead={<SmallButton onClick={s.moveToReserved}>Move to reserved</SmallButton>}>
        <Btn onClick={() => s.setDeleteFor(null)}>Cancel</Btn>
        <Btn tone="danger" disabled={!ready} onClick={s.deleteLine}>
          Delete line
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// ---- reserve a number -----------------------------------------------------

export function ReserveDialog({ s }: { s: ConnectionsState }) {
  return (
    <Modal title="Reserve a number" onClose={() => s.setReserveOpen(false)}>
      <ModalHead title="Reserve a number" onClose={() => s.setReserveOpen(false)} />
      <Labelled label="Choose phone number">
        <NumberPicker
          pool={s.freePool}
          state={s.rv}
          patch={(p) => s.setRv((v) => ({ ...v, ...p }))}
          reservedNumbers={s.reservedNumbers}
          openKey="rv"
          openDrop={s.openDrop}
          setOpenDrop={s.setOpenDrop}
          filterNumbers={s.filterNumbers}
          areaOptions={s.areaOptions}
        />
      </Labelled>
      <ModalFoot>
        <Btn onClick={() => s.setReserveOpen(false)}>Cancel</Btn>
        <Btn tone="primary" disabled={!s.rv.number} onClick={s.commitReserve}>
          Reserve
        </Btn>
      </ModalFoot>
    </Modal>
  )
}

// ---- release a reserved number --------------------------------------------

export function ReleaseDialog({ s }: { s: ConnectionsState }) {
  return (
    <Modal title={`Release ${s.releaseFor}?`} width={440} onClose={() => s.setReleaseFor(null)}>
      <ModalHead title={`Release ${s.releaseFor}?`} onClose={() => s.setReleaseFor(null)} />
      <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{RELEASE_BODY}</span>
      <ModalFoot>
        <Btn onClick={() => s.setReleaseFor(null)}>Cancel</Btn>
        <Btn tone="danger" onClick={s.commitRelease}>
          Release number
        </Btn>
      </ModalFoot>
    </Modal>
  )
}
