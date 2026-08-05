/**
 * Cached catalog data loaders — wrap PostgREST fetches so repeat visitors
 * reuse the same payload for CATALOG_REVALIDATE_SECONDS instead of hitting Supabase.
 *
 * Listing queries use LISTING_PRODUCT_SELECT (no description / meta / heavy columns)
 * and attach only the first image per product.
 */
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createSupabaseServerClient } from './supabaseClient'
import {
  getActiveProductIdsForCategories,
  getActiveProductIdsForCategory,
  PRODUCT_CATEGORY_EMBED_FULL,
  PRODUCT_CATEGORY_EMBED_NAME,
  PRODUCT_CATEGORY_EMBED_NAME_SLUG,
} from './productCategoryQuery'
import { CATALOG_REVALIDATE_SECONDS, CATALOG_TAGS } from './catalogCache'
import { HOME_CATEGORY_SLUGS } from './homeCategories'

const CACHE_OPTS = {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: [CATALOG_TAGS.all],
}

/** Homepage featured rails only render 12 cards — fetch exactly that many. */
const HOME_RAIL_LIMIT = 12

/** Columns needed by product cards / listing UI — deliberately excludes description, meta, dimensions, etc. */
export const LISTING_PRODUCT_SELECT = `
  id,
  name,
  slug,
  price,
  discount_price,
  stock,
  rating,
  review_count,
  tags,
  offer_name,
  best_seller,
  is_offered,
  shipping_length,
  shipping_width,
  shipping_height,
  delivery_info,
  category_id,
  brand_id,
  created_at
`.replace(/\s+/g, ' ').trim()

const LISTING_WITH_CATEGORY_BRAND = `${LISTING_PRODUCT_SELECT}, ${PRODUCT_CATEGORY_EMBED_FULL}, brands (id, name, slug)`
const LISTING_RELATED = `${LISTING_PRODUCT_SELECT}, ${PRODUCT_CATEGORY_EMBED_NAME_SLUG}, brands (name, slug)`

