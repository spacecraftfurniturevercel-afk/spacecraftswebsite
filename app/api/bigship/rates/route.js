import { NextResponse } from 'next/server'
import { calculateRates } from '../../../../lib/bigship'

const BIGSHIP_CONFIGURED = !!(
  process.env.BIGSHIP_USER_NAME &&
  process.env.BIGSHIP_PASSWORD &&
  process.env.BIGSHIP_ACCESS_KEY
)

/**
 * GET /api/bigship/rates?pincode=110001&weight=5&amount=15000
 * Calculate shipping rates to a destination pincode
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')
    const weight = parseFloat(searchParams.get('weight') || '5')
    const amount = parseFloat(searchParams.get('amount') || '5000')
    const length = parseInt(searchParams.get('length') || '30')
    const width = parseInt(searchParams.get('width') || '20')
    const height = parseInt(searchParams.get('height') || '20')

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: 'Valid 6-digit pincode required' }, { status: 400 })
    }

    if (!BIGSHIP_CONFIGURED) {
      // Return mock rates when not configured
      return NextResponse.json({
        available: true,
        rates: [
          {
            courier_name: 'Standard Delivery',
            total_shipping_charges: 199,
            tat: 5,
          },
        ],
        cheapest: {
          courier_name: 'Standard Delivery',
          total_shipping_charges: 199,
          tat: 5,
        },
      })
    }

    const pickupPincode = process.env.BIGSHIP_PICKUP_PINCODE || '400001'

    const result = await calculateRates({
      shipmentCategory: 'B2C',
      paymentType: 'Prepaid',
      pickupPincode,
      destinationPincode: pincode,
      shipmentInvoiceAmount: amount,
      boxDetails: [
        {
          deadWeight: weight,
          length,
          width,
          height,
          boxCount: 1,
        },
      ],
    })

    if (!result.success || !result.data?.length) {
      return NextResponse.json({
        available: false,
        message: result.message || 'No couriers available for this pincode',
      })
    }

    const cheapest = result.data.reduce((a, b) =>
      a.total_shipping_charges < b.total_shipping_charges ? a : b
    )

    return NextResponse.json({
      available: true,
      rates: result.data.map((r) => ({
        courier_id: r.courier_id,
        courier_name: r.courier_name,
        courier_type: r.courier_type,
        zone: r.zone,
        tat: r.tat,
        billable_weight: r.billable_weight,
        total_shipping_charges: r.total_shipping_charges,
        courier_charge: r.courier_charge,
      })),
      cheapest: {
        courier_id: cheapest.courier_id,
        courier_name: cheapest.courier_name,
        total_shipping_charges: cheapest.total_shipping_charges,
        tat: cheapest.tat,
      },
    })
  } catch (error) {
    console.error('BigShip rates error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate shipping rates' },
      { status: 500 }
    )
  }
}
