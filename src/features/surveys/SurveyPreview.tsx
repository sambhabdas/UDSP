import type { MakerState, Question } from './useSurveyMaker'
import { caption1, caption2 } from '../../ds/type'
import { ATTRIBUTION_NOTE, TRIGGER_CONTEXT } from './data'
import { FieldLabel, Helper, Modal, ModalHead, Rule } from './parts'

// The driver's side of the survey, answerable so the station can feel the
// length before shipping it. The caption restates the attribution promise in
// the driver's own words.
export function SurveyPreview({ m }: { m: MakerState }) {
  return (
    <Modal title="Preview" width={400} onClose={() => m.setPreviewOpen(false)}>
      <ModalHead title="Preview" onClose={() => m.setPreviewOpen(false)} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: 'var(--size-200)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FieldLabel>{m.name || 'Untitled survey'}</FieldLabel>
          <Helper>{TRIGGER_CONTEXT[m.trigger]}</Helper>
        </div>

        {m.questions.map((q, i) => (
          <PreviewQuestion key={i} q={q} i={i} m={m} />
        ))}

        {m.questions.length === 0 && (
          <span style={{ ...caption1, color: 'var(--text-helper)' }}>No questions yet. Add one first.</span>
        )}
      </div>

      <Rule />

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', padding: 'var(--size-160) var(--size-200)' }}>
        <div
          style={{
            boxSizing: 'border-box',
            height: 'var(--control-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--primary)',
            color: 'var(--text-inverse)',
            ...caption1,
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          Submit
        </div>
        <span style={{ ...caption2, color: 'var(--text-helper)', textAlign: 'center' }}>
          {m.attribution === 'Named'
            ? 'Named: this answer will carry the driver and their route.'
            : 'Anonymous: this answer will never carry a driver.'}
        </span>
      </div>
    </Modal>
  )
}

function PreviewQuestion({ q, i, m }: { q: Question; i: number; m: MakerState }) {
  const ans = m.answers[i]
  const pick = (v: string | number) => m.setAnswer(i, ans === v ? null : v)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={{ ...caption1, color: 'var(--text-primary)', textWrap: 'pretty' }}>
        {i + 1}. {q.text || '…'}
        {q.required && <span style={{ color: 'var(--danger-fg)' }}> *</span>}
      </span>

      {q.kind === 'Rating' && (
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
          {Array.from({ length: q.scale }, (_, x) => x + 1).map((n) => (
            <span
              key={n}
              onClick={() => pick(n)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-circle)',
                background: ans === n ? 'var(--primary)' : 'var(--surface-card)',
                border: `1px solid ${ans === n ? 'var(--primary)' : 'var(--border-default)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...caption2,
                color: ans === n ? 'var(--text-inverse)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {q.kind === 'Yes / No' && (
        <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
          {['Yes', 'No'].map((v) => (
            <Pill key={v} label={v} on={ans === v} onPick={() => pick(v)} wide />
          ))}
        </div>
      )}

      {q.kind === 'Choice' && (
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
          {(q.options || []).map((o, oi) => (
            <Pill key={oi} label={o || `Option ${oi + 1}`} on={ans === oi} onPick={() => pick(oi)} />
          ))}
        </div>
      )}

      {['Short text', 'Long text', 'Number'].includes(q.kind) && (
        <div
          style={{
            boxSizing: 'border-box',
            height: q.kind === 'Long text' ? 56 : 28,
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            background: 'var(--surface-page)',
          }}
        />
      )}

      {q.kind === 'Photo' && (
        <div
          style={{
            boxSizing: 'border-box',
            height: 64,
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...caption2,
            color: 'var(--text-helper)',
          }}
        >
          Add a photo
        </div>
      )}
    </div>
  )
}

function Pill({
  label,
  on,
  onPick,
  wide,
}: {
  label: string
  on: boolean
  onPick: () => void
  wide?: boolean
}) {
  return (
    <span
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: `0 var(--size-${wide ? '160' : '120'})`,
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        ...caption1,
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export { ATTRIBUTION_NOTE }
