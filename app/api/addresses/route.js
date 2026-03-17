import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../lib/supabaseClient'

// Helper function to get or create profile
async function getOrCreateProfile(supabase, user) {
  try {
    // Try to get existing profile using authenticated client
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profile) {
      console.log('Profile found:', profile.id)
      return profile
    }

    // If we got a different error (not "no rows"), throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
      throw fetchError
    }

    // Profile doesn't exist, create it using service role (bypasses RLS)
    console.log('Creating new profile for user:', user.id, user.email)
    
    const adminClient = createSupabaseServerClient()
    
    const { data: newProfile, error: createError } = await adminClient
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      }])
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      throw new Error(`Failed to create user profile: ${createError.message}`)
    }

    console.log('Profile created successfully:', newProfile.id)
    return newProfile
  } catch (error) {
    console.error('getOrCreateProfile error:', error)
    throw error
  }
}

// GET - Fetch all addresses for user
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('GET /api/addresses - User:', user.email)

    // Get or create profile
    const profile = await getOrCreateProfile(supabase, user)

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', profile.id)
      .order('is_default', { ascending: false })
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, addresses: addresses || [] })
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get or create profile
    const profile = await getOrCreateProfile(supabase, user)

    const body = await request.json()
    const { label, phone, line1, line2, city, state, postal_code, country, is_default } = body

    if (!label || !phone || !line1 || !city || !state || !postal_code) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('profile_id', profile.id)
    }

    const { data: newAddress, error } = await supabase
      .from('addresses')
      .insert([{ profile_id: profile.id, label, phone, line1, line2: line2 || null, city, state, postal_code, country: country || 'India', is_default: is_default || false }])
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, address: newAddress })
  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get or create profile
    const profile = await getOrCreateProfile(supabase, user)

    const body = await request.json()
    const { id, label, phone, line1, line2, city, state, postal_code, country, is_default } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    if (is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('profile_id', profile.id).neq('id', id)
    }

    const { data: updated, error } = await supabase
      .from('addresses')
      .update({ label, phone, line1, line2: line2 || null, city, state, postal_code, country, is_default })
      .eq('id', id)
      .eq('profile_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, address: updated })
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete address
export async function DELETE(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get or create profile
    const profile = await getOrCreateProfile(supabase, user)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    const { error } = await supabase.from('addresses').delete().eq('id', id).eq('profile_id', profile.id)

    if (error) {
      console.error('Error deleting address:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Address deleted' })
  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
