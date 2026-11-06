import { calculateRates, SHIPPING_DEFAULTS } from './bigship'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

function cheapestRate(rows) {
  if (!rows?.length) return null
  return rows.reduce((a, b) =>
    parseFloat(a.total_shipping_charges) < parseFloat(b.total_shipping_charges) ? a : b
  )
}

export function boxDetailsFromItems(items = []) {
  const totalWeight = items.reduce(
    (sum, it) => sum + (Number(it.shipping_weight) || 0) * (it.quantity || 1),
    0
  )
  const maxLength = Math.max(0, ...items.map((it) => Number(it.shipping_length) || 0))
  const maxWidth = Math.max(0, ...items.map((it) => Number(it.shipping_width) || 0))
  const maxHeight = Math.max(0, ...items.map((it) => Number(it.shipping_height) || 0))
  const totalBoxCount = items.reduce(
    (sum, it) => sum + (Number(it.shipping_box_count) || 1) * (it.quantity || 1),
    0
  )

  return [
    {
      deadWeight: totalWeight || SHIPPING_DEFAULTS.DEAD_WEIGHT,
      length: maxLength || SHIPPING_DEFAULTS.LENGTH,
      width: maxWidth || SHIPPING_DEFAULTS.WIDTH,
      height: maxHeight || SHIPPING_DEFAULTS.HEIGHT,
      boxCount: totalBoxCount || SHIPPING_DEFAULTS.BOX_COUNT,
    },
  ]
}

function fallbackQuote(invoiceAmount) {
  const estimatedCharge = invoiceAmount >= 50000 ? 0 : 199
  return {
    success: true,
    available: true,
    deliveryCharge: estimatedCharge,
    freeDelivery: estimatedCharge === 0,
    courierName: 'Standard Delivery',
    courierId: null,
    estimatedDays: 5,
    cod_available: true,
    cod_charge: estimatedCharge,
    allRates: [
      {
        courier_id: null,
        courier_name: 'Standard Delivery',
        total_shipping_charges: estimatedCharge,
        tat: 5,
      },
    ],
  }
}

/**
 * Server-side delivery quote. Never trust a client-sent charge.
 * invoiceAmount = product subtotal only (no GST, no shipping).
 */
export async function quoteDeliveryCharge({
  pincode,
  invoiceAmount,
  items = [],
  paymentType = 'Prepaid',
} = {}) {
  const pin = String(pincode || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, available: false, error: 'Valid 6-digit pincode required' }
  }

  const amount = Math.max(0, Number(invoiceAmount) || 0)

  if (!BIGSHIP_CONFIGURED) {
    return fallbackQuote(amount)
  }

  const pickupPincode = process.env.BIGSHIP_PICKUP_PINCODE || '400001'
  const boxDetails = boxDetailsFromItems(items)

  const [prepaidResult, codResult] = await Promise.all([
    calculateRates({
      shipmentCategory: SHIPPING_DEFAULTS.SHIPMENT_CATEGORY,
      paymentType: 'Prepaid',
      pickupPincode,
      destinationPincode: pin,
      shipmentInvoiceAmount: amount,
      boxDetails,
    }),
    calculateRates({
      shipmentCategory: SHIPPING_DEFAULTS.SHIPMENT_CATEGORY,
      paymentType: 'COD',
      pickupPincode,
      destinationPincode: pin,
      shipmentInvoiceAmount: amount,
      boxDetails,
    }),
  ])

  const cheapest = cheapestRate(prepaidResult.success ? prepaidResult.data : [])
  const codCheapest = cheapestRate(codResult.success ? codResult.data : [])

  if (!cheapest) {
    return {
      success: true,
      available: false,
      deliveryCharge: 0,
      freeDelivery: false,
      cod_available: false,
      cod_charge: 0,
      message: prepaidResult.message || 'No couriers available for this pincode',
    }
  }

  const prepaidCharge = Math.round(Number(cheapest.total_shipping_charges) || 0)
  const codCharge = codCheapest ? Math.round(Number(codCheapest.total_shipping_charges) || 0) : 0
  const charge = paymentType === 'COD' ? (codCheapest ? codCharge : prepaidCharge) : prepaidCharge

  if (paymentType === 'COD' && !codCheapest) {
    return {
      success: true,
      available: false,
      deliveryCharge: 0,
      freeDelivery: false,
      cod_available: false,
      cod_charge: 0,
      message: 'COD is not available for this pincode',
    }
  }

  return {
    success: true,
    available: true,
    deliveryCharge: charge,
    freeDelivery: charge === 0,
    courierName: cheapest.courier_name,
    courierId: cheapest.courier_id || null,
    courierType: cheapest.courier_type || null,
    estimatedDays: cheapest.tat || 5,
    billableWeight: cheapest.billable_weight || null,
    cod_available: !!codCheapest,
    cod_charge: codCharge,
    cod_courier_name: codCheapest?.courier_name || null,
    cod_estimated_days: codCheapest?.tat || 5,
    allRates: (prepaidResult.data || []).map((r) => ({
      courier_id: r.courier_id,
      courier_name: r.courier_name,
      courier_type: r.courier_type,
      total_shipping_charges: Math.round(r.total_shipping_charges),
      courier_charge: r.courier_charge,
      tat: r.tat,
      billable_weight: r.billable_weight,
      zone: r.zone,
    })),
  }
}

const PRODUCT_SHIPPING_SELECT =
  'id, name, price, discount_price, stock, shipping_weight, shipping_length, shipping_width, shipping_height, shipping_box_count'

export async function resolveServerDeliveryCharge({
  supabase,
  profileId,
  addressId,
  items,
  invoiceAmount,
  paymentType = 'Prepaid',
}) {
  const { data: address, error: addrErr } = await supabase
    .from('addresses')
    .select('id, postal_code')
    .eq('id', addressId)
    .eq('profile_id', profileId)
    .single()

  if (addrErr || !address) {
    return { error: 'Address not found', status: 404 }
  }

  const quote = await quoteDeliveryCharge({
    pincode: address.postal_code,
    invoiceAmount,
    items,
    paymentType,
  })

  if (!quote.success) {
    return { error: quote.error || 'Failed to calculate delivery', status: 400 }
  }
  if (!quote.available) {
    return {
      error: quote.message || 'Delivery is not available for this pincode',
      status: 400,
    }
  }

  return { deliveryCharge: quote.deliveryCharge, quote, address }
}

export { PRODUCT_SHIPPING_SELECT }
