/**
 * Dual Supabase Storage accounts.
 *
 * Product images live in two Supabase projects under identical storage paths, so an
 * image URL can be pointed at either project by swapping only the host + bucket
 * prefix. That lets bandwidth be split (or fully moved) between the two free-tier
 * accounts without re-uploading anything.
 *
 * Env vars:
 *   NEXT_PUBLIC_SUPABASE_URL            primary project URL
 *   SUPABASE_SERVICE_ROLE_KEY           primary service role key
 *   SUPABASE_STORAGE_BUCKET             optional, defaults to spacecraftsdigital
 *   SECONDARY_SUPABASE_URL              secondary project URL
 *   SECONDARY_SUPABASE_SERVICE_ROLE_KEY secondary service role key
 *   SECONDARY_SUPABASE_BUCKET           optional, defaults to spacecraftsdigital
 */

export const DEFAULT_BUCKET = 'spacecraftsdigital'

const PUBLIC_MARKER = '/storage/v1/object/public/'

function trimSlash(value) {
  return (value || '').trim().replace(/\/+$/, '')
}

function buildAccount(id, label, urlEnv, keyEnv, bucketEnv) {
  const url = trimSlash(urlEnv)
  const serviceKey = (keyEnv || '').trim()
  const bucket = (bucketEnv || '').trim() || DEFAULT_BUCKET
  return {
    id,
    label,
    url,
    serviceKey,
    bucket,
    configured: Boolean(url && serviceKey),
    publicBase: url ? `${url}${PUBLIC_MARKER}${bucket}/` : '',
  }
}

export function getAccounts() {
  return {
    primary: buildAccount(
      'primary',
      'Primary Supabase',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_STORAGE_BUCKET
    ),
    secondary: buildAccount(
      'secondary',
      'Secondary Supabase',
      process.env.SECONDARY_SUPABASE_URL,
      process.env.SECONDARY_SUPABASE_SERVICE_ROLE_KEY,
      process.env.SECONDARY_SUPABASE_BUCKET
    ),
  }
}

export function getAccount(id) {
  const accounts = getAccounts()
  return accounts[id] || null
}

export function listAccounts() {
  const accounts = getAccounts()
  return [accounts.primary, accounts.secondary]
}

export function configuredAccounts() {
  return listAccounts().filter((a) => a.configured)
}

/** Which env vars are still missing for the secondary account. */
export function missingSecondaryEnv() {
  const missing = []
  if (!trimSlash(process.env.SECONDARY_SUPABASE_URL)) missing.push('SECONDARY_SUPABASE_URL')
  if (!(process.env.SECONDARY_SUPABASE_SERVICE_ROLE_KEY || '').trim()) {
    missing.push('SECONDARY_SUPABASE_SERVICE_ROLE_KEY')
  }
  return missing
}

export function createStorageClient(account) {
  if (!account?.configured) {
    throw new Error(`Storage account "${account?.id || 'unknown'}" is not configured`)
  }
  const { createClient } = require('@supabase/supabase-js')
  return createClient(account.url, account.serviceKey, { auth: { persistSession: false } })
}

export function publicUrlFor(account, storagePath) {
  if (!account?.url) return null
  return `${account.publicBase}${storagePath}`
}

/**
 * Split a stored image URL into the account that serves it and its storage path.
 * Returns null for local (`/categories/...`) or third-party URLs.
 */
export function parseStorageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null

  for (const account of listAccounts()) {
    if (account.publicBase && imageUrl.startsWith(account.publicBase)) {
      return { accountId: account.id, path: imageUrl.slice(account.publicBase.length).split('?')[0] }
    }
  }

  // Unknown Supabase host (e.g. a third project or a renamed bucket) — still parse the
  // path so the URL can be reported, but do not claim it belongs to a known account.
  const idx = imageUrl.indexOf(PUBLIC_MARKER)
  if (idx !== -1) {
    const rest = imageUrl.slice(idx + PUBLIC_MARKER.length)
    const slash = rest.indexOf('/')
    if (slash !== -1) {
      return { accountId: null, path: rest.slice(slash + 1).split('?')[0] }
    }
  }

  return null
}

export function accountIdForUrl(imageUrl) {
  return parseStorageUrl(imageUrl)?.accountId || null
}

/** Rewrite a stored image URL so it is served by `targetId`. Returns null if not possible. */
export function mapUrlToAccount(imageUrl, targetId) {
  const parsed = parseStorageUrl(imageUrl)
  if (!parsed?.path) return null
  const target = getAccount(targetId)
  if (!target?.url) return null
  if (parsed.accountId === targetId) return imageUrl
  return publicUrlFor(target, parsed.path)
}

/**
 * Upload the same buffer to every requested account under the same storage path.
 * Returns { uploaded: [accountId], failed: [{ accountId, error }] }.
 */
export async function uploadToAccounts(accountIds, { path, buffer, contentType }) {
  const uploaded = []
  const failed = []

  for (const id of accountIds) {
    const account = getAccount(id)
    if (!account?.configured) {
      failed.push({ accountId: id, error: 'not configured' })
      continue
    }
    try {
      const client = createStorageClient(account)
      const { error } = await client.storage.from(account.bucket).upload(path, buffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: true,
        cacheControl: '31536000',
      })
      if (error) throw new Error(error.message)
      uploaded.push(id)
    } catch (err) {
      failed.push({ accountId: id, error: err.message })
    }
  }

  return { uploaded, failed }
}

/**
 * Count how many product_images rows are served by each account.
 * `supabase` must be a service-role client for the primary project (the DB lives there).
 */
export async function getImageDistribution(supabase) {
  const accounts = getAccounts()
  const counts = { primary: 0, secondary: 0, other: 0 }

  const { count: total } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })

  for (const key of ['primary', 'secondary']) {
    const account = accounts[key]
    if (!account.publicBase) continue
    const { count } = await supabase
      .from('product_images')
      .select('id', { count: 'exact', head: true })
      .like('url', `${account.publicBase}%`)
    counts[key] = count || 0
  }

  counts.other = Math.max((total || 0) - counts.primary - counts.secondary, 0)
  counts.total = total || 0
  return counts
}

/** The account currently serving most images — treated as the live source. */
export async function getActiveAccountId(supabase) {
  try {
    const counts = await getImageDistribution(supabase)
    if (counts.secondary > counts.primary) return 'secondary'
    return 'primary'
  } catch (_) {
    return 'primary'
  }
}

/** Read every product_images row (paginated) with its parsed account + path. */
export async function fetchAllImageRows(supabase) {
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
