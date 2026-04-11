import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

/**
 * GET /api/orders/:orderId
 * Fetch order details with items
 */
export async function GET(request, { params }) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const { orderId } = params

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('profile_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch order items with product image
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Fetch product images for each item
    if (orderItems?.length) {
      const productIds = orderItems.map(i => i.product_id).filter(Boolean)
      if (productIds.length) {
        const { data: products } = await supabase
          .from('products')
          .select('id, images, image_url')
          .in('id', productIds)
        const imgMap = {}
        for (const p of (products || [])) {
          imgMap[p.id] = p.image_url || (Array.isArray(p.images) ? (p.images[0]?.url || p.images[0]) : null) || null
        }
        for (const item of orderItems) {
          item.image = imgMap[item.product_id] || null
        }
      }
    }

    // Fetch delivery address if available
    let address = null
    if (order.address_id) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', order.address_id)
        .single()
      address = addressData
    }

    return NextResponse.json({
      order: {
        ...order,
        items: orderItems || []
      },
      address
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
