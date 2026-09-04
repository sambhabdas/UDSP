import type { ContactsState } from './useAdminContacts'
import { Dialog } from '../../ds/components/Overlay'
import { Button } from '../../ds/components/Button'
import { body1 } from '../../ds/type'

// Deleting a contact is only safe if somebody else still answers what they
// answered - so the confirm names the reasons that go dark, or says none do.
export function DeleteDialog({ s }: { s: ContactsState }) {
  const c = s.contacts.find((x) => x.id === s.delFor)
  if (!c) return null

  const goesDark = c.reasons
    .filter((rid) => {
      const r = s.reasons.find((x) => x.id === rid)
      if (!r || r.retired) return false
      return s.contacts.filter((o) => o.id !== c.id && o.shown && o.reasons.includes(rid)).length === 0
    })
    .map(s.nameOf)

  const body = goesDark.length
    ? `${goesDark.join(' · ')} ${goesDark.length === 1 ? 'goes' : 'go'} dark on the Help screen - no other visible contact covers ${goesDark.length === 1 ? 'it.' : 'them.'}`
    : 'No reason goes dark - every topic keeps another visible contact.'

  return (
    <Dialog title={`Delete ${c.who}?`} onClose={() => s.setDelFor(null)}>
      <span style={{ ...body1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{body}</span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--size-80)', marginTop: 'var(--size-80)' }}>
        <Button onClick={() => s.setDelFor(null)}>Cancel</Button>
        <Button
          tone="danger"
          onClick={() => {
            s.setContacts((cs) => cs.filter((v) => v.id !== c.id))
            s.setDelFor(null)
            s.toast(`Deleted: ${c.who}`)
          }}
        >
          Delete contact
        </Button>
      </div>
    </Dialog>
  )
}
