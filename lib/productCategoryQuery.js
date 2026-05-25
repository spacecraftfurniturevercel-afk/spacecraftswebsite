/**
 * Multi-category product queries.
 * products.category_id = primary category (legacy)
 * product_categories = many-to-many (additional / secondary categories)
 */

/** Required after product_categories exists — avoids ambiguous embed error */
export const PRODUCT_CATEGORY_EMBED = 'categories!products_category_id_fkey'
export const PRODUCT_CATEGORY_EMBED_FULL = `${PRODUCT_CATEGORY_EMBED} (id, name, slug)`
export const PRODUCT_CATEGORY_EMBED_NAME = `${PRODUCT_CATEGORY_EMBED} (name)`
export const PRODUCT_CATEGORY_EMBED_NAME_SLUG = `${PRODUCT_CATEGORY_EMBED} (name, slug)`

export async function getActiveProductIdsForCategory(supabase, categoryId) {
  if (!categoryId) return []

  const ids = new Set()

  const { data: primaryRows } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .eq('category_id', categoryId)

  primaryRows?.forEach((row) => ids.add(row.id))

  const { data: junctionRows, error } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', categoryId)

  if (!error && junctionRows?.length) {
    const junctionIds = junctionRows.map((row) => row.product_id)
    const { data: activeLinked } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .in('id', junctionIds)

    activeLinked?.forEach((row) => ids.add(row.id))
  }

  return Array.from(ids)
}

export async function getActiveProductIdsForCategories(supabase, categoryIds = []) {
  if (!categoryIds.length) return []

  const ids = new Set()
  for (const categoryId of categoryIds) {
    const categoryIdsForOne = await getActiveProductIdsForCategory(supabase, categoryId)
    categoryIdsForOne.forEach((id) => ids.add(id))
  }
  return Array.from(ids)
}

export function buildCategoryCountMap(activeProducts = [], junctionRows = []) {
  const activeSet = new Set(activeProducts.map((p) => p.id))
  const bucket = {}

  function addProduct(categoryId, productId) {
    if (!categoryId || !activeSet.has(productId)) return
    if (!bucket[categoryId]) bucket[categoryId] = new Set()
    bucket[categoryId].add(productId)
  }

  activeProducts.forEach((p) => addProduct(p.category_id, p.id))
  junctionRows.forEach((row) => addProduct(row.category_id, row.product_id))

  const countMap = {}
  Object.keys(bucket).forEach((key) => {
    countMap[key] = bucket[key].size
  })
  return countMap
}

export async function syncProductCategories(supabase, productId, categoryIds = [], primaryCategoryId = null) {
  const uniqueIds = [...new Set(categoryIds.filter(Boolean).map(Number))]
  const primaryId = primaryCategoryId ? Number(primaryCategoryId) : null

  if (primaryId && !uniqueIds.includes(primaryId)) {
    uniqueIds.unshift(primaryId)
  }

  await supabase.from('product_categories').delete().eq('product_id', productId)

  if (!uniqueIds.length) return

  const rows = uniqueIds.map((categoryId) => ({
    product_id: productId,
    category_id: categoryId,
    is_primary: categoryId === primaryId,
  }))

  await supabase.from('product_categories').upsert(rows, { onConflict: 'product_id,category_id' })
}