function stableKey(value) {
  if (value == null) return ''
  if (typeof value !== 'object') return String(value)
  if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`
  return `{${Object.keys(value)
    .sort()
    .map((k) => `${k}:${stableKey(value[k])}`)
    .join(',')}}`
}

/** Keep only the first image per product (by position). Returns Map<productId, [{url,alt,position}]>. */
function firstImagesMap(imagesData = []) {
  const sorted = [...imagesData].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const map = new Map()
  for (const img of sorted) {
    if (map.has(img.product_id)) continue
    map.set(img.product_id, [{ url: img.url, alt: img.alt || null, position: img.position ?? 0 }])
  }
  return map
}

async function fetchListingImages(supabase, productIds) {
  if (!productIds.length) return new Map()
  const { data } = await supabase
    .from('product_images')
    .select('product_id, url, alt, position')
    .in('product_id', productIds)
    .order('position', { ascending: true })
  return firstImagesMap(data || [])
}

/** Homepage cards expect images as URL strings. */
function withFirstImageUrls(products, imageMap) {
  return products.map((p) => ({
    ...p,
    images: (imageMap.get(p.id) || []).map((img) => img.url),
  }))
}

/** Listing / related cards accept [{url}] objects. */
function withFirstImageObjects(products, imageMap) {
  return products.map((p) => ({
    ...p,
    images: imageMap.get(p.id) || [],
  }))
}

// ── Homepage ───────────────────────────────────────────────────────────────

async function fetchHomeCatalog() {
  const supabase = createSupabaseServerClient()

  // Only the 12 homepage category tiles — no full-catalog product-count scan
  const { data: cats, error: catsError } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, sort_order, is_active')
    .eq('is_active', true)
    .in('slug', HOME_CATEGORY_SLUGS)
  if (catsError) throw new Error(`home categories: ${catsError.message}`)

  const [bestsellerRes, offeredRes] = await Promise.all([
    supabase
      .from('products')
      .select(LISTING_PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('best_seller', true)
      .order('rating', { ascending: false })
      .limit(HOME_RAIL_LIMIT),
    supabase
      .from('products')
      .select(LISTING_PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('is_offered', true)
      .order('rating', { ascending: false })
      .limit(HOME_RAIL_LIMIT),
  ])
  if (bestsellerRes.error) throw new Error(`home bestsellers: ${bestsellerRes.error.message}`)
  if (offeredRes.error) throw new Error(`home offered: ${offeredRes.error.message}`)

  const bestsellers = bestsellerRes.data || []
  const offeredProducts = offeredRes.data || []

  // Deduplicate IDs so overlapping bestseller+offer products only load one image row set
  const imageIds = [...new Set([...bestsellers, ...offeredProducts].map((p) => p.id))]
  const imageMap = await fetchListingImages(supabase, imageIds)

  return {
    categories: cats || [],
    bestsellers: withFirstImageUrls(bestsellers, imageMap),
    offeredProducts: withFirstImageUrls(offeredProducts, imageMap),
  }
}

export const getCachedHomeCatalog = unstable_cache(fetchHomeCatalog, ['home-catalog-v4'], {
  ...CACHE_OPTS,
  tags: [CATALOG_TAGS.all, CATALOG_TAGS.home],
})

// ── Filter meta (categories + brands) ──────────────────────────────────────

async function fetchFilterMeta() {
  const supabase = createSupabaseServerClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('brands').select('id, name, slug').order('name'),
  ])
  return { categories: categories || [], brands: brands || [] }
}

export const getCachedFilterMeta = unstable_cache(fetchFilterMeta, ['filter-meta-v1'], {
  ...CACHE_OPTS,
  tags: [CATALOG_TAGS.all, CATALOG_TAGS.categories],
})

// ── Product detail ─────────────────────────────────────────────────────────

async function fetchProductPage(slug) {
  const supabase = createSupabaseServerClient()

  const { data } = await supabase
    .from('products')
    .select(`*, ${PRODUCT_CATEGORY_EMBED_FULL}, brands (id, name, slug)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!data) return null

  const product = data
  const category = data.categories
  const brand = data.brands

  const [
    { data: imagesData },
    { data: variantsData },
    { data: offersData },
    { data: warrantiesData },
    { data: emiData },
    { data: storesData },
    { data: specsData },
    { data: reviewsData },
  ] = await Promise.all([
    supabase
      .from('product_images')
      .select('id, product_id, url, alt, position')
      .eq('product_id', product.id)
      .order('position'),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('product_offers')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('warranty_options')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true),
    supabase
      .from('emi_options')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('product_stores')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('distance_km'),
    supabase
      .from('product_specifications')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('spec_category, position'),
    supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  let relatedProducts = []
  if (product.category_id) {
    const { data: categoryProducts } = await supabase
      .from('products')
      .select(LISTING_RELATED)
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', product.id)
      .gte('stock', 1)
      .order('rating', { ascending: false })
      .limit(12)

    relatedProducts = categoryProducts || []

    if (relatedProducts.length < 12 && product.brand_id) {
      const excludeFilter = [...new Set([product.id, ...relatedProducts.map((p) => p.id)])]
      const { data: brandProducts } = await supabase
        .from('products')
        .select(LISTING_RELATED)
        .eq('brand_id', product.brand_id)
        .eq('is_active', true)
        .not('id', 'in', `(${excludeFilter.join(',')})`)
        .gte('stock', 1)
        .order('rating', { ascending: false })
        .limit(12 - relatedProducts.length)

      relatedProducts = [...relatedProducts, ...(brandProducts || [])]
    }

    relatedProducts = relatedProducts.slice(0, 12)

    if (relatedProducts.length > 0) {
      const imageMap = await fetchListingImages(
        supabase,
        relatedProducts.map((p) => p.id)
      )
      relatedProducts = withFirstImageObjects(relatedProducts, imageMap)
    }
  }

  return {
    product,
    images: imagesData || [],
    category,
    brand,
    variants: variantsData || [],
    offers: offersData || [],
    warranties: warrantiesData || [],
    emiOptions: emiData || [],
    stores: storesData || [],
    specifications: specsData || [],
    reviews: reviewsData || [],
    relatedProducts,
  }
}

/** Cross-request cache + per-request dedupe (metadata + page share one fetch). */
export const getCachedProductPage = cache(async (slug) => {
  return unstable_cache(
    async () => fetchProductPage(slug),
    ['product-page-v3', slug],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAGS.all, CATALOG_TAGS.product(slug)],
    }
  )()
})

