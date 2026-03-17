import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../../lib/supabaseClient'

/**
 * GET /api/admin/shipping/orders
 * Returns all orders for admin shipping management
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    let query = supabase
      .from('orders')
      .select('id, created_at, total, status, payment_status, payment_method, courier_name, tracking_number, shipping_status, bigship_order_id, shiprocket_order_id, estimated_delivery')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Admin orders error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Admin shipping orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
