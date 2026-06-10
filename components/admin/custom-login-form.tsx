'use client'

import { useSearchParams } from 'next/navigation'
import { type CSSProperties } from 'react'
import { GitHub } from '@/components/icons/github'
import { signInWithProvider } from '@/app/(payload)/admin/login/actions'
import { AuthProvider } from '@/collections/User/constants'

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  } satisfies CSSProperties,
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '8px',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    padding: '2rem',
  } satisfies CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  } satisfies CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: '0.5rem',
    color: 'var(--theme-text)',
  } satisfies CSSProperties,
  description: {
    color: 'var(--theme-elevation-500)',
    margin: 0,
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  error: {
    backgroundColor: 'var(--theme-error-50)',
    border: '1px solid var(--theme-error-200)',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '1rem',
    color: 'var(--theme-error-500)',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  button: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,
  outlineButton: {
    backgroundColor: 'var(--theme-elevation-0)',
    border: '1px solid var(--theme-border-color)',
    color: 'var(--theme-text)',
  } satisfies CSSProperties,
  primaryButton: {
    backgroundColor: '#4f46e5',
    border: '1px solid #4f46e5',
    color: '#fff',
  } satisfies CSSProperties,
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } satisfies CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    gap: '0.75rem',
  } satisfies CSSProperties,
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--theme-border-color)',
  } satisfies CSSProperties,
  dividerText: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-400)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  formGroup: {
    marginBottom: '1rem',
  } satisfies CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.375rem',
    color: 'var(--theme-text)',
  } satisfies CSSProperties,
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid var(--theme-border-color)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-text)',
  } satisfies CSSProperties,
  legalText: {
    margin: '1rem 0 0',
    color: 'var(--theme-elevation-500)',
    fontSize: '0.75rem',
    lineHeight: 1.5,
    textAlign: 'center',
  } satisfies CSSProperties,
  legalLink: {
    color: 'var(--theme-text)',
    fontWeight: 500,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  } satisfies CSSProperties,
}

export function CustomLoginForm() {
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get('callbackUrl') || '/admin'
  const callbackUrl =
    rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/admin'
  const error = searchParams.get('error') ?? ''

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.description}>Sign in to access the admin panel</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <form
            action={signInWithProvider.bind(
              null,
              AuthProvider.GitHub,
              callbackUrl,
            )}
          >
            <button
              type="submit"
              style={{ ...styles.button, ...styles.outlineButton }}
            >
              <GitHub style={{ width: 20, height: 20 }} />
              Continue with GitHub
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
