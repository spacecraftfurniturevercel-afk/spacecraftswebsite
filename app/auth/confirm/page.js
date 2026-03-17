'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '../../../lib/supabaseClient'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get('next') || '/account'

    // Wait for the client-side Supabase to detect the session from cookies
    // then hard-navigate so AuthProvider picks it up on mount
    const syncAndRedirect = async () => {
      try {
        // Force the browser client to read cookies and detect the session
        const { data } = await supabase.auth.getSession()
        if (!data?.session) {
          // If session not found yet, retry after a short delay
          await new Promise(r => setTimeout(r, 500))
          await supabase.auth.getSession()
        }
      } catch (e) {
        // ignore — redirect will still work
      }
      window.location.href = next
    }

    const timer = setTimeout(syncAndRedirect, 150)
    return () => clearTimeout(timer)
  }, [searchParams, router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #e5e7eb',
          borderTopColor: '#1a1a1a', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#666', fontSize: 14 }}>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
