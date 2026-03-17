"use client"
import React from "react"
import styles from "./NeedHelpBuying.module.css"

export default function HelpGuideCard({ item }) {
  return (
    <a href={item.href || '#'} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.media}>
          <img src={item.img} alt={item.title} className={styles.mediaImg} />
        </div>
        <div className={styles.meta}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.linkRow}>
            <span className={styles.readLink}>Read</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={styles.chev}><path d="M9 6l6 6-6 6" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </a>
  )
}
