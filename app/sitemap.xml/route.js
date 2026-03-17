import { createSupabaseServerClient } from '../../lib/supabaseClient'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacecraftsfurniture.in'
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch all products
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Fetch all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/store-locator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`

    // Add category pages
    categories?.forEach(cat => {
      sitemap += `  <url>
    <loc>${baseUrl}/products/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    })

    // Add product pages
    products?.forEach(product => {
      sitemap += `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${new Date(product.created_at).toISOString()}</lastmod>
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
