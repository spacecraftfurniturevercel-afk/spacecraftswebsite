// BankBanner — Premium bank offer banner + scrolling ticker
'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './BankBanner.module.css'

var banks = [
  { name: 'Bajaj Finserv', src: '/bank/bajaj-finserv.svg' },
  { name: 'SBI', src: '/bank/sbi.png' },
  { name: 'HDFC Bank', src: '/bank/hdfc.png' },
  { name: 'ICICI Bank', src: '/bank/icici.png' },
  { name: 'Axis Bank', src: '/bank/axis.png' },
  { name: 'Indian Bank', src: '/bank/indian.png' },
  { name: 'Bank of Baroda', src: '/bank/bankofbaroda.png' },
  { name: 'IDFC First', src: '/bank/idfc.png' },
  { name: 'Yes Bank', src: '/bank/yesbank.png' },
  { name: 'Kotak Mahindra', src: '/bank/kodak.png' },
  { name: 'IndusInd Bank', src: '/bank/indusind-bank.webp' },
]

var tickerItems = [
  'Exclusive Sale – Up to 40% Savings',
  'Curated Online-Only Offers',
  'Limited-Time Privileged Deals',
  'Discover & Save on Premium Selections',
  'No-Cost EMI Across All Collections',
  'Seamless Delivery Across India',
  'Bulk & Institutional Orders Welcome'
];

export default function BankBanner() {
  var sectionRef = useRef(null)
  var _v = useState(false)
  var isVisible = _v[0]
  var setIsVisible = _v[1]

  useEffect(function () {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return function () { observer.disconnect() }
  }, [])

  // Build duplicate content for seamless loop
  var tickerContent = tickerItems.map(function (text, i) {
    return (
      <span key={i} className={styles.tickerContent}>
        <span className={styles.tickerText}>{text}</span>
        <span className={styles.tickerDot} />
      </span>
    )
  })

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Bank Offer Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={styles.card}
      >
        {/* Left — Text */}
        <div className={styles.textBlock}>
          <p className={styles.headline}>
            <span className={styles.boldBlack}>NO-COST EMI</span>
            {' '}Via{' '}
            <span className={styles.bajajInline}>
              <Image src="/bank/bajaj-finserv.svg" alt="Bajaj Finserv" width={120} height={32} unoptimized className={styles.bajajInlineImg} />
              {/* Bajaj Finserv */}
            </span>
            {' '}&{' '}
            <span className={styles.boldDark}>Easy Finance Options</span>
            {' '}From Leading Banks
          </p>
        </div>

        {/* Right — Bank Logos Marquee */}
        <div className={styles.logosMarquee}>
          <div className={styles.logosTrack}>
            {banks.concat(banks).map(function (bank, i) {
              return (
                <div key={i} className={styles.logoBox}>
                  <Image
                    src={bank.src}
                    alt={bank.name}
                    width={64}
                    height={40}
                    unoptimized
                    className={styles.logoImg}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Scrolling Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={styles.ticker}
      >
        <div className={styles.tickerTrack}>
          {/* Render content twice for seamless infinite loop */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tickerContent}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tickerContent}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
