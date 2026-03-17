import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()

    // Fetch product with all related data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('position')

    // Fetch offers
    const { data: offers } = await supabase
      .from('product_offers')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('position')

    // Fetch warranty options
    const { data: warranties } = await supabase
      .from('warranty_options')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)

    // Fetch EMI options
    const { data: emiOptions } = await supabase
      .from('emi_options')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('position')

    // Fetch stores
    const { data: stores } = await supabase
      .from('product_stores')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('distance_km')

    // Fetch specifications
    const { data: specifications } = await supabase
      .from('product_specifications')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('spec_category, position')

    // Fetch product images
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('position')

    return NextResponse.json({
      product,
      variants: variants || [],
      offers: offers || [],
      warranties: warranties || [],
      emiOptions: emiOptions || [],
      stores: stores || [],
      specifications: specifications || [],
      images: images || []
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()
    
    // Check if user is admin (you'll need to implement auth check)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product, variants, offers, warranties, emiOptions, stores, specifications } = body

    // Update main product
    if (product) {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
      
      if (error) throw error
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
