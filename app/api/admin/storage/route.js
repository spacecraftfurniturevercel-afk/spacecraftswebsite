import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  createSupabaseRouteHandlerClient,
  createSupabaseServerClient,
} from '../../../../lib/supabaseClient'
import {
  createStorageClient,
  fetchAllImageRows,
  getAccount,
  getActiveAccountId,
  getImageDistribution,
  listAccounts,
  missingSecondaryEnv,
  parseStorageUrl,
  publicUrlFor,
} from '../../../../lib/storage/dualStorage'

export const maxDuration = 60

/**
 * GET  /api/admin/storage — account config + how many image URLs each account serves
 * POST /api/admin/storage — { action: 'switch' | 'set-distribution' | 'verify', ... }
 *
 * Switching only rewrites the host + bucket prefix of product_images.url. The storage
 * path stays identical, so the files already present in both accounts keep working.
 */

function isAdmin(user) {
  return (
    user?.email === process.env.ADMIN_EMAIL ||
    user?.email === process.env.ADMIN_EMAIL_2 ||
    user?.email?.includes('@admin')
  )
}

async function requireAdmin(request) {
  const sessionClient = createSupabaseRouteHandlerClient(request)
  const {
    data: { user },
  } = await sessionClient.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!isAdmin(user)) {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }
  return { user }
}

function publicAccountInfo(account) {
  return {
    id: account.id,
    label: account.label,
    url: account.url || null,
    bucket: account.bucket,
    configured: account.configured,
  }
}

/**
 * Names (never values) of the SECONDARY_* variables visible to this runtime, with the
 * length of each. Distinguishes "variable not injected into the deployment" from
 * "variable name has a typo or stray whitespace".
 */
function envDiagnostics() {
  return Object.keys(process.env)
    .filter((k) => /secondary/i.test(k))
    .sort()
    .map((k) => `${JSON.stringify(k)} → ${String(process.env[k] || '').length} chars`)
}

export async function GET(request) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const supabase = createSupabaseServerClient()
    const distribution = await getImageDistribution(supabase)
    const active = await getActiveAccountId(supabase)

    return NextResponse.json({
      accounts: listAccounts().map(publicAccountInfo),
      distribution,
      active,
      missing_env: missingSecondaryEnv(),
      env_diagnostics: envDiagnostics(),
    })
  } catch (err) {
    console.error('[admin/storage] GET', err)
    return NextResponse.json({ error: err.message || 'Failed to read storage status' }, { status: 500 })
  }
}

/**
 * Re-point image URLs so that roughly `secondaryPercent` of them are served by the
 * secondary account. Rows are ordered by id, so the split is deterministic and
 * repeatable — running the same percentage twice changes nothing.
 */
async function applyDistribution(supabase, secondaryPercent) {
  const rows = await fetchAllImageRows(supabase)

  const managed = []
  let skipped = 0
  for (const row of rows) {
    const parsed = parseStorageUrl(row.url)
    if (!parsed?.path || !parsed.accountId) {
      skipped += 1
      continue
    }
    managed.push({ ...row, path: parsed.path, currentAccount: parsed.accountId })
  }

  const total = managed.length
  const secondaryCount = Math.round((total * secondaryPercent) / 100)
  // Highest ids move to secondary first, so a 0 → 50 → 100 % ramp is additive.
  const cutoff = total - secondaryCount

  const updates = []
  managed.forEach((row, index) => {
    const targetId = index < cutoff ? 'primary' : 'secondary'
    if (row.currentAccount === targetId) return
    const target = getAccount(targetId)
    const url = publicUrlFor(target, row.path)
    if (!url) return
    updates.push({ id: row.id, url })
  })

  const chunkSize = 25
  let updated = 0
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize)
    const results = await Promise.all(
      chunk.map((u) => supabase.from('product_images').update({ url: u.url }).eq('id', u.id))
    )
    const failure = results.find((r) => r.error)
    if (failure?.error) throw new Error(failure.error.message)
    updated += chunk.length
  }

  return { total, updated, skipped, secondary_percent: secondaryPercent }
}

