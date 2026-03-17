import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { coupon_code } = await request.json()

    if (!coupon_code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    // Validate coupon code (only HOLIDAY20 is valid)
    if (coupon_code.toUpperCase() !== 'HOLIDAY20') {
      return NextResponse.json({ 
        error: 'Invalid coupon code',
        success: false 
      }, { status: 400 })
    }

    // Check if user has any completed orders (first-time order check)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')

    if (ordersError) {
      console.error('Error checking orders:', ordersError)
      return NextResponse.json({ 
        error: 'Failed to validate coupon',
        success: false 
      }, { status: 500 })
    }

    // If user has completed orders, coupon is not valid
    if (orders && orders.length > 0) {
      return NextResponse.json({ 
        error: 'This coupon is only valid for first-time orders',
        success: false 
      }, { status: 400 })
    }

    // Coupon is valid
    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon_code: 'HOLIDAY20',
      discount_percentage: 10
    })

  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ 
      error: 'An error occurred while applying coupon',
      success: false 
    }, { status: 500 })
  }
}
