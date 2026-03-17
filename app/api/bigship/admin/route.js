import { NextResponse } from 'next/server'
import { getWalletBalance, getCourierList, getWarehouseList } from '../../../../lib/bigship'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

/**
 * GET /api/bigship/admin?action=wallet|couriers|warehouses
 * Admin-only endpoint for BigShip account management
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'wallet': {
        const result = await getWalletBalance()
        return NextResponse.json(result)
      }
      case 'couriers': {
        const category = searchParams.get('category') || 'b2c'
        const result = await getCourierList(category)
        return NextResponse.json(result)
      }
      case 'warehouses': {
        const page = parseInt(searchParams.get('page') || '1')
        const size = parseInt(searchParams.get('size') || '50')
        const result = await getWarehouseList(page, size)
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: 'Invalid action. Use: wallet, couriers, warehouses' }, { status: 400 })
    }
  } catch (error) {
    console.error('BigShip admin error:', error)
    return NextResponse.json({ error: error.message || 'BigShip API error' }, { status: 500 })
  }
}
