// Homepage category grid — 12 categories in display order (6 per row × 2 rows)
const PRODUCT_IMG =
  'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products'

const U = (id) =>
  `https://images.unsplash.com/${id}?w=380&h=420&fit=crop&q=80`

export const HOME_CATEGORIES = [
  { name: 'Beds', slug: 'beds', image: `${PRODUCT_IMG}/luminous-steel-cot-1.jpg` },
  { name: 'Chairs', slug: 'chairs', image: `${PRODUCT_IMG}/zenith-rocking-easy-chair-1.jpg` },
  { name: 'Recliners', slug: 'recliners', image: U('photo-1586023492125-27b2c045efd7') },
  { name: 'Sofa Cum Beds', slug: 'sofa-cum-beds', image: `${PRODUCT_IMG}/nova-sofa-bed-without-storage-1.jpg` },
  { name: 'Dining Sets', slug: 'dining-sets', image: U('photo-1615874956400-07fd9c1c9f7b') },
  { name: 'Wardrobes', slug: 'wardrobes', image: U('photo-1595428774223-7480a5348a52') },
  { name: 'Office Furniture', slug: 'office-furniture', image: `${PRODUCT_IMG}/proton-study-desk-1.jpg` },
  { name: 'Center Table', slug: 'center-tables', image: U('photo-1532372320572-5417788d1a2d') },
  { name: 'Sofas', slug: 'sofas', image: `${PRODUCT_IMG}/halley-sofa-cum-bed-single-1.jpg` },
  { name: 'Pooja Racks', slug: 'pooja-racks', image: U('photo-1600607686527-3653cd281920') },
  { name: 'Bunk Beds', slug: 'bunk-beds', image: `${PRODUCT_IMG}/jupiter-bunk-cum-futon-cot-1.jpg` },
  { name: 'Mattress', slug: 'mattress', image: U('photo-1505693416388-ac5ce068fe85') },
]

export const HOME_CATEGORY_SLUGS = HOME_CATEGORIES.map((c) => c.slug)

export const CATEGORY_IMAGE_MAP = HOME_CATEGORIES.reduce((acc, cat) => {
  acc[cat.slug] = cat.image
  return acc
}, {
  'sofas-couches': `${PRODUCT_IMG}/halley-sofa-cum-bed-single-1.jpg`,
  'sofa-sets': `${PRODUCT_IMG}/halley-sofa-cum-bed-single-1.jpg`,
  'chairs-seating': `${PRODUCT_IMG}/zenith-rocking-easy-chair-1.jpg`,
  'tables': U('photo-1532372320572-5417788d1a2d'),
  'beds-frames': `${PRODUCT_IMG}/luminous-steel-cot-1.jpg`,
  'dining-room': U('photo-1615874956400-07fd9c1c9f7b'),
  'wardrobe-racks': U('photo-1595428774223-7480a5348a52'),
  'mattresses': U('photo-1505693416388-ac5ce068fe85'),
  'mandirs': U('photo-1600607686527-3653cd281920'),
})

export function resolveCategoryImage(slug, imageUrl) {
  const homeImage = HOME_CATEGORIES.find((c) => c.slug === slug)?.image
  if (homeImage) return homeImage
  if (imageUrl && !imageUrl.endsWith('.svg')) return imageUrl
  return CATEGORY_IMAGE_MAP[slug] || HOME_CATEGORIES[0].image
}

export function buildHomepageCategories(serverCategories = []) {
  const bySlug = {}
  serverCategories.forEach((cat) => {
    bySlug[cat.slug] = cat
  })

  return HOME_CATEGORIES.map((fallback, index) => {
    const fromDb = bySlug[fallback.slug]
    return {
      id: fromDb?.id || index + 1,
      name: fromDb?.name || fallback.name,
      slug: fallback.slug,
      image: resolveCategoryImage(fallback.slug, fromDb?.image_url),
      productCount: fromDb?.productCount || 0,
    }
  })
}
