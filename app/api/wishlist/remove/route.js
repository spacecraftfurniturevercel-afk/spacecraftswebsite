import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function DELETE(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove items from wishlist' },
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

    // Delete wishlist item
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('profile_id', profile.id)
      .eq('product_id', product_id)

    if (error) {
      console.error('Error deleting wishlist item:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from wishlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist'
    }, { status: 200 })

  } catch (error) {
    console.error('Error in remove wishlist item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
