"use client"
import React from "react"
import CategoryCardFav from "./CategoryCardFav"
import styles from "./OurFavouriteCategories.module.css"

export default function CategoriesGrid({ items = [] }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <div key={it.name} className={styles.gridItem}>
          <CategoryCardFav item={it} />
        </div>
      ))}
    </div>
  )
}
