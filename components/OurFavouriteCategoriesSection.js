"use client"
import React, { useState } from "react"
import SectionTitle from "./SectionTitle"
import CategoryTabs from "./CategoryTabs"
import CategoriesGrid from "./CategoriesGrid"
import styles from "./OurFavouriteCategories.module.css"

const TABS = ["Furniture", "Mattresses", "Home Goods"]

const ITEMS = [
  { name: "Hydraulic Beds", price: "23,999", img: "/categories/hydraulic-beds.svg" },
  { name: "Bean Bags", price: "999", img: "/categories/bean-bags.svg" },
  { name: "Swings", price: "1,199", img: "/categories/swings.svg" },
  { name: "Chairs", price: "3,099", img: "/categories/chairs.svg" },
  { name: "Centre Tables", price: "1,299", img: "/categories/center-tables.svg" },
  { name: "Sectional Sofas", price: "25,119", img: "/categories/sectional-sofas.svg" },
  { name: "Shoe Cabinets", price: "2,610", img: "/categories/shoe-cabinets.svg" },
  { name: "Bar Furniture", price: "1,276", img: "/categories/bar-furniture.svg" },
]

export default function OurFavouriteCategoriesSection() {
  const [active, setActive] = useState('Furniture')

  return (
    <section className={styles.section} aria-labelledby="our-favourite-cats">
      <div className={styles.container}>
        <SectionTitle id="our-favourite-cats">Our Favourite Categories</SectionTitle>

        <div className={styles.tabsWrap}>
          <CategoryTabs categories={TABS} active={active} onChange={setActive} />
        </div>

        <CategoriesGrid items={ITEMS} />
      </div>
    </section>
  )
}
