/**
 * Download images from Google Drive or direct URLs and upload to dual Supabase storage.
 */

import {
  configuredAccounts,
  getAccount,
  publicUrlFor,
  uploadToAccounts,
} from './dualStorage'

const GDRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?(?:export=download&)?id=([^&]+)/,
  /docs\.google\.com\/uc\?id=([^&]+)/,
]

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false
  return GDRIVE_PATTERNS.some((re) => re.test(url))
}

export function extractGDriveFileId(url) {
  if (!url) return null
  for (const re of GDRIVE_PATTERNS) {
    const match = url.match(re)
    if (match?.[1]) return match[1]
  }
  return null
}

export function resolveUploadTargets(uploadTo) {
  const available = configuredAccounts().map((a) => a.id)
  if (!available.length) return []
  if (uploadTo === 'primary' || uploadTo === 'secondary') {
    return available.includes(uploadTo) ? [uploadTo] : []
  }
  return available
}

function extFromContentType(contentType) {
  if (contentType?.includes('png')) return 'png'
  if (contentType?.includes('webp')) return 'webp'
  if (contentType?.includes('gif')) return 'gif'
  return 'jpg'
}

/**
 * Import one image from a Google Drive link, HTTP URL, or storage filename.
 * Returns public URL stored in product_images, or null on failure.
 */
export async function importImageFromSource(raw, {
  slug,
  imageIndex,
  urlAccountId = 'primary',
  uploadTo = 'both',
}) {
  if (!raw || !String(raw).trim()) return null

  const source = String(raw).trim()
  const targets = resolveUploadTargets(uploadTo)
  if (!targets.length) return null

  let buffer
  let contentType = 'image/jpeg'
  let ext = 'jpg'

  if (isGoogleDriveUrl(source)) {
    const fileId = extractGDriveFileId(source)
    if (!fileId) return null

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

    try {
      const res = await fetch(downloadUrl, { redirect: 'follow', signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) return null
      contentType = res.headers.get('content-type') || 'image/jpeg'
      ext = extFromContentType(contentType)
      buffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      clearTimeout(timeout)
      console.error(`GDrive download failed for ${slug}-${imageIndex}:`, e.message)
      return null
    }
  } else if (source.startsWith('http://') || source.startsWith('https://')) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    try {
      const res = await fetch(source, { redirect: 'follow', signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) return null
      contentType = res.headers.get('content-type') || 'image/jpeg'
      if (!contentType.startsWith('image/')) return null
      ext = extFromContentType(contentType)
      buffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      clearTimeout(timeout)
      console.error(`URL download failed for ${slug}-${imageIndex}:`, e.message)
      return null
    }
  } else {
    // Filename already in storage bucket
    const owner = targets.includes(urlAccountId) ? urlAccountId : targets[0]
    return publicUrlFor(getAccount(owner), `products/${source}`)
  }

  const storagePath = `products/${slug}-${imageIndex}.${ext}`
  const { uploaded, failed } = await uploadToAccounts(targets, {
    path: storagePath,
    buffer,
    contentType,
  })

  if (failed.length) {
    console.error(
      `Storage upload failed for ${storagePath}:`,
      failed.map((f) => `${f.accountId}: ${f.error}`).join('; ')
    )
  }
  if (!uploaded.length) return null

  const owner = uploaded.includes(urlAccountId) ? urlAccountId : uploaded[0]
  return publicUrlFor(getAccount(owner), storagePath)
}

/** Collect image_1 … image_10 (and image_links comma-separated) from a CSV/import row */
export function collectImageSourcesFromRow(row) {
  const sources = []

  if (row.image_links) {
    String(row.image_links)
      .split(/[\n|,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => sources.push(s))
  }

  for (let i = 1; i <= 10; i += 1) {
    const raw = row[`image_${i}`]
    if (raw && String(raw).trim()) sources.push(String(raw).trim())
  }

  return sources
}

export function toBool(val) {
  if (!val) return false
  return ['true', '1', 'yes'].includes(String(val).toLowerCase())
}
