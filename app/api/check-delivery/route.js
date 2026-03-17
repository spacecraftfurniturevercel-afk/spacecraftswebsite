import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { pincode } = await request.json()

    // Validate pincode
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Check delivery availability
    const { data: deliveryZone, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('pincode', pincode)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Error checking delivery availability' },
        { status: 500 }
      )
    }

    // If zone not found or not available
    if (!deliveryZone || !deliveryZone.is_available) {
      return NextResponse.json({
        available: false,
        pincode,
        message: 'We don\'t deliver to this pincode yet, but you can request delivery!',
        suggestion: 'Submit a delivery request and we\'ll notify you when service becomes available.'
      })
    }

    // Calculate estimated delivery date
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + deliveryZone.delivery_days)

    return NextResponse.json({
      available: true,
      pincode,
      city: deliveryZone.city,
      state: deliveryZone.state,
      region: deliveryZone.region,
      shippingCost: parseFloat(deliveryZone.shipping_cost),
      freeShipping: deliveryZone.shipping_cost === 0,
      deliveryDays: deliveryZone.delivery_days,
      estimatedDate: deliveryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      codAvailable: deliveryZone.cod_available,
      place: `${deliveryZone.region}, ${deliveryZone.city}, ${deliveryZone.state}`,
      message: `Delivery available in ${deliveryZone.city} within ${deliveryZone.delivery_days} days`
    })
  } catch (error) {
    console.error('Delivery check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery availability' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode parameter required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data: deliveryZone } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('pincode', pincode)
      .eq('is_available', true)
      .single()

    if (!deliveryZone) {
      return NextResponse.json({
        available: false,
        pincode
      })
    }

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + deliveryZone.delivery_days)

    return NextResponse.json({
      available: true,
      pincode,
      city: deliveryZone.city,
      state: deliveryZone.state,
      deliveryDays: deliveryZone.delivery_days,
      estimatedDate: deliveryDate.toLocaleDateString('en-IN')
    })
  } catch (error) {
    console.error('Delivery check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery' },
      { status: 500 }
    )
  }
}
