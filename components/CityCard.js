"use client"
import React from "react"
import styles from "./StoreLocator.module.css"

export default function CityCard({ city }) {
  return (
    <a href={`/stores/${encodeURIComponent(city.name)}`} className={styles.cityCard}>
      <div className={styles.cityBg} style={{ backgroundImage: `url(${city.img})` }}>
        <div className={styles.cityOverlay}>
          <div className={styles.cityContent}>
            <div className={styles.cityName}>{city.name}</div>
            <div className={styles.cityCount}>{city.count} Stores</div>
          </div>
        </div>
      </div>
    </a>
  )
}
