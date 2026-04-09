import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import ProductDetailClient from '../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'

// Always fetch fresh data — never serve a stale cached product page
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = params
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), brands(name)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (!data) return { title: 'Product not found' }
    
    // Get first image
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', data.id)
      .order('position')
      .limit(1)
    
    return {
      title: `${data.name} - Spacecrafts Furniture`,
      description: data.description || `Buy ${data.name} online. Premium quality furniture at best prices.`,
      alternates: {
        canonical: `https://www.spacecraftsfurniture.in/products/${slug}`
      },
      openGraph: {
        title: data.name,
        description: data.description,
        url: `https://www.spacecraftsfurniture.in/products/${slug}`,
        images: images?.length ? [images[0].url] : []
      }
    }
  } catch (e) {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }) {
  const { slug } = params
  let product = null
  let images = []
  let category = null
  let brand = null
  let relatedProducts = []
  let reviews = []
  let variants = []
  let offers = []
  let warranties = []
  let emiOptions = []
  let stores = []
  let specifications = []
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch product with category and brand
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (!data) {
      notFound()
    }
    
    product = data
    category = data.categories
    brand = data.brands
    
    // Fetch product images
    const { data: imagesData } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('position')
    
    images = imagesData || []
    
    // Fetch variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position')
    
    variants = variantsData || []
    
    // Fetch offers
    const { data: offersData } = await supabase
      .from('product_offers')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position')
    
    offers = offersData || []
    
    // Fetch warranty options
    const { data: warrantiesData } = await supabase
      .from('warranty_options')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
    
    warranties = warrantiesData || []
    
    // Fetch EMI options
    const { data: emiData } = await supabase
      .from('emi_options')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('position')
    
    emiOptions = emiData || []
    
    // Fetch stores
    const { data: storesData } = await supabase
      .from('product_stores')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('distance_km')
    
    stores = storesData || []
    
    // Fetch specifications
    const { data: specsData } = await supabase
      .from('product_specifications')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('spec_category, position')
    
    specifications = specsData || []
    
    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    reviews = reviewsData || []
    
    // Fetch related products: same category first, then same brand if needed
    if (product.category_id) {
      // Try to get 4+ from same category
      const { data: categoryProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          brands (name, slug)
        `)
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .neq('id', product.id)
        .gte('stock', 1)
        .order('rating', { ascending: false })
        .limit(8)
      
      relatedProducts = categoryProducts || []

      // If less than 4, supplement with same brand products
      if (relatedProducts.length < 4 && product.brand_id) {
        const categoryIds = relatedProducts.map(p => p.id)
        const { data: brandProducts } = await supabase
          .from('products')
          .select(`
            *,
            categories (name, slug),
            brands (name, slug)
          `)
          .eq('brand_id', product.brand_id)
          .eq('is_active', true)
          .neq('id', product.id)
          .not('id', 'in', `(${categoryIds.join(',')})`)
          .gte('stock', 1)
          .order('rating', { ascending: false })
          .limit(4 - relatedProducts.length)
        
        relatedProducts = [...relatedProducts, ...(brandProducts || [])]
      }

      // Ensure we have at least 4
      relatedProducts = relatedProducts.slice(0, Math.max(4, relatedProducts.length))
      
      // Fetch images for related products
      if (relatedProducts.length > 0) {
        const relatedIds = relatedProducts.map(p => p.id)
        const { data: relatedImages } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', relatedIds)
          .order('position')
        
        relatedProducts = relatedProducts.map(p => ({
          ...p,
          images: relatedImages?.filter(img => img.product_id === p.id) || []
        }))
      }
    }
    
  } catch (e) {
    console.error('Error fetching product:', e)
    notFound()
  }

  // JSON-LD schema
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images?.map(i => i.url),
    description: product.description,
    sku: product.id?.toString(),
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    aggregateRating: product.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count
    } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.discount_price || product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://www.spacecraftsfurniture.in/products/${product.slug}`
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ProductDetailClient 
        product={product}
        images={images}
        category={category}
        brand={brand}
        variants={variants}
        offers={offers}
        warranties={warranties}
        emiOptions={emiOptions}
        stores={stores}
        specifications={specifications}
        relatedProducts={relatedProducts}
        reviews={reviews}
      />
    </>
  )
}
