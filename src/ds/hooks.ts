'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The transient confirmation line a page shows after an action.
 *
 * Written once because the timer is easy to get wrong: a page that forgets to
 * clear it on unmount leaves a `setState` pointed at a dead component, and one
 * that forgets to clear the *previous* timer lets an old message cut a new one
 * short. Both are handled here.
 *
 * `ms` differs per page - the denser screens hold it longer, and Compliance
 * holds it longest because its messages carry a reason.
 */
export function useToast(ms = 2400) {
  const [toast, setToast] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toastMsg = useCallback((text: string) => {
    setToast(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), ms)
  }, [ms])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { toast, toastMsg }
}

/**
 * A toast that carries the thing its Undo would restore - a snapshot, a
 * callback, or just a flag saying the last action can be taken back.
 *
 * The payload has to expire *with* the line, or the page ends up offering an
 * Undo for a message the operator can no longer see. Keeping the two in one
 * hook is what makes that impossible to get wrong.
 */
export function useUndoToast<T>(ms: number, undoMs = ms) {
  const [toast, setToast] = useState('')
  const [undoable, setUndoable] = useState<T | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toastMsg = useCallback((text: string, payload?: T | null) => {
    const carry = payload ?? null
    setToast(text)
    // The updater form, because a payload may itself be a function - passing it
    // bare would make React call it as a reducer instead of storing it.
    setUndoable(() => carry)
    if (timer.current) clearTimeout(timer.current)
    // An offer to undo holds longer, because it is useless if it goes unread.
    timer.current = setTimeout(() => { setToast(''); setUndoable(null) }, carry ? undoMs : ms)
  }, [ms, undoMs])

  /** Take the line down now - what it offered has just been done. */
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setToast('')
    setUndoable(null)
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { toast, undoable, toastMsg, clear }
}

/**
 * Keeps a menu of width `w` on screen when its trigger sits near the right edge.
 * The 12px inset is the gutter every page leaves between a menu and the frame.
 */
export const clampLeft = (left: number, w: number): number =>
  Math.min(left, window.innerWidth - w - 12)

/** A menu placed below `event`'s trigger, no narrower than the trigger itself. */
export function anchorTo(
  event: { currentTarget: EventTarget | null },
  minWidth: number,
): { x: number; y: number; w: number } {
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const w = Math.max(Math.round(r.width), minWidth)
  return { x: clampLeft(r.left, w), y: r.bottom + 4, w }
}

/** The same, for a menu whose width is fixed rather than taken from its trigger. */
export function anchorAt(
  event: { currentTarget: EventTarget | null },
  w: number,
): { x: number; y: number; w: number } {
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  return { x: clampLeft(r.left, w), y: r.bottom + 4, w }
}

export interface Page<T> {
  /** The page actually shown - clamped, so a filter that shrinks the list
   *  cannot strand you on a page that no longer exists. */
  p: number
  max: number
  slice: T[]
  total: number
}

export function paginate<T>(list: T[], page: number, size: number): Page<T> {
  const max = Math.max(1, Math.ceil(list.length / size))
  const p = Math.min(Math.max(1, page), max)
  return { p, max, slice: list.slice((p - 1) * size, p * size), total: list.length }
}
