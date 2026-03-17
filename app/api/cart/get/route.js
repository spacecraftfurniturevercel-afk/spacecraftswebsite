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
          category_id
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

    // Fetch images for all products in cart
    const productIds = cartItems.map(item => item.product_id)
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, url')
      .in('product_id', productIds)
      .order('position')

    // Create a map of product_id to first image
    const imageMap = {}
    images?.forEach(img => {
      if (!imageMap[img.product_id]) {
        imageMap[img.product_id] = img.url
      }
    })

    // Calculate totals
    let subtotal = 0
    let totalDiscount = 0
    const items = cartItems.map(item => {
      const price = item.products.discount_price || item.products.price
      const originalPrice = item.products.price
      const itemTotal = price * item.quantity
      const itemDiscount = (originalPrice - price) * item.quantity

      subtotal += itemTotal
      totalDiscount += itemDiscount

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
        itemTotal: itemTotal,
        itemDiscount: itemDiscount
      }
    })

    const tax = Math.round(subtotal * 0.05 * 100) / 100 // 5% tax
    const shipping = subtotal > 500 ? 0 : 50 // Free shipping above 500
    const total = subtotal + tax + shipping

    return NextResponse.json({
      success: true,
      items,
      summary: {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(totalDiscount * 100) / 100,
        tax: tax,
        shipping: shipping,
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
