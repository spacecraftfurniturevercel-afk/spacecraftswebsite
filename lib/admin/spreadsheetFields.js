/** Column + payload definitions for the admin product spreadsheet */

export const OFFER_PRESETS = [
  'Limited time deal',
  'Festival Offer',
  'Diwali Offer',
  'Christmas Offer',
  'New Year Offer',
  'Summer Sale',
  'Clearance Sale',
]

export const COLUMN_GROUPS = {
  core: { label: 'Core', default: true },
  details: { label: 'Details', default: true },
  flags: { label: 'Flags & offers', default: false },
  shipping: { label: 'Shipping', default: false },
  seo: { label: 'SEO', default: false },
}

export const SPREADSHEET_COLUMNS = [
  { key: 'name', label: 'Name', group: 'core', type: 'text', required: true, width: 160 },
  { key: 'slug', label: 'Slug', group: 'core', type: 'text', width: 140 },
  { key: 'sku', label: 'SKU', group: 'core', type: 'text', width: 90 },
  { key: 'price', label: 'Price ₹', group: 'core', type: 'number', width: 90 },
  { key: 'discount_price', label: 'Sale ₹', group: 'core', type: 'number', width: 90 },
  { key: 'stock', label: 'Stock', group: 'core', type: 'number', width: 70 },
  { key: 'is_active', label: 'Active', group: 'core', type: 'bool', width: 70 },
  { key: 'category_id', label: 'Category', group: 'core', type: 'category', width: 130 },
  { key: 'brand_id', label: 'Brand', group: 'core', type: 'brand', width: 120 },
  { key: 'images', label: 'Images', group: 'core', type: 'images', width: 80 },
  { key: 'short_description', label: 'Short desc', group: 'details', type: 'textarea', width: 160 },
  { key: 'description', label: 'Description', group: 'details', type: 'textarea', width: 200 },
  { key: 'material', label: 'Material', group: 'details', type: 'text', width: 140 },
  { key: 'delivery_info', label: 'Delivery info', group: 'details', type: 'text', width: 140 },
  { key: 'care_instructions', label: 'Care', group: 'details', type: 'textarea', width: 140 },
  { key: 'tags', label: 'Tags', group: 'details', type: 'tags', width: 140 },
  { key: 'warranty_period', label: 'Warranty (mo)', group: 'details', type: 'number', width: 90 },
  { key: 'warranty_type', label: 'Warranty type', group: 'details', type: 'text', width: 100 },
  { key: 'best_seller', label: 'Best seller', group: 'flags', type: 'bool', width: 80 },
  { key: 'is_offered', label: 'Offered', group: 'flags', type: 'bool', width: 70 },
  { key: 'is_featured', label: 'Featured', group: 'flags', type: 'bool', width: 70 },
  { key: 'is_new_arrival', label: 'New arrival', group: 'flags', type: 'bool', width: 90 },
  { key: 'offer_name', label: 'Offer name', group: 'flags', type: 'offer', width: 130 },
  { key: 'shipping_weight', label: 'Wt (kg)', group: 'shipping', type: 'number', width: 80 },
  { key: 'shipping_length', label: 'Len (cm)', group: 'shipping', type: 'number', width: 80 },
  { key: 'shipping_width', label: 'Wid (cm)', group: 'shipping', type: 'number', width: 80 },
  { key: 'shipping_height', label: 'Ht (cm)', group: 'shipping', type: 'number', width: 80 },
  { key: 'shipping_box_count', label: 'Boxes', group: 'shipping', type: 'number', width: 70 },
  { key: 'meta_title', label: 'Meta title', group: 'seo', type: 'text', width: 140 },
  { key: 'meta_description', label: 'Meta desc', group: 'seo', type: 'textarea', width: 160 },
]

export const TRACKED_FIELD_KEYS = SPREADSHEET_COLUMNS
  .filter((c) => c.type !== 'images')
  .map((c) => c.key)

export const BULK_EDIT_FIELDS = SPREADSHEET_COLUMNS.filter(
  (c) => c.type !== 'images' && c.key !== 'name' && c.key !== 'slug'
)

