import axios from 'axios'

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external'

let cachedToken = null
let tokenExpiry = 0

/**
 * Get Shiprocket auth token (cached for 10 days)
 */
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD env vars.')
  }

  const res = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email,
    password
  })

  cachedToken = res.data.token
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 // 9 days
  return cachedToken
}

/**
 * Make authenticated request to Shiprocket API
 */
async function shiprocketRequest(method, endpoint, data = null) {
  const token = await getToken()
  const config = {
    method,
    url: `${SHIPROCKET_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
  if (data) {
    config.data = data
  }
  const res = await axios(config)
  return res.data
}

/**
 * Create a Shiprocket order after payment is confirmed
 */
export async function createShiprocketOrder({
  orderId,
  orderDate,
  customerName,
  customerEmail,
  customerPhone,
  address,
  city,
  state,
  pincode,
  country = 'India',
  items,
  subtotal,
  paymentMethod = 'Prepaid'
}) {
  const orderItems = items.map(item => ({
    name: item.name,
    sku: item.sku || `SKU-${item.product_id}`,
    units: item.quantity,
    selling_price: item.unit_price,
    discount: 0,
    tax: 0,
    hsn: item.hsn || ''
  }))

  const totalWeight = items.reduce((w, item) => w + (item.weight || 0.5) * item.quantity, 0)

  const payload = {
    order_id: `SF-${orderId}`,
    order_date: orderDate || new Date().toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: customerName,
    billing_last_name: '',
    billing_address: address,
    billing_city: city,
    billing_pincode: pincode,
    billing_state: state,
    billing_country: country,
    billing_email: customerEmail,
    billing_phone: customerPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: paymentMethod,
    sub_total: subtotal,
    length: 30,
    breadth: 30,
    height: 30,
    weight: Math.max(totalWeight, 0.5)
  }

  return shiprocketRequest('post', '/orders/create/adhoc', payload)
}

/**
 * Get tracking data for a shipment
 */
export async function getShipmentTracking(shipmentId) {
  return shiprocketRequest('get', `/courier/track/shipment/${shipmentId}`)
}

/**
 * Get tracking by AWB (Air Waybill) number
 */
export async function getTrackingByAWB(awbCode) {
  return shiprocketRequest('get', `/courier/track/awb/${awbCode}`)
}

/**
 * Get tracking by order ID
 */
export async function getTrackingByOrderId(orderId) {
  return shiprocketRequest('get', `/courier/track?order_id=${orderId}`)
}

/**
 * Check pincode serviceability
 */
export async function checkServiceability(pickupPincode, deliveryPincode, weight = 0.5) {
  return shiprocketRequest('get', `/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=0`)
}

/**
 * Generate AWB (assign courier)
 */
export async function generateAWB(shipmentId, courierId) {
  return shiprocketRequest('post', '/courier/assign/awb', {
    shipment_id: shipmentId,
    courier_id: courierId
  })
}

/**
 * Request pickup
 */
export async function requestPickup(shipmentId) {
  return shiprocketRequest('post', '/courier/generate/pickup', {
    shipment_id: [shipmentId]
  })
}

/**
 * Cancel a Shiprocket order
 */
export async function cancelOrder(orderIds) {
  return shiprocketRequest('post', '/orders/cancel', {
    ids: Array.isArray(orderIds) ? orderIds : [orderIds]
  })
}

/**
 * Get all courier partners available for a shipment
 */
export async function getCourierPartners(pickupPincode, deliveryPincode, weight, codAmount = 0) {
  return shiprocketRequest('get', `/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${codAmount}`)
}

/**
 * Normalize Shiprocket tracking status to a step number (0-5)
 */
export function getTrackingStep(status) {
  const statusMap = {
    'NEW': 0,
    'READY TO SHIP': 0,
    'PICKUP SCHEDULED': 1,
    'PICKUP GENERATED': 1,
    'PICKED UP': 1,
    'IN TRANSIT': 2,
    'SHIPPED': 2,
    'REACHED AT DESTINATION HUB': 3,
    'OUT FOR DELIVERY': 3,
    'DELIVERED': 4,
    'CANCELLED': -1,
    'RTO INITIATED': -2,
    'RTO DELIVERED': -2,
    'UNDELIVERED': -3
  }
  const normalized = (status || '').toUpperCase().trim()
  return statusMap[normalized] ?? 0
}

/**
 * Map Shiprocket status to human-readable format
 */
export function formatTrackingStatus(status) {
  const statusLabels = {
    'NEW': 'Order Placed',
    'READY TO SHIP': 'Ready to Ship',
    'PICKUP SCHEDULED': 'Pickup Scheduled',
    'PICKUP GENERATED': 'Pickup Requested',
    'PICKED UP': 'Picked Up',
    'IN TRANSIT': 'In Transit',
    'SHIPPED': 'Shipped',
    'REACHED AT DESTINATION HUB': 'Reached Destination',
    'OUT FOR DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'RTO INITIATED': 'Return Initiated',
    'RTO DELIVERED': 'Returned to Seller',
    'UNDELIVERED': 'Delivery Failed'
  }
  return statusLabels[(status || '').toUpperCase().trim()] || status
}
