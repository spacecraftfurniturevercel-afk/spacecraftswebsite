import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendShippingStatusEmail, sendDeliveryConfirmedEmails } from '../../../../lib/email'

// Use service-role client since webhooks don't carry user auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function mapBigShipStatus(scanStatus) {
  const s = (scanStatus || '').toLowerCase()
  if (s.includes('delivered') && !s.includes('rto') && !s.includes('undelivered')) return 'DELIVERED'
  if (s.includes('out for delivery')) return 'OUT FOR DELIVERY'
  if (s.includes('in-transit') || s.includes('in transit')) return 'IN TRANSIT'
  if (s.includes('not picked')) return 'NOT PICKED'
  if (s.includes('pickup scheduled')) return 'PICKUP SCHEDULED'
  if (s.includes('cancelled')) return 'CANCELLED'
  if (s.includes('rto in transit')) return 'RTO INITIATED'
  if (s.includes('rto delivered')) return 'RTO DELIVERED'
  if (s.includes('undelivered')) return 'UNDELIVERED'
  if (s.includes('lost')) return 'LOST'
  return scanStatus?.toUpperCase() || 'NEW'
}

const statusToDbStatus = {
  'DELIVERED': 'delivered',
  'OUT FOR DELIVERY': 'shipped',
  'IN TRANSIT': 'shipped',
  'PICKUP SCHEDULED': 'processing',
  'CANCELLED': 'cancelled',
  'RTO INITIATED': 'returned',
  'RTO DELIVERED': 'returned',
  'UNDELIVERED': 'failed_delivery',
  'LOST': 'failed_delivery',
}

/**
 * POST /api/bigship/webhook
 * BigShip sends tracking updates here when shipment status changes.
 * Verify using the access key header.
 */
export async function POST(request) {
  try {
    const body = await request.json()

    // Verify webhook authenticity via access key
    const accessKey = request.headers.get('x-bigship-access-key') || request.headers.get('access-key')
    const expectedKey = process.env.BIGSHIP_ACCESS_KEY
    if (expectedKey && accessKey && accessKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const awb = body.awb || body.awb_number || body.tracking_number
    const scanStatus = body.scan_status || body.status || body.current_status
    const scanLocation = body.scan_location || body.location || ''
    const scanRemarks = body.scan_remarks || body.remarks || body.description || ''

    if (!awb || !scanStatus) {
      return NextResponse.json({ error: 'awb and scan_status required' }, { status: 400 })
    }

    const normalizedStatus = mapBigShipStatus(scanStatus)
    const dbStatus = statusToDbStatus[normalizedStatus] || 'processing'

    // Find order by tracking number
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_number', awb)
      .single()

    if (orderErr || !order) {
      console.warn('Webhook: order not found for AWB', awb)
      return NextResponse.json({ ok: true, message: 'AWB not matched' })
    }

    const previousStatus = order.shipping_status
    const statusChanged = previousStatus !== normalizedStatus

    // Update order status
    await supabase
      .from('orders')
      .update({
        shipping_status: normalizedStatus,
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    // Log shipping event
    await supabase.from('shipping_events').insert({
      order_id: order.id,
      status: normalizedStatus,
      description: scanRemarks || `Status: ${normalizedStatus}`,
      location: scanLocation || null,
      raw_data: JSON.stringify({ previous: previousStatus, webhook: body }),
    })

    // Send email notification on status change
    if (statusChanged) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', order.user_id)
        .single()

      const customerEmail = profile?.email || order.email
      const customerName = profile?.full_name || order.customer_name

      if (customerEmail) {
        if (normalizedStatus === 'DELIVERED') {
          sendDeliveryConfirmedEmails({
            order,
            awb,
            courierName: order.courier_name,
            customerName,
            customerEmail,
          }).catch(err => console.error('Webhook delivery email error:', err))
        } else {
          sendShippingStatusEmail({
            order,
            status: normalizedStatus,
            awb,
            courierName: order.courier_name,
            customerName,
            customerEmail,
            scanLocation,
            scanRemarks,
          }).catch(err => console.error('Webhook status email error:', err))
        }
      }
    }

    return NextResponse.json({
      ok: true,
      status_changed: statusChanged,
      previous: previousStatus,
      current: normalizedStatus,
    })
  } catch (error) {
    console.error('BigShip webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
