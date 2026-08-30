'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { body1, body1Strong, caption2Strong } from '../../ds/type'
import { Ladder } from './Ladder'
import { Matrix } from './Matrix'
import { Protected, Splits } from './Panels'
import { BANNER, POSTS } from './data'

const EYEBROW: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

// The single reference every role gate in the product cites. Read-only by
// design: the five posts are fixed in v1, so there is no toggle, no grant, no
// custom post and no per-user override anywhere on this page.
export function AdminRolesPage() {
  const [selPost, setSelPost] = useState<string | null>(null)
  // -1 means nothing is picked: the matrix then leaves the Owner column tinted.
  const selIdx = selPost === null ? -1 : POSTS.indexOf(selPost)

  return (
    <div
      data-screen-label="Admin Roles"
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
        {/* Kills the search for an edit control before it starts. */}
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--size-40) var(--size-60)',
            alignItems: 'baseline',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <span style={{ ...body1Strong, color: 'var(--text-primary)' }}>{BANNER.lead}</span>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>{BANNER.rest}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
          <span style={EYEBROW}>The posts</span>
          <Ladder
            selPost={selPost}
            onPick={(p) => setSelPost((cur) => (cur === p ? null : p))}
          />
        </div>

        <Matrix selIdx={selIdx} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: 'var(--grid-gutter)',
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <span style={EYEBROW}>The two splits</span>
            <Splits />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <span style={EYEBROW}>Protected - never changes</span>
            <Protected />
          </div>
        </div>
      </div>
    </div>
  )
}
