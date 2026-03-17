"use client"
import React from "react"
import styles from "./FreshFinds.module.css"

export default function FreshFindCard({ item }) {
  return (
    <div className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageWrap}>
          <img src={item.img} alt={item.title} className={styles.image} />
        </div>
        <div className={styles.meta}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.subtitle}>{item.subtitle}</div>
          <div className={styles.price}>Starting at Rs. {item.price}</div>
        </div>
      </div>
    </div>
  )
}
