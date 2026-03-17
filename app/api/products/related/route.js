import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get('category_id')
    const product_id = searchParams.get('product_id')
    const limit = parseInt(searchParams.get('limit') || '4', 10)

    if (!category_id || !product_id) {
      return NextResponse.json(
        { error: 'category_id and product_id are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseRouteHandlerClient(request)

    // Fetch related products from same category, excluding current product
    const { data: relatedProducts, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discount_price,
        slug,
        stock,
        rating,
        review_count
      `)
      .eq('category_id', category_id)
      .eq('is_active', true)
      .neq('id', product_id)
      .gte('stock', 1)
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching related products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch related products' },
        { status: 500 }
      )
    }

    if (!relatedProducts || relatedProducts.length === 0) {
      return NextResponse.json({ items: [] })
    }

    // Fetch images for related products
    const productIds = relatedProducts.map(p => p.id)
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, url')
      .in('product_id', productIds)
      .order('position')

    // Create image map
    const imageMap = {}
    images?.forEach(img => {
      if (!imageMap[img.product_id]) {
        imageMap[img.product_id] = img.url
      }
    })

    const items = relatedProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      originalPrice: product.price,
      slug: product.slug,
      stock: product.stock,
      rating: product.rating,
      review_count: product.review_count,
      image_url: imageMap[product.id] || '/placeholder-product.svg'
    }))

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Error in related products:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
