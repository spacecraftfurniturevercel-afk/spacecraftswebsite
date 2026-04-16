'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authenticatedFetch } from '../../../lib/authenticatedFetch'
import { supabase } from '../../../lib/supabaseClient'

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '✓', desc: 'Payment received and order confirmed' },
  { key: 'packed', label: 'Packed', icon: '📦', desc: 'Items packed and ready to ship' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'On the way to your address' },
  { key: 'delivered', label: 'Delivered', icon: '🏠', desc: 'Successfully delivered' },
]

function getStep(status) {
  const s = (status || '').toLowerCase().replace(/[_-]/g, ' ')
  if (s === 'delivered') return 3
  if (['shipped', 'in transit', 'out for delivery', 'picked up'].includes(s)) return 2
  if (['packed', 'processing', 'manifested', 'pickup scheduled', 'order placed', 'pending', 'not picked'].includes(s)) return 1
  return 0
}

function getStatusLabel(status) {
  const s = (status || '').toLowerCase().replace(/[_-]/g, ' ')
  if (s === 'delivered') return 'Delivered'
  if (s === 'out for delivery') return 'Out for Delivery'
  if (s.includes('in transit')) return 'In Transit'
  if (s === 'shipped' || s === 'picked up') return 'Shipped'
  if (s === 'manifested' || s === 'processing' || s === 'packed' || s === 'pickup scheduled' || s === 'order placed' || s === 'pending' || s === 'not picked') return 'Packed & Ready to Ship'
  if (s === 'cancelled') return 'Cancelled'
  return 'Confirmed'
}

