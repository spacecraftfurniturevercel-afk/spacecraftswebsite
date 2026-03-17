'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authenticatedFetch } from '../../lib/authenticatedFetch'
import { supabase } from '../../lib/supabaseClient'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const res = await authenticatedFetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [router])

  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#16a34a',
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#059669',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-state">
          <motion.div
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p>Loading your orders...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link href="/products" className="shop-btn">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              className="order-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className="order-top">
                <div className="order-id">Order #{order.id}</div>
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(order.status) + '18', color: getStatusColor(order.status) }}
                >
                  {order.status || 'pending'}
                </span>
              </div>

              <div className="order-items-preview">
                {(order.items || []).slice(0, 3).map((item, i) => (
                  <span key={i} className="item-name">
                    {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                ))}
                {(order.items || []).length > 3 && (
                  <span className="more-items">+{order.items.length - 3} more</span>
                )}
              </div>

              <div className="order-bottom">
                <span className="order-total">₹{Number(order.total).toLocaleString('en-IN')}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = `
  .orders-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 80vh;
  }
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
    color: #888;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #eee;
    border-top-color: #222;
    border-radius: 50%;
    margin-bottom: 16px;
  }
  .orders-header {
    margin-bottom: 32px;
  }
  .orders-header h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #111;
  }
  .orders-header p {
    color: #888;
    font-size: 14px;
    margin: 0;
  }
  .empty-state {
    text-align: center;
    padding: 80px 20px;
  }
  .empty-state h2 {
    margin: 20px 0 8px;
    font-size: 20px;
    color: #333;
  }
  .empty-state p {
    color: #888;
    margin: 0 0 24px;
  }
  .shop-btn {
    display: inline-block;
    padding: 12px 32px;
    background: #222;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background 0.2s;
  }
  .shop-btn:hover {
    background: #444;
  }
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .order-card {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 20px 24px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .order-card:hover {
    border-color: #222;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .order-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .order-id {
    font-weight: 700;
    font-size: 15px;
    color: #111;
  }
  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .order-items-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }
  .item-name {
    font-size: 13px;
    color: #555;
    background: #f5f5f5;
    padding: 4px 10px;
    border-radius: 6px;
  }
  .more-items {
    font-size: 13px;
    color: #888;
    padding: 4px 10px;
  }
  .order-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
  .order-total {
    font-weight: 700;
    font-size: 16px;
    color: #111;
  }
  .order-date {
    font-size: 13px;
    color: #888;
  }
`
