import { createSupabaseServerClient } from '../../lib/supabaseClient'
import { getAllBlogPosts } from '../../lib/blogPosts'
import { getPublicSiteUrl } from '../../lib/siteUrl'

// High-priority category slugs for SEO
const PRIORITY_CATEGORIES = [
  'bunk-beds',
  'sofa-cum-beds',
  'beds',
  'chairs',
  'sofa-sets',
  'space-saving-furniture',
  'dining-sets',
  'tables',
]

const today = new Date().toISOString()

export async function GET() {
  const baseUrl = getPublicSiteUrl()
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch all active products with updated_at if available
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Fetch all active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)

    // Latest blog date for blog index lastmod
    const blogPosts = getAllBlogPosts()
    const latestBlogDate = new Date(
      Math.max(...blogPosts.map((p) => new Date(p.updatedAt || p.publishedAt).getTime()), Date.now())
    ).toISOString()

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Products listing -->
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- Store locator — high local SEO value -->
  <url>
    <loc>${baseUrl}/store-locator</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Blog index -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${latestBlogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- About -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2026-09-26T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Contact -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>2026-10-02T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- FAQ -->
  <url>
    <loc>${baseUrl}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Bulk orders -->
  <url>
    <loc>${baseUrl}/bulk-orders</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Franchise -->
  <url>
    <loc>${baseUrl}/franchise</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Shipping info -->
  <url>
    <loc>${baseUrl}/shipping-info</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Returns policy -->
  <url>
    <loc>${baseUrl}/returns-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Terms -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Privacy policy -->
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

`

    // Blog posts — sorted newest first
    blogPosts
      .slice()
      .sort((a, b) => new Date(b.updatedAt || b.publishedAt) - new Date(a.updatedAt || a.publishedAt))
      .forEach((post) => {
        const lastmod = new Date(post.updatedAt || post.publishedAt).toISOString()
        sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
      })

    // Priority category pages first, then the rest
    const prioritySlugs = new Set(PRIORITY_CATEGORIES)
    const allCategorySlugs = categories?.map((c) => c.slug) || []
    const orderedSlugs = [
      ...PRIORITY_CATEGORIES.filter((s) => allCategorySlugs.includes(s)),
      ...allCategorySlugs.filter((s) => !prioritySlugs.has(s)),
    ]

    orderedSlugs.forEach((slug) => {
      const isPriority = prioritySlugs.has(slug)
      sitemap += `  <url>
    <loc>${baseUrl}/products/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${isPriority ? '0.85' : '0.75'}</priority>
  </url>
`
    })

    // Product pages
    products?.forEach((product) => {
      const lastmod = new Date(product.updated_at || product.created_at).toISOString()
      sitemap += `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    sitemap += '</urlset>'

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    
    // Return basic sitemap if database fetch fails
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
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
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}
