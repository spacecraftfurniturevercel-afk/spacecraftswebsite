"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function WishlistClient() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const fetchWishlist = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || null
      setSessionToken(token)

      if (!token) {
        setError('Please login to view your wishlist')
        setLoading(false)
        return
      }

      const res = await fetch('/api/wishlist/get', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load wishlist')
      }

      setItems(data.items || [])
    } catch (err) {
      console.error('Wishlist fetch error:', err)
      setError(err.message || 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (product_id) => {
    if (!sessionToken) return
    
    setRemovingId(product_id)
    setError(null)

    try {
      const res = await fetch(`/api/wishlist/remove?product_id=${product_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` }
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove item')
      }

      setItems(items.filter(item => item.product_id !== product_id))
      setSuccessMessage('Removed from wishlist')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = async (product_id, productName) => {
    if (!sessionToken) {
      alert('Please login to add items to cart')
      return
    }

    setAddingId(product_id)

    try {
      const res = await authenticatedFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id, quantity: 1 })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage(`${productName} added to cart!`)
        window.dispatchEvent(new Event('cart-updated'))
        setTimeout(() => setSuccessMessage(null), 2000)
      } else {
        alert(data.error || 'Failed to add to cart')
      }
    } catch (err) {
      console.error('Add to cart error:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setAddingId(null)
    }
  }

  if (loading) return <div className="wishlist-state loading">Loading wishlist...</div>
  
  if (error) return (
    <div className="wishlist-state error">
      <h2>{error}</h2>
      {error.includes('login') && (
        <Link href="/login" className="login-btn">Go to Login</Link>
      )}
    </div>
  )
  
  if (!items.length) return (
    <div className="wishlist-state empty">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <h2>Your wishlist is empty</h2>
      <p>Save your favorite items for later!</p>
      <Link href="/products" className="shop-btn">Browse Products</Link>
    </div>
  )

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      {successMessage && <div className="success-toast">{successMessage}</div>}

      <div className="wishlist-grid">
        {items.map(item => {
          const discount = item.originalPrice > item.price 
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0

          return (
            <div key={item.id} className="wishlist-card">
              <div className="card-image-wrapper">
                <Link href={`/products/${item.slug}`} className="card-image">
                  <Image 
                    src={item.image_url} 
                    alt={item.name}
                    width={280}
                    height={280}
                    style={{ objectFit: 'cover' }}
                  />
                </Link>
                {discount > 0 && <span className="discount-badge">-{discount}%</span>}
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingId === item.product_id}
                  title="Remove from wishlist"
                >
                  {removingId === item.product_id ? '...' : '✕'}
                </button>
              </div>
              
              <div className="card-content">
                <Link href={`/products/${item.slug}`} className="card-title">
                  {item.name}
                </Link>
                
                <div className="price-row">
                  <div className="price">₹{item.price.toLocaleString()}</div>
                  {item.originalPrice > item.price && (
                    <div className="mrp">₹{item.originalPrice.toLocaleString()}</div>
                  )}
                </div>

                {item.stock > 0 ? (
                  <div className="stock in-stock">✓ In Stock</div>
                ) : (
                  <div className="stock out-stock">Out of Stock</div>
                )}

                <div className="card-actions">
                  <button 
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(item.product_id, item.name)}
                    disabled={item.stock === 0 || addingId === item.product_id}
                  >
                    {addingId === item.product_id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .wishlist-page { padding: 20px 0; max-width: 1400px; margin: 0 auto; }
        .wishlist-header { text-align: center; margin-bottom: 40px; }
        .wishlist-header h1 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: #111; }
        .wishlist-header p { color: #666; font-size: 16px; margin: 0; }
        
        .success-toast { 
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: linear-gradient(135deg, #27ae60, #229954); 
          color: #fff; 
          padding: 14px 24px; 
          border-radius: 10px; 
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .wishlist-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .wishlist-card { 
          background: #fff; 
          border: 1px solid #e0e0e0; 
          border-radius: 14px; 
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .wishlist-card:hover { 
          box-shadow: 0 12px 32px rgba(0,0,0,0.12); 
          transform: translateY(-6px);
          border-color: #007bff;
        }
        
        .card-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #ffffff;
          overflow: hidden;
        }
        
        .card-image { 
          position: relative;
          width: 100%; 
          height: 100%; 
          display: block; 
          background: #ffffff;
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .card-image-wrapper:hover .card-image img {
          transform: scale(1.05);
        }
        
        .discount-badge { 
          position: absolute; 
          top: 12px; 
          right: 12px; 
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: #fff; 
          padding: 8px 12px; 
          border-radius: 8px; 
          font-weight: 700; 
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .remove-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.95);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .remove-btn:hover:not(:disabled) {
          background: #fee;
          color: #d00;
          transform: scale(1.1);
        }
        .remove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .card-content { 
          padding: 16px; 
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .card-title { 
          display: block; 
          font-weight: 700; 
          font-size: 15px; 
          color: #111; 
          text-decoration: none; 
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .card-title:hover { color: #007bff; }
        
        .price-row { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin-bottom: 10px;
        }
        .price { 
          font-weight: 800; 
          font-size: 18px; 
          color: #111;
        }
        .mrp { 
          text-decoration: line-through; 
          color: #999; 
          font-size: 13px;
        }
        
        .stock { 
          font-size: 12px; 
          margin-bottom: 12px; 
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }
        .in-stock { 
          color: #27ae60; 
          background: #d5f4e6;
        }
        .out-stock { 
          color: #e74c3c; 
          background: #fadbd8;
        }
        
        .card-actions { 
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        
        .btn-add-cart { 
          flex: 1; 
          padding: 12px; 
          background: linear-gradient(135deg, #007bff, #0056b3); 
          color: #fff; 
          border: none; 
          border-radius: 10px; 
          cursor: pointer; 
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-add-cart:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 16px rgba(0, 91, 179, 0.3);
        }
        .btn-add-cart:disabled { 
          opacity: 0.5; 
          cursor: not-allowed;
        }
        
        .wishlist-state {
          padding: 80px 20px;
          text-align: center;
          color: #666;
        }
        .wishlist-state.empty h2,
        .wishlist-state.error h2 {
          margin: 20px 0 12px;
          font-size: 24px;
          color: #333;
        }
        .wishlist-state.empty p {
          margin: 0 0 24px;
          font-size: 16px;
          color: #666;
        }
        .wishlist-state.loading {
          padding: 40px 20px;
          font-size: 16px;
        }
        .wishlist-state.error {
          color: #d32f2f;
        }
        .wishlist-state.error h2 {
          color: #d32f2f;
        }
        
        .shop-btn, .login-btn { 
          display: inline-block; 
          padding: 14px 32px; 
          background: linear-gradient(135deg, #007bff, #0056b3); 
          color: #fff; 
          text-decoration: none; 
          border-radius: 10px; 
          font-weight: 700;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .shop-btn:hover, .login-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(0, 91, 179, 0.3);
        }
        
        @media (max-width: 768px) { 
          .wishlist-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
          .wishlist-header h1 { font-size: 24px; }
        }
        @media (max-width: 480px) {
          .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
          .card-content { padding: 12px; }
          .card-title { font-size: 14px; }
        }
      `}</style>
    </div>
  )
}
