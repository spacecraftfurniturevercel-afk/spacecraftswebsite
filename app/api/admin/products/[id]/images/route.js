import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'
import { revalidateCatalog } from '../../../../../../lib/catalogCache'

/** GET /api/admin/products/[id]/images — list images for spreadsheet / admin */
export async function GET(_req, { params }) {
  try {
    const supa = createSupabaseServerClient()
    const productId = Number(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    }

    const { data, error } = await supa
      .from('product_images')
      .select('id, url, alt, position')
      .eq('product_id', productId)
      .order('position', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ images: data || [] })
  } catch (err) {
    console.error('[admin/products/images GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/products/[id]/images?imageId=123 */
export async function DELETE(req, { params }) {
  try {
    const { searchParams } = new URL(req.url)
    const imageId = Number(searchParams.get('imageId'))
    const productId = Number(params.id)

    if (!imageId || !productId) {
      return NextResponse.json({ error: 'imageId and product id required' }, { status: 400 })
    }

    const supa = createSupabaseServerClient()
    const { error } = await supa
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: product } = await supa
      .from('products')
      .select('slug')
      .eq('id', productId)
      .maybeSingle()

    revalidateCatalog({ slug: product?.slug })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/products/images DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
