// Modern Category Grid Section - 12 categories, 6×2 grid
'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { buildHomepageCategories } from '../lib/homeCategories'
import styles from './ModernCategoryGrid.module.css'

function CategoryCard({ category, index, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={'/products/category/' + category.slug} className={styles.cardLink}>
        <article className={styles.card}>
          <div className={styles.imageWrap}>
            <Image
              src={category.image}
              alt={category.name + ' furniture collection'}
              fill
              quality={80}
              sizes="(max-width: 600px) 50vw, 16vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          <h3 className={styles.name}>{category.name}</h3>
        </article>
      </Link>
    </motion.div>
  )
}

export default function ModernCategoryGrid({ serverCategories = [] }) {
  var sectionRef = useRef(null)
  var _v = useState(false)
  var isVisible = _v[0]
  var setIsVisible = _v[1]

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

  var displayCategories = buildHomepageCategories(serverCategories)

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className={styles.title}
        >
          Shop by Category
        </motion.h2>
      </div>

      <div className={styles.grid}>
        {displayCategories.map(function (category, index) {
          return (
            <CategoryCard
              key={category.slug}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          )
        })}
      </div>

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
