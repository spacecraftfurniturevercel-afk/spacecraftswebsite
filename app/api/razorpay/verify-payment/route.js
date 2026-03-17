import { NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPaymentDetails, fetchOrderDetails, razorpay } from '../../../../lib/razorpay'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

/**
 * Verify Razorpay payment signature and confirm payment
 * POST /api/razorpay/verify-payment
 * 
 * Body:
 * - razorpay_order_id: Razorpay order ID
 * - razorpay_payment_id: Razorpay payment ID
 * - razorpay_signature: Razorpay signature
 * - order_id: Our database order ID
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      )
    }

    // Verify signature
    const isSignatureValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isSignatureValid) {
      console.error('Invalid Razorpay signature:', { razorpay_order_id, razorpay_payment_id })
      
      // Log failed verification (non-blocking)
      supabase
        .from('payment_logs')
        .insert({
          order_id,
          razorpay_order_id,
          razorpay_payment_id,
          status: 'signature_verification_failed',
          error_message: 'Invalid signature'
        })
        .then(() => {})
        .catch(() => {})

      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      )
    }

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('profile_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch payment details from Razorpay to verify
    let paymentDetails
    try {
      paymentDetails = await fetchPaymentDetails(razorpay_payment_id)
    } catch (error) {
      console.error('Error fetching payment details:', error)
      
      supabase
        .from('payment_logs')
        .insert({
          order_id,
          razorpay_order_id,
          razorpay_payment_id,
          status: 'payment_fetch_failed',
          error_message: error.message
        })
        .then(() => {})
        .catch(() => {})

      return NextResponse.json(
        { error: 'Could not verify payment. Please contact support.' },
        { status: 500 }
      )
    }

    // Verify payment is captured (or authorized — we accept both)
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      console.error('Payment not captured/authorized:', paymentDetails.status)
      
      supabase
        .from('payment_logs')
        .insert({
          order_id,
          razorpay_order_id,
          razorpay_payment_id,
          status: 'payment_not_captured',
          error_message: `Payment status: ${paymentDetails.status}`
        })
        .then(() => {})
        .catch(() => {})

      return NextResponse.json(
        { error: `Payment status is ${paymentDetails.status}. Expected captured.` },
        { status: 400 }
      )
    }

    // If payment is only authorized, capture it
    if (paymentDetails.status === 'authorized') {
      try {
        await razorpay.payments.capture(razorpay_payment_id, paymentDetails.amount, paymentDetails.currency || 'INR')
      } catch (captureErr) {
        console.warn('Auto-capture failed (may already be captured):', captureErr.message)
      }
    }

    // Verify amount
    const expectedAmount = Math.round(order.total * 100)
    if (paymentDetails.amount !== expectedAmount) {
      console.error('Amount mismatch:', { expected: expectedAmount, received: paymentDetails.amount })
      
      supabase
        .from('payment_logs')
        .insert({
          order_id,
          razorpay_order_id,
          razorpay_payment_id,
          status: 'amount_mismatch',
          error_message: `Expected: ${expectedAmount}, Received: ${paymentDetails.amount}`
        })
        .then(() => {})
        .catch(() => {})

      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      )
    }

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
        status: 'confirmed',
        payment_timestamp: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('Error updating order (trying minimal update):', updateError)
      
      // Fallback: try with fewer columns in case some don't exist yet
      const { error: fallbackError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'completed'
        })
        .eq('id', order_id)

      if (fallbackError) {
        // Last resort: just set status
        const { error: lastResortError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order_id)

        if (lastResortError) {
          console.error('All update attempts failed:', lastResortError)

          await supabase
            .from('payment_logs')
            .insert({
              order_id,
              razorpay_order_id,
              razorpay_payment_id,
              status: 'order_update_failed',
              error_message: updateError.message
            })
            .catch(() => {})

          return NextResponse.json(
            { error: 'Failed to confirm order' },
            { status: 500 }
          )
        }
      }
    }

    // Clear cart items for this user if it was a cart checkout
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('profile_id', user.id)
    } catch (cartError) {
      console.error('Error clearing cart:', cartError)
      // Don't fail the whole request just because cart clearing failed
    }

    // Log successful payment (non-blocking)
    supabase
      .from('payment_logs')
      .insert({
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'completed',
        response_data: {
          amount: paymentDetails.amount,
          method: paymentDetails.method,
          acquired_at: paymentDetails.acquired_at
        }
      })
      .then(() => {})
      .catch(() => {})

    // Send order confirmation emails to customer & admin (non-blocking)
    ;(async () => {
      try {
        const { sendOrderConfirmationEmails } = await import('../../../../lib/email')

        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order_id)

        // Fetch address
        let address = null
        if (order.address_id) {
          const { data: addr } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', order.address_id)
            .single()
          address = addr
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user.id)
          .single()

        await sendOrderConfirmationEmails({
          order,
          items: orderItems || [],
          address,
          customerName: profile?.full_name || address?.full_name || 'Customer',
          customerEmail: profile?.email || user.email,
          customerPhone: profile?.phone || address?.phone || '',
        })
      } catch (emailErr) {
        console.error('Order confirmation email error:', emailErr)
      }
    })()

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      order_id,
      razorpay_payment_id,
      payment_status: 'completed'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in verify-payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