function getStatusColor(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('deliver')) return '#16a34a'
  if (s.includes('transit') || s.includes('out for') || s === 'shipped' || s === 'picked up') return '#2563eb'
  if (s.includes('cancel') || s.includes('fail') || s.includes('rto')) return '#dc2626'
  if (s.includes('manifest') || s.includes('processing') || s.includes('packed')) return '#f59e0b'
  return '#f59e0b'
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [address, setAddress] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const res = await authenticatedFetch(`/api/orders/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
          setAddress(data.address)
        } else {
          setError('Order not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, router])

  // Fetch live tracking when order loads
  useEffect(() => {
    if (!order) return
    const fetchTracking = async () => {
      setTrackingLoading(true)
      try {
        const res = await authenticatedFetch(`/api/shipping/track?order_id=${order.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.tracking) {
            setTracking(data.tracking)
            // Update order status from live tracking
            if (data.tracking.status) {
              setOrder(prev => ({
                ...prev,
                shipping_status: data.tracking.status,
                tracking_number: data.tracking.awb || prev.tracking_number,
                courier_name: data.tracking.courier || prev.courier_name,
              }))
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch tracking:', e.message)
      } finally {
        setTrackingLoading(false)
      }
    }
    fetchTracking()
  }, [order?.id])

  const handleDownloadInvoice = async () => {
    const w = window.open('', '_blank')
    try {
      const res = await authenticatedFetch(`/api/orders/${id}/invoice`)
      if (res.ok) {
        const html = await res.text()
        w.document.write(html)
        w.document.close()
      } else { w.close() }
    } catch { w.close() }
  }

  if (loading) return (
    <div className="odp">
      <div className="odp-loading">
        <div className="odp-spinner" />
        <p>Loading order details...</p>
      </div>
      <style>{styles}</style>
    </div>
  )

  if (error || !order) return (
    <div className="odp">
      <motion.div className="odp-err" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        <h2>{error || 'Order not found'}</h2>
        <p>This order doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/orders" className="odp-back-btn">Back to Orders</Link>
      </motion.div>
      <style>{styles}</style>
    </div>
  )

  const curStep = getStep(order.shipping_status || order.status)
  const displayPayStatus = order.payment_status || (order.status === 'confirmed' || order.razorpay_payment_id ? 'completed' : 'pending')
  const isPaid = displayPayStatus === 'completed'
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const estDelivery = tracking?.pending ? null : (tracking?.estimated_delivery || new Date(new Date(order.created_at).getTime() + 5 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))
  const itemsSubtotal = (order.items || []).reduce((s, it) => s + it.unit_price * it.quantity, 0)
  const subtotal = Number(order.subtotal) || itemsSubtotal
  const gstAmount = Number(order.tax) || 0
  const shippingCharge = Number(order.delivery_charge) || Number(order.shipping_cost) || 0
  const total = Number(order.total) || subtotal
  const statusLabel = getStatusLabel(order.shipping_status || order.status)
  const statusColor = getStatusColor(order.shipping_status || order.status)
  const activities = tracking?.activities || []

  return (
    <div className="odp">
      <div className="odp-wrap">
        {/* Breadcrumb */}
        <motion.nav className="odp-bc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link href="/">Home</Link><span>/</span>
          <Link href="/orders">My Orders</Link><span>/</span>
          <span className="odp-bc-cur">Order #{order.id}</span>
        </motion.nav>

        {/* Header */}
        <motion.div className="odp-header" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="odp-header-left">
            <div className="odp-header-row1">
              <h1>Order #{order.id}</h1>
              <span className={`odp-badge ${isPaid ? 'odp-badge-paid' : 'odp-badge-pending'}`}>
                <span className="odp-badge-dot" />
                {isPaid ? 'Paid' : 'Pending'}
              </span>
            </div>
            <p className="odp-header-meta">
              Placed on {orderDate} at {orderTime} · {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button className="odp-invoice-btn" onClick={handleDownloadInvoice}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Invoice
          </button>
        </motion.div>

        {/* Live Status Banner */}
        <motion.div className="odp-status-banner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          style={{ borderLeftColor: statusColor }}>
          <div className="odp-status-left">
            <span className="odp-status-label" style={{ color: statusColor }}>{statusLabel}</span>
            {tracking?.current_location && (
              <span className="odp-status-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {tracking.current_location}
              </span>
            )}
          </div>
          <div className="odp-status-right">
            {(order.tracking_number || tracking?.awb) && (
              <div className="odp-awb">
                <span className="odp-awb-label">AWB</span>
                <span className="odp-awb-code">{order.tracking_number || tracking?.awb}</span>
              </div>
            )}
            {(order.courier_name || tracking?.courier) && (
              <span className="odp-courier">{order.courier_name || tracking?.courier}</span>
            )}
          </div>
        </motion.div>

        {/* Tracking Stepper */}
        <motion.div className="odp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="odp-card-head">
            <h2>Order Tracking</h2>
            {estDelivery && <span className="odp-eta">Est. Delivery: <strong>{estDelivery}</strong></span>}
          </div>
          {/* Horizontal stepper */}
          <div className="odp-hstepper">
            {STEPS.map((s, i) => {
              const done = i <= curStep
              const active = i === curStep
              return (
                <div key={s.key} className={`odp-hs ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  <div className="odp-hs-bar">{i > 0 && <div className={`odp-hs-bar-fill ${done ? 'filled' : ''}`} />}</div>
                  <div className="odp-hs-dot">
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span className="odp-hs-num">{i + 1}</span>
                    )}
                  </div>
                  <span className="odp-hs-label">{s.label}</span>
                  {active && <span className="odp-hs-desc">{s.desc}</span>}
                </div>
              )
            })}
          </div>

          {/* Pending shipment notice */}
          {tracking?.pending && (
            <div style={{ margin: '16px 0 4px', padding: '12px 16px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
              Your order is confirmed and being prepared for dispatch. Tracking details will appear once the shipment is picked up by the courier.
            </div>
          )}

          {/* Live Activity Timeline */}
          {activities.length > 0 && (
            <div className="odp-timeline">
              <div className="odp-timeline-head">
                <h3>Shipment Activity</h3>
                {trackingLoading && <span className="odp-tl-loading">Updating...</span>}
              </div>
              {activities.map((act, i) => (
                <div key={i} className={`odp-tl-item ${i === 0 ? 'latest' : ''}`}>
                  <div className="odp-tl-dot-wrap">
                    <div className={`odp-tl-dot ${i === 0 ? 'pulse' : ''}`} />
                    {i < activities.length - 1 && <div className="odp-tl-line" />}
                  </div>
                  <div className="odp-tl-content">
                    <div className="odp-tl-row1">
                      <span className="odp-tl-status">{act.sr_status_label || act.activity}</span>
                      <span className="odp-tl-date">{act.date}</span>
                    </div>
                    <p className="odp-tl-desc">{act.activity}</p>
                    {act.location && <p className="odp-tl-loc">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {act.location}
                    </p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Main content grid */}
        <div className="odp-grid">
          {/* Items card */}
          <motion.div className="odp-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="odp-card-head">
              <h2>Items Ordered</h2>
              <span className="odp-count-badge">{(order.items || []).length}</span>
            </div>
            <div className="odp-items-list">
              {(order.items || []).map((item, i) => (
                <div key={item.id || i} className="odp-item">
                  <div className="odp-item-thumb">
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                      : null
                    }
                    <svg style={{ display: item.image ? 'none' : 'block' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <div className="odp-item-info">
                    <span className="odp-item-name">{item.name || item.product_name || 'Product'}</span>
                    <span className="odp-item-meta">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                  </div>
                  <span className="odp-item-total">₹{Number(item.unit_price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="odp-price-summary">
              <div className="odp-price-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {gstAmount > 0 && <div className="odp-price-row"><span>GST (18%)</span><span>₹{gstAmount.toLocaleString('en-IN')}</span></div>}
              {shippingCharge > 0
                ? <div className="odp-price-row"><span>Shipping</span><span>₹{shippingCharge.toLocaleString('en-IN')}</span></div>
                : <div className="odp-price-row odp-price-free"><span>Shipping</span><span>Free</span></div>
              }
              {Number(order.discount) > 0 && <div className="odp-price-row odp-price-discount"><span>Discount</span><span>-₹{Number(order.discount).toLocaleString('en-IN')}</span></div>}
              <div className="odp-price-total"><span>Total Amount</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="odp-right">
            {/* Shipping Details Card */}
            {(order.courier_name || order.tracking_number || tracking) && (
              <motion.div className="odp-card odp-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <div className="odp-card-head">
                  <h2>Shipping Details</h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <div className="odp-detail-rows">
                  {(order.courier_name || tracking?.courier) && (
                    <div className="odp-detail-row">
                      <span>Courier</span>
                      <span className="odp-detail-val">{order.courier_name || tracking?.courier}</span>
                    </div>
                  )}
                  {(order.tracking_number || tracking?.awb) && (
                    <div className="odp-detail-row">
                      <span>Tracking Number</span>
                      <span className="odp-detail-mono">{order.tracking_number || tracking?.awb}</span>
                    </div>
                  )}
                  <div className="odp-detail-row">
                    <span>Shipping Status</span>
                    <span className="odp-ship-status" style={{ background: statusColor + '18', color: statusColor }}>{statusLabel}</span>
                  </div>
                  {tracking?.estimated_delivery && (
                    <div className="odp-detail-row">
                      <span>Est. Delivery</span>
                      <span className="odp-detail-val">{tracking.estimated_delivery}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Payment Card */}
            <motion.div className="odp-card odp-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="odp-card-head"><h2>Payment Details</h2></div>
              <div className="odp-detail-rows">
                <div className="odp-detail-row">
                  <span>Payment Status</span>
                  <span className={`odp-mini-badge ${isPaid ? 'odp-mini-paid' : 'odp-mini-pending'}`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="odp-detail-row">
                  <span>Method</span>
                  <span className="odp-detail-val">{(order.payment_method || 'Razorpay').replace(/_/g, ' ')}</span>
                </div>
                <div className="odp-detail-row">
                  <span>Amount</span>
                  <span className="odp-detail-val odp-detail-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {order.razorpay_payment_id && (
                  <div className="odp-detail-row">
                    <span>Transaction ID</span>
                    <span className="odp-detail-mono">{order.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Delivery Address Card */}
            {address && (
              <motion.div className="odp-card odp-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="odp-card-head">
                  <h2>Delivery Address</h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="odp-addr">
                  <p className="odp-addr-name">{address.full_name}</p>
                  <p>{address.line1 || address.address_line1}</p>
                  {(address.line2 || address.address_line2) && <p>{address.line2 || address.address_line2}</p>}
                  <p>{address.city}, {address.state} – {address.postal_code || address.pincode}</p>
                  {address.phone && <p className="odp-addr-phone">{address.phone}</p>}
                </div>
              </motion.div>
            )}

            {/* Need Help Card */}
            <motion.div className="odp-card odp-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="odp-card-head"><h2>Need Help?</h2></div>
              <div className="odp-help-links">
                <Link href="/contact" className="odp-help-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Contact Support
                </Link>
                <Link href="/orders" className="odp-help-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View All Orders
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .odp { min-height: 100vh; background: #f5f5f7; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  .odp-wrap { max-width: 1000px; margin: 0 auto; padding: 28px 24px 64px; }
  .odp-loading { text-align: center; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .odp-spinner { width: 32px; height: 32px; border: 2.5px solid #e5e5e5; border-top-color: #1a1a1a; border-radius: 50%; margin: 0 auto 14px; animation: odpSpin .7s linear infinite; }
  @keyframes odpSpin { to { transform: rotate(360deg); } }
  .odp-loading p { color: #999; font-size: 13px; }

  .odp-err { text-align: center; max-width: 380px; margin: auto; }
  .odp-err h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 16px 0 8px; }
  .odp-err p { color: #888; font-size: 13px; margin: 0 0 24px; }
  .odp-back-btn { display: inline-block; padding: 10px 24px; background: #1a1a1a; color: #fff; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }

  .odp-bc { display: flex; align-items: center; gap: 6px; margin-bottom: 24px; font-size: 12px; color: #bbb; }
  .odp-bc a { color: #999; text-decoration: none; transition: color 0.15s; }
  .odp-bc a:hover { color: #1a1a1a; }
  .odp-bc-cur { color: #1a1a1a; font-weight: 600; }

  .odp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
  .odp-header-row1 { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .odp-header h1 { font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }
  .odp-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .odp-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
  .odp-badge-paid { background: #f0fdf4; color: #16a34a; }
  .odp-badge-paid .odp-badge-dot { background: #16a34a; }
  .odp-badge-pending { background: #fffbeb; color: #f59e0b; }
  .odp-badge-pending .odp-badge-dot { background: #f59e0b; }
  .odp-header-meta { font-size: 13px; color: #999; margin: 0; }
  .odp-invoice-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: inherit; white-space: nowrap; }
  .odp-invoice-btn:hover { background: #333; }

  /* Status Banner */
  .odp-status-banner { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e8e8e8; border-left: 4px solid; border-radius: 12px; padding: 18px 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-wrap: wrap; gap: 12px; }
  .odp-status-left { display: flex; flex-direction: column; gap: 4px; }
  .odp-status-label { font-size: 18px; font-weight: 800; }
  .odp-status-loc { font-size: 12px; color: #888; display: flex; align-items: center; gap: 4px; }
  .odp-status-right { display: flex; align-items: center; gap: 16px; }
  .odp-awb { display: flex; flex-direction: column; align-items: flex-end; }
  .odp-awb-label { font-size: 10px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .odp-awb-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; font-weight: 700; color: #1a1a1a; background: #f5f5f5; padding: 4px 10px; border-radius: 6px; }
  .odp-courier { font-size: 12px; color: #666; font-weight: 600; background: #f5f5f5; padding: 4px 10px; border-radius: 6px; }

  .odp-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 14px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .odp-compact { padding: 20px; }
  .odp-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; }
  .odp-card-head h2 { font-size: 12px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.8px; margin: 0; }
  .odp-eta { font-size: 12px; color: #888; }
  .odp-eta strong { color: #1a1a1a; }
  .odp-count-badge { background: #1a1a1a; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }

  /* Horizontal Stepper */
  .odp-hstepper { display: flex; align-items: flex-start; padding: 8px 0 16px; }
  .odp-hs { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; }
  .odp-hs-bar { position: absolute; top: 14px; right: 50%; width: 100%; height: 3px; background: #e5e5e5; z-index: 0; }
  .odp-hs:first-child .odp-hs-bar { display: none; }
  .odp-hs-bar-fill { height: 100%; width: 0; background: #1a1a1a; border-radius: 2px; transition: width 0.5s ease; }
  .odp-hs-bar-fill.filled { width: 100%; }
  .odp-hs-dot { width: 30px; height: 30px; border-radius: 50%; background: #e5e5e5; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; transition: all 0.3s; }
  .odp-hs.done .odp-hs-dot { background: #1a1a1a; }
  .odp-hs.active .odp-hs-dot { background: #1a1a1a; box-shadow: 0 0 0 5px rgba(26,26,26,0.12); }
  .odp-hs-num { font-size: 11px; font-weight: 700; color: #bbb; }
  .odp-hs-label { font-size: 11px; font-weight: 500; color: #bbb; margin-top: 8px; }
  .odp-hs.done .odp-hs-label { color: #1a1a1a; font-weight: 600; }
  .odp-hs.active .odp-hs-label { color: #1a1a1a; font-weight: 700; }
  .odp-hs-desc { font-size: 10px; color: #888; margin-top: 2px; }

  /* Activity Timeline */
  .odp-timeline { border-top: 1px solid #f0f0f0; margin-top: 8px; padding-top: 18px; }
  .odp-timeline-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .odp-timeline-head h3 { font-size: 13px; font-weight: 700; color: #1a1a1a; margin: 0; }
  .odp-tl-loading { font-size: 11px; color: #999; }
  .odp-tl-item { display: flex; gap: 14px; min-height: 56px; }
  .odp-tl-item.latest .odp-tl-status { font-weight: 700; color: #1a1a1a; }
  .odp-tl-dot-wrap { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; padding-top: 3px; }
  .odp-tl-dot { width: 10px; height: 10px; border-radius: 50%; background: #d4d4d4; flex-shrink: 0; }
  .odp-tl-dot.pulse { background: #1a1a1a; animation: odpPulse 2s infinite; }
  @keyframes odpPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(26,26,26,0.3); } 50% { box-shadow: 0 0 0 6px rgba(26,26,26,0); } }
  .odp-tl-line { width: 2px; flex: 1; background: #e5e5e5; min-height: 20px; }
  .odp-tl-content { flex: 1; padding-bottom: 16px; }
  .odp-tl-row1 { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .odp-tl-status { font-size: 13px; font-weight: 600; color: #555; }
  .odp-tl-date { font-size: 11px; color: #999; white-space: nowrap; }
  .odp-tl-desc { font-size: 12px; color: #888; margin: 2px 0 0; }
  .odp-tl-loc { font-size: 11px; color: #999; margin: 2px 0 0; display: flex; align-items: center; gap: 3px; }

  .odp-ship-status { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

  .odp-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }

  .odp-items-list { display: flex; flex-direction: column; }
  .odp-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
  .odp-item:last-child { border-bottom: none; }
  .odp-item-thumb { width: 44px; height: 44px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .odp-item-info { flex: 1; min-width: 0; }
  .odp-item-name { display: block; font-size: 14px; font-weight: 600; color: #1a1a1a; }
  .odp-item-meta { display: block; font-size: 12px; color: #999; margin-top: 2px; }
  .odp-item-total { font-size: 14px; font-weight: 700; color: #1a1a1a; white-space: nowrap; }

  .odp-price-summary { border-top: 1px solid #f0f0f0; padding-top: 14px; margin-top: 4px; }
  .odp-price-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #666; }
  .odp-price-free span:last-child { color: #16a34a; font-weight: 600; }
  .odp-price-discount span:last-child { color: #16a34a; font-weight: 600; }
  .odp-price-total { display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 8px; border-top: 2px solid #e5e5e5; font-size: 16px; font-weight: 800; color: #1a1a1a; }

  .odp-detail-rows { display: flex; flex-direction: column; }
  .odp-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; color: #999; }
  .odp-detail-row:last-child { border-bottom: none; padding-bottom: 0; }
  .odp-detail-val { font-weight: 600; color: #1a1a1a; text-transform: capitalize; }
  .odp-detail-bold { font-size: 16px; font-weight: 800; }
  .odp-detail-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; background: #f5f5f5; padding: 3px 8px; border-radius: 4px; color: #555; font-weight: 600; }
  .odp-mini-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .odp-mini-paid { background: #f0fdf4; color: #16a34a; }
  .odp-mini-pending { background: #fffbeb; color: #f59e0b; }

  .odp-addr { font-size: 13px; color: #555; line-height: 1.7; }
  .odp-addr p { margin: 0; }
  .odp-addr-name { font-weight: 700; color: #1a1a1a; font-size: 14px; }
  .odp-addr-phone { color: #888; margin-top: 4px; }

  .odp-help-links { display: flex; flex-direction: column; }
  .odp-help-link { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; font-weight: 600; color: #555; text-decoration: none; transition: color 0.15s; }
  .odp-help-link:last-child { border-bottom: none; }
  .odp-help-link:hover { color: #1a1a1a; }

  .odp-right { display: flex; flex-direction: column; }

  @media (max-width: 768px) {
    .odp-wrap { padding: 20px 16px 48px; }
    .odp-grid { grid-template-columns: 1fr; }
    .odp-header { flex-direction: column; }
    .odp-header h1 { font-size: 22px; }
    .odp-invoice-btn { width: 100%; justify-content: center; }
    .odp-card { padding: 18px; }
    .odp-status-banner { flex-direction: column; align-items: flex-start; }
    .odp-status-right { align-self: flex-start; }
    .odp-hstepper { overflow-x: auto; }
    .odp-hs-label { font-size: 10px; }
    .odp-tl-row1 { flex-direction: column; align-items: flex-start; gap: 2px; }
  }
`
