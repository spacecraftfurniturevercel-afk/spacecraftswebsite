import { SITE_URL } from './constants'
import { getActiveProductIdsForCategory } from '../productCategoryQuery'

function formatProduct(row, imageUrl) {
  const price = Number(row.price) || 0
  const discountPrice = row.discount_price != null ? Number(row.discount_price) : null
  const finalPrice = discountPrice != null && discountPrice < price ? discountPrice : price

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price,
    discount_price: discountPrice,
    final_price: finalPrice,
    offer_name: row.offer_name || null,
    image_url: imageUrl || '/placeholder-product.svg',
    url: `${SITE_URL}/products/${row.slug}`,
    category: row.categories?.name || null,
  }
}

function finalPrice(row) {
  const price = Number(row.price) || 0
  const discount = row.discount_price != null ? Number(row.discount_price) : null
  return discount != null && discount < price ? discount : price
}

function isPricedProduct(row) {
  return finalPrice(row) > 0
}

function takePricedProducts(rows, limit) {
  return rows.filter(isPricedProduct).slice(0, limit)
}

async function attachImages(supabase, products = []) {
  if (!products.length) return []

  const ids = products.map((p) => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url')
    .in('product_id', ids)
    .order('position')

  const imageMap = {}
  images?.forEach((img) => {
    if (!imageMap[img.product_id]) imageMap[img.product_id] = img.url
  })

  return products
    .map((p) => formatProduct(p, imageMap[p.id]))
    .filter((p) => p.final_price > 0)
}

const PRODUCT_SELECT = `
  id, name, slug, price, discount_price, offer_name, best_seller, is_offered,
  categories!products_category_id_fkey (name, slug)
`

export async function searchProducts(supabase, { query = '', categorySlug = null, maxPrice = null, limit = 6 } = {}) {
  let categoryProductIds = null

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
    if (cat?.id) {
      categoryProductIds = await getActiveProductIdsForCategory(supabase, cat.id)
      if (!categoryProductIds.length) return []
    }
  }

  let dbQuery = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (categoryProductIds) {
    dbQuery = dbQuery.in('id', categoryProductIds)
  } else {
    const term = query.trim()
    if (term.length >= 2) {
      const searchTerm = `%${term}%`
      dbQuery = dbQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
    }
  }

  const fetchLimit = maxPrice || categoryProductIds ? Math.max(limit * 5, 40) : limit * 4
  dbQuery = dbQuery.limit(fetchLimit)

  const { data, error } = await dbQuery
  if (error) throw new Error(error.message)

  let rows = data || []
  rows = rows.filter(isPricedProduct)
  if (maxPrice) {
    rows = rows.filter((row) => finalPrice(row) <= maxPrice)
  }

  return attachImages(supabase, rows.slice(0, limit))
}

export async function getBestsellers(supabase, limit = 6) {
  const fetchLimit = limit * 5

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('best_seller', true)
    .order('rating', { ascending: false })
    .limit(fetchLimit)

  if (error) throw new Error(error.message)

  let rows = takePricedProducts(data || [], limit)
  if (!rows.length) {
    const fallback = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .gt('price', 0)
      .order('rating', { ascending: false })
      .limit(fetchLimit)
    rows = takePricedProducts(fallback.data || [], limit)
  }

  return attachImages(supabase, rows)
}

export async function getOffers(supabase, limit = 6) {
  const fetchLimit = limit * 5

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .or('is_offered.eq.true,discount_price.not.is.null')
    .order('rating', { ascending: false })
    .limit(fetchLimit)

  if (error) throw new Error(error.message)
  return attachImages(supabase, takePricedProducts(data || [], limit))
}

export async function getStores(supabase) {
  const { data } = await supabase
    .from('stores')
    .select('name, address, city, state, postal_code, phone')
    .order('id')
    .limit(5)

  return data || []
}
