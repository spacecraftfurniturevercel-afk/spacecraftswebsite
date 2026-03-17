import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to add items to wishlist' },
        { status: 401 }
      )
    }

    const { product_id } = await request.json()

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

    // Check if product exists
    const { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: true, message: 'Product already in wishlist', alreadyExists: true },
        { status: 200 }
      )
    }

    // Add to wishlist
    const { error: insertError } = await supabase
      .from('wishlist_items')
      .insert({
        profile_id: profile.id,
        product_id
      })

    if (insertError) {
      console.error('Error adding to wishlist:', insertError)
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${product.name} added to wishlist!`,
      product_name: product.name
    }, { status: 201 })

  } catch (error) {
    console.error('Error in add to wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
