/**
 * Checks that the public anon key cannot write catalog tables.
 * Reads .env.local locally; does not print keys.
 */
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const file = path.join(__dirname, '..', '.env.local')
  const out = {}
  if (!fs.existsSync(file)) throw new Error('Missing .env.local')
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    out[t.slice(0, i)] = t.slice(i + 1).replace(/^"|"$/g, '')
  }
  return out
}

async function rest(url, key, pathname, method, body) {
  const res = await fetch(`${url}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, text: (await res.text()).slice(0, 240) }
}

async function main() {
  const env = loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing public Supabase env')

  const read = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  })
  console.log('anon SELECT products:', read.status, read.ok ? 'OK (shop can still read)' : (await read.text()).slice(0, 200))

  const slug = `rls-probe-${Date.now()}`
  const ins = await rest(url, anon, 'products', 'POST', {
    name: 'rls-probe-do-not-keep',
    slug,
    price: 1,
  })
  console.log('anon INSERT products:', ins.status, ins.text || '(empty)')

  if (ins.status >= 200 && ins.status < 300) {
    const service = env.SUPABASE_SERVICE_ROLE_KEY
    if (service) {
      await rest(url, service, `products?slug=eq.${slug}`, 'DELETE')
      console.log('cleaned probe row with service role')
    }
    console.log('FAIL: anon can still write catalog. Run sql/fix_sec01_catalog_rls.sql in Supabase SQL Editor.')
    process.exit(1)
  }
  console.log('PASS: anon cannot insert into products.')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
