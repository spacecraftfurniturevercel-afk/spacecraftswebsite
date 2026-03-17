import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    
    // Get the raw cookie data
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      message: 'Detailed auth debug',
      cookieHeaderLength: cookieHeader.length,
      hasAuthCookie: cookieHeader.includes('sb-'),
      userFound: !!user,
      user: user ? {
        id: user.id,
        email: user.email
      } : null,
      userError: userError ? {
        message: userError.message,
        name: userError.name,
        status: userError.status
      } : null,
      rawCookieStart: cookieHeader.substring(0, 100)
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
