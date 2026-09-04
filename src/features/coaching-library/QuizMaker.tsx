'use client'

import { useState } from 'react'
import { useToast } from '../../ds/hooks'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1Strong } from '../../ds/type'
import { IconButton, Toast } from './parts'
import { CARD } from './style'
import type { MakerQuiz } from './useCoachingLibrary'

interface Question {
  text: string
  options: { t: string }[]
  /** A question can have more than one right answer, so this is a set. */
  corrects: Record<number, boolean>
}

const blankQuestion = (): Question => ({ text: '', options: [{ t: '' }, { t: '' }], corrects: { 0: true } })

/**
 * Quiz Maker.
 *
 * A full-page editor that takes over the Coaching Library rather than opening
 * as a dialog - a quiz is long enough that it needs the whole width.
 */
export function QuizMaker({ quiz, onBack }: { quiz: MakerQuiz | null; onBack: () => void }) {
  const [name, setName] = useState(quiz?.name ?? '')
  const [pass, setPass] = useState(quiz?.pass ?? 4)
  const [passOpen, setPassOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>(
    (quiz?.questions ?? [{ text: '', options: [{ t: '' }, { t: '' }], correct: 0 }])
      .map((x) => ({ text: x.text, options: x.options.slice(), corrects: { [x.correct]: true } })),
  )

  const { toast, toastMsg } = useToast(2400)

  const setQ = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)))

  const total = questions.length

  const save = () => {
    if (name.trim().length < 2) { toastMsg('Name the quiz first'); return }
    if (questions.some((q) => !q.text.trim())) { toastMsg('Every question needs its text'); return }
    if (questions.some((q) => q.options.some((o) => !o.t.trim()))) { toastMsg('Every option needs its text'); return }
    if (questions.some((q) => Object.keys(q.corrects).length === 0)) { toastMsg('Mark at least one correct answer on every question'); return }
    toastMsg('Quiz saved - changes apply to future attempts only')
    setTimeout(onBack, 900)
  }

  return (
    <div
      data-screen-label="Quiz Maker"
      onClick={() => { if (passOpen) setPassOpen(false) }}
      style={{ boxSizing: 'border-box', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-page)', fontFamily: 'var(--font-family)', color: 'var(--text-primary)', overflow: 'hidden' }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-120) var(--size-200)', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)' }}>
        <BackButton onClick={onBack} />
        <div style={{ width: 1, height: 20, background: 'var(--border-default)' }} />
        <div data-field="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', width: 320, display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
          <input value={name} placeholder="Name the quiz" onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, fontWeight: 'var(--weight-semibold)' }} />
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ position: 'relative', display: 'flex' }}>
          <div
            data-fx=""
            tabIndex={0}
            role="button"
            onClick={(e) => { e.stopPropagation(); setPassOpen(!passOpen) }}
            style={{ boxSizing: 'border-box', height: 'var(--control-height)', minWidth: 150, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', border: '1px solid var(--border-default)', ...body1, cursor: 'pointer' }}
          >
            {/* The pass mark can never exceed the number of questions. */}
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Pass mark · {Math.min(pass, total)} of {total}</span>
            <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
          </div>
          {passOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'absolute', top: 36, left: 0, right: 0, boxSizing: 'border-box', padding: 'var(--size-40)', background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 30, display: 'flex', flexDirection: 'column' }}
            >
              {questions.map((_, i) => {
                const n = i + 1
                const on = pass === n
                return (
                  <div
                    key={n}
                    data-fx=""
                    tabIndex={0}
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setPass(n); setPassOpen(false) }}
                    style={{ boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: on ? 'var(--blue-50)' : 'transparent', ...body1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--blue-700)' : 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>{on && <Icon name="FnCheck" size={16} />}</span>
                    <span>{n} of {total}</span>
                  </div>
                )
              })}
            </div>
          )}
        </span>
        <SaveButton onClick={save} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div data-rsp-page="" style={{ boxSizing: 'border-box', maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-200)' }}>
          {questions.map((qn, i) => (
            <div key={i} style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-120) var(--size-160)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 'var(--radius-small)', background: 'var(--blue-50)', color: 'var(--blue-700)', ...caption1Strong, flexShrink: 0 }}>
                  Q{i + 1}
                </span>
                <div data-field="" style={{ boxSizing: 'border-box', flex: 1, height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
                  <input value={qn.text} placeholder="Write the question" onChange={(e) => setQ(i, { text: e.target.value })} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, fontWeight: 'var(--weight-semibold)' }} />
                </div>
                <IconButton
                  icon="SvDelete"
                  title="Remove question"
                  onClick={() => {
                    setQuestions((qs) => {
                      const next = qs.slice()
                      next.splice(i, 1)
                      return next.length ? next : [blankQuestion()]
                    })
                    toastMsg('Question removed')
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', padding: '0 var(--size-160) var(--size-120) var(--size-160)' }}>
                {qn.options.map((o, oi) => {
                  const on = !!qn.corrects[oi]
                  return (
                    <div
                      key={oi}
                      data-fx=""
                      tabIndex={0}
                      role="button"
                      title="Click to mark as the correct answer"
                      onClick={() => {
                        const c = { ...qn.corrects }
                        if (c[oi]) delete c[oi]
                        else c[oi] = true
                        setQ(i, { corrects: c })
                        toastMsg(`Option ${oi + 1}${c[oi] ? ' marked as a correct answer' : ' unmarked'}`)
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 40,
                        padding: '0 var(--size-120)',
                        border: `1px solid ${on ? 'var(--success-border)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-medium)',
                        background: on ? 'var(--success-bg)' : 'var(--surface-card)', cursor: 'pointer',
                      }}
                    >
                      <div style={{ boxSizing: 'border-box', width: 16, height: 16, borderRadius: '50%', border: `1px solid ${on ? 'var(--green-600)' : 'var(--border-strong)'}`, background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-600)' }} />}
                      </div>
                      <input
                        value={o.t}
                        placeholder="Answer option"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const ops = qn.options.slice()
                          ops[oi] = { t: e.target.value }
                          setQ(i, { options: ops })
                        }}
                        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }}
                      />
                      {on && <span style={{ ...caption1Strong, color: 'var(--success-fg)', whiteSpace: 'nowrap' }}>Correct</span>}
                      <IconButton
                        icon="FnDismiss"
                        size={24}
                        title="Remove option"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (qn.options.length <= 2) { toastMsg('A question needs at least two options'); return }
                          const ops = qn.options.slice()
                          ops.splice(oi, 1)
                          // Removing an option shifts every later correct index down.
                          const c: Record<number, boolean> = {}
                          Object.keys(qn.corrects).forEach((k) => {
                            const n = parseInt(k, 10)
                            if (n === oi) return
                            c[n > oi ? n - 1 : n] = true
                          })
                          setQ(i, { options: ops, corrects: c })
                        }}
                      />
                    </div>
                  )
                })}
                <Dashed onClick={() => setQ(i, { options: qn.options.concat([{ t: '' }]) })} minHeight={36}>+ Add Option</Dashed>
              </div>
            </div>
          ))}
          <Dashed onClick={() => setQuestions((qs) => qs.concat([blankQuestion()]))} minHeight={48}>+ Add Question</Dashed>
        </div>
      </div>

      {toast && <Toast>{toast}</Toast>}
    </div>
  )
}

function Dashed({ children, onClick, minHeight }: { children: string; onClick: () => void; minHeight: number }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight,
        border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)',
        color: 'var(--text-secondary)', ...body1, fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--size-60)', height: 'var(--control-height)',
        padding: '0 var(--size-100)', borderRadius: 'var(--radius-medium)', ...body1,
        fontWeight: 'var(--weight-semibold)', cursor: 'pointer', color: 'var(--text-link)',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: 'rotate(90deg)' }}><Icon name="SvChevron" size={16} /></span>
      Coaching Library
    </div>
  )
}

function SaveButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-160)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)',
        color: 'var(--text-inverse)', ...body1, fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      Save Quiz
    </div>
  )
}
