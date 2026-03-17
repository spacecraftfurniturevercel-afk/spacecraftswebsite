import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'
import { getTrackingDetails } from '../../../../lib/bigship'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

/**
 * Generate progressive mock tracking data based on order age
 */
function generateMockTracking(order) {
  const orderDate = new Date(order.created_at)
  const now = new Date()
  const hoursElapsed = (now - orderDate) / (1000 * 60 * 60)

  let status = 'Pickup Scheduled'
  const scanHistories = []
  const awb = order.tracking_number || `BS${String(order.id).padStart(8, '0')}`

  scanHistories.push({
    scan_datetime: formatDate(orderDate),
    scan_status: 'Pickup Scheduled',
    scan_remarks: 'Manifest Data Received',
    scan_location: 'Origin Hub',
  })

  if (hoursElapsed >= 6) {
    status = 'In-Transit'
    scanHistories.unshift({
      scan_datetime: formatDate(new Date(orderDate.getTime() + 6 * 60 * 60 * 1000)),
      scan_status: 'In-Transit',
      scan_remarks: 'Shipment picked up and in transit',
      scan_location: 'Origin Sorting Centre',
    })
  }

  if (hoursElapsed >= 24) {
    scanHistories.unshift({
      scan_datetime: formatDate(new Date(orderDate.getTime() + 24 * 60 * 60 * 1000)),
      scan_status: 'In-Transit',
      scan_remarks: 'Shipment in transit to destination city',
      scan_location: 'Transit Hub',
    })
  }

  if (hoursElapsed >= 48) {
    status = 'Out for Delivery'
    scanHistories.unshift({
      scan_datetime: formatDate(new Date(orderDate.getTime() + 48 * 60 * 60 * 1000)),
      scan_status: 'Out for Delivery',
      scan_remarks: 'Shipment out for delivery',
      scan_location: 'Local Delivery Hub',
    })
  }

  if (hoursElapsed >= 72) {
    status = 'Delivered'
    scanHistories.unshift({
      scan_datetime: formatDate(new Date(orderDate.getTime() + 72 * 60 * 60 * 1000)),
      scan_status: 'Delivered',
      scan_remarks: 'Shipment delivered successfully',
      scan_location: 'Destination',
    })
  }

  return {
    status,
    awb,
    courier: order.courier_name || 'BigShip Express',
    estimated_delivery: new Date(
      orderDate.getTime() + 5 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    current_location: scanHistories[0]?.scan_location || null,
    activities: scanHistories.map((s) => ({
      activity: s.scan_remarks,
      location: s.scan_location,
      date: s.scan_datetime,
      sr_status_label: s.scan_status,
    })),
  }
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`
}

/**
 * Map BigShip scan_status to the normalized status labels used by the app
 */
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

/**
 * GET /api/bigship/track?order_id=123
 * or  /api/bigship/track?awb=17079311845535
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const awb = searchParams.get('awb')

    if (!orderId && !awb) {
      return NextResponse.json({ error: 'order_id or awb required' }, { status: 400 })
    }

    const supabase = createSupabaseRouteHandlerClient(request)

    // Get order from DB
    let order = null
    if (orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
      order = data
    }

    // If BigShip not configured, return mock data
    if (!BIGSHIP_CONFIGURED) {
      const tracking = generateMockTracking(order || { id: orderId, created_at: new Date().toISOString() })
      return NextResponse.json({ tracking })
    }

    // Try real tracking
    const trackingAwb = awb || order?.tracking_number
    if (trackingAwb) {
      const result = await getTrackingDetails('awb', trackingAwb)
      if (result.success && result.data) {
        const orderDetail = result.data.order_detail || {}
        const scans = result.data.scan_histories || []

        const latestStatus = scans.length > 0
          ? mapBigShipStatus(scans[0].scan_status)
          : mapBigShipStatus(orderDetail.current_tracking_status)

        // Update order status in DB if we have the order
        if (order) {
          const statusMap = {
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
          const dbStatus = statusMap[latestStatus] || 'processing'
          await supabase
            .from('orders')
            .update({
              shipping_status: latestStatus,
              status: dbStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id)
        }

        return NextResponse.json({
          tracking: {
            status: latestStatus,
            awb: trackingAwb,
            courier: orderDetail.courier_name || order?.courier_name || 'BigShip',
            estimated_delivery: order?.estimated_delivery || null,
            current_location: scans[0]?.scan_location || null,
            activities: scans.map((s) => ({
              activity: s.scan_remarks,
              location: s.scan_location,
              date: s.scan_datetime,
              sr_status_label: s.scan_status,
            })),
          },
        })
      }
    }

    // Fallback to mock if no AWB yet
    const tracking = generateMockTracking(
      order || { id: orderId, created_at: new Date().toISOString() }
    )
    return NextResponse.json({ tracking })
  } catch (error) {
    console.error('BigShip track error:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 })
  }
}
