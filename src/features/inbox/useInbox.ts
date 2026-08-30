import { useCallback, useMemo, useState } from 'react'
import { CHANNEL_KINDS, seedPeople } from './data'
import type { Activity, Channel, ComposerTab, Person, QueueFilter } from './data'

/** What the panels read. Derived from the hook so the two cannot drift. */
export type InboxState = ReturnType<typeof useInbox>

const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Everything the three columns share: the selected person, the queue filters,
// the composer state and the rail's task writes.
export function useInbox() {
  const [people, setPeople] = useState(seedPeople)
  // First load auto-selects the top row and marks NOTHING read (§3.6).
  const [selectedId, setSelectedId] = useState(() => seedPeople()[0].id)
  const [filter, setFilter] = useState<QueueFilter>('All')
  const [channels, setChannels] = useState<Channel[]>([])
  const [tab, setTab] = useState<ComposerTab>('Text')
  const [drafts, setDrafts] = useState<Record<string, string>>({}) // per person, per user (§3.3)
  const [subject, setSubject] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [recentsOpen, setRecentsOpen] = useState(false)
  const [addingTask, setAddingTask] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [showDone, setShowDone] = useState(false)

  const selected = people.find((p) => p.id === selectedId) || people[0]

  const patchSelected = useCallback(
    (fn: (p: Person) => Person) =>
      setPeople((list) => list.map((p) => (p.id === selectedId ? fn(p) : p))),
    [selectedId],
  )

  // A deliberate open clears unread + missed for the whole team — one station,
  // one queue (§1). Auto-selection never routes through here.
  const selectPerson = useCallback((id: string) => {
    setSelectedId(id)
    setPeople((list) =>
      list.map((p) => (p.id === id ? { ...p, unread: 0, missed: false } : p)),
    )
  }, [])

  const rows = useMemo(
    () =>
      people.filter((p) =>
        filter === 'Unread' ? p.unread > 0 : filter === 'Missed' ? p.missed : true,
      ),
    [people, filter],
  )

  const feed = useMemo(() => {
    if (channels.length === 0) return selected.timeline
    const kinds = channels.flatMap((c) => CHANNEL_KINDS[c])
    return selected.timeline.filter((m) => m.k === 'date' || kinds.includes(m.k))
  }, [selected, channels])

  const draft = drafts[selectedId] || ''
  const setDraft = useCallback(
    (value: string) => setDrafts((d) => ({ ...d, [selectedId]: value })),
    [selectedId],
  )

  // Email needs a subject before it can go (§3.3). A note is not an inbox item:
  // it appends to the timeline and never bumps Recents or creates unread.
  const canSend = draft.trim().length > 0 && (tab !== 'Email' || subject.trim().length > 0)

  const send = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    if (tab === 'Email' && !subject.trim()) return
    const time = now()
    const entry: Activity =
      tab === 'Note'
        ? { k: 'note', text: `Note · ${text}`, time }
        : tab === 'Email'
          ? { k: 'email', dir: 'out', text: subject.trim(), sub: text, time }
          : { k: 'out', text, time }
    const bumps = tab !== 'Note'

    setPeople((list) => {
      const next: Person[] = list.map((p) =>
        p.id !== selectedId
          ? p
          : {
              ...p,
              timeline: [...p.timeline, entry],
              last: bumps
                ? { ch: tab === 'Email' ? 'email' : 'text', snip: text, t: 'now' }
                : p.last,
            },
      )
      if (!bumps) return next
      // Recents is ordered by last activity, newest first (§3.1).
      const sent = next.find((p) => p.id === selectedId)
      return sent ? [sent, ...next.filter((p) => p.id !== selectedId)] : next
    })
    setDraft('')
    setSubject('')
  }, [draft, tab, subject, selectedId, setDraft])

  const toggleChannel = useCallback((c: Channel | 'All') => {
    setChannels((sel) =>
      c === 'All' ? [] : sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c],
    )
  }, [])

  // Checking a task marks it done, holds the check for a beat so it is seen,
  // then files it under Done.
  const completeTask = useCallback(
    (index: number) => {
      patchSelected((p) => ({
        ...p,
        tasks: p.tasks.map((t, i) => (i === index ? { ...t, done: true } : t)),
      }))
      setTimeout(() => {
        setPeople((list) =>
          list.map((p) =>
            p.id !== selectedId
              ? p
              : {
                  ...p,
                  tasks: p.tasks.filter((t) => !t.done),
                  doneTasks: [...p.tasks.filter((t) => t.done), ...(p.doneTasks || [])].slice(
                    0,
                    5,
                  ),
                },
          ),
        )
      }, 600)
    },
    [patchSelected, selectedId],
  )

  const addTask = useCallback(() => {
    const label = newTask.trim()
    if (!label) return
    patchSelected((p) => ({
      ...p,
      tasks: [...(p.tasks || []), { label, status: 'assigned', done: false }],
    }))
    setNewTask('')
    setAddingTask(false)
  }, [newTask, patchSelected])

  return {
    people,
    rows,
    selected,
    selectedId,
    selectPerson,
    filter,
    setFilter,
    channels,
    toggleChannel,
    feed,
    tab,
    setTab,
    draft,
    setDraft,
    subject,
    setSubject,
    canSend,
    send,
    detailsOpen,
    setDetailsOpen,
    recentsOpen,
    setRecentsOpen,
    addingTask,
    setAddingTask,
    newTask,
    setNewTask,
    showDone,
    setShowDone,
    completeTask,
    addTask,
  }
}
