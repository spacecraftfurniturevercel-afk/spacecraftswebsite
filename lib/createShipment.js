/**
 * lib/createShipment.js
 *
 * Shared helper: create a BigShip shipment for a confirmed order.
 *
 * Full flow per BigShip docs:
 *   1. Add Order   → POST /api/order/add/single      → returns system_order_id
 *   2. Get Rates   → GET  /api/order/shipping/rates  → pick cheapest courier_id
 *   3. Manifest    → POST /api/order/manifest/single  → confirms booking
 *   4. Get AWB     → POST /api/shipment/data          → returns master_awb
 *   5. Save all to DB: bigship_order_id, courier_id, tracking_number (AWB), courier_name, shipping_status
 *
 * Called from:
 *  - app/api/razorpay/verify-payment/route.js (non-blocking, after payment confirmed)
 *  - app/api/bigship/create-order/route.js    (manual admin trigger)
 *
 * @param {string} orderId       - Internal Supabase order UUID
 * @param {object} supabase      - Supabase client (service-role OK, user-scoped OK)
 * @returns {object}             - { success, bigship_order_id, courier_id, awb_code, courier }
 */

import {
  createBigShipOrder,
  getShippingRates,
  manifestSingleOrder,
  getAWB,
} from './bigship'
import { sendShipmentCreatedEmails } from './email'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY &&
  process.env.BIGSHIP_PICKUP_WAREHOUSE_ID
)

