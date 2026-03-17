"use client"
import React from "react"
import SectionTitle from "./SectionTitle"
import CraftedBrandBanner from "./CraftedBrandBanner"
import styles from "./CraftedInIndia.module.css"

const BANNERS = [
  {
    title: 'Mudramark by Spacecrafts',
    desc: 'Celebrating Indian Heritage With Timeless Carvings, Vibrant Motifs, And Masterful Craftsmanship.',
    img: '/crafted/mudramark.svg',
  },
  {
    title: 'Amberville by Spacecrafts',
    desc: 'Explore Handcrafted Pieces Inspired By Colonial Charm, Reimagined For Modern Living.',
    img: '/crafted/amberville.svg',
  },
  {
    title: 'Heritage Collection',
    desc: 'Handcrafted selections celebrating regional craft traditions.',
    img: '/crafted/heritage.svg',
  },
]

export default function CraftedInIndiaSection() {
  return (
    <section className={styles.section} aria-labelledby="crafted-india">
      <div className={styles.container}>
        <SectionTitle id="crafted-india">Crafted in India</SectionTitle>

        <div className={styles.row}>
          {BANNERS.map((b) => (
            <CraftedBrandBanner key={b.title} banner={b} />
          ))}
        </div>
      </div>
    </section>
  )
}
