import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * GET /api/admin/orders
 * Returns full order details for admin: items, address, customer, payment
 */
export async function GET(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL_2
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')))
    const status = searchParams.get('status')
    const payment_status = searchParams.get('payment_status')
    const search = searchParams.get('search')

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('orders')
      .select(`
        id, created_at, status, payment_status, payment_method,
        razorpay_order_id, razorpay_payment_id,
        subtotal, tax, delivery_charge, total, currency,
        shipping_status, courier_name, tracking_number, estimated_delivery,
        bigship_order_id,
        profile_id,
        order_items (
          id, name, quantity, unit_price,
          product_id
        ),
        addresses (
          name, line1, line2, city, state, postal_code, country, phone
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) query = query.eq('status', status)
    if (payment_status) query = query.eq('payment_status', payment_status)

    const { data: orders, error, count } = await query
    if (error) {
      console.error('[admin/orders] DB error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Fetch profiles for all unique profile_ids
    const profileIds = [...new Set(orders.filter(o => o.profile_id).map(o => o.profile_id))]
    let profileMap = {}
    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', profileIds)
      profiles?.forEach(p => { profileMap[p.id] = p })
    }

    const enriched = orders.map(order => ({
      ...order,
      customer: order.profile_id ? profileMap[order.profile_id] || null : null,
    }))

    // If search query, filter in memory (by order id, customer name, email, phone)
    let filtered = enriched
    if (search) {
      const q = search.toLowerCase()
      filtered = enriched.filter(o =>
        String(o.id).includes(q) ||
        o.customer?.full_name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q) ||
        o.addresses?.city?.toLowerCase().includes(q) ||
        o.razorpay_payment_id?.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({
      orders: filtered,
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('[admin/orders] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/orders
 * Update order status
 */
export async function PATCH(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL_2
    if (!isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

    const allowed = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
