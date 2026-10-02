import { createSupabaseServerClient } from '../../lib/supabaseClient'
import { getAllBlogPosts } from '../../lib/blogPosts'
import { getPublicSiteUrl } from '../../lib/siteUrl'

// Tag / sub-category pages that exist on the site but are not always in categories table
const EXTRA_CATEGORY_SLUGS = [
  'bunk-beds',
  'sofa-cum-beds',
  'metal-cots',
  'folding-beds',
  'wooden-beds',
  'futon-beds',
  'diwan-cum-beds',
  'sofa-beds',
  'space-saving-furniture',
  'office-chairs',
  'study-chairs',
  'foldable-chairs',
  'rocking-chairs',
  'lazy-chairs',
  'recliner-sofas',
  'corner-sofas',
  'diwans',
  '2-seater',
  '3-1-1-sofas',
  'cushion-sofas',
  'coffee-tables',
  'foldable-tables',
  'study-tables',
  'study-office-tables',
  'dressing-tables',
  'shoe-racks',
  'book-shelves',
  'book-racks',
  'tv-racks',
  'wardrobes',
  'dining-sets',
  'folding-dinings',
  'wooden-dinings',
]

function safeIso(value) {
  const d = value ? new Date(value) : new Date()
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

/** Escape XML special chars so bare & in slugs (e.g. study-&-office-tables) does not break the sitemap */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function locTag(url) {
  return `<loc>${escapeXml(url)}</loc>`
}

async function fetchAllActiveProductSlugs(supabase) {
  const pageSize = 1000
  let from = 0
  const all = []

  for (;;) {
    const { data, error } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) {
      console.error('Sitemap products fetch error:', error.message)
      break
    }

    if (!data?.length) break
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return all
}

export async function GET() {
  const baseUrl = getPublicSiteUrl()
  const today = new Date().toISOString()

  let products = []
  let categories = []

  try {
    const supabase = createSupabaseServerClient()

    products = await fetchAllActiveProductSlugs(supabase)

    const { data: categoryRows, error: catError } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)

    if (catError) {
      console.error('Sitemap categories fetch error:', catError.message)
    } else {
      categories = categoryRows || []
    }
  } catch (error) {
    console.error('Sitemap DB connection error:', error)
  }

  try {
    const blogPosts = getAllBlogPosts()
    const latestBlogDate = safeIso(
      Math.max(
        ...blogPosts.map((p) => new Date(p.updatedAt || p.publishedAt).getTime()),
        Date.now()
      )
    )

    const staticUrls = [
      [baseUrl, today, 'daily', '1.0'],
      [`${baseUrl}/products`, today, 'daily', '0.95'],
      [`${baseUrl}/store-locator`, today, 'monthly', '0.9'],
      [`${baseUrl}/blog`, latestBlogDate, 'weekly', '0.8'],
      [`${baseUrl}/about`, null, 'monthly', '0.7'],
      [`${baseUrl}/contact`, null, 'monthly', '0.7'],
      [`${baseUrl}/faq`, null, 'monthly', '0.6'],
      [`${baseUrl}/bulk-orders`, null, 'monthly', '0.6'],
      [`${baseUrl}/franchise`, null, 'monthly', '0.5'],
      [`${baseUrl}/shipping-info`, null, 'monthly', '0.5'],
      [`${baseUrl}/returns-policy`, null, 'monthly', '0.5'],
      [`${baseUrl}/terms`, null, 'yearly', '0.4'],
      [`${baseUrl}/privacy-policy`, null, 'yearly', '0.4'],
    ]

    const urlEntry = (url, lastmod, changefreq, priority) => {
      let entry = `  <url>\n    ${locTag(url)}\n`
      if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`
      entry += `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`
      return entry
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    staticUrls.forEach(([url, lastmod, changefreq, priority]) => {
      sitemap += urlEntry(url, lastmod, changefreq, priority)
    })

    blogPosts.forEach((post) => {
      sitemap += urlEntry(
        `${baseUrl}/blog/${post.slug}`,
        safeIso(post.updatedAt || post.publishedAt),
        'monthly',
        '0.7'
      )
    })

    const categorySlugs = new Set([
      ...(categories.map((c) => c.slug).filter(Boolean)),
      ...EXTRA_CATEGORY_SLUGS,
    ])

    ;[...categorySlugs].forEach((slug) => {
      sitemap += urlEntry(
        `${baseUrl}/products/category/${slug}`,
        today,
        'weekly',
        '0.8'
      )
    })

    products.forEach((product) => {
      if (!product?.slug) return
      sitemap += urlEntry(
        `${baseUrl}/products/${product.slug}`,
        safeIso(product.created_at),
        'weekly',
        '0.7'
      )
    })

    sitemap += '</urlset>'

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)

    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    ${locTag(baseUrl)}
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    ${locTag(`${baseUrl}/products`)}
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new Response(basicSitemap, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }
}
