'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './NewArrivalsGrid.module.css'

/* ─── Mock Data (structured for future API replacement) ─── */
const GRID_DATA = {
  /* Column 1 — single large full-height image */
  left: {
    id: 'left-1',
    title: 'Living Room Collection',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1100&fit=crop',
  },
  /* Column 2 — orange content card + one image */
  middle: {
    content: {
      label: 'New',
      title: "What's new?",
      subtitle: 'Discover our latest arrivals.',
      href: '/products?sort=newest',
    },
    image: {
      id: 'mid-1',
      title: 'Bedroom Essentials',
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=500&fit=crop',
    },
  },
  /* Column 3 — two stacked image cards */
  right: [
    {
      id: 'right-1',
      title: 'Workspace Setup',
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=500&fit=crop',
    },
    {
      id: 'right-2',
      title: 'Dining Furniture',
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=500&fit=crop',
    },
  ],
}

/* ─── Arrow Icon SVG ─── */
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ─── Reusable Image Card ─── */
function ImageCard({ item, index }) {
  return (
    <motion.div
      className={styles.imageCard}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
    >
      <div className={styles.cardImageWrap}>
        <img
          className={styles.cardImage}
          src={item.image}
          alt={item.title}
          loading="lazy"
        />
      </div>
      <div className={styles.cardOverlay} />
      <div className={styles.cardContent}>
        {item.badge && <span className={styles.badge}>{item.badge}</span>}
        <p className={styles.cardTitle}>{item.title}</p>
        <span className={styles.cardArrow}>
          <ArrowIcon />
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Orange Content Card ─── */
function ContentCard({ data }) {
  return (
    <motion.div
      className={styles.contentCard}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
    >
      {/* Decorative circles */}
      <div className={styles.contentCardDecor} />
      <div className={styles.contentCardDecor2} />

      <div className={styles.contentCardBody}>
        <span className={styles.contentLabel}>{data.label}</span>
        <h3 className={styles.contentTitle}>{data.title}</h3>
        <p className={styles.contentSubtitle}>{data.subtitle}</p>
      </div>

      <div className={styles.contentArrowWrap}>
        <span className={styles.contentArrow}>
          <ArrowIcon />
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Main Section ─── */
export default function NewArrivalsGrid() {
  const { left, middle, right } = GRID_DATA

  return (
    <section className={styles.section}>
      {/* Section heading */}
      <div className={styles.header}>
        <h2 className={styles.title}>New arrivals</h2>
        {/* <p className={styles.subtitle}>
          Fresh finds for every room — explore what just landed
        </p> */}
      </div>

      {/* 3-column masonry grid */}
      <div className={styles.grid}>
        {/* ── Column 1: Large full-height image ── */}
        <div className={styles.colLeft}>
          <ImageCard item={left} index={0} />
        </div>

        {/* ── Column 2: Orange card + image ── */}
        <div className={styles.colMiddle}>
          <ContentCard data={middle.content} />
          <ImageCard item={middle.image} index={1} />
        </div>

        {/* ── Column 3: Two stacked images ── */}
        <div className={styles.colRight}>
          {right.map((item, i) => (
            <ImageCard key={item.id} item={item} index={i + 2} />
          ))}
        </div>
      </div>
    </section>
  )
}
