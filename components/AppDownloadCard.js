"use client"
import React from "react"
import styles from "./NeedHelpBuying.module.css"

export default function AppDownloadCard() {
  return (
    <div className={styles.appCard}>
      <div className={styles.appInner}>
        <div className={styles.appOffer}>Get Upto Rs. 1,500 Off</div>
        <div className={styles.appSub}>On Your First Purchase</div>

        <div className={styles.qrRow}>
          <div className={styles.qr}><img src="/help/qr.svg" alt="QR code"/></div>
          <div className={styles.ctaCol}>
            <button className={styles.downloadBtn}>DOWNLOAD NOW</button>
            <div className={styles.storeIcons}>[App Store Icons]</div>
          </div>
        </div>

        <div className={styles.tc}>*T&amp;C Apply</div>
      </div>
    </div>
  )
}
