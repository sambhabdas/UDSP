import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption2, subtitle2 } from '../../ds/type'
import { ATTRIBUTION_NOTE, TRIGGERS } from './data'
import { QuestionCard } from './QuestionEditor'
import { Button, Helper, Seg } from './parts'
import { SurveyPreview } from './SurveyPreview'
import { useSurveyMaker } from './useSurveyMaker'
import type { MakerState, SectionId } from './useSurveyMaker'
import type { Survey } from './data'

// Four collapsible sections, each summarising itself when shut, so the whole
// survey is legible without opening anything.
export function SurveyMaker({
  survey,
  onBack,
}: {
  survey: Survey | null
  onBack: (message?: string) => void
}) {
  const m = useSurveyMaker(survey)

  return (
    <div
      data-screen-label="Survey Maker"
      onClick={m.closeOverlays}
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
          width: '100%',
          maxWidth: 860,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-120)',
          padding: 'var(--size-200)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          <span onClick={() => onBack()} style={{ alignSelf: 'flex-start', ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
            ← Surveys
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <span style={subtitle2}>{m.isCreate ? 'New survey' : m.name || 'Survey'}</span>
            <div style={{ flex: 1 }} />
            <Button onClick={m.openPreview}>Preview</Button>
            <Button onClick={() => onBack(`Draft saved: ${m.name || 'Untitled survey'}`)}>Save draft</Button>
            <Button primary onClick={() => onBack(`Saved & activated: ${m.name || 'Untitled survey'}`)}>
              Save &amp; activate
            </Button>
          </div>
        </div>

        <div
          data-field=""
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-100) var(--size-160)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          <Helper>Survey name</Helper>
          <input
            value={m.name}
            onChange={(e) => m.setName(e.target.value)}
            placeholder="e.g. End of route"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-family)',
              ...body1,
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
          {/* Templates only exist while creating — an edit already has content. */}
          {m.isCreate && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', marginTop: 'var(--size-40)' }}>
              <Helper>Start from</Helper>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  m.setOpenDrop(m.openDrop === 'template' ? null : 'template')
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', cursor: 'pointer' }}
              >
                <span style={{ ...caption1, color: 'var(--text-link)' }}>{m.template}</span>
                <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
                  <Icon name="SvChevron" size={12} />
                </span>
              </div>
              {m.openDrop === 'template' && (
                <Dropdown left={52} top={24}>
                  {m.templateNames.map((t) => (
                    <DropRow key={t} label={t} on={m.template === t} onPick={() => m.applyTemplate(t)} />
                  ))}
                </Dropdown>
              )}
            </div>
          )}
        </div>

        {m.sections.map((sec) => (
          <Section key={sec.id} sec={sec} m={m}>
            {sec.id === 'questions' && <QuestionsBody m={m} />}
            {sec.id === 'trigger' && <TriggerBody m={m} />}
            {sec.id === 'attribution' && <AttributionBody m={m} />}
            {sec.id === 'reminder' && <ReminderBody m={m} />}
          </Section>
        ))}
      </div>

      {m.previewOpen && <SurveyPreview m={m} />}
    </div>
  )
}

function Section({
  sec,
  m,
  children,
}: {
  sec: { id: SectionId; title: string; summary: string }
  m: MakerState
  children?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  const open = m.open[sec.id]
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      }}
    >
      <div
        onClick={() => m.toggleSection(sec.id)}
        style={{
          boxSizing: 'border-box',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-100)',
          padding: '0 var(--size-160)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-medium)',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span
          style={{
            display: 'flex',
            color: 'var(--text-secondary)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform var(--motion-move)',
          }}
        >
          <Icon name="SvChevron" size={12} />
        </span>
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{sec.title}</span>
        <div style={{ flex: 1 }} />
        {/* Shut, the section says what it holds. */}
        <span style={{ ...caption1, color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sec.summary}
        </span>
      </div>
      {open && children}
    </div>
  )
}

function Body({ children }: { children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
      {children}
    </div>
  )
}

function QuestionsBody({ m }: { m: MakerState }) {
  const [hover, hoverProps] = useHover()
  return (
    <Body>
      {/* Length is the thing that kills a survey, so say it while it is still
          being built. */}
      {m.reqWarning && (
        <div
          style={{
            boxSizing: 'border-box',
            padding: 'var(--size-60) var(--size-100)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-small)',
            ...caption2,
            color: 'var(--warning-fg)',
            textWrap: 'pretty',
          }}
        >
          {m.requiredCount} of {m.questions.length} questions are required. Long required surveys get skipped.
        </div>
      )}

      {m.questions.map((q, i) => (
        <QuestionCard key={i} q={q} i={i} m={m} />
      ))}

      <div
        onClick={m.addQuestion}
        style={{
          boxSizing: 'border-box',
          background: hover ? 'var(--blue-50)' : 'var(--surface-subtle)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-medium)',
          padding: 'var(--size-100) var(--size-120)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-link)' }}>
          {m.questions.length === 0 ? '+ Add your first question' : '+ Add a question'}
        </span>
      </div>
    </Body>
  )
}

function TriggerBody({ m }: { m: MakerState }) {
  return (
    <Body>
      {TRIGGERS.map((t) => {
        const on = m.trigger === t.id
        return (
          <div
            key={t.id}
            onClick={() => m.setTrigger(t.id)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              padding: 'var(--size-100) var(--size-120)',
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
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>{t.label}</span>
              {/* The trigger and its audience are one decision. */}
              <Helper>{t.audience}</Helper>
            </div>
          </div>
        )
      })}
    </Body>
  )
}

function AttributionBody({ m }: { m: MakerState }) {
  return (
    <Body>
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        {['Named', 'Anonymous'].map((a) => (
          <Seg key={a} grow label={a} on={m.attribution === a} onPick={() => m.setAttribution(a)} />
        ))}
      </div>
      <span style={{ ...caption2, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{ATTRIBUTION_NOTE}</span>
    </Body>
  )
}

function ReminderBody({ m }: { m: MakerState }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
      <div
        data-field=""
        onClick={(e) => {
          e.stopPropagation()
          m.setOpenDrop(m.openDrop === 'reminder' ? null : 'reminder')
        }}
        style={{
          boxSizing: 'border-box',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-100)',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-small)',
          ...caption1,
          cursor: 'pointer',
        }}
      >
        {m.reminder}
        <div style={{ flex: 1 }} />
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {m.openDrop === 'reminder' && (
        <Dropdown stretch top={32}>
          {m.reminders.map((r) => (
            <DropRow
              key={r}
              label={r}
              on={m.reminder === r}
              onPick={() => {
                m.setReminder(r)
                m.setOpenDrop(null)
              }}
            />
          ))}
        </Dropdown>
      )}
    </div>
  )
}

function Dropdown({
  children,
  left = 0,
  top = 32,
  stretch,
}: {
  children?: ReactNode
  left?: number | string
  top?: number | string
  stretch?: boolean
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top,
        ...(stretch ? { left: 'var(--size-160)', right: 'var(--size-160)' } : { left, minWidth: 200 }),
        boxSizing: 'border-box',
        padding: 'var(--size-40)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

function DropRow({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        color: 'var(--text-primary)',
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
