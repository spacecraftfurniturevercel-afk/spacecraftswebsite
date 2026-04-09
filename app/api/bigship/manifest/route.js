import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'
import { manifestOrderForShipping } from '../../../../lib/createShipment'

/**
 * POST /api/bigship/manifest
 * Phase 2 — Admin triggers this when order is packed and ready for courier pickup.
 * Calls BigShip Manifest + Gets AWB (tracking number).
 * Body: { order_id: "..." }
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.email?.includes('@admin') || user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { order_id } = await request.json()
    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    const result = await manifestOrderForShipping(order_id, supabase)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[bigship/manifest] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manifest order' },
      { status: 500 }
    )
  }
}
