import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { product_id, pincode, contact, email } = await request.json()

    // Validate input
    if (!product_id || !pincode || !contact || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, pincode, contact, email' },
        { status: 400 }
      )
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode format' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number (basic check)
    if (!/^\d{10,}$/.test(contact.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Check if delivery zone exists to get city/state
    const { data: deliveryZone } = await supabase
      .from('delivery_zones')
      .select('city, state')
      .eq('pincode', pincode)
      .single()

    // Create delivery request
    const { data: request_data, error } = await supabase
      .from('delivery_requests')
      .insert([
        {
          product_id,
          pincode,
          contact_phone: contact,
          email,
          city: deliveryZone?.city || null,
          state: deliveryZone?.state || null,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create delivery request' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to user and admin
    // sendDeliveryRequestEmail(email, product_id, pincode)

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We\'ll notify you when delivery becomes available in your area.',
        request_id: request_data.id,
        pincode,
        email
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Delivery request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit delivery request' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const pincode = searchParams.get('pincode')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('delivery_requests')
      .select('*')
      .eq('email', email)
      .order('request_date', { ascending: false })

    if (pincode) {
      query = query.eq('pincode', pincode)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch delivery requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length
    })
  } catch (error) {
    console.error('Fetch delivery requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delivery requests' },
      { status: 500 }
    )
  }
}
