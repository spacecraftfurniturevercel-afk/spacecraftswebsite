import { NextResponse } from 'next/server'
import { checkServiceability } from '../../../../lib/shiprocket'

/**
 * GET /api/shiprocket/serviceability?pincode=110001&weight=0.5
 * Check if delivery is available to a pincode via Shiprocket
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')
    const weight = parseFloat(searchParams.get('weight') || '0.5')

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: 'Valid 6-digit pincode required' }, { status: 400 })
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001'

    const data = await checkServiceability(pickupPincode, pincode, weight)
    const couriers = data?.data?.available_courier_companies || []

    if (couriers.length === 0) {
      return NextResponse.json({
        available: false,
        message: 'Delivery not available to this pincode'
      })
    }

    // Pick cheapest courier
    const cheapest = couriers.reduce((a, b) => a.rate < b.rate ? a : b)

    return NextResponse.json({
      available: true,
      delivery_days: cheapest.etd ? parseInt(cheapest.etd) : null,
      estimated_delivery: cheapest.etd_hours
        ? `${Math.ceil(cheapest.etd_hours / 24)} days`
        : `${cheapest.estimated_delivery_days || 5}-${(cheapest.estimated_delivery_days || 5) + 2} days`,
      shipping_cost: cheapest.rate,
      courier: cheapest.courier_name,
      cod_available: cheapest.cod === 1
    })
  } catch (error) {
    console.error('Serviceability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery availability' },
      { status: 500 }
    )
  }
}
