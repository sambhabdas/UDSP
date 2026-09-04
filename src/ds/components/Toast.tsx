'use client'

import type { ReactNode } from 'react'
import { body1, caption1 } from '../type'

/**
 * The confirmation strip every page raises after an action.
 *
 * Two sizes, because the design files use two: the dense operational screens
 * (Schedule, Dispatch, Availability) put it at Caption 1, the report-style
 * screens at Body 1. Nothing else about it varies.
 *
 * It sits above dialogs deliberately - an action taken inside a modal still
 * has to be able to say what it did.
 */
export function Toast({
  children,
  size = 'body',
  onUndo,
}: {
  children: ReactNode
  size?: 'caption' | 'body'
  /** Renders an Undo affordance. Omit it and the toast is purely a report. */
  onUndo?: () => void
}) {
  const caption = size === 'caption'
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: caption ? 'var(--size-200)' : 32,
        transform: 'translateX(-50%)',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: onUndo ? 'var(--size-120)' : 'var(--size-100)',
        padding: 'var(--size-100) var(--size-160)',
        background: 'var(--surface-inverse)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-callout)',
        ...(caption ? caption1 : body1),
        whiteSpace: 'nowrap',
        zIndex: 100,
      }}
    >
      {children}
      {onUndo && (
        <span
          role="button"
          tabIndex={0}
          onClick={onUndo}
          style={{ color: 'var(--blue-300)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}
        >
          Undo
        </span>
      )}
    </div>
  )
}
