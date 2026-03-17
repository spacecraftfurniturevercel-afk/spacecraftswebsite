import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../lib/supabaseClient'

/**
 * GET /api/browsing-history
 * Fetches the user's browsing history (recently viewed products) from DB.
 * Only works for authenticated users.
 * Returns product details + related products for each viewed product.
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ authenticated: false, items: [] })
    }

    // Fetch the user's browsing history, ordered by most recent
    const adminSupabase = createSupabaseServerClient()
    const { data: history, error: histError } = await adminSupabase
      .from('user_browsing_history')
      .select('product_id, search_query, viewed_at')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(20)

    if (histError || !history || history.length === 0) {
      return NextResponse.json({ authenticated: true, items: [] })
    }

    // Deduplicate by product_id, keeping most recent
    const seen = new Set()
    const uniqueHistory = history.filter(h => {
      if (!h.product_id || seen.has(h.product_id)) return false
      seen.add(h.product_id)
      return true
    })

    const productIds = uniqueHistory.map(h => h.product_id)

    // Fetch the viewed products with images
    const { data: products, error: prodError } = await adminSupabase
      .from('products')
      .select(`
        id, name, slug, price, discount_price, stock, rating, review_count,
        category_id, related_product_ids,
        product_images (url, alt, position)
      `)
      .in('id', productIds)
      .eq('is_active', true)

    if (prodError || !products) {
      return NextResponse.json({ authenticated: true, items: [] })
    }

    // Collect all related product IDs
    const allRelatedIds = new Set()
    products.forEach(p => {
      if (p.related_product_ids && Array.isArray(p.related_product_ids)) {
        p.related_product_ids.forEach(rid => allRelatedIds.add(rid))
      }
    })

    // Fetch related products in one query
    let relatedMap = {}
    if (allRelatedIds.size > 0) {
      const { data: relatedProducts } = await adminSupabase
        .from('products')
        .select(`
          id, name, slug, price, discount_price, stock, rating, review_count,
          product_images (url, alt, position)
        `)
        .in('id', Array.from(allRelatedIds))
        .eq('is_active', true)

      if (relatedProducts) {
        relatedProducts.forEach(rp => {
          relatedMap[rp.id] = {
            ...rp,
            images: rp.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
          }
          delete relatedMap[rp.id].product_images
        })
      }
    }

    // Build the response: maintain browsing history order
    const productMap = {}
    products.forEach(p => {
      productMap[p.id] = {
        ...p,
        images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || [],
        relatedProducts: (p.related_product_ids || [])
          .map(rid => relatedMap[rid])
          .filter(Boolean)
          .slice(0, 4)
      }
      delete productMap[p.id].product_images
      delete productMap[p.id].related_product_ids
    })

    // Order by browsing history (most recent first)
    const items = uniqueHistory
      .map(h => productMap[h.product_id])
      .filter(Boolean)

    return NextResponse.json({
      authenticated: true,
      items,
      searchQueries: uniqueHistory
        .filter(h => h.search_query)
        .map(h => h.search_query)
        .slice(0, 5)
    })
  } catch (err) {
    console.error('Browsing history GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/browsing-history
 * Records a product view for the authenticated user.
 * Body: { productId: string, searchQuery?: string }
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ saved: false, reason: 'not_authenticated' })
    }

    const body = await request.json()
    const { productId, searchQuery } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const adminSupabase = createSupabaseServerClient()

    // Upsert — if user viewed same product again, update the timestamp
    const { error: insertError } = await adminSupabase
      .from('user_browsing_history')
      .upsert(
        {
          user_id: user.id,
          product_id: productId,
          search_query: searchQuery || null,
          viewed_at: new Date().toISOString()
        },
        { onConflict: 'user_id,product_id' }
      )

    if (insertError) {
      console.error('Browsing history insert error:', insertError)
      return NextResponse.json({ saved: false, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('Browsing history POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
