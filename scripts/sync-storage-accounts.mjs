/**
 * Mirror storage files between the primary and secondary Supabase accounts.
 *
 * Both accounts must hold the same files under the same paths — that is what makes the
 * admin "Image Storage" switch instant (it only rewrites the host part of each URL).
 *
 * Usage:
 *   node scripts/sync-storage-accounts.mjs                      # report differences only
 *   node scripts/sync-storage-accounts.mjs --apply              # copy primary -> secondary
 *   node scripts/sync-storage-accounts.mjs --apply --from=secondary --to=primary
 *   node scripts/sync-storage-accounts.mjs --apply --prefix=products --limit=50
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   SECONDARY_SUPABASE_URL, SECONDARY_SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_STORAGE_BUCKET / SECONDARY_SUPABASE_BUCKET (optional)
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.resolve('.env.local')
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  const raw = m ? m[1].trim().replace(/^["']|["']$/g, '') : null
  return raw || process.env[k] || null
}

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const argValue = (name, fallback) => {
  const found = args.find((a) => a.startsWith(`--${name}=`))
  return found ? found.split('=').slice(1).join('=') : fallback
}

const FROM = argValue('from', 'primary')
const TO = argValue('to', FROM === 'primary' ? 'secondary' : 'primary')
const PREFIX = argValue('prefix', '')
const LIMIT = Number(argValue('limit', '0'))
const DEFAULT_BUCKET = 'spacecraftsdigital'

const ACCOUNTS = {
  primary: {
    label: 'primary',
    url: get('NEXT_PUBLIC_SUPABASE_URL'),
    key: get('SUPABASE_SERVICE_ROLE_KEY'),
    bucket: get('SUPABASE_STORAGE_BUCKET') || DEFAULT_BUCKET,
  },
  secondary: {
    label: 'secondary',
    url: get('SECONDARY_SUPABASE_URL'),
    key: get('SECONDARY_SUPABASE_SERVICE_ROLE_KEY'),
    bucket: get('SECONDARY_SUPABASE_BUCKET') || DEFAULT_BUCKET,
  },
}

for (const id of [FROM, TO]) {
  const a = ACCOUNTS[id]
  if (!a) {
    console.error(`Unknown account "${id}". Use primary or secondary.`)
    process.exit(1)
  }
  if (!a.url || !a.key) {
    console.error(`Missing credentials for the ${id} account. Check .env.local.`)
    process.exit(1)
  }
}
if (FROM === TO) {
  console.error('--from and --to must be different accounts.')
  process.exit(1)
}

const clientFor = (a) => createClient(a.url, a.key, { auth: { persistSession: false } })
const source = { ...ACCOUNTS[FROM], client: clientFor(ACCOUNTS[FROM]) }
const target = { ...ACCOUNTS[TO], client: clientFor(ACCOUNTS[TO]) }

/** Recursively list every object in a bucket, returning a Map of path -> metadata. */
async function walk(account, prefix = '') {
  const files = new Map()
  const queue = [prefix]

  while (queue.length) {
    const dir = queue.shift()
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await account.client.storage
        .from(account.bucket)
        .list(dir, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
      if (error) throw new Error(`${account.label} list "${dir}": ${error.message}`)
      if (!data?.length) break

      for (const entry of data) {
        const full = dir ? `${dir}/${entry.name}` : entry.name
        const isFolder = !entry.id && !entry.metadata
        if (isFolder) queue.push(full)
        else files.set(full, entry)
      }

      if (data.length < 1000) break
    }
  }

  return files
}

function fmtMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

console.log(`Source: ${source.label} ${source.url} (bucket ${source.bucket})`)
console.log(`Target: ${target.label} ${target.url} (bucket ${target.bucket})`)
if (PREFIX) console.log(`Prefix: ${PREFIX}`)
console.log('')

const sourceFiles = await walk(source, PREFIX)
const targetFiles = await walk(target, PREFIX)

const missing = [...sourceFiles.keys()].filter((p) => !targetFiles.has(p))
const extra = [...targetFiles.keys()].filter((p) => !sourceFiles.has(p))

console.log(`${source.label}: ${sourceFiles.size} files`)
console.log(`${target.label}: ${targetFiles.size} files`)
console.log(`Missing in ${target.label}: ${missing.length}`)
console.log(`Only in ${target.label}: ${extra.length}`)

if (extra.length) {
  console.log('')
  console.log(`Files present only in ${target.label} (left untouched):`)
  extra.slice(0, 20).forEach((p) => console.log(`  ${p}`))
  if (extra.length > 20) console.log(`  …and ${extra.length - 20} more`)
}

if (!missing.length) {
  console.log('')
  console.log(`Both accounts are in sync. Safe to switch the image source.`)
  process.exit(0)
}

console.log('')
console.log(`Missing files (first 20):`)
missing.slice(0, 20).forEach((p) => console.log(`  ${p}`))
if (missing.length > 20) console.log(`  …and ${missing.length - 20} more`)

if (!APPLY) {
  console.log('')
  console.log(`Dry run. Re-run with --apply to copy ${missing.length} file(s) to ${target.label}.`)
  process.exit(0)
}

const todo = LIMIT > 0 ? missing.slice(0, LIMIT) : missing
console.log('')
console.log(`Copying ${todo.length} file(s) to ${target.label}…`)

let copied = 0
let failed = 0
let bytes = 0

for (let i = 0; i < todo.length; i += 1) {
  const filePath = todo[i]
  const label = `[${i + 1}/${todo.length}] ${filePath}`
  try {
    const { data: blob, error: dlErr } = await source.client.storage
      .from(source.bucket)
      .download(filePath)
    if (dlErr) throw new Error(`download: ${dlErr.message}`)

    const buffer = Buffer.from(await blob.arrayBuffer())
    const contentType =
      sourceFiles.get(filePath)?.metadata?.mimetype || blob.type || 'application/octet-stream'

    const { error: upErr } = await target.client.storage
      .from(target.bucket)
      .upload(filePath, buffer, { contentType, upsert: true, cacheControl: '31536000' })
    if (upErr) throw new Error(`upload: ${upErr.message}`)

    copied += 1
    bytes += buffer.length
    console.log(`${label} — ok (${(buffer.length / 1024).toFixed(0)} KB)`)
  } catch (e) {
    failed += 1
    console.log(`${label} — FAILED ${e.message}`)
  }
}

console.log('')
console.log(`Copied ${copied} file(s) (${fmtMb(bytes)}), ${failed} failed.`)
if (LIMIT > 0 && missing.length > todo.length) {
  console.log(`${missing.length - todo.length} file(s) still missing — re-run to continue.`)
}
