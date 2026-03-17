// Helper function to make authenticated API calls
export async function authenticatedFetch(url, options = {}) {
  try {
    const { supabase } = await import('./supabaseClient')
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
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
