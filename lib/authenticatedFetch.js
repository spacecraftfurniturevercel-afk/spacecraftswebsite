// Helper function to make authenticated API calls
export async function authenticatedFetch(url, options = {}) {
  try {
    const { supabase } = await import('./supabaseClient')
    
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Get the current session with a 5-second timeout to prevent hanging
    let session = null
    try {
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 5000))
      ])
      session = sessionResult?.data?.session
    } catch (sessionErr) {
      console.warn('getSession failed or timed out:', sessionErr.message)
    }
    
    // Prepare headers
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    }
    
    // Add authorization header if session exists
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    // Make the request (pass through signal for AbortController support)
    return fetch(url, {
      ...options,
      headers,
      signal: options.signal
    })
  } catch (error) {
    console.error('Authenticated fetch error:', error)
    throw error
  }
}
