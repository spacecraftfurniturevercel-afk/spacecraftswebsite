export const OFFER_NAME_PRESETS = [
  'Limited time deal',
  'Festival Offer',
  'Diwali Offer',
  'Christmas Offer',
  'New Year Offer',
  'Summer Sale',
  'Clearance Sale',
]

export function getProductDiscountPercent(product) {
  if (!product?.discount_price || product.discount_price >= product.price) return 0
  return Math.round(((product.price - product.discount_price) / product.price) * 100)
}

export function getProductOfferLabel(product) {
  const label = (product?.offer_name || '').trim()
  return label || null
}

export function shouldShowProductOffer(product) {
  return getProductDiscountPercent(product) > 0 || !!getProductOfferLabel(product)
}
