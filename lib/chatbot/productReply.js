import { SITE_URL, STORE_CONTACT } from './constants'

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

const INTRO = {
  bestsellers: 'Here are our best-selling pieces right now:',
  offers: 'Here are current offers and deals:',
  search: 'Here are some products that match your request:',
}

const EMPTY = {
  bestsellers: `I could not find best sellers in our catalog at the moment. Browse all products at ${SITE_URL}/products or call ${STORE_CONTACT.phoneDisplay}.`,
  offers: `No active offers are listed right now. Check ${SITE_URL}/products for the latest prices or call ${STORE_CONTACT.phoneDisplay}.`,
  search: `I could not find matching products. Try a different search or browse ${SITE_URL}/products. You can also call ${STORE_CONTACT.phoneDisplay}.`,
}

export function buildProductListReply(products = [], listType = 'search', { categorySlug = null, maxPrice = null } = {}) {
  if (!products.length) {
    if (categorySlug) {
      const categoryUrl = `${SITE_URL}/products/category/${categorySlug}`
      const priceHint = maxPrice ? ` under ${formatInr(maxPrice)}` : ''
      return `I could not find products${priceHint} in that category right now. Browse the full collection here: ${categoryUrl} or call ${STORE_CONTACT.phoneDisplay}.`
    }
    return EMPTY[listType] || EMPTY.search
  }

  const categoryIntro = categorySlug
    ? `Here are ${products[0]?.category || 'matching'} products${maxPrice ? ` under ${formatInr(maxPrice)}` : ''}:`
    : null

  const lines = [categoryIntro || INTRO[listType] || INTRO.search, '']

  products.forEach((p, i) => {
    const price = formatInr(p.final_price)
    const hasDiscount = p.discount_price != null && p.discount_price < p.price
    const priceLine = hasDiscount ? `${price} (MRP ${formatInr(p.price)})` : price
    const offer = p.offer_name ? ` (${p.offer_name})` : ''
    lines.push(`${i + 1}. ${p.name} - ${priceLine}${offer}`)
  })

  lines.push('', 'Tap any product card below to view details and buy on our website.')
  return lines.join('\n')
}
