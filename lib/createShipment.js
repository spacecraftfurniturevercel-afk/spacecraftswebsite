/**
 * lib/createShipment.js
 *
 * Shared helper: create a BigShip shipment for a confirmed order.
 *
 * TWO-PHASE flow:
 *   Phase 1 (auto, after payment):
 *     1. Add Order   → POST /api/order/add/single      → returns system_order_id
 *     2. Get Rates   → GET  /api/order/shipping/rates  → pick cheapest courier_id
 *     → Saves: bigship_order_id, courier_id, courier_name, shipping_status = 'order_placed'
 *
 *   Phase 2 (manual, when order is ready to ship — admin clicks "Ready to Ship"):
 *     3. Manifest    → POST /api/order/manifest/single  → confirms booking with courier
 *     4. Get AWB     → POST /api/shipment/data          → returns master_awb (tracking number)
 *     → Saves: tracking_number, shipping_status = 'manifested', status = 'processing'
 *
 * Called from:
 *  - app/api/razorpay/verify-payment/route.js (Phase 1, non-blocking, after payment confirmed)
 *  - app/api/bigship/create-order/route.js    (Phase 1, manual admin retry)
 *  - app/api/bigship/manifest/route.js        (Phase 2, admin "Ready to Ship" button)
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
    const errMsg = addResult.message || ''
    if (/already.?exists/i.test(errMsg)) {
      // BigShip already has this invoice_id (SF-{orderId}) — likely from a concurrent verify-payment
      // auto-trigger. Try to extract the existing system_order_id from the response data.
      const rawDataAE = typeof addResult.data === 'string' ? addResult.data : ''
      const aeMatch = rawDataAE.match(/system_order_id is (\d+)/i)
      if (!aeMatch) {
        // BigShip has the order but the response has no system_order_id.
        // Return a soft success so the customer doesn't see a 500.
        console.warn(`[createShipment] Order SF-${orderId} already exists in BigShip but system_order_id is missing from response. Manual check needed in BigShip dashboard.`)
        return {
          success: true,
          skipped: true,
          message: 'Order already exists in BigShip. The shipment was previously registered; admin can check BigShip dashboard.',
        }
      }
      // The earlier auto-trigger created the order — re-use its system_order_id
      console.log(`[createShipment] Order SF-${orderId} already in BigShip — reusing system_order_id: ${aeMatch[1]}`)
      addResult = { success: true, data: rawDataAE }
    } else {
      throw new Error(`BigShip add order failed: ${errMsg || JSON.stringify(addResult)}`)
    }
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

  // ── Save to DB: bigship_order_id + courier_id (Phase 1 complete) ───────────
  // Status stays 'confirmed' — manifest will be triggered manually when order is ready to ship
  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      bigship_order_id: String(systemOrderId),
      courier_id: courierId ? String(courierId) : null,
      courier_name: courierName || 'BigShip',
      shipping_status: 'order_placed',
      // status stays 'confirmed' — will change to 'processing' after manifest
    })
    .eq('id', orderId)

  if (updateErr) {
    console.error('[createShipment] Failed to update order in DB:', updateErr.message)
  }

  // ── Log shipping event ────────────────────────────────────────────────────
  try {
    await supabase.from('shipping_events').insert({
      order_id: orderId,
      status: 'ORDER_PLACED',
      awb_code: null,
      courier: courierName,
      raw_payload: {
        system_order_id: systemOrderId,
        courier_id: courierId,
        shipping_cost: shippingCost,
      },
      created_at: new Date().toISOString(),
    })
  } catch (evtErr) {
    console.warn('[createShipment] Could not insert shipping_event:', evtErr.message)
  }

  console.log('[createShipment] ✅ Phase 1 done for order', orderId, '— bigship:', systemOrderId, 'courier:', courierName, '| Awaiting manual manifest.')

  return {
    success: true,
    bigship_order_id: String(systemOrderId),
    courier_id: courierId,
    courier: courierName,
    shipping_cost: shippingCost,
    message: 'Order registered with BigShip. Click "Ready to Ship" in admin when order is packed.',
  }
}

/**
 * Phase 2 — Manifest + AWB
 * Called manually from admin when order is packed and ready for courier pickup.
 *
 * @param {string} orderId  - Internal Supabase order UUID
 * @param {object} supabase - Supabase client
 */
export async function manifestOrderForShipping(orderId, supabase) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new Error(`Order ${orderId} not found`)
  }

  if (!order.bigship_order_id) {
    throw new Error(`Order ${orderId} has no BigShip order ID. Run Phase 1 first.`)
  }

  if (order.tracking_number) {
    return {
      success: true,
      skipped: true,
      message: 'Already manifested',
      awb_code: order.tracking_number,
      courier: order.courier_name,
    }
  }

  const systemOrderId = order.bigship_order_id
  const courierId = order.courier_id ? Number(order.courier_id) : null

  // ── STEP 3: Manifest ──────────────────────────────────────────────────────
  console.log('[manifestOrder] STEP 3 — Manifesting', systemOrderId, 'courier_id:', courierId)
  const manifestResult = await manifestSingleOrder(systemOrderId, courierId)
  const manifestOk = !!manifestResult?.success
  console.log('[manifestOrder] STEP 3 done — success:', manifestOk, manifestResult?.message)

  if (!manifestOk) {
    throw new Error(`Manifest failed: ${manifestResult?.message || JSON.stringify(manifestResult)}`)
  }

  // ── STEP 4: Get AWB ───────────────────────────────────────────────────────
  let awbCode = null
  let courierName = order.courier_name || 'BigShip'
  try {
    console.log('[manifestOrder] STEP 4 — Fetching AWB for', systemOrderId)
    const awbResult = await getAWB(systemOrderId)
    if (awbResult.success && awbResult.data) {
      awbCode = awbResult.data.master_awb || null
      if (awbResult.data.courier_name) courierName = awbResult.data.courier_name
      console.log('[manifestOrder] STEP 4 done — AWB:', awbCode)
    } else {
      console.warn('[manifestOrder] STEP 4 — No AWB in response:', awbResult)
    }
  } catch (awbErr) {
    console.warn('[manifestOrder] STEP 4 AWB fetch failed (non-fatal):', awbErr.message)
  }

  // ── Update DB ─────────────────────────────────────────────────────────────
  await supabase
    .from('orders')
    .update({
      tracking_number: awbCode || null,
      courier_name: courierName,
      shipping_status: 'manifested',
      status: 'processing',
    })
    .eq('id', orderId)

  // ── Log shipping event ────────────────────────────────────────────────────
  try {
    await supabase.from('shipping_events').insert({
      order_id: orderId,
      status: 'MANIFESTED',
      awb_code: awbCode,
      courier: courierName,
      raw_payload: { system_order_id: systemOrderId, courier_id: courierId },
      created_at: new Date().toISOString(),
    })
  } catch (_) {}

  // ── Send shipment email to customer ───────────────────────────────────────
  sendShipmentCreatedEmails({
    order,
    awb: awbCode,
    courierName,
    systemOrderId,
    customerName: order.customer_name || '',
    customerEmail: order.customer_email || '',
  }).catch((e) => console.error('[manifestOrder] Email error:', e))

  console.log('[manifestOrder] ✅ Phase 2 done — AWB:', awbCode, 'courier:', courierName)

  return {
    success: true,
    awb_code: awbCode,
    courier: courierName,
    bigship_order_id: systemOrderId,
  }
}
