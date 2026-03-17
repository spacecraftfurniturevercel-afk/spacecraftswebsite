"use client"
import React, { useRef } from "react"
import CityCard from "./CityCard"
import styles from "./StoreLocator.module.css"

export default function CityCarousel({ cities = [] }) {
  const ref = useRef(null)

  function scrollBy(direction = 1) {
    const el = ref.current
    if (!el) return
    const shift = el.clientWidth * 0.6
    el.scrollBy({ left: shift * direction, behavior: 'smooth' })
  }

  return (
    <div className={styles.carouselWrapOuter}>
      <button className={styles.arrowLeft} onClick={() => scrollBy(-1)} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12l6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <div className={styles.carouselWrap} ref={ref}>
        <div className={styles.carousel}>
          {cities.map((c) => (
            <div key={c.name} className={styles.carouselItem}>
              <CityCard city={c} />
            </div>
          ))}
        </div>
      </div>

      <button className={styles.arrowRight} onClick={() => scrollBy(1)} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
