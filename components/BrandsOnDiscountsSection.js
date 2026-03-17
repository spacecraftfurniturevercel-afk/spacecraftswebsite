"use client"
import React, { useState } from "react"
import BrandsCategoryTabs from "./BrandsCategoryTabs"
import BrandsCarousel from "./BrandsCarousel"
import styles from "./BrandsOnDiscounts.module.css"

const CATEGORIES = [
  { key: 'Furniture', label: 'Furniture', icon: '/brands/icons/furniture.svg' },
  { key: 'Mattresses', label: 'Mattresses', icon: '/brands/icons/mattress.svg' },
  { key: 'Home Decor', label: 'Home Decor', icon: '/brands/icons/decor.svg' },
]

const BRANDS = [
  { name: 'ROYALOAK', offer: 'Upto 80% Off + Extra 5% Off', img: '/brands/royaloak.svg' },
  { name: 'HomeTown', offer: 'Upto 60% Off + Extra 5% Off', img: '/brands/hometown.svg' },
  { name: 'madesa', offer: 'Upto 30% Off + Extra 5% Off', img: '/brands/madesa.svg' },
  { name: 'Febonic Living', offer: 'Upto 60% Off + Extra 5% Off', img: '/brands/febonic.svg' },
  { name: 'Qutkraft', offer: 'Upto 50% Off + Extra 5% Off', img: '/brands/qutkraft.svg' },
  { name: 'woodbuzz', offer: 'Upto 50% Off + Extra 5% Off', img: '/brands/woodbuzz.svg' },
]

export default function BrandsOnDiscountsSection() {
  const [active, setActive] = useState('Furniture')

  return (
    <section className={styles.section} aria-labelledby="brands-discounts">
      <div className={styles.container}>
        <h3 id="brands-discounts" className={styles.header}>Brands on Discounts</h3>

        <BrandsCategoryTabs categories={CATEGORIES} active={active} onChange={setActive} />

        <BrandsCarousel brands={BRANDS} />
      </div>
    </section>
  )
}
