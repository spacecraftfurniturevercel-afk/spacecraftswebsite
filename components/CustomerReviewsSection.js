'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import styles from './CustomerReviewsSection.module.css'

/* ─── Mock Reviews (structured for future API) ─── */
const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    avatar: null,
    rating: 5,
    reviewText:
      'Absolutely love the quality of the sofa set we purchased. The craftsmanship is outstanding and the delivery was right on time. Spacecrafts Furniture has become our go-to for home furnishing.',
    timeAgo: '2 weeks ago',
    isVerified: true,
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    avatar: null,
    rating: 5,
    reviewText:
      'We furnished our entire new apartment from here. The bedroom set and dining table are beautiful. Staff was very helpful in choosing the right pieces for our space.',
    timeAgo: '1 month ago',
    isVerified: true,
  },
  {
    id: 3,
    name: 'Anita Desai',
    avatar: null,
    rating: 4,
    reviewText:
      'Great selection of modern and traditional furniture. Prices are very reasonable for the quality you get. The study table I bought is sturdy and elegant.',
    timeAgo: '3 months ago',
    isVerified: true,
  },
  {
    id: 4,
    name: 'Mohammed Irfan',
    avatar: null,
    rating: 5,
    reviewText:
      'Best furniture shopping experience in Chennai! The showroom is well-organised and the staff really understands what you need. Our wardrobe is absolutely premium quality.',
    timeAgo: '5 months ago',
    isVerified: true,
  },
  {
    id: 5,
    name: 'Lakshmi Venkatesh',
    avatar: null,
    rating: 5,
    reviewText:
      'Purchased a king-size bed and side tables. The wood finish is gorgeous and it looks even better than the showroom display. Very happy with the purchase!',
    timeAgo: '8 months ago',
    isVerified: false,
  },
  {
    id: 6,
    name: 'Suresh Babu',
    avatar: null,
    rating: 4,
    reviewText:
      'Good range of office furniture. Got a complete workstation setup at a competitive price. Assembly team was professional and quick. Would recommend.',
    timeAgo: '1 year ago',
    isVerified: true,
  },
]

const AVATAR_COLORS = [
  '#c9a84c',
  '#0b6b58',
  '#e67e22',
  '#3498db',
  '#9b59b6',
  '#1abc9c',
]

const BUSINESS_RATING = 4.8
const TOTAL_REVIEWS = 233

/* ─── Google "G" SVG Icon ─── */
const GoogleIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
  >
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
)

/* ─── Star Rating Component ─── */
function StarRating({ rating, size = 14, gap = 2 }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  const empty = 5 - full - (hasHalf ? 1 : 0)

  return (
    <span style={{ display: 'flex', gap, alignItems: 'center' }}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} style={{ color: '#f39c12', fontSize: size, lineHeight: 1 }}>
          ★
        </span>
      ))}
      {hasHalf && (
        <span
          style={{
            position: 'relative',
            fontSize: size,
            lineHeight: 1,
            color: '#e0ddd8',
          }}
        >
          ★
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden',
              width: '55%',
              color: '#f39c12',
            }}
          >
            ★
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} style={{ color: '#e0ddd8', fontSize: size, lineHeight: 1 }}>
          ★
        </span>
      ))}
    </span>
  )
}

/* ─── Arrow SVG ─── */
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─── Review Card ─── */
function ReviewCard({ review, index }) {
  const initial = review.name.charAt(0).toUpperCase()
  const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length]

  return (
    <motion.div
      className={styles.reviewCard}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.avatar} style={{ background: bgColor }}>
          {review.avatar ? (
            <img className={styles.avatarImage} src={review.avatar} alt={review.name} />
          ) : (
            initial
          )}
        </div>
        <div className={styles.reviewerInfo}>
          <p className={styles.reviewerName}>{review.name}</p>
          <div className={styles.reviewMeta}>
            <span className={styles.timeAgo}>{review.timeAgo}</span>
            {review.isVerified && (
              <span className={styles.verifiedBadge}>✓</span>
            )}
          </div>
        </div>
        <span className={styles.headerGoogle}>
          <GoogleIcon size={18} />
        </span>
      </div>

      {/* Stars */}
      <div className={styles.cardStars}>
        <StarRating rating={review.rating} size={14} gap={2} />
      </div>

      {/* Review text */}
      <p className={styles.reviewText}>{review.reviewText}</p>
    </motion.div>
  )
}

/* ─── Main Section ─── */
export default function CustomerReviewsSection() {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  /* ─── Check scroll edges ─── */
  const checkScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    // Initial check after layout
    const t = setTimeout(checkScroll, 200)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      clearTimeout(t)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  /* ─── Scroll by card width ─── */
  const scroll = (dir) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector(`.${styles.reviewCard}`)
    const distance = card ? card.offsetWidth + 18 : 300
    el.scrollBy({ left: dir * distance, behavior: 'smooth' })
  }

  return (
    <section className={styles.section}>
      {/* ─── Section Header ─── */}
      <div className={styles.header}>
        {/* <div className={styles.eyebrowWrap}>
          <span className={`${styles.eyebrowLine} ${styles.eyebrowLineLeft}`} />
          <span className={styles.eyebrowText}>Testimonials</span>
          <span className={`${styles.eyebrowLine} ${styles.eyebrowLineRight}`} />
        </div> */}
        <h2 className={styles.title}>What our customers say</h2>
        {/* <p className={styles.subtitle}>
          Real reviews from real customers who love their furniture
        </p> */}
      </div>

      {/* ─── Two-Column Layout ─── */}
      <div className={styles.layout}>
        {/* ── Summary Panel ── */}
        <motion.div
          className={styles.summary}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Watermark */}
          <span className={styles.summaryWatermark}>G</span>

          {/* Logo */}
          <div className={styles.logoWrap}>
            <img src="/favlogo/logo-01.png" alt="Spacecrafts Furniture" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: 8 }} />
          </div>

          {/* Business name */}
          <h3 className={styles.businessName}>Spacecrafts Furniture</h3>

          {/* Rating */}
          <div className={styles.ratingBlock}>
            <span className={styles.ratingNumber}>{BUSINESS_RATING}</span>
            <StarRating rating={BUSINESS_RATING} size={18} gap={3} />
          </div>

          <p className={styles.reviewCount}>
            Based on <strong>{TOTAL_REVIEWS}</strong> Google reviews
          </p>

          {/* Google badge */}
          <span className={styles.googleBadge}>
            <span className={styles.googleIcon}>
              <GoogleIcon size={16} />
            </span>
            Google Reviews
          </span>

          {/* CTA */}
          <button className={styles.ctaButton}>Write a review</button>
        </motion.div>

        {/* ── Carousel ── */}
        <div className={styles.carouselWrap}>
          {/* Nav arrows */}
          <button
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous reviews"
          >
            <ChevronLeft />
          </button>
          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label="Next reviews"
          >
            <ChevronRight />
          </button>

          {/* Cards track */}
          <div className={styles.carousel} ref={carouselRef}>
            {MOCK_REVIEWS.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
