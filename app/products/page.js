import ProductsClient from '../../components/ProductsClient'
import { CATALOG_REVALIDATE_SECONDS } from '../../lib/catalogCache'
import { getCachedProductsListing } from '../../lib/catalogData'

export const revalidate = CATALOG_REVALIDATE_SECONDS

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
    const listing = await getCachedProductsListing({
      page: searchParams?.page || '1',
      perPage: PRODUCTS_PER_PAGE,
      categories: searchParams?.categories || '',
      brands: searchParams?.brands || '',
      subcategories: searchParams?.subcategories || '',
      tags: searchParams?.tags || searchParams?.tag || '',
      minPrice: searchParams?.minPrice || '',
      maxPrice: searchParams?.maxPrice || '',
      q: searchParams?.q || searchParams?.search || '',
      sort: searchParams?.sort || 'rating-desc',
    })
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
