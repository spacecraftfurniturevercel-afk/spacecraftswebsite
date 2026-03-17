// Modern Category Grid Section - SEO Optimized
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './ModernCategoryGrid.module.css'

var categories = [
  { id: 1, name: 'Sofas & Couches', slug: 'sofas-couches', image: '/category/sofas.webp', productCount: 45 },
  { id: 2, name: 'Chairs & Seating', slug: 'chairs-seating', image: '/category/chairs.webp', productCount: 38 },
  { id: 3, name: 'Tables', slug: 'tables', image: '/category/tables.webp', productCount: 32 },
  { id: 4, name: 'Beds & Mattresses', slug: 'beds-frames', image: '/category/beds.webp', productCount: 28 },
  { id: 5, name: 'Dining Sets', slug: 'dining-room', image: '/category/diningsets.webp', productCount: 42 },
  { id: 6, name: 'Outdoor Living', slug: 'outdoor-furniture', image: '/category/outdoor.webp', productCount: 24 },
]

function CategoryCard({ category, index, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={'/products/category/' + category.slug} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <article className={styles.card}>
          <div className={styles.imageWrap}>
            <div className={styles.imageInner}>
              <Image
                src={category.image}
                alt={category.name + ' furniture collection'}
                fill
                unoptimized
                sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 20vw"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </div>
          </div>
          <div className={styles.info}>
            <h3 className={styles.name}>{category.name}</h3>
            <span className={styles.count}>{category.productCount}+ Products</span>
            <span className={styles.explore}>
              Explore
              <svg className={styles.exploreArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

export default function ModernCategoryGrid({ serverCategories = [] }) {
  var sectionRef = useRef(null)
  var gridRef = useRef(null)
  var autoSlideRef = useRef(null)
  var isPausedRef = useRef(false)
  var _v = useState(false)
  var isVisible = _v[0]
  var setIsVisible = _v[1]

  function scrollGrid(direction) {
    if (gridRef.current) {
      var container = gridRef.current
      var scrollAmount = container.clientWidth * 0.6
      if (direction === 'right') {
        // If near the end, loop back to start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      } else {
        // If at the start, loop to end
        if (container.scrollLeft <= 10) {
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' })
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        }
      }
    }
  }

  // Auto-slide every 5 seconds
  useEffect(function () {
    function startAutoSlide() {
      autoSlideRef.current = setInterval(function () {
        if (!isPausedRef.current) {
          scrollGrid('right')
        }
      }, 5000)
    }
    if (isVisible) {
      startAutoSlide()
    }
    return function () {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current)
    }
  }, [isVisible])

  function handleMouseEnter() {
    isPausedRef.current = true
  }

  function handleMouseLeave() {
    isPausedRef.current = false
  }

  useEffect(function () {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return function () { observer.disconnect() }
  }, [])

  var categoryImageMap = {
    'sofas-couches': '/category/sofas.webp',
    'chairs': '/category/chairs.webp',
    'tables': '/category/tables.webp',
    'beds': '/category/beds.webp',
    'dining-sets': '/category/diningsets.webp',
    'outdoor-furniture': '/category/outdoor.webp',
    'sofa-cum-beds': '/header/sofasets.webp',
    'space-saving-furniture': '/header/spacesavingfurniture.webp',
    'living-room': '/category/sofas.webp',
    'bedroom': '/category/beds.webp',
    'storage-organization': '/category/tables.webp',
    'office-furniture': '/category/chairs.webp',
    'kids-furniture': '/category/beds.webp',
    'mattresses': '/category/beds.webp',
    'home-decor': '/category/sofas.webp',
    'tv-units-entertainment': '/category/tables.webp',
    'wardrobes-cabinets': '/category/beds.webp',
  }

  var displayCategories =
    serverCategories.length > 0
      ? serverCategories.map(function (cat) {
          return {
            ...cat,
            image: categoryImageMap[cat.slug] || '/category/sofas.webp',
            productCount: cat.productCount || 0,
          }
        })
      : categories

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Section Header */}
      <div className={styles.header}>
        {/* <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className={styles.eyebrowWrap}
        >
          <span className={`${styles.eyebrowLine} ${styles.eyebrowLineLeft}`} />
          <span className={styles.eyebrowText}>Explore</span>
          <span className={`${styles.eyebrowLine} ${styles.eyebrowLineRight}`} />
        </motion.div> */}

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className={styles.title}
        >
          Shop by Category
        </motion.h2>
        {/* <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={styles.subtitle}
        >
          Curated collections for every room in your home
        </motion.p> */}
      </div>

      {/* Category Grid */}
      <div className={styles.sliderWrap} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button className={styles.sliderArrow + ' ' + styles.arrowLeft} onClick={function () { scrollGrid('left') }} aria-label="Scroll left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div ref={gridRef} className={styles.grid}>
          {displayCategories.slice(0, 6).map(function (category, index) {
            return (
              <div key={category.slug || category.id} className={styles.gridItem}>
                <CategoryCard
                  category={category}
                  index={index}
                  isVisible={isVisible}
                />
              </div>
            )
          })}
        </div>
        <button className={styles.sliderArrow + ' ' + styles.arrowRight} onClick={function () { scrollGrid('right') }} aria-label="Scroll right">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* View All CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={styles.ctaWrap}
      >
        <Link href="/products" className={styles.ctaButton}>
          View All Categories
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </motion.div>
    </section>
  )
}
