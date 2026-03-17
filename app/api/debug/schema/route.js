import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('User found:', !!user)
    console.log('User ID:', user?.id)
    
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: userError
      }, { status: 401 })
    }
    
    // Get first address to see its structure
    const { data: firstAddress, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .limit(1)
      .single()
    
    // Check what columns exist
    const { data: addresses, error: checkError } = await supabase
      .from('addresses')
      .select('*')
      .limit(1)
    
    const columns = addresses && addresses.length > 0 ? Object.keys(addresses[0]) : []
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      addressTableColumns: columns,
      sampleAddress: firstAddress,
      errors: {
        addressError: addressError?.message,
        checkError: checkError?.message
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
