import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

/**
 * POST /api/calculator
 * Calculate shipping rates BEFORE payment using BigShip POST /api/calculator.
 *
 * Flow:
 *   1. Client calls this with destination_pincode + product/cart data
 *   2. We fetch BigShip rates — shipment_invoice_amount = product cost (NO shipping)
 *   3. Return all courier options so UI can display:
 *      Product ₹X + Shipping ₹Y = Total ₹Z
 *   4. Client shows the breakdown and sends the TOTAL (product + shipping) to Razorpay
 *
 * Body (all required except box_count which defaults to 1):
 * {
 *   destination_pincode: 641001,          // 6-digit destination pincode
 *   amount: 1000,                          // product price ONLY (no GST, no shipping)
 *   weight: 5,                             // kg  (or omit to use product DB value)
 *   length: 30,                            // cm
 *   width: 20,                             // cm
 *   height: 20,                            // cm
 *   box_count: 1,                          // number of boxes (defaults to 1)
 *   product_id: "uuid",                    // optional — auto-fetches dims from DB
 *   quantity: 1                            // optional — multiplies box_count
 * }
 *
 * Response:
 * {
 *   available: true,
 *   rates: [{ courier_id, courier_name, total_shipping_charges, tat }, ...],
 *   cheapest: { courier_id, courier_name, total_shipping_charges, tat },
 *   product_price: 1000,
 *   shipping_charge: 120,
 *   total_payable: 1120          // product_price + shipping_charge (no GST here — GST added server-side at order creation)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      destination_pincode,
      amount,
      product_id,
      quantity = 1,
    } = body

    let { weight, length, width, height, box_count } = body

    // Validate destination pincode
    if (!destination_pincode || !/^\d{6}$/.test(String(destination_pincode))) {
      return NextResponse.json(
        { error: 'Valid 6-digit destination_pincode is required' },
        { status: 400 }
      )
    }

    // Validate amount (product cost, no shipping)
    const productAmount = parseFloat(amount)
    if (!productAmount || productAmount <= 0) {
      return NextResponse.json(
        { error: 'amount (product price) is required and must be > 0' },
        { status: 400 }
      )
    }

    // If product_id provided, fetch shipping dimensions from DB
    if (product_id && (!weight || !length || !width || !height)) {
      try {
        const supabase = createSupabaseServerClient()
        const { data: product } = await supabase
          .from('products')
          .select('shipping_weight, shipping_length, shipping_width, shipping_height, shipping_box_count')
          .eq('id', product_id)
          .single()

        if (product) {
          weight = weight || product.shipping_weight
          length = length || product.shipping_length
          width = width || product.shipping_width
          height = height || product.shipping_height
          // box_count per unit from DB; multiply by quantity for total boxes
          if (!box_count && product.shipping_box_count) {
            box_count = product.shipping_box_count * Math.max(1, parseInt(quantity) || 1)
          }
        }
      } catch (dbErr) {
        console.warn('[calculator] Could not fetch product dims from DB:', dbErr.message)
      }
    }

    // Fallback: multiply box_count by quantity if not already done
    const resolvedBoxCount = box_count
      ? Math.max(1, parseInt(box_count))
      : Math.max(1, parseInt(quantity) || 1)

    // If BigShip is not configured, return mock rates so UI still works
    if (!BIGSHIP_CONFIGURED) {
      const mockCharge = productAmount >= 50000 ? 0 : 199
      const rates = [
        { courier_id: 1, courier_name: 'Standard Delivery', total_shipping_charges: mockCharge, tat: 5 },
        { courier_id: 2, courier_name: 'Express Delivery', total_shipping_charges: mockCharge + 100, tat: 2 },
      ]
      const cheapest = rates[0]
      return NextResponse.json({
        available: true,
        rates,
        cheapest,
        product_price: productAmount,
        shipping_charge: cheapest.total_shipping_charges,
        total_payable: productAmount + cheapest.total_shipping_charges,
      })
    }

    const { calculateRates, SHIPPING_DEFAULTS } = await import('../../../lib/bigship')
    const pickupPincode = process.env.BIGSHIP_PICKUP_PINCODE
    if (!pickupPincode) {
      console.warn('[calculator] BIGSHIP_PICKUP_PINCODE env var not set — using fallback 400001. Set this to your warehouse pincode.')
    }
    const resolvedPickupPincode = pickupPincode || '400001'

    const result = await calculateRates({
      shipmentCategory: SHIPPING_DEFAULTS.SHIPMENT_CATEGORY,
      paymentType: SHIPPING_DEFAULTS.PAYMENT_TYPE,
      pickupPincode: resolvedPickupPincode,
      destinationPincode: String(destination_pincode),
      // shipment_invoice_amount = product cost ONLY (no shipping) as per BigShip docs
      shipmentInvoiceAmount: productAmount,
      boxDetails: [
        {
          deadWeight: weight || SHIPPING_DEFAULTS.DEAD_WEIGHT,
          length: length || SHIPPING_DEFAULTS.LENGTH,
          width: width || SHIPPING_DEFAULTS.WIDTH,
          height: height || SHIPPING_DEFAULTS.HEIGHT,
          boxCount: resolvedBoxCount,
        },
      ],
    })

    if (!result.success || !result.data?.length) {
      return NextResponse.json({
        available: false,
        rates: [],
        cheapest: null,
        product_price: productAmount,
        shipping_charge: 0,
        total_payable: productAmount,
        message: result.message || 'No couriers available for this pincode',
      })
    }

    // Sort rates by price ascending
    // Filter out couriers not available on this BigShip account (e.g. Amazon Shipping)
    // These appear in the public calculator but cannot be booked via our account.
    const EXCLUDED_COURIERS = /amazon/i
    const rates = result.data
      .filter(r => !EXCLUDED_COURIERS.test(r.courier_name || ''))
      .map((r) => ({
        courier_id: r.courier_id,
        courier_name: r.courier_name,
        courier_type: r.courier_type || null,
        total_shipping_charges: Math.round(r.total_shipping_charges),
        tat: r.tat || 5,
      }))
      .sort((a, b) => a.total_shipping_charges - b.total_shipping_charges)

    const cheapest = rates[0]

    return NextResponse.json({
      available: true,
      cheapest,
      product_price: productAmount,
      shipping_charge: cheapest.total_shipping_charges,
      // total_payable = product price + shipping (GST is added server-side at Razorpay order creation)
      total_payable: productAmount + cheapest.total_shipping_charges,
    })
  } catch (error) {
    console.error('[api/calculator] Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    )
  }
}
