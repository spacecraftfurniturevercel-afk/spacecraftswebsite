import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * POST /api/products/by-ids
 * Fetches products by an array of IDs — used for guest browsing history
 * from localStorage. Returns products with their related products.
 * Body: { ids: string[] }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ items: [] })
    }

    // Limit to 20 products max
    const limitedIds = ids.slice(0, 20)

    const supabase = createSupabaseServerClient()

    // Fetch products with images
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, price, discount_price, stock, rating, review_count,
        category_id, related_product_ids,
        product_images (url, alt, position)
      `)
      .in('id', limitedIds)
      .eq('is_active', true)

    if (error || !products) {
      return NextResponse.json({ items: [] })
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
      const { data: relatedProducts } = await supabase
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

    // Build response maintaining the order of input IDs
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

    const items = limitedIds
      .map(id => productMap[id])
      .filter(Boolean)

    return NextResponse.json({ items })
  } catch (err) {
    console.error('Products by-ids error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
