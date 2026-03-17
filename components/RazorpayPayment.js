'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function RazorpayPayment({
  items = [],
  paymentType = 'cart',
  productId = null,
  quantity = 1,
  addressId = null,
  amount = 0,
  onSuccess = () => {},
  onFailure = () => {},
  onClose = () => {},
  isOpen = false
}) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [paymentState, setPaymentState] = useState(null) // null | 'verifying' | 'success'
  const [confirmedAmount, setConfirmedAmount] = useState(0)
  const [verifyTimeout, setVerifyTimeout] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="checkout.razorpay.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
    return () => {
      // Clean up Razorpay script on unmount to prevent webpack module conflicts
      const script = document.querySelector('script[src*="checkout.razorpay.com"]')
      if (script) script.remove()
    }
  }, [])

  const handlePaymentClick = async () => {
    setError(null)
    setIsProcessing(true)
    try {
      const orderPayload = {
        items: paymentType === 'cart' ? items : [],
        address_id: addressId,
        payment_type: paymentType,
        ...(paymentType === 'direct' && { product_id: productId, quantity })
      }

      const orderResponse = await authenticatedFetch('/api/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      })
      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        setError(orderData.error || 'Failed to create order')
        setIsProcessing(false)
        return
      }

      let paymentHandled = false

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SNZPmHU5RD7fq8',
        order_id: orderData.razorpay_order_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        name: 'Spacecrafts Furniture',
        description: paymentType === 'direct' ? 'Product Purchase' : 'Cart Checkout',
        notes: {
          address: 'Spacecrafts Furniture, India'
        },
        handler: async (response) => {
          paymentHandled = true
          try {
            setPaymentState('verifying')
            setVerifyTimeout(false)

            // Show fallback link after 15 seconds
            const fallbackTimer = setTimeout(() => setVerifyTimeout(true), 15000)

            // Abort fetch after 30 seconds to prevent hanging forever
            const controller = new AbortController()
            const abortTimer = setTimeout(() => controller.abort(), 30000)

            console.log('[RazorpayPayment] Verifying payment:', response.razorpay_payment_id)

            const verifyBody = JSON.stringify({
              razorpay_order_id: orderData.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order_id
            })

            let verifyRes
            try {
              // Try authenticated fetch first
              verifyRes = await authenticatedFetch('/api/razorpay/verify-payment', {
                method: 'POST',
                signal: controller.signal,
                body: verifyBody
              })
            } catch (authFetchErr) {
              console.warn('[RazorpayPayment] authenticatedFetch failed, falling back to plain fetch:', authFetchErr.message)
              // Fallback: plain fetch without auth (verify-payment no longer requires user session)
              if (authFetchErr.name !== 'AbortError') {
                verifyRes = await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  signal: controller.signal,
                  body: verifyBody
                })
              } else {
                throw authFetchErr
              }
            } finally {
              clearTimeout(abortTimer)
              clearTimeout(fallbackTimer)
            }

            let verifyData
            try {
              verifyData = await verifyRes.json()
            } catch (parseErr) {
              console.error('[RazorpayPayment] Failed to parse verify response:', parseErr)
              // Payment likely succeeded on server even if response parsing failed
              window.location.href = `/orders/success?order_id=${orderData.order_id}`
              return
            }

            if (!verifyRes.ok) {
              console.error('[RazorpayPayment] Verification failed:', verifyData)
              setPaymentState(null)
              setError(verifyData.error || 'Payment verification failed')
              setIsProcessing(false)
              return
            }

            console.log('[RazorpayPayment] Payment verified successfully')
            setConfirmedAmount(orderData.amount || amount)
            setPaymentState('success')
            setTimeout(() => {
              window.location.href = `/orders/success?order_id=${orderData.order_id}`
            }, 2200)
          } catch (err) {
            console.error('[RazorpayPayment] Verification error:', err)
            if (err.name === 'AbortError') {
              // Timed out — payment likely went through, redirect to orders
              window.location.href = `/orders/success?order_id=${orderData.order_id}`
              return
            }
            setPaymentState(null)
            setError('Failed to verify payment. Please check your orders page.')
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentHandled) {
              setIsProcessing(false)
            }
          }
        },
        prefill: { name: orderData.customer_name, email: orderData.customer_email },
        theme: { color: '#222' }
      }

      if (window.Razorpay) {
        new window.Razorpay(options).open()
      } else {
        setError('Payment gateway not loaded. Please refresh.')
        setIsProcessing(false)
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setIsProcessing(false)
    }
  }

  if (!isOpen && !paymentState) return null

  // Show fullscreen success/verifying overlay
  if (paymentState) {
    return (
      <div className="rp-result-overlay">
        <div className="rp-result-card">
          {paymentState === 'verifying' ? (
            <>
              <div className="rp-result-icon verifying">
                <svg className="rp-result-spinner" width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeDasharray="100 60" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="rp-result-title">Verifying Payment</h2>
              <p className="rp-result-desc">Confirming your transaction with Razorpay. This will only take a moment.</p>
              <div className="rp-result-dots">
                <span className="rp-dot" /><span className="rp-dot" /><span className="rp-dot" />
              </div>
              {verifyTimeout && (
                <div style={{ marginTop: '24px' }}>
                  <p className="rp-result-desc" style={{ marginBottom: '12px' }}>Taking longer than expected? Your payment was received.</p>
                  <a href="/orders" style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', fontSize: '14px' }}>Check Order Status →</a>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rp-result-icon success">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="rp-check-path" />
                </svg>
              </div>
              <h2 className="rp-result-title">Payment Successful</h2>
              <p className="rp-result-desc">Your order has been confirmed. Redirecting you to your order details.</p>
              <div className="rp-result-amount">₹{Number(confirmedAmount || amount).toLocaleString('en-IN')}</div>
              <div className="rp-result-progress">
                <div className="rp-result-bar" />
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .rp-result-overlay {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(255,255,255,0.97);
            backdrop-filter: blur(20px);
            display: flex; align-items: center; justify-content: center;
            animation: rp-fadeIn 0.3s ease;
          }
          @keyframes rp-fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .rp-result-card {
            text-align: center; padding: 48px 40px; max-width: 420px; width: 90%;
          }
          .rp-result-icon {
            width: 88px; height: 88px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 28px;
          }
          .rp-result-icon.verifying {
            background: transparent;
          }
          .rp-result-icon.success {
            background: #1a1a1a;
            animation: rp-popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes rp-popIn { from { transform: scale(0); } to { transform: scale(1); } }
          .rp-result-spinner {
            animation: rp-spin 1s linear infinite;
          }
          @keyframes rp-spin { to { transform: rotate(360deg); } }
          .rp-check-path {
            stroke-dasharray: 30;
            stroke-dashoffset: 30;
            animation: rp-drawCheck 0.5s ease forwards 0.3s;
          }
          @keyframes rp-drawCheck { to { stroke-dashoffset: 0; } }
          .rp-result-title {
            font-family: 'Inter', sans-serif;
            font-size: 24px; font-weight: 700; color: #1a1a1a;
            margin: 0 0 10px; letter-spacing: -0.5px;
          }
          .rp-result-desc {
            font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 24px;
          }
          .rp-result-amount {
            font-size: 32px; font-weight: 800; color: #1a1a1a;
            margin-bottom: 28px; letter-spacing: -1px;
          }
          .rp-result-dots {
            display: flex; gap: 6px; justify-content: center;
          }
          .rp-dot {
            width: 6px; height: 6px; border-radius: 50%; background: #1a1a1a;
            animation: rp-bounce 1.4s infinite both;
          }
          .rp-dot:nth-child(2) { animation-delay: 0.16s; }
          .rp-dot:nth-child(3) { animation-delay: 0.32s; }
          @keyframes rp-bounce {
            0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
          .rp-result-progress {
            width: 200px; height: 3px; background: #e5e7eb;
            border-radius: 3px; margin: 0 auto; overflow: hidden;
          }
          .rp-result-bar {
            width: 100%; height: 100%; background: #1a1a1a;
            border-radius: 3px;
            animation: rp-progress 2s ease forwards;
          }
          @keyframes rp-progress { from { width: 0; } to { width: 100%; } }
        `}</style>
      </div>
    )
  }

  const itemCount = items.length || (paymentType === 'direct' ? 1 : 0)

  return (
    <div className="rp-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose() }}>
      <div className="rp-modal">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h2>Secure Checkout</h2>
              <span>Spacecrafts Furniture</span>
            </div>
          </div>
          <button className="rp-close" onClick={onClose} disabled={isProcessing}>✕</button>
        </div>

        {/* Body */}
        <div className="rp-body">
          {error && (
            <div className="rp-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              {error}
            </div>
          )}

          {/* Order info */}
          <div className="rp-order-info">
            <div className="rp-info-row">
              <span>Items</span>
              <span>{itemCount} {itemCount === 1 ? 'product' : 'products'}</span>
            </div>
            <div className="rp-info-row">
              <span>Payment via</span>
              <span>Razorpay</span>
            </div>
            <div className="rp-info-row">
              <span>Methods accepted</span>
              <span>UPI · Cards · Net Banking · Wallets</span>
            </div>
          </div>

          {amount > 0 && (
            <div className="rp-amount-box">
              <span>Amount to pay</span>
              <span className="rp-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Trust badges */}
          <div className="rp-trust">
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SSL Encrypted
            </div>
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Verified Merchant
            </div>
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secure Payment
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rp-footer">
          <button className="rp-cancel" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button className="rp-pay" onClick={handlePaymentClick} disabled={isProcessing}>
            {isProcessing ? (
              <><span className="rp-spinner"></span> Processing...</>
            ) : (
              <>Pay Now{amount > 0 ? ` · ₹${Number(amount).toLocaleString('en-IN')}` : ''}</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .rp-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center;
          justify-content: center; z-index: 9999; backdrop-filter: blur(2px);
        }
        .rp-modal {
          background: #fff; border-radius: 12px; width: 420px; max-width: 92vw;
          box-shadow: 0 20px 60px rgba(0,0,0,.25); animation: rpSlide .25s ease-out;
          overflow: hidden;
        }
        @keyframes rpSlide { from { transform: translateY(16px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

        /* Header */
        .rp-header {
          background: #222; color: #fff; padding: 16px 20px; display: flex; align-items: center;
          justify-content: space-between;
        }
        .rp-header-left { display: flex; align-items: center; gap: 12px; }
        .rp-logo {
          width: 36px; height: 36px; background: rgba(255,255,255,.12); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-header h2 { margin: 0; font-size: 15px; font-weight: 700; }
        .rp-header span { font-size: 11px; color: rgba(255,255,255,.6); }
        .rp-close {
          background: rgba(255,255,255,.1); border: none; color: #fff; width: 30px; height: 30px;
          border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: background .15s;
        }
        .rp-close:hover:not(:disabled) { background: rgba(255,255,255,.2); }
        .rp-close:disabled { opacity: .4; cursor: not-allowed; }

        /* Body */
        .rp-body { padding: 20px; }
        .rp-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 12px;
          border-radius: 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500;
        }
        .rp-order-info { margin-bottom: 16px; }
        .rp-info-row {
          display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px;
          border-bottom: 1px solid #f5f5f5; color: #555;
        }
        .rp-info-row:last-child { border-bottom: none; }
        .rp-info-row span:first-child { color: #999; }
        .rp-info-row span:last-child { font-weight: 600; color: #333; }

        .rp-amount-box {
          background: #f9fafb; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px;
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .rp-amount-box span:first-child { font-size: 13px; color: #888; }
        .rp-amount { font-size: 22px; font-weight: 800; color: #222; }

        .rp-trust { display: flex; gap: 8px; flex-wrap: wrap; }
        .rp-badge {
          display: flex; align-items: center; gap: 4px; padding: 5px 10px;
          background: #f9fafb; border: 1px solid #eee; border-radius: 20px;
          font-size: 11px; color: #666; font-weight: 500;
        }

        /* Footer */
        .rp-footer {
          padding: 16px 20px; border-top: 1px solid #eee; display: flex; gap: 10px;
          justify-content: flex-end; background: #fafafa;
        }
        .rp-cancel {
          padding: 10px 20px; background: #fff; border: 1px solid #ddd; border-radius: 6px;
          font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s;
        }
        .rp-cancel:hover:not(:disabled) { border-color: #bbb; color: #333; }
        .rp-cancel:disabled { opacity: .5; cursor: not-allowed; }
        .rp-pay {
          padding: 10px 28px; background: #222; color: #fff; border: none; border-radius: 6px;
          font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center;
          gap: 8px; transition: background .15s;
        }
        .rp-pay:hover:not(:disabled) { background: #000; }
        .rp-pay:disabled { background: #999; cursor: not-allowed; }
        .rp-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%; animation: rpSpin .6s linear infinite;
        }
        @keyframes rpSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
