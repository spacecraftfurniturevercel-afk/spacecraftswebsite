'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../app/providers/AuthProvider'
import { getLocalViewHistoryIds, hasViewHistory } from '../lib/useProductViewTracker'
import styles from './KeepShoppingSection.module.css'

/* ─── SVG Icons ─── */
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f39c12" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ─── Skeleton Loader ─── */
function SkeletonGroup() {
  return (
    <div className={styles.skeletonGroup}>
      <div className={styles.skeletonMain}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
      <div className={styles.skeletonRelated}>
        {[0, 1, 2].map(i => (
          <div key={i} className={styles.skeletonRelatedCard}>
            <div className={styles.skeletonRelatedImg} />
            <div className={styles.skeletonRelatedInfo}>
              <div className={styles.skeletonRelatedLine} />
              <div className={styles.skeletonRelatedLine} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Related Product Card ─── */
function RelatedCard({ product, index }) {
  const imageUrl = product.images?.[0] || '/placeholder-product.jpg'
  const finalPrice = product.discount_price || product.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
    >
      <Link href={`/products/${product.slug}`} className={styles.relatedCard}>
        <div className={styles.relatedImageWrap}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="80px"
            className={styles.relatedImage}
          />
        </div>
        <div className={styles.relatedInfo}>
          <p className={styles.relatedName}>{product.name}</p>
          <div>
            <span className={styles.relatedPrice}>
              ₹{finalPrice?.toLocaleString('en-IN')}
            </span>
            {product.discount_price && product.price > product.discount_price && (
              <span className={styles.relatedOriginalPrice}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Main Product Card ─── */
function MainProductCard({ product }) {
  const imageUrl = product.images?.[0] || '/placeholder-product.jpg'
  const finalPrice = product.discount_price || product.price
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className={styles.mainCard}>
      <div className={styles.mainImageWrap}>
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 22vw, 15vw"
          className={styles.mainImage}
        />
        <span className={styles.viewedBadge}>
          <span className={styles.viewedDot} />
          Recently Viewed
        </span>
        {discount > 0 && (
          <span className={styles.discountBadge}>{discount}% OFF</span>
        )}
      </div>
      <div className={styles.mainInfo}>
        <h3 className={styles.mainName}>{product.name}</h3>
        <div className={styles.mainPriceRow}>
          <span className={styles.mainPrice}>
            ₹{finalPrice?.toLocaleString('en-IN')}
          </span>
          {product.discount_price && product.price > product.discount_price && (
            <span className={styles.mainOriginalPrice}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {product.rating > 0 && (
          <div className={styles.mainRating}>
            <StarIcon />
            <span>{product.rating}</span>
            {product.review_count > 0 && (
              <span>({product.review_count})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ─── Main Section ─── */
export default function KeepShoppingSection() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasHistory, setHasHistory] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const trackRef = useRef(null)

  // Number of groups visible per page
  const GROUPS_PER_PAGE = 3

  // Prevent hydration mismatch — only render after client mount
  useEffect(() => { setMounted(true) }, [])

  // Fetch browsing history data
  const fetchHistory = useCallback(async () => {
    setLoading(true)

    try {
      // Check if we have any local history first (quick check)
      if (!hasViewHistory()) {
        setHasHistory(false)
        setLoading(false)
        return
      }

      setHasHistory(true)

      if (isAuthenticated) {
        // Authenticated user: try DB first
        const res = await fetch('/api/browsing-history')
        const data = await res.json()

        if (data.authenticated && data.items && data.items.length > 0) {
          setProducts(data.items)
          setLoading(false)
          return
        }
      }

      // Fallback: use localStorage IDs
      const localIds = getLocalViewHistoryIds()
      if (localIds.length === 0) {
        setHasHistory(false)
        setLoading(false)
        return
      }

      const res = await fetch('/api/products/by-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: localIds })
      })
      const data = await res.json()

      if (data.items && data.items.length > 0) {
        setProducts(data.items)
      } else {
        setHasHistory(false)
      }
    } catch (err) {
      console.warn('Failed to fetch keep shopping data:', err)
      setHasHistory(false)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Wait for auth to settle
    if (authLoading) return
    fetchHistory()
  }, [authLoading, fetchHistory])

  // Carousel logic
  const totalPages = Math.max(1, Math.ceil(products.length / GROUPS_PER_PAGE))
  const canPrev = currentPage > 0
  const canNext = currentPage < totalPages - 1

  const goTo = useCallback((page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }, [totalPages])

  const goPrev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo])
  const goNext = useCallback(() => goTo(currentPage + 1), [currentPage, goTo])

  // Calculate translate for carousel
  const translateX = -(currentPage * 100)

  // Don't render anything on server or if no history
  if (!mounted) return null

  if (!authLoading && !loading && !hasHistory) {
    return null
  }

  // Show skeleton while loading
  if (loading || authLoading) {
    if (!hasViewHistory()) return null

    return (
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <h2 className={styles.sectionTitle}>Keep Shopping</h2>
            <p className={styles.sectionSubtitle}>Pick up where you left off</p>
          </div>
        </div>
        <div className={styles.carouselViewport}>
          <div className={styles.carouselTrack}>
            {[0, 1, 2].map(i => <SkeletonGroup key={i} />)}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>Keep Shopping</h2>
          <p className={styles.sectionSubtitle}>Pick up where you left off</p>
        </div>

        {totalPages > 1 && (
          <div className={styles.navArrows}>
            <button
              className={styles.navBtn}
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>
            <button
              className={styles.navBtn}
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className={styles.carouselViewport}>
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          style={{ transform: `translateX(${translateX}%)` }}
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              className={styles.productGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: (idx % GROUPS_PER_PAGE) * 0.1 }}
            >
              {/* Main (big) product card */}
              <MainProductCard product={product} />

              {/* Related products row */}
              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <>
                  <p className={styles.relatedLabel}>Similar Items</p>
                  <div className={`${styles.relatedRow} ${
                    product.relatedProducts.length === 2
                      ? styles.relatedRow2
                      : product.relatedProducts.length === 3
                      ? styles.relatedRow3
                      : product.relatedProducts.length >= 4
                      ? styles.relatedRow4
                      : ''
                  }`}>
                    {product.relatedProducts.slice(0, 4).map((rp, ri) => (
                      <RelatedCard key={rp.id} product={rp} index={ri} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {totalPages > 1 && (
        <div className={styles.dotsRow}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentPage ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.section>
  )
}
