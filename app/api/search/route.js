import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Search query must be at least 2 characters' 
      }, { status: 400 })
    }

    const supabase = createSupabaseRouteHandlerClient(request)
    const searchTerm = `%${query.trim()}%`

    // Search products by name, description, or category
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discount_price,
        slug,
        stock,
        rating,
        review_count,
        categories (name, slug),
        brands (name, slug)
      `)
      .eq('is_active', true)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to search products' 
      }, { status: 500 })
    }

    // Fetch images for search results
    if (products && products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, url')
        .in('product_id', productIds)
        .order('position')

      const imageMap = {}
      images?.forEach(img => {
        if (!imageMap[img.product_id]) {
          imageMap[img.product_id] = img.url
        }
      })

      const results = products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.discount_price || product.price,
        originalPrice: product.price,
        slug: product.slug,
        stock: product.stock,
        rating: product.rating,
        review_count: product.review_count,
        image_url: imageMap[product.id] || '/placeholder-product.svg',
        category: product.categories?.name,
        brand: product.brands?.name
      }))

      return NextResponse.json({ 
        success: true, 
        results,
        count: results.length,
        query: query.trim()
      })
    }

    return NextResponse.json({ 
      success: true, 
      results: [],
      count: 0,
      query: query.trim()
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during search' 
    }, { status: 500 })
  }
}
