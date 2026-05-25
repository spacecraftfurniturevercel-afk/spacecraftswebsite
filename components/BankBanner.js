// BankBanner — Premium bank offer banner + static / mobile carousel ticker
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './BankBanner.module.css'

const TICKER_SLIDE_DURATION = 4000

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

// Full list — mobile carousel
var tickerItems = [
  'Exclusive Sale – Up to 40% Savings',
  'No-Cost EMI Across All Collections',
  'Curated Online-Only Offers',
  'Seamless Delivery Across India',
  'Limited-Time Privileged Deals',
  'Discover & Save on Premium Selections',
]

// Static single-line ticker on desktop (4 items)
var desktopTickerItems = [
  'Exclusive Sale – Up to 40% Savings',
  'No-Cost EMI Across All Collections',
  'Curated Online-Only Offers',
  'Seamless Delivery Across India',
]

function getStaticTickerItems(width) {
  if (width <= 900) return desktopTickerItems.slice(0, 3)
  return desktopTickerItems
}

function StaticTicker({ items }) {
  return (
    <div className={styles.tickerTrackStatic}>
      {items.map(function (text, i) {
        return (
          <span key={i} className={styles.tickerContent}>
            <span className={styles.tickerText}>{text}</span>
            {i < items.length - 1 && <span className={styles.tickerDot} />}
          </span>
        )
      })}
    </div>
  )
}

function TickerMobileCarousel({ items }) {
  var _slide = useState(0)
  var currentSlide = _slide[0]
  var setCurrentSlide = _slide[1]

  var _dir = useState(1)
  var direction = _dir[0]
  var setDirection = _dir[1]

  var touchStartX = useRef(0)

  useEffect(function () {
    var timer = setInterval(function () {
      setDirection(1)
      setCurrentSlide(function (prev) { return (prev + 1) % items.length })
    }, TICKER_SLIDE_DURATION)
    return function () { clearInterval(timer) }
  }, [items.length])

  var goToSlide = useCallback(function (index) {
    setCurrentSlide(function (prev) {
      if (index === prev) return prev
      setDirection(index > prev ? 1 : -1)
      return index
    })
  }, [])

  var goNext = useCallback(function () {
    setDirection(1)
    setCurrentSlide(function (prev) { return (prev + 1) % items.length })
  }, [items.length])

  var goPrev = useCallback(function () {
    setDirection(-1)
    setCurrentSlide(function (prev) { return (prev - 1 + items.length) % items.length })
  }, [items.length])

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    var diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 40) return
    if (diff > 0) goNext()
    else goPrev()
  }

  var slideVariants = {
    enter: function (dir) { return { opacity: 0, x: dir > 0 ? 24 : -24 } },
    center: { opacity: 1, x: 0 },
    exit: function (dir) { return { opacity: 0, x: dir > 0 ? -24 : 24 } },
  }

  return (
    <div
      className={styles.tickerCarousel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className={styles.tickerCarouselSlide}
        >
          <span className={styles.tickerText}>{items[currentSlide]}</span>
        </motion.div>
      </AnimatePresence>

      <div className={styles.tickerCarouselDots}>
        {items.map(function (_, index) {
          return (
            <button
              key={index}
              type="button"
              aria-label={'Go to offer ' + (index + 1)}
              className={
                styles.tickerCarouselDot +
                (currentSlide === index ? ' ' + styles.tickerCarouselDotActive : '')
              }
              onClick={function () { goToSlide(index) }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function BankBanner() {
  var sectionRef = useRef(null)
  var _v = useState(false)
  var isVisible = _v[0]
  var setIsVisible = _v[1]

  var _mobile = useState(false)
  var isMobile = _mobile[0]
  var setIsMobile = _mobile[1]

  var _staticItems = useState(desktopTickerItems)
  var staticTickerItems = _staticItems[0]
  var setStaticTickerItems = _staticItems[1]

  useEffect(function () {
    function check() {
      var w = window.innerWidth
      setIsMobile(w <= 600)
      setStaticTickerItems(getStaticTickerItems(w))
    }
    check()
    window.addEventListener('resize', check)
    return function () { window.removeEventListener('resize', check) }
  }, [])

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

  return (
    <section ref={sectionRef} className={styles.section}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={styles.card}
      >
        <div className={styles.textBlock}>
          <p className={styles.headline}>
            <span className={styles.boldBlack}>NO-COST EMI</span>
            {' '}Via{' '}
            <span className={styles.bajajInline}>
              <Image src="/bank/bajaj-finserv.svg" alt="Bajaj Finserv" width={120} height={32} unoptimized className={styles.bajajInlineImg} />
            </span>
            {' '}&{' '}
            <span className={styles.boldDark}>Easy Finance Options</span>
            {' '}From Leading Banks
          </p>
        </div>

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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={styles.ticker}
      >
        {isMobile ? (
          <TickerMobileCarousel items={tickerItems} />
        ) : (
          <StaticTicker items={staticTickerItems} />
        )}
      </motion.div>
    </section>
  )
}
