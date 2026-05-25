import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}

const url = get('NEXT_PUBLIC_SUPABASE_URL')
const key = get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !key) {
  console.log('Missing env')
  process.exit(1)
}

const supa = createClient(url, key)

const { data: products, error: pErr, count } = await supa
  .from('products')
  .select('id, name, slug, category_id, is_active', { count: 'exact' })
  .eq('is_active', true)
  .limit(5)

console.log('Active products:', pErr?.message || `ok rows=${products?.length} total=${count}`)
if (products?.[0]) console.log('Sample:', products[0])

const { data: withJoin, error: jErr } = await supa
  .from('products')
  .select(`id, name, categories!products_category_id_fkey(id, name, slug), brands(id, name)`)
  .eq('is_active', true)
  .limit(3)

console.log('Join error:', jErr?.message || 'none')
withJoin?.forEach((p) => console.log(JSON.stringify(p)))

const { data: cats } = await supa.from('categories').select('id, name, slug, is_active').order('id')
console.log('Categories total:', cats?.length)

const slugs12 = [
  'beds', 'chairs', 'recliners', 'sofa-cum-beds', 'dining-sets', 'wardrobes',
  'office-furniture', 'center-tables', 'sofas', 'pooja-racks', 'bunk-beds', 'mattress',
]
console.log(
  '12 homepage cats:',
  cats?.filter((c) => slugs12.includes(c.slug)).map((c) => `${c.id}:${c.slug}:${c.is_active}`).join(', ')
)

const { error: pcErr, count: pcCount } = await supa
  .from('product_categories')
  .select('*', { count: 'exact', head: true })
console.log('product_categories:', pcErr?.message || `count=${pcCount}`)

const { count: nullCat } = await supa
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true)
  .is('category_id', null)
console.log('Active null category_id:', nullCat)

const { count: inactive } = await supa
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', false)
console.log('Inactive products:', inactive)

for (const id of [128, 133, 130]) {
  const { data: cat } = await supa.from('categories').select('id,slug,is_active').eq('id', id).maybeSingle()
  const { count: prodCount } = await supa
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('is_active', true)
  console.log(`Category ${id}:`, cat, 'active products:', prodCount)
}

const { data: bedsCat } = await supa.from('categories').select('id,slug,is_active').eq('slug', 'beds').maybeSingle()
console.log('Beds category:', bedsCat)
const { count: prodBeds } = await supa
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('category_id', bedsCat?.id)
  .eq('is_active', true)
console.log('Products with beds category_id:', prodBeds)

const { data: one, error: oneErr } = await supa
  .from('products')
  .select('id, slug, is_active, category_id, categories!products_category_id_fkey(id, slug, is_active)')
  .eq('slug', 'nova-sofa-bed-without-storage')
  .single()
console.log('Product page test:', oneErr?.message || one)
