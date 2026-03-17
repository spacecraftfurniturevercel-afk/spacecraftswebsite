"use client"
import React, { useRef } from "react"
import BrandCard from "./BrandCard"
import styles from "./BrandsOnDiscounts.module.css"

export default function BrandsCarousel({ brands = [] }) {
  const ref = useRef(null)

  return (
    <div className={styles.carouselWrap} ref={ref}>
      <div className={styles.carousel}>
        {brands.map((b) => (
          <div className={styles.carouselItem} key={b.name}>
            <BrandCard brand={b} />
          </div>
        ))}
      </div>
    </div>
  )
}
