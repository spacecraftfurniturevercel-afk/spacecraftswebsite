import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'
import { createBigShipOrder, getShippingRates, manifestSingleOrder, getAWB } from '../../../../lib/bigship'
import { sendShipmentCreatedEmails } from '../../../../lib/email'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY &&
  process.env.BIGSHIP_PICKUP_WAREHOUSE_ID
)

/**
 * POST /api/bigship/create-order
 * Creates a BigShip shipment after payment is confirmed.
 * Automatically adds order, fetches best rate, and manifests.
 */
export async function POST(request) {
  try {
    if (!BIGSHIP_CONFIGURED) {
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: 'BigShip not configured — tracking will use demo data',
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

    const paymentOk = ['completed', 'paid'].includes(order.payment_status)
    const statusOk = ['confirmed', 'processing', 'shipped'].includes(order.status)
    if (!paymentOk && !statusOk) {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    if (order.bigship_order_id) {
      return NextResponse.json({
        success: true,
        message: 'BigShip order already exists',
        bigship_order_id: order.bigship_order_id,
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

    const fullName = profile?.full_name || address.full_name || 'Customer'
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer'

    // Step 1: Add order to BigShip
    const addOrderResult = await createBigShipOrder({
      orderId: order.id,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: profile?.email || user.email,
      customerPhone: profile?.phone || address.phone || '9999999999',
      addressLine1: address.line1 || address.address_line1 || '',
      addressLine2: address.line2 || address.address_line2 || '',
      landmark: address.landmark || '',
      pincode: String(address.postal_code || address.pincode),
      items: orderItems.map((item) => ({
        name: item.name,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        weight: item.weight || 5,
        hsn: item.hsn || '',
      })),
      totalAmount: order.total,
      paymentMethod: 'Prepaid',
    })

    if (!addOrderResult.success) {
      console.error('BigShip add order failed:', addOrderResult)
      return NextResponse.json(
        { error: addOrderResult.message || 'Failed to create BigShip order' },
        { status: 500 }
      )
    }

    // Extract system_order_id from response e.g. "system_order_id is 1000252960"
    const systemOrderIdMatch = addOrderResult.data?.match?.(/system_order_id is (\d+)/)
    const systemOrderId = systemOrderIdMatch ? systemOrderIdMatch[1] : addOrderResult.data

    // Step 2: Get shipping rates to pick cheapest courier
    let courierId = null
    let courierName = null
    let shippingCost = null
    try {
      const ratesResult = await getShippingRates('B2C', systemOrderId)
      if (ratesResult.success && ratesResult.data?.length > 0) {
        const cheapest = ratesResult.data.reduce((a, b) =>
          a.total_shipping_charges < b.total_shipping_charges ? a : b
        )
        courierId = cheapest.courier_id
        courierName = cheapest.courier_name
        shippingCost = cheapest.total_shipping_charges
      }
    } catch (e) {
      console.warn('Could not fetch BigShip rates, will manifest without courier_id:', e.message)
    }

    // Step 3: Manifest order with the best courier
    let manifestResult = null
    try {
      manifestResult = await manifestSingleOrder(systemOrderId, courierId)
    } catch (e) {
      console.warn('BigShip manifest failed:', e.message)
    }

    // Step 4: Get AWB number
    let awbCode = null
    let masterAwb = null
    try {
      const awbResult = await getAWB(systemOrderId)
      if (awbResult.success && awbResult.data) {
        awbCode = awbResult.data.master_awb || null
        courierName = awbResult.data.courier_name || courierName
      }
    } catch (e) {
      console.warn('Could not fetch AWB:', e.message)
    }

    // Update order in DB
    await supabase
      .from('orders')
      .update({
        bigship_order_id: systemOrderId,
        tracking_number: awbCode || null,
        courier_name: courierName || 'BigShip',
        shipping_status: manifestResult?.success ? 'manifested' : 'order_placed',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    // Log shipping event
    try {
      await supabase
        .from('shipping_events')
        .insert({
          order_id: order_id,
          status: 'ORDER_PLACED',
          awb_code: awbCode,
          courier: courierName,
          raw_payload: { addOrderResult, manifestResult, shippingCost },
          created_at: new Date().toISOString(),
        })
    } catch (e) {
      console.warn('Could not log shipping event:', e.message)
    }

    // Send shipment created emails to customer & admin (non-blocking)
    const emailTo = profile?.email || user.email
    console.log('[create-order] Sending shipment emails to:', emailTo, 'admin:', 'anandanathurelangovan94@gmail.com')
    sendShipmentCreatedEmails({
      order,
      awb: awbCode,
      courierName: courierName || 'BigShip',
      shippingCost,
      systemOrderId,
      customerName: fullName,
      customerEmail: emailTo,
    }).then((results) => {
      console.log('[create-order] Email results:', JSON.stringify(results))
    }).catch((e) => console.error('[create-order] Shipment email error:', e))

    return NextResponse.json({
      success: true,
      bigship_order_id: systemOrderId,
      awb_code: awbCode,
      courier: courierName,
      shipping_cost: shippingCost,
    })
  } catch (error) {
    console.error('BigShip create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shipping order' },
      { status: 500 }
    )
  }
}
