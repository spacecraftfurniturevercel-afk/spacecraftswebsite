"use client"
import React from "react"
import styles from "./ShopByCategorySection.module.css"

export default function SectionTitle({ children, id }) {
  return (
    <h2 id={id} className={styles.title}>
      {children}
    </h2>
  )
}
