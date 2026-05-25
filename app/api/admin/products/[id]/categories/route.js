import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'

export async function GET(_request, { params }) {
  try {
    const supa = createSupabaseServerClient()
    const productId = Number(params.id)

    const { data, error } = await supa
      .from('product_categories')
      .select('category_id, is_primary')
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const categoryIds = (data || []).map((row) => row.category_id)

    return NextResponse.json({
      category_ids: categoryIds,
      primary_category_id: data?.find((row) => row.is_primary)?.category_id || null,
    })
  } catch (err) {
    console.error('[admin/products/categories]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
