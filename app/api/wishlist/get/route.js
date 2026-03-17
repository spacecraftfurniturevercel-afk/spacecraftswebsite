import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view wishlist' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get wishlist items with product details
    const { data: wishlistItems, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          discount_price,
          slug,
          stock
        )
      `)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wishlist:', error)
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      )
    }

    // Fetch images for all products
    const productIds = wishlistItems.map(item => item.product_id)
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

    const items = wishlistItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products.name,
      price: item.products.discount_price || item.products.price,
      originalPrice: item.products.price,
      image_url: imageMap[item.product_id] || '/placeholder-product.svg',
      slug: item.products.slug,
      stock: item.products.stock,
      created_at: item.created_at
    }))

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    }, { status: 200 })

  } catch (error) {
    console.error('Error in get wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
