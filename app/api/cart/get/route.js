import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view cart' },
        { status: 401 }
      )
    }

    // Get profile to access cart
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get all cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          price,
          discount_price,
          description,
          slug,
          stock,
          category_id,
          shipping_weight,
          shipping_length,
          shipping_width,
          shipping_height,
          shipping_box_count
        )
      `)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }

    // Fetch images from product_images table (all images stored there, not on products row)
    const allProductIds = cartItems?.map(i => i.product_id).filter(Boolean) || []
    const imageMap = {}
    if (allProductIds.length > 0) {
      const { data: piRows } = await supabase
        .from('product_images')
        .select('product_id, url')
        .in('product_id', allProductIds)
        .order('position')
      piRows?.forEach(img => {
        if (!imageMap[img.product_id]) imageMap[img.product_id] = img.url
      })
    }

    // Calculate totals
    let subtotal = 0
    const items = cartItems.map(item => {
      const price = item.products.discount_price || item.products.price
      const originalPrice = item.products.price
      const itemTotal = price * item.quantity

      subtotal += itemTotal

      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.products.name,
        price: price,
        originalPrice: originalPrice,
        image_url: imageMap[item.product_id] || '/placeholder-product.svg',
        slug: item.products.slug,
        stock: item.products.stock,
        category_id: item.products.category_id,
        shipping_weight: item.products.shipping_weight || null,
        shipping_length: item.products.shipping_length || null,
        shipping_width: item.products.shipping_width || null,
        shipping_height: item.products.shipping_height || null,
        shipping_box_count: item.products.shipping_box_count || 1,
        itemTotal: itemTotal
      }
    })

    // Shipping and delivery added client-side via BigShip API
    const total = subtotal

    return NextResponse.json({
      success: true,
      items,
      summary: {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: Math.round(total * 100) / 100
      },
      count: cartItems.length
    }, { status: 200 })

  } catch (error) {
    console.error('Error in get cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
