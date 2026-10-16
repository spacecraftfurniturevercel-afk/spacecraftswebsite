const SITE = 'https://www.spacecraftsfurniture.in'

function formatInrPrice(product) {
  const price = product?.discount_price ?? product?.price
  if (price == null || Number.isNaN(Number(price))) return null
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function withPrice(text, product) {
  const price = formatInrPrice(product)
  return text.replace(/\{price\}/g, price ? `from ${price}` : 'at showroom price')
}

const RIO_FAQS = [
  {
    question: 'What is the Rio sofa bed?',
    answer:
      'Rio is a popular sofa cum bed with a smooth fold-flat mechanism — use it as a day sofa and open it into a sleeping surface for guests. It is one of our best-selling sofa beds at Spacecrafts Furniture, Chennai.',
  },
  {
    question: 'Is the Rio sofa cum bed available in Chennai?',
    answer:
      'Yes. Rio sofa cum bed models are on display at our Ambattur showroom in Chennai. You can test the fold mechanism, fabric, and comfort before you buy. Pan-India delivery is available when you order online.',
  },
  {
    question: 'Rio sofa bed vs other sofa cum beds — why choose Rio?',
    answer:
      'Customers choose Rio for its clean look, reliable click-fold action, and value for small flats and guest rooms. Compare Rio with other sofa cum beds in our Ambattur showroom or browse the full sofa cum bed collection online.',
  },
]

/** Per-slug CTR-focused SEO (title is without site suffix — page adds | Spacecrafts Furniture). */
const productSeoOverrides = {
  'rio-sofa-cum-bed-grey': {
    title: 'Rio Sofa Bed in Chennai | Grey Sofa Cum Bed',
    description:
      'Shop Rio sofa bed in grey — a best-selling sofa cum bed with smooth fold mechanism. Try Rio in our Ambattur, Chennai showroom. Order online {price} with delivery across India.',
    h1: 'Rio Sofa Bed — Grey Sofa Cum Bed',
    subtitle:
      'Best-selling Rio sofa cum bed in grey. Fold-flat sofa bed for living rooms & guest use — see it in our Ambattur showroom or buy online with pan-India delivery.',
    keywords:
      'rio sofa bed, rio sofa cum bed, rio sofa, sofa cum bed Chennai, sofa bed grey, sofa cum bed near me',
    faqs: RIO_FAQS,
    relatedLinks: [
      { href: '/products/category/sofa-cum-beds', label: 'All sofa cum beds' },
      { href: '/blog/sofa-cum-bed-near-me-chennai-guide', label: 'Sofa cum bed guide — Chennai' },
    ],
  },
  'rio-sofa-cum-bed-brown': {
    title: 'Rio Sofa Bed in Chennai | Brown Sofa Cum Bed',
    description:
      'Rio sofa bed in brown — convertible sofa cum bed with easy fold mechanism. Visit Spacecrafts Ambattur showroom, Chennai to try before you buy. Online {price}, pan-India delivery.',
    h1: 'Rio Sofa Bed — Brown Sofa Cum Bed',
    subtitle:
      'Rio sofa cum bed in brown — compact sofa-to-bed for apartments and guest rooms. On display at our Ambattur showroom.',
    keywords: 'rio sofa bed, rio sofa cum bed brown, sofa cum bed Chennai, rio sofa set',
    faqs: RIO_FAQS,
    relatedLinks: [
      { href: '/products/rio-sofa-cum-bed-grey', label: 'Rio sofa cum bed — grey' },
      { href: '/products/category/sofa-cum-beds', label: 'All sofa cum beds' },
    ],
  },
}

export function getProductSeoOverride(slug) {
  return productSeoOverrides[slug] || null
}

/** Resolved SEO fields for metadata + product page UI. */
export function resolveProductPageSeo(slug, product) {
  const base = getProductSeoOverride(slug)
  if (!base) return null

  return {
    title: base.title,
    description: withPrice(base.description, product),
    keywords: base.keywords,
    h1: base.h1,
    subtitle: base.subtitle,
    faqs: base.faqs,
    relatedLinks: base.relatedLinks,
  }
}

export function buildProductFaqJsonLd(slug, product) {
  const seo = resolveProductPageSeo(slug, product)
  if (!seo?.faqs?.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export { SITE as PRODUCT_SEO_SITE }
