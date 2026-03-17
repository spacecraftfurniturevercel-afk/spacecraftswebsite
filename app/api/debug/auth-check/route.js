import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'No user found',
        authError: authError
      }, { status: 401 })
    }

    // 2. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: null,
        profileError: profileError.message
      }, { status: 200 })
    }

    // 3. Check addresses table schema and data
    const { data: addressesSchema, error: schemaError } = await supabase
      .from('addresses')
      .select('*')
      .limit(1)

    const { data: userAddresses, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .limit(5)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      },
      addressesInfo: {
        schema: addressesSchema ? Object.keys(addressesSchema[0] || {}) : [],
        sampleData: userAddresses || [],
        error: addressError?.message
      },
      message: 'Auth check successful'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error.message
    }, { status: 500 })
  }
}
