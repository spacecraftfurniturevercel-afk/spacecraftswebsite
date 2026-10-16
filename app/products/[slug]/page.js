import ProductDetailClient from '../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'
import { CATALOG_REVALIDATE_SECONDS } from '../../../lib/catalogCache'
import { getCachedProductMeta, getCachedProductPage } from '../../../lib/catalogData'
import { buildProductJsonLd } from '../../../lib/productJsonLd'
import {
  buildProductFaqJsonLd,
  resolveProductPageSeo,
  PRODUCT_SEO_SITE,
} from '../../../lib/productSeoOverrides'

// Cache product pages — same slug reuses PostgREST payload for CATALOG_REVALIDATE_SECONDS
export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateMetadata({ params }) {
  const { slug } = params
  try {
    const meta = await getCachedProductMeta(slug)
    if (!meta?.product) return { title: 'Product not found' }

    const { product, imageUrl } = meta
    const seo = resolveProductPageSeo(slug, product)
    const defaultDescription =
      product.description ||
      `Buy ${product.name} online at Spacecrafts Furniture. Premium quality furniture at best prices.`
    const description = seo?.description || defaultDescription
    const title = seo
      ? { absolute: `${seo.title} | Spacecrafts Furniture` }
      : product.name
    const ogTitle = seo?.title || product.name

    return {
      title,
      description,
      keywords: seo?.keywords,
      alternates: {
        canonical: `${PRODUCT_SEO_SITE}/products/${slug}`,
      },
      openGraph: {
        title: ogTitle,
        description,
        url: `${PRODUCT_SEO_SITE}/products/${slug}`,
        images: imageUrl
          ? [{ url: imageUrl, width: 800, height: 800, alt: seo?.h1 || product.name }]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
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

  const pageSeo = resolveProductPageSeo(slug, product)
  const schema = buildProductJsonLd({ product, images, brand, reviews })
  const faqJsonLd = buildProductFaqJsonLd(slug, product)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
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
        pageSeo={pageSeo}
      />
    </>
  )
}
