import { NextResponse } from 'next/server'
import { downloadLabel, downloadManifest, getAWB } from '../../../../lib/bigship'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * GET /api/bigship/shipment-data?type=awb&order_id=123
 * type: awb | label | manifest
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'awb'
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL
    // Use service role so admin can access any order regardless of RLS
    const dbClient = isAdmin ? createSupabaseServerClient() : supabase

    // Get order to find bigship_order_id
    const { data: order } = await dbClient
      .from('orders')
      .select('bigship_order_id, profile_id')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!isAdmin && order.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!order.bigship_order_id) {
      return NextResponse.json({ error: 'No BigShip order linked' }, { status: 400 })
    }

    let result
    switch (type) {
      case 'label':
        result = await downloadLabel(order.bigship_order_id)
        break
      case 'manifest':
        result = await downloadManifest(order.bigship_order_id)
        break
      default:
        result = await getAWB(order.bigship_order_id)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('BigShip shipment data error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get shipment data' }, { status: 500 })
  }
}
