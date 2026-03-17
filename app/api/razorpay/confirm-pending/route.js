import { NextResponse } from 'next/server'
import { razorpay } from '../../../../lib/razorpay'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * Fallback: confirm a pending order by checking Razorpay directly
 * POST /api/razorpay/confirm-pending
 * 
 * Used by the success page when an order is still "pending" —
 * queries Razorpay for the payment status and confirms if paid.
 */
export async function POST(request) {
  try {
    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const adminSupabase = createSupabaseServerClient()

    // Fetch the order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Already confirmed
    if (order.payment_status === 'completed') {
      return NextResponse.json({ success: true, message: 'Already confirmed' })
    }

    // Need a razorpay_order_id to check
    if (!order.razorpay_order_id) {
      console.log('[confirm-pending] No razorpay_order_id for order', order_id)
      return NextResponse.json({ error: 'No Razorpay order linked' }, { status: 400 })
    }

    // Fetch the Razorpay order to check its payment status
    let rzpOrder
    try {
      rzpOrder = await razorpay.orders.fetch(order.razorpay_order_id)
    } catch (err) {
      console.error('[confirm-pending] Failed to fetch Razorpay order:', err)
      return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 })
    }

    if (rzpOrder.status !== 'paid') {
      console.log('[confirm-pending] Razorpay order not paid:', rzpOrder.status)
      return NextResponse.json({ error: `Payment not completed (${rzpOrder.status})` }, { status: 400 })
    }

    // Razorpay says it's paid — get the payment details
    let payments
    try {
      payments = await razorpay.orders.fetchPayments(order.razorpay_order_id)
    } catch (err) {
      console.error('[confirm-pending] Failed to fetch payments:', err)
      payments = { items: [] }
    }

    const capturedPayment = payments.items?.find(p => p.status === 'captured')
    const paymentId = capturedPayment?.id || ''

    // Update the order
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        razorpay_payment_id: paymentId || order.razorpay_payment_id,
        payment_timestamp: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('[confirm-pending] Update failed:', updateError)
      // Fallback minimal update
      await adminSupabase
        .from('orders')
        .update({ payment_status: 'completed', status: 'confirmed' })
        .eq('id', order_id)
    }

    // Log the confirmation
    await adminSupabase
      .from('payment_logs')
      .insert({
        order_id,
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: paymentId,
        status: 'completed',
        response_data: { source: 'confirm-pending-fallback', rzp_status: rzpOrder.status }
      })
      .catch(() => {})

    console.log('[confirm-pending] Order', order_id, 'confirmed via fallback')

    return NextResponse.json({ success: true, message: 'Order confirmed' })

  } catch (error) {
    console.error('[confirm-pending] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
