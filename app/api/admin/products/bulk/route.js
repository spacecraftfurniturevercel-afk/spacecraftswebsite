import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'
import { revalidateCatalog } from '../../../../../lib/catalogCache'
import { PRODUCT_CATEGORY_EMBED_NAME } from '../../../../../lib/productCategoryQuery'
import { buildDbPayload, snapshotFromProduct } from '../../../../../lib/admin/spreadsheetFields'

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
  const images = (p.product_images || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const base = snapshotFromProduct(p)
  return {
    id: p.id,
    ...base,
    category_name: p.categories?.name || '',
    brand_name: p.brands?.name || '',
    image_count: images.length,
    thumbnail_url: images[0]?.url || '',
  }
}

function applyListFilters(query, { q, status }) {
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (q) {
    const term = q.replace(/%/g, '')
    query = query.or(
      `name.ilike.%${term}%,slug.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%,material.ilike.%${term}%,offer_name.ilike.%${term}%,delivery_info.ilike.%${term}%`
    )
  }
  return query
}

const PRODUCT_SELECT = `
  id, name, slug, sku, price, discount_price, stock, is_active,
  category_id, brand_id,
  description, short_description, material, delivery_info, care_instructions,
  tags, warranty_period, warranty_type,
  best_seller, is_offered, is_featured, is_new_arrival, offer_name,
  shipping_weight, shipping_length, shipping_width, shipping_height, shipping_box_count,
  meta_title, meta_description,
  ${PRODUCT_CATEGORY_EMBED_NAME},
  brands ( id, name ),
  product_images ( id, url, position )
`

/**
 * GET /api/admin/products/bulk?q=&status=all|active|inactive&page=1&pageSize=50
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const status = searchParams.get('status') || 'all'
    const idsOnly = searchParams.get('idsOnly') === 'true'

    const supa = createSupabaseServerClient()

    if (idsOnly) {
      let query = supa.from('products').select('id').order('name', { ascending: true }).limit(5000)
      query = applyListFilters(query, { q, status })
      const { data, error } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const ids = (data || []).map((r) => r.id)
      return NextResponse.json({ ids, total: ids.length })
    }

    const idsParam = (searchParams.get('ids') || '').trim()
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter(Boolean)
        .slice(0, 500)
      if (!ids.length) {
        return NextResponse.json({ products: [], total: 0 })
      }
      const { data, error } = await supa
        .from('products')
        .select(PRODUCT_SELECT)
        .in('id', ids)
        .order('name', { ascending: true })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({
        products: (data || []).map(mapProduct),
        total: data?.length || 0,
      })
    }

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '50', 10), 10), 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let countQuery = supa.from('products').select('id', { count: 'exact', head: true })
    countQuery = applyListFilters(countQuery, { q, status })
    const { count, error: countError } = await countQuery
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    let query = supa
      .from('products')
      .select(PRODUCT_SELECT)
      .order('name', { ascending: true })
      .range(from, to)

    query = applyListFilters(query, { q, status })

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? 0
    const totalPages = Math.max(Math.ceil(total / pageSize), 1)

    return NextResponse.json({
      products: (data || []).map(mapProduct),
      total,
      page,
      pageSize,
      totalPages,
    })
  } catch (err) {
    console.error('[admin/products/bulk GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products/bulk — sync edited spreadsheet rows
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
        if (!row.name?.trim()) throw new Error('Product name is required')

        const slug = (row.slug && row.slug.trim()) ? row.slug.trim() : generateSlug(row.name)
        if (!slug) throw new Error('Slug is required')

        const payload = buildDbPayload({ ...row, slug })

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
