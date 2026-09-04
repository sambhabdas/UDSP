import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginPage } from '../../features/login/LoginPage'

export const metadata: Metadata = { title: 'Sign in' }

// `useSearchParams` reads the `?next=` the middleware attached, which forces a
// suspense boundary during prerender.
export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )
}
