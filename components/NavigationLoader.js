'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const prevUrl = useRef('')
  const timeoutRef = useRef(null)

  // Build current URL string for comparison
  const currentUrl = pathname + (searchParams?.toString() ? '?' + searchParams.toString() : '')

  // Detect clicks on links/buttons that trigger navigation
  const handleClick = useCallback((e) => {
    const anchor = e.target.closest('a[href]')
    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') return

    // Navigation is happening — show loader after a small delay to avoid flash on fast loads
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setLoading(true), 150)
  }, [])

  // Intercept router.push via monkey-patching history.pushState
  useEffect(() => {
    const origPush = history.pushState.bind(history)
    const origReplace = history.replaceState.bind(history)

    const intercept = (orig) => function(...args) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setLoading(true), 150)
      return orig.apply(this, args)
    }

    history.pushState = intercept(origPush)
    history.replaceState = intercept(origReplace)

    return () => {
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  // Hide loader when URL changes (navigation complete)
  useEffect(() => {
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setLoading(false)
    }
    prevUrl.current = currentUrl
  }, [currentUrl])

  // Listen for link clicks
  useEffect(() => {
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [handleClick])

  // Safety: auto-hide after 8s max
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setLoading(false), 8000)
    return () => clearTimeout(t)
  }, [loading])

  if (!loading) return null

  return (
    <div className="nav-loader-overlay">
      <div className="nav-loader-content">
        <div className="nav-loader-spinner" />
        <span className="nav-loader-text">Loading...</span>
      </div>

      <style jsx>{`
        .nav-loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(2px);
          animation: nav-fade-in 0.15s ease;
        }
        .nav-loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          background: #fff;
          padding: 32px 44px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
        }
        .nav-loader-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid #f0f0f0;
          border-top-color: #e67e22;
          border-radius: 50%;
          animation: nav-spin 0.7s linear infinite;
        }
        .nav-loader-text {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        @keyframes nav-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nav-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
