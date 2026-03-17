"use client"
import React from "react"
import SectionTitle from "./SectionTitle"
import FreshFindCard from "./FreshFindCard"
import styles from "./FreshFinds.module.css"

const ITEMS = [
  { title: "Space Saving – Make Room For More", subtitle: "", price: "4,778", img: "/fresh/space-saving.svg" },
  { title: "Ergonomic – Designed For Better Health", subtitle: "", price: "4,778", img: "/fresh/ergonomic.svg" },
  { title: "Drink Tables – For That Perfect Sip", subtitle: "", price: "4,778", img: "/fresh/drink-tables.svg" },
  { title: "Timeless Brass Collection", subtitle: "", price: "4,778", img: "/fresh/timeless-brass.svg" },
]

export default function FreshFindsSection() {
  return (
    <section className={styles.section} aria-labelledby="fresh-finds">
      <div className={styles.container}>
        <SectionTitle id="fresh-finds">Fresh Finds at Spacecrafts</SectionTitle>

        <div className={styles.row}>
          {ITEMS.map((it) => (
            <FreshFindCard key={it.title} item={it} />
          ))}
        </div>
      </div>
    </section>
  )
}
