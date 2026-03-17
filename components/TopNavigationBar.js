"use client"
import Link from 'next/link'
import { useState } from 'react'
import styles from './TopNavigationBar.module.css'

export default function TopNavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Buy In Bulk', href: '/bulk-orders' },
    { label: 'Contact Us', href: '/contact' }
  ]

  return (
    <nav id="top-nav-bar" className={styles.top_nav_bar}>
      <div className={styles.nav_container}>
        {/* Left Section: Contact Info */}
        <div className={styles.nav_left}>
          <div className={styles.contact_info}>
            <span className={styles.info_icon}>📞</span>
            <a href="tel:+91984222779" className={styles.phone_link} aria-label="Call Ambattur store">
              AMBATTUR: 98402 22779
            </a>
          </div>
          <div className={styles.gstin_info}>
            <span className={styles.info_label}>GSTIN/UIN:</span>
            <span className={styles.gstin_value}>33AASFH4116N1Z2</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobile_menu_toggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Right Section: Navigation Links */}
        <ul className={`${styles.nav_menu} ${mobileMenuOpen ? styles.mobile_open : ''}`}>
          {navLinks.map((item) => (
            <li key={item.href} className={styles.nav_item}>
              <Link 
                href={item.href} 
                className={styles.nav_link}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
