"use client"
import React from "react"
import styles from "./BrandsOnDiscounts.module.css"

export default function BrandCard({ brand }) {
  return (
    <a href={`/brands/${encodeURIComponent(brand.name)}`} className={styles.cardLink}>
      <div className={styles.cardCircle}>
        <img src={brand.img} alt={brand.name} className={styles.brandImg} />

        <div className={styles.overlay}>
          <div className={styles.overlayInner}>
            <div className={styles.brandName}>{brand.name}</div>
            <div className={styles.offerText}>{brand.offer}</div>
          </div>
        </div>
      </div>
    </a>
  )
}
