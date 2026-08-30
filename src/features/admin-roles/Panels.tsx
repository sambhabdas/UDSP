import type { CSSProperties } from 'react'
import { caption1, caption1Strong } from '../../ds/type'
import { PROTECTED_RULES, SPLIT_FOOTNOTE, SPLITS } from './data'

const CARD: CSSProperties = {
  boxSizing: 'border-box',
  flex: 1,
  background: 'var(--surface-card)',
  borderRadius: 'var(--radius-medium)',
  padding: 'var(--size-120) var(--size-160)',
  display: 'flex',
  flexDirection: 'column',
}

export function Splits() {
  return (
    <div style={{ ...CARD, border: '1px solid var(--border-default)', gap: 'var(--size-100)' }}>
      {SPLITS.map((s) => (
        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
          <span style={caption1Strong}>{s.label}</span>
          <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{s.text}</span>
        </div>
      ))}
      {/* Under the divider so it reads as a correction to the split above it,
          not as part of either side. */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--size-100)' }}>
        <span style={caption1Strong}>{SPLIT_FOOTNOTE}</span>
      </div>
    </div>
  )
}

export function Protected() {
  return (
    <div style={{ ...CARD, border: '1px solid var(--danger-border)', gap: 'var(--size-60)' }}>
      {PROTECTED_RULES.map((p) => (
        <span key={p} style={{ ...caption1, color: 'var(--text-primary)', textWrap: 'pretty' }}>
          {p}
        </span>
      ))}
    </div>
  )
}
