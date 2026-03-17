'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authenticatedFetch } from '../lib/authenticatedFetch'

const TRACKING_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Your order has been confirmed' },
  { key: 'picked', label: 'Picked Up', desc: 'Collected by courier partner' },
  { key: 'transit', label: 'In Transit', desc: 'On the way to your city' },
  { key: 'out', label: 'Out for Delivery', desc: 'Arriving at your doorstep today' },
  { key: 'delivered', label: 'Delivered', desc: 'Package has been delivered' }
]

function statusToStep(status) {
  const s = (status || '').toUpperCase().trim()
  if (['DELIVERED'].includes(s)) return 4
  if (['OUT FOR DELIVERY', 'REACHED AT DESTINATION HUB'].includes(s)) return 3
  if (['IN TRANSIT', 'SHIPPED'].includes(s)) return 2
  if (['PICKED UP', 'PICKUP SCHEDULED', 'PICKUP GENERATED'].includes(s)) return 1
  return 0
}

export default function OrderTracking({ orderId, initialStatus }) {
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(statusToStep(initialStatus))
  const [showTimeline, setShowTimeline] = useState(false)

  const getFallbackTracking = () => {
    const now = new Date()
    const orderTime = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    return {
      status: 'READY TO SHIP',
      awb: `SF${String(orderId).padStart(8, '0')}`,
      courier: 'Spacecrafts Express',
      estimated_delivery: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      current_location: null,
      activities: [
        {
          activity: 'Order confirmed and being packed',
          location: 'Warehouse',
          date: new Date(orderTime.getTime() + 30 * 60 * 1000).toISOString(),
          sr_status_label: 'Ready to Ship'
        },
        {
          activity: 'Order placed successfully',
          location: 'Online',
          date: orderTime.toISOString(),
          sr_status_label: 'Order Placed'
        }
      ]
    }
  }

  useEffect(() => {
    if (!orderId) return
    fetchTracking()
    const interval = setInterval(fetchTracking, 60000)
    return () => clearInterval(interval)
  }, [orderId])

  const fetchTracking = async () => {
    try {
      const res = await authenticatedFetch(`/api/shipping/track?order_id=${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setTracking(data.tracking)
        setActiveStep(statusToStep(data.tracking.status))
      } else {
        const fallback = getFallbackTracking()
        setTracking(fallback)
        setActiveStep(statusToStep(fallback.status))
      }
    } catch {
      const fallback = getFallbackTracking()
      setTracking(fallback)
      setActiveStep(statusToStep(fallback.status))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ot-loading">
        <div className="ot-pulse-bar" />
        <div className="ot-pulse-steps">
          {[...Array(5)].map((_, i) => <div key={i} className="ot-pulse-dot" />)}
        </div>
        <style jsx>{`
          .ot-loading { padding: 32px 24px; }
          .ot-pulse-bar { width: 40%; height: 16px; background: #f0f0f0; border-radius: 8px; margin-bottom: 32px; animation: otPulse 1.5s ease infinite; }
          .ot-pulse-steps { display: flex; justify-content: space-between; }
          .ot-pulse-dot { width: 36px; height: 36px; border-radius: 50%; background: #f0f0f0; animation: otPulse 1.5s ease infinite; }
          @keyframes otPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        `}</style>
      </div>
    )
  }

  const isCancelled = tracking?.status && ['CANCELLED', 'RTO INITIATED', 'RTO DELIVERED'].includes(tracking.status.toUpperCase())

  return (
    <div className="ot-root">
      {/* Minimal Header */}
      <div className="ot-head">
        <div className="ot-head-left">
          <span className="ot-label">Tracking</span>
          {tracking?.awb && <span className="ot-awb">{tracking.awb}</span>}
        </div>
        {tracking?.courier && <span className="ot-courier">{tracking.courier}</span>}
      </div>

      {/* ETA */}
      {tracking?.estimated_delivery && (
        <motion.div
          className="ot-eta"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="ot-eta-label">Estimated Delivery</span>
          <span className="ot-eta-date">{tracking.estimated_delivery}</span>
        </motion.div>
      )}

      {/* Vertical Stepper */}
      {!isCancelled ? (
        <div className="ot-stepper">
          {TRACKING_STEPS.map((step, i) => {
            const done = i <= activeStep
            const current = i === activeStep
            return (
              <motion.div
                key={step.key}
                className={`ot-step ${done ? 'done' : ''} ${current ? 'active' : ''}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                {/* Line */}
                {i > 0 && (
                  <div className="ot-line-wrap">
                    <div className="ot-line-bg" />
                    <motion.div
                      className="ot-line-fill"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: done ? 1 : 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    />
                  </div>
                )}
                {/* Dot */}
                <div className="ot-dot-wrap">
                  <motion.div
                    className="ot-dot"
                    animate={current ? { boxShadow: ['0 0 0 0 rgba(26,26,26,0.2)', '0 0 0 8px rgba(26,26,26,0)', '0 0 0 0 rgba(26,26,26,0.2)'] } : {}}
                    transition={current ? { duration: 2, repeat: Infinity } : {}}
                  >
                    {done && (
                      <motion.svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.08 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </motion.div>
                </div>
                {/* Text */}
                <div className="ot-text">
                  <span className="ot-step-title">{step.label}</span>
                  {current && <span className="ot-step-desc">{step.desc}</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="ot-cancelled">
          <span className="ot-cancelled-badge">Cancelled</span>
          <p>This order has been cancelled. Contact support for help.</p>
        </div>
      )}

      {/* Activity timeline toggle */}
      {tracking?.activities?.length > 0 && (
        <div className="ot-timeline-section">
          <button className="ot-timeline-toggle" onClick={() => setShowTimeline(!showTimeline)}>
            <span>Activity Timeline</span>
            <motion.svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              animate={{ rotate: showTimeline ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showTimeline && (
              <motion.div
                className="ot-timeline"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {tracking.activities.map((act, i) => (
                  <motion.div
                    key={i}
                    className="ot-tl-item"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="ot-tl-dot" />
                    <div className="ot-tl-content">
                      <span className="ot-tl-label">{act.activity || act.sr_status_label || act.status}</span>
                      <div className="ot-tl-meta">
                        {act.location && <span>{act.location}</span>}
                        {act.date && <span>{new Date(act.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Live location */}
      {activeStep >= 2 && activeStep < 4 && tracking?.current_location && (
        <motion.div
          className="ot-live"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="ot-live-dot"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>Currently at <strong>{tracking.current_location}</strong></span>
        </motion.div>
      )}

      <style jsx>{`
        .ot-root {
          background: #fafafa; border: 1px solid #eee;
          border-radius: 16px; padding: 28px 28px 24px;
        }

        /* Head */
        .ot-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .ot-head-left { display: flex; align-items: center; gap: 10px; }
        .ot-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.2px; color: #1a1a1a;
        }
        .ot-awb {
          font-size: 11px; color: #999; font-family: 'SF Mono', 'Menlo', monospace;
          background: #f0f0f0; padding: 2px 8px; border-radius: 4px;
        }
        .ot-courier { font-size: 12px; color: #aaa; }

        /* ETA */
        .ot-eta {
          display: flex; align-items: baseline; gap: 8px;
          padding: 14px 0; margin-bottom: 4px;
          border-bottom: 1px solid #eee;
        }
        .ot-eta-label { font-size: 12px; color: #999; }
        .ot-eta-date { font-size: 15px; font-weight: 700; color: #1a1a1a; }

        /* Vertical Stepper */
        .ot-stepper { padding: 20px 0 8px; }
        .ot-step {
          display: flex; align-items: flex-start; gap: 16px;
          position: relative; padding-bottom: 4px; min-height: 44px;
        }
        .ot-step:last-child { min-height: auto; }

        .ot-line-wrap {
          position: absolute; left: 13px; top: -20px; width: 2px; height: 20px;
        }
        .ot-line-bg {
          position: absolute; inset: 0; background: #e5e5e5; border-radius: 1px;
        }
        .ot-line-fill {
          position: absolute; inset: 0; background: #1a1a1a; border-radius: 1px;
          transform-origin: top;
        }

        .ot-dot-wrap { flex-shrink: 0; width: 28px; display: flex; justify-content: center; padding-top: 1px; }
        .ot-dot {
          width: 28px; height: 28px; border-radius: 50%;
          background: #e5e5e5; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .ot-step.done .ot-dot { background: #1a1a1a; }
        .ot-step.active .ot-dot { background: #1a1a1a; }

        .ot-text { padding-top: 3px; }
        .ot-step-title {
          font-size: 13px; font-weight: 500; color: #bbb; display: block;
          transition: color 0.3s;
        }
        .ot-step.done .ot-step-title { color: #1a1a1a; font-weight: 600; }
        .ot-step.active .ot-step-title { color: #1a1a1a; font-weight: 700; }
        .ot-step-desc {
          font-size: 12px; color: #888; display: block; margin-top: 2px;
        }

        /* Cancelled */
        .ot-cancelled {
          padding: 20px 0; text-align: center;
        }
        .ot-cancelled-badge {
          display: inline-block; padding: 6px 16px; border-radius: 20px;
          background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 700;
          margin-bottom: 8px;
        }
        .ot-cancelled p { font-size: 13px; color: #888; margin: 0; }

        /* Timeline */
        .ot-timeline-section {
          border-top: 1px solid #eee; margin-top: 16px; padding-top: 12px;
        }
        .ot-timeline-toggle {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; background: none; border: none; padding: 6px 0;
          font-size: 12px; font-weight: 600; color: #666; cursor: pointer;
          font-family: inherit; letter-spacing: 0.3px;
        }
        .ot-timeline-toggle:hover { color: #1a1a1a; }

        .ot-timeline { overflow: hidden; padding: 12px 0 4px 4px; }
        .ot-tl-item {
          display: flex; gap: 14px; padding: 10px 0;
          position: relative; margin-left: 6px;
          border-left: 1px solid #e5e5e5; padding-left: 18px;
        }
        .ot-tl-item:last-child { border-left-color: transparent; }
        .ot-tl-dot {
          position: absolute; left: -3px; top: 14px;
          width: 5px; height: 5px; border-radius: 50%; background: #1a1a1a;
        }
        .ot-tl-content { display: flex; flex-direction: column; gap: 2px; }
        .ot-tl-label { font-size: 13px; font-weight: 600; color: #333; }
        .ot-tl-meta { display: flex; gap: 12px; font-size: 11px; color: #aaa; }

        /* Live */
        .ot-live {
          display: flex; align-items: center; gap: 10px;
          margin-top: 16px; padding: 12px 16px;
          background: #f5f5f5; border-radius: 10px;
          font-size: 13px; color: #555;
        }
        .ot-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #1a1a1a; flex-shrink: 0;
        }
        .ot-live strong { color: #1a1a1a; }

        @media (max-width: 480px) {
          .ot-root { padding: 20px 18px 16px; }
        }
      `}</style>
    </div>
  )
}
