'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { body1, body1Strong, caption1, caption1Strong, subtitle1, title3 } from '../../ds/type'
import { env } from '../../config/env'

/**
 * Sign in.
 *
 * The one screen with no `.dc.html` behind it - the design project has no
 * sign-in file - so it is built from the design system instead of transcribed:
 * the rail's brand mark, the Fluent ramp, the `[data-field]` focus rule from
 * `app.css`, and the same tokens every other page uses. Nothing invented.
 *
 * The credentials are never in the browser. This posts to `/api/login`, which
 * compares against server-only environment variables and answers with a signed,
 * httpOnly cookie; `middleware.ts` is what actually keeps the console shut.
 */
export function LoginPage() {
  const params = useSearchParams()
  // Where they were headed before the gate stopped them. Only same-site paths
  // are honoured - an absolute URL here would be an open redirect.
  const raw = params.get('next')
  const next = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        // A full navigation, not a client push: the cookie has to be on the
        // request for the middleware to let the next page through.
        window.location.assign(next)
        return
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error || 'Could not sign in. Try again.')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <main
      data-screen-label="Sign in"
      style={{
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-240) var(--size-160)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          boxSizing: 'border-box',
          width: 380,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-320)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-card)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
          {/* The rail's mark, at the rail's size, so the app is recognisable
              before you are inside it. */}
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-medium)',
              background: 'var(--primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...subtitle1,
              fontWeight: 'var(--weight-bold)',
            }}
          >
            {env.brandName.slice(0, 1).toUpperCase()}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
            <h1 style={{ margin: 0, ...title3 }}>Sign in to {env.brandName}</h1>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              {env.stationCode} · {env.stationName}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          <Field label="Username" htmlFor="username">
            <input
              id="username"
              name="username"
              value={username}
              autoComplete="username"
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
              style={INPUT}
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              style={INPUT}
            />
          </Field>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--size-80)',
              padding: 'var(--size-100) var(--size-120)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-medium)',
              ...caption1,
              color: 'var(--danger-fg)',
              textWrap: 'pretty',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !username || !password}
          style={{
            boxSizing: 'border-box',
            height: 'var(--control-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 'var(--radius-medium)',
            background: busy || !username || !password ? 'var(--neutral-200)' : 'var(--primary)',
            color: busy || !username || !password ? 'var(--text-disabled)' : 'var(--text-inverse)',
            fontFamily: 'var(--font-family)',
            ...body1Strong,
            cursor: busy || !username || !password ? 'default' : 'pointer',
            transition: 'background var(--motion-hover)',
          }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

const INPUT = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  ...body1,
  color: 'var(--text-primary)',
  padding: 0,
} as const

/** Label over the field wrapper that carries the focus border - `[data-field]`
 *  in `app.css`, the same rule every other input on the product uses. */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <label htmlFor={htmlFor} style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <span
        data-field=""
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          background: 'var(--surface-card)',
        }}
      >
        {children}
      </span>
    </div>
  )
}
