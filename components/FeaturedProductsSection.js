// Featured Products Section — Bestsellers & Offers tabs
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import styles from './FeaturedProductsSection.module.css'

var tabs = [
  { id: 'bestsellers', label: 'Bestsellers', icon: '★' },
  { id: 'offers',      label: 'Offers',      icon: '%' },
]

export default function FeaturedProductsSection({ bestsellers = [], offered = [] }) {
  var _active = useState('bestsellers')
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

  // Visibility observer with fallback
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
    var timer = setTimeout(function () {
      if (!fired) { fired = true; setIsVisible(true) }
    }, 800)
    return function () { observer.disconnect(); clearTimeout(timer) }
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
    var t = setTimeout(updateIndicator, 100)
    window.addEventListener('resize', updateIndicator)
    return function () { clearTimeout(t); window.removeEventListener('resize', updateIndicator) }
  }, [updateIndicator])

  useEffect(function () {
    if (isVisible) {
      var t = setTimeout(updateIndicator, 350)
      return function () { clearTimeout(t) }
    }
  }, [isVisible, updateIndicator])

  // Pick products based on active tab
  var currentProducts = activeTab === 'bestsellers' ? bestsellers : offered
  var displayProducts = currentProducts.slice(0, 12)
  var remainingCount = currentProducts.length - 12

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
          <span className={styles.eyebrowText}>Handpicked</span>
          <span className={styles.eyebrowLine + ' ' + styles.eyebrowLineRight} />
        </motion.div> */}

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className={styles.title}
        >
          Featured Products
        </motion.h2>

        {/* <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.12 }}
          className={styles.subtitle}
        >
          Our most loved pieces and exclusive deals
        </motion.p> */}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18 }}
          className={styles.tabsWrap}
        >
          <div ref={tabContainerRef} className={styles.tabsBar}>
            <div
              className={styles.tabIndicator}
              style={{
                left: tabIndicator.left + 'px',
                width: tabIndicator.width + 'px',
              }}
            />

            {tabs.map(function (tab) {
              var isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  ref={function (el) { tabRefs.current[tab.id] = el }}
                  onClick={function () { setActiveTab(tab.id) }}
                  className={styles.tabBtn + (isActive ? ' ' + styles.tabBtnActive : '')}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>

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
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptyText}>Check back soon for updates</p>
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
          {remainingCount > 0 && (
            <p className={styles.remainingText}>
              + {remainingCount} more product{remainingCount > 1 ? 's' : ''} in this collection
            </p>
          )}
          <Link href="/products" className={styles.ctaButton}>
            View All Products
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
