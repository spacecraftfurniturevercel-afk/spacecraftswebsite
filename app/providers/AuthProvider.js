'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session on mount
    const checkAuth = async () => {
      try {
        if (!supabase) {
          setLoading(false)
          return
        }
        // Timeout after 5s to prevent infinite loading if token refresh hangs
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timeout')), 5000))
        ])
        const session = result?.data?.session
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    if (!supabase) return

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    // Re-check auth when tab becomes visible (handles OAuth redirect return)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && !user) {
            setUser(session.user)
            fetchProfile(session.user.id)
          } else if (!session?.user && user) {
            setUser(null)
            setProfile(null)
          }
        }).catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else if (error?.code === 'PGRST116') {
        // Create profile if it doesn't exist (PGRST116 = no rows returned)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const profileData = {
              id: userId,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || ''
            }
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([profileData])
              .select()
              .single()
            
            if (!insertError && newProfile) {
              setProfile(newProfile)
              console.log('Profile created successfully for user:', userId)
            } else if (insertError) {
              console.error('Error creating profile:', insertError)
            }
          }
        } catch (createError) {
          console.error('Profile creation error:', createError)
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const signInWithGoogle = async () => {
    const redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = redirectOrigin ? `${redirectOrigin}/auth/callback` : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
