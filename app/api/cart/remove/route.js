import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function DELETE(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove items from cart' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const product_id = searchParams.get('product_id')

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
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

    // Delete cart item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('profile_id', profile.id)
      .eq('product_id', product_id)

    if (error) {
      console.error('Error deleting cart item:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      )
    }

    // Get updated cart count
    const { count: cartCount } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully',
      cartCount
    }, { status: 200 })

  } catch (error) {
    console.error('Error in remove cart item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
