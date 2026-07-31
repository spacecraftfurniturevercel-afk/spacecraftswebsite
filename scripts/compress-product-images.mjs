/**
 * Compress oversized product images in Supabase Storage (in place).
 *
 * Usage:
 *   node scripts/compress-product-images.mjs --dry-run
 *   node scripts/compress-product-images.mjs --apply
 *   node scripts/compress-product-images.mjs --apply --min-kb=150 --max-width=1200
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const envPath = path.resolve('.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const DRY = args.includes('--dry-run') || !APPLY
const minKb = Number((args.find((a) => a.startsWith('--min-kb=')) || '--min-kb=150').split('=')[1])
const maxWidth = Number((args.find((a) => a.startsWith('--max-width=')) || '--max-width=1200').split('=')[1])
const quality = Number((args.find((a) => a.startsWith('--quality=')) || '--quality=80').split('=')[1])
const limit = Number((args.find((a) => a.startsWith('--limit=')) || '--limit=0').split('=')[1])

const url = get('NEXT_PUBLIC_SUPABASE_URL')
const key = get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const BUCKET = get('SUPABASE_STORAGE_BUCKET') || 'spacecraftsdigital'
const minBytes = minKb * 1024
const supabase = createClient(url, key)

// Images are mirrored across two Supabase accounts under identical paths. Compressed
// files must land in both, otherwise switching the image source shows stale files.
const secondaryUrl = get('SECONDARY_SUPABASE_URL')
const secondaryKey = get('SECONDARY_SUPABASE_SERVICE_ROLE_KEY')
const SECONDARY_BUCKET = get('SECONDARY_SUPABASE_BUCKET') || 'spacecraftsdigital'
const secondary = secondaryUrl && secondaryKey ? createClient(secondaryUrl, secondaryKey) : null

const ACCOUNTS = {
  primary: { id: 'primary', client: supabase, bucket: BUCKET, base: `${url}/storage/v1/object/public/${BUCKET}/` },
}
if (secondary) {
  ACCOUNTS.secondary = {
    id: 'secondary',
    client: secondary,
    bucket: SECONDARY_BUCKET,
    base: `${secondaryUrl}/storage/v1/object/public/${SECONDARY_BUCKET}/`,
  }
}

function accountForUrl(publicUrl) {
  for (const account of Object.values(ACCOUNTS)) {
    if (publicUrl.startsWith(account.base)) return account
  }
  return ACCOUNTS.primary
}

function storagePathFromPublicUrl(publicUrl) {
  const marker = '/object/public/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  const rest = publicUrl.slice(idx + marker.length)
  const slash = rest.indexOf('/')
  if (slash === -1) return null
  return decodeURIComponent(rest.slice(slash + 1).split('?')[0])
}

async function fetchAllImageRows() {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, url, product_id')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    if (!data?.length) break
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows
}

async function fetchWithRetry(imageUrl, attempts = 4) {
  let lastErr
  for (let i = 0; i < attempts; i += 1) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      const res = await fetch(imageUrl, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastErr
}

async function getRemoteSize(imageUrl) {
  try {
    const head = await fetch(imageUrl, { method: 'HEAD' })
    const len = head.headers.get('content-length')
    if (len) return Number(len)
  } catch (_) {}
  const buf = await fetchWithRetry(imageUrl, 2)
  return buf.length
}

async function compressBuffer(input, preferWebp = false) {
  const img = sharp(input, { failOn: 'none' }).rotate()
  const meta = await img.metadata()
  const format = (meta.format || 'jpeg').toLowerCase()

  let pipeline = img.resize({
    width: maxWidth,
    height: maxWidth,
    fit: 'inside',
    withoutEnlargement: true,
  })

  // Photos saved as PNG are often huge — convert those (and any preferWebp) to WebP
  const useWebp = preferWebp || format === 'png' || format === 'webp'

  let contentType = 'image/jpeg'
  let outExt = 'jpg'

  if (useWebp) {
    pipeline = pipeline.webp({ quality, effort: 4 })
    contentType = 'image/webp'
    outExt = 'webp'
  } else if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true })
    contentType = 'image/png'
    outExt = 'png'
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
    contentType = 'image/jpeg'
    outExt = 'jpg'
  }

  const output = await pipeline.toBuffer()
  return { output, contentType, outExt, width: meta.width, height: meta.height, format }
}

function replaceExt(storagePath, newExt) {
  return storagePath.replace(/\.[^.]+$/, `.${newExt}`)
}

function publicUrlFor(storagePath, account = ACCOUNTS.primary) {
  return `${account.base}${storagePath}`
}

function fmtKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function fmtMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

console.log(`Mode: ${DRY ? 'DRY-RUN (no uploads)' : 'APPLY (will overwrite Storage files)'}`)
console.log(`Threshold: > ${minKb} KB | max width: ${maxWidth}px | quality: ${quality}`)
console.log('')

const rows = await fetchAllImageRows()
console.log(`product_images rows: ${rows.length}`)

const sized = []
let checked = 0
for (const row of rows) {
  if (!row.url) continue
  checked += 1
  if (checked % 50 === 0) process.stdout.write(`\rChecking sizes… ${checked}/${rows.length}`)
  try {
    const size = await getRemoteSize(row.url)
    sized.push({ ...row, size, path: storagePathFromPublicUrl(row.url) })
  } catch (err) {
    console.warn(`\nSkip id=${row.id}: ${err.message}`)
  }
}
process.stdout.write('\n')

sized.sort((a, b) => b.size - a.size)

const buckets = {
  under150: sized.filter((r) => r.size < 150 * 1024).length,
  from150to500: sized.filter((r) => r.size >= 150 * 1024 && r.size < 500 * 1024).length,
  from500to1mb: sized.filter((r) => r.size >= 500 * 1024 && r.size < 1024 * 1024).length,
  from1to2mb: sized.filter((r) => r.size >= 1024 * 1024 && r.size < 2 * 1024 * 1024).length,
  over2mb: sized.filter((r) => r.size >= 2 * 1024 * 1024).length,
}

const totalBytes = sized.reduce((s, r) => s + r.size, 0)
const oversized = sized.filter((r) => r.size > minBytes)
const oversizedBytes = oversized.reduce((s, r) => s + r.size, 0)

console.log('\n=== Size distribution ===')
console.log(`< 150 KB:     ${buckets.under150}`)
console.log(`150–500 KB:   ${buckets.from150to500}`)
console.log(`500 KB–1 MB:  ${buckets.from500to1mb}`)
console.log(`1–2 MB:       ${buckets.from1to2mb}`)
console.log(`> 2 MB:       ${buckets.over2mb}`)
console.log(`Total size:   ${fmtMb(totalBytes)}`)
console.log(`Over ${minKb} KB: ${oversized.length} images = ${fmtMb(oversizedBytes)}`)

console.log('\n=== Top 15 largest ===')
sized.slice(0, 15).forEach((r, i) => {
  console.log(`${String(i + 1).padStart(2)}. ${fmtMb(r.size).padStart(8)}  ${r.path || r.url}`)
})

if (DRY) {
  console.log('\nDry-run only. To compress and overwrite Storage files, run:')
  console.log('  node scripts/compress-product-images.mjs --apply')
  console.log('Optional: --min-kb=150 --max-width=1200 --quality=80 --limit=20')
  process.exit(0)
}

let targets = oversized
if (limit > 0) targets = targets.slice(0, limit)

console.log(`\nCompressing ${targets.length} images…`)
let saved = 0
let failed = 0
let bytesBefore = 0
let bytesAfter = 0

for (let i = 0; i < targets.length; i += 1) {
  const row = targets[i]
  const label = `[${i + 1}/${targets.length}] id=${row.id}`
  if (!row.path) {
    console.warn(`${label} no storage path — skip`)
    failed += 1
    continue
  }

  try {
    const input = await fetchWithRetry(row.url)
    // Prefer WebP for anything over 500 KB (especially PNG photos)
    const preferWebp = input.length >= 500 * 1024 || /\.png$/i.test(row.path)
    const { output, contentType, outExt } = await compressBuffer(input, preferWebp)

    // Only upload if meaningfully smaller (>10% savings)
    if (output.length >= input.length * 0.9) {
      console.log(`${label} skip (already efficient) ${fmtKb(input.length)} → ${fmtKb(output.length)}`)
      continue
    }

    const newPath = replaceExt(row.path, outExt)
    const rowAccount = accountForUrl(row.url)

    // Write the compressed file to every configured account, keeping paths identical
    for (const account of Object.values(ACCOUNTS)) {
      const { error } = await account.client.storage.from(account.bucket).upload(newPath, output, {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      })
      if (error) throw new Error(`${account.id} upload: ${error.message}`)
    }

    // Keep the row on whichever account already served it
    const newUrl = publicUrlFor(newPath, rowAccount)
    if (newUrl !== row.url) {
      const { error: dbErr } = await supabase
        .from('product_images')
        .update({ url: newUrl })
        .eq('id', row.id)
      if (dbErr) throw new Error(`DB update: ${dbErr.message}`)
    }

    // Remove old file from both accounts if the path changed (e.g. .png → .webp)
    if (newPath !== row.path) {
      for (const account of Object.values(ACCOUNTS)) {
        await account.client.storage.from(account.bucket).remove([row.path])
      }
    }

    bytesBefore += input.length
    bytesAfter += output.length
    saved += 1
    const pct = Math.round((1 - output.length / input.length) * 100)
    console.log(`${label} ${fmtKb(input.length)} → ${fmtKb(output.length)} (-${pct}%)  ${row.path} → ${newPath}`)
    await new Promise((r) => setTimeout(r, 200))
  } catch (err) {
    failed += 1
    console.warn(`${label} FAIL: ${err.message}`)
  }
}

console.log('\n=== Done ===')
console.log(`Compressed: ${saved}`)
console.log(`Failed/skipped: ${failed}`)
console.log(`Saved about: ${fmtMb(bytesBefore - bytesAfter)} (from ${fmtMb(bytesBefore)} → ${fmtMb(bytesAfter)})`)
console.log('PNG→WebP files update product_images.url automatically.')
console.log('Hard-refresh the site if old large images still appear (CDN cache).')