export async function createShipmentForOrder(orderId, supabase) {
  if (!BIGSHIP_CONFIGURED) {
    console.log('[createShipment] BigShip env not fully configured — skipping shipment creation')
    return { success: false, demo_mode: true, message: 'BigShip not configured' }
  }

  // ── Fetch order ────────────────────────────────────────────────────────────
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new Error(`Order ${orderId} not found: ${orderErr?.message}`)
  }

  // Idempotency: if shipment already created, skip
  if (order.bigship_order_id) {
    console.log('[createShipment] Shipment already exists for order', orderId, '—', order.bigship_order_id)
    return {
      success: true,
      skipped: true,
      bigship_order_id: order.bigship_order_id,
      awb_code: order.tracking_number,
      courier: order.courier_name,
    }
  }

  // ── Fetch order items ──────────────────────────────────────────────────────
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  // ── Fetch delivery address ─────────────────────────────────────────────────
  let address = null
  if (order.address_id) {
    const { data: addr } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.address_id)
      .single()
    address = addr
  }

  if (!address) {
    throw new Error(`Delivery address not found for order ${orderId}`)
  }

  // ── Fetch customer profile ─────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', order.profile_id)
    .single()

  const fullName = profile?.full_name || address.full_name || 'Customer'
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer'
  const customerEmail = profile?.email || ''
  const customerPhone = profile?.phone || address.phone || ''
  if (!customerPhone) {
    throw new Error(`No phone number found for order ${orderId}. Customer must have a phone number to create shipment.`)
  }
  const pincode = String(address.postal_code || address.pincode || '')

  if (!pincode || pincode.length !== 6) {
    throw new Error(`Invalid pincode "${pincode}" on address for order ${orderId}`)
  }

  // ── STEP 1: Add Order to BigShip ───────────────────────────────────────────
  console.log('[createShipment] STEP 1 — Adding order to BigShip for', orderId)
  const addResult = await createBigShipOrder({
    orderId: order.id,
    customerFirstName: firstName,
    customerLastName: lastName,
    customerEmail,
    customerPhone,
    addressLine1: address.line1 || address.address_line1 || '',
    addressLine2: address.line2 || address.address_line2 || '',
    landmark: address.landmark || '',
    pincode,
    items: (orderItems || []).map((item) => ({
      name: item.name,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      shipping_weight: item.shipping_weight || null,
      shipping_length: item.shipping_length || null,
      shipping_width: item.shipping_width || null,
      shipping_height: item.shipping_height || null,
      weight: item.weight || null,
      hsn: item.hsn || '',
    })),
    // shipment_invoice_amount = product cost only (no GST, no shipping) per BigShip docs
    totalAmount: order.subtotal || order.total,
    paymentMethod: 'Prepaid',
  })

  if (!addResult.success) {
    throw new Error(`BigShip add order failed: ${addResult.message || JSON.stringify(addResult)}`)
  }

  // Extract system_order_id from response string like "system_order_id is 1000252960"
  const rawData = addResult.data || ''
  const match = typeof rawData === 'string' ? rawData.match(/system_order_id is (\d+)/i) : null
  const systemOrderId = match ? match[1] : String(rawData)

  if (!systemOrderId || systemOrderId === 'undefined') {
    throw new Error(`Could not extract system_order_id from BigShip response: ${rawData}`)
  }

  console.log('[createShipment] STEP 1 done — system_order_id:', systemOrderId)

  // ── STEP 2: Get Shipping Rates → cheapest courier ─────────────────────────
  let courierId = null
  let courierName = null
  let shippingCost = null

  try {
    console.log('[createShipment] STEP 2 — Fetching shipping rates for', systemOrderId)
    const ratesResult = await getShippingRates('B2C', systemOrderId)
    if (ratesResult.success && ratesResult.data?.length > 0) {
      const cheapest = ratesResult.data.reduce((a, b) =>
        a.total_shipping_charges < b.total_shipping_charges ? a : b
      )
      courierId = cheapest.courier_id
      courierName = cheapest.courier_name
      shippingCost = cheapest.total_shipping_charges
      console.log('[createShipment] STEP 2 done — courier:', courierName, 'id:', courierId, 'cost:', shippingCost)
    } else {
      console.warn('[createShipment] STEP 2 — No rates returned, will manifest without courier_id')
    }
  } catch (ratesErr) {
    console.warn('[createShipment] STEP 2 failed (non-fatal):', ratesErr.message)
  }

  // ── STEP 3: Manifest Order (CONFIRMS BOOKING) ─────────────────────────────
  let manifestOk = false
  try {
    console.log('[createShipment] STEP 3 — Manifesting order', systemOrderId, 'courier_id:', courierId)
    const manifestResult = await manifestSingleOrder(systemOrderId, courierId)
    manifestOk = !!manifestResult?.success
    console.log('[createShipment] STEP 3 done — manifest success:', manifestOk, manifestResult?.message)
  } catch (manifestErr) {
    console.warn('[createShipment] STEP 3 manifest failed (non-fatal):', manifestErr.message)
  }

  // ── STEP 4: Get AWB (Tracking Number) ────────────────────────────────────
  let awbCode = null
  try {
    console.log('[createShipment] STEP 4 — Fetching AWB for', systemOrderId)
    const awbResult = await getAWB(systemOrderId)
    if (awbResult.success && awbResult.data) {
      awbCode = awbResult.data.master_awb || null
      // Prefer courier name from AWB response (more accurate)
      if (awbResult.data.courier_name) {
        courierName = awbResult.data.courier_name
      }
      console.log('[createShipment] STEP 4 done — AWB:', awbCode, 'courier:', courierName)
    } else {
      console.warn('[createShipment] STEP 4 — No AWB in response:', awbResult)
    }
  } catch (awbErr) {
    console.warn('[createShipment] STEP 4 AWB fetch failed (non-fatal):', awbErr.message)
  }

  // ── Update orders table ────────────────────────────────────────────────────
  const newStatus = manifestOk ? 'processing' : 'confirmed'
  const shippingStatus = manifestOk ? 'manifested' : 'order_placed'

  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      bigship_order_id: String(systemOrderId),
      courier_id: courierId ? String(courierId) : null,   // saved for future manifest/re-manifest
      tracking_number: awbCode || null,
      courier_name: courierName || 'BigShip',
      shipping_status: shippingStatus,
      status: newStatus,
    })
    .eq('id', orderId)

  if (updateErr) {
    console.error('[createShipment] Failed to update order in DB:', updateErr.message)
    // Non-fatal: shipment was created in BigShip, just DB update failed
  }

  // ── Log shipping event ────────────────────────────────────────────────────
  try {
    await supabase.from('shipping_events').insert({
      order_id: orderId,
      status: shippingStatus.toUpperCase(),
      awb_code: awbCode,
      courier: courierName,
      raw_payload: {
        system_order_id: systemOrderId,
        courier_id: courierId,
        shipping_cost: shippingCost,
        manifest_ok: manifestOk,
      },
      created_at: new Date().toISOString(),
    })
  } catch (evtErr) {
    console.warn('[createShipment] Could not insert shipping_event:', evtErr.message)
  }

  // ── Send shipment emails (non-blocking) ───────────────────────────────────
  sendShipmentCreatedEmails({
    order,
    awb: awbCode,
    courierName: courierName || 'BigShip',
    shippingCost,
    systemOrderId,
    customerName: fullName,
    customerEmail,
  }).catch((e) => console.error('[createShipment] Shipment email error:', e))

  console.log('[createShipment] ✅ Done for order', orderId, '— bigship:', systemOrderId, 'AWB:', awbCode)

  return {
    success: true,
    bigship_order_id: String(systemOrderId),
    courier_id: courierId,
    awb_code: awbCode,
    courier: courierName,
    shipping_cost: shippingCost,
    manifest_ok: manifestOk,
  }
}
