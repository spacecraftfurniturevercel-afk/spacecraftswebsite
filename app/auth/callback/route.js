import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const cookieStore = cookies()
    const cookiesToSet = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookiesToSet.push({ name, value, options })
          },
          remove(name, options) {
            cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect through confirm page which does a client-side reload
      // to ensure cookies are fully synced with the browser
      const confirmUrl = new URL(`/auth/confirm?next=${encodeURIComponent(next)}`, origin)
      const response = NextResponse.redirect(confirmUrl)
      // Explicitly set auth cookies on the redirect response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }

    console.error('Auth callback code exchange error:', error.message)
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
