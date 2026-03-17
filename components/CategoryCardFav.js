"use client"
import React from "react"
import styles from "./OurFavouriteCategories.module.css"

export default function CategoryCardFav({ item }) {
  return (
    <a href={`/products/category/${encodeURIComponent(item.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''))}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.media}>
          <img src={item.img} alt={item.name} className={styles.mediaImg} />
        </div>

        <div className={styles.textRow}>
          <div className={styles.catName}>{item.name}</div>
          <div className={styles.priceRow}>
            <span className={styles.price}>Starting at Rs. {item.price}</span>
            <svg className={styles.chev} width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  )
}
