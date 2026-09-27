import { COMPANY } from './companyInfo'
import {
  SITE,
  buildOfferReturnPolicy,
  buildOfferShippingDetails,
} from './merchantStructuredData'

function cleanDescription(text) {
  if (!text) return undefined
  return String(text)
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)
}

function mapReviewsToSchema(reviews) {
  const approved = (reviews || []).filter((r) => !r.status || r.status === 'approved')
  return approved.slice(0, 5).map((r) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: r.profiles?.full_name || 'Customer',
    },
    datePublished: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : undefined,
    reviewBody: r.comment || r.title || undefined,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
  }))
}

export function buildProductJsonLd({ product, images, brand, reviews }) {
  const schemaReviews = mapReviewsToSchema(reviews)
  const reviewCountFromList = schemaReviews.length
  const reviewCount =
    reviewCountFromList > 0 ? reviewCountFromList : Number(product.review_count) || 0
  const ratingValue =
    reviewCountFromList > 0
      ? schemaReviews.reduce((sum, r) => sum + Number(r.reviewRating.ratingValue), 0) /
        reviewCountFromList
      : product.rating

  const price = product.discount_price ?? product.price
  const priceValidUntil = new Date()
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1)

  const sku = product.sku?.trim() || product.id?.toString()
  const imageUrls = (images || []).map((i) => i.url).filter(Boolean)

  const productNode = {
    '@type': 'Product',
    '@id': `${SITE}/products/${product.slug}#product`,
    name: product.name,
    image: imageUrls.length ? imageUrls : undefined,
    description: cleanDescription(product.description || product.short_description),
    sku,
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price != null ? Number(price) : undefined,
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE}/products/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: COMPANY.name,
        url: SITE,
      },
      hasMerchantReturnPolicy: buildOfferReturnPolicy(),
      shippingDetails: buildOfferShippingDetails(),
    },
  }

  if (reviewCount > 0 && ratingValue != null && Number(ratingValue) > 0) {
    productNode.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(Number(ratingValue).toFixed(1)),
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  }

  if (schemaReviews.length > 0) {
    productNode.review = schemaReviews
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [productNode],
  }
}
