"use client"
import React from "react"
import styles from "./CraftedInIndia.module.css"

export default function CraftedBrandBanner({ banner }) {
  return (
    <a href={`/crafted/${encodeURIComponent(banner.title)}`} className={styles.bannerLink}>
      <div className={styles.banner} style={{ backgroundImage: `url(${banner.img})` }}>
        <div className={styles.overlay}>
          <div className={styles.textWrap}>
            <div className={styles.proud}>Proudly Made in India</div>
            <div className={styles.title}>{banner.title}</div>
            <div className={styles.desc}>{banner.desc}</div>
            <div className={styles.badge}>pf Assured</div>
          </div>
        </div>
      </div>
    </a>
  )
}
