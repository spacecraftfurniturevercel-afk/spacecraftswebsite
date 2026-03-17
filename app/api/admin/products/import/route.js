import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'

// Helper: parse CSV text into array of objects
// Handles multi-line quoted fields (descriptions with newlines)
// When a row has more values than headers, merge overflow back into description
function fixOverflowRow(headers, values) {
  if (values.length <= headers.length) return values
  const descIdx = headers.indexOf('description')
  if (descIdx === -1) return values // no description column, can't fix
  const overflow = values.length - headers.length
  // Re-join the overflowed description fragments with commas
  const mergedDesc = values.slice(descIdx, descIdx + 1 + overflow).join(', ')
  return [
    ...values.slice(0, descIdx),
    mergedDesc,
    ...values.slice(descIdx + 1 + overflow)
  ]
}

function parseCSV(text) {
  const rows = []
  let headers = null
  let currentRow = ''
  let inQuotes = false

  // Process character by character to handle multi-line quoted fields
  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      // Check for escaped quote ""
      if (inQuotes && text[i + 1] === '"') {
        currentRow += '""'
        i++
      } else {
        inQuotes = !inQuotes
        currentRow += char
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of a logical row (not inside quotes)
      if (char === '\r' && text[i + 1] === '\n') i++ // skip \r\n
      if (currentRow.trim()) {
        let values = parseCSVLine(currentRow)
        if (!headers) {
          headers = values.map(h => h.trim())
        } else {
          values = fixOverflowRow(headers, values)
          const row = {}
          headers.forEach((header, idx) => {
            row[header] = values[idx]?.trim() || ''
          })
          rows.push(row)
        }
      }
      currentRow = ''
    } else {
      currentRow += char
    }
  }

  // Handle last row (no trailing newline)
  if (currentRow.trim() && headers) {
    let values = parseCSVLine(currentRow)
    values = fixOverflowRow(headers, values)
    const row = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() || ''
    })
    rows.push(row)
  }

  return rows
}

// Parse a single CSV line into fields (handles quoted fields)
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

