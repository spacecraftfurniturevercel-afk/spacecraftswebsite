/**
 * Convert products JSON → CSV for /admin/csv-import upload.
 * Usage:
 *   node scripts/json-products-to-csv.mjs
 *   node scripts/json-products-to-csv.mjs products/products_3.json public/PRODUCTS_3_IMPORT.csv
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const headers = readFileSync(join(root, 'public/PRODUCT_BULK_UPDATE_TEMPLATE.csv'), 'utf8')
  .split('\n')[0]
  .trim()
  .split(',')

const jsonPath = process.argv[2] || 'products/products.json'
const outPath = process.argv[3] || 'public/FINAL_PRODUCTS_IMPORT.csv'

const products = JSON.parse(readFileSync(join(root, jsonPath), 'utf8'))

function csvEscape(v) {
  if (v == null || v === '') return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function cell(row, key) {
  const v = row[key]
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  return v
}

const lines = [headers.join(',')]
function defaultSlug(row) {
  if (row.slug?.trim()) return row.slug.trim()
  if (row.sku) {
    return String(row.sku)
      .trim()
      .toLowerCase()
      .replace(/\+/g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return ''
}

for (const p of products) {
  const row = { ...p }
  row.slug = defaultSlug(row)
  if (!row.upload_to) row.upload_to = 'both'
  if (row.replace_images === undefined || row.replace_images === null) row.replace_images = true
  lines.push(headers.map((h) => csvEscape(cell(row, h))).join(','))
}

const out = join(root, outPath)
writeFileSync(out, `${lines.join('\n')}\n`, 'utf8')
console.log(`Wrote ${products.length} products to ${out}`)
