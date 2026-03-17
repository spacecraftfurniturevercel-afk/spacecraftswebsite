import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance with environment variables
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SNZPmHU5RD7fq8',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YBX0rkYcJ465F6wYyx3Q6Gqx'
})

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paise (e.g., 10000 for ₹100)
 * @param {string} currency - Currency code (default: 'INR')
 * @param {Object} options - Additional options (receipt, notes, etc.)
 * @returns {Promise<Object>} Razorpay order object
 */
export async function createRazorpayOrder(amount, currency = 'INR', options = {}) {
  try {
    const order = await razorpay.orders.create({
      amount, // in paise
      currency,
      payment_capture: 1, // Auto-capture payment
      receipt: options.receipt || `order_${Date.now()}`,
      notes: options.notes || {},
      ...options
    })
    return order
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    throw error
  }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} true if signature is valid
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YBX0rkYcJ465F6wYyx3Q6Gqx')
      .update(body)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export async function fetchPaymentDetails(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Payment fetch error:', error)
    throw error
  }
}

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
export async function fetchOrderDetails(orderId) {
  try {
    const order = await razorpay.orders.fetch(orderId)
    return order
  } catch (error) {
    console.error('Order fetch error:', error)
    throw error
  }
}

/**
 * Capture payment (for manual captures if needed)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount in paise
 * @returns {Promise<Object>} Captured payment
 */
export async function capturePayment(paymentId, amount) {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount)
    return payment
  } catch (error) {
    console.error('Payment capture error:', error)
    throw error
  }
}

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {Object} options - Refund options
 * @returns {Promise<Object>} Refund details
 */
export async function refundPayment(paymentId, options = {}) {
  try {
    const refund = await razorpay.payments.refund(paymentId, options)
    return refund
  } catch (error) {
    console.error('Refund error:', error)
    throw error
  }
}

/**
 * Format amount from rupees to paise
 * @param {number} amountInRupees - Amount in rupees
 * @returns {number} Amount in paise
 */
export function formatAmountToPaise(amountInRupees) {
  return Math.round(amountInRupees * 100)
}

/**
 * Format amount from paise to rupees
 * @param {number} amountInPaise - Amount in paise
 * @returns {number} Amount in rupees
 */
export function formatAmountToRupees(amountInPaise) {
  return amountInPaise / 100
}
