import { NextResponse } from 'next/server'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

/**
 * GET /api/delivery-charges?pincode=600001&amount=15000&weight=5&length=30&width=20&height=20
 * Fetch delivery charges from BigShip Calculate Rates API (POST /api/calculator).
 * Accepts per-product weight/dimensions; falls back to SHIPPING_DEFAULTS when not provided.
 * Returns cheapest courier option with charges, courier_id, and TAT.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')
    const amount = parseFloat(searchParams.get('amount') || '5000')
    // Per-product weight/dimensions — passed from product data, falls back to SHIPPING_DEFAULTS
    const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')) : null
    const length = searchParams.get('length') ? parseInt(searchParams.get('length')) : null
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')) : null
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')) : null
    const boxCount = searchParams.get('box_count') ? parseInt(searchParams.get('box_count')) : null

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: 'Valid 6-digit pincode required' }, { status: 400 })
    }

    if (!BIGSHIP_CONFIGURED) {
      // Return estimated charges when BigShip is not configured
      const estimatedCharge = amount >= 50000 ? 0 : 199
      return NextResponse.json({
        success: true,
        available: true,
        deliveryCharge: estimatedCharge,
        freeDelivery: estimatedCharge === 0,
        courierName: 'Standard Delivery',
        courierId: null,
        estimatedDays: 5,
        allRates: [{
          courier_id: null,
          courier_name: 'Standard Delivery',
          total_shipping_charges: estimatedCharge,
          tat: 5,
        }],
      })
    }

    const { calculateRates, SHIPPING_DEFAULTS } = await import('../../../lib/bigship')
    const pickupPincode = process.env.BIGSHIP_PICKUP_PINCODE || '400001'

    // Use per-product weight/dimensions if provided, otherwise fall back to SHIPPING_DEFAULTS
    const result = await calculateRates({
      shipmentCategory: SHIPPING_DEFAULTS.SHIPMENT_CATEGORY,
      paymentType: SHIPPING_DEFAULTS.PAYMENT_TYPE,
      pickupPincode,
      destinationPincode: pincode,
      shipmentInvoiceAmount: amount,
      boxDetails: [
        {
          deadWeight: weight || SHIPPING_DEFAULTS.DEAD_WEIGHT,
          length: length || SHIPPING_DEFAULTS.LENGTH,
          width: width || SHIPPING_DEFAULTS.WIDTH,
          height: height || SHIPPING_DEFAULTS.HEIGHT,
          // Use provided box_count; fall back to SHIPPING_DEFAULTS.BOX_COUNT (1)
          boxCount: boxCount || SHIPPING_DEFAULTS.BOX_COUNT,
        },
      ],
    })

    if (!result.success || !result.data?.length) {
      return NextResponse.json({
        success: true,
        available: false,
        deliveryCharge: 0,
        freeDelivery: false,
        message: result.message || 'No couriers available for this pincode',
      })
    }

    // Find the cheapest option (Amazon already filtered out inside calculateRates)
    const cheapest = result.data.reduce((a, b) =>
      parseFloat(a.total_shipping_charges) < parseFloat(b.total_shipping_charges) ? a : b
    )

    return NextResponse.json({
      success: true,
      available: true,
      deliveryCharge: Math.round(cheapest.total_shipping_charges),
      freeDelivery: cheapest.total_shipping_charges === 0,
      courierName: cheapest.courier_name,
      courierId: cheapest.courier_id || null,
      courierType: cheapest.courier_type || null,
      estimatedDays: cheapest.tat || 5,
      billableWeight: cheapest.billable_weight || null,
      allRates: result.data.map((r) => ({
        courier_id: r.courier_id,
        courier_name: r.courier_name,
        courier_type: r.courier_type,
        total_shipping_charges: Math.round(r.total_shipping_charges),
        courier_charge: r.courier_charge,
        tat: r.tat,
        billable_weight: r.billable_weight,
        zone: r.zone,
      })),
    })
  } catch (error) {
    console.error('Delivery charges error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch delivery charges' },
      { status: 500 }
    )
  }
}
