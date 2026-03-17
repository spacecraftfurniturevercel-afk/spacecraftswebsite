"use client"
import React, { useState } from "react"
import SectionTitle from "./SectionTitle"
import CategoryTabs from "./CategoryTabs"
import CategoryGrid from "./CategoryGrid"
import styles from "./ShopByCategorySection.module.css"

const CATEGORIES = [
  "Living Room",
  "Bed Room",
  "Dining Room",
  "Study Room",
  "Solid Wood",
  "Engineered Wood",
  "Luxury Furniture",
]

const GRID_ITEMS = [
  { key: "Sofas", img: "/categories/sofas.svg" },
  { key: "Center Tables", img: "/categories/center-tables.svg" },
  { key: "Sofa Chairs", img: "/categories/sofa-chairs.svg" },
  { key: "Cabinets and Sideboards", img: "/categories/cabinets-sideboards.svg" },
  { key: "Wall Art and Paintings", img: "/categories/wall-art.svg" },
  { key: "Hanging Lights", img: "/categories/hanging-lights.svg" },
  { key: "Mandirs", img: "/categories/mandirs.svg" },
  { key: "Chairs", img: "/categories/chairs.svg" },
  { key: "Recliners", img: "/categories/recliners.svg" },
  { key: "TV & Media Units", img: "/categories/tv-units.svg" },
  { key: "Carpets", img: "/categories/carpets.svg" },
  { key: "Curtains", img: "/categories/curtains.svg" },
]

export default function ShopByCategorySection() {
  const [active, setActive] = useState("Living Room")

  return (
    <section className={styles.section} aria-labelledby="shop-all-home">
      <div className={styles.container}>
        <SectionTitle id="shop-all-home">Shop All Things Home</SectionTitle>

        <CategoryTabs categories={CATEGORIES} active={active} onChange={setActive} />

        <CategoryGrid items={GRID_ITEMS} activeTab={active} />
      </div>
    </section>
  )
}
