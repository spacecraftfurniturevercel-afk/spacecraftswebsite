import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to add items to cart' },
        { status: 401 }
      )
    }

    const { product_id, quantity = 1 } = await request.json()

    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      )
    }

    // Verify product exists and is active
    const { data: product } = await supabase
      .from('products')
      .select('id, name, price, discount_price, stock')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      )
    }

    // Get user profile to get profile_id
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

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('profile_id', profile.id)
      .eq('product_id', product_id)
      .single()

    let cartItem
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity

      // Validate new quantity against stock
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available in stock` },
          { status: 400 }
        )
      }

      const { data: updated, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update cart item' },
          { status: 500 }
        )
      }
      cartItem = updated
    } else {
      // Insert new cart item
      const { data: newItem, error } = await supabase
        .from('cart_items')
        .insert({
          profile_id: profile.id,
          product_id,
          quantity
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting cart item:', error)
        return NextResponse.json(
          { error: 'Failed to add item to cart' },
          { status: 500 }
        )
      }
      cartItem = newItem
    }

    // Get updated cart count
    const { count: cartCount } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    return NextResponse.json({
      success: true,
      message: existingItem ? 'Cart item updated successfully' : 'Added to cart successfully',
      cartItem: {
        id: cartItem.id,
        product_id: cartItem.product_id,
        product_name: product.name,
        quantity: cartItem.quantity,
        price: product.discount_price || product.price,
        total: (product.discount_price || product.price) * cartItem.quantity
      },
      cartCount
    }, { status: 200 })

  } catch (error) {
    console.error('Error in add to cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
