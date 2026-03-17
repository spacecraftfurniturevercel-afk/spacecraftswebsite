// Luxury Special Offer Banner Component
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Floating diamond particle
function FloatingParticle({ delay, x, size, duration }) {
  return (
    <motion.div
      initial={{ y: '110%', opacity: 0, rotate: 45 }}
      animate={{
        y: '-10%',
        opacity: [0, 0.6, 0.6, 0],
        rotate: [45, 90, 135, 180],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        left: x + '%',
        width: size + 'px',
        height: size + 'px',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}

export default function SpecialOfferBanner() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [ctaHovered, setCtaHovered] = useState(false)
  const [secondaryHovered, setSecondaryHovered] = useState(false)

  // Intersection Observer
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
    return function () {
      observer.disconnect()
    }
  }, [])

  // Mouse parallax
  var handleMouseMove = useCallback(function (e) {
    var rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  // Particle config
  var particles = [
    { delay: 0, x: 8, size: 10, duration: 14 },
    { delay: 2, x: 22, size: 6, duration: 11 },
    { delay: 5, x: 38, size: 8, duration: 16 },
    { delay: 1, x: 52, size: 12, duration: 13 },
    { delay: 3, x: 68, size: 7, duration: 15 },
    { delay: 6, x: 82, size: 9, duration: 12 },
    { delay: 4, x: 92, size: 5, duration: 14 },
  ]

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        padding: '48px 20px',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #0f0f0f 0%, #1a1510 25%, #12100d 50%, #0d0d0d 75%, #111111 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Animated radial glow that follows mouse */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 600px 500px at ' +
            (mousePos.x * 100) +
            '% ' +
            (mousePos.y * 100) +
            '%, rgba(201, 168, 76, 0.08) 0%, transparent 70%)',
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle animated grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '128px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Floating diamond particles */}
      {particles.map(function (p, i) {
        return <FloatingParticle key={i} delay={p.delay} x={p.x} size={p.size} duration={p.duration} />
      })}

      {/* Top decorative gold line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 30%, rgba(201,168,76,0.8) 50%, rgba(201,168,76,0.5) 70%, transparent 100%)',
          transformOrigin: 'center',
          zIndex: 2,
        }}
      />

      {/* Bottom decorative gold line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 30%, rgba(201,168,76,0.8) 50%, rgba(201,168,76,0.5) 70%, transparent 100%)',
          transformOrigin: 'center',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        {/* Eyebrow label with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              width: '32px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #c9a84c)',
              display: 'block',
            }}
          />
          <span
            className="shimmer-text"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '4px',
              color: '#c9a84c',
            }}
          >
            Limited Time Offer
          </span>
          <span
            style={{
              width: '32px',
              height: '1px',
              background: 'linear-gradient(90deg, #c9a84c, transparent)',
              display: 'block',
            }}
          />
        </motion.div>

        {/* Discount badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: '20px' }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '8px 28px',
              borderRadius: '50px',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              background: 'rgba(201, 168, 76, 0.08)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#c9a84c',
              letterSpacing: '1px',
            }}
          >
            UP TO 40% OFF
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 16px',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
          }}
        >
          Elevate Your Living{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8d5a3 40%, #c9a84c 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Space
          </span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '560px',
            margin: '0 auto 20px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Handcrafted premium furniture at unmatched prices — curated collections designed
          for those who appreciate the finer things.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {['Free Delivery', 'Easy EMI Options', '10-Year Warranty', 'Free Assembly'].map(function (
            feature,
            i
          ) {
            return (
              <span
                key={i}
                style={{
                  padding: '8px 18px',
                  borderRadius: '50px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.65)',
                  letterSpacing: '0.3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {feature}
              </span>
            )
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Primary CTA */}
          <Link
            href="/products"
            onMouseEnter={function () {
              setCtaHovered(true)
            }}
            onMouseLeave={function () {
              setCtaHovered(false)
            }}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 42px',
              background: ctaHovered
                ? 'linear-gradient(135deg, #e8d5a3 0%, #c9a84c 100%)'
                : 'linear-gradient(135deg, #c9a84c 0%, #b8943f 100%)',
              color: '#0f0f0f',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: ctaHovered
                ? '0 8px 32px rgba(201, 168, 76, 0.4), 0 0 0 1px rgba(201, 168, 76, 0.3)'
                : '0 4px 20px rgba(201, 168, 76, 0.25)',
              transform: ctaHovered ? 'translateY(-2px)' : 'translateY(0)',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer sweep on hover */}
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: ctaHovered ? '120%' : '-40%',
                width: '30%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transition: 'left 0.6s ease',
                pointerEvents: 'none',
                transform: 'skewX(-20deg)',
              }}
            />
            Shop Sale Items
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.3s ease',
                transform: ctaHovered ? 'translateX(3px)' : 'translateX(0)',
              }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/products"
            onMouseEnter={function () {
              setSecondaryHovered(true)
            }}
            onMouseLeave={function () {
              setSecondaryHovered(false)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 36px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: secondaryHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: secondaryHovered ? 'translateY(-2px)' : 'translateY(0)',
              borderColor: secondaryHovered ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.2)',
            }}
          >
            View Collections
          </Link>
        </motion.div>
      </div>

      {/* Shimmer animation for eyebrow text */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #c9a84c 0%,
            #e8d5a3 25%,
            #c9a84c 50%,
            #e8d5a3 75%,
            #c9a84c 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @media (max-width: 640px) {
          section {
            padding: 40px 16px !important;
          }
        }
      `}</style>
    </section>
  )
}
