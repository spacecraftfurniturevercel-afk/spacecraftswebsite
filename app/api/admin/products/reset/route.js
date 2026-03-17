import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'

// DELETE /api/admin/products/reset
// Deletes all products, product_images, product_variants, product_specifications,
// then cleans up orphan categories and brands, and re-seeds the 7 main categories + Spacecrafts brand
export async function DELETE() {
  try {
    const supa = createSupabaseServerClient()

    // Delete dependent tables first
    await supa.from('product_specifications').delete().neq('id', 0)
    await supa.from('product_variants').delete().neq('id', 0)
    await supa.from('product_images').delete().neq('id', 0)
    await supa.from('cart_items').delete().neq('id', 0)
    await supa.from('wishlist_items').delete().neq('id', 0)
    await supa.from('order_items').delete().neq('id', 0)

    // Delete all products
    const { error: prodErr } = await supa.from('products').delete().neq('id', 0)
    if (prodErr) throw new Error('Failed to delete products: ' + prodErr.message)

    // Delete all categories and brands
    await supa.from('categories').delete().neq('id', 0)
    await supa.from('brands').delete().neq('id', 0)

    // Re-seed the 7 main categories
    const mainCategories = [
      { name: 'Beds', slug: 'beds' },
      { name: 'Chairs', slug: 'chairs' },
      { name: 'Dining Sets', slug: 'dining-sets' },
      { name: 'Sofa Sets', slug: 'sofa-sets' },
      { name: 'Tables', slug: 'tables' },
      { name: 'Wardrobe & Racks', slug: 'wardrobe-racks' },
      { name: 'Space Saving Furniture', slug: 'space-saving-furniture' },
    ]

    for (const cat of mainCategories) {
      await supa.from('categories').upsert(cat, { onConflict: 'slug' })
    }

    // Re-seed brand
    await supa.from('brands').upsert(
      { name: 'Spacecrafts', slug: 'spacecrafts' },
      { onConflict: 'slug' }
    )

    return NextResponse.json({
      success: true,
      message: 'All products deleted. Categories and brand re-seeded. You can now re-import the CSV.',
    })
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
