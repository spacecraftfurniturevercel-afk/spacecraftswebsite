import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

const SHIPROCKET_CONFIGURED = !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)

/**
 * Generate realistic mock tracking data based on order age
 */
function generateMockTracking(order) {
  const orderDate = new Date(order.created_at)
  const now = new Date()
  const hoursElapsed = (now - orderDate) / (1000 * 60 * 60)

  // Simulate progression based on time since order
  let status = 'NEW'
  let currentLocation = null
  const activities = []
  const awb = `SF${String(order.id).padStart(8, '0')}${Date.now().toString().slice(-4)}`
  const courier = 'Spacecrafts Express'

  // Order placed (always)
  activities.push({
    activity: 'Order placed successfully',
    location: 'Online',
    date: orderDate.toISOString(),
    sr_status_label: 'Order Placed'
  })

  if (hoursElapsed >= 0.5) {
    // 30 min+ → Order confirmed & being packed
    status = 'READY TO SHIP'
    const t = new Date(orderDate.getTime() + 30 * 60 * 1000)
    activities.unshift({
      activity: 'Order confirmed and being packed',
      location: 'Warehouse - Mumbai',
      date: t.toISOString(),
      sr_status_label: 'Ready to Ship'
    })
  }

  if (hoursElapsed >= 2) {
    // 2 hrs+ → Pickup scheduled
    status = 'PICKUP SCHEDULED'
    const t = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Pickup scheduled with courier partner',
      location: 'Warehouse - Mumbai',
      date: t.toISOString(),
      sr_status_label: 'Pickup Scheduled'
    })
  }

  if (hoursElapsed >= 6) {
    // 6 hrs+ → Picked up
    status = 'PICKED UP'
    const t = new Date(orderDate.getTime() + 6 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Shipment picked up by courier',
      location: 'Mumbai Hub',
      date: t.toISOString(),
      sr_status_label: 'Picked Up'
    })
  }

  if (hoursElapsed >= 24) {
    // 1 day+ → In transit
    status = 'IN TRANSIT'
    currentLocation = 'Delhi Sorting Center'
    const t = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Shipment in transit to destination city',
      location: 'Delhi Sorting Center',
      date: t.toISOString(),
      sr_status_label: 'In Transit'
    })
  }

  if (hoursElapsed >= 48) {
    // 2 days+ → Reached destination hub
    status = 'REACHED AT DESTINATION HUB'
    currentLocation = 'Local Delivery Hub'
    const t = new Date(orderDate.getTime() + 48 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Shipment arrived at destination hub',
      location: 'Local Delivery Hub',
      date: t.toISOString(),
      sr_status_label: 'Reached Destination'
    })
  }

  if (hoursElapsed >= 60) {
    // 2.5 days+ → Out for delivery
    status = 'OUT FOR DELIVERY'
    currentLocation = 'Near delivery address'
    const t = new Date(orderDate.getTime() + 60 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Shipment out for delivery',
      location: 'Local Delivery Area',
      date: t.toISOString(),
      sr_status_label: 'Out for Delivery'
    })
  }

  if (hoursElapsed >= 72) {
    // 3 days+ → Delivered
    status = 'DELIVERED'
    currentLocation = null
    const t = new Date(orderDate.getTime() + 72 * 60 * 60 * 1000)
    activities.unshift({
      activity: 'Shipment delivered successfully',
      location: 'Delivered to customer',
      date: t.toISOString(),
      sr_status_label: 'Delivered'
    })
  }

  // Calculate estimated delivery (3-5 days from order)
  const etd = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000)
  const estimatedDelivery = status === 'DELIVERED'
    ? 'Delivered'
    : etd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    status,
    activities,
    awb,
    courier,
    estimated_delivery: estimatedDelivery,
    current_location: currentLocation
  }
}

/**
 * GET /api/shiprocket/track?order_id=xxx
 * Track a shipment — uses real Shiprocket if configured, otherwise mock data
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json({ error: 'Provide order_id' }, { status: 400 })
    }

    // Verify order belongs to this user
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('profile_id', user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If Shiprocket is configured and order has shiprocket data, try real tracking
    if (SHIPROCKET_CONFIGURED && order.shiprocket_order_id) {
      try {
        const { getTrackingByAWB, getShipmentTracking, getTrackingByOrderId } = await import('../../../../lib/shiprocket')
        
        let trackingData = null
        
        if (order.tracking_number) {
          try { trackingData = await getTrackingByAWB(order.tracking_number) } catch {}
        }
        if (!trackingData && order.shiprocket_shipment_id) {
          try { trackingData = await getShipmentTracking(order.shiprocket_shipment_id) } catch {}
        }
        if (!trackingData && order.shiprocket_order_id) {
          try { trackingData = await getTrackingByOrderId(`SF-${orderId}`) } catch {}
        }

        if (trackingData) {
          const tracking = trackingData?.tracking_data || trackingData
          return NextResponse.json({
            tracking: {
              status: tracking?.shipment_status || tracking?.current_status || 'NEW',
              activities: tracking?.shipment_track_activities || tracking?.track_activities || [],
              awb: tracking?.awb_code || order.tracking_number,
              courier: tracking?.courier_name || null,
              estimated_delivery: tracking?.etd || tracking?.estimated_delivery_date || null,
              current_location: tracking?.current_location || null
            }
          })
        }
      } catch (e) {
        console.warn('Shiprocket tracking failed, using mock:', e.message)
      }
    }

    // Use mock tracking data (demo mode)
    const mockTracking = generateMockTracking(order)
    return NextResponse.json({ tracking: mockTracking })

  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking info' },
      { status: 500 }
    )
  }
}
