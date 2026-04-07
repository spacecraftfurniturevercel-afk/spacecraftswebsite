"use client"
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function CartClient() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({ subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [userId, setUserId] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  // Address states
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressPicker, setShowAddressPicker] = useState(false)
  const [pincodeValidation, setPincodeValidation] = useState(null)
  const [validatingPincode, setValidatingPincode] = useState(false)

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [paymentState, setPaymentState] = useState(null) // null | 'verifying' | 'success'
  const [completedOrderId, setCompletedOrderId] = useState(null)
  const [step, setStep] = useState(1) // 1=cart, 2=review+pay

  // Delivery charges states
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false)
  const [deliveryChargeInfo, setDeliveryChargeInfo] = useState(null)

  const fetchCart = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase) {
        // Not logged in / supabase not ready — show guest cart
        const ls = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
        const guestItems = ls ? JSON.parse(ls) : []
        setItems(guestItems)
        const guestSubtotal = guestItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
        const guestGst1 = Math.round(guestSubtotal * 0.18)
        setSummary({ subtotal: guestSubtotal, discount: 0, tax: guestGst1, shipping: 0, total: guestSubtotal + guestGst1 })
        setLoading(false)
        return
      }

      let session = null
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 5000))
        ])
        session = result?.data?.session
      } catch (e) {
        console.warn('getSession timed out in cart:', e.message)
      }
      setSessionToken(session?.access_token || null)
      setUserId(session?.user?.id || null)

      if (!session) {
        const ls = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
        const guestItems = ls ? JSON.parse(ls) : []
        setItems(guestItems)
        const guestSubtotal = guestItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
        const guestGst2 = Math.round(guestSubtotal * 0.18)
        setSummary({ subtotal: guestSubtotal, discount: 0, tax: guestGst2, shipping: 0, total: guestSubtotal + guestGst2 })
      } else {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await authenticatedFetch('/api/cart/get', { signal: controller.signal })
        clearTimeout(timeout)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load cart')
        setItems(data.items || [])
        const apiSub = data.summary?.subtotal || 0
        const apiGst = Math.round(apiSub * 0.18)
        setSummary({ subtotal: apiSub, discount: 0, tax: apiGst, shipping: 0, total: apiSub + apiGst })
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Cart loading timed out. Please refresh the page.')
      } else {
        setError(err.message || 'Failed to load cart')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])
  useEffect(() => { if (sessionToken) fetchAddresses() }, [sessionToken])

  // Re-fetch delivery charge after items are loaded (items may be empty during fetchAddresses)
  useEffect(() => {
    if (items.length > 0 && selectedAddress?.postal_code) {
      validatePincode(selectedAddress.postal_code)
    }
  }, [items.length, selectedAddress?.id])

  // Load Razorpay script on-demand (not eagerly) to prevent webpack module conflicts
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]')
      if (existing) { existing.onload = () => resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const fetchAddresses = async () => {
    try {
      const res = await authenticatedFetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
        const defaultAddr = data.addresses?.find(a => a.is_default)
        if (defaultAddr) {
          setSelectedAddress(defaultAddr)
          // Delivery charge is fetched in the useEffect below once items are loaded
        } else if (data.addresses?.length > 0) {
          setSelectedAddress(data.addresses[0])
          // Delivery charge is fetched in the useEffect below once items are loaded
        }
      }
    } catch (err) { console.error('Error fetching addresses:', err) }
  }

  const validatePincode = async (postal_code) => {
    if (!postal_code || postal_code.length !== 6) return
    setValidatingPincode(true)
    setDeliveryChargeLoading(true)
    try {
      const res = await fetch(`/api/validate-pincode?postal_code=${postal_code}`)
      const data = await res.json()
      if (res.ok) {
        setPincodeValidation(data)
      }
    } catch (err) { console.error('Pincode validation error:', err) }
    finally { setValidatingPincode(false) }

    // Fetch actual delivery charges from BigShip
    try {
      const cartTotal = items.reduce((sum, it) => {
        const price = it.price || it.products?.discount_price || it.products?.price || 0
        return sum + price * (it.quantity || 1)
      }, 0)
      // Calculate total shipping weight and max dimensions from all cart items
      // Each item's weight is multiplied by its quantity
      const totalWeight = items.reduce((sum, it) => {
        const w = it.shipping_weight || 0
        return sum + w * (it.quantity || 1)
      }, 0)
      // Use the largest dimension across all items (box must fit the biggest product)
      const maxLength = Math.max(...items.map(it => it.shipping_length || 0))
      const maxWidth = Math.max(...items.map(it => it.shipping_width || 0))
      const maxHeight = Math.max(...items.map(it => it.shipping_height || 0))
      // Total box count = sum of (box_count per unit × quantity) for all items
      const totalBoxCount = items.reduce((sum, it) => {
        const bc = it.shipping_box_count || 1
        return sum + bc * (it.quantity || 1)
      }, 0)

      // shipment_invoice_amount = product cost ONLY (no GST, no shipping) as per BigShip docs
      const params = new URLSearchParams({ pincode: postal_code, amount: cartTotal })
      if (totalWeight > 0) params.set('weight', totalWeight)
      if (maxLength > 0) params.set('length', maxLength)
      if (maxWidth > 0) params.set('width', maxWidth)
      if (maxHeight > 0) params.set('height', maxHeight)
      if (totalBoxCount > 0) params.set('box_count', totalBoxCount)

      const res = await fetch(`/api/delivery-charges?${params}`)
      const data = await res.json()
      if (res.ok && data.success && data.available) {
        const charge = data.deliveryCharge || 0
        setDeliveryCharge(charge)
        setDeliveryChargeInfo({
          courierName: data.courierName,
          estimatedDays: data.estimatedDays,
          freeDelivery: data.freeDelivery,
        })
        setSummary(prev => {
          const gst = Math.round(prev.subtotal * 0.18)
          return {
            ...prev,
            tax: gst,
            shipping: charge,
            total: prev.subtotal - (appliedCoupon ? prev.discount : 0) + charge + gst
          }
        })
      } else {
        setDeliveryCharge(0)
        setDeliveryChargeInfo(null)
        setSummary(prev => {
          const gst = Math.round(prev.subtotal * 0.18)
          return {
            ...prev,
            tax: gst,
            shipping: 0,
            total: prev.subtotal - (appliedCoupon ? prev.discount : 0) + gst
          }
        })
      }
    } catch (err) {
      console.error('Delivery charges fetch error:', err)
      setDeliveryCharge(0)
      setDeliveryChargeInfo(null)
    } finally {
      setDeliveryChargeLoading(false)
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    validatePincode(address.postal_code)
    setShowAddressPicker(false)
  }

  const persistGuestCart = (nextItems) => {
    if (sessionToken || typeof window === 'undefined') return
    localStorage.setItem('cart', JSON.stringify(nextItems))
  }

  const handleUpdateQty = async (product_id, quantity) => {
    if (quantity < 1) quantity = 1
    setUpdatingId(product_id)
    setError(null)
    if (!sessionToken) {
      const next = items.map(it => it.product_id === product_id ? { ...it, quantity } : it)
      setItems(next)
      persistGuestCart(next)
      setUpdatingId(null)
      return
    }
    try {
      const res = await authenticatedFetch('/api/cart/update', { method: 'PUT', body: JSON.stringify({ product_id, quantity }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update item')
      await fetchCart()
    } catch (err) { setError(err.message) }
    finally { setUpdatingId(null) }
  }

  const handleRemove = async (product_id) => {
    setUpdatingId(product_id)
    setError(null)
    if (!sessionToken) {
      const next = items.filter(it => it.product_id !== product_id)
      setItems(next)
      persistGuestCart(next)
      setUpdatingId(null)
      return
    }
    try {
      const res = await authenticatedFetch(`/api/cart/remove?product_id=${product_id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove item')
      await fetchCart()
    } catch (err) { setError(err.message) }
    finally { setUpdatingId(null) }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Enter a coupon code'); return }
    if (!userId) { setCouponError('Please login to apply coupon'); return }
    setApplyingCoupon(true); setCouponError(null)
    try {
      const res = await authenticatedFetch('/api/cart/apply-coupon', { method: 'POST', body: JSON.stringify({ coupon_code: couponCode, user_id: userId }) })
      const data = await res.json()
      if (!res.ok) { setCouponError(data.error || 'Invalid coupon'); setAppliedCoupon(null) }
      else {
        setAppliedCoupon(data); setCouponError(null)
        const couponDiscount = (totals.subtotal * data.discount_percentage) / 100
        const gstCoupon = Math.round(totals.subtotal * 0.18)
        setSummary(prev => ({ ...prev, discount: couponDiscount, tax: gstCoupon, total: prev.subtotal - couponDiscount + (deliveryCharge || 0) + gstCoupon }))
      }
    } catch { setCouponError('Failed to apply coupon') }
    finally { setApplyingCoupon(false) }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null); setCouponCode(''); setCouponError(null)
    setSummary(prev => { const gst = Math.round(prev.subtotal * 0.18); return { ...prev, discount: 0, tax: gst, total: prev.subtotal + (deliveryCharge || 0) + gst } })
  }

  // Proceed to checkout Step 2
  const handleProceedToCheckout = () => {
    if (!sessionToken) { router.push('/login'); return }
    if (!selectedAddress) { setError('Please select or add a delivery address'); return }
    setError(null)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Razorpay payment
  const handlePayNow = async () => {
    setPaymentError(null)
    setIsProcessing(true)
    try {
      const orderPayload = {
        items: items.map(it => ({ product_id: it.product_id || it.products?.id, quantity: it.quantity || 1 })),
        address_id: selectedAddress?.id || null,
        payment_type: 'cart',
        delivery_charge: deliveryCharge || 0,
      }
      const orderResponse = await authenticatedFetch('/api/razorpay/create-order', { method: 'POST', body: JSON.stringify(orderPayload) })
      const orderData = await orderResponse.json()
      if (!orderResponse.ok) { setPaymentError(orderData.error || 'Failed to create order'); setIsProcessing(false); return }

      let paymentHandled = false

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SNZPmHU5RD7fq8',
        order_id: orderData.razorpay_order_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        name: 'Spacecrafts Furniture',
        description: 'Cart Checkout',
        handler: async (response) => {
          paymentHandled = true
          try {
            setPaymentState('verifying')
            const verifyRes = await authenticatedFetch('/api/razorpay/verify-payment', {
              method: 'POST',
              body: JSON.stringify({ razorpay_order_id: orderData.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, order_id: orderData.order_id })
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) { setPaymentState(null); setPaymentError(verifyData.error || 'Payment verification failed'); setIsProcessing(false); return }
            setPaymentState('success')
            setCompletedOrderId(orderData.order_id)
            setTimeout(() => {
              window.location.href = `/orders/success?order_id=${orderData.order_id}`
            }, 2000)
          } catch (err) { setPaymentState(null); setPaymentError('Failed to verify payment. Check your orders page.'); setIsProcessing(false) }
        },
        modal: { ondismiss: () => { if (!paymentHandled) setIsProcessing(false) } },
        prefill: { name: orderData.customer_name, email: orderData.customer_email },
        theme: { color: '#222' }
      }

      const loaded = await loadRazorpayScript()
      if (loaded && window.Razorpay) {
        new window.Razorpay(options).open()
      } else { setPaymentError('Payment gateway not loaded. Please refresh.'); setIsProcessing(false) }
    } catch (err) { setPaymentError(err.message || 'An error occurred'); setIsProcessing(false) }
  }

  const totals = useMemo(() => summary, [summary])

  if (loading) return (
    <div className="cart-empty-state">
      <div className="spinner"></div>
      <p>Loading your cart...</p>
      <style>{`
        .cart-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: #888; }
        .spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #222; border-radius: 50%; animation: spin .6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )

  if (!items.length) return (
    <div className="cart-empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <h2 style={{margin: 0, color: '#333', fontSize: 20}}>Your cart is empty</h2>
      <p style={{margin: 0, color: '#888', fontSize: 14}}>Looks like you haven't added anything yet.</p>
      <Link href="/products" style={{marginTop: 8, padding: '10px 28px', background: '#222', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600}}>Browse Products</Link>
      <style>{`.cart-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; }`}</style>
    </div>
  )

  return (
    <div className="cart-page">
      {/* Payment verifying/success overlay */}
      {paymentState && (
        <div className="pay-overlay">
          <div className="pay-overlay-card">
            {paymentState === 'verifying' ? (
              <>
                <div className="pay-overlay-icon">
                  <svg className="pay-spinner-svg" width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeDasharray="100 60" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="pay-overlay-title">Verifying Payment</h2>
                <p className="pay-overlay-desc">Confirming your transaction. This will only take a moment.</p>
              </>
            ) : (
              <>
                <div className="pay-overlay-icon pay-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="pay-overlay-title">Payment Successful</h2>
                <p className="pay-overlay-desc">Your order has been confirmed. Redirecting to order details...</p>
                <div className="pay-progress"><div className="pay-progress-bar"></div></div>
              </>
            )}
          </div>
          <style>{`
            .pay-overlay {
              position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999;
              background: rgba(255,255,255,0.98);
              display: flex; align-items: center; justify-content: center;
              animation: payFadeIn 0.3s ease;
            }
            @keyframes payFadeIn { from { opacity: 0; } to { opacity: 1; } }
            .pay-overlay-card { text-align: center; padding: 48px 40px; max-width: 400px; }
            .pay-overlay-icon { width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
            .pay-success-icon { background: #1a1a1a; border-radius: 50%; animation: payPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
            @keyframes payPop { from { transform: scale(0); } to { transform: scale(1); } }
            .pay-spinner-svg { animation: paySpin 1s linear infinite; }
            @keyframes paySpin { to { transform: rotate(360deg); } }
            .pay-overlay-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; letter-spacing: -0.5px; }
            .pay-overlay-desc { font-size: 14px; color: #888; margin: 0 0 24px; line-height: 1.5; }
            .pay-progress { width: 180px; height: 3px; background: #e5e7eb; border-radius: 3px; margin: 0 auto; overflow: hidden; }
            .pay-progress-bar { width: 100%; height: 100%; background: #1a1a1a; border-radius: 3px; animation: payBar 2s ease forwards; }
            @keyframes payBar { from { width: 0; } to { width: 100%; } }
          `}</style>
        </div>
      )}

      {/* Compact Breadcrumb */}
      <div className="cart-breadcrumb">
        <div className="container">
          <nav>
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/products">Products</Link>
            <span>›</span>
            <span className="current">{step === 1 ? 'Cart' : 'Checkout'}</span>
          </nav>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="container">
        <div className="steps-bar">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <span>Cart</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <span>Review & Pay</span>
          </div>
        </div>
      </div>

      {error && <div className="container"><div className="alert alert-error">{error}</div></div>}

      <div className="container">
        <div className="cart-layout">

          {/* LEFT — Cart items / Review */}
          <div className="cart-left">
            {step === 1 ? (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>Shopping Cart <span className="item-count">({items.length} {items.length === 1 ? 'item' : 'items'})</span></h2>
                  </div>
                  <div className="cart-items">
                    {items.map(item => {
                      const price = item.price || item.products?.discount_price || item.products?.price || 0
                      const mrp = item.originalPrice || item.products?.price || price
                      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
                      const qty = item.quantity || 1
                      const image = item.image_url || item.products?.image_url || item.products?.images?.[0]?.url || '/placeholder-product.svg'
                      const pid = item.product_id || item.products?.id
                      const isUpdating = updatingId === pid
                      return (
                        <div key={item.id || pid} className="cart-item">
                          <div className="item-image">
                            <Image src={image} alt={item.name || item.products?.name || 'Product'} fill sizes="90px" style={{ objectFit: 'contain' }} />
                          </div>
                          <div className="item-details">
                            <Link href={`/products/${item.slug || item.products?.slug || pid}`} className="item-name">
                              {item.name || item.products?.name || 'Product'}
                            </Link>
                            <div className="item-price-row">
                              <span className="item-price">₹{price.toLocaleString('en-IN')}</span>
                              {mrp > price && <span className="item-mrp">₹{mrp.toLocaleString('en-IN')}</span>}
                              {discount > 0 && <span className="item-discount">{discount}% off</span>}
                            </div>
                            <div className="item-status">In Stock</div>
                            <div className="item-actions">
                              <div className="qty-control">
                                <button onClick={() => handleUpdateQty(pid, qty - 1)} disabled={qty <= 1 || isUpdating}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => handleUpdateQty(pid, qty + 1)} disabled={isUpdating}>+</button>
                              </div>
                              <button className="remove-btn" onClick={() => handleRemove(pid)} disabled={isUpdating}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="item-line-total">₹{(price * qty).toLocaleString('en-IN')}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* STEP 2 — Review & Pay */
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>Order Review</h2>
                    <button className="back-link" onClick={() => setStep(1)}>← Edit Cart</button>
                  </div>
                  <div className="review-items">
                    {items.map(item => {
                      const price = item.price || item.products?.discount_price || item.products?.price || 0
                      const qty = item.quantity || 1
                      const image = item.image_url || item.products?.image_url || item.products?.images?.[0]?.url || '/placeholder-product.svg'
                      return (
                        <div key={item.id || item.product_id} className="review-item">
                          <div className="review-thumb"><Image src={image} alt={item.name || item.products?.name || 'Product'} width={50} height={50} style={{ objectFit: 'contain' }} /></div>
                          <div className="review-info">
                            <span className="review-name">{item.name || item.products?.name}</span>
                            <span className="review-qty">Qty: {qty}</span>
                          </div>
                          <span className="review-price">₹{(price * qty).toLocaleString('en-IN')}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Delivery address card */}
                <div className="section-card">
                  <div className="section-header">
                    <h2>Delivery Address</h2>
                    <button className="back-link" onClick={() => setStep(1)}>Change</button>
                  </div>
                  {selectedAddress ? (
                    <div className="confirm-address">
                      <strong>{selectedAddress.full_name || selectedAddress.label}</strong>
                      <p>{selectedAddress.address_line1 || selectedAddress.line1}{(selectedAddress.address_line2 || selectedAddress.line2) ? `, ${selectedAddress.address_line2 || selectedAddress.line2}` : ''}</p>
                      <p>{selectedAddress.city}, {selectedAddress.state} – {selectedAddress.postal_code}</p>
                      <p>Phone: {selectedAddress.phone}</p>
                      {pincodeValidation?.available && (
                        <div className="delivery-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                          {deliveryChargeInfo ? (
                            <>Delivery in ~{deliveryChargeInfo.estimatedDays} days{deliveryChargeInfo.courierName ? ` via ${deliveryChargeInfo.courierName}` : ''}</>
                          ) : pincodeValidation.deliveryInfo ? (
                            <>Delivery in {pincodeValidation.deliveryInfo.deliveryDays} days</>
                          ) : 'Delivery available'}
                        </div>
                      )}
                    </div>
                  ) : <p style={{color:'#888', fontSize: 13}}>No address selected</p>}
                </div>

                {/* Price Details card — mirrors Buy Now panel; visible on all screen sizes */}
                <div className="section-card">
                  <div className="section-header">
                    <h2>Price Details</h2>
                  </div>
                  <div style={{padding: '14px 16px'}}>
                    <div className="pd-row">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {appliedCoupon && totals.discount > 0 && (
                      <div className="pd-row" style={{color: '#16a34a', fontWeight: 600}}>
                        <span>Discount ({appliedCoupon.discount_percentage}%)</span>
                        <span>−₹{totals.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="pd-row">
                      <span>Delivery Charges</span>
                      <span>
                        {deliveryChargeLoading ? (
                          <span style={{color: '#999', fontSize: 12}}>Calculating...</span>
                        ) : totals.shipping === 0 ? (
                          selectedAddress
                            ? <span style={{color: '#16a34a', fontWeight: 600}}>FREE</span>
                            : <span style={{color: '#999', fontSize: 12}}>Select address</span>
                        ) : (
                          `₹${totals.shipping.toLocaleString('en-IN')}`
                        )}
                      </span>
                    </div>
                    {deliveryChargeInfo?.courierName && !deliveryChargeLoading && (
                      <div className="pd-row" style={{fontSize: 11, color: '#888', marginBottom: 6}}>
                        <span>via {deliveryChargeInfo.courierName}</span>
                        <span>~{deliveryChargeInfo.estimatedDays} days</span>
                      </div>
                    )}
                    <div className="pd-row">
                      <span>GST (18%)</span>
                      <span>₹{Math.round(totals.subtotal * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pd-divider"></div>
                    <div className="pd-total">
                      <span>Total</span>
                      <span>₹{totals.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment section */}
                <div className="section-card">
                  <div className="section-header"><h2>Payment</h2></div>
                  <div className="payment-method-row">
                    <input type="radio" name="pay" defaultChecked id="rp" />
                    <label htmlFor="rp">
                      <strong>Razorpay</strong>
                      <span>UPI, Cards, Net Banking, Wallets</span>
                    </label>
                  </div>
                  {paymentError && <div className="alert alert-error" style={{marginTop: 12}}>{paymentError}</div>}
                  <button className="pay-btn" onClick={handlePayNow} disabled={isProcessing}>
                    {isProcessing ? (
                      <><span className="btn-spinner"></span> Processing...</>
                    ) : (
                      <>Pay ₹{totals.total.toLocaleString('en-IN')}</>
                    )}
                  </button>
                  <div className="trust-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>256-bit SSL Encrypted · Secure Checkout</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Summary */}
          <div className="cart-right">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="sum-row"><span>Subtotal ({items.length} items)</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
              {appliedCoupon && totals.discount > 0 && <div className="sum-row green"><span>Discount ({appliedCoupon.discount_percentage}%)</span><span>−₹{totals.discount.toLocaleString('en-IN')}</span></div>}
              <div className="sum-row">
                <span>Delivery Charges</span>
                <span>
                  {deliveryChargeLoading ? (
                    <span style={{color: '#999', fontSize: 12}}>Calculating...</span>
                  ) : totals.shipping === 0 ? (
                    selectedAddress ? <span style={{color: '#16a34a', fontWeight: 600}}>FREE</span> : <span style={{color: '#999', fontSize: 12}}>Select address</span>
                  ) : (
                    `₹${totals.shipping.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              {deliveryChargeInfo?.courierName && !deliveryChargeLoading && (
                <div className="sum-row" style={{fontSize: 11, color: '#888'}}>
                  <span>via {deliveryChargeInfo.courierName}</span>
                  <span>~{deliveryChargeInfo.estimatedDays} days</span>
                </div>
              )}
              <div className="sum-row"><span>GST (18%)</span><span>₹{Math.round(totals.subtotal * 0.18).toLocaleString('en-IN')}</span></div>
              <div className="sum-divider"></div>
              <div className="sum-total"><span>Total</span><span>₹{totals.total.toLocaleString('en-IN')}</span></div>

              {/* Coupon */}
              <div className="coupon-box">
                {!appliedCoupon ? (
                  <div className="coupon-row">
                    <input type="text" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} disabled={applyingCoupon} />
                    <button onClick={handleApplyCoupon} disabled={applyingCoupon}>{applyingCoupon ? '...' : 'Apply'}</button>
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <span>✓ {appliedCoupon.coupon_code}</span>
                    <button onClick={handleRemoveCoupon}>×</button>
                  </div>
                )}
                {couponError && <div className="coupon-err">{couponError}</div>}
              </div>

              {/* Address (Step 1) */}
              {step === 1 && sessionToken && (
                <div className="address-box">
                  <div className="addr-header">
                    <span className="addr-label">Deliver to</span>
                    {addresses.length > 1 && <button className="addr-change" onClick={() => setShowAddressPicker(!showAddressPicker)}>{showAddressPicker ? 'Cancel' : 'Change'}</button>}
                  </div>
                  {selectedAddress ? (
                    <>
                      {!showAddressPicker && (
                        <div className="addr-selected">
                          <strong>{selectedAddress.full_name || selectedAddress.label}</strong>
                          <span>{selectedAddress.city} – {selectedAddress.postal_code}</span>
                          {validatingPincode && <span className="addr-checking">Checking delivery...</span>}
                          {pincodeValidation && !validatingPincode && (
                            pincodeValidation.available ? (
                              <span className="addr-ok">✓ Delivery available{pincodeValidation.deliveryInfo ? ` (${pincodeValidation.deliveryInfo.deliveryDays}d)` : ''}</span>
                            ) : <span className="addr-no">✗ Delivery unavailable</span>
                          )}
                        </div>
                      )}
                      {showAddressPicker && (
                        <div className="addr-list">
                          {addresses.map(a => (
                            <div key={a.id} className={`addr-option ${selectedAddress?.id === a.id ? 'active' : ''}`} onClick={() => handleAddressSelect(a)}>
                              <div className="addr-radio"><div className={selectedAddress?.id === a.id ? 'dot active' : 'dot'}></div></div>
                              <div>
                                <strong>{a.full_name || a.label}</strong>
                                <span>{a.address_line1 || a.line1}, {a.city} – {a.postal_code}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href="/account" className="add-addr-btn">+ Add Address</Link>
                  )}
                </div>
              )}

              {step === 1 && (
                <button className="checkout-btn" onClick={handleProceedToCheckout}
                  disabled={!sessionToken ? false : (!selectedAddress || (pincodeValidation && !pincodeValidation.available))}
                >
                  {!sessionToken ? 'Login to Checkout' : (!selectedAddress ? 'Add Address' : 'Proceed to Checkout')}
                </button>
              )}

              <div className="trust-icons">
                <div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure</div>
                <div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Genuine</div>
                <div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1M6 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z"/></svg> Affordable Ship</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page { background: #f5f5f7; min-height: 100vh; padding-bottom: 60px; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }

        /* Breadcrumb */
        .cart-breadcrumb { background: #fff; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
        .cart-breadcrumb nav { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #999; max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .cart-breadcrumb a { color: #e67e22; text-decoration: none; }
        .cart-breadcrumb a:hover { color: #d35400; }
        .cart-breadcrumb .current { color: #333; font-weight: 500; }

        /* Steps */
        .steps-bar { display: flex; align-items: center; justify-content: center; gap: 0; padding: 20px 0 16px; }
        .step-item { display: flex; align-items: center; gap: 8px; color: #bbb; font-size: 13px; font-weight: 600; }
        .step-item.active { color: #222; }
        .step-num { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: #eee; color: #aaa; }
        .step-item.active .step-num { background: #222; color: #fff; }
        .step-line { width: 80px; height: 2px; background: #ddd; margin: 0 12px; }

        /* Alerts */
        .alert { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 12px; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        /* Layout */
        .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }

        /* Section cards */
        .section-card { background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
        .section-header h2 { margin: 0; font-size: 15px; font-weight: 700; color: #222; }
        .item-count { font-weight: 400; color: #888; font-size: 13px; }
        .back-link { background: none; border: none; color: #e67e22; font-size: 12px; font-weight: 600; cursor: pointer; }
        .back-link:hover { color: #d35400; }

        /* Cart items */
        .cart-items { padding: 0; }
        .cart-item { display: flex; gap: 14px; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; align-items: flex-start; }
        .cart-item:last-child { border-bottom: none; }
        .item-image { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; background: #fafafa; flex-shrink: 0; border: 1px solid #f0f0f0; }
        .item-details { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .item-name { font-size: 13px; font-weight: 600; color: #222; text-decoration: none; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .item-name:hover { color: #e67e22; }
        .item-price-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .item-price { font-size: 14px; font-weight: 700; color: #222; }
        .item-mrp { font-size: 12px; color: #999; text-decoration: line-through; }
        .item-discount { font-size: 11px; color: #16a34a; font-weight: 600; }
        .item-status { font-size: 11px; color: #16a34a; }
        .item-actions { display: flex; align-items: center; gap: 14px; margin-top: 4px; }
        .qty-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .qty-control button { width: 28px; height: 28px; border: none; background: #fafafa; cursor: pointer; font-size: 14px; font-weight: 600; color: #555; display: flex; align-items: center; justify-content: center; }
        .qty-control button:hover:not(:disabled) { background: #eee; }
        .qty-control button:disabled { opacity: .4; cursor: not-allowed; }
        .qty-control span { width: 32px; text-align: center; font-size: 13px; font-weight: 600; border-left: 1px solid #ddd; border-right: 1px solid #ddd; height: 28px; display: flex; align-items: center; justify-content: center; }
        .remove-btn { background: none; border: none; color: #dc2626; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500; padding: 0; }
        .remove-btn:hover { color: #b91c1c; }
        .remove-btn:disabled { opacity: .5; cursor: not-allowed; }
        .item-line-total { font-size: 14px; font-weight: 700; color: #222; white-space: nowrap; min-width: 80px; text-align: right; }

        /* Review items (step 2) */
        .review-items { padding: 0; }
        .review-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; }
        .review-item:last-child { border-bottom: none; }
        .review-thumb { width: 42px; height: 42px; border-radius: 4px; overflow: hidden; background: #fafafa; flex-shrink: 0; border: 1px solid #f0f0f0; }
        .review-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .review-name { font-size: 13px; font-weight: 600; color: #222; }
        .review-qty { font-size: 11px; color: #888; }
        .review-price { font-size: 13px; font-weight: 700; color: #222; }

        /* Confirm address */
        .confirm-address { padding: 14px 16px; font-size: 13px; color: #555; line-height: 1.5; }
        .confirm-address strong { color: #222; display: block; margin-bottom: 2px; }
        .confirm-address p { margin: 0; }
        .delivery-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 4px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 12px; font-weight: 600; color: #16a34a; }

        /* Payment method */
        .payment-method-row { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; }
        .payment-method-row input { margin-top: 3px; }
        .payment-method-row label { display: flex; flex-direction: column; cursor: pointer; }
        .payment-method-row label strong { font-size: 14px; color: #222; }
        .payment-method-row label span { font-size: 12px; color: #888; margin-top: 2px; }

        .pay-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: calc(100% - 32px); margin: 0 16px 14px; padding: 12px; background: #222; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background .2s; }
        .pay-btn:hover:not(:disabled) { background: #000; }
        .pay-btn:disabled { background: #999; cursor: not-allowed; }
        .btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }

        .trust-row { display: flex; align-items: center; gap: 6px; padding: 0 16px 14px; font-size: 11px; color: #888; }

        /* Price Details card (step 2 inline) */
        .pd-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 10px; }
        .pd-divider { height: 1px; background: #eee; margin: 10px 0; }
        .pd-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #222; }

        /* Summary card */
        .summary-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 16px; position: sticky; top: 90px; }
        .summary-card h3 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #222; }
        .sum-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 8px; }
        .sum-row.green { color: #16a34a; font-weight: 600; }
        .sum-divider { height: 1px; background: #eee; margin: 10px 0; }
        .sum-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #222; margin-bottom: 14px; }

        /* Coupon */
        .coupon-box { padding: 12px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; margin-bottom: 12px; }
        .coupon-row { display: flex; gap: 6px; }
        .coupon-row input { flex: 1; padding: 7px 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 12px; }
        .coupon-row input:focus { outline: none; border-color: #222; }
        .coupon-row button { padding: 7px 14px; background: #222; color: #fff; border: none; border-radius: 5px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .coupon-row button:disabled { background: #999; }
        .coupon-applied { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; padding: 8px 10px; border-radius: 5px; font-size: 12px; font-weight: 600; color: #16a34a; }
        .coupon-applied button { background: none; border: none; font-size: 16px; cursor: pointer; color: #999; }
        .coupon-err { font-size: 11px; color: #dc2626; margin-top: 4px; }

        /* Address box */
        .address-box { margin-bottom: 14px; }
        .addr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .addr-label { font-size: 12px; font-weight: 700; color: #222; text-transform: uppercase; letter-spacing: .05em; }
        .addr-change { background: none; border: none; color: #e67e22; font-size: 12px; font-weight: 600; cursor: pointer; }
        .addr-selected { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #555; }
        .addr-selected strong { color: #222; font-size: 13px; }
        .addr-checking { color: #888; font-style: italic; }
        .addr-ok { color: #16a34a; font-weight: 600; }
        .addr-no { color: #dc2626; font-weight: 600; }
        .addr-list { display: flex; flex-direction: column; gap: 6px; }
        .addr-option { display: flex; gap: 10px; padding: 8px 10px; border: 1px solid #eee; border-radius: 6px; cursor: pointer; transition: border-color .15s; }
        .addr-option:hover, .addr-option.active { border-color: #222; }
        .addr-option div { display: flex; flex-direction: column; gap: 1px; }
        .addr-option strong { font-size: 12px; }
        .addr-option span { font-size: 11px; color: #888; }
        .addr-radio { display: flex; align-items: center; }
        .dot { width: 14px; height: 14px; border: 2px solid #ccc; border-radius: 50%; position: relative; }
        .dot.active { border-color: #222; }
        .dot.active::after { content: ''; position: absolute; top: 2px; right: 2px; bottom: 2px; left: 2px; background: #222; border-radius: 50%; }
        .add-addr-btn { display: block; padding: 8px 0; color: #e67e22; font-size: 12px; font-weight: 600; text-decoration: none; }

        .checkout-btn { width: 100%; padding: 12px; background: #222; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background .2s; }
        .checkout-btn:hover:not(:disabled) { background: #000; }
        .checkout-btn:disabled { background: #ccc; color: #888; cursor: not-allowed; }

        .trust-icons { display: flex; gap: 16px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
        .trust-icons div { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #888; font-weight: 500; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-item { flex-wrap: wrap; }
          .item-line-total { width: 100%; text-align: left; padding-left: 94px; margin-top: -4px; }
          .steps-bar { gap: 0; }
          .step-line { width: 40px; }
        }
      `}</style>
    </div>
  )
}
