import { NextResponse } from 'next/server'
import { quoteDeliveryCharge } from '../../../lib/deliveryCharge'

/**
 * GET /api/delivery-charges?pincode=600001&amount=15000&weight=5&length=30&width=20&height=20
 * Display quote only. Order APIs recompute this server-side and ignore client amounts.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')
    const amount = parseFloat(searchParams.get('amount') || '5000')
    const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')) : null
    const length = searchParams.get('length') ? parseInt(searchParams.get('length')) : null
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')) : null
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')) : null
    const boxCount = searchParams.get('box_count') ? parseInt(searchParams.get('box_count')) : null

    const quote = await quoteDeliveryCharge({
      pincode,
      invoiceAmount: amount,
      items: [
        {
          shipping_weight: weight,
          shipping_length: length,
          shipping_width: width,
          shipping_height: height,
          shipping_box_count: boxCount,
          quantity: 1,
        },
      ],
      paymentType: 'Prepaid',
    })

    if (!quote.success) {
      return NextResponse.json({ error: quote.error || 'Valid 6-digit pincode required' }, { status: 400 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Delivery charges error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch delivery charges' },
      { status: 500 }
    )
  }
}
