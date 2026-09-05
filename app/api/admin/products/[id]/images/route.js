import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'
import { revalidateCatalog } from '../../../../../../lib/catalogCache'
import { getActiveAccountId } from '../../../../../../lib/storage/dualStorage'
import {
  importImageFromSource,
} from '../../../../../../lib/storage/importImageFromUrl'

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

/**
 * POST /api/admin/products/[id]/images
 * Body: { urls: string[], upload_to?: both|primary|secondary, url_account?: active|primary|secondary, replace?: boolean }
 */
export async function POST(req, { params }) {
  try {
    const productId = Number(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    }

    const body = await req.json()
    const urls = Array.isArray(body.urls) ? body.urls.filter(Boolean) : []
    if (!urls.length) {
      return NextResponse.json({ error: 'No image URLs provided' }, { status: 400 })
    }

    const uploadTo = body.upload_to || 'both'
    let urlAccountId = body.url_account || 'active'
    const replace = !!body.replace

    const supa = createSupabaseServerClient()
    if (urlAccountId === 'active') urlAccountId = await getActiveAccountId(supa)

    const { data: product, error: productError } = await supa
      .from('products')
      .select('id, slug, name')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (replace) {
      await supa.from('product_images').delete().eq('product_id', productId)
    }

    const { data: last } = await supa
      .from('product_images')
      .select('position')
      .eq('product_id', productId)
      .order('position', { ascending: false })
      .limit(1)

    let position = (last?.[0]?.position ?? -1) + 1
    const rowsToInsert = []
    const errors = []

    for (let i = 0; i < urls.length; i += 1) {
      const url = await importImageFromSource(urls[i], {
        slug: product.slug,
        imageIndex: position + i + 1,
        urlAccountId,
        uploadTo,
      })
      if (!url) {
        errors.push({ url: urls[i], error: 'Download or upload failed' })
        continue
      }
      rowsToInsert.push({
        product_id: productId,
        url,
        alt: `${product.name} - Image ${position + i + 1}`,
        position: position + i,
      })
    }

    if (rowsToInsert.length) {
      const { error } = await supa.from('product_images').insert(rowsToInsert)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateCatalog({ slug: product.slug })

    return NextResponse.json({
      count: rowsToInsert.length,
      errors,
      uploaded_to: uploadTo,
      served_by: urlAccountId,
    })
  } catch (err) {
    console.error('[admin/products/images POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
