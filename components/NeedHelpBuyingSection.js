"use client"
import React from "react"
import SectionTitle from "./SectionTitle"
import HelpGuideCard from "./HelpGuideCard"
import AppDownloadCard from "./AppDownloadCard"
import styles from "./NeedHelpBuying.module.css"

const GUIDES = [
  { title: 'How To Choose The Right Sofa?', img: '/help/sofa.svg' },
  { title: 'How To Choose The Right Bed?', img: '/help/bed.svg' },
  { title: 'How To Choose The Right Mattress?', img: '/help/mattress.svg' },
  { title: 'How To Choose The Right Dining Set?', img: '/help/dining.svg' },
  { title: 'How To Choose The Right Wardrobe?', img: '/help/wardrobe.svg' },
]

export default function NeedHelpBuyingSection() {
  return (
    <section className={styles.section} aria-labelledby="need-help">
      <div className={styles.container}>
        <SectionTitle id="need-help">Need Help Buying?</SectionTitle>

        <div className={styles.row}>
          <div className={styles.guides}>
            {GUIDES.map((g) => (
              <HelpGuideCard key={g.title} item={g} />
            ))}
          </div>

          <div className={styles.appPromo}>
            <AppDownloadCard />
          </div>
        </div>
      </div>
    </section>
  )
}
