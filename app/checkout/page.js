'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RazorpayPayment from '../../components/RazorpayPayment'
import { authenticatedFetch } from '../../lib/authenticatedFetch'
import { supabase } from '../../lib/supabaseClient'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [orderSummary, setOrderSummary] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState(null)

  // Fetch cart items and addresses
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Fetch cart items
        const cartResponse = await authenticatedFetch('/api/cart/get')
        if (cartResponse.ok) {
          const cartData = await cartResponse.json()
          setCartItems(cartData.items || [])
          
          // Compute summary with 18% GST (matching backend create-order logic)
          const sub = cartData.summary?.subtotal ||
            cartData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
          const gst = Math.round(sub * 0.18)
          setOrderSummary({ subtotal: sub, tax: gst, shipping: 0, total: sub + gst })
        }

        // Fetch addresses
        const addressResponse = await authenticatedFetch('/api/addresses')
        if (addressResponse.ok) {
          const addressData = await addressResponse.json()
          setAddresses(addressData.addresses || [])
          // Select default address if available
          const defaultAddr = addressData.addresses?.find(a => a.is_default)
          if (defaultAddr) {
            setSelectedAddress(defaultAddr.id)
          } else if (addressData.addresses?.length > 0) {
            setSelectedAddress(addressData.addresses[0].id)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Checkout data fetch error:', err)
        setError('Failed to load checkout data')
        setLoading(false)
      }
    }

    fetchCheckoutData()
  }, [router])

  // Calculate delivery charges when address changes
  const fetchDeliveryCharges = async (postalCode, items) => {
    if (!postalCode || !items?.length) return
    setDeliveryLoading(true)
    try {
      const cartTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)
      const totalWeight = items.reduce((sum, it) => sum + (it.shipping_weight || 0) * (it.quantity || 1), 0)
      const maxLength = Math.max(...items.map(it => it.shipping_length || 0))
      const maxWidth = Math.max(...items.map(it => it.shipping_width || 0))
      const maxHeight = Math.max(...items.map(it => it.shipping_height || 0))
      const totalBoxCount = items.reduce((sum, it) => sum + (it.shipping_box_count || 1) * (it.quantity || 1), 0)

      const params = new URLSearchParams({ pincode: postalCode, amount: cartTotal })
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
        setDeliveryInfo({ courierName: data.courierName, estimatedDays: data.estimatedDays })
        setOrderSummary(prev => prev ? {
          ...prev,
          shipping: charge,
          total: prev.subtotal + prev.tax + charge
        } : prev)
      } else {
        setDeliveryCharge(0)
        setDeliveryInfo(null)
      }
    } catch (err) {
      console.error('Checkout delivery charge error:', err)
      setDeliveryCharge(0)
      setDeliveryInfo(null)
    } finally {
      setDeliveryLoading(false)
    }
  }

  // Re-fetch delivery charges when selected address changes
  useEffect(() => {
    if (!selectedAddress || !cartItems.length) return
    const addr = addresses.find(a => a.id === selectedAddress)
    if (addr) {
      fetchDeliveryCharges(addr.postal_code || addr.pincode, cartItems)
    }
  }, [selectedAddress, addresses, cartItems])

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      setError('Please select a delivery address')
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsPaymentModalOpen(true)
  }

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading">Loading checkout...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to proceed to checkout</p>
          <button className="btn-primary" onClick={() => router.push('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        {/* Left Column - Order Items and Address */}
        <div className="checkout-left">
          <h1>Checkout</h1>

          {error && <div className="error-banner">{error}</div>}

          {/* Order Items */}
          <section className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div className="item-total">
                    <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="checkout-section">
            <h2>Delivery Address</h2>
            {addresses.length === 0 ? (
              <div className="no-addresses">
                <p>No addresses saved. Please add a delivery address.</p>
                <button 
                  className="btn-secondary"
                  onClick={() => router.push('/account?tab=addresses')}
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((address) => (
                  <label key={address.id} className="address-radio">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => {
                        const addrId = isNaN(e.target.value) ? e.target.value : Number(e.target.value)
                        setSelectedAddress(addrId)
                      }}
                    />
                    <div className="address-content">
                      <h4>{address.label}</h4>
                      <p>
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                      </p>
                      <p>
                        {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p className="address-phone">Phone: {address.phone}</p>
                      {address.is_default && <span className="default-badge">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="checkout-right">
          <div className="payment-summary">
            <h2>Payment Summary</h2>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{orderSummary?.subtotal.toFixed(2) || '0.00'}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>
                {deliveryLoading ? 'Calculating...' :
                 orderSummary?.shipping === 0 ? 'FREE' :
                 `₹${orderSummary?.shipping?.toFixed(2)}`}
              </span>
            </div>
            {deliveryInfo && (
              <div className="summary-row" style={{ fontSize: 12, color: '#888' }}>
                <span>{deliveryInfo.courierName}</span>
                <span>~{deliveryInfo.estimatedDays} days</span>
              </div>
            )}

            <div className="summary-row">
              <span>GST (18%):</span>
              <span>₹{orderSummary?.tax?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total Amount:</span>
              <span>₹{orderSummary?.total.toFixed(2) || '0.00'}</span>
            </div>

            <div className="payment-methods">
              <h3>Payment Method</h3>
              <div className="method">
                <input type="radio" id="razorpay" name="payment" defaultChecked />
                <label htmlFor="razorpay">
                  <strong>Razorpay</strong>
                  <span className="method-desc">Credit/Debit Card, UPI, Net Banking, Wallets</span>
                </label>
              </div>
            </div>

            <button 
              className="btn-primary btn-full"
              onClick={handleProceedToPayment}
              disabled={!selectedAddress || cartItems.length === 0}
            >
              Proceed to Payment
            </button>

            <button 
              className="btn-secondary btn-full"
              onClick={() => router.push('/cart')}
            >
              Back to Cart
            </button>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>100% Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      <RazorpayPayment
        items={cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))}
        paymentType="cart"
        addressId={selectedAddress}
        amount={orderSummary?.total || 0}
        deliveryCharge={deliveryCharge}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(data) => {
          // Payment successful - will redirect from component
        }}
        onFailure={(error) => {
          setError(`Payment failed: ${error}`)
        }}
      />

      <style jsx>{`
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
          min-height: 100vh;
        }

        .checkout-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .checkout-wrapper {
            grid-template-columns: 1fr;
          }
        }

        .checkout-left, .checkout-right {
          background: white;
          border-radius: 8px;
          padding: 24px;
        }

        .checkout-left h1 {
          font-size: 28px;
          margin-bottom: 24px;
          color: #000;
        }

        .checkout-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .checkout-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .checkout-section h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #333;
        }

        .error-banner {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #ffffff;
          border-radius: 6px;
        }

        .item-info h3 {
          margin: 0;
          font-size: 14px;
          color: #333;
        }

        .item-price {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 13px;
        }

        .item-quantity {
          color: #666;
          font-size: 13px;
        }

        .item-total {
          min-width: 100px;
          text-align: right;
        }

        .no-addresses {
          padding: 20px;
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          text-align: center;
        }

        .address-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .address-radio {
          display: flex;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .address-radio input {
          margin-top: 4px;
          cursor: pointer;
        }

        .address-radio:has(input:checked) {
          border-color: #2563eb;
          background: #f0f9ff;
        }

        .address-content h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
        }

        .address-content p {
          margin: 4px 0;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }

        .address-phone {
          margin-top: 8px;
          font-weight: 500;
        }

        .default-badge {
          display: inline-block;
          background: #dcfce7;
          color: #166534;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }

        .payment-summary {
          position: sticky;
          top: 20px;
        }

        .payment-summary h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #333;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          color: #666;
        }

        .summary-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 12px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 600;
          color: #000;
          margin-bottom: 20px;
        }

        .payment-methods {
          margin-bottom: 20px;
        }

        .payment-methods h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #333;
        }

        .method {
          display: flex;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        .method input {
          margin-top: 2px;
          cursor: pointer;
        }

        .method label {
          flex: 1;
          cursor: pointer;
        }

        .method label strong {
          display: block;
          color: #333;
          margin-bottom: 2px;
        }

        .method-desc {
          display: block;
          font-size: 12px;
          color: #999;
        }

        .btn-primary, .btn-secondary {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-secondary {
          background: #ffffff;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .trust-badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }

        .loading {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-cart h2 {
          margin-bottom: 8px;
        }

        .empty-cart p {
          color: #666;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
