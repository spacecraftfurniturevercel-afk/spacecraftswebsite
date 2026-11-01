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

const DELTA_FAQS = [
  {
    question: 'What is the Delta bunk bed?',
    answer:
      'Delta is a metal bunk bed (often searched as a bunker bed) with a sturdy frame and safety rails. It is built for kids’ rooms, hostels, and adult use where floor space is tight.',
  },
  {
    question: 'Can I try the Delta bunk bed in Chennai?',
    answer:
      'Yes. Delta bunk bed models are on display at our Ambattur showroom in Chennai. You can check height, rails, and mattress fit before you buy. Pan-India delivery is available when you order online.',
  },
  {
    question: 'Is Delta a bunk bed or a bunker bed?',
    answer:
      'Both names are used in India. Delta is a bunk / bunker bed. Compare it with other bunker cots in our bunk beds collection or in the Ambattur showroom.',
  },
]

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
  'zhang-foldable-study-chair': {
    title: 'Foldable Study Chair | Zhang Chair in Chennai',
    description:
      'Zhang foldable study chair {price}. Compact folding study chair for small rooms, hostels and home study. Try it in Ambattur, Chennai or order online with pan-India delivery.',
    h1: 'Zhang Foldable Study Chair',
    subtitle:
      'Space-saving foldable study chair — fold it away when not in use. See it in our Ambattur showroom or buy online.',
    keywords:
      'foldable study chair, folding study chair, zhang foldable study chair, study chair Chennai, foldable chair',
    faqs: [
      {
        question: 'Is the Zhang chair a foldable study chair?',
        answer:
          'Yes. Zhang is a foldable study chair — use it at a study table, then fold it for storage. It suits small Chennai flats, hostels, and extra seating.',
      },
      {
        question: 'Can I try the foldable study chair in Chennai?',
        answer:
          'Yes. Foldable study chairs including Zhang are on display at Spacecrafts Furniture in Ambattur, Chennai. You can test the fold and seat before you buy. Pan-India delivery is available online.',
      },
    ],
    relatedLinks: [
      { href: '/products/category/foldable-chairs', label: 'All foldable chairs' },
      { href: '/products/category/study-chair', label: 'Study chairs' },
    ],
  },
  'delta-bunk-bed': {
    title: 'Delta Bunk Bed | Bunker Bed in Chennai',
    description:
      'Delta bunk bed {price}. Metal bunker bed with safety rails for kids, hostels and adults. Try it in Ambattur, Chennai or order online with pan-India delivery.',
    h1: 'Delta Bunk Bed — Bunker Bed',
    subtitle:
      'Delta metal bunk / bunker bed with safety rails. See it in our Ambattur showroom or buy online with delivery across India.',
    keywords:
      'delta bunk bed, delta beds, bunker bed, bunk beds Chennai, bunker beds, bunk bed online',
    faqs: DELTA_FAQS,
    relatedLinks: [
      { href: '/products/category/bunk-beds', label: 'All bunker beds & bunk beds' },
      { href: '/blog/bunk-beds-bunker-beds-chennai-near-me', label: 'Bunker beds in Chennai' },
    ],
  },
  'rio-sofa-cum-bed-grey': {
    title: 'Rio Sofa Bed Grey | Fold-Flat Sofa Cum Bed',
    description:
      'Rio sofa bed in grey {price}. Best-selling sofa cum bed with smooth fold-flat mechanism. Try it in Ambattur, Chennai or order online with pan-India delivery.',
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
    title: 'Rio Sofa Bed Brown | Fold-Flat Sofa Cum Bed',
    description:
      'Rio sofa bed in brown {price}. Convertible sofa cum bed with easy fold. Try it in Ambattur, Chennai or order online with pan-India delivery.',
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
