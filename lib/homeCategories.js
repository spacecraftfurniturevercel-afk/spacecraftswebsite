// Homepage category grid — 12 categories in display order (6 per row × 2 rows)
// Images: public/categories/ (from public/category/updatedcategory)

export const HOME_CATEGORIES = [
  { name: 'Beds', slug: 'beds', image: '/categories/beds.png' },
  { name: 'Chairs', slug: 'chairs', image: '/categories/chairs.png' },
  { name: 'Recliners', slug: 'recliners', image: '/categories/recliners.webp' },
  { name: 'Sofa Cum Beds', slug: 'sofa-cum-beds', image: '/categories/sofa-cum-beds.png' },
  { name: 'Dining Sets', slug: 'dining-sets', image: '/categories/dining-sets.png' },
  { name: 'Wardrobes', slug: 'wardrobes', image: '/categories/wardrobes.png' },
  { name: 'Office Furniture', slug: 'office-furniture', image: '/categories/office-furniture.png' },
  { name: 'Center Table', slug: 'center-tables', image: '/categories/center-tables.jpg' },
  { name: 'Sofas', slug: 'sofas', image: '/categories/sofas.png' },
  { name: 'Pooja Racks', slug: 'pooja-racks', image: '/categories/pooja-racks.png' },
  { name: 'Bunk Beds', slug: 'bunk-beds', image: '/categories/bunk-beds.png' },
  { name: 'Mattress', slug: 'mattress', image: '/categories/mattress.png' },
]

export const HOME_CATEGORY_SLUGS = HOME_CATEGORIES.map((c) => c.slug)

export const CATEGORY_IMAGE_MAP = HOME_CATEGORIES.reduce((acc, cat) => {
  acc[cat.slug] = cat.image
  return acc
}, {
  'sofas-couches': '/categories/sofas.png',
  'sofa-sets': '/categories/sofas.png',
  'chairs-seating': '/categories/chairs.png',
  'tables': '/categories/center-tables.jpg',
  'beds-frames': '/categories/beds.png',
  'dining-room': '/categories/dining-sets.png',
  'wardrobe-racks': '/categories/wardrobes.png',
  'mattresses': '/categories/mattress.png',
  'mandirs': '/categories/pooja-racks.png',
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
