import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'
import { createShipmentForOrder } from '../../../../lib/createShipment'

/**
 * POST /api/bigship/create-order
 * Manually (re-)creates a BigShip shipment for a confirmed order.
 * Used by admin or as a retry if the auto-trigger from verify-payment failed.
 *
 * Full flow (delegated to lib/createShipment.js):
 *   1. Add Order → system_order_id
 *   2. Get Rates → cheapest courier_id
 *   3. Manifest  → confirms booking
 *   4. Get AWB   → master_awb (tracking number)
 *   5. Save to DB: bigship_order_id, courier_id, tracking_number, courier_name, shipping_status
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id } = await request.json()
    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    // Validate this order belongs to the user and payment is complete
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, payment_status, status, profile_id, bigship_order_id')
      .eq('id', order_id)
      .eq('profile_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const paymentOk = ['completed', 'paid'].includes(order.payment_status)
    const statusOk = ['confirmed', 'processing', 'shipped'].includes(order.status)
    if (!paymentOk && !statusOk) {
      return NextResponse.json({ error: 'Payment not completed for this order' }, { status: 400 })
    }

    // Use shared function (handles idempotency — won't re-create if already exists)
    const result = await createShipmentForOrder(order_id, supabase)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[bigship/create-order] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shipping order' },
      { status: 500 }
    )
  }
}


