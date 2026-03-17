'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'
import styles from './login.module.css'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle, isAuthenticated, loading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  // Show error from callback redirect
  useEffect(() => {
    const authError = searchParams.get('error')
    if (authError) {
      const messages = {
        auth_failed: 'Authentication failed. Please try again.',
        no_user: 'Could not verify your account. Please try again.',
        callback_failed: 'Something went wrong during sign-in. Please try again.'
      }
      setError(messages[authError] || 'Sign-in failed. Please try again.')
    }
  }, [searchParams])

  // Redirect if already logged in (but wait for loading to finish)
  if (!loading && isAuthenticated) {
    router.push('/account')
    return null
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we check your session.</p>
        </div>
      </div>
    )
  }

  const handleGoogleLogin = async () => {
    try {
      setSigningIn(true)
      setError('')
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setSigningIn(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome to Spacecrafts Furniture</h1>
        <p className={styles.subtitle}>Sign in to your account to continue shopping</p>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className={styles.googleButton}
        >
          {signingIn ? 'Signing in...' : (
            <>
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <p className={styles.note}>
          Don't have an account? We'll create one for you automatically when you sign in with Google.
        </p>

        <div className={styles.benefits}>
          <h3>Benefits of signing in:</h3>
          <ul>
            <li>✓ Easy checkout with saved addresses</li>
            <li>✓ Track your orders</li>
            <li>✓ Save your favorite items</li>
            <li>✓ Write reviews and ratings</li>
            <li>✓ Ask product questions</li>
            <li>✓ Faster purchases</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}