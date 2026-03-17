import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../lib/supabaseClient'

/**
 * GET /api/orders
 * Fetch all orders for the logged-in user
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    // Fetch all orders for this user, newest first
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Fetch order items for all orders
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id)
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)

      // Attach items to their orders
      for (const order of orders) {
        order.items = (allItems || []).filter(item => item.order_id === order.id)
      }
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Error in orders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
