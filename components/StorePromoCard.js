"use client"
import React from "react"
import styles from "./StoreLocator.module.css"

export default function StorePromoCard() {
  return (
    <div className={styles.promoCard}>
      <div className={styles.promoInner}>
        <div className={styles.promoHeadline}>Visit Our Store &amp; Get</div>
        <div className={styles.promoOffer}>Extra Rs. 20,000 Off</div>

        <ul className={styles.benefits}>
          <li>
            <span className={styles.benefitIcon} aria-hidden></span>
            <span>150+ Stores Across 100+ Cities</span>
          </li>
          <li>
            <span className={styles.benefitIcon} aria-hidden></span>
            <span>Furniture Exchange Program</span>
          </li>
          <li>
            <span className={styles.benefitIcon} aria-hidden></span>
            <span>Free Design Consultation</span>
          </li>
        </ul>

        <div className={styles.promoFooter}>*T&amp;C Apply</div>
      </div>
    </div>
  )
}
