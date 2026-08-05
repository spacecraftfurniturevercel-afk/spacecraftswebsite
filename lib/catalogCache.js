/**
 * Catalog page caching (ISR + data cache).
 *
 * Pages stop using force-dynamic and reuse Supabase results for CATALOG_REVALIDATE_SECONDS.
 * CMS create/update calls revalidateCatalog() so edits show up without waiting for the TTL.
 */
import { revalidatePath, revalidateTag } from 'next/cache'

/** How long catalog PostgREST responses stay cached (seconds). */
export const CATALOG_REVALIDATE_SECONDS = 3600

export const CATALOG_TAGS = {
  all: 'catalog',
  home: 'home',
  products: 'products',
  categories: 'categories',
  product: (slug) => `product:${slug}`,
}

/** Bust catalog caches after CMS / import / image changes. */
export function revalidateCatalog({ slug, categorySlug } = {}) {
  try {
    revalidateTag(CATALOG_TAGS.all)
    revalidateTag(CATALOG_TAGS.home)
    revalidateTag(CATALOG_TAGS.products)
    revalidateTag(CATALOG_TAGS.categories)
    if (slug) revalidateTag(CATALOG_TAGS.product(slug))

    revalidatePath('/')
    revalidatePath('/products')
    if (slug) revalidatePath(`/products/${slug}`)
    if (categorySlug) revalidatePath(`/products/category/${categorySlug}`)
    // Category listing index — product may appear in multiple category URLs
    revalidatePath('/products/category', 'layout')
  } catch (err) {
    console.warn('[revalidateCatalog]', err.message)
  }
}
