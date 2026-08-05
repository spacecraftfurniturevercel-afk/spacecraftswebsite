import ProductDetailClient from '../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'
import { CATALOG_REVALIDATE_SECONDS } from '../../../lib/catalogCache'
import { getCachedProductMeta, getCachedProductPage } from '../../../lib/catalogData'

// Cache product pages — same slug reuses PostgREST payload for CATALOG_REVALIDATE_SECONDS
export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateMetadata({ params }) {
  const { slug } = params
  try {
    const meta = await getCachedProductMeta(slug)
    if (!meta?.product) return { title: 'Product not found' }

    const { product, imageUrl } = meta
    return {
      title: `${product.name} - Spacecrafts Furniture`,
      description: product.description || `Buy ${product.name} online. Premium quality furniture at best prices.`,
      alternates: {
        canonical: `https://www.spacecraftsfurniture.in/products/${slug}`,
      },
      openGraph: {
        title: product.name,
        description: product.description,
        url: `https://www.spacecraftsfurniture.in/products/${slug}`,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (e) {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }) {
  const { slug } = params
  let bundle = null

  try {
    bundle = await getCachedProductPage(slug)
  } catch (e) {
    console.error('Error fetching product:', e)
    notFound()
  }

  if (!bundle?.product) {
    notFound()
  }

  const {
    product,
    images,
    category,
    brand,
    variants,
    offers,
    warranties,
    emiOptions,
    stores,
    specifications,
    relatedProducts,
    reviews,
  } = bundle

  // JSON-LD schema
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images?.map((i) => i.url),
    description: product.description,
    sku: product.id?.toString(),
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    aggregateRating:
      product.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.discount_price || product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://www.spacecraftsfurniture.in/products/${product.slug}`,
    },
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
