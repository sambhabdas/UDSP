import { Toast } from '../../ds/components/Overlay.jsx'
import { Directory } from './Directory.jsx'
import { ReasonsPanel } from './ReasonsPanel.jsx'
import { ContactForm } from './ContactForm.jsx'
import { DeleteDialog } from './DeleteDialog.jsx'
import { useAdminContacts } from './useAdminContacts.js'

// The station's phone directory as a driver needs it — a list of REASONS, each
// pointing at whoever answers. It grants nothing and gates nothing: a contact
// needs no invite and no seat, so an outside bookkeeper or a mechanic belongs
// here as readily as the owner.
export function AdminContactsPage() {
  const s = useAdminContacts()

  return (
    <div
      data-screen-label="Admin Contacts"
      onClick={s.closeOverlays}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-200) var(--size-200) var(--size-320) var(--size-200)',
        }}
      >
        <Directory s={s} />
        <ReasonsPanel s={s} />
      </div>

      {s.formOpen && <ContactForm s={s} />}
      <DeleteDialog s={s} />
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}
