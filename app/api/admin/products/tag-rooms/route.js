import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'

// Tag mapping: which sub-category tags belong to which room
const ROOM_TAG_MAP = {
  'living-room': [
    'diwans', 'corner-sofas', 'cushion-sofas', 'recliner-sofas',
    'coffee-tables', 'tv-racks', '2-seater', '3-1-1-sofas',
    'sofa', 'sofa-beds', 'sofa-cum-beds', 'rocking-chairs', 'lazy-chairs'
  ],
  'bed-room': [
    'wooden-beds', 'bunk-beds', 'metal-cots', 'folding-beds',
    'futon-beds', 'diwan-cum-beds', 'recliner-folding-beds',
    'sofa-cum-beds', 'sofa-beds', 'wardrobes', 'dressing-tables',
    'book-shelves', 'book-racks', 'shoe-racks'
  ],
  'dining-room': [
    'dining-sets', 'folding-dinings', 'wooden-dinings'
  ],
  'study-room': [
    'study-chairs', 'study-tables', 'study-&-office-tables',
    'office-chairs', 'foldable-tables', 'foldable-chairs',
    'book-racks', 'book-shelves'
  ],
}

// Main category slug → room tag
const CATEGORY_ROOM_MAP = {
  'sofa-sets': 'living-room',
  'beds': 'bed-room',
  'wardrobe-racks': 'bed-room',
  'dining-sets': 'dining-room',
  'chairs': 'study-room',
  'tables': 'study-room',
}

export async function POST() {
  try {
    const supa = createSupabaseServerClient()
    const results = { tagged: 0, errors: [] }

    // Fetch all active products with their category
    const { data: products, error } = await supa
      .from('products')
      .select('id, tags, price, discount_price, is_offered, category_id, categories (slug)')
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: 'Query failed: ' + error.message }, { status: 500 })
    }
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No active products found', results })
    }

    for (const product of products) {
      const currentTags = Array.isArray(product.tags) ? [...product.tags] : []
      const newTags = new Set(currentTags)
      const catSlug = product.categories?.slug

      // 1. Assign room tags based on main category
      if (catSlug && CATEGORY_ROOM_MAP[catSlug]) {
        newTags.add(CATEGORY_ROOM_MAP[catSlug])
      }

      // 2. Assign room tags based on sub-category tags
      for (const [roomTag, subCatSlugs] of Object.entries(ROOM_TAG_MAP)) {
        for (const subCat of subCatSlugs) {
          if (currentTags.includes(subCat)) {
            newTags.add(roomTag)
            break
          }
        }
      }

      // 3. Best Offer tag — products with discount
      if (
        (product.discount_price && product.discount_price > 0 && product.discount_price < product.price) ||
        product.is_offered
      ) {
        newTags.add('best-offer')
      }

      // Update only if tags changed
      const updatedTags = Array.from(newTags)
      if (updatedTags.length !== currentTags.length || !updatedTags.every(t => currentTags.includes(t))) {
        const { error: upErr } = await supa
          .from('products')
          .update({ tags: updatedTags })
          .eq('id', product.id)

        if (upErr) {
          results.errors.push({ id: product.id, error: upErr.message })
        } else {
          results.tagged++
        }
      }
    }

    return NextResponse.json({
      message: `Tagged ${results.tagged} products. ${results.errors.length} errors.`,
      total: products.length,
      results,
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
