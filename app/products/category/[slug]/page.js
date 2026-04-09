import { createSupabaseServerClient } from '../../../../lib/supabaseClient'
import ProductsClient from '../../../../components/ProductsClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Cross-category collections — matched via tag overlaps regardless of DB category_id
const COLLECTION_TAGS = {
  'space-saving-furniture': [
    'bunk-beds',
    'folding-beds',
    'sofa-cum-beds',
    'foldable-tables',
    'foldable-chairs',
    'folding-dinings',
    'space-saving-furniture',
    'space-saving',
  ],
}

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

// SEO-friendly category descriptions
const categoryMeta = {
  'bunk-beds': {
    title: 'Bunk Beds',
    description: 'Shop premium bunk beds — space-saving designs for kids rooms, hostels & small spaces. Strong metal & wooden frames with safety rails. Free delivery.',
    h1: 'Bunk Beds'
  },
  'futon-beds': {
    title: 'Futon Beds',
    description: 'Buy futon beds online — versatile sofa-to-bed furniture. Compact, stylish & perfect for guest rooms. Premium quality at best prices.',
    h1: 'Futon Beds'
  },
  'diwan-cum-beds': {
    title: 'Diwan Cum Beds',
    description: 'Shop diwan cum beds — multipurpose daybed furniture with storage. Elegant designs for living rooms & bedrooms. Best prices online.',
    h1: 'Diwan Cum Beds'
  },
  'folding-beds': {
    title: 'Folding Beds',
    description: 'Buy folding beds online — portable, foldable bed designs for small apartments & guest use. Easy storage, strong frames. Free delivery.',
    h1: 'Folding Beds'
  },
  'metal-cots': {
    title: 'Metal Cots',
    description: 'Shop metal cots — durable iron & steel bed frames. Classic & modern designs at factory prices. Strong, long-lasting & affordable.',
    h1: 'Metal Cots'
  },
  'recliner-folding-beds': {
    title: 'Recliner Folding Beds',
    description: 'Buy recliner folding beds — adjustable recliner beds that fold for easy storage. Premium comfort meets space-saving design.',
    h1: 'Recliner Folding Beds'
  },
  'sofa-cum-beds': {
    title: 'Sofa Cum Beds',
    description: 'Shop sofa cum beds — convertible sofa beds for living rooms. 2-in-1 furniture saving space & money. Top brands at best prices.',
    h1: 'Sofa Cum Beds'
  },
  'wooden-beds': {
    title: 'Wooden Beds',
    description: 'Buy wooden beds online — solid sheesham, teak & engineered wood bed frames. King, queen & single sizes. Premium craftsmanship.',
    h1: 'Wooden Beds'
  },
  'foldable-chairs': {
    title: 'Foldable Chairs',
    description: 'Shop foldable chairs — portable folding chairs for home, office & outdoor. Lightweight, sturdy & easy to store. Best prices.',
    h1: 'Foldable Chairs'
  },
  'lazy-chairs': {
    title: 'Lazy Chairs',
    description: 'Buy lazy chairs online — ultra-comfortable lounge chairs & bean bags. Perfect for reading, gaming & relaxing. Premium comfort.',
    h1: 'Lazy Chairs'
  },
  'office-chairs': {
    title: 'Office Chairs',
    description: 'Shop ergonomic office chairs — adjustable height, lumbar support & breathable mesh. Work-from-home & office seating solutions.',
    h1: 'Office Chairs'
  },
  'relax-chair': {
    title: 'Relax Chairs',
    description: 'Buy relax chairs online — comfortable reclining & relaxation chairs. Cushioned seating for ultimate comfort at home.',
    h1: 'Relax Chairs'
  },
  'rocking-chairs': {
    title: 'Rocking Chairs',
    description: 'Shop rocking chairs — classic wooden & modern rocking chairs for balcony, living room & nursery. Handcrafted quality.',
    h1: 'Rocking Chairs'
  },
  'study-chair': {
    title: 'Study Chairs',
    description: 'Buy study chairs online — comfortable seating for students & kids. Ergonomic designs with back support. Affordable prices.',
    h1: 'Study Chairs',
    tagSlug: 'study-chairs'
  },
  'dining-tables': {
    title: 'Dining Tables',
    description: 'Shop dining tables — 2, 4, 6 & 8 seater dining tables in wood, glass & marble. Modern & classic designs for every home.',
    h1: 'Dining Tables'
  },
  'dining-chairs': {
    title: 'Dining Chairs',
    description: 'Buy dining chairs online — stylish & comfortable dining room chairs. Wood, metal & upholstered options. Best prices.',
    h1: 'Dining Chairs'
  },
  'folding-dinings': {
    title: 'Folding Dining Sets',
    description: 'Shop folding dining sets — space-saving foldable dining tables & chairs. Perfect for small apartments & kitchens.',
    h1: 'Folding Dining Sets'
  },
  'shoe-racks': {
    title: 'Shoe Racks',
    description: 'Buy shoe racks online — organize your footwear with metal, wooden & foldable shoe stands. Multiple tiers & modern designs.',
    h1: 'Shoe Racks'
  },
  '2-seater': {
    title: '2 Seater Sofas',
    description: 'Shop 2 seater sofas — compact loveseats perfect for small living rooms. Fabric & leatherette options. Premium comfort.',
    h1: '2 Seater Sofas'
  },
  '3-1-1-sofas': {
    title: '3+1+1 Sofa Sets',
    description: 'Buy 3+1+1 sofa sets online — complete living room sofa sets with 3-seater & two single seats. Best prices & free delivery.',
    h1: '3+1+1 Sofa Sets'
  },
  'corner-sofas': {
    title: 'Corner Sofas',
    description: 'Shop corner sofas — L-shaped sectional sofas for living rooms. Space-efficient designs with premium cushioning & fabrics.',
    h1: 'Corner Sofas'
  },
  'cushion-sofas': {
    title: 'Cushion Sofas',
    description: 'Buy cushion sofas online — extra-soft cushioned sofa sets for ultimate comfort. Modern designs at affordable prices.',
    h1: 'Cushion Sofas'
  },
  'diwans': {
    title: 'Diwans',
    description: 'Shop diwans online — traditional & modern diwan sets with mattress & cushions. Perfect for living rooms & guest rooms.',
    h1: 'Diwans'
  },
  'recliner-sofas': {
    title: 'Recliner Sofas',
    description: 'Buy recliner sofas online — manual & motorized recliner sofa sets. Luxury comfort with footrest & adjustable backrest.',
    h1: 'Recliner Sofas'
  },
  'coffee-tables': {
    title: 'Coffee Tables',
    description: 'Shop coffee tables — modern centre tables for living room. Glass, wooden & marble top designs. Affordable prices.',
    h1: 'Coffee Tables'
  },
  'dressing-tables': {
    title: 'Dressing Tables',
    description: 'Buy dressing tables online — vanity tables with mirror & storage. Modern & classic designs for bedrooms. Best prices.',
    h1: 'Dressing Tables'
  },
  'foldable-tables': {
    title: 'Foldable Tables',
    description: 'Shop foldable tables — portable folding tables for study, dining & multipurpose use. Space-saving & easy to store.',
    h1: 'Foldable Tables'
  },
  'study-office-tables': {
    title: 'Study & Office Tables',
    description: 'Buy study & office tables online — work desks, computer tables & writing desks. Ergonomic designs for productivity.',
    h1: 'Study & Office Tables',
    tagSlug: 'study-&-office-tables'
  },
  'wardrobes': {
    title: 'Wardrobes',
    description: 'Shop wardrobes online — single, double & triple door wardrobes. Wooden & engineered wood with mirror & drawers.',
    h1: 'Wardrobes'
  },
  'book-shelves': {
    title: 'Book Shelves',
    description: 'Buy book shelves online — open, wall-mounted & ladder bookshelves. Organize your books in style. Modern designs.',
    h1: 'Book Shelves'
  },
  'book-racks': {
    title: 'Book Racks',
    description: 'Shop book racks — compact & freestanding book storage solutions. Metal & wooden options for home & office.',
    h1: 'Book Racks'
  },
  'tv-racks': {
    title: 'TV Racks',
    description: 'Buy TV racks & entertainment units online — TV stands with storage for modern living rooms. Wall-mounted & floor options.',
    h1: 'TV Racks'
  },
  'study-chairs': {
    title: 'Study Chairs',
    description: 'Buy study chairs online — comfortable seating for students & study rooms. Ergonomic designs with back support.',
    h1: 'Study Chairs'
  },
  'study-tables': {
    title: 'Study Tables',
    description: 'Shop study tables online — sturdy study desks for students & home offices. Compact, foldable & modern designs.',
    h1: 'Study Tables'
  },
  'sofa-beds': {
    title: 'Sofa Beds',
    description: 'Buy sofa beds online — convertible sofa-to-bed furniture. Space saving & multipurpose designs for small apartments.',
    h1: 'Sofa Beds'
  },
  'wooden-dinings': {
    title: 'Wooden Dining Sets',
    description: 'Shop wooden dining sets — solid wood dining tables & chairs. Classic & contemporary dining furniture at best prices.',
    h1: 'Wooden Dining Sets'
  },
  // Main category slugs
  'beds': {
    title: 'Beds',
    description: 'Shop all beds online — bunk beds, wooden beds, metal cots, folding beds, sofa cum beds & more. Premium quality at best prices.',
    h1: 'All Beds'
  },
  'chairs': {
    title: 'Chairs',
    description: 'Shop all chairs online — office chairs, study chairs, rocking chairs, lazy chairs & foldable chairs. Ergonomic & stylish designs.',
    h1: 'All Chairs'
  },
  'dining-sets': {
    title: 'Dining Sets',
    description: 'Shop dining sets online — dining tables, dining chairs & folding dining sets. 2, 4, 6 & 8 seater options at best prices.',
    h1: 'All Dining Sets'
  },
  'sofa-sets': {
    title: 'Sofa Sets',
    description: 'Shop sofa sets online — corner sofas, recliner sofas, cushion sofas, diwans & 2-seater sofas. Premium comfort & style.',
    h1: 'All Sofa Sets'
  },
  'tables': {
    title: 'Tables',
    description: 'Shop tables online — study tables, coffee tables, dressing tables & foldable tables. Modern designs for every room.',
    h1: 'All Tables'
  },
  'wardrobe-racks': {
    title: 'Wardrobe & Racks',
    description: 'Shop wardrobes, book racks, shoe racks & TV racks online. Smart storage solutions for organized living.',
    h1: 'Wardrobe & Racks'
  },
  'space-saving-furniture': {
    title: 'Space Saving Furniture',
    description: 'Shop space saving furniture — folding beds, foldable tables, sofa cum beds & compact furniture for small spaces.',
    h1: 'Space Saving Furniture'
  },
}

