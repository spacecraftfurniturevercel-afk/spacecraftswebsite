'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { authenticatedFetch } from '../../../lib/authenticatedFetch'
import { supabase } from '../../../lib/supabaseClient'

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: 'check' },
  { key: 'packed', label: 'Packed', icon: 'box' },
  { key: 'shipped', label: 'Shipped', icon: 'truck' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
]

function getStep(status) {
  const s = (status || '').toLowerCase()
  if (s === 'delivered') return 3
  if (['shipped', 'in_transit', 'in transit'].includes(s)) return 2
  if (['packed', 'processing', 'picked_up'].includes(s)) return 1
  return 0
}

function SIcon({ type, done }) {
  const c = done ? '#fff' : '#bbb'
  if (type === 'check') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
  if (type === 'box') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  if (type === 'truck') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 01-1 1h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  if (type === 'home') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  return null
}

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 4000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        try {
          window.dataLayer = window.dataLayer || []
          localStorage.removeItem('cart')
          localStorage.removeItem('wishlist')
          window.dataLayer.push({ event: 'purchase', ecommerce: { transaction_id: searchParams.get('order_id') || 'TBD', value: 0 } })
          if (window.gtag) window.gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/label', value: 0 })
        } catch (e) { console.warn('GTM tracking error:', e) }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const orderId = searchParams.get('order_id')
        if (!orderId) { setError('Order ID not found'); setLoading(false); return }

        const response = await authenticatedFetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.order)
          setAddress(data.address)
          // Delay shipping order creation to ensure payment verification has updated the DB
          setTimeout(() => {
            authenticatedFetch('/api/shipping/create-order', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }).catch(() => {})
          }, 3000)
        } else {
          setError('Failed to fetch order details')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [searchParams, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2.5px solid #e5e5e5', borderTopColor: '#1a1a1a', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin .7s linear infinite' }} />
        <p style={{ color: '#999', fontSize: 13 }}>Loading your order...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 380, padding: 20 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ marginBottom: 16 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>Something went wrong</h2>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 24px' }}>{error}</p>
        <Link href="/orders" style={{ display: 'inline-block', padding: '12px 32px', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>View Orders</Link>
      </div>
    </div>
  )

  const step = getStep(order?.status)
  const orderDate = order ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const estDelivery = order ? new Date(new Date(order.created_at).getTime() + 5 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const total = Number(order?.total) || 0

  return (
    <div className="osp">
      {confetti && (
        <div aria-hidden="true">
          {[...Array(40)].map((_, i) => (
            <motion.div key={i}
              initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 600), y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 60 : 800, rotate: Math.random() * 720 - 360, opacity: 0 }}
              transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.4, ease: 'easeIn' }}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 10000, width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, background: ['#1a1a1a', '#f39c12', '#0b6b58', '#e74c3c', '#3b82f6'][Math.floor(Math.random() * 5)], borderRadius: Math.random() > 0.5 ? '50%' : '1px' }}
            />
          ))}
        </div>
      )}

      <div className="osp-wrap">
        {/* Hero */}
        <motion.div className="osp-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="osp-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.polyline points="20 6 9 17 4 12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.4 }} />
            </svg>
          </motion.div>
          <h1>Order Confirmed!</h1>
          <p className="osp-sub">Your payment was successful and order is being processed</p>
          <div className="osp-oid">Order #{order?.id}</div>
        </motion.div>

        {/* Summary Card */}
        <motion.div className="osp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="osp-card-head">
            <h2>Order Summary</h2>
            <span className="osp-paid-badge"><span className="osp-paid-dot" />Payment Successful</span>
          </div>
          <div className="osp-meta-grid">
            <div className="osp-meta-item"><span className="osp-meta-label">Order Date</span><span className="osp-meta-val">{orderDate}</span></div>
            <div className="osp-meta-item"><span className="osp-meta-label">Est. Delivery</span><span className="osp-meta-val">{estDelivery}</span></div>
            <div className="osp-meta-item"><span className="osp-meta-label">Payment</span><span className="osp-meta-val">Razorpay</span></div>
            <div className="osp-meta-item"><span className="osp-meta-label">Total Amount</span><span className="osp-meta-val osp-meta-big">₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          {order?.items?.length > 0 && (
            <div className="osp-items-sec">
              <div className="osp-items-head">{order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</div>
              {order.items.map((item, i) => (
                <div key={i} className="osp-item">
                  <div className="osp-item-ic">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <div className="osp-item-info">
                    <span className="osp-item-name">{item.name || item.product_name}</span>
                    <span className="osp-item-qty">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                  </div>
                  <span className="osp-item-price">₹{Number(item.unit_price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="osp-items-total"><span>Total Paid</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          )}
        </motion.div>

        {/* Delivery Address */}
        {address && (
          <motion.div className="osp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="osp-card-head">
              <h2>Delivery Address</h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="osp-addr">
              <p className="osp-addr-name">{address.full_name}</p>
              <p>{address.line1 || address.address_line1}</p>
              {(address.line2 || address.address_line2) && <p>{address.line2 || address.address_line2}</p>}
              <p>{address.city}, {address.state} – {address.postal_code || address.pincode}</p>
              {address.phone && <p className="osp-addr-phone">{address.phone}</p>}
            </div>
          </motion.div>
        )}

        {/* Tracking Stepper */}
        <motion.div className="osp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="osp-card-head"><h2>Order Status</h2></div>
          <div className="osp-stepper">
            {STEPS.map((s, i) => {
              const done = i <= step
              const active = i === step
              return (
                <div key={s.key} className={`osp-st ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  {i > 0 && <div className="osp-st-line"><div className={`osp-st-line-fill ${done ? 'filled' : ''}`} /></div>}
                  <div className="osp-st-dot"><SIcon type={s.icon} done={done} /></div>
                  <span className="osp-st-label">{s.label}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* What Happens Next */}
        <motion.div className="osp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="osp-card-head"><h2>What Happens Next</h2></div>
          <div className="osp-next">
            {[
              { n: '1', t: 'Confirmation Email', d: 'Order confirmation sent to your registered email' },
              { n: '2', t: 'Packed & Shipped', d: 'Items will be packed and shipped within 24–48 hours' },
              { n: '3', t: 'Safe Delivery', d: 'Delivered to your doorstep with real-time tracking' },
            ].map((x, i) => (
              <div key={i} className="osp-next-row">
                <div className="osp-next-n">{x.n}</div>
                <div><strong>{x.t}</strong><span>{x.d}</span></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div className="osp-btns" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Link href={`/orders/${order?.id}`} className="osp-btn osp-btn-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View Order Details
          </Link>
          <Link href="/products" className="osp-btn osp-btn-light">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Continue Shopping
          </Link>
        </motion.div>
      </div>

      <style>{`
        .osp { min-height: 100vh; background: #f5f5f7; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .osp-wrap { max-width: 620px; margin: 0 auto; padding: 40px 20px 80px; }

        .osp-hero { text-align: center; margin-bottom: 32px; }
        .osp-check {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #1a1a1a, #333);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(26,26,26,0.2);
        }
        .osp h1 { font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px; letter-spacing: -0.5px; }
        .osp-sub { font-size: 15px; color: #888; margin: 0 0 14px; line-height: 1.5; }
        .osp-oid { display: inline-block; padding: 6px 16px; background: #1a1a1a; color: #fff; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }

        .osp-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .osp-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; }
        .osp-card-head h2 { font-size: 13px; font-weight: 700; color: #1a1a1a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }

        .osp-paid-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 700; }
        .osp-paid-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; animation: osPulse 2s ease infinite; }
        @keyframes osPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .osp-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .osp-meta-item { display: flex; flex-direction: column; gap: 3px; }
        .osp-meta-label { font-size: 11px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
        .osp-meta-val { font-size: 14px; font-weight: 600; color: #1a1a1a; }
        .osp-meta-big { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }

        .osp-items-sec { border-top: 1px solid #f0f0f0; padding-top: 16px; }
        .osp-items-head { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .osp-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fafafa; border-radius: 10px; margin-bottom: 8px; }
        .osp-item-ic { width: 42px; height: 42px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .osp-item-info { flex: 1; min-width: 0; }
        .osp-item-name { display: block; font-size: 14px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .osp-item-qty { display: block; font-size: 12px; color: #999; margin-top: 2px; }
        .osp-item-price { font-size: 14px; font-weight: 700; color: #1a1a1a; white-space: nowrap; }
        .osp-items-total { display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 8px; border-top: 2px solid #f0f0f0; font-size: 15px; font-weight: 800; color: #1a1a1a; }

        .osp-addr { font-size: 14px; color: #555; line-height: 1.7; }
        .osp-addr p { margin: 0; }
        .osp-addr-name { font-weight: 700; color: #1a1a1a; font-size: 15px; }
        .osp-addr-phone { color: #888; margin-top: 6px; }

        .osp-stepper { display: flex; align-items: flex-start; justify-content: space-between; padding: 4px 0; }
        .osp-st { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; text-align: center; }
        .osp-st-line { position: absolute; top: 16px; right: 50%; width: 100%; height: 3px; background: #e5e5e5; z-index: 0; }
        .osp-st:first-child .osp-st-line { display: none; }
        .osp-st-line-fill { height: 100%; width: 0; background: #1a1a1a; border-radius: 2px; transition: width 0.6s ease; }
        .osp-st-line-fill.filled { width: 100%; }
        .osp-st-dot { width: 34px; height: 34px; border-radius: 50%; background: #e5e5e5; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; transition: all 0.3s ease; }
        .osp-st.done .osp-st-dot { background: #1a1a1a; }
        .osp-st.active .osp-st-dot { background: #1a1a1a; box-shadow: 0 0 0 4px rgba(26,26,26,0.12); }
        .osp-st-label { font-size: 11px; font-weight: 600; color: #bbb; margin-top: 8px; line-height: 1.3; }
        .osp-st.done .osp-st-label { color: #1a1a1a; }
        .osp-st.active .osp-st-label { color: #1a1a1a; font-weight: 700; }

        .osp-next { display: flex; flex-direction: column; }
        .osp-next-row { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .osp-next-row:last-child { border-bottom: none; padding-bottom: 0; }
        .osp-next-n { width: 26px; height: 26px; border-radius: 50%; background: #1a1a1a; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .osp-next-row div:last-child { display: flex; flex-direction: column; gap: 2px; }
        .osp-next-row strong { font-size: 13px; color: #1a1a1a; }
        .osp-next-row span { font-size: 12px; color: #888; line-height: 1.4; }

        .osp-btns { display: flex; gap: 12px; margin-top: 8px; }
        .osp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: 1; padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
        .osp-btn-dark { background: #1a1a1a; color: #fff; box-shadow: 0 2px 8px rgba(26,26,26,0.15); }
        .osp-btn-dark:hover { background: #333; transform: translateY(-1px); }
        .osp-btn-light { background: #fff; color: #1a1a1a; border: 1.5px solid #ddd; }
        .osp-btn-light:hover { background: #f5f5f5; border-color: #bbb; }

        @media (max-width: 480px) {
          .osp-wrap { padding: 28px 16px 60px; }
          .osp h1 { font-size: 24px; }
          .osp-btns { flex-direction: column; }
          .osp-st-label { font-size: 10px; }
          .osp-card { padding: 18px; }
        }
      `}</style>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: '#999' }}>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
