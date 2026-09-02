import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'
import { revalidateCatalog } from '../../../../../lib/catalogCache'

function generateSlug(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price ?? '',
    discount_price: p.discount_price ?? '',
    stock: p.stock ?? 0,
    is_active: p.is_active !== false,
    category_id: p.category_id || '',
    brand_id: p.brand_id || '',
    category_name: p.categories?.name || '',
    brand_name: p.brands?.name || '',
  }
}

/**
 * GET /api/admin/products/bulk?q=&status=all|active|inactive&limit=500
 * List products for the spreadsheet editor.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const status = searchParams.get('status') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 2000)

    const supa = createSupabaseServerClient()

    let query = supa
      .from('products')
      .select(`
        id, name, slug, sku, price, discount_price, stock, is_active,
        category_id, brand_id,
        categories ( id, name ),
        brands ( id, name )
      `)
      .order('name', { ascending: true })
      .limit(limit)

    if (status === 'active') query = query.eq('is_active', true)
    if (status === 'inactive') query = query.eq('is_active', false)

    if (q) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,sku.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: (data || []).map(mapProduct),
      total: data?.length || 0,
    })
  } catch (err) {
    console.error('[admin/products/bulk GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products/bulk
 * Body: { rows: [{ id?, _isNew?, name, slug, sku, price, discount_price, stock, is_active, category_id, brand_id }] }
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const rows = body.rows

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows to sync' }, { status: 400 })
    }

    const supa = createSupabaseServerClient()
    const results = { success: [], errors: [] }

    for (const row of rows) {
      const label = row.name?.trim() || row.slug?.trim() || '(unnamed)'
      try {
        if (!row.name?.trim()) {
          throw new Error('Product name is required')
        }

        const slug = (row.slug && row.slug.trim()) ? row.slug.trim() : generateSlug(row.name)
        if (!slug) throw new Error('Slug is required')

        const payload = {
          name: row.name.trim(),
          slug,
          price: parseFloat(row.price) || 0,
          discount_price: row.discount_price !== '' && row.discount_price != null
            ? parseFloat(row.discount_price)
            : null,
          stock: parseInt(row.stock, 10) || 0,
          is_active: row.is_active !== false && row.is_active !== 'false',
          sku: row.sku?.trim() || null,
          category_id: row.category_id ? Number(row.category_id) : null,
          brand_id: row.brand_id ? Number(row.brand_id) : null,
        }

        let productId = row.id
        let action = 'updated'

        if (row.id && !row._isNew) {
          const { data, error } = await supa
            .from('products')
            .update(payload)
            .eq('id', row.id)
            .select('id, slug, name')
            .single()
          if (error) throw new Error(error.message)
          productId = data.id
        } else {
          const { data: bySlug } = await supa
            .from('products')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

          if (bySlug) {
            const { data, error } = await supa
              .from('products')
              .update(payload)
              .eq('id', bySlug.id)
              .select('id, slug, name')
              .single()
            if (error) throw new Error(error.message)
            productId = data.id
            action = 'updated'
          } else {
            const { data, error } = await supa
              .from('products')
              .insert({
                ...payload,
                warranty_period: 12,
                warranty_type: 'Standard',
                emi_enabled: true,
                return_days: 30,
                assembly_cost: 0,
                is_limited_stock: false,
              })
              .select('id, slug, name')
              .single()
            if (error) throw new Error(error.message)
            productId = data.id
            action = 'created'
          }
        }

        results.success.push({ id: productId, name: payload.name, slug, action })
      } catch (rowErr) {
        results.errors.push({ name: label, error: rowErr.message })
      }
    }

    if (results.success.length > 0) {
      revalidateCatalog()
    }

    return NextResponse.json({
      message: `Synced ${results.success.length} product(s)${results.errors.length ? `, ${results.errors.length} error(s)` : ''}`,
      results,
    })
  } catch (err) {
    console.error('[admin/products/bulk POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
