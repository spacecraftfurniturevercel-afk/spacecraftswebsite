import ProductsClient from '../../../../components/ProductsClient'
import { notFound } from 'next/navigation'
import { CATALOG_REVALIDATE_SECONDS } from '../../../../lib/catalogCache'
import { getCachedCategoryBySlug, getCachedCategoryListing } from '../../../../lib/catalogData'
import { getPublicSiteUrl } from '../../../../lib/siteUrl'

function resolveCategoryTitle(metaTitle) {
  const cleaned = String(metaTitle || 'Products')
    .replace(/\s*[|—]\s*Spacecrafts[^|]*/gi, '')
    .replace(/\s*-\s*Buy Online at Best Prices.*/i, '')
    .trim()
  return { absolute: `${cleaned} | Spacecrafts Furniture` }
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

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
    title: 'Bunk Beds in Chennai | Bunker Beds Near Me — Spacecrafts Ambattur',
    description: 'Buy bunk beds & bunker beds in Chennai. Metal and wooden bunk beds with safety rails for kids, hostels and adults. Visit our Ambattur showroom or order online. Pan-India delivery from ₹16,999.',
    h1: 'Bunk Beds & Bunker Beds in Chennai'
  },
  'futon-beds': {
    title: 'Futon Beds in Chennai — Sofa-to-Bed Furniture',
    description: 'Buy futon beds in Chennai. Versatile sofa-to-bed furniture, compact and stylish for guest rooms and small flats. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
    h1: 'Futon Beds'
  },
  'diwan-cum-beds': {
    title: 'Diwan Cum Beds — Multipurpose Daybed with Storage',
    description: 'Shop diwan cum beds. Multipurpose daybed furniture with storage for living rooms and bedrooms. Elegant designs. Spacecrafts Furniture, Chennai. Pan-India delivery.',
    h1: 'Diwan Cum Beds'
  },
  'folding-beds': {
    title: 'Folding Beds',
    description: 'Buy folding beds online — portable, foldable bed designs for small apartments & guest use. Easy storage, strong frames. Free delivery.',
    h1: 'Folding Beds'
  },
  'metal-cots': {
    title: 'Metal Cots & Steel Cots in Chennai',
    description: 'Buy metal cots and steel cots in Chennai. Durable iron and steel bed frames at factory prices. Showroom in Ambattur. Strong, long-lasting and affordable. Pan-India delivery.',
    h1: 'Metal Cots'
  },
  'recliner-folding-beds': {
    title: 'Recliner Folding Beds',
    description: 'Buy recliner folding beds — adjustable recliner beds that fold for easy storage. Premium comfort meets space-saving design.',
    h1: 'Recliner Folding Beds'
  },
  'sofa-cum-beds': {
    title: 'Sofa Cum Beds in Chennai — With Storage',
    description: 'Buy sofa cum beds in Chennai. Convertible sofa beds with and without storage for living rooms and small flats. Visit Ambattur showroom or order online. Pan-India delivery.',
    h1: 'Sofa Cum Beds'
  },
  'wooden-beds': {
    title: 'Wooden Beds in Chennai — Solid Wood & Engineered Wood',
    description: 'Buy wooden beds in Chennai. Solid sheesham, teak and engineered wood bed frames. King, queen and single sizes. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
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
    title: 'Folding Dining Sets in Chennai — Space-Saving Dining Tables',
    description: 'Buy folding dining sets in Chennai. Space-saving foldable dining tables and chairs for small apartments and kitchens. Visit Ambattur showroom or order online.',
    h1: 'Folding Dining Sets'
  },
  'shoe-racks': {
    title: 'Shoe Racks — Metal & Wooden Shoe Organisers',
    description: 'Buy shoe racks online. Metal, wooden and foldable shoe stands in multiple tiers. Organise your footwear neatly. Best prices, pan-India delivery from Chennai.',
    h1: 'Shoe Racks'
  },
  '2-seater': {
    title: '2 Seater Sofas',
    description: 'Shop 2 seater sofas — compact loveseats perfect for small living rooms. Fabric & leatherette options. Premium comfort.',
    h1: '2 Seater Sofas'
  },
  '3-1-1-sofas': {
    title: '3+1+1 Sofa Sets in Chennai — Complete Living Room Sets',
    description: 'Buy 3+1+1 sofa sets in Chennai. Complete living room sofa sets with 3-seater and two single seats. Fabric and leatherette options. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
    h1: '3+1+1 Sofa Sets'
  },
  'corner-sofas': {
    title: 'Corner Sofas in Chennai — L-Shaped Sectional Sofas',
    description: 'Shop corner sofas in Chennai. L-shaped sectional sofas for living rooms. Space-efficient designs with premium cushioning and fabrics. Ambattur showroom. Pan-India delivery.',
    h1: 'Corner Sofas'
  },
  'cushion-sofas': {
    title: 'Cushion Sofas — Extra-Soft Sofa Sets',
    description: 'Buy cushion sofas online. Extra-soft cushioned sofa sets for ultimate comfort. Modern designs at affordable prices. Pan-India delivery from Spacecrafts Furniture, Chennai.',
    h1: 'Cushion Sofas'
  },
  'diwans': {
    title: 'Diwans in Chennai — Traditional & Modern Diwan Sets',
    description: 'Shop diwans in Chennai. Traditional and modern diwan sets with mattress and cushions. Perfect for living rooms and guest rooms. Spacecrafts Furniture, Ambattur.',
    h1: 'Diwans'
  },
  'recliner-sofas': {
    title: 'Recliner Sofas in Chennai — Manual & Motorized Recliners',
    description: 'Buy recliner sofas in Chennai. Manual and motorized recliner sofa sets with footrest and adjustable backrest. Test in our Ambattur showroom. Pan-India delivery.',
    h1: 'Recliner Sofas'
  },
  'coffee-tables': {
    title: 'Coffee Tables & Centre Tables — Chennai',
    description: 'Shop coffee tables and centre tables in Chennai. Modern glass, wooden and marble top designs for living rooms. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
    h1: 'Coffee Tables'
  },
  'dressing-tables': {
    title: 'Dressing Tables in Chennai — Vanity Tables with Mirror',
    description: 'Buy dressing tables in Chennai. Vanity tables with mirror and storage. Modern and classic designs for bedrooms. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
    h1: 'Dressing Tables'
  },
  'foldable-tables': {
    title: 'Foldable Tables',
    description: 'Shop foldable tables — portable folding tables for study, dining & multipurpose use. Space-saving & easy to store.',
    h1: 'Foldable Tables'
  },
  'study-office-tables': {
    title: 'Study & Office Tables in Chennai — Work Desks & Computer Tables',
    description: 'Buy study and office tables in Chennai. Work desks, computer tables and writing desks for home and office. Ergonomic designs. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
    h1: 'Study & Office Tables',
    tagSlug: 'study-&-office-tables'
  },
  'wardrobes': {
    title: 'Wardrobes in Chennai — Single, Double & Triple Door',
    description: 'Shop wardrobes in Chennai. Single, double and triple door wardrobes in wood and engineered wood with mirror and drawers. Spacecrafts Furniture, Ambattur showroom. Pan-India delivery.',
    h1: 'Wardrobes'
  },
  'book-shelves': {
    title: 'Book Shelves — Open & Ladder Bookshelves',
    description: 'Buy book shelves online. Open, wall-mounted and ladder bookshelves. Organise your books in style. Modern designs from Spacecrafts Furniture. Pan-India delivery.',
    h1: 'Book Shelves'
  },
  'book-racks': {
    title: 'Book Racks — Compact Book Storage',
    description: 'Shop book racks. Compact and freestanding book storage solutions. Metal and wooden options for home and office. Spacecrafts Furniture, Chennai. Pan-India delivery.',
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
    title: 'Sofa Beds in Chennai — Convertible Sofa-to-Bed',
    description: 'Buy sofa beds in Chennai. Convertible sofa-to-bed furniture for small apartments. Space-saving and multipurpose designs. Spacecrafts Furniture, Ambattur. Pan-India delivery.',
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
    title: 'Chairs Online India — Office, Study, Rocking & Foldable',
    description: 'Buy chairs online. Ergonomic office chairs, study chairs, rocking chairs and foldable chairs at best prices. Showroom in Chennai, pan-India delivery.',
    h1: 'All Chairs'
  },
  'dining-sets': {
    title: 'Dining Sets in Chennai — 4, 6 & 8 Seater Dining Tables',
    description: 'Shop dining sets in Chennai. Dining tables and chairs in 4, 6 and 8 seater options. Wood, glass and marble finishes. Spacecrafts Furniture, Ambattur showroom. Pan-India delivery.',
    h1: 'All Dining Sets'
  },
  'sofa-sets': {
    title: 'Sofa Sets Online India — Corner, Recliner & 3+1+1',
    description: 'Buy sofa sets online. Corner sofas, recliner sofas, 3+1+1 sets and cushion sofas. Premium quality at best prices. Showroom in Chennai, free delivery across India.',
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
  const baseUrl = getPublicSiteUrl()
  const ogImage = {
    url: '/aboutus/exterior1.webp',
    width: 1200,
    height: 630,
    alt: siteName,
  }

  // Dynamic noindex for empty category pages — prevents Soft 404 in GSC
  if (meta) {
    const title = resolveCategoryTitle(meta.title)
    return {
      title,
      description: meta.description,
      alternates: {
        canonical: `${baseUrl}/products/category/${encodeURI(slug)}`,
      },
      openGraph: {
        title: title.absolute,
        description: meta.description,
        url: `${baseUrl}/products/category/${slug}`,
        siteName,
        type: 'website',
        images: [ogImage],
      },
      twitter: {
        card: 'summary_large_image',
        title: title.absolute,
        description: meta.description,
        images: [ogImage.url],
      },
    }
  }

  // Fallback: fetch category name from DB
  try {
    const cat = await getCachedCategoryBySlug(slug)

    if (cat) {
      const title = resolveCategoryTitle(cat.name)
      const description = `Shop ${cat.name} online at ${siteName}. Browse our curated collection with best prices, premium quality and free delivery across India.`
      return {
        title,
        description,
        alternates: {
          canonical: `${baseUrl}/products/category/${encodeURI(slug)}`,
        },
        openGraph: {
          title: title.absolute,
          description,
          url: `${baseUrl}/products/category/${slug}`,
          siteName,
          type: 'website',
          images: [ogImage],
        },
        twitter: {
          card: 'summary_large_image',
          title: title.absolute,
          description,
          images: [ogImage.url],
        },
      }
    }
  } catch (e) {
    // fall through
  }

  return {
    title: { absolute: `Products | ${siteName}` },
    description: `Shop furniture online at ${siteName}`,
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
    const catData = await getCachedCategoryBySlug(slug)

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

    const meta = categoryMeta[slug]
    const subCatMatch = SUB_CATEGORIES.find((sc) => sc.slug === slug)
    const tagToFilter = meta?.tagSlug || subCatMatch?.slug || slug

    const listing = await getCachedCategoryListing(
      slug,
      {
        page: searchParams?.page || '1',
        perPage: PRODUCTS_PER_PAGE,
        brands: searchParams?.brands || '',
        subcategories: searchParams?.subcategories || '',
        tags: searchParams?.tags || searchParams?.tag || '',
        minPrice: searchParams?.minPrice || '',
        maxPrice: searchParams?.maxPrice || '',
        sort: searchParams?.sort || 'rating-desc',
      },
      {
        collectionTags: slug in COLLECTION_TAGS ? COLLECTION_TAGS[slug] : null,
        isSubCategory,
        tagToFilter: isSubCategory ? tagToFilter : null,
        categoryId: !isSubCategory && !(slug in COLLECTION_TAGS) ? currentCategory.id : null,
      }
    )

    products = listing.products
    categories = listing.categories
    brands = listing.brands
    totalCount = listing.totalCount
  } catch (error) {
    if (
      error?.digest === 'DYNAMIC_SERVER_USAGE' ||
      String(error?.message || '').includes('Dynamic server usage')
    ) {
      throw error
    }
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
