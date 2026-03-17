"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    const redirect = setTimeout(() => {
      router.replace('/')
    }, 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [router])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#222', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.125rem', color: '#555', marginTop: '0.75rem' }}>
        This page could not be found.
      </p>
      <p style={{ fontSize: '0.95rem', color: '#888', marginTop: '0.5rem' }}>
        Redirecting to homepage in <strong style={{ color: '#e67e22' }}>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
      </p>
      <Link
        href="/"
        style={{
          marginTop: '1.5rem',
          padding: '0.6rem 1.5rem',
          background: '#222',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'background 0.2s'
        }}
      >
        Go to Homepage
      </Link>
    </div>
  )
}
