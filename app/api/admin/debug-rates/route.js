import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'
import { getShippingRates } from '../../../../lib/bigship'

/**
 * GET /api/admin/debug-rates?order_id=56
 * Shows ALL rates BigShip returns for a registered order (via /api/order/shipping/rates).
 * Use this to diagnose why a specific courier was or wasn't picked.
 */
export async function GET(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = user.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL_2 || user.email?.includes('@admin')
    if (!isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    if (!orderId) return NextResponse.json({ error: 'order_id param required' }, { status: 400 })

    const supabase = createSupabaseServerClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, bigship_order_id, courier_name, courier_id, shipping_status, total')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!order.bigship_order_id) return NextResponse.json({ error: `Order #${orderId} has no bigship_order_id yet — run Create Shipment first` }, { status: 400 })

    const ratesResult = await getShippingRates('B2C', order.bigship_order_id)

    if (!ratesResult.success || !ratesResult.data?.length) {
      return NextResponse.json({
        order_id: orderId,
        bigship_order_id: order.bigship_order_id,
        currently_selected: { courier: order.courier_name, courier_id: order.courier_id },
        rates_available: false,
        raw: ratesResult,
      })
    }

    const sorted = [...ratesResult.data].sort((a, b) =>
      parseFloat(a.total_shipping_charges) - parseFloat(b.total_shipping_charges)
    )
    const cheapest = sorted[0]

    return NextResponse.json({
      order_id: orderId,
      bigship_order_id: order.bigship_order_id,
      currently_selected: { courier: order.courier_name, courier_id: order.courier_id },
      cheapest_available: {
        courier_name: cheapest.courier_name,
        courier_id: cheapest.courier_id,
        total_shipping_charges: cheapest.total_shipping_charges,
        tat: cheapest.tat,
      },
      all_rates_sorted_by_price: sorted.map(r => ({
        courier_name: r.courier_name,
        courier_id: r.courier_id,
        total_shipping_charges: r.total_shipping_charges,
        billable_weight: r.billable_weight,
        tat: r.tat,
        zone: r.zone,
      })),
    })
  } catch (err) {
    console.error('[debug-rates]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
