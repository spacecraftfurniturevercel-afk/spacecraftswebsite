import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../lib/supabaseClient'

// GET - Validate if pincode is available for delivery
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const postal_code = searchParams.get('postal_code')

    if (!postal_code) {
      return NextResponse.json({ error: 'Postal code is required' }, { status: 400 })
    }

    // Validate postal code format (6 digits)
    if (!/^[0-9]{6}$/.test(postal_code)) {
      return NextResponse.json({ error: 'Invalid postal code format. Must be 6 digits.' }, { status: 400 })
    }

    const supabase = createSupabaseRouteHandlerClient(request)

    // Check if postal code exists in delivery_zones
    const { data: deliveryZone, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('postal_code', postal_code)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking delivery zone:', error)
      return NextResponse.json({ error: 'Failed to validate pincode' }, { status: 500 })
    }

    if (deliveryZone) {
      // Pincode is available for delivery
      return NextResponse.json({
        success: true,
        available: true,
        deliveryInfo: {
          city: deliveryZone.city,
          state: deliveryZone.state,
          deliveryDays: deliveryZone.delivery_days || 5,
          shippingCharge: deliveryZone.shipping_charge || 0
        },
        message: 'Delivery available in your area'
      })
    } else {
      // Pincode not available
      return NextResponse.json({
        success: true,
        available: false,
        message: 'Delivery not available in this pincode. You can request delivery or continue without delivery.'
      })
    }
  } catch (error) {
    console.error('Pincode validation error:', error)
    return NextResponse.json({ error: 'An error occurred while validating pincode' }, { status: 500 })
  }
}

// POST - Request delivery for unavailable pincode
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { postal_code, city, state, full_name, phone, address } = body

    // Validate required fields
    if (!postal_code || !city || !state || !full_name || !phone || !address) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 })
    }

    // Check if delivery request already exists
    const { data: existingRequest } = await supabase
      .from('delivery_requests')
      .select('id, status')
      .eq('postal_code', postal_code)
      .eq('profile_id', profile.id)
      .single()

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: 'You have already requested delivery for this postal code',
        requestId: existingRequest.id,
        status: existingRequest.status
      })
    }

    // Create new delivery request
    const { data: newRequest, error } = await supabase
      .from('delivery_requests')
      .insert({
        profile_id: profile.id,
        email: profile.email || user.email,
        postal_code,
        city,
        state,
        full_name,
        phone,
        address,
        product_id: null, // No specific product for address-based request
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating delivery request:', error)
      return NextResponse.json({ error: 'Failed to create delivery request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery request submitted successfully. We will contact you soon.',
      requestId: newRequest.id
    })
  } catch (error) {
    console.error('Delivery request error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
