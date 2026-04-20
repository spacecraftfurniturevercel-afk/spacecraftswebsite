'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../../../lib/authenticatedFetch'

export default function AdminShippingPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [wallet, setWallet] = useState(null)
  const [couriers, setCouriers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ordersRes, walletRes, couriersRes, warehousesRes] = await Promise.all([
        authenticatedFetch('/api/admin/shipping/orders'),
        authenticatedFetch('/api/bigship/admin?action=wallet').catch(() => null),
        authenticatedFetch('/api/bigship/admin?action=couriers').catch(() => null),
        authenticatedFetch('/api/bigship/admin?action=warehouses').catch(() => null),
      ])

      if (ordersRes.status === 401) {
        router.push('/login?redirect=/admin/shipping')
        return
      }
      if (ordersRes.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Admin account required.' })
        setLoading(false)
        return
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data.orders || [])
      }
      if (walletRes?.ok) {
        const data = await walletRes.json()
        setWallet(data.data)
      }
      if (couriersRes?.ok) {
        const data = await couriersRes.json()
        setCouriers(data.data || [])
      }
      if (warehousesRes?.ok) {
        const data = await warehousesRes.json()
        setWarehouses(data.data?.result_data || [])
      }
    } catch (e) {
      console.error('Failed to load shipping data:', e)
    }
    setLoading(false)
  }

  const createShipment = async (orderId) => {
    setActionLoading(orderId)
    setMessage(null)
    try {
      const res = await authenticatedFetch('/api/shipping/create-order', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.skipped) {
          // Phase 1 already done (auto-trigger ran after payment) — go straight to Phase 2
          setMessage({ type: 'success', text: `Order #${orderId} already registered in BigShip. Proceeding to manifest...` })
          // Auto-trigger manifest (Phase 2) without confirmation prompt
          const manifestRes = await authenticatedFetch('/api/bigship/manifest', {
            method: 'POST',
            body: JSON.stringify({ order_id: orderId }),
          })
          const manifestData = await manifestRes.json()
          if (manifestData.success) {
            setMessage({ type: 'success', text: `Order #${orderId} manifested! AWB: ${manifestData.awb_code || 'Pending'} — Courier: ${manifestData.courier || ''}` })
          } else {
            setMessage({ type: 'error', text: manifestData.error || manifestData.message || 'Manifest failed' })
          }
        } else {
          setMessage({ type: 'success', text: `Shipment created for order #${orderId}` })
        }
        loadData()
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Failed to create shipment' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create shipment' })
    }
    setActionLoading(null)
  }

  const readyToShip = async (orderId) => {
    if (!confirm('Mark this order as ready to ship? This will manifest the order with BigShip and assign a tracking number.')) return
    setActionLoading(orderId + '-manifest')
    setMessage(null)
    try {
      // If Phase 1 not done yet, run it first
      const order = orders.find(o => o.id === orderId)
      if (!order?.bigship_order_id) {
        setMessage({ type: 'success', text: `Registering order #${orderId} with BigShip first...` })
        const phase1Res = await authenticatedFetch('/api/shipping/create-order', {
          method: 'POST',
          body: JSON.stringify({ order_id: orderId }),
        })
        const phase1Data = await phase1Res.json()
        if (!phase1Data.success) {
          setMessage({ type: 'error', text: phase1Data.error || phase1Data.message || 'Phase 1 failed — could not register with BigShip' })
          setActionLoading(null)
          return
        }
        await loadData() // refresh so order now has bigship_order_id
      }

      const res = await authenticatedFetch('/api/bigship/manifest', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Order manifested! AWB: ${data.awb_code || 'Pending'} — Courier: ${data.courier || ''}` })
        loadData()
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Manifest failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to manifest order' })
    }
    setActionLoading(null)
  }

  const cancelShipment = async (orderId) => {
    if (!confirm('Cancel this shipment?')) return
    setActionLoading(orderId)
    setMessage(null)
    try {
      const res = await authenticatedFetch('/api/bigship/cancel', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Shipment cancelled for order #${orderId}` })
        loadData()
      } else {
        setMessage({ type: 'error', text: data.message || 'Cancel failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to cancel shipment' })
    }
    setActionLoading(null)
  }

  const downloadLabel = async (orderId) => {
    try {
      const res = await authenticatedFetch(`/api/bigship/shipment-data?type=label&order_id=${orderId}`)
      const data = await res.json()
      if (data.success && data.data?.res_FileContent) {
        const blob = base64ToBlob(data.data.res_FileContent, data.data.res_MediaType || 'application/pdf')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.data.res_FileName || 'label'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        setMessage({ type: 'error', text: data.message || 'Label not available' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to download label' })
    }
  }

  const downloadManifest = async (orderId) => {
    try {
      const res = await authenticatedFetch(`/api/bigship/shipment-data?type=manifest&order_id=${orderId}`)
      const data = await res.json()
      if (data.success && data.data?.res_FileContent) {
        const blob = base64ToBlob(data.data.res_FileContent, data.data.res_MediaType || 'application/pdf')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.data.res_FileName || 'manifest'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        setMessage({ type: 'error', text: data.message || 'Manifest not available' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to download manifest' })
    }
  }

  function base64ToBlob(base64, contentType = 'application/pdf') {
    const byteChars = atob(base64)
    const byteArrays = []
    for (let offset = 0; offset < byteChars.length; offset += 512) {
      const slice = byteChars.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i)
      byteArrays.push(new Uint8Array(byteNumbers))
    }
    return new Blob(byteArrays, { type: contentType })
  }

  const getStatusBadge = (status) => {
    const labels = {
      confirmed:   'Ready to Ship',
      processing:  'Processing',
      shipped:     'Shipped',
      delivered:   'Delivered',
      cancelled:   'Cancelled',
      returned:    'Returned',
      pending:     'Pending',
    }
    const colors = {
      confirmed:   '#16a34a',
      processing:  '#f59e0b',
      shipped:     '#3b82f6',
      delivered:   '#22c55e',
      cancelled:   '#ef4444',
      returned:    '#8b5cf6',
      pending:     '#6b7280',
    }
    const color = colors[status] || '#6b7280'
    const label = labels[status] || status
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: `${color}18`,
        color,
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
    )
  }

  const tabs = [
    { key: 'orders', label: 'Orders & Shipments' },
    { key: 'couriers', label: 'Couriers' },
    { key: 'warehouses', label: 'Warehouses' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Shipping Management</h1>
        {wallet && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#15803d',
          }}>
            BigShip Wallet: ₹{parseFloat(wallet).toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#15803d' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontSize: 14,
        }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1a1a1a' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? '#1a1a1a' : '#6b7280',
              fontSize: 14,
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Loading...</div>
      ) : (
        <>
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Payment</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Courier</th>
                    <th style={thStyle}>AWB</th>
                    <th style={thStyle}>Shipping Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#999' }}>No orders found</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={tdStyle}>#{String(order.id)}</td>
                      <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={tdStyle}>₹{order.total?.toLocaleString('en-IN')}</td>
                      <td style={tdStyle}>
                        {(order.payment_method || '').toLowerCase() === 'cod'
                          ? <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700, background:'#fff7ed', color:'#ea580c' }}>COD</span>
                          : <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700, background:'#eff6ff', color:'#2563eb' }}>Online</span>
                        }
                      </td>
                      <td style={tdStyle}>{getStatusBadge(order.status)}</td>
                      <td style={tdStyle}>{order.courier_name || '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{order.tracking_number || '—'}</td>
                      <td style={tdStyle}>{order.shipping_status || '—'}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {order.shipment_error && (
                            <span title={order.shipment_error} style={{
                              display: 'inline-block',
                              maxWidth: 160,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: 11,
                              color: '#dc2626',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: 4,
                              padding: '1px 6px',
                              cursor: 'help',
                            }}>⚠ {order.shipment_error}</span>
                          )}
                          {/* Show Create Shipment when no bigship_order_id yet */}
                          {(!order.bigship_order_id && !order.shiprocket_order_id && (order.payment_status === 'completed' || order.status === 'confirmed') && order.status !== 'cancelled') && (
                            <ActionBtn
                              label="Create Shipment"
                              color="#3b82f6"
                              loading={actionLoading === order.id}
                              onClick={() => createShipment(order.id)}
                            />
                          )}
                          {/* Ready to Ship: show when bigship_order_id set, OR when paid/COD confirmed but no AWB yet */}
                          {((order.bigship_order_id || order.payment_status === 'completed' || order.status === 'confirmed') && !order.tracking_number && order.status !== 'cancelled' && order.status !== 'pending') && (
                            <ActionBtn
                              label="✅ Ready to Ship"
                              color="#16a34a"
                              loading={actionLoading === order.id + '-manifest'}
                              onClick={() => readyToShip(order.id)}
                            />
                          )}
                          {order.tracking_number && order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <>
                              <ActionBtn label="Label" color="#6b7280" onClick={() => downloadLabel(order.id)} />
                              <ActionBtn label="Manifest" color="#6b7280" onClick={() => downloadManifest(order.id)} />
                              <ActionBtn label="Cancel" color="#ef4444" onClick={() => cancelShipment(order.id)} loading={actionLoading === order.id} />
                            </>
                          )}
                          {/* Invoice — always available for paid orders */}
                          {(order.payment_status === 'completed' || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered') && (
                            <ActionBtn
                              label="&#x1F4C4; Invoice"
                              color="#7c3aed"
                              onClick={() => window.open(`/api/admin/orders/${order.id}/invoice`, '_blank')}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Couriers Tab */}
          {activeTab === 'couriers' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={thStyle}>Courier ID</th>
                    <th style={thStyle}>Courier Name</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {couriers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#999' }}>No couriers loaded</td></tr>
                  ) : couriers.map((c) => (
                    <tr key={c.courier_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={tdStyle}>{c.courier_id}</td>
                      <td style={tdStyle}>{c.courier_name}</td>
                      <td style={tdStyle}>{c.shipment_category?.toUpperCase()}</td>
                      <td style={tdStyle}>{c.courier_type}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: c.courier_status && c.admin_status ? '#22c55e' : '#ef4444',
                          marginRight: 6,
                        }} />
                        {c.courier_status && c.admin_status ? 'Active' : 'Inactive'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Warehouses Tab */}
          {activeTab === 'warehouses' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={thStyle}>Warehouse ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Address</th>
                    <th style={thStyle}>Pincode</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#999' }}>No warehouses loaded</td></tr>
                  ) : warehouses.map((w) => (
                    <tr key={w.warehouse_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={tdStyle}>{w.warehouse_id}</td>
                      <td style={tdStyle}>{w.warehouse_name}</td>
                      <td style={tdStyle}>{w.address_line1}</td>
                      <td style={tdStyle}>{w.address_pincode}</td>
                      <td style={tdStyle}>{w.address_city}, {w.address_state}</td>
                      <td style={tdStyle}>{w.warehouse_contact_number_primary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ActionBtn({ label, color, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        border: `1px solid ${color}`,
        background: 'transparent',
        color,
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '...' : label}
    </button>
  )
}

const thStyle = { padding: '10px 12px', fontWeight: 600, fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }
const tdStyle = { padding: '10px 12px', whiteSpace: 'nowrap' }
