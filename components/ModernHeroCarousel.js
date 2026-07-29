// Modern Hero Carousel - Fully Rewritten
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_DURATION = 6000

/* ── New split hero assets (70% static / 30% carousel) ── */
// Bump NEXT_PUBLIC_HERO_VERSION in .env.local when replacing hero images (same filenames)
const HERO_IMAGE_VERSION = process.env.NEXT_PUBLIC_HERO_VERSION || '2'

function withHeroVersion(path) {
  return `${path}?v=${HERO_IMAGE_VERSION}`
}

const STATIC_HERO_IMAGE = withHeroVersion('/hero/static/static1.webp')

const movingHeroSlides = [
  { id: 1, image: withHeroVersion('/hero/moving/static2.webp'), alt: 'Hero promotion 1', link: '/products' },
  { id: 2, image: withHeroVersion('/hero/moving/static3.webp'), alt: 'Hero promotion 2', link: '/products' },
  { id: 3, image: withHeroVersion('/hero/moving/static4.webp'), alt: 'Hero promotion 3', link: '/products' },
  { id: 4, image: withHeroVersion('/hero/moving/static5.webp'), alt: 'Hero promotion 4', link: '/products' },
  { id: 5, image: withHeroVersion('/hero/moving/static6.webp'), alt: 'Hero promotion 5', link: '/products' },
]

const HERO_PRODUCTS_LINK = '/products'

function HeroImageLink({ href, children, style, isMobile }) {
  return (
    <Link
      href={href}
      style={{ display: 'block', width: '100%', height: '100%', position: 'relative', ...style }}
    >
      <motion.div
        whileHover={isMobile ? undefined : { scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
      >
        {children}
      </motion.div>
    </Link>
  )
}

const heroSlides = [
  {
    id: 1,
    title: 'Transform Your Living Space',
    subtitle: 'Premium Furniture for Modern Living',
    description: 'Discover our curated collection of designer furniture that blends elegance with everyday comfort.',
    image: '/hero/6.webp',
    cta: 'Shop Collection',
    ctaLink: '/products',
    accent: '#e67e22',
    imagePosition: 'center 35%',
  },
  {
    id: 2,
    title: 'Comfort Meets Style',
    subtitle: 'Luxury Sofas & Seating',
    description: 'Up to 40% off on selected premium sofas - sink into luxury without the premium price tag.',
    image: '/hero/2.jpg',
    cta: 'View Deals',
    ctaLink: '/products/category/sofas-couches',
    accent: '#3498db',
    imagePosition: 'center 40%',
  },
  {
    id: 3,
    title: 'Dream Bedroom',
    subtitle: 'Create Your Perfect Sanctuary',
    description: 'New arrivals in bedroom furniture - crafted for restful nights and beautiful mornings.',
    image: '/hero/8.webp',
    cta: 'Explore Bedroom',
    ctaLink: '/products/category/bedroom',
    accent: '#e74c3c',
    imagePosition: 'center 45%',
  }
]

/* Word-split helper for cinematic title animation */
const SplitTitle = ({ text }) => {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.4 + i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            willChange: 'transform, opacity',
          }}
        >
          {word}
        </motion.span>
      ))}
    </>
  )
}

export default function ModernHeroCarousel() {
  return <SplitHeroSection />
}

