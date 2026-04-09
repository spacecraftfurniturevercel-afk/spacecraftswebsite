import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * GET  /api/admin/enquiries  — list all enquiries (with filters)
 * PATCH /api/admin/enquiries  — update status / add admin notes
 */

function isAdmin(user) {
  return user?.email === process.env.ADMIN_EMAIL || user?.email?.includes('@admin')
}

export async function GET(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const type   = searchParams.get('type')   // product | franchise | bulk_order | contact
    const status = searchParams.get('status') // new | acknowledged | in_progress | closed
    const page   = parseInt(searchParams.get('page')  || '1')
    const limit  = parseInt(searchParams.get('limit') || '50')

    const supabase = createSupabaseServerClient()
    let query = supabase
      .from('enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (type)   query = query.eq('type', type)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) {
      console.error('[admin/enquiries] GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
    }

    return NextResponse.json({ enquiries: data || [], total: count || 0 })
  } catch (err) {
    console.error('[admin/enquiries] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id, status, admin_notes } = await request.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updates = { updated_at: new Date().toISOString() }
    if (status) {
      updates.status = status
      if (status === 'acknowledged' || status === 'in_progress') {
        updates.acknowledged_at = new Date().toISOString()
        updates.acknowledged_by = user.email
      }
    }
    if (admin_notes !== undefined) updates.admin_notes = admin_notes

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[admin/enquiries] PATCH error:', error)
      return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
    }

    return NextResponse.json({ enquiry: data })
  } catch (err) {
    console.error('[admin/enquiries] PATCH unexpected:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
