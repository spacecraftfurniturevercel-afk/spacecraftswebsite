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
    let resolved = false

    const resolve = () => {
      if (resolved) return
      resolved = true
      window.location.href = next
    }

    if (!supabase) {
      setTimeout(resolve, 200)
      return
    }

    // Listen for SIGNED_IN event — most reliable indicator after OAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        subscription.unsubscribe()
        resolve()
      }
    })

    // Also check immediately in case session is already in cookies
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        subscription.unsubscribe()
        resolve()
      }
    }).catch(() => {})

    // Fallback: navigate after 4 seconds regardless
    const fallback = setTimeout(() => {
      subscription?.unsubscribe()
      resolve()
    }, 4000)

    return () => {
      clearTimeout(fallback)
      subscription?.unsubscribe()
    }
  }, [searchParams])

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
