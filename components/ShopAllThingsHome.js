// ShopAllThingsHome — Dynamic category tabs with product grid
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import styles from './ShopAllThingsHome.module.css'

// Tab definitions — each has a `tag` that matches the product's tags[] array in the DB.
// For special tabs (material/price based), tag is empty and a filter function is used instead.
var roomTabs = [
  { id: 'living-room',      label: 'Living Room',       tag: 'living-room' },
  { id: 'bed-room',         label: 'Bed Room',          tag: 'bed-room' },
  { id: 'dining-room',      label: 'Dining Room',       tag: 'dining-room' },
  { id: 'study-room',       label: 'Study Room',        tag: 'study-room' },
  { id: 'best-offer',       label: 'Best Offers',       tag: 'best-offer' },
  { id: 'solid-wood',       label: 'Solid Wood',        tag: '' },  // material-based filter
  { id: 'engineered-wood',  label: 'Engineered Wood',   tag: '' },  // material-based filter
  { id: 'luxury-furniture', label: 'Luxury Furniture',   tag: '' },  // price-based filter
]

// Filter functions keyed by tab id for special tabs
function getFilter(tabId) {
  switch (tabId) {
    case 'solid-wood':
      return function (p) {
        var name = (p.name || '').toLowerCase()
        var tags = Array.isArray(p.tags) ? p.tags : []
        return (p.material && /solid\s*wood|sheesham|teak/i.test(p.material))
          || name.includes('wooden')
          || tags.indexOf('wooden-beds') !== -1
          || tags.indexOf('wooden-dinings') !== -1
      }
    case 'engineered-wood':
      return function (p) {
        var name = (p.name || '').toLowerCase()
        var tags = Array.isArray(p.tags) ? p.tags : []
        return (p.material && /engineered|mdf|particle\s*board|plywood|metal|steel|iron/i.test(p.material))
          || name.includes('metal') || name.includes('steel')
          || tags.indexOf('metal-cots') !== -1
      }
    case 'luxury-furniture':
      return function (p) {
        var price = p.discount_price || p.price || 0
        return price >= 25000
      }
    default:
      return null
  }
}

export default function ShopAllThingsHome({ products = [] }) {
  var _active = useState('living-room')
  var activeTab = _active[0]
  var setActiveTab = _active[1]

  var sectionRef = useRef(null)
  var gridRef = useRef(null)
  var _vis = useState(false)
  var isVisible = _vis[0]
  var setIsVisible = _vis[1]

  function scrollGrid(direction) {
    if (gridRef.current) {
      var scrollAmount = gridRef.current.clientWidth * 0.6
      gridRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  var _indicator = useState({ left: 0, width: 0 })
  var tabIndicator = _indicator[0]
  var setTabIndicator = _indicator[1]

  var tabRefs = useRef({})
  var tabContainerRef = useRef(null)

  // Visibility observer with fallback timer
  useEffect(function () {
    var fired = false
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !fired) {
          fired = true
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    // Safety fallback — ensure visibility after 800ms even if observer doesn't fire
    var timer = setTimeout(function () {
      if (!fired) {
        fired = true
        setIsVisible(true)
      }
    }, 800)
    return function () {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])

  // Sliding tab indicator
  var updateIndicator = useCallback(function () {
    var el = tabRefs.current[activeTab]
    var container = tabContainerRef.current
    if (el && container) {
      var elRect = el.getBoundingClientRect()
      var containerRect = container.getBoundingClientRect()
      setTabIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      })
    }
  }, [activeTab])

  useEffect(function () {
    // Delay first measurement so motion animation has time to render
    var t = setTimeout(updateIndicator, 100)
    window.addEventListener('resize', updateIndicator)
    return function () {
      clearTimeout(t)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator])

  // Re-measure after visibility triggers
  useEffect(function () {
    if (isVisible) {
      var t = setTimeout(updateIndicator, 350)
      return function () { clearTimeout(t) }
    }
  }, [isVisible, updateIndicator])

  // Get the active tab definition
  var activeTabDef = roomTabs.find(function (t) { return t.id === activeTab })

  // Filter products by tag or special filter
  var filteredProducts = products.filter(function (p) {
    // Check special filter first (material / price based)
    var specialFilter = getFilter(activeTab)
    if (specialFilter) return specialFilter(p)
    // Tag-based filter: check if product.tags[] array contains the tab's tag
    if (activeTabDef && activeTabDef.tag) {
      var productTags = p.tags
      // Handle edge case where Supabase returns tags as a postgres string "{a,b,c}"
      if (typeof productTags === 'string') {
        return productTags.indexOf(activeTabDef.tag) !== -1
      }
      if (Array.isArray(productTags)) {
        return productTags.indexOf(activeTabDef.tag) !== -1
      }
    }
    return false
  })

  var displayProducts = filteredProducts.slice(0, 12)
  var remainingCount = filteredProducts.length - 12

  // Build link for "View All" using the active tab's tag
  var viewAllHref = '/products'
  if (activeTabDef && activeTabDef.tag) {
    viewAllHref = '/products?tag=' + activeTabDef.tag
  } else if (activeTab === 'solid-wood') {
    viewAllHref = '/products?material=solid-wood'
  } else if (activeTab === 'engineered-wood') {
    viewAllHref = '/products?material=engineered-wood'
  } else if (activeTab === 'luxury-furniture') {
    viewAllHref = '/products?sort=price-desc'
  }

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        {/* <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className={styles.eyebrowWrap}
        >
          <span className={styles.eyebrowLine + ' ' + styles.eyebrowLineLeft} />
          <span className={styles.eyebrowText}>Collections</span>
          <span className={styles.eyebrowLine + ' ' + styles.eyebrowLineRight} />
        </motion.div> */}

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className={styles.title}
        >
          Shop All Things Home
        </motion.h2>
        {/* <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={styles.subtitle}
        >
          Explore furniture by room, material, or style
        </motion.p> */}
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={styles.tabsScroll}
      >
        <div ref={tabContainerRef} className={styles.tabsBar}>
          {/* Sliding indicator */}
          <div
            className={styles.tabIndicator}
            style={{
              left: tabIndicator.left + 'px',
              width: tabIndicator.width + 'px',
            }}
          />

          {roomTabs.map(function (tab) {
            var isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={function (el) { tabRefs.current[tab.id] = el }}
                onClick={function () { setActiveTab(tab.id) }}
                className={styles.tabBtn + (isActive ? ' ' + styles.tabBtnActive : '')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className={styles.sliderWrap}>
        <button className={styles.sliderArrow + ' ' + styles.arrowLeft} onClick={function () { scrollGrid('left') }} aria-label="Scroll left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            ref={gridRef}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={styles.grid}
          >
            {displayProducts.length > 0 ? (
              displayProducts.map(function (product, i) {
                return (
                  <div key={product.id || i} className={styles.gridItem}>
                    <ProductCard product={product} index={i} />
                  </div>
                )
              })
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🪑</div>
                <h3 className={styles.emptyTitle}>No products yet</h3>
                <p className={styles.emptyText}>
                  Products for this category will appear here once added.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <button className={styles.sliderArrow + ' ' + styles.arrowRight} onClick={function () { scrollGrid('right') }} aria-label="Scroll right">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* View All CTA */}
      {displayProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.ctaWrap}
        >
          <Link href={viewAllHref} className={styles.ctaButton}>
            {remainingCount > 0
              ? 'View All ' + filteredProducts.length + ' Products'
              : 'Explore More'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      )}
    </section>
  )
}
