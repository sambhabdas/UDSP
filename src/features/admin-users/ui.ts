// Non-component exports live here so parts.tsx stays fast-refresh clean.

export interface Tone {
  bg: string
  border: string
  fg: string
  hoverBg: string
}

// A bulk action wears the colour of what it does.
export const TONES: Record<'blue' | 'danger' | 'success' | 'warning', Tone> = {
  blue: {
    bg: 'var(--blue-100)',
    border: 'var(--blue-200)',
    fg: 'var(--blue-700)',
    hoverBg: 'var(--blue-200)',
  },
  danger: {
    bg: 'var(--danger-bg)',
    border: 'var(--danger-border)',
    fg: 'var(--danger-fg)',
    hoverBg: 'var(--danger-border)',
  },
  success: {
    bg: 'var(--success-bg)',
    border: 'var(--success-border)',
    fg: 'var(--success-fg)',
    hoverBg: 'var(--success-border)',
  },
  warning: {
    bg: 'var(--warning-bg)',
    border: 'var(--warning-border)',
    fg: 'var(--warning-fg)',
    hoverBg: 'var(--warning-border)',
  },
}
