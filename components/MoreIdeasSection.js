'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './MoreIdeasSection.module.css'

/* ─── Category Tabs ─── */
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'bedroom', label: 'Bedroom' },
  { key: 'living-room', label: 'Living room' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'workspace', label: 'Workspace' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'kids', label: 'Baby & children room' },
  { key: 'dining', label: 'Dining' },
  { key: 'hallway', label: 'Hallway' },
  { key: 'laundry', label: 'Laundry' },
]

/* ─── Mock Inspirational Data ─── */
const MOCK_ITEMS = [
  {
    id: 1,
    category: 'living-room',
    label: 'Warm minimalist living',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=800&fit=crop',
    size: 'tall',
  },
  {
    id: 2,
    category: 'bedroom',
    label: 'Scandinavian bedroom retreat',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 3,
    category: 'kitchen',
    label: 'Modern kitchen essentials',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
    size: 'square',
  },
  {
    id: 4,
    category: 'workspace',
    label: 'Productive home office',
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 5,
    category: 'outdoor',
    label: 'Balcony garden oasis',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=800&fit=crop',
    size: 'tall',
  },
  {
    id: 6,
    category: 'dining',
    label: 'Elegant dining setup',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=500&fit=crop',
    size: 'wide',
  },
  {
    id: 7,
    category: 'bathroom',
    label: 'Spa-inspired bathroom',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=800&fit=crop',
    size: 'tall',
  },
  {
    id: 8,
    category: 'kids',
    label: 'Playful kids room',
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 9,
    category: 'hallway',
    label: 'Welcoming entryway',
    image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=600&fit=crop',
    size: 'square',
  },
  {
    id: 10,
    category: 'living-room',
    label: 'Cozy reading corner',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=500&fit=crop',
    size: 'wide',
  },
  {
    id: 11,
    category: 'bedroom',
    label: 'Linen & natural textures',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop',
    size: 'tall',
  },
  {
    id: 12,
    category: 'kitchen',
    label: 'Open shelving kitchen',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 13,
    category: 'laundry',
    label: 'Organised laundry space',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop',
    size: 'square',
  },
  {
    id: 14,
    category: 'outdoor',
    label: 'Patio lounge living',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 15,
    category: 'workspace',
    label: 'Creative studio setup',
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&h=800&fit=crop',
    size: 'tall',
  },
  {
    id: 16,
    category: 'dining',
    label: 'Farmhouse dining charm',
    image: 'https://images.unsplash.com/photo-1595514535415-dae8580c416c?w=600&h=500&fit=crop',
    size: 'wide',
  },
  {
    id: 17,
    category: 'living-room',
    label: 'Earth-tone palette',
    image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=450&fit=crop',
    size: 'medium',
  },
  {
    id: 18,
    category: 'bedroom',
    label: 'Boho bedroom haven',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop',
    size: 'square',
  },
]

const ITEMS_PER_LOAD = 6

export default function MoreIdeasSection() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD)
  const [isVisible, setIsVisible] = useState(false)

  const sectionRef = useRef(null)
  const tabsRef = useRef(null)
  const tabRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  /* ─── Filter items by category ─── */
  const filteredItems =
    activeCategory === 'all'
      ? MOCK_ITEMS
      : MOCK_ITEMS.filter((item) => item.category === activeCategory)

  const visibleItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < filteredItems.length
  const remainingCount = filteredItems.length - visibleCount

  /* ─── Distribute items into 3 columns for masonry ─── */
  const distributeToColumns = (items) => {
    const cols = [[], [], []]
    items.forEach((item, i) => {
      cols[i % 3].push(item)
    })
    return cols
  }

  const columns = distributeToColumns(visibleItems)

  /* ─── Measure tab indicator position ─── */
  const measureIndicator = useCallback(() => {
    const activeIndex = CATEGORIES.findIndex((c) => c.key === activeCategory)
    const el = tabRefs.current[activeIndex]
    const bar = tabsRef.current
    if (el && bar) {
      const barRect = bar.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({
        left: elRect.left - barRect.left,
        width: elRect.width,
      })
    }
  }, [activeCategory])

  /* ─── IntersectionObserver: visibility + header hide ─── */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)

        // Hide/show header based on section visibility
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          document.documentElement.setAttribute('data-hide-header', '')
        } else {
          document.documentElement.removeAttribute('data-hide-header')
        }
      },
      { threshold: [0, 0.1, 0.5], rootMargin: '-60px 0px 0px 0px' }
    )

    observer.observe(section)

    // Fallback timer for initial render
    const fallback = setTimeout(() => setIsVisible(true), 800)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
      document.documentElement.removeAttribute('data-hide-header')
    }
  }, [])

  /* ─── Measure indicator on mount + category change ─── */
  useEffect(() => {
    if (!isVisible) return
    const t = setTimeout(measureIndicator, 100)
    return () => clearTimeout(t)
  }, [isVisible, measureIndicator])

  useEffect(() => {
    window.addEventListener('resize', measureIndicator)
    return () => window.removeEventListener('resize', measureIndicator)
  }, [measureIndicator])

  /* ─── Handle category switch ─── */
  const handleCategoryChange = (key) => {
    setActiveCategory(key)
    setVisibleCount(ITEMS_PER_LOAD) // Reset visible count on category change
  }

  /* ─── Load more ─── */
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD)
  }

  /* ─── Card size class ─── */
  const sizeClass = (size) => {
    switch (size) {
      case 'tall':
        return styles.cardTall
      case 'wide':
        return styles.cardWide
      case 'square':
        return styles.cardSquare
      default:
        return styles.cardMedium
    }
  }

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ─── Section Title ─── */}
      <div className={styles.header}>
        <h2 className={styles.title}>More ideas and inspiration</h2>
        {/* <p className={styles.subtitle}>
          Explore curated rooms and styles to find what speaks to you
        </p> */}
      </div>

      {/* ─── Category Filter Tabs (Sticky) ─── */}
      <div className={styles.tabsSticky}>
        <div className={styles.tabsScroll}>
          <div className={styles.tabsBar} ref={tabsRef}>
            {/* Sliding pill indicator */}
            <span
              className={styles.tabIndicator}
              style={{ left: indicator.left, width: indicator.width }}
            />

            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.key}
                ref={(el) => (tabRefs.current[i] = el)}
                className={`${styles.tabBtn} ${
                  activeCategory === cat.key ? styles.tabBtnActive : ''
                }`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Masonry Grid ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className={styles.masonryGrid}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {columns.map((colItems, colIndex) => (
            <div
              key={colIndex}
              className={`${styles.masonryColumn} ${
                colIndex === 1 ? styles.masonryColumnMiddle : ''
              }`}
            >
              {colItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={`${styles.card} ${sizeClass(item.size)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: (colIndex * colItems.length + idx) * 0.06,
                    ease: 'easeOut',
                  }}
                >
                  <div className={styles.cardInner}>
                    <img
                      className={styles.cardImage}
                      src={item.image}
                      alt={item.label}
                      loading="lazy"
                    />
                    <div className={styles.cardOverlay}>
                      <p className={styles.cardLabel}>{item.label}</p>
                      <p className={styles.cardCategory}>
                        {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ─── Load More ─── */}
      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            <span>Load {Math.min(remainingCount, ITEMS_PER_LOAD)} more</span>
            <span className={styles.loadMoreIcon}>↓</span>
          </button>
          <p className={styles.countText}>
            Showing {visibleItems.length} of {filteredItems.length}
          </p>
        </div>
      )}
    </section>
  )
}
