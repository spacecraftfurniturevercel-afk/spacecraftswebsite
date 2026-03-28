import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'

/**
 * GET /api/admin/products/search?q=keyword&limit=20&all=true
 * Search products by name or slug for the admin CMS.
 * Returns both active and inactive products.
 * ?all=true — return first 50 products with no filter (initial load)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const all = searchParams.get('all') === 'true'

    const supa = createSupabaseServerClient()

    let query = supa
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!all && q.length > 0) {
      // Search by name or slug using ilike
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data || [], total: data?.length || 0 })
  } catch (err) {
    console.error('[admin/products/search] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
