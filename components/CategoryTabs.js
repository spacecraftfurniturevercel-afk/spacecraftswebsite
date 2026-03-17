"use client"
import React, { useRef } from "react"
import styles from "./ShopByCategorySection.module.css"

export default function CategoryTabs({ categories = [], active, onChange }) {
  const scroller = useRef(null)

  return (
    <div className={styles.tabsWrap} ref={scroller} role="tablist" aria-label="Shop categories">
      {categories.map((c) => {
        const isActive = c === active
        return (
          <button
            key={c}
            role="tab"
            aria-selected={isActive}
            className={`${styles.tabPill} ${isActive ? styles.tabActive : ""}`}
            onClick={() => onChange && onChange(c)}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}