/* ── New split hero: 70% static left + 30% carousel right ── */
function SplitHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % movingHeroSlides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const pauseAndResume = useCallback(() => {
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [])

  const goToSlide = useCallback((index) => {
    setCurrentSlide((prev) => {
      if (index === prev) return prev
      setDirection(index > prev ? 1 : -1)
      return index
    })
    pauseAndResume()
  }, [pauseAndResume])

  const goNext = useCallback((e) => {
    e?.stopPropagation()
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % movingHeroSlides.length)
    pauseAndResume()
  }, [pauseAndResume])

  const goPrev = useCallback((e) => {
    e?.stopPropagation()
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + movingHeroSlides.length) % movingHeroSlides.length)
    pauseAndResume()
  }, [pauseAndResume])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 40) return
    if (diff > 0) goNext()
    else goPrev()
  }, [goNext, goPrev])

  const slide = movingHeroSlides[currentSlide]

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%' }),
    center: { x: 0 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%' }),
  }

  return (
    <section className="split-hero">
      <div className="split-hero__row">
        {/* Left — static hero (70%) */}
        <div className="split-hero__static">
          <HeroImageLink href={HERO_PRODUCTS_LINK} isMobile={isMobile}>
            <Image
              src={STATIC_HERO_IMAGE}
              alt="Spacecrafts Furniture — All Things Home Sale"
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 70vw, 70vw"
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
            />
          </HeroImageLink>
        </div>

        {/* Right — carousel (30%) */}
        <div
          className="split-hero__carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
            >
              <HeroImageLink href={HERO_PRODUCTS_LINK} isMobile={isMobile}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  quality={85}
                  sizes="(max-width: 768px) 30vw, 30vw"
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                />
              </HeroImageLink>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="split-hero__dots">
            {movingHeroSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToSlide(i)
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`split-hero__dot${currentSlide === i ? ' split-hero__dot--active' : ''}`}
              />
            ))}
          </div>

          {/* Next arrow */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="split-hero__arrow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .split-hero {
          width: 100%;
          background: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Same 70/30 side-by-side on all breakpoints — avoids tall stacked mobile layout */
        .split-hero__row {
          display: flex;
          flex-direction: row;
          gap: 5px;
          width: 100%;
          aspect-ratio: 2.75 / 1;
          max-height: 520px;
        }

        .split-hero__static,
        .split-hero__carousel {
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
        }

        .split-hero__static {
          flex: 7 1 0;
        }

        .split-hero__carousel {
          flex: 3 1 0;
          background: #111;
          touch-action: pan-y;
        }

        .split-hero__dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .split-hero__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }

        .split-hero__dot--active {
          width: 10px;
          height: 10px;
          background: #e67e22;
        }

        .split-hero__arrow {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.92);
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .split-hero__arrow:active {
          transform: scale(0.94);
        }

        @media (max-width: 768px) {
          .split-hero__row {
            aspect-ratio: 2.15 / 1;
            max-height: none;
            min-height: 150px;
          }

          .split-hero__dots {
            bottom: 8px;
            gap: 4px;
            max-width: calc(100% - 44px);
            flex-wrap: wrap;
            justify-content: center;
          }

          .split-hero__dot {
            width: 6px;
            height: 6px;
          }

          .split-hero__dot--active {
            width: 7px;
            height: 7px;
          }

          .split-hero__arrow {
            bottom: 6px;
            right: 6px;
            width: 28px;
            height: 28px;
          }

          .split-hero__arrow svg {
            width: 14px;
            height: 14px;
          }
        }

        @media (max-width: 480px) {
          .split-hero__row {
            aspect-ratio: 2 / 1;
            min-height: 140px;
          }

          .split-hero__dots {
            bottom: 6px;
          }

          .split-hero__arrow {
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </section>
  )
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PREVIOUS FULL-WIDTH ANIMATED HERO (commented out — kept for reference)
 * To restore: change export default to return <LegacyHeroCarousel /> instead
 * ─────────────────────────────────────────────────────────────────────────────
 */
function LegacyHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const progressRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(0)
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
      return
    }
    startTimeRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        startTimeRef.current = Date.now()
      }
      progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
    return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current) }
  }, [isAutoPlaying, currentSlide])

  const goToSlide = useCallback((index) => {
    if (index === currentSlide) return
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [currentSlide])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const slide = heroSlides[currentSlide]

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: isMobile ? '60vh' : '85vh',
        minHeight: isMobile ? '360px' : '480px',
        maxHeight: '760px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#111',
      }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' }}
          animate={{
            opacity: 1,
            clipPath: 'inset(0 0% 0 0%)',
            transition: { duration: 1, ease: [0.77, 0, 0.175, 1] },
          }}
          exit={{
            opacity: 0,
            clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
            transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Background Image - reverse Ken Burns (zoom-out) */}
          <motion.div
            key={`bg-${slide.id}`}
            initial={{ scale: 1.12 }}
            animate={{
              scale: 1,
              transition: { duration: SLIDE_DURATION / 1000 + 2, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
            style={{
              position: 'absolute',
              top: '-4%',
              left: '-2%',
              width: '104%',
              height: '108%',
              zIndex: 0,
              willChange: 'transform',
            }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              quality={85}
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: slide.imagePosition,
              }}
            />
          </motion.div>

          {/* No dark overlay - images stay fully bright */}

          {/* Animated shimmer light sweep */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '30%',
              height: '100%',
              zIndex: 2,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              maxWidth: '1280px',
              margin: '0 auto',
              padding: isMobile ? '0 20px' : '0 64px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ maxWidth: isMobile ? '100%' : '620px' }}>

              {/* Subtitle with animated expanding dash */}
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  color: '#ffffff',
                  margin: '0 0 22px',
                  textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                }}
              >
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block',
                    height: '2px',
                    borderRadius: '1px',
                    flexShrink: 0,
                    backgroundColor: slide.accent,
                    overflow: 'hidden',
                  }}
                />
                {slide.subtitle}
              </motion.p>

              {/* Title - word-by-word 3D perspective reveal */}
              <h1
                style={{
                  fontSize: 'clamp(36px, 5vw, 62px)',
                  fontWeight: 800,
                  lineHeight: 1.06,
                  color: '#fff',
                  margin: '0 0 22px',
                  letterSpacing: '-1.5px',
                  textShadow: '-1px -1px 0 rgba(0,0,0,0.7), 1px -1px 0 rgba(0,0,0,0.7), -1px 1px 0 rgba(0,0,0,0.7), 1px 1px 0 rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.5)',
                  perspective: '600px',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                <SplitTitle text={slide.title} key={slide.id} />
              </h1>

              {/* Description */}
              <motion.p
                className="hero-desc-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: '17px',
                  lineHeight: 1.75,
                  fontWeight: 500,
                  color: '#ffffff',
                  margin: '0 0 38px',
                  textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                  maxWidth: '460px',
                }}
              >
                {slide.description}
              </motion.p>

              {/* CTA with accent glow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={slide.ctaLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isMobile ? '12px 28px' : '17px 42px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: '#fff',
                    background: slide.accent,
                    borderRadius: '8px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, filter 0.35s ease',
                    boxShadow: "0 4px 24px " + slide.accent + "55, 0 1px 3px rgba(0,0,0,0.2)",
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                    e.currentTarget.style.boxShadow = "0 8px 40px " + slide.accent + "88, 0 2px 8px rgba(0,0,0,0.3)"
                    e.currentTarget.style.filter = 'brightness(1.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = "0 4px 24px " + slide.accent + "55, 0 1px 3px rgba(0,0,0,0.2)"
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                >
                  {slide.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next Arrows */}
      <button
        className="hero-nav-arrow"
        onClick={goPrev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.25)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          e.currentTarget.style.transform = 'translateY(-50%)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        className="hero-nav-arrow"
        onClick={goNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.25)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          e.currentTarget.style.transform = 'translateY(-50%)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>

      {/* Bottom progress indicators & counter */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: isMobile ? '20px' : '64px',
          right: isMobile ? '20px' : '64px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSlide(i)}
              aria-label={"Go to slide " + (i + 1)}
              style={{
                position: 'relative',
                width: currentSlide === i ? '72px' : '36px',
                height: '3px',
                borderRadius: '3px',
                border: 'none',
                background: currentSlide === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.22)',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
                padding: 0,
              }}
            >
              {currentSlide === i && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: progress + '%',
                    borderRadius: '3px',
                    backgroundColor: slide.accent,
                    transition: 'width 0.05s linear',
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '3px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </span>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-nav-arrow {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-desc-text {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
/* ── End of previous full-width animated hero ── */
