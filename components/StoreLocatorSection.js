"use client"
import React from "react"
import SectionTitle from "./SectionTitle"
import StorePromoCard from "./StorePromoCard"
import CityCarousel from "./CityCarousel"
import styles from "./StoreLocator.module.css"

const CITIES = [
  { name: 'Bengaluru', count: 8, img: '/stores/bengaluru.jpg' },
  { name: 'Agra', count: 1, img: '/stores/agra.jpg' },
  { name: 'Shimla', count: 1, img: '/stores/shimla.jpg' },
]

export default function StoreLocatorSection() {
  return (
    <section className={styles.section} aria-labelledby="store-locator">
      <div className={styles.container}>
        <SectionTitle id="store-locator">Visit Our Store</SectionTitle>

        <div className={styles.layout}>
          <div className={styles.leftCol}>
            <StorePromoCard />
          </div>

          <div className={styles.rightCol}>
            <CityCarousel cities={CITIES} />
          </div>
        </div>
      </div>
    </section>
  )
}
