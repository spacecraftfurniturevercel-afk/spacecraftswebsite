import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'
import { cancelAWB } from '../../../../lib/bigship'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

/**
 * POST /api/bigship/cancel
 * Cancel an AWB / shipment
 * Body: { order_id: "..." }
 */
export async function POST(request) {
  try {
    if (!BIGSHIP_CONFIGURED) {
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: 'BigShip not configured — cancel simulated',
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

    // Fetch order — admin can cancel any, user can cancel own
    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL
    const query = supabase.from('orders').select('*').eq('id', order_id)
    if (!isAdmin) query.eq('profile_id', user.id)
    const { data: order } = await query.single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.tracking_number) {
      // No AWB yet — just update status
      await supabase
        .from('orders')
        .update({ status: 'cancelled', shipping_status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('id', order_id)

      return NextResponse.json({ success: true, message: 'Order cancelled (no shipment was created)' })
    }

    // Cancel AWB via BigShip
    const result = await cancelAWB([order.tracking_number])

    if (result.success) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', shipping_status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('id', order_id)

      await supabase
        .from('shipping_events')
        .insert({
          order_id,
          status: 'CANCELLED',
          awb_code: order.tracking_number,
          courier: order.courier_name,
          raw_payload: result,
          created_at: new Date().toISOString(),
        })
        .catch(() => {})
    }

    return NextResponse.json({
      success: result.success,
      data: result.data,
      message: result.message,
    })
  } catch (error) {
    console.error('BigShip cancel error:', error)
    return NextResponse.json({ error: error.message || 'Failed to cancel shipment' }, { status: 500 })
  }
}
