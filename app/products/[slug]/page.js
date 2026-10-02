import ProductDetailClient from '../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'
import { CATALOG_REVALIDATE_SECONDS } from '../../../lib/catalogCache'
import { getCachedProductMeta, getCachedProductPage } from '../../../lib/catalogData'
import { buildProductJsonLd } from '../../../lib/productJsonLd'

// Cache product pages — same slug reuses PostgREST payload for CATALOG_REVALIDATE_SECONDS
export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateMetadata({ params }) {
  const { slug } = params
  try {
    const meta = await getCachedProductMeta(slug)
    if (!meta?.product) return { title: 'Product not found' }

    const { product, imageUrl } = meta
    const description =
      product.description ||
      `Buy ${product.name} online at Spacecrafts Furniture. Premium quality furniture at best prices.`
    return {
      title: product.name,
      description,
      alternates: {
        canonical: `https://www.spacecraftsfurniture.in/products/${slug}`,
      },
      openGraph: {
        title: product.name,
        description,
        url: `https://www.spacecraftsfurniture.in/products/${slug}`,
        images: imageUrl
          ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: imageUrl ? [imageUrl] : undefined,
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

  const schema = buildProductJsonLd({ product, images, brand, reviews })

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