export async function generateMetadata({ params }) {
  const { slug } = params
  const meta = categoryMeta[slug]
  
  const siteName = 'Spacecrafts Furniture'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacecraftsfurniture.in'
  
  if (meta) {
    return {
      title: `${meta.title} - Buy Online at Best Prices | ${siteName}`,
      description: meta.description,
      alternates: {
        canonical: `${baseUrl}/products/category/${slug}`
      },
      openGraph: {
        title: `${meta.title} - ${siteName}`,
        description: meta.description,
        url: `${baseUrl}/products/category/${slug}`,
        siteName,
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: `${meta.title} - ${siteName}`,
        description: meta.description
      }
    }
  }

  // Fallback: fetch category name from DB
  try {
    const supabase = createSupabaseServerClient()
    const { data: cat } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('slug', slug)
      .single()
    
    if (cat) {
      const title = cat.name
      const description = `Shop ${cat.name} online at ${siteName}. Browse our curated collection with best prices, premium quality & free delivery across India.`
      return {
        title: `${title} - Buy Online at Best Prices | ${siteName}`,
        description,
        alternates: {
          canonical: `${baseUrl}/products/category/${slug}`
        },
        openGraph: {
          title: `${title} - ${siteName}`,
          description,
          url: `${baseUrl}/products/category/${slug}`,
          siteName,
          type: 'website'
        }
      }
    }
  } catch (e) {
    // fall through
  }

  return {
    title: `Products | ${siteName}`,
    description: `Shop furniture online at ${siteName}`
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = params
  let products = []
  let categories = []
  let brands = []
  let currentCategory = null
  let isSubCategory = false
  let totalCount = 0
  const PRODUCTS_PER_PAGE = 16
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch the current category
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()
    
    // If no DB category found, treat as sub-category tag filter
    if (!catData) {
      // Check if we have SEO metadata for this sub-category slug
      const meta = categoryMeta[slug]
      if (meta) {
        currentCategory = { id: null, name: meta.h1 || meta.title, slug }
        isSubCategory = true
      } else {
        notFound()
      }
    } else {
      currentCategory = catData
    }
    
    // Fetch all categories for sidebar filter
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

    // Build query — filter by this category or sub-category tag
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true)

    if (slug in COLLECTION_TAGS) {
      // Collection page — products matching any of the listed tags
      query = query.overlaps('tags', COLLECTION_TAGS[slug])
    } else if (isSubCategory) {
      // Filter by sub-category tag (e.g. "bunk-beds", "corner-sofas")
      // Use tagSlug from categoryMeta if available (handles slug mismatches like study-chair vs study-chairs)
      const meta = categoryMeta[slug]
      const subCatMatch = SUB_CATEGORIES.find(sc => sc.slug === slug)
      const tagToFilter = meta?.tagSlug || subCatMatch?.slug || slug
      query = query.contains('tags', [tagToFilter])
    } else {
      query = query.eq('category_id', currentCategory.id)
    }
    
    // Additional brand filter from query params
    if (searchParams?.brands) {
      const brandArray = searchParams.brands.split(',')
      const brandIds = brands
        .filter(b => brandArray.includes(b.slug))
        .map(b => b.id)
      if (brandIds.length > 0) {
        query = query.in('brand_id', brandIds)
      }
    }

    // Filter by sub-category tags (product type)
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
    
    // Price filters
    if (searchParams?.minPrice) {
      query = query.gte('price', parseFloat(searchParams.minPrice))
    }
    if (searchParams?.maxPrice) {
      query = query.lte('price', parseFloat(searchParams.maxPrice))
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
    
    query = query.range(from, to)
    
    const { data, count } = await query
    products = data || []
    totalCount = count || 0
    
    // Fetch product images
    if (products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('position')
      
      products = products.map(product => ({
        ...product,
        images: imagesData?.filter(img => img.product_id === product.id) || []
      }))
    }
    
  } catch (error) {
    console.error('Error fetching category products:', error)
  }
  
  if (!currentCategory) {
    notFound()
  }

  const meta = categoryMeta[slug]
  const categoryTitle = meta?.h1 || currentCategory.name
  const currentPage = parseInt(searchParams?.page || '1', 10)
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)

  // Filter sub-categories to show only relevant ones for the current category
  const meta2 = categoryMeta[slug]
  const tagSlugResolved = meta2?.tagSlug || slug
  const currentSubCat = isSubCategory ? SUB_CATEGORIES.find(sc => sc.slug === slug || sc.slug === tagSlugResolved) : null
  const relevantSubCategories = SUB_CATEGORIES

  return (
    <ProductsClient 
      initialProducts={products}
      categories={categories}
      brands={brands}
      subCategories={relevantSubCategories}
      searchParams={{
        ...searchParams,
        categories: slug
      }}
      categoryPage={{
        slug: currentCategory.slug,
        tagSlug: meta2?.tagSlug || currentCategory.slug,
        name: categoryTitle,
        description: meta?.description || `Browse our collection of ${currentCategory.name}`,
        isSubCategory: isSubCategory
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  )
}
