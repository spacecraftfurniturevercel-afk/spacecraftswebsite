import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function PUT(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to update cart' },
        { status: 401 }
      )
    }

    const { product_id, quantity } = await request.json()

    // Validate input
    if (!product_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than or equal to 0' },
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

    // Get cart item
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('product_id', product_id)
      .single()

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItem.id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove item from cart' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      }, { status: 200 })
    }

    // Verify product exists and check stock
    const { data: product } = await supabase
      .from('products')
      .select('id, name, price, discount_price, stock')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      )
    }

    // Update quantity
    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItem.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      cartItem: {
        id: updated.id,
        product_id: updated.product_id,
        quantity: updated.quantity,
        price: product.discount_price || product.price,
        total: (product.discount_price || product.price) * updated.quantity
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in update cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