// Auto-generate slug from product name
function generateSlug(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/&nbsp;/gi, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Check if a URL is a Google Drive share link
function isGoogleDriveUrl(url) {
  return url && /drive\.google\.com\/file\/d\//.test(url)
}

// Extract the Google Drive file ID from a share link
function extractGDriveFileId(url) {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return match ? match[1] : null
}

// Download image from Google Drive and upload to Supabase storage
// Returns the Supabase public URL, or null on failure
async function downloadAndUploadImage(supa, gdUrl, slug, imageIndex) {
  const fileId = extractGDriveFileId(gdUrl)
  if (!fileId) return null

  const bucket = 'spacecraftsdigital'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Google Drive direct download URL
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

  // Add 30s timeout per image to avoid hanging
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(downloadUrl, { redirect: 'follow', signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    // Determine extension from content type
    let ext = 'jpg'
    if (contentType.includes('png')) ext = 'png'
    else if (contentType.includes('webp')) ext = 'webp'

    const buffer = Buffer.from(await res.arrayBuffer())
    const storagePath = `products/${slug}-${imageIndex}.${ext}`

    // Upload to Supabase storage (upsert — overwrite if exists)
    const { error } = await supa.storage.from(bucket).upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })
    if (error) {
      console.error(`Storage upload failed for ${storagePath}:`, error.message)
      return null
    }

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`
  } catch (e) {
    clearTimeout(timeout)
    console.error(`Image download failed for ${slug}-${imageIndex}:`, e.message)
    return null
  }
}

// Convert cm to inches (1 inch = 2.54 cm)
function cmToInches(cm) {
  const val = parseFloat(cm)
  if (isNaN(val)) return null
  return Math.round(val / 2.54 * 100) / 100 // Round to 2 decimal places
}

// Clean up a description field:
// - Strips a leading "Product Name – Simple Description" / "Product Title" header line
//   that clients sometimes paste at the top of their description text
// - Normalizes multiple consecutive blank lines to a single blank line
// - Normalizes special typographic characters to plain equivalents for storage consistency
// - Trims leading/trailing whitespace
function cleanDescription(text) {
  if (!text) return text
  let desc = text.trim()

  // Strip common "Product Name – Simple Description" opener lines.
  // Matches a first line that looks like a title/heading (no sentence structure):
  // e.g. "Swing Two-Seater Metal Sofa – Simple Description"
  //      "Product Name – Description"   "Some Title – Overview"
  desc = desc.replace(/^[^\n]{0,120}[\u2013\u2014\-]{1,3}\s*(simple description|product description|description|overview|about|features)\s*\n+/i, '')
  // Also strip a first line that is just the product name repeated (contains no comma or period, < 80 chars)
  // followed by a blank line — heuristic: first line is ≤80 chars, second line is blank
  desc = desc.replace(/^(.{1,80})\n{2,}/, (match, firstLine) => {
    // If first line looks like a sentence (has period) keep it; otherwise strip it
    if (/[.,!?]/.test(firstLine)) return match
    return ''
  })

  // Normalize multiple blank lines (3+ newlines) down to 2
  desc = desc.replace(/\n{3,}/g, '\n\n')

  // Trim again after stripping
  return desc.trim()
}

// Strip a plain-text field of leading/trailing whitespace and normalize internal whitespace
function cleanField(val) {
  if (!val) return val
  return val.trim().replace(/\s+/g, ' ')
}

// Look up or create category/brand by name
// Category can be comma-separated (e.g., "Diwans, Sofa") — uses the first one as primary
function isValidName(str) {
  if (!str || str.length > 50) return false
  if (/\./.test(str)) return false // contains period — likely a sentence fragment
  if (/^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )/i.test(str)) return false
  return true
}

// Map sub-category names to main navigation categories
// Main categories: Beds, Chairs, Dining Sets, Sofa Sets, Tables, Wardrobe & Racks, Space Saving Furniture
const MAIN_CATEGORY_MAP = {
  // Beds
  'bunk beds': 'Beds',
  'futon beds': 'Beds',
  'diwan cum beds': 'Beds',
  'folding beds': 'Beds',
  'metal cots': 'Beds',
  'recliner folding beds': 'Beds',
  'sofa cum beds': 'Beds',
  'sofa beds': 'Beds',
  'wooden beds': 'Beds',
  'beds': 'Beds',

  // Chairs
  'foldable chairs': 'Chairs',
  'lazy chairs': 'Chairs',
  'office chairs': 'Chairs',
  'relax chair': 'Chairs',
  'rocking chairs': 'Chairs',
  'study chair': 'Chairs',
  'study chairs': 'Chairs',
  'chairs': 'Chairs',

  // Dining Sets
  'dining sets': 'Dining Sets',
  'dining tables': 'Dining Sets',
  'dining chairs': 'Dining Sets',
  'folding dinings': 'Dining Sets',
  'wooden dinings': 'Dining Sets',

  // Sofa Sets
  '2 seater': 'Sofa Sets',
  '3 1 1 sofas': 'Sofa Sets',
  '3+1+1 sofas': 'Sofa Sets',
  'corner sofas': 'Sofa Sets',
  'cushion sofas': 'Sofa Sets',
  'diwans': 'Sofa Sets',
  'recliner sofas': 'Sofa Sets',
  'sofa': 'Sofa Sets',
  'sofa sets': 'Sofa Sets',

  // Tables
  'coffee tables': 'Tables',
  'dressing tables': 'Tables',
  'foldable tables': 'Tables',
  'study & office tables': 'Tables',
  'study tables': 'Tables',
  'tables': 'Tables',

  // Wardrobe & Racks
  'wardrobes': 'Wardrobe & Racks',
  'book shelves': 'Wardrobe & Racks',
  'book racks': 'Wardrobe & Racks',
  'shoe racks': 'Wardrobe & Racks',
  'tv racks': 'Wardrobe & Racks',

  // Space Saving
  'space saving furniture': 'Space Saving Furniture',
}

// Resolve a CSV category string to a main category name
// e.g. "Diwans, Sofa, space saving furniture" → "Sofa Sets"
function resolveMainCategory(csvCategory) {
  if (!csvCategory) return null
  const parts = csvCategory.split(',').map(p => p.trim().toLowerCase())
  // Try each part (first non-"space saving" match wins)
  for (const part of parts) {
    if (part === 'space saving furniture') continue
    const mapped = MAIN_CATEGORY_MAP[part]
    if (mapped) return mapped
  }
  // Fallback: if only "space saving furniture"
  for (const part of parts) {
    const mapped = MAIN_CATEGORY_MAP[part]
    if (mapped) return mapped
  }
  // Last resort: use first part as-is if valid
  const first = csvCategory.split(',')[0].trim()
  return isValidName(first) ? first : null
}

// Extract sub-category tags from the CSV category string
function extractSubCategoryTags(csvCategory) {
  if (!csvCategory) return []
  return csvCategory.split(',').map(p => {
    const tag = p.trim().toLowerCase().replace(/\s+/g, '-')
    return tag
  }).filter(Boolean)
}

async function getOrCreateCategory(supa, name) {
  if (!name) return null
  const mainName = resolveMainCategory(name)
  if (!mainName) return null
  const slug = mainName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data: existing } = await supa.from('categories').select('id').eq('slug', slug).single()
  if (existing) return existing.id
  const { data: created } = await supa.from('categories').insert({ name: mainName, slug }).select('id').single()
  return created?.id || null
}

async function getOrCreateBrand(supa, name) {
  if (!name) return null
  const trimmed = name.trim()
  if (!isValidName(trimmed)) return null
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data: existing } = await supa.from('brands').select('id').eq('slug', slug).single()
  if (existing) return existing.id
  const { data: created } = await supa.from('brands').insert({ name: trimmed, slug }).select('id').single()
  return created?.id || null
}

function toBool(val) {
  if (!val) return false
  return ['true', '1', 'yes'].includes(String(val).toLowerCase())
}

function toNum(val) {
  if (!val || val === '') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

// Build product object — only includes fields that have values (for partial updates)
function buildProductData(row, { categoryId, brandId, tags, slug, isUpdate }) {
  const product = {}

  // Always set these
  product.name = row.name
  product.slug = slug

  if (categoryId !== null) product.category_id = categoryId
  if (brandId !== null) product.brand_id = brandId
  if (row.description) product.description = cleanDescription(row.description)
  if (row.price) product.price = toNum(row.price)
  if (row.discount_price) product.discount_price = toNum(row.discount_price)
  if (row.stock) product.stock = toNum(row.stock) || 0
  if (row.material) product.material = cleanField(row.material)
  if (row.warranty_months) product.warranty_period = toNum(row.warranty_months)
  if (row.warranty_type) product.warranty_type = cleanField(row.warranty_type)
  if (row.delivery_info) product.delivery_info = cleanField(row.delivery_info)
  if (tags && tags.length > 0) product.tags = tags
  if (row.best_seller) product.best_seller = toBool(row.best_seller)
  if (row.discount_price) product.is_offered = true
  if (row.is_active !== undefined && row.is_active !== '') product.is_active = toBool(row.is_active)
  if (row.mrp) product.mrp = toNum(row.mrp)
  if (row.price && !row.mrp) product.mrp = toNum(row.price)
  if (row.assembly_cost) product.assembly_cost = toNum(row.assembly_cost)
  if (row.assembly_time_hours) product.assembly_time = toNum(row.assembly_time_hours)
  if (row.care_instructions) product.care_instructions = cleanField(row.care_instructions)
  if (row.emi_enabled !== undefined && row.emi_enabled !== '') product.emi_enabled = toBool(row.emi_enabled)
  if (row.return_days) product.return_days = toNum(row.return_days)
  if (row.is_limited_stock) product.is_limited_stock = toBool(row.is_limited_stock)
  // Validate SKU: must be short alphanumeric code, reject sentence fragments
  if (row.sku) {
    const skuVal = row.sku.trim()
    if (skuVal.length <= 50 && !/\s{2,}/.test(skuVal) && !/\./.test(skuVal) && !/^(and |or |the |it |this |that )/i.test(skuVal)) {
      product.sku = skuVal
    }
  }

  // Build dimensions JSON — convert cm to inches
  const dimL = row.dimensions_length_cm || row.dimensions_length_m
  const dimW = row.dimensions_width_cm || row.dimensions_width_m
  const dimH = row.dimensions_height_cm || row.dimensions_height_m
  if (dimL || dimW || dimH) {
    product.dimensions = {
      length_cm: toNum(dimL),
      width_cm: toNum(dimW),
      height_cm: toNum(dimH),
      length_in: cmToInches(dimL),
      width_in: cmToInches(dimW),
      height_in: cmToInches(dimH),
    }
  }

  // For new products, set defaults for required fields not provided
  if (!isUpdate) {
    if (!product.price) product.price = 0
    if (product.stock === undefined) product.stock = 0
    if (product.warranty_period === undefined) product.warranty_period = 12
    if (product.warranty_type === undefined) product.warranty_type = 'Standard'
    if (product.is_active === undefined) product.is_active = true
    if (product.emi_enabled === undefined) product.emi_enabled = true
    if (product.return_days === undefined) product.return_days = 30
    if (product.assembly_cost === undefined) product.assembly_cost = 0
    if (product.is_limited_stock === undefined) product.is_limited_stock = false
  }

  return product
}

export const maxDuration = 300 // Allow up to 5 minutes for large imports

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: 'No CSV file uploaded' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
  }

  // Use streaming response to prevent timeout
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      }

      // Heartbeat: send a keepalive ping every 10s to prevent browser
      // from suspending the connection (ERR_NETWORK_IO_SUSPENDED)
      const heartbeat = setInterval(() => {
        try { send({ type: 'heartbeat' }) } catch {}
      }, 10000)

      const supa = createSupabaseServerClient()
      const results = { success: [], errors: [] }

      send({ type: 'start', total: rows.length })

      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx]
        try {
          if (!row.name) {
            results.errors.push({ name: '(empty)', error: 'Missing product name' })
            send({ type: 'skip', index: rowIdx + 1, name: '(empty)', reason: 'Missing product name' })
            continue
          }

          const slug = (row.slug && row.slug.trim()) ? row.slug.trim() : generateSlug(row.name)

          send({ type: 'progress', index: rowIdx + 1, total: rows.length, name: row.name, step: 'processing' })

          const categoryId = await getOrCreateCategory(supa, row.category || row.category_name)
          const brandId = await getOrCreateBrand(supa, row.brand || row.brand_name)

          const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : []
          // Add all sub-category names as tags for filtering
          const subCatTags = extractSubCategoryTags(row.category || row.category_name)
          subCatTags.forEach(tag => {
            if (tag && !tags.includes(tag)) tags.push(tag)
          })

          let existing = null
          if (row.sku && row.sku.trim()) {
            const { data } = await supa.from('products').select('id').eq('sku', row.sku.trim()).single()
            if (data) existing = data
          }
          if (!existing) {
            const { data } = await supa.from('products').select('id').eq('slug', slug).single()
            if (data) existing = data
          }

          const product = buildProductData(row, {
            categoryId,
            brandId,
            tags,
            slug,
            isUpdate: !!existing,
          })

          let productId
          if (existing) {
            const { data, error } = await supa.from('products').update(product).eq('id', existing.id).select('id').single()
            if (error) throw new Error(error.message)
            productId = data.id
          } else {
            const { data, error } = await supa.from('products').insert(product).select('id').single()
            if (error) throw new Error(error.message)
            productId = data.id
          }

          // Process images — only for NEW products; skip on update to preserve existing images
          const images = []
          const imageErrors = []
          if (!existing) {
            for (let i = 1; i <= 10; i++) {
              const raw = row[`image_${i}`]
              if (raw) {
                let url = raw
                if (isGoogleDriveUrl(raw)) {
                  send({ type: 'progress', index: rowIdx + 1, total: rows.length, name: row.name, step: `downloading image ${i}` })
                  const uploaded = await downloadAndUploadImage(supa, raw, slug, i)
                  if (uploaded) {
                    url = uploaded
                  } else {
                    imageErrors.push(`image_${i}: failed to download/upload`)
                    continue
                  }
                } else if (!raw.startsWith('http')) {
                  const bucket = 'spacecraftsdigital'
                  url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/products/${raw}`
                }
                images.push({
                  product_id: productId,
                  url,
                  alt: `${row.name} - Image ${i}`,
                  position: i - 1,
                })
              }
            }

            if (images.length > 0) {
              await supa.from('product_images').insert(images)
            }
          }

          // Variants
          const variants = []
          for (let i = 1; i <= 4; i++) {
            const colorName = row[`variant_${i}_color`] || row[`variant_${i}_color_name`]
            if (colorName) {
              variants.push({
                product_id: productId,
                variant_name: colorName,
                variant_type: 'color',
                price: toNum(row[`variant_${i}_price`]),
                stock: toNum(row[`variant_${i}_stock`]) || 0,
                is_active: true,
                position: i - 1,
              })
            }
          }
          if (variants.length > 0) {
            await supa.from('product_variants').delete().eq('product_id', productId)
            await supa.from('product_variants').insert(variants)
          }

          // Specifications
          const specs = []
          for (let i = 1; i <= 6; i++) {
            const specName = row[`spec_${i}_name`]
            const specValue = row[`spec_${i}_value`]
            if (specName && specValue) {
              specs.push({
                product_id: productId,
                spec_category: 'General',
                spec_name: specName,
                spec_value: specValue,
                position: i - 1,
                is_active: true,
              })
            }
          }
          if (specs.length > 0) {
            await supa.from('product_specifications').delete().eq('product_id', productId)
            await supa.from('product_specifications').insert(specs)
          }

          const successItem = {
            name: row.name,
            id: productId,
            slug,
            sku: row.sku || null,
            action: existing ? 'updated' : 'created',
            images: images.length,
            imageErrors: imageErrors.length > 0 ? imageErrors : undefined,
          }
          results.success.push(successItem)
          send({ type: 'done', index: rowIdx + 1, total: rows.length, ...successItem })
        } catch (rowErr) {
          results.errors.push({ name: row.name || '(unknown)', error: rowErr.message })
          send({ type: 'error', index: rowIdx + 1, name: row.name || '(unknown)', error: rowErr.message })
        }
      }

      clearInterval(heartbeat)

      send({
        type: 'complete',
        message: `Processed ${rows.length} rows: ${results.success.length} success, ${results.errors.length} errors`,
        results,
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
