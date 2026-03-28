import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'

export async function POST(req, { params }) {
  try {
    const body = await req.json()
    const form = body.form
    const id = params.id
    const supa = createSupabaseServerClient()

    // Build update payload — only include fields that are explicitly provided
    const update = {
      name: form.name,
      slug: form.slug,
      price: parseFloat(form.price) || 0,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock) || 0,
      description: form.description || null,
      short_description: form.short_description || null,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      is_active: form.is_active !== false && form.is_active !== 'false',
      is_featured: form.is_featured || false,
      is_best_seller: form.is_best_seller || false,
      is_new_arrival: form.is_new_arrival || false,
      sku: form.sku || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      // Shipping dimensions for BigShip
      shipping_weight: form.shipping_weight ? parseFloat(form.shipping_weight) : null,
      shipping_length: form.shipping_length ? parseInt(form.shipping_length) : null,
      shipping_width: form.shipping_width ? parseInt(form.shipping_width) : null,
      shipping_height: form.shipping_height ? parseInt(form.shipping_height) : null,
      shipping_box_count: form.shipping_box_count ? parseInt(form.shipping_box_count) : 1,
    }

    const { data, error } = await supa.from('products').update(update).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
