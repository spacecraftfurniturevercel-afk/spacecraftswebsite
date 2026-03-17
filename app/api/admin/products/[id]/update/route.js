import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'

export async function POST(req, { params }) {
  try {
    const body = await req.json()
    const form = body.form
    const id = params.id
    const supa = createSupabaseServerClient()
    const { data, error } = await supa.from('products').update({
      name: form.name,
      slug: form.slug,
      price: form.price,
      discount_price: form.discount_price,
      stock: form.stock,
      description: form.description,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null
    }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
