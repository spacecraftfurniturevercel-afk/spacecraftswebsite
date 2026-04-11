import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'
import { SHIPPING_DEFAULTS } from '../../../../lib/bigship'

/**
 * GET /api/admin/debug-order?id=53
 * Shows exactly what dims/weight createShipment would send to BigShip for an order.
 * Useful for diagnosing rate discrepancies.
 */
export async function GET(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const isAdmin = user.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL_2 || user.email?.includes('@admin')
    if (!isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    if (!orderId) return NextResponse.json({ error: 'id param required' }, { status: 400 })

    const supabase = createSupabaseServerClient()

    // Fetch order
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Fetch order_items
    const { data: orderItems } = await supabase.from('order_items').select('*').eq('order_id', orderId)

    // Back-fill from products (same logic as createShipment.js)
    const itemsMissingDims = (orderItems || []).filter(
      item => !item.shipping_weight || !item.shipping_length || !item.shipping_width || !item.shipping_height
    )

    let enrichedItems = orderItems || []
    let backfilledFromProducts = false

    if (itemsMissingDims.length > 0) {
      const productIds = itemsMissingDims.map(i => i.product_id).filter(Boolean)
      const { data: products } = await supabase
        .from('products')
        .select('id, name, shipping_weight, shipping_length, shipping_width, shipping_height, shipping_box_count')
        .in('id', productIds)

      const productMap = {}
      for (const p of (products || [])) productMap[p.id] = p

      enrichedItems = enrichedItems.map(item => {
        const prod = productMap[item.product_id]
        if (!prod) return { ...item, _source: 'order_items_only' }
        const filled = {
          ...item,
          shipping_weight:    item.shipping_weight    ?? prod.shipping_weight,
          shipping_length:    item.shipping_length    ?? prod.shipping_length,
          shipping_width:     item.shipping_width     ?? prod.shipping_width,
          shipping_height:    item.shipping_height    ?? prod.shipping_height,
          shipping_box_count: item.shipping_box_count ?? prod.shipping_box_count,
          _product_dims: {
            shipping_weight: prod.shipping_weight,
            shipping_length: prod.shipping_length,
            shipping_width:  prod.shipping_width,
            shipping_height: prod.shipping_height,
          },
        }
        const usedFromProduct = !item.shipping_weight || !item.shipping_length || !item.shipping_width || !item.shipping_height
        filled._source = usedFromProduct ? 'backfilled_from_product' : 'order_items'
        return filled
      })
      backfilledFromProducts = true
    }

    // Calculate what would actually be sent to BigShip
    const totalWeight = enrichedItems.reduce(
      (w, item) => w + (item.shipping_weight || SHIPPING_DEFAULTS.DEAD_WEIGHT) * item.quantity, 0
    )
    const maxLength = Math.max(...enrichedItems.map(i => i.shipping_length || SHIPPING_DEFAULTS.LENGTH))
    const maxWidth  = Math.max(...enrichedItems.map(i => i.shipping_width  || SHIPPING_DEFAULTS.WIDTH))
    const maxHeight = Math.max(...enrichedItems.map(i => i.shipping_height || SHIPPING_DEFAULTS.HEIGHT))

    const volumetricWeight = (maxLength * maxWidth * maxHeight) / 5000
    const billableWeight   = Math.max(totalWeight, volumetricWeight)

    const wouldUseFallback = enrichedItems.some(i => !i.shipping_weight || !i.shipping_length || !i.shipping_width || !i.shipping_height)

    return NextResponse.json({
      order_id: orderId,
      order_status: order.status,
      bigship_order_id: order.bigship_order_id || null,
      shipment_error: order.shipment_error || null,
      backfilled_from_products: backfilledFromProducts,
      would_use_fallback_dims: wouldUseFallback,
      what_bigship_would_receive: {
        total_dead_weight_kg: totalWeight,
        length_cm: maxLength,
        width_cm: maxWidth,
        height_cm: maxHeight,
        volumetric_weight_kg: Math.round(volumetricWeight * 100) / 100,
        billable_weight_kg: Math.round(billableWeight * 100) / 100,
      },
      defaults_used_as_fallback: {
        DEAD_WEIGHT: SHIPPING_DEFAULTS.DEAD_WEIGHT,
        LENGTH: SHIPPING_DEFAULTS.LENGTH,
        WIDTH: SHIPPING_DEFAULTS.WIDTH,
        HEIGHT: SHIPPING_DEFAULTS.HEIGHT,
      },
      items: enrichedItems.map(i => ({
        name: i.name,
        product_id: i.product_id,
        quantity: i.quantity,
        shipping_weight: i.shipping_weight,
        shipping_length: i.shipping_length,
        shipping_width:  i.shipping_width,
        shipping_height: i.shipping_height,
        _source: i._source,
        _product_dims: i._product_dims,
      })),
    })
  } catch (err) {
    console.error('[debug-order]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