/** List every object stored under the prefixes the DB actually uses. */
async function listStoredPaths(account, prefixes) {
  const client = createStorageClient(account)
  const found = new Set()

  for (const prefix of prefixes) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await client.storage
        .from(account.bucket)
        .list(prefix, { limit: 1000, offset })
      if (error) throw new Error(`${account.label}: ${error.message}`)
      if (!data?.length) break
      for (const entry of data) {
        if (!entry.id && !entry.metadata) continue // folder placeholder
        found.add(prefix ? `${prefix}/${entry.name}` : entry.name)
      }
      if (data.length < 1000) break
    }
  }

  return found
}

async function verifyAccount(supabase, accountId) {
  const account = getAccount(accountId)
  if (!account?.configured) throw new Error(`Account "${accountId}" is not configured`)

  const rows = await fetchAllImageRows(supabase)
  const paths = []
  for (const row of rows) {
    const parsed = parseStorageUrl(row.url)
    if (parsed?.path) paths.push(parsed.path)
  }

  const unique = [...new Set(paths)]
  const prefixes = new Set()
  for (const p of unique) {
    const idx = p.lastIndexOf('/')
    prefixes.add(idx === -1 ? '' : p.slice(0, idx))
  }

  const stored = await listStoredPaths(account, prefixes)
  const missing = unique.filter((p) => !stored.has(p))

  // A file missing here but present in the other account can be copied across. A file
  // missing from both is a broken database row that syncing cannot fix.
  const otherId = accountId === 'primary' ? 'secondary' : 'primary'
  const other = getAccount(otherId)
  let copyable = missing
  let brokenEverywhere = []

  if (missing.length && other?.configured) {
    const otherStored = await listStoredPaths(other, prefixes)
    copyable = missing.filter((p) => otherStored.has(p))
    brokenEverywhere = missing.filter((p) => !otherStored.has(p))
  }

  return {
    account: accountId,
    checked: unique.length,
    present: unique.length - missing.length,
    missing_count: missing.length,
    missing: missing.slice(0, 50),
    copyable_count: copyable.length,
    copyable: copyable.slice(0, 50),
    broken_everywhere_count: brokenEverywhere.length,
    broken_everywhere: brokenEverywhere.slice(0, 50),
    // Switching is safe when nothing would newly break — rows already broken in the
    // other account look identical before and after a switch.
    safe_to_switch: copyable.length === 0,
    ready: missing.length === 0,
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const action = body.action

    const supabase = createSupabaseServerClient()

    if (action === 'verify') {
      const result = await verifyAccount(supabase, body.account || 'secondary')
      return NextResponse.json(result)
    }

    let percent
    if (action === 'switch') {
      if (body.target !== 'primary' && body.target !== 'secondary') {
        return NextResponse.json({ error: 'target must be primary or secondary' }, { status: 400 })
      }
      percent = body.target === 'secondary' ? 100 : 0
    } else if (action === 'set-distribution') {
      percent = Number(body.secondary_percent)
      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        return NextResponse.json({ error: 'secondary_percent must be 0-100' }, { status: 400 })
      }
      percent = Math.round(percent)
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    if (percent > 0) {
      const secondary = getAccount('secondary')
      if (!secondary?.configured) {
        return NextResponse.json(
          { error: `Secondary account not configured. Missing: ${missingSecondaryEnv().join(', ')}` },
          { status: 400 }
        )
      }
    }

    const result = await applyDistribution(supabase, percent)
    revalidatePath('/', 'layout')

    const distribution = await getImageDistribution(supabase)
    return NextResponse.json({ ...result, distribution, active: await getActiveAccountId(supabase) })
  } catch (err) {
    console.error('[admin/storage] POST', err)
    return NextResponse.json({ error: err.message || 'Storage update failed' }, { status: 500 })
  }
}
