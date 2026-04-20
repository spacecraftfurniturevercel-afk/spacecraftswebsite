/**
 * BigShip Shipping API Integration
 * Base URL: https://api.bigship.in/
 * API Docs: Full API documentation provided by BigShip team.
 * Token expires every 12 hours — auto-refreshed and cached.
 * Rate Limit: 100 requests per minute per IP address.
 */

const BIGSHIP_BASE_URL = 'https://api.bigship.in'

// ─── Hardcoded Shipping Defaults ─────────────────────────────────────────────
// Weight and dimensions are hardcoded until actual product data is available.
// TODO: Replace with real product weight/dimensions when provided by client.
export const SHIPPING_DEFAULTS = {
  DEAD_WEIGHT: 5,           // kg
  LENGTH: 30,               // cm
  WIDTH: 20,                // cm
  HEIGHT: 20,               // cm
  BOX_COUNT: 1,
  SHIPMENT_CATEGORY: 'B2C',
  PAYMENT_TYPE: 'Prepaid',
}

let cachedToken = null
let tokenExpiry = 0

// ─── Authentication ─────────────────────────────────────────────────────────

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const userName = process.env.BIGSHIP_USER_NAME
  const password = process.env.BIGSHIP_PASSWORD
  const accessKey = process.env.BIGSHIP_ACCESS_KEY

  if (!userName || !password || !accessKey) {
    throw new Error(
      'BigShip credentials not configured. Set BIGSHIP_USER_NAME, BIGSHIP_PASSWORD, and BIGSHIP_ACCESS_KEY env vars.'
    )
  }

  const res = await fetch(`${BIGSHIP_BASE_URL}/api/login/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      password: password,
      access_key: accessKey,
    }),
  })

  const json = await res.json()

  if (!json.success || !json.data?.token) {
    throw new Error(json.message || 'BigShip login failed')
  }

  cachedToken = json.data.token
  // Token valid for 12h — refresh at 11h to be safe
  tokenExpiry = Date.now() + 11 * 60 * 60 * 1000
  return cachedToken
}

async function bigshipRequest(method, endpoint, body = null, params = null) {
  const token = await getToken()

  let url = `${BIGSHIP_BASE_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    url += `?${qs}`
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  const json = await res.json()

  if (res.status === 401) {
    // Token expired mid-request — force refresh and retry once
    cachedToken = null
    tokenExpiry = 0
    const freshToken = await getToken()
    options.headers.Authorization = `Bearer ${freshToken}`
    const retryRes = await fetch(url, options)
    return retryRes.json()
  }

  return json
}

// ─── Payment Categories ─────────────────────────────────────────────────────

export async function getPaymentCategories(shipmentCategory = 'b2c') {
  return bigshipRequest('GET', '/api/payment/category', null, {
    shipment_category: shipmentCategory,
  })
}

// ─── Courier List ────────────────────────────────────────────────────────────

export async function getCourierList(shipmentCategory = 'b2c') {
  return bigshipRequest('GET', '/api/courier/get/all', null, {
    shipment_category: shipmentCategory,
  })
}

// ─── Wallet Balance ──────────────────────────────────────────────────────────

export async function getWalletBalance() {
  return bigshipRequest('GET', '/api/Wallet/balance/get')
}

// ─── Warehouse ───────────────────────────────────────────────────────────────

export async function addWarehouse({
  addressLine1,
  addressLine2 = '',
  addressLandmark = '',
  addressPincode,
  contactNumberPrimary,
}) {
  return bigshipRequest('POST', '/api/warehouse/add', {
    address_line1: addressLine1,
    address_line2: addressLine2,
    address_landmark: addressLandmark,
    address_pincode: Number(addressPincode),
    contact_number_primary: contactNumberPrimary,
  })
}

export async function getWarehouseList(pageIndex = 1, pageSize = 10) {
  return bigshipRequest('GET', '/api/warehouse/get/list', null, {
    page_index: pageIndex,
    page_size: pageSize,
  })
}

// ─── Add Single Order (B2C) ─────────────────────────────────────────────────

/**
 * Sanitise a name field (first_name / last_name):
 * - Only alphabets, dots and spaces allowed
 * - Must be 3–25 characters
 */
function sanitiseName(raw, fallback) {
  const cleaned = String(raw || fallback || '')
    .replace(/[^a-zA-Z. ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  // Pad to minimum 3 chars if needed; truncate to 25
  const padded = cleaned.length < 3 ? (cleaned + ' ' + fallback).trim().replace(/[^a-zA-Z. ]/g, '').slice(0, 25) : cleaned.slice(0, 25)
  return padded.length >= 3 ? padded : fallback.slice(0, 25)
}

/**
 * Sanitise address_line1: 10–50 chars, alphanumeric + spaces + ' . , - /
 */
function sanitiseAddress(raw, minLen = 10, maxLen = 50) {
  const cleaned = String(raw || '')
    .replace(/[^a-zA-Z0-9 '.,\-/]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  // Pad to minimum length if too short
  const padded = cleaned.length < minLen ? (cleaned + ' Spacecrafts India').trim() : cleaned
  return padded.slice(0, maxLen)
}

/**
 * Sanitise product_name: alphabets, spaces, - , /
 */
function sanitiseProductName(raw) {
  return String(raw || 'Furniture Product')
    .replace(/[^a-zA-Z0-9 ,\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'Furniture Product'
}

export async function addSingleOrder({
  pickupLocationId,
  returnLocationId,
  consignee,
  orderDetail,
}) {
  // BigShip requires invoice_date in UTC ISO format
  const today = new Date().toISOString()

  const paymentType = orderDetail.paymentType || 'Prepaid'
  const isCod = paymentType === 'COD'

  const payload = {
    shipment_category: 'b2c',
    warehouse_detail: {
      pickup_location_id: Number(pickupLocationId),
      return_location_id: Number(returnLocationId),
    },
    consignee_detail: {
      first_name: sanitiseName(consignee.firstName, 'Customer'),
      last_name: sanitiseName(consignee.lastName, 'Customer'),
      company_name: consignee.companyName || '',
      contact_number_primary: String(consignee.phone).replace(/\D/g, '').slice(-10),
      contact_number_secondary: consignee.phoneSecondary ? String(consignee.phoneSecondary).replace(/\D/g, '').slice(-10) : '',
      email_id: consignee.email || '',
      consignee_address: {
        address_line1: sanitiseAddress(consignee.addressLine1, 10, 50),
        address_line2: sanitiseAddress(consignee.addressLine2 || '', 0, 50),
        address_landmark: sanitiseAddress(consignee.landmark || '', 0, 50),
        pincode: String(consignee.pincode),
      },
    },
    order_detail: {
      invoice_date: today,
      invoice_id: String(orderDetail.invoiceId),
      payment_type: paymentType,
      shipment_invoice_amount: orderDetail.shipmentInvoiceAmount,
      // For COD: must be > 0 and ≤ shipment_invoice_amount; for Prepaid: must be 0
      total_collectable_amount: isCod ? Math.min(orderDetail.totalCollectableAmount || orderDetail.shipmentInvoiceAmount, orderDetail.shipmentInvoiceAmount) : 0,
      box_details: orderDetail.boxDetails.map((box) => {
        const boxInvoice = box.invoiceAmount || orderDetail.shipmentInvoiceAmount
        const boxCollectable = isCod ? (box.collectableAmount || boxInvoice) : 0
        return {
          each_box_dead_weight: Math.max(0.1, box.deadWeight || 1),
          each_box_length: Math.max(1, box.length || 10),
          each_box_width: Math.max(1, box.width || 10),
          each_box_height: Math.max(1, box.height || 10),
          each_box_invoice_amount: boxInvoice,
          each_box_collectable_amount: boxCollectable,
          box_count: 1, // B2C must always be 1
          product_details: box.products.map((p) => ({
            product_category: p.category || 'Others',
            product_sub_category: p.subCategory || '',
            product_name: sanitiseProductName(p.name),
            product_quantity: Math.max(1, p.quantity || 1),
            each_product_invoice_amount: p.invoiceAmount || 0,
            each_product_collectable_amount: isCod ? (p.collectableAmount || p.invoiceAmount || 0) : 0,
            hsn: String(p.hsn || '').replace(/\D/g, ''), // only numbers allowed
          })),
        }
      }),
      ewaybill_number: orderDetail.ewaybillNumber || '',
      document_detail: {
        invoice_document_file: orderDetail.invoiceDocumentFile || '',
        ewaybill_document_file: orderDetail.ewaybillDocumentFile || '',
      },
    },
  }

  return bigshipRequest('POST', '/api/order/add/single', payload)
}

// ─── Add Heavy Order (B2B) ──────────────────────────────────────────────────

export async function addHeavyOrder({
  pickupLocationId,
  returnLocationId,
  consignee,
  orderDetail,
}) {
  const payload = {
    shipment_category: 'b2b',
    warehouse_detail: {
      pickup_location_id: Number(pickupLocationId),
      return_location_id: Number(returnLocationId),
    },
    consignee_detail: {
      first_name: consignee.firstName,
      last_name: consignee.lastName,
      company_name: consignee.companyName || '',
      contact_number_primary: consignee.phone,
      contact_number_secondary: consignee.phoneSecondary || '',
      email_id: consignee.email || '',
      consignee_address: {
        address_line1: consignee.addressLine1,
        address_line2: consignee.addressLine2 || '',
        address_landmark: consignee.landmark || '',
        pincode: String(consignee.pincode),
      },
    },
    order_detail: {
      invoice_date: orderDetail.invoiceDate || new Date().toISOString(),
      invoice_id: String(orderDetail.invoiceId),
      payment_type: orderDetail.paymentType || 'Prepaid',
      shipment_invoice_amount: orderDetail.shipmentInvoiceAmount,
      total_collectable_amount: orderDetail.totalCollectableAmount || 0,
      box_details: orderDetail.boxDetails.map((box) => ({
        each_box_dead_weight: box.deadWeight,
        each_box_length: box.length,
        each_box_width: box.width,
        each_box_height: box.height,
        each_box_invoice_amount: box.invoiceAmount || 0,
        each_box_collectable_amount: box.collectableAmount || 0,
        box_count: box.boxCount || 1,
        product_details: box.products.map((p) => ({
          product_category: p.category || 'Others',
          product_sub_category: p.subCategory || '',
          product_name: p.name,
          product_quantity: p.quantity,
          each_product_invoice_amount: p.invoiceAmount || 0,
          each_product_collectable_amount: p.collectableAmount || 0,
          hsn: p.hsn || '',
        })),
      })),
      ewaybill_number: orderDetail.ewaybillNumber || '',
      document_detail: {
        invoice_document_file: orderDetail.invoiceDocumentFile || '',
        ewaybill_document_file: orderDetail.ewaybillDocumentFile || '',
      },
    },
  }

  return bigshipRequest('POST', '/api/order/add/heavy', payload)
}

// ─── Manifest ────────────────────────────────────────────────────────────────

export async function manifestSingleOrder(systemOrderId, courierId = null) {
  const body = { system_order_id: Number(systemOrderId) }
  if (courierId) body.courier_id = Number(courierId)
  return bigshipRequest('POST', '/api/order/manifest/single', body)
}

export async function manifestHeavyOrder(systemOrderId, courierId, riskType = 'OwnerRisk') {
  return bigshipRequest('POST', '/api/order/manifest/heavy', {
    system_order_id: Number(systemOrderId),
    courier_id: Number(courierId),
    risk_type: riskType,
  })
}

// ─── AWB / Label / Manifest Downloads ────────────────────────────────────────

/**
 * @param {number} shipmentDataId - 1=AWB, 2=Label, 3=Manifest
 * @param {string|number} systemOrderId
 */
export async function getShipmentData(shipmentDataId, systemOrderId) {
  return bigshipRequest('POST', '/api/shipment/data', null, {
    shipment_data_id: shipmentDataId,
    system_order_id: systemOrderId,
  })
}

export async function getAWB(systemOrderId) {
  return getShipmentData(1, systemOrderId)
}

export async function downloadLabel(systemOrderId) {
  return getShipmentData(2, systemOrderId)
}

export async function downloadManifest(systemOrderId) {
  return getShipmentData(3, systemOrderId)
}

// ─── Cancel AWB ──────────────────────────────────────────────────────────────

export async function cancelAWB(awbNumbers) {
  const awbs = Array.isArray(awbNumbers) ? awbNumbers : [awbNumbers]
  return bigshipRequest('PUT', '/api/order/cancel', awbs)
}

// ─── Shipping Rates ──────────────────────────────────────────────────────────

export async function getShippingRates(shipmentCategory, systemOrderId, riskType = null) {
  const params = {
    shipment_category: shipmentCategory,
    system_order_id: systemOrderId,
  }
  if (riskType) params.risk_type = riskType
  return bigshipRequest('GET', '/api/order/shipping/rates', null, params)
}

// ─── Rate Calculator ─────────────────────────────────────────────────────────

// Couriers that appear in the public calculator but are NOT available on this BigShip account.
// Add courier names here (case-insensitive regex) if they appear in calculator but can't be booked.
const CALCULATOR_EXCLUDED_COURIERS = /amazon/i

export async function calculateRates({
  shipmentCategory = 'B2C',
  paymentType = 'Prepaid',
  pickupPincode,
  destinationPincode,
  shipmentInvoiceAmount,
  riskType = '',
  boxDetails,
}) {
  const result = await bigshipRequest('POST', '/api/calculator', {
    shipment_category: shipmentCategory,
    payment_type: paymentType,
    pickup_pincode: Number(pickupPincode),
    destination_pincode: Number(destinationPincode),
    shipment_invoice_amount: shipmentInvoiceAmount,
    risk_type: riskType,
    box_details: boxDetails.map((b) => ({
      each_box_dead_weight: b.deadWeight,
      each_box_length: b.length,
      each_box_width: b.width,
      each_box_height: b.height,
      box_count: b.boxCount || 1,
    })),
  })
  // Filter out couriers not bookable on this account before returning
  if (result?.data?.length) {
    result.data = result.data.filter(r => !CALCULATOR_EXCLUDED_COURIERS.test(r.courier_name || ''))
  }
  return result
}

// ─── Tracking ────────────────────────────────────────────────────────────────

/**
 * @param {'lrn'|'awb'} trackingType
 * @param {string} trackingId
 */
export async function getTrackingDetails(trackingType, trackingId) {
  return bigshipRequest('GET', '/api/tracking', null, {
    tracking_type: trackingType,
    tracking_id: trackingId,
  })
}

// ─── Courier Transporter Ids ─────────────────────────────────────────────────

export async function getCourierTransporterIds(courierId = null) {
  const params = {}
  if (courierId) params.courier_id = courierId
  return bigshipRequest('GET', '/api/courier/get/transport/list', null, Object.keys(params).length ? params : null)
}

// ─── Helper: Create full B2C shipment from an internal order ─────────────────

export async function createBigShipOrder({
  orderId,
  customerFirstName,
  customerLastName,
  customerEmail,
  customerPhone,
  addressLine1,
  addressLine2,
  landmark,
  pincode,
  items,
  totalAmount,
  paymentMethod = 'Prepaid',
}) {
  const pickupLocationId = Number(process.env.BIGSHIP_PICKUP_WAREHOUSE_ID)
  const returnLocationId = Number(process.env.BIGSHIP_RETURN_WAREHOUSE_ID || process.env.BIGSHIP_PICKUP_WAREHOUSE_ID)

  if (!pickupLocationId) {
    throw new Error('BIGSHIP_PICKUP_WAREHOUSE_ID env var not set')
  }

  // Calculate total weight and build product details
  const products = items.map((item) => ({
    category: 'Others',
    subCategory: '',
    name: item.name,
    quantity: item.quantity,
    invoiceAmount: item.unit_price * item.quantity,
    collectableAmount: paymentMethod === 'COD' ? item.unit_price * item.quantity : 0,
    hsn: item.hsn || '',
  }))

  const totalWeight = items.reduce(
    (w, item) => w + (item.shipping_weight || item.weight || SHIPPING_DEFAULTS.DEAD_WEIGHT) * item.quantity,
    0
  )

  // Use per-product shipping dimensions if available, otherwise use SHIPPING_DEFAULTS
  const maxLength = Math.max(...items.map(i => i.shipping_length || SHIPPING_DEFAULTS.LENGTH))
  const maxWidth = Math.max(...items.map(i => i.shipping_width || SHIPPING_DEFAULTS.WIDTH))
  const maxHeight = Math.max(...items.map(i => i.shipping_height || SHIPPING_DEFAULTS.HEIGHT))

  const boxDetails = [
    {
      deadWeight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      invoiceAmount: totalAmount,
      collectableAmount: paymentMethod === 'COD' ? totalAmount : 0,
      boxCount: 1,
      products,
    },
  ]

  const result = await addSingleOrder({
    pickupLocationId,
    returnLocationId,
    consignee: {
      firstName: customerFirstName,
      lastName: customerLastName,
      email: customerEmail,
      phone: customerPhone,
      addressLine1,
      addressLine2: addressLine2 || '',
      landmark: landmark || '',
      pincode,
    },
    orderDetail: {
      invoiceId: `SF-${orderId}`,
      paymentType: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      shipmentInvoiceAmount: totalAmount,
      totalCollectableAmount: paymentMethod === 'COD' ? totalAmount : 0,
      boxDetails,
    },
  })

  return result
}