async function fetchProductMeta(slug) {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select(`id, name, slug, description, ${PRODUCT_CATEGORY_EMBED_NAME}, brands(name)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!data) return null

  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', data.id)
    .order('position')
    .limit(1)

  return { product: data, imageUrl: images?.[0]?.url || null }
}

export const getCachedProductMeta = cache(async (slug) => {
  return unstable_cache(
    async () => fetchProductMeta(slug),
    ['product-meta-v3', slug],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAGS.all, CATALOG_TAGS.product(slug)],
    }
  )()
})

// ── Products listing (/products) ───────────────────────────────────────────

async function fetchProductsListing(filters) {
  const supabase = createSupabaseServerClient()
  const { categories, brands } = await fetchFilterMeta()

  const page = parseInt(filters.page || '1', 10)
  const perPage = filters.perPage || 16
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('products')
    .select(LISTING_WITH_CATEGORY_BRAND, { count: 'exact' })
    .eq('is_active', true)

  if (filters.categories) {
    const categoryArray = String(filters.categories).split(',')
    const categoryIds = categories.filter((c) => categoryArray.includes(c.slug)).map((c) => c.id)
    if (categoryIds.length > 0) {
      const productIds = await getActiveProductIdsForCategories(supabase, categoryIds)
      query = productIds.length > 0 ? query.in('id', productIds) : query.eq('id', -1)
    }
  }

  if (filters.brands) {
    const brandArray = String(filters.brands).split(',')
    const brandIds = brands.filter((b) => brandArray.includes(b.slug)).map((b) => b.id)
    if (brandIds.length > 0) query = query.in('brand_id', brandIds)
  }

  if (filters.subcategories) {
    query = query.overlaps('tags', String(filters.subcategories).split(','))
  }

  const tagFilter = filters.tags || filters.tag
  if (tagFilter) {
    query = query.overlaps('tags', String(tagFilter).split(','))
  }

  if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))

  const searchQuery = filters.q || filters.search
  if (searchQuery) {
    // Search can match description, but listing rows stay slim (description not returned)
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  switch (filters.sort || 'rating-desc') {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('rating', { ascending: false })
  }

  query = query.range(from, to)
  const { data, count, error } = await query
  if (error) throw new Error(`products listing: ${error.message}`)
  let products = data || []

  if (products.length > 0) {
    const imageMap = await fetchListingImages(
      supabase,
      products.map((p) => p.id)
    )
    products = withFirstImageObjects(products, imageMap)
  }

  return {
    products,
    categories,
    brands,
    totalCount: count || 0,
  }
}

export async function getCachedProductsListing(filters) {
  const key = stableKey(filters)
  return unstable_cache(
    async () => fetchProductsListing(filters),
    ['products-listing-v3', key],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAGS.all, CATALOG_TAGS.products],
    }
  )()
}

// ── Category listing ───────────────────────────────────────────────────────

async function fetchCategoryListing(slug, filters, options) {
  const supabase = createSupabaseServerClient()
  const { collectionTags = null, isSubCategory = false, tagToFilter = null, categoryId = null } =
    options

  const { categories, brands } = await fetchFilterMeta()

  const page = parseInt(filters.page || '1', 10)
  const perPage = filters.perPage || 16
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('products')
    .select(LISTING_WITH_CATEGORY_BRAND, { count: 'exact' })
    .eq('is_active', true)

  if (collectionTags) {
    query = query.overlaps('tags', collectionTags)
  } else if (isSubCategory) {
    query = query.contains('tags', [tagToFilter || slug])
  } else if (categoryId) {
    const productIds = await getActiveProductIdsForCategory(supabase, categoryId)
    query = productIds.length > 0 ? query.in('id', productIds) : query.eq('id', -1)
  } else {
    query = query.eq('id', -1)
  }

  if (filters.brands) {
    const brandArray = String(filters.brands).split(',')
    const brandIds = brands.filter((b) => brandArray.includes(b.slug)).map((b) => b.id)
    if (brandIds.length > 0) query = query.in('brand_id', brandIds)
  }

  if (filters.subcategories) {
    query = query.overlaps('tags', String(filters.subcategories).split(','))
  }

  const tagFilter = filters.tags || filters.tag
  if (tagFilter) {
    query = query.overlaps('tags', String(tagFilter).split(','))
  }

  if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))

  switch (filters.sort || 'rating-desc') {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('rating', { ascending: false })
  }

  query = query.range(from, to)
  const { data, count, error } = await query
  if (error) throw new Error(`products listing: ${error.message}`)
  let products = data || []

  if (products.length > 0) {
    const imageMap = await fetchListingImages(
      supabase,
      products.map((p) => p.id)
    )
    products = withFirstImageObjects(products, imageMap)
  }

  return {
    products,
    categories,
    brands,
    totalCount: count || 0,
  }
}

export async function getCachedCategoryListing(slug, filters, options) {
  const key = `${slug}|${stableKey(filters)}|${stableKey(options)}`
  return unstable_cache(
    async () => fetchCategoryListing(slug, filters, options),
    ['category-listing-v3', key],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAGS.all, CATALOG_TAGS.products, CATALOG_TAGS.categories],
    }
  )()
}

export async function getCachedCategoryBySlug(slug) {
  return unstable_cache(
    async () => {
      const supabase = createSupabaseServerClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle()
      return data || null
    },
    ['category-by-slug-v1', slug],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAGS.all, CATALOG_TAGS.categories],
    }
  )()
}
