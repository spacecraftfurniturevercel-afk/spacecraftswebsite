import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

/**
 * POST /api/shiprocket/webhook
 * Receives status updates from Shiprocket
 * Configure this URL in Shiprocket Dashboard → Settings → Webhooks
 */
export async function POST(request) {
  try {
    // Validate webhook token
    const webhookToken = request.headers.get('x-shiprocket-token')
    const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN

    if (expectedToken && webhookToken !== expectedToken) {
      return NextResponse.json({ error: 'Invalid webhook token' }, { status: 403 })
    }

    const payload = await request.json()
    const { order_id, current_status, awb, courier_name, etd, shipment_id } = payload

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // Extract our internal order ID from Shiprocket order ID (format: SF-{id})
    const internalOrderId = order_id.startsWith('SF-')
      ? order_id.replace('SF-', '')
      : order_id

    const supabase = createSupabaseRouteHandlerClient(request)

    // Map Shiprocket status to our order status
    const statusMap = {
      'NEW': 'processing',
      'READY TO SHIP': 'processing',
      'PICKUP SCHEDULED': 'processing',
      'PICKED UP': 'shipped',
      'IN TRANSIT': 'shipped',
      'OUT FOR DELIVERY': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RTO INITIATED': 'returned',
      'RTO DELIVERED': 'returned',
      'UNDELIVERED': 'failed_delivery'
    }

    const normalizedStatus = (current_status || '').toUpperCase().trim()
    const mappedStatus = statusMap[normalizedStatus] || 'processing'

    // Update order
    const updateData = {
      status: mappedStatus,
      shipping_status: current_status,
      updated_at: new Date().toISOString()
    }
    if (awb) updateData.tracking_number = awb
    if (courier_name) updateData.courier_name = courier_name
    if (etd) updateData.estimated_delivery = etd
    if (shipment_id) updateData.shiprocket_shipment_id = shipment_id

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', internalOrderId)

    if (error) {
      console.error('Webhook order update error:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Log the webhook event
    await supabase
      .from('shipping_events')
      .insert({
        order_id: internalOrderId,
        status: current_status,
        awb_code: awb,
        courier: courier_name,
        raw_payload: payload,
        created_at: new Date().toISOString()
      })
      .catch(() => {}) // Non-critical, ignore if table doesn't exist yet

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Shiprocket webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
