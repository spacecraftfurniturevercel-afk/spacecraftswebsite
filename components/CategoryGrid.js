"use client"
import React from "react"
import CategoryCard from "./CategoryCard"
import styles from "./ShopByCategorySection.module.css"

export default function CategoryGrid({ items = [], activeTab }) {
  return (
    <div className={styles.gridWrap}>
      <div className={styles.grid}>
        {items.map((it) => (
          <CategoryCard key={it.key} item={it} />
        ))}
      </div>
    </div>
  )
}
