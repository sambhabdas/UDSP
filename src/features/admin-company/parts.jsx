import { useHover } from '../../ds/useHover.js'
import { caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type.js'
import { SECTION_EYEBROW } from './ui.js'

export function Section({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <span style={SECTION_EYEBROW}>{label}</span>
      {children}
    </div>
  )
}

export function Card({ children, grid }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        ...(grid
          ? { display: 'grid', gridTemplateColumns: grid, overflow: 'hidden' }
          : { padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }),
      }}
    >
      {children}
    </div>
  )
}

export function InfoDot({ title }) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: 'var(--radius-circle)',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-secondary)',
        ...caption2Strong,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      i
    </span>
  )
}

export function Labelled({ label, info, children, width, flex, min }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', width, flex, minWidth: min }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={caption1Strong}>{label}</span>
        {info && <InfoDot title={info} />}
      </span>
      {children}
    </div>
  )
}

// A read-only field keeps its shape and loses its contrast, so a locked value
// still reads as a value rather than as a disabled control.
export function Field({ value, onChange, placeholder, maxLength, readOnly, uppercase, sample, width }) {
  return (
    <span
      data-field={readOnly ? undefined : ''}
      style={{
        boxSizing: 'border-box',
        width,
        maxWidth: '100%',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        border: `1px solid ${readOnly ? 'var(--border-subtle)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-small)',
        background: readOnly ? 'var(--surface-subtle)' : 'var(--surface-card)',
      }}
    >
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        {...sample}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-family)',
          ...(uppercase ? caption1Strong : caption1),
          color: readOnly ? 'var(--text-secondary)' : 'var(--text-primary)',
          padding: 0,
          textTransform: uppercase ? 'uppercase' : 'none',
        }}
      />
    </span>
  )
}

export function ChipRow({ options, value, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
      {options.map((o) => (
        <Chip key={o} label={o} on={value === o} onPick={() => onPick(o)} />
      ))}
    </div>
  )
}

function Chip({ label, on, onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary)' : 'var(--text-secondary)',
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

export function SmallButton({ children, onClick, primary }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function Helper({ children }) {
  return (
    <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {children}
    </span>
  )
}
