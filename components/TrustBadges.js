'use client'

import { useRef, useEffect, useState } from 'react'

const badges = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polyline points="16 8 20 8 23 11 23 16 20 16" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
        <line x1="8" y1="18.5" x2="16" y2="18.5" />
      </svg>
    ),
    title: 'Free Delivery',
    description: 'Free shipping on orders above ₹10,000',
    accent: '#e67e22',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: 'Quality Guaranteed',
    description: 'Premium materials & craftsmanship',
    accent: '#27ae60',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        <polyline points="12 7 12 12 16 14" />
      </svg>
    ),
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    accent: '#3498db',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
    title: 'Secure Payment',
    description: '100% secure transactions',
    accent: '#9b59b6',
  },
]

function BadgeCard({ badge, index, isVisible }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '28px 28px',
        borderRadius: '16px',
        background: hovered
          ? `linear-gradient(135deg, ${badge.accent}08 0%, ${badge.accent}04 100%)`
          : '#fff',
        border: `1px solid ${hovered ? badge.accent + '30' : '#e5e5e5'}`,
        cursor: 'default',
        transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isVisible
          ? hovered
            ? 'translateY(-4px)'
            : 'translateY(0)'
          : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: isVisible ? `${index * 0.1}s` : '0s',
        boxShadow: hovered
          ? `0 8px 30px ${badge.accent}18, 0 1px 3px rgba(0,0,0,0.04)`
          : '0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top-line accent on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: hovered ? '60%' : '0%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${badge.accent}, transparent)`,
          borderRadius: '0 0 2px 2px',
          transition: 'width 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Icon container */}
      <div
        style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${badge.accent}14 0%, ${badge.accent}08 100%)`,
          color: badge.accent,
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          boxShadow: hovered ? `0 4px 16px ${badge.accent}20` : 'none',
        }}
      >
        {badge.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 4px',
            letterSpacing: '-0.2px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            lineHeight: 1.3,
            display: 'block',
          }}
        >
          {badge.title}
        </span>
        <p
          style={{
            fontSize: '13px',
            color: '#888',
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {badge.description}
        </p>
      </div>
    </div>
  )
}

export default function TrustBadges() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '48px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {badges.map((badge, i) => (
          <BadgeCard
            key={badge.title}
            badge={badge}
            index={i}
            isVisible={isVisible}
          />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
