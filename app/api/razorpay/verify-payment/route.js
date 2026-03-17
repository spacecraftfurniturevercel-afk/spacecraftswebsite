import { NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPaymentDetails, fetchOrderDetails, razorpay } from '../../../../lib/razorpay'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'

// Safe insert into payment_logs — never throws
async function logPayment(adminSupabase, data) {
  try {
    await adminSupabase.from('payment_logs').insert(data)
  } catch (e) {
    console.error('[verify-payment] payment_logs insert failed:', e.message)
  }
}

/**
 * Verify Razorpay payment signature and confirm payment
 * POST /api/razorpay/verify-payment
 * 
 * Uses service-role client (adminSupabase) for all DB operations because
 * the user's session token may expire during the Razorpay payment popup.
 * Security is ensured by Razorpay signature verification.
 */
export async function POST(request) {
  let order_id = null
  let razorpay_order_id = null
  let razorpay_payment_id = null

  try {
    const adminSupabase = createSupabaseServerClient()

    const body = await request.json()
    razorpay_order_id = body.razorpay_order_id
    razorpay_payment_id = body.razorpay_payment_id
    const razorpay_signature = body.razorpay_signature
    order_id = body.order_id

    console.log('[verify-payment] Starting verification for order:', order_id, 'payment:', razorpay_payment_id)

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      )
    }

    // Verify Razorpay signature — this proves the payment is legitimate
    const isSignatureValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isSignatureValid) {
      console.error('[verify-payment] Invalid signature:', { razorpay_order_id, razorpay_payment_id })
      logPayment(adminSupabase, { order_id, razorpay_order_id, razorpay_payment_id, status: 'signature_verification_failed', error_message: 'Invalid signature' })
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      )
    }

    console.log('[verify-payment] Signature valid, fetching order:', order_id)

    // Fetch order using admin client (bypasses RLS)
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      console.error('[verify-payment] Order not found:', order_id, orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // If already confirmed, return success immediately
    if (order.payment_status === 'completed') {
      console.log('[verify-payment] Order already confirmed:', order_id)
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        order_id,
        razorpay_payment_id,
        payment_status: 'completed'
      }, { status: 200 })
    }

    // Fetch payment details from Razorpay to verify
    let paymentDetails
    try {
      paymentDetails = await fetchPaymentDetails(razorpay_payment_id)
      console.log('[verify-payment] Payment status from Razorpay:', paymentDetails.status)
    } catch (fetchErr) {
      console.error('[verify-payment] Error fetching payment details:', fetchErr)
      logPayment(adminSupabase, { order_id, razorpay_order_id, razorpay_payment_id, status: 'payment_fetch_failed', error_message: fetchErr.message })
      return NextResponse.json(
        { error: 'Could not verify payment. Please contact support.' },
        { status: 500 }
      )
    }

    // Verify payment is captured (or authorized — we accept both)
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      console.error('[verify-payment] Payment not captured/authorized:', paymentDetails.status)
      logPayment(adminSupabase, { order_id, razorpay_order_id, razorpay_payment_id, status: 'payment_not_captured', error_message: `Payment status: ${paymentDetails.status}` })
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
        console.warn('[verify-payment] Auto-capture failed (may already be captured):', captureErr.message)
      }
    }

    // Verify amount
    const expectedAmount = Math.round(order.total * 100)
    if (paymentDetails.amount !== expectedAmount) {
      console.error('[verify-payment] Amount mismatch:', { expected: expectedAmount, received: paymentDetails.amount })
      logPayment(adminSupabase, { order_id, razorpay_order_id, razorpay_payment_id, status: 'amount_mismatch', error_message: `Expected: ${expectedAmount}, Received: ${paymentDetails.amount}` })
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      )
    }

    // Update order with payment details
    console.log('[verify-payment] Updating order', order_id, 'to confirmed')
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
        status: 'confirmed',
        payment_timestamp: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('[verify-payment] Update error (trying minimal):', updateError)
      
      const { error: fallbackError } = await adminSupabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'completed'
        })
        .eq('id', order_id)

      if (fallbackError) {
        console.error('[verify-payment] Minimal update also failed:', fallbackError)
        logPayment(adminSupabase, { order_id, razorpay_order_id, razorpay_payment_id, status: 'order_update_failed', error_message: updateError.message })
        return NextResponse.json(
          { error: 'Failed to confirm order' },
          { status: 500 }
        )
      }
    }

    console.log('[verify-payment] Order', order_id, 'confirmed successfully')

    // Clear cart items for this user
    try {
      await adminSupabase
        .from('cart_items')
        .delete()
        .eq('profile_id', order.profile_id)
    } catch (cartError) {
      console.error('[verify-payment] Error clearing cart:', cartError)
    }

    // Log successful payment
    logPayment(adminSupabase, {
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

    // Send order confirmation emails (non-blocking)
    ;(async () => {
      try {
        const { sendOrderConfirmationEmails } = await import('../../../../lib/email')

        const { data: orderItems } = await adminSupabase
          .from('order_items')
          .select('*')
          .eq('order_id', order_id)

        let address = null
        if (order.address_id) {
          const { data: addr } = await adminSupabase
            .from('addresses')
            .select('*')
            .eq('id', order.address_id)
            .single()
          address = addr
        }

        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', order.profile_id)
          .single()

        await sendOrderConfirmationEmails({
          order: { ...order, payment_status: 'completed', status: 'confirmed' },
          items: orderItems || [],
          address,
          customerName: profile?.full_name || address?.full_name || 'Customer',
          customerEmail: profile?.email || '',
          customerPhone: profile?.phone || address?.phone || '',
        })
      } catch (emailErr) {
        console.error('[verify-payment] Email error:', emailErr)
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
    console.error('[verify-payment] Unexpected error:', error.message, error.stack)

    // Try to log the error
    try {
      const adminSupabase = createSupabaseServerClient()
      await adminSupabase
        .from('payment_logs')
        .insert({
          order_id: order_id || 0,
          razorpay_order_id: razorpay_order_id || '',
          razorpay_payment_id: razorpay_payment_id || '',
          status: 'unexpected_error',
          error_message: error.message
        })
    } catch (_) {}

    return NextResponse.json(
      { error: `Payment verification error: ${error.message}` },
      { status: 500 }
    )
  }
}
