import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * POST /api/orders/cod
 * Place a Cash on Delivery order directly (no Razorpay).
 * Only available for products that have shipping dimensions.
 *
 * Body:
 *   product_id     – product being purchased
 *   quantity       – number of units
 *   address_id     – delivery address
 *   delivery_charge – COD delivery charge (from /api/delivery-charges)
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to place an order' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity = 1, address_id, delivery_charge = 0 } = body

    if (!product_id || !address_id) {
      return NextResponse.json({ error: 'product_id and address_id are required' }, { status: 400 })
    }

    // Fetch product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, discount_price, stock, shipping_weight, shipping_length, shipping_width, shipping_height, shipping_box_count')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only allow COD for products with shipping dimensions
    if (!product.shipping_length || !product.shipping_width || !product.shipping_height) {
      return NextResponse.json({ error: 'COD is not available for this product' }, { status: 400 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: `Only ${product.stock} items available` }, { status: 400 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify address belongs to this user
    const { data: address, error: addrErr } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', address_id)
      .eq('profile_id', profile.id)
      .single()

    if (addrErr || !address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    const unitPrice = product.discount_price || product.price
    const subtotal = unitPrice * quantity
    const gst = Math.round(subtotal * 0.18)
    const safeDeliveryCharge = Math.max(0, Math.round(Number(delivery_charge) || 0))
    const totalAmount = subtotal + gst + safeDeliveryCharge

    const adminSupabase = createSupabaseServerClient()

    // Create the order (confirmed immediately for COD)
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        profile_id: profile.id,
        address_id,
        subtotal,
        delivery_charge: safeDeliveryCharge,
        tax: gst,
        total: totalAmount,
        currency: 'INR',
        status: 'confirmed',
        payment_status: 'pending',
        payment_method: 'cod',
      })
      .select()
      .single()

    if (orderErr) {
      console.error('[cod] Order insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order item
    await adminSupabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      name: product.name,
      unit_price: unitPrice,
      quantity,
      shipping_weight: product.shipping_weight || null,
      shipping_length: product.shipping_length || null,
      shipping_width: product.shipping_width || null,
      shipping_height: product.shipping_height || null,
      shipping_box_count: product.shipping_box_count || 1,
    })

    // Auto-create BigShip shipment (non-blocking)
    try {
      const { createShipmentForOrder } = await import('../../../../lib/createShipment')
      const shipResult = await createShipmentForOrder(order.id, adminSupabase, { paymentMethod: 'COD' })
      console.log('[cod] BigShip shipment result for order', order.id, ':', shipResult)
    } catch (shipErr) {
      console.error('[cod] BigShip shipment creation failed (non-fatal):', shipErr.message)
      // Mark shipment error but don't fail the order
      try {
        await adminSupabase
          .from('orders')
          .update({ shipment_error: shipErr.message })
          .eq('id', order.id)
      } catch {}
    }

    // Send order confirmation email to customer + admin (non-blocking)
    ;(async () => {
      try {
        const { sendOrderConfirmationEmails } = await import('../../../../lib/email')
        await sendOrderConfirmationEmails({
          order: { ...order, payment_method: 'cod', payment_status: 'pending' },
          items: [{ name: product.name, quantity, unit_price: unitPrice }],
          address,
          customerName: profile.full_name || 'Customer',
          customerEmail: profile.email || '',
          customerPhone: address.phone || '',
        })
      } catch (emailErr) {
        console.warn('[cod] Failed to send confirmation email (non-fatal):', emailErr.message)
      }
    })()

    return NextResponse.json({
      success: true,
      order_id: order.id,
      total: totalAmount,
      payment_method: 'cod',
    }, { status: 201 })

  } catch (err) {
    console.error('[cod] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
