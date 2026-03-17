// Luxury Newsletter Section Component
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

function FloatingRing({ delay, x, size, duration }) {
  return (
    <motion.div
      initial={{ y: '105%', opacity: 0 }}
      animate={{
        y: '-10%',
        opacity: [0, 0.25, 0.25, 0],
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
        borderRadius: '50%',
        border: '1px solid rgba(201, 168, 76, 0.15)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default function NewsletterSection() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [btnHovered, setBtnHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

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

  var handleMouseMove = useCallback(function (e) {
    var rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setTimeout(function () {
      setStatus('success')
      setEmail('')
      setTimeout(function () {
        setStatus('idle')
      }, 4000)
    }, 1200)
  }

  var rings = [
    { delay: 0, x: 5, size: 40, duration: 18 },
    { delay: 3, x: 25, size: 24, duration: 14 },
    { delay: 7, x: 45, size: 32, duration: 20 },
    { delay: 2, x: 65, size: 20, duration: 16 },
    { delay: 5, x: 85, size: 36, duration: 15 },
    { delay: 9, x: 95, size: 18, duration: 17 },
  ]

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        padding: '48px 20px',
        overflow: 'hidden',
        background: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Mouse-following warm glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 500px 400px at ' +
            (mousePos.x * 100) +
            '% ' +
            (mousePos.y * 100) +
            '%, rgba(201, 168, 76, 0.06) 0%, transparent 70%)',
          transition: 'background 0.4s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Floating rings */}
      {rings.map(function (r, i) {
        return (
          <FloatingRing
            key={i}
            delay={r.delay}
            x={r.x}
            size={r.size}
            duration={r.duration}
          />
        )
      })}

      {/* Top gold accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.3) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 70%, transparent 100%)',
          transformOrigin: 'center',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: '20px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.1)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b8943f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              width: '24px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #b8943f)',
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '3.5px',
              color: '#b8943f',
            }}
          >
            Stay Connected
          </span>
          <span
            style={{
              width: '24px',
              height: '1px',
              background: 'linear-gradient(90deg, #b8943f, transparent)',
              display: 'block',
            }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 800,
            color: '#1a1a1a',
            margin: '0 0 12px',
            letterSpacing: '-1px',
            lineHeight: 1.15,
          }}
        >
          Join Our{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #b8943f 0%, #d4b86a 50%, #b8943f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Inner Circle
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: '15px',
            color: '#777',
            maxWidth: '440px',
            margin: '0 auto 28px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Exclusive offers, design inspiration, and early access to new collections
          — delivered to your inbox.
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0',
            maxWidth: '480px',
            margin: '0 auto 20px',
            borderRadius: '50px',
            overflow: 'hidden',
            border: focused
              ? '1.5px solid rgba(184, 148, 63, 0.5)'
              : '1.5px solid rgba(0,0,0,0.08)',
            background: '#fff',
            boxShadow: focused
              ? '0 4px 24px rgba(184, 148, 63, 0.12), 0 0 0 3px rgba(184, 148, 63, 0.06)'
              : '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={function (e) {
              setEmail(e.target.value)
            }}
            onFocus={function () {
              setFocused(true)
            }}
            onBlur={function () {
              setFocused(false)
            }}
            disabled={status === 'sending'}
            style={{
              flex: 1,
              padding: '15px 24px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontWeight: 500,
              color: '#1a1a1a',
              background: 'transparent',
              letterSpacing: '0.01em',
            }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            onMouseEnter={function () {
              setBtnHovered(true)
            }}
            onMouseLeave={function () {
              setBtnHovered(false)
            }}
            style={{
              position: 'relative',
              padding: '15px 32px',
              background:
                status === 'success'
                  ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                  : btnHovered
                  ? 'linear-gradient(135deg, #d4b86a 0%, #b8943f 100%)'
                  : 'linear-gradient(135deg, #b8943f 0%, #a07e30 100%)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              cursor: status === 'sending' ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer sweep */}
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: btnHovered ? '120%' : '-40%',
                width: '30%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s ease',
                pointerEvents: 'none',
                transform: 'skewX(-20deg)',
              }}
            />
            {status === 'sending' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                  }}
                />
                Sending
              </span>
            ) : status === 'success' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
                Subscribed!
              </span>
            ) : (
              'Subscribe'
            )}
          </button>
        </motion.form>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {['No spam, ever', 'Unsubscribe anytime', 'Weekly digest'].map(function (
            item,
            i
          ) {
            return (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#aaa',
                  letterSpacing: '0.3px',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b8943f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {item}
              </span>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
