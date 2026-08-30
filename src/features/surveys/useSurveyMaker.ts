import { useCallback, useMemo, useRef, useState } from 'react'
import { REMINDERS, TEMPLATES, TRIGGERS } from './data'
import type { QuestionKind, SeedQuestion, Survey, TriggerId } from './data'

/** A question the maker owns: the kind is one of the seven base kinds, and the
 *  Choice options and Rating scale always exist. */
export interface Question {
  text: string
  kind: QuestionKind
  required: boolean
  options: string[]
  scale: number
}

/** What the maker's parts read. Derived from the hook so the two cannot drift. */
export type MakerState = ReturnType<typeof useSurveyMaker>

export type SectionId = 'questions' | 'trigger' | 'attribution' | 'reminder'

// A seeded question arrives with its follow-up and optional markers baked into
// the kind string; the maker only knows the seven base kinds.
function normalize(q: SeedQuestion): Question {
  let kind = q.kind || 'Rating'
  kind = kind.replace(' + follow-up', '').replace(', optional', '')
  if (/^Rating/.test(kind)) kind = 'Rating'
  return {
    text: q.text || '',
    kind: kind as QuestionKind,
    required: !!q.required,
    options: kind === 'Choice' ? (q.options?.length ? q.options.slice() : ['', '']) : (q.options ?? []),
    scale: q.scale || 5,
  }
}

const triggerOf = (type: string): TriggerId =>
  type === 'Route-end' ? 'route' : type === 'Weekly' ? 'weekly' : type === 'New hire' ? 'newhire' : 'manual'

export function useSurveyMaker(survey: Survey | null) {
  const isCreate = !survey

  const [name, setName] = useState(survey ? survey.name : '')
  const [questions, setQuestions] = useState(() => (survey ? (survey.questions || []).map(normalize) : []))
  const [trigger, setTrigger] = useState(survey ? triggerOf(survey.type) : 'route')
  const [attribution, setAttribution] = useState(survey ? (survey.answers === 'anonymous' ? 'Anonymous' : 'Named') : 'Named')
  const [reminder, setReminder] = useState(survey ? survey.reminder || 'None' : 'None')

  const [template, setTemplate] = useState('Blank')
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    questions: true,
    trigger: false,
    attribution: false,
    reminder: false,
  })

  const [previewOpen, setPreviewOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string | number | null>>({})

  const dragFrom = useRef<number | null>(null)

  const closeOverlays = useCallback(() => setOpenDrop((d) => (d ? null : d)), [])

  const patchQ = useCallback((i: number, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)))
  }, [])

  const addQuestion = useCallback(() => {
    setQuestions((qs) => {
      setEditing(qs.length)
      return qs.concat([{ text: '', kind: 'Rating', required: false, options: [], scale: 5 }])
    })
    setOpen((o) => ({ ...o, questions: true }))
  }, [])

  const duplicateQ = useCallback((i: number) => {
    setQuestions((qs) => {
      const next = qs.slice()
      next.splice(i + 1, 0, JSON.parse(JSON.stringify(qs[i])))
      return next
    })
    setEditing(null)
  }, [])

  const removeQ = useCallback((i: number) => {
    setQuestions((qs) => qs.filter((_, j) => j !== i))
    setEditing(null)
  }, [])

  const beginDrag = useCallback((i: number) => {
    dragFrom.current = i
  }, [])

  const dropOn = useCallback((i: number) => {
    const from = dragFrom.current
    dragFrom.current = null
    if (from == null || from === i) return
    setQuestions((qs) => {
      const next = qs.slice()
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      return next
    })
    setEditing(null)
  }, [])

  const applyTemplate = useCallback((t: string) => {
    const tpl = TEMPLATES[t]
    setTemplate(t)
    setOpenDrop(null)
    setEditing(null)
    setQuestions(tpl ? tpl.questions.map(normalize) : [])
    setTrigger(tpl ? tpl.trigger : 'route')
    setAttribution(tpl ? tpl.attribution : 'Named')
    setReminder(tpl ? tpl.reminder : 'None')
    if (t !== 'Blank') setName(t)
  }, [])

  const toggleSection = useCallback((id: SectionId) => {
    setOpen((o) => ({ ...o, [id]: !o[id] }))
    setEditing(null)
    setOpenDrop(null)
  }, [])

  const requiredCount = questions.filter((q) => q.required).length

  // Long required surveys get skipped — say so rather than letting it ship.
  const reqWarning = questions.length > 0 && requiredCount > questions.length / 2

  const sections = useMemo<{ id: SectionId; title: string; summary: string }[]>(
    () => [
      {
        id: 'questions',
        title: 'Questions',
        summary:
          `${questions.length} ${questions.length === 1 ? 'question' : 'questions'}` +
          (requiredCount ? ` · ${requiredCount} required` : ''),
      },
      {
        id: 'trigger',
        title: 'When it sends',
        summary: TRIGGERS.find((t) => t.id === trigger)?.label ?? '',
      },
      { id: 'attribution', title: 'Who sees who answered', summary: attribution },
      { id: 'reminder', title: 'Reminder', summary: reminder },
    ],
    [questions.length, requiredCount, trigger, attribution, reminder],
  )

  const setAnswer = useCallback(
    (i: number, v: string | number | null) => setAnswers((a) => ({ ...a, [i]: v })),
    [],
  )

  const openPreview = useCallback(() => {
    setPreviewOpen(true)
    setOpenDrop(null)
    setEditing(null)
    setAnswers({})
  }, [])

  return {
    isCreate, name, setName,
    questions, patchQ, addQuestion, duplicateQ, removeQ, beginDrag, dropOn,
    editing, setEditing,
    trigger, setTrigger, attribution, setAttribution,
    reminder, setReminder, reminders: REMINDERS,
    template, applyTemplate, templateNames: ['Blank'].concat(Object.keys(TEMPLATES)),
    openDrop, setOpenDrop, closeOverlays,
    open, toggleSection, sections,
    requiredCount, reqWarning,
    previewOpen, openPreview, setPreviewOpen, answers, setAnswer,
  }
}
