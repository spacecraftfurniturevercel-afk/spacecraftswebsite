import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

// Helper: fetch delivery charges from BigShip Calculate Rates API (POST /api/calculator)
// Accepts per-product weight/dimensions + box_count; falls back to SHIPPING_DEFAULTS when not provided.
async function fetchBigShipCharges(pincode, amount = 5000, { weight, length, width, height, box_count } = {}) {
  try {
    if (!BIGSHIP_CONFIGURED) {
      // Return fallback estimate when BigShip is not configured
      const charge = amount >= 50000 ? 0 : 199
      return {
        available: true,
        deliveryCharge: charge,
        courierId: null,
        courierName: 'Standard Delivery',
        estimatedDays: 5,
      }
    }

    const { calculateRates, SHIPPING_DEFAULTS } = await import('../../../lib/bigship')
    const pickupPincode = process.env.BIGSHIP_PICKUP_PINCODE
    if (!pickupPincode) {
      console.warn('[check-delivery] BIGSHIP_PICKUP_PINCODE env var not set — using fallback 400001. Set this to your warehouse pincode.')
    }
    const resolvedPickupPincode = pickupPincode || '400001'

    const result = await calculateRates({
      shipmentCategory: SHIPPING_DEFAULTS.SHIPMENT_CATEGORY,
      paymentType: SHIPPING_DEFAULTS.PAYMENT_TYPE,
      pickupPincode: resolvedPickupPincode,
      destinationPincode: pincode,
      // shipment_invoice_amount = product price ONLY (no shipping) as per BigShip docs
      shipmentInvoiceAmount: amount,
      boxDetails: [{
        deadWeight: weight || SHIPPING_DEFAULTS.DEAD_WEIGHT,
        length: length || SHIPPING_DEFAULTS.LENGTH,
        width: width || SHIPPING_DEFAULTS.WIDTH,
        height: height || SHIPPING_DEFAULTS.HEIGHT,
        // Use provided box_count; fall back to SHIPPING_DEFAULTS.BOX_COUNT (1)
        boxCount: box_count || SHIPPING_DEFAULTS.BOX_COUNT,
      }],
    })

    if (result.success && result.data?.length) {
      const sorted = [...result.data].sort((a, b) => a.total_shipping_charges - b.total_shipping_charges)
      const cheapest = sorted[0]
      return {
        available: true,
        deliveryCharge: Math.round(cheapest.total_shipping_charges),
        courierId: cheapest.courier_id || null,
        courierName: cheapest.courier_name,
        courierType: cheapest.courier_type || null,
        estimatedDays: cheapest.tat || 5,
      }
    }

    return { available: false, deliveryCharge: 0, courierId: null, courierName: '', estimatedDays: 5 }
  } catch (err) {
    console.error('BigShip rates fetch error in check-delivery:', err)
    return { available: false, deliveryCharge: 0, courierId: null, courierName: '', estimatedDays: 5 }
  }
}

export async function POST(request) {
  try {
    const { pincode, amount, weight, length, width, height, box_count } = await request.json()

    // Validate pincode
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      )
    }

    // 1) Fetch delivery charges from BigShip Calculate Rates API
    //    Per-product weight/dimensions + box_count passed from frontend; falls back to SHIPPING_DEFAULTS
    const bigshipData = await fetchBigShipCharges(
      pincode,
      amount || 5000,
      { weight, length, width, height, box_count }
    )

    // 2) Optionally look up local delivery_zones for city/state info
    const supabase = createSupabaseServerClient()
    let deliveryZone = null
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('pincode', pincode)
        .single()
      if (!error) deliveryZone = data
    } catch (_) { /* ignore — local table is optional */ }

    // 3) If BigShip has no couriers available, delivery is not possible
    if (!bigshipData.deliveryCharge && bigshipData.deliveryCharge !== 0) {
      // fetchBigShipCharges returned no valid rate
    }
    // If BigShip returned deliveryCharge === 0 AND courierName is empty, it means no courier found
    if (bigshipData.courierName === '' && bigshipData.deliveryCharge === 0 && !bigshipData.available) {
      return NextResponse.json({
        available: false,
        pincode,
        deliveryCharge: 0,
        message: 'Delivery is not available to this pincode at the moment.',
        suggestion: 'Submit a delivery request and we\'ll notify you when service becomes available.'
      })
    }

    // 4) Delivery is available — build response
    const estimatedDays = bigshipData.estimatedDays || deliveryZone?.delivery_days || 5
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays)

    const city = deliveryZone?.city || ''
    const state = deliveryZone?.state || ''
    const region = deliveryZone?.region || ''
    const place = city ? `${region ? region + ', ' : ''}${city}${state ? ', ' + state : ''}` : pincode

    return NextResponse.json({
      available: true,
      pincode,
      city,
      state,
      region,
      deliveryCharge: bigshipData.deliveryCharge,
      courierName: bigshipData.courierName,
      shippingCost: bigshipData.deliveryCharge,
      freeShipping: bigshipData.deliveryCharge === 0,
      deliveryDays: estimatedDays,
      estimatedDate: deliveryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      codAvailable: deliveryZone?.cod_available || false,
      place,
      message: `Delivery available${city ? ' in ' + city : ''} within ${estimatedDays} days`
    })
  } catch (error) {
    console.error('Delivery check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery availability' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode parameter required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data: deliveryZone } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('pincode', pincode)
      .eq('is_available', true)
      .single()

    if (!deliveryZone) {
      return NextResponse.json({
        available: false,
        pincode
      })
    }

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + deliveryZone.delivery_days)

    return NextResponse.json({
      available: true,
      pincode,
      city: deliveryZone.city,
      state: deliveryZone.state,
      deliveryDays: deliveryZone.delivery_days,
      estimatedDate: deliveryDate.toLocaleDateString('en-IN')
    })
  } catch (error) {
    console.error('Delivery check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery' },
      { status: 500 }
    )
  }
}
