import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

const SHIPROCKET_CONFIGURED = !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)

/**
 * POST /api/shiprocket/create-order
 * Creates a Shiprocket shipment after payment is confirmed
 * Returns success in demo mode when Shiprocket is not configured
 */
export async function POST(request) {
  try {
    // If Shiprocket not configured, return demo response
    if (!SHIPROCKET_CONFIGURED) {
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: 'Shiprocket not configured — tracking will use demo data'
      })
    }

    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('profile_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status !== 'completed') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    if (order.shiprocket_order_id) {
      return NextResponse.json({
        success: true,
        message: 'Shiprocket order already exists',
        shiprocket_order_id: order.shiprocket_order_id
      })
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id)

    // Fetch address
    let address = null
    if (order.address_id) {
      const { data: addr } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', order.address_id)
        .single()
      address = addr
    }

    if (!address) {
      return NextResponse.json({ error: 'Delivery address not found' }, { status: 400 })
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    // Create Shiprocket order
    const { createShiprocketOrder } = await import('../../../../lib/shiprocket')
    const shiprocketResponse = await createShiprocketOrder({
      orderId: order.id,
      orderDate: new Date(order.created_at).toISOString().split('T')[0],
      customerName: profile?.full_name || address.full_name || 'Customer',
      customerEmail: profile?.email || user.email,
      customerPhone: profile?.phone || address.phone || '9999999999',
      address: `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}`,
      city: address.city,
      state: address.state,
      pincode: String(address.pincode),
      items: orderItems.map(item => ({
        name: item.name,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sku: `SKU-${item.product_id}`,
        weight: 0.5
      })),
      subtotal: order.total,
      paymentMethod: 'Prepaid'
    })

    // Update order with Shiprocket details
    await supabase
      .from('orders')
      .update({
        shiprocket_order_id: shiprocketResponse.order_id,
        shiprocket_shipment_id: shiprocketResponse.shipment_id,
        tracking_number: shiprocketResponse.awb_code || null,
        status: 'processing'
      })
      .eq('id', order_id)

    return NextResponse.json({
      success: true,
      shiprocket_order_id: shiprocketResponse.order_id,
      shipment_id: shiprocketResponse.shipment_id,
      awb_code: shiprocketResponse.awb_code
    })

  } catch (error) {
    console.error('Shiprocket create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shipping order' },
      { status: 500 }
    )
  }
}
