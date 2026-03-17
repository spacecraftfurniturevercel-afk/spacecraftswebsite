"use client"
import React from "react"
import styles from "./BrandsOnDiscounts.module.css"

export default function BrandsCategoryTabs({ categories = [], active = '', onChange }) {
  return (
    <nav className={styles.catRow} aria-label="Brands categories">
      {categories.map((c) => {
        const isActive = c.key === active
        return (
          <button
            key={c.key}
            className={`${styles.catItem} ${isActive ? styles.catActive : ''}`}
            onClick={() => onChange && onChange(c.key)}
            aria-pressed={isActive}
          >
            <div className={styles.catIcon} aria-hidden>
              <img src={c.icon} alt={c.label} />
            </div>
            <div className={styles.catLabel}>{c.label}</div>
            {isActive && <div className={styles.catUnderline} />}
          </button>
        )
      })}
    </nav>
  )
}
