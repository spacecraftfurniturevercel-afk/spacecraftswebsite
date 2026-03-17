import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-placeholder'

// Create browser client for client-side operations
let supabase = null
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  // provide a minimal stub in browser during development when env not set
  supabase = {
    auth: {
      async signInWithPassword() { throw new Error('Supabase not configured') },
      async signInWithOAuth() { throw new Error('Supabase not configured') },
      getUser: async () => ({ data: { user: null } })
    },
    from: () => ({ select: async () => ({ data: [] }) })
  }
}

export { supabase }

// server-side helper using service role key (use only in server code for admin operations)
export function createSupabaseServerClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role key or URL not configured')
  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  })
}

// server-side helper for authenticated API routes (reads from cookies)
export function createSupabaseRouteHandlerClient(request) {
  const { createClient } = require('@supabase/supabase-js')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) throw new Error('Supabase URL or anon key not configured')
  
  // Extract the auth token from cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = {}
  
  if (cookieHeader) {
    const cookiePairs = cookieHeader.split(';')
    cookiePairs.forEach(pair => {
      const [nameWithPart, ...rest] = pair.split('=')
      const trimmedName = nameWithPart.trim()
      const trimmedValue = rest.join('=').trim()
      
      if (!trimmedName) return
      
      // Handle split cookies
      const baseMatch = trimmedName.match(/^(.+)\.\d+$/)
      if (baseMatch) {
        const baseName = baseMatch[1]
        if (!cookies[baseName]) {
          cookies[baseName] = ''
        }
        cookies[baseName] += trimmedValue
      } else {
        cookies[trimmedName] = trimmedValue
      }
    })
  }
  
  // Get the auth token and decode it
  const authTokenEncoded = cookies['sb-oduvaeykaeabnpmyliut-auth-token']
  let authToken = null
  
  if (authTokenEncoded) {
    try {
      const decoded = decodeURIComponent(authTokenEncoded)
      authToken = JSON.parse(decoded)
    } catch (e) {
      console.error('Failed to parse auth token:', e)
    }
  }

  // Fallback: read from Authorization header if cookie auth failed
  let bearerToken = null
  if (!authToken?.access_token) {
    const authHeader = request.headers.get('authorization') || ''
    if (authHeader.startsWith('Bearer ')) {
      bearerToken = authHeader.slice(7)
    }
  }

  const accessToken = authToken?.access_token || bearerToken || ''
  
  // Create a Supabase client with the access token
  const supabaseClient = createClient(url, key, {
    global: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  })
  
  // Override getUser to use the token we extracted
  supabaseClient.auth.getUser = async () => {
    // If we have user from cookie, use it
    if (authToken?.user) {
      return { data: { user: authToken.user }, error: null }
    }
    // If we have a bearer token, fetch user from Supabase
    if (bearerToken) {
      try {
        const { data, error } = await createClient(url, key, {
          global: { headers: { Authorization: `Bearer ${bearerToken}` } }
        }).auth.getUser(bearerToken)
        if (data?.user) return { data: { user: data.user }, error: null }
      } catch (e) {
        console.error('Failed to get user from bearer token:', e)
      }
    }
    return { 
      data: { user: null }, 
      error: { message: 'Auth session missing!' }
    }
  }
  
  return supabaseClient
}
