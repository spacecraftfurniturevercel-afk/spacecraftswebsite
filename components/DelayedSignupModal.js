'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import styles from './DelayedSignupModal.module.css'

const STORAGE_KEY = 'signupModalDismissed'
const DELAY_MS = 6000

/**
 * DelayedSignupModal
 *
 * Premium signup prompt that appears after 6 seconds for unauthenticated
 * visitors. Dismissed state is persisted in localStorage so the modal
 * only shows once per browser.
 */
export default function DelayedSignupModal() {
  const { isAuthenticated, loading, signInWithGoogle } = useAuth()

  // `shouldRender` gates DOM mounting; `isVisible` drives CSS animation
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')

  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const timerRef = useRef(null)

  /* ─── Display logic ─── */
  useEffect(() => {
    // Wait until auth check completes
    if (loading) return

    // Condition 1: user is logged in → never show
    if (isAuthenticated) return

    // Condition 2: already dismissed → never show
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      // localStorage may be unavailable (SSR/privacy mode)
    }

    // Condition 3: start 6-second timer
    timerRef.current = setTimeout(() => {
      previousFocusRef.current = document.activeElement
      setShouldRender(true)
      // Allow one frame for DOM mount, then trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    }, DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loading, isAuthenticated])

  /* ─── Body scroll lock ─── */
  useEffect(() => {
    if (!shouldRender) return

    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [shouldRender])

  /* ─── Focus management ─── */
  useEffect(() => {
    if (isVisible && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }
  }, [isVisible])

  /* ─── Dismiss handler ─── */
  const dismiss = useCallback(() => {
    setIsVisible(false)

    // Persist dismissal
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // noop
    }

    // Wait for fade-out animation, then unmount
    setTimeout(() => {
      setShouldRender(false)
      // Restore focus to previously focused element
      previousFocusRef.current?.focus()
    }, 300) // matches --transition-base
  }, [])

  /* ─── Keyboard handling (ESC + focus trap) ─── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        dismiss()
        return
      }

      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableEls = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableEls.length === 0) return

      const first = focusableEls[0]
      const last = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [dismiss]
  )

  /* ─── Overlay click (close when clicking outside modal) ─── */
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        dismiss()
      }
    },
    [dismiss]
  )

  /* ─── Google sign-in ─── */
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      dismiss()
    } catch (err) {
      console.error('Google sign-in error:', err)
    }
  }

  /* ─── Continue with email/phone ─── */
  const handleContinue = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // Navigate to login page with pre-filled value
    window.location.href = `/login?prefill=${encodeURIComponent(email.trim())}`
  }

  /* ─── Guard: do not render ─── */
  if (!shouldRender) return null

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      aria-hidden={!isVisible}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${isVisible ? styles.modalVisible : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sign up for exclusive offers"
      >
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={dismiss}
          aria-label="Close sign-up modal"
          type="button"
        >
          &#x2715;
        </button>

        {/* ─── Hero: Image on top, promo below ─── */}
        <div className={styles.heroGrid}>
          {/* Top — Image Banner */}
          <div className={styles.imagePanel}>
            <img
              className={styles.heroImage}
              src="/hero/sofa.jpg"
              alt="Premium furniture collection"
            />
          </div>

          {/* Promo Text */}
          <div className={styles.promoPanel}>
            <h2 className={styles.promoHeadline}>
              Sign Up Now &amp; Get Upto{' '}
              <span className={styles.promoHighlight}>Rs. 1,500 Off</span>
            </h2>
            <p className={styles.promoSubtext}>On Your First Purchase</p>
            <div className={styles.couponBadge}>
              <span className={styles.couponIcon}>🎟️</span>
              HELLO1500
            </div>
          </div>
        </div>

        {/* ─── Form Section ─── */}
        <div className={styles.formSection}>
          <p className={styles.formTitle}>Sign Up Or Log In</p>

          <form onSubmit={handleContinue}>
            <div className={styles.inputGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Enter mobile number or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Mobile number or email"
              />
            </div>

            <button className={styles.continueButton} type="submit">
              Continue
            </button>
          </form>

          <p className={styles.termsText}>
            By continuing, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            .
          </p>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}
