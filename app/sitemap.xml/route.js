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
  'study-&-office-tables',
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

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${baseUrl}/store-locator</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${latestBlogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/bulk-orders</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/franchise</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/shipping-info</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/returns-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
`

    blogPosts.forEach((post) => {
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${safeIso(post.updatedAt || post.publishedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    const categorySlugs = new Set([
      ...(categories.map((c) => c.slug).filter(Boolean)),
      ...EXTRA_CATEGORY_SLUGS,
    ])

    ;[...categorySlugs].forEach((slug) => {
      sitemap += `  <url>
    <loc>${baseUrl}/products/category/${encodeURI(slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    })

    products.forEach((product) => {
      if (!product?.slug) return
      sitemap += `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${safeIso(product.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    sitemap += '</urlset>'

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)

    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
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
