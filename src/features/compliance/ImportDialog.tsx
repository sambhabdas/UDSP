'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { CheckBox } from '../dispatch/parts'
import { IMPORT_COLS, IMPORT_FILLS } from './data'
import { TallButton } from './parts'
import type { ComplianceState } from './useCompliance'

/**
 * Import Punches - three numbered steps: the file, what the rows are matched
 * on, and which columns are allowed to overwrite the board.
 */
export function ImportDialog({ s }: { s: ComplianceState }) {
  const imp = s.imp
  if (!imp) return null
  const ready = !!imp.file
  const close = () => s.setImp(null)

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
      }}
    >
      <div
        data-dialog-card=""
        data-pop=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 672,
          maxHeight: '86vh',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: '0 var(--size-200)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ flex: 1, ...subtitle1 }}>Import Punches</span>
          <CloseGlyph onClick={close} />
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-200)',
            padding: 'var(--size-200)',
          }}
        >
          <Step n={1} label="File">
            {!imp.file ? (
              <DropZone onClick={() => s.setImp({ ...imp, file: 'punches_2026-07-29.csv' })} />
            ) : (
              <div
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--size-120)',
                  padding: 'var(--size-100) var(--size-120)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-medium)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={body1Strong}>{imp.file}</span>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Sheet 1 · Header row 1</span>
                <div style={{ flex: 1 }} />
                {IMPORT_COLS.map((c) => (
                  <span
                    key={c}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 20,
                      padding: '0 var(--size-60)',
                      borderRadius: 'var(--radius-small)',
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                      ...caption1,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </Step>

          <Step n={2} label="Match On">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
              <MatchBox>Employee</MatchBox>
              <span style={{ ...body1, color: 'var(--text-secondary)' }}>=</span>
              <MatchBox>Driver</MatchBox>
            </div>
          </Step>

          <Step n={3} label="Fill">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {IMPORT_FILLS.map(([key, target, src]) => (
                <div
                  key={key}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-100)',
                    minHeight: 40,
                    padding: 'var(--size-40) var(--size-60)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <CheckBox
                    on={imp.fills[key]}
                    onClick={() => s.setImp({ ...imp, fills: { ...imp.fills, [key]: !imp.fills[key] } })}
                  />
                  <span style={{ width: 140, ...body1Strong }}>{target}</span>
                  <span style={{ ...caption1, color: 'var(--text-secondary)' }}>←</span>
                  <span style={{ ...body1, color: 'var(--text-secondary)' }}>{src}</span>
                </div>
              ))}
            </div>
          </Step>

          {ready && (
            <div
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-80)',
                padding: 'var(--size-80) var(--size-120)',
                borderRadius: 'var(--radius-medium)',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span style={body1Strong}>
                17 of 18 rows match · 1 not found - the unmatched row is skipped and named in the toast
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--size-80)',
            padding: 'var(--size-160) var(--size-200)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <TallButton onClick={close}>Cancel</TallButton>
          <TallButton
            primary={ready}
            disabled={!ready}
            title={ready ? undefined : 'Load a file first'}
            onClick={() => {
              s.setImp(null)
              s.toastMsg(
                'Punches imported - 17 rows landed, 1 unmatched (T. SMITH) skipped, every state re-derived',
              )
            }}
          >
            Run Import
          </TallButton>
        </div>
      </div>
    </div>
  )
}

/** A numbered step header with its rule running out to the edge. */
function Step({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span
          style={{
            boxSizing: 'border-box',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--blue-50)',
            border: '1px solid var(--blue-200)',
            color: 'var(--blue-700)',
            ...caption1Strong,
          }}
        >
          {n}
        </span>
        <span style={{ ...caption1Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      </div>
      {children}
    </div>
  )
}

function DropZone({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-240)',
        border: '1px dashed var(--border-strong, var(--neutral-400))',
        borderRadius: 'var(--radius-medium)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        ...body1,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      Drop the Paycom / ADP CSV here, or click to browse
    </div>
  )
}

/** Both sides of the match rule are fixed, so they read as filled boxes. */
function MatchBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        minWidth: 220,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        background: 'var(--surface-subtle)',
        ...body1,
      }}
    >
      {children}
    </div>
  )
}

function CloseGlyph({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Close"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name="FnDismiss" size={20} />
    </div>
  )
}