export function tagsToString(tags) {
  if (!tags) return ''
  if (Array.isArray(tags)) return tags.join(', ')
  return String(tags)
}

export function tagsFromString(str) {
  if (!str || !String(str).trim()) return []
  return String(str)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function snapshotFromProduct(p) {
  return {
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price === '' || p.price == null ? '' : String(p.price),
    discount_price: p.discount_price === '' || p.discount_price == null ? '' : String(p.discount_price),
    stock: p.stock ?? 0,
    is_active: p.is_active !== false,
    category_id: p.category_id || '',
    brand_id: p.brand_id || '',
    short_description: p.short_description || '',
    description: p.description || '',
    material: p.material || '',
    delivery_info: p.delivery_info || '',
    care_instructions: p.care_instructions || '',
    tags: tagsToString(p.tags),
    warranty_period: p.warranty_period ?? '',
    warranty_type: p.warranty_type || 'Standard',
    best_seller: !!p.best_seller,
    is_offered: !!p.is_offered,
    is_featured: !!p.is_featured,
    is_new_arrival: !!p.is_new_arrival,
    offer_name: p.offer_name || '',
    shipping_weight: p.shipping_weight ?? '',
    shipping_length: p.shipping_length ?? '',
    shipping_width: p.shipping_width ?? '',
    shipping_height: p.shipping_height ?? '',
    shipping_box_count: p.shipping_box_count ?? 1,
    meta_title: p.meta_title || '',
    meta_description: p.meta_description || '',
  }
}

export function normalizeField(field, val) {
  const col = SPREADSHEET_COLUMNS.find((c) => c.key === field)
  if (col?.type === 'bool') return !!val
  if (field === 'tags') return tagsToString(tagsFromString(val))
  if (field === 'category_id' || field === 'brand_id') {
    return val === '' || val == null ? '' : String(val)
  }
  if (field === 'stock' || field === 'warranty_period' || field === 'shipping_box_count') {
    return String(parseInt(val, 10) || 0)
  }
  if (['price', 'discount_price', 'shipping_weight'].includes(field)) {
    if (val === '' || val == null) return ''
    const n = parseFloat(val)
    return Number.isNaN(n) ? '' : String(n)
  }
  if (['shipping_length', 'shipping_width', 'shipping_height'].includes(field)) {
    if (val === '' || val == null) return ''
    const n = parseInt(val, 10)
    return Number.isNaN(n) ? '' : String(n)
  }
  return String(val ?? '').trim()
}

export function buildDbPayload(row) {
  const slug = (row.slug && row.slug.trim()) ? row.slug.trim() : ''
  const payload = {
    name: row.name?.trim(),
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
    description: row.description?.trim() || null,
    short_description: row.short_description?.trim() || null,
    material: row.material?.trim() || null,
    delivery_info: row.delivery_info?.trim() || null,
    care_instructions: row.care_instructions?.trim() || null,
    tags: tagsFromString(row.tags),
    warranty_period: row.warranty_period !== '' && row.warranty_period != null
      ? parseInt(row.warranty_period, 10)
      : 12,
    warranty_type: row.warranty_type?.trim() || 'Standard',
    best_seller: !!row.best_seller,
    is_offered: !!row.is_offered,
    is_featured: !!row.is_featured,
    is_new_arrival: !!row.is_new_arrival,
    offer_name: row.offer_name?.trim() || null,
    shipping_weight: row.shipping_weight !== '' && row.shipping_weight != null
      ? parseFloat(row.shipping_weight)
      : null,
    shipping_length: row.shipping_length !== '' && row.shipping_length != null
      ? parseInt(row.shipping_length, 10)
      : null,
    shipping_width: row.shipping_width !== '' && row.shipping_width != null
      ? parseInt(row.shipping_width, 10)
      : null,
    shipping_height: row.shipping_height !== '' && row.shipping_height != null
      ? parseInt(row.shipping_height, 10)
      : null,
    shipping_box_count: row.shipping_box_count !== '' && row.shipping_box_count != null
      ? parseInt(row.shipping_box_count, 10)
      : 1,
    meta_title: row.meta_title?.trim() || null,
    meta_description: row.meta_description?.trim() || null,
  }
  return payload
}
