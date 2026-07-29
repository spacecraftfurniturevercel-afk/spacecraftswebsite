// Promotional Banners — Coupon Strip + 3 Offer Cards
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './PromoBanners.module.css'

const SLIDE_DURATION = 4500

var promoCards = [
  {
    title: 'Home Décor',
    subtitle: 'Gifting Made Easy',
    cta: 'Shop Now',
    href: '/products',
    image: '/PromoCard/1.png',
  },
  {
    title: 'Explore Premium',
    subtitle: 'Mattresses & Beds',
    cta: 'Explore',
    href: '/products',
    image: '/PromoCard/2.png',
  },
  {
    title: 'Beds, Wardrobes &',
    subtitle: 'Storage at 60% Off',
    cta: 'Shop Deals',
    href: '/products',
    image: '/PromoCard/3.png',
  },
]

function PromoCard({ card, index, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.12 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={card.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <article className={styles.promoCard}>
          <div className={styles.promoCardImage}>
            <Image
              src={card.image}
              alt={card.title}
              width={800}
              height={400}
              quality={80}
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div className={styles.promoCardOverlay} />
          <div className={styles.promoCardContent}>
            <div>
              <h3 className={styles.promoCardTitle}>{card.title}</h3>
              <p className={styles.promoCardSub}>{card.subtitle}</p>
            </div>
            <span className={styles.promoCardCta}>
              {card.cta}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

function PromoCarouselCard({ card, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ height: '100%' }}
    >
      <Link href={card.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <article className={styles.promoCarouselCard}>
          <div className={styles.promoCarouselCardImage}>
            <Image
              src={card.image}
              alt={card.title}
              fill
              quality={80}
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

function PromoMobileCarousel({ cards, isVisible }) {
  var _slide = useState(0)
  var currentSlide = _slide[0]
  var setCurrentSlide = _slide[1]

  var _dir = useState(1)
  var direction = _dir[0]
  var setDirection = _dir[1]

  var touchStartX = useRef(0)

  useEffect(function () {
    var timer = setInterval(function () {
      setDirection(1)
      setCurrentSlide(function (prev) { return (prev + 1) % cards.length })
    }, SLIDE_DURATION)
    return function () { clearInterval(timer) }
  }, [cards.length])

  var goToSlide = useCallback(function (index) {
    setCurrentSlide(function (prev) {
      if (index === prev) return prev
      setDirection(index > prev ? 1 : -1)
      return index
    })
  }, [])

  var goNext = useCallback(function () {
    setDirection(1)
    setCurrentSlide(function (prev) { return (prev + 1) % cards.length })
  }, [cards.length])

  var goPrev = useCallback(function () {
    setDirection(-1)
    setCurrentSlide(function (prev) { return (prev - 1 + cards.length) % cards.length })
  }, [cards.length])

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    var diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 40) return
    if (diff > 0) goNext()
    else goPrev()
  }

  var slide = cards[currentSlide]

  var slideVariants = {
    enter: function (dir) { return { x: dir > 0 ? '100%' : '-100%' } },
    center: { x: 0 },
    exit: function (dir) { return { x: dir > 0 ? '-100%' : '100%' } },
  }

  return (
    <div className={styles.promoCarousel}>
      <div
        className={styles.promoCarouselViewport}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slide.title + currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className={styles.promoCarouselSlide}
          >
            <PromoCarouselCard card={slide} isVisible={isVisible} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.promoCarouselDots}>
        {cards.map(function (card, index) {
          return (
            <button
              key={index}
              type="button"
              aria-label={'Go to promo ' + (index + 1)}
              className={
                styles.promoCarouselDot +
                (currentSlide === index ? ' ' + styles.promoCarouselDotActive : '')
              }
              onClick={function () { goToSlide(index) }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function PromoBanners() {
  var sectionRef = useRef(null)
  var _v = useState(false)
  var isVisible = _v[0]
  var setIsVisible = _v[1]

  var _copied = useState(false)
  var copied = _copied[0]
  var setCopied = _copied[1]

  var _mobile = useState(false)
  var isMobile = _mobile[0]
  var setIsMobile = _mobile[1]

  useEffect(function () {
    function check() { setIsMobile(window.innerWidth <= 600) }
    check()
    window.addEventListener('resize', check)
    return function () { window.removeEventListener('resize', check) }
  }, [])

  useEffect(function () {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return function () { observer.disconnect() }
  }, [])

  function handleCopy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('HELLO1500')
    }
    setCopied(true)
    setTimeout(function () { setCopied(false) }, 2500)
  }

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>

        {/* Coupon Strip */}
        {/* <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={styles.couponStrip}
        >
          <div className={styles.couponGoldLine} />
          <div className={styles.couponInner}>
            <div className={styles.couponTextGroup}>
              <span className={styles.couponTitle}>Sign Up & Enjoy Up to</span>
              <span className={styles.couponAmount}>40% Off + An Additional 10%</span>
              <span className={styles.couponSub}>On Your First Furniture Purchase</span>
            </div>

            <div className={styles.couponDivider} />

            <div className={styles.couponCodeGroup}>
              <span className={styles.couponLabel}>Use Coupon :</span>
              <button onClick={handleCopy} className={styles.couponBadge}>
                <span className={styles.couponCode}>HOLIDAY10</span>
                {copied ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
              {copied && <span className={styles.copiedText}>Copied!</span>}
            </div>

            <Link href="/login" className={styles.ctaCircle}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <span className={styles.tcText}>T&C Apply</span>
          </div>
        </motion.div> */}

        {/* Promo Cards — grid on desktop/tablet, carousel on mobile only */}
        {isMobile ? (
          <PromoMobileCarousel cards={promoCards} isVisible={isVisible} />
        ) : (
          <div className={styles.promoGrid}>
            {promoCards.map(function (card, index) {
              return (
                <PromoCard key={index} card={card} index={index} isVisible={isVisible} />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
