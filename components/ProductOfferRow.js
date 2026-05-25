'use client'

import {
  getProductDiscountPercent,
  getProductOfferLabel,
  shouldShowProductOffer,
} from '../lib/productOffer'
import styles from './ProductOfferRow.module.css'

export default function ProductOfferRow({ product, variant = 'default', className = '' }) {
  if (!product || !shouldShowProductOffer(product)) return null

  const discountPct = getProductDiscountPercent(product)
  const offerLabel = getProductOfferLabel(product)
  const variantClass = variant === 'compact' ? styles.compact : variant === 'detail' ? styles.detail : ''

  return (
    <div className={`${styles.row} ${variantClass} ${className}`.trim()}>
      {discountPct > 0 && (
        <span className={styles.badge}>{discountPct}% off</span>
      )}
      {offerLabel && (
        <span className={styles.label}>{offerLabel}</span>
      )}
    </div>
  )
}
