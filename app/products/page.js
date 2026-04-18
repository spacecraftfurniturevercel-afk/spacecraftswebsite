import { createSupabaseServerClient } from '../../lib/supabaseClient'
import ProductsClient from '../../components/ProductsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'All Products - Spacecrafts Furniture | Shop Premium Furniture Online',
  description: 'Browse our complete collection of premium furniture. Shop sofas, beds, dining sets, office furniture, sofa cum beds, space-saving furniture and more. Free delivery across India.',
  keywords: 'furniture online, buy furniture, sofas, beds, dining sets, sofa cum beds, space saving furniture, office chairs, study tables, premium furniture India',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/products'
  },
  openGraph: {
    title: 'All Products - Spacecrafts Furniture',
    description: 'Browse our complete collection of premium furniture. Best prices guaranteed.',
    url: 'https://www.spacecraftsfurniture.in/products',
    type: 'website',
  }
}

const PRODUCTS_PER_PAGE = 16

// Sub-categories stored as tags on products — grouped by main category
const SUB_CATEGORIES = [
  { slug: '2-seater', name: '2 Seater', parent: 'Sofa Sets' },
  { slug: '3-1-1-sofas', name: '3+1+1 Sofas', parent: 'Sofa Sets' },
  { slug: 'book-racks', name: 'Book Racks', parent: 'Wardrobe & Racks' },
  { slug: 'book-shelves', name: 'Book Shelves', parent: 'Wardrobe & Racks' },
  { slug: 'bunk-beds', name: 'Bunk Beds', parent: 'Beds' },
  { slug: 'coffee-tables', name: 'Coffee Tables', parent: 'Tables' },
  { slug: 'corner-sofas', name: 'Corner Sofas', parent: 'Sofa Sets' },
  { slug: 'cushion-sofas', name: 'Cushion Sofas', parent: 'Sofa Sets' },
  { slug: 'diwans', name: 'Diwans', parent: 'Sofa Sets' },
  { slug: 'diwan-cum-beds', name: 'Diwan Cum Beds', parent: 'Beds' },
  { slug: 'dining-sets', name: 'Dining Sets', parent: 'Dining Sets' },
  { slug: 'dressing-tables', name: 'Dressing Tables', parent: 'Tables' },
  { slug: 'foldable-chairs', name: 'Foldable Chairs', parent: 'Chairs' },
  { slug: 'foldable-tables', name: 'Foldable Tables', parent: 'Tables' },
  { slug: 'folding-beds', name: 'Folding Beds', parent: 'Beds' },
  { slug: 'folding-dinings', name: 'Folding Dinings', parent: 'Dining Sets' },
  { slug: 'futon-beds', name: 'Futon Beds', parent: 'Beds' },
  { slug: 'lazy-chairs', name: 'Lazy Chairs', parent: 'Chairs' },
  { slug: 'metal-cots', name: 'Metal Cots', parent: 'Beds' },
  { slug: 'office-chairs', name: 'Office Chairs', parent: 'Chairs' },
  { slug: 'recliner-folding-beds', name: 'Recliner Folding Beds', parent: 'Beds' },
  { slug: 'recliner-sofas', name: 'Recliner Sofas', parent: 'Sofa Sets' },
  { slug: 'rocking-chairs', name: 'Rocking Chairs', parent: 'Chairs' },
  { slug: 'shoe-racks', name: 'Shoe Racks', parent: 'Wardrobe & Racks' },
  { slug: 'sofa-beds', name: 'Sofa Beds', parent: 'Beds' },
  { slug: 'sofa-cum-beds', name: 'Sofa Cum Beds', parent: 'Beds' },
  { slug: 'space-saving-furniture', name: 'Space Saving Furniture', parent: 'Space Saving Furniture' },
  { slug: 'study-chairs', name: 'Study Chairs', parent: 'Chairs' },
  { slug: 'study-tables', name: 'Study Tables', parent: 'Tables' },
  { slug: 'study-&-office-tables', name: 'Study & Office Tables', parent: 'Tables' },
  { slug: 'tv-racks', name: 'TV Racks', parent: 'Wardrobe & Racks' },
  { slug: 'wardrobes', name: 'Wardrobes', parent: 'Wardrobe & Racks' },
  { slug: 'wooden-beds', name: 'Wooden Beds', parent: 'Beds' },
  { slug: 'wooden-dinings', name: 'Wooden Dinings', parent: 'Dining Sets' },
]

export default async function ProductsPage({ searchParams }) {
  let products = []
  let categories = []
  let brands = []
  let totalCount = 0
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch categories for filter
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
    categories = categoriesData || []
    
    // Fetch brands for filter (brands table has no is_active column)
    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name')
    brands = brandsData || []
    
    // Pagination
    const page = parseInt(searchParams?.page || '1', 10)
    const from = (page - 1) * PRODUCTS_PER_PAGE
    const to = from + PRODUCTS_PER_PAGE - 1

    // Build query based on filters
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true)
    
    // Filter by multiple categories
    if (searchParams?.categories) {
      const categoryArray = searchParams.categories.split(',')
      const categoryIds = categories
        .filter(c => categoryArray.includes(c.slug))
        .map(c => c.id)
      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds)
      }
    }
    
    // Filter by multiple brands
    if (searchParams?.brands) {
      const brandArray = searchParams.brands.split(',')
      const brandIds = brands
        .filter(b => brandArray.includes(b.slug))
        .map(b => b.id)
      if (brandIds.length > 0) {
        query = query.in('brand_id', brandIds)
      }
    }
    
    // Filter by sub-categories (product type tags)
    if (searchParams?.subcategories) {
      const subCatArray = searchParams.subcategories.split(',')
      query = query.overlaps('tags', subCatArray)
    }

    // Filter by nav tags (living-room, bedroom, etc.)
    const tagFilter = searchParams?.tags || searchParams?.tag
    if (tagFilter) {
      const tagArray = tagFilter.split(',')
      query = query.overlaps('tags', tagArray)
    }

    // Filter by price range
    if (searchParams?.minPrice) {
      query = query.gte('price', parseFloat(searchParams.minPrice))
    }
    if (searchParams?.maxPrice) {
      query = query.lte('price', parseFloat(searchParams.maxPrice))
    }
    
    // Search query
    const searchQuery = searchParams?.q || searchParams?.search
    if (searchQuery) {
      // Use name + description ilike only — tags.cs is unreliable for multi-word terms
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }
    
    // Sort
    const sortBy = searchParams?.sort || 'rating-desc'
    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'name-asc':
        query = query.order('name', { ascending: true })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating-desc':
      default:
        query = query.order('rating', { ascending: false })
    }
    
    // Apply pagination
    query = query.range(from, to)
    
    const { data, count } = await query
    products = data || []
    totalCount = count || 0
    
    // Fetch product images for each product
    if (products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('position')
      
      // Attach images to products
      products = products.map(product => ({
        ...product,
        images: imagesData?.filter(img => img.product_id === product.id) || []
      }))
    }
    
  } catch (error) {
    console.error('Error fetching products:', error)
  }

  const currentPage = parseInt(searchParams?.page || '1', 10)
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'All Products - Spacecrafts Furniture',
            description: 'Browse our complete collection of premium furniture.',
            url: 'https://www.spacecraftsfurniture.in/products',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Spacecrafts Furniture',
              url: 'https://spacecraftsfurniture.in'
            },
            numberOfItems: totalCount
          })
        }}
      />
      <ProductsClient 
        initialProducts={products} 
        categories={categories}
        brands={brands}
        subCategories={SUB_CATEGORIES}
        searchParams={searchParams}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </>
  )
}
