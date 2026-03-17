"use client"
import React from "react"
import styles from "./ShopByCategorySection.module.css"

export default function CategoryCard({ item }) {
  return (
    <a href={`/products/category/${encodeURIComponent(item.key.toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''))}`} className={styles.card}>
      <div className={styles.cardInner}>
        <img src={item.img} alt={item.key} className={styles.cardImage} />
        <div className={styles.cardLabel}>{item.key}</div>
      </div>
    </a>
  )
}
