import type { RosterEntry } from './data'
import type { SurveysState } from './useSurveys'
import { caption1, caption2 } from '../../ds/type'
import { ANON_WARNING, AUDIENCES, NOT_SENT_TWICE, NO_APP_NOTE, ROSTER, WHENS } from './data'
import { Button, CheckBox, FieldLabel, Helper, Modal, ModalHead, Rule, Seg } from './parts'

export function SendDialog({ s }: { s: SurveysState }) {
  const survey = s.sendSurvey
  if (!survey) return null
  const anon = survey.answers === 'anonymous'
  const n = s.summary.count

  return (
    <Modal title="Send a survey" onClose={() => s.setSendFor(null)}>
      <ModalHead big title="Send a survey" onClose={() => s.setSendFor(null)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: 'var(--size-160) var(--size-240)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          <Helper>Survey</Helper>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              padding: 'var(--size-100) var(--size-120)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-medium)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <FieldLabel>{survey.name}</FieldLabel>
              <Helper>
                {survey.qs} questions · {anon ? 'Anonymous answers' : 'Named answers'}
              </Helper>
            </div>
            {/* Anonymity is a promise, so it is stated on the survey itself. */}
            <span
              style={{
                boxSizing: 'border-box',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--size-80)',
                borderRadius: 'var(--radius-pill)',
                background: anon ? 'var(--warning-bg)' : 'var(--surface-subtle)',
                border: `1px solid ${anon ? 'var(--warning-border)' : 'var(--border-default)'}`,
                ...caption2,
                fontWeight: 'var(--weight-semibold)',
                color: anon ? 'var(--warning-fg)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {anon ? 'Anonymous' : 'Named'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <FieldLabel>Send it to</FieldLabel>
          <div style={{ display: 'flex', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            {AUDIENCES.map((a) => (
              <Seg key={a.id} label={a.label} on={s.audience === a.id} onPick={() => s.setAudience(a.id)} />
            ))}
          </div>
        </div>

        {s.audience === 'pick' && (
          <div
            style={{
              boxSizing: 'border-box',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 220,
              overflow: 'hidden auto',
            }}
          >
            {ROSTER.map((p) => (
              <PickerRow key={p.id} p={p} on={s.pickedSet.has(p.id)} onToggle={() => s.togglePicked(p)} />
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 'var(--size-120)' }}>
          <div
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-120)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-20)',
            }}
          >
            <FieldLabel>{s.summary.title}</FieldLabel>
            <Helper>{s.summary.sub}</Helper>
          </div>
          {/* Who cannot receive it, and why - stated before the send, not after. */}
          {s.summary.excluded > 0 && (
            <div
              style={{
                boxSizing: 'border-box',
                padding: 'var(--size-120)',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-medium)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--size-20)',
              }}
            >
              <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--danger-fg)' }}>
                {s.summary.excluded} {s.summary.excluded === 1 ? 'driver cannot receive it' : 'drivers cannot receive it'}
              </span>
              <Helper color="var(--danger-fg)">{NO_APP_NOTE}</Helper>
              <span
                onClick={() => s.toast('Invite them · Admin Portal → Users → Ultimate DA')}
                style={{ ...caption2, color: 'var(--text-link)', cursor: 'pointer' }}
              >
                Invite them →
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <FieldLabel>When</FieldLabel>
          <div style={{ display: 'flex', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            {WHENS.map((w) => (
              <Seg key={w} label={w} on={s.when === w} onPick={() => s.setWhen(w)} />
            ))}
          </div>
        </div>
      </div>

      <Rule />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-160) var(--size-240) var(--size-200) var(--size-240)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
          {anon && <Helper color="var(--warning-fg)">{ANON_WARNING}</Helper>}
          <Helper>{NOT_SENT_TWICE}</Helper>
        </div>
        <Button onClick={() => s.setSendFor(null)}>Cancel</Button>
        <Button primary onClick={s.commitSend}>
          Send to {n}{n === 1 ? ' driver' : ' drivers'}
        </Button>
      </div>
    </Modal>
  )
}

// A driver with no app account stays visible and unselectable - the gap is the
// point, so hiding them would hide the reason the count is short.
function PickerRow({ p, on, onToggle }: { p: RosterEntry; on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        minHeight: 36,
        padding: '0 var(--size-120)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: p.app ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
    >
      <CheckBox on={p.app && on} dim={!p.app} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...caption1,
          color: p.app ? 'var(--text-primary)' : 'var(--text-helper)',
        }}
      >
        {p.name}
      </span>
      <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{p.band}</span>
      {!p.app && (
        <span
          style={{
            boxSizing: 'border-box',
            height: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-60)',
            borderRadius: 'var(--radius-small)',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            ...caption2,
            color: 'var(--danger-fg)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          No app account
        </span>
      )}
    </div>
  )
}
