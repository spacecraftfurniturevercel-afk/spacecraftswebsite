'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS = {
  placed:      { bg: '#e3f2fd', text: '#1565c0' },
  confirmed:   { bg: '#e8f5e9', text: '#2e7d32' },
  processing:  { bg: '#fff3e0', text: '#e65100' },
  shipped:     { bg: '#e8eaf6', text: '#283593' },
  delivered:   { bg: '#e8f5e9', text: '#1b5e20' },
  cancelled:   { bg: '#fce4ec', text: '#b71c1c' },
}

const PAY_COLORS = {
  paid:    { bg: '#e8f5e9', text: '#2e7d32' },
  pending: { bg: '#fff8e1', text: '#f57f17' },
  failed:  { bg: '#fce4ec', text: '#b71c1c' },
}

function Badge({ label, colors }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      background: colors?.bg || '#f5f5f5',
      color: colors?.text || '#333',
      textTransform: 'uppercase',
    }}>{label}</span>
  )
}

function OrderDetail({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setMsg({ type: 'success', text: 'Status updated successfully.' })
      onStatusChange(order.id, status)
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
    setSaving(false)
  }

  const items = order.order_items || []
  const addr  = order.addresses
  const cust  = order.customer

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'
  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : '—'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 640, height: '100vh', overflowY: 'auto',
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        padding: '28px 28px 40px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Order #{order.id}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{fmtDate(order.created_at)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <Badge label={order.status || 'placed'} colors={STATUS_COLORS[order.status] || STATUS_COLORS.placed} />
          <Badge label={`Payment: ${order.payment_status || 'pending'}`} colors={PAY_COLORS[order.payment_status] || PAY_COLORS.pending} />
          {order.shipping_status && <Badge label={`Shipping: ${order.shipping_status}`} colors={{ bg: '#e8eaf6', text: '#283593' }} />}
        </div>

        {/* Customer */}
        <Section title="Customer">
          {cust ? (
            <Grid rows={[
              ['Name', cust.full_name || '—'],
              ['Email', cust.email || '—'],
              ['Phone', cust.phone || '—'],
            ]} />
          ) : <p style={{ color: '#888', margin: 0, fontSize: 13 }}>Guest / Profile not found</p>}
        </Section>

        {/* Delivery Address */}
        <Section title="Delivery Address">
          {addr ? (
            <Grid rows={[
              ['Name', addr.name || '—'],
              ['Address', [addr.line1, addr.line2].filter(Boolean).join(', ') || '—'],
              ['City', addr.city || '—'],
              ['State / PIN', `${addr.state || '—'} – ${addr.postal_code || '—'}`],
              ['Phone', addr.phone || '—'],
            ]} />
          ) : <p style={{ color: '#888', margin: 0, fontSize: 13 }}>Address not found</p>}
        </Section>

        {/* Items */}
        <Section title={`Items (${items.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['Product', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Product' ? 'left' : 'right', padding: '6px 4px', color: '#888', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 4px', color: '#1a1a1a' }}>{item.name || `Product #${item.product_id}`}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>{fmt((item.unit_price || 0) * (item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Price Breakdown */}
        <Section title="Price Breakdown">
          <Grid rows={[
            ['Subtotal', fmt(order.subtotal)],
            ['GST (18%)', fmt(order.tax)],
            ['Shipping', order.delivery_charge > 0 ? fmt(order.delivery_charge) : 'Free'],
            ['Total', fmt(order.total)],
          ]} highlight={[3]} />
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <Grid rows={[
            ['Method', order.payment_method || '—'],
            ['Status', order.payment_status || '—'],
            ['Razorpay Order ID', order.razorpay_order_id || '—'],
            ['Transaction ID', order.razorpay_payment_id || '—'],
          ]} />
        </Section>

        {/* Shipping */}
        {(order.courier_name || order.tracking_number || order.bigship_order_id) && (
          <Section title="Shipping">
            <Grid rows={[
              ['Courier', order.courier_name || '—'],
              ['AWB / Tracking', order.tracking_number || '—'],
              ['BigShip Order ID', order.bigship_order_id || '—'],
              ['Est. Delivery', fmtDate(order.estimated_delivery)],
            ]} />
          </Section>
        )}

        {/* Update Status */}
        <Section title="Update Order Status">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, flex: 1, minWidth: 140 }}
            >
              {['placed','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={save} disabled={saving || status === order.status} style={{
              padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
              opacity: status === order.status ? 0.5 : 1,
            }}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
          {msg && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: msg.type === 'error' ? '#c62828' : '#2e7d32' }}>{msg.text}</p>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
      <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 16px' }}>
        {children}
      </div>
    </div>
  )
}

function Grid({ rows, highlight = [] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <td style={{ padding: '7px 0', color: '#888', width: 140, verticalAlign: 'top' }}>{label}</td>
            <td style={{ padding: '7px 0', color: '#1a1a1a', fontWeight: highlight.includes(i) ? 700 : 400 }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [payFilter, setPayFilter]       = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [selected, setSelected] = useState(null)
  const LIMIT = 30

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT })
      if (statusFilter) params.set('status', statusFilter)
      if (payFilter) params.set('payment_status', payFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.status === 401) { router.push('/login?redirect=/admin/orders'); return }
      if (res.status === 403) { setError('Admin access required.'); setLoading(false); return }
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPage(p)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [statusFilter, payFilter, search, router])

  useEffect(() => { load(1) }, [statusFilter, payFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    load(1)
  }

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const fmt     = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—'
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Nav */}
      <header style={{ background: '#1a1a1a', padding: '16px 28px', display: 'flex', gap: 24, alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Admin</h1>
        {[
          { href: '/admin/orders', label: 'Orders' },
          { href: '/admin/enquiries', label: 'Enquiries' },
          { href: '/admin/shipping', label: 'Shipping' },
          { href: '/admin/products', label: 'Products' },
        ].map(l => (
          <a key={l.href} href={l.href} style={{
            color: l.href === '/admin/orders' ? '#fff' : 'rgba(255,255,255,0.6)',
            textDecoration: 'none', fontSize: 13, fontWeight: l.href === '/admin/orders' ? 700 : 400,
            borderBottom: l.href === '/admin/orders' ? '2px solid #fff' : '2px solid transparent',
            paddingBottom: 2,
          }}>{l.label}</a>
        ))}
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Title + filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Orders</h2>
            {!loading && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{total} total orders</p>}
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order #, name, email…"
              style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: 240 }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
              <option value="">All Statuses</option>
              {['placed','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
              <option value="">All Payments</option>
              {['paid','pending','failed'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Search</button>
          </form>
        </div>

        {error && (
          <div style={{ background: '#fce4ec', color: '#b71c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>Loading orders…</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>No orders found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  {['#', 'Date', 'Customer', 'Items', 'Amount', 'Payment', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}
                    onClick={() => setSelected(order)}
                    style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: '12px 14px', color: '#666', whiteSpace: 'nowrap' }}>{fmtDate(order.created_at)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{order.customer?.full_name || 'Guest'}</div>
                      <div style={{ color: '#888', fontSize: 11 }}>{order.customer?.email || ''}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>
                      {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fmt(order.total)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge label={order.payment_status || 'pending'} colors={PAY_COLORS[order.payment_status] || PAY_COLORS.pending} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge label={order.status || 'placed'} colors={STATUS_COLORS[order.status] || STATUS_COLORS.placed} />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <span style={{ color: '#1a1a1a', fontSize: 18 }}>›</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <span style={{ padding: '8px 16px', fontSize: 13, color: '#666' }}>Page {page} of {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Detail Drawer */}
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
