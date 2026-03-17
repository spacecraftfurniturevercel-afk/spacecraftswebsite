import { NextResponse } from 'next/server'
import { createRazorpayOrder, formatAmountToPaise } from '../../../../lib/razorpay'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../lib/supabaseClient'

/**
 * Create a Razorpay order for checkout or direct payment
 * POST /api/razorpay/create-order
 * 
 * Body:
 * - items: Array of {product_id, quantity}
 * - address_id: ID of delivery address (optional for direct buy)
 * - paymentType: 'cart' | 'direct' (for direct product purchase)
 * - productId: (if paymentType is 'direct')
 */
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to proceed' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      items = [], 
      address_id, 
      paymentType, payment_type,
      productId, product_id,
      quantity = 1 
    } = body

    const resolvedPaymentType = paymentType || payment_type || 'cart'
    const resolvedProductId = productId || product_id

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Determine items for order
    let orderItems = items
    let subtotal = 0

    // If direct payment (from product page)
    if (resolvedPaymentType === 'direct' && resolvedProductId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, discount_price, stock')
        .eq('id', resolvedProductId)
        .eq('is_active', true)
        .single()

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available` },
          { status: 400 }
        )
      }

      orderItems = [{ product_id: resolvedProductId, quantity }]
      subtotal = (product.discount_price || product.price) * quantity
    } 
    // Cart checkout
    else if (resolvedPaymentType === 'cart' && items.length > 0) {
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name, price, discount_price, stock')
          .eq('id', item.product_id)
          .eq('is_active', true)
          .single()

        if (!product) continue

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Only ${product.stock} items available for ${product.name}` },
            { status: 400 }
          )
        }

        subtotal += (product.discount_price || product.price) * item.quantity
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid order parameters' },
        { status: 400 }
      )
    }

    // Add 18% GST to subtotal
    const gst = Math.round(subtotal * 0.18)
    const totalAmount = subtotal + gst

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Order total must be greater than zero' },
        { status: 400 }
      )
    }

    // Create order record in database (draft status)
    let order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        profile_id: profile.id,
        address_id: address_id || null,
        total: totalAmount,
        currency: 'INR',
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'razorpay'
      })
      .select()
      .single()

    if (orderError) {
      // Fallback: try without razorpay-specific columns
      const { data: fallbackOrder, error: fallbackError } = await supabase
        .from('orders')
        .insert({
          profile_id: profile.id,
          address_id: address_id || null,
          total: totalAmount,
          currency: 'INR',
          status: 'pending'
        })
        .select()
        .single()

      if (fallbackError) {
        console.error('Order creation error:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        )
      }
      order = fallbackOrder
    } else {
      order = orderData
    }

    // Create order items
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, discount_price')
        .eq('id', item.product_id)
        .single()

      if (!product) continue

      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          name: product.name,
          unit_price: product.discount_price || product.price,
          quantity: item.quantity || 1
        })
    }

    // Create Razorpay order
    const amountInPaise = formatAmountToPaise(totalAmount)
    
    try {
      const razorpayOrder = await createRazorpayOrder(
        amountInPaise,
        'INR',
        {
          receipt: `order_${order.id}_${Date.now()}`,
          notes: {
            order_id: String(order.id),
            user_email: profile.email,
            user_name: profile.full_name,
            payment_type: resolvedPaymentType
          }
        }
      )

      // Update order with Razorpay order ID using admin client (RLS may block user client)
      try {
        const adminSupabase = createSupabaseServerClient()
        await adminSupabase
          .from('orders')
          .update({ razorpay_order_id: razorpayOrder.id })
          .eq('id', order.id)
      } catch (e) {
        console.warn('[create-order] Failed to save razorpay_order_id:', e.message)
      }

      return NextResponse.json({
        success: true,
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: totalAmount,
        amount_paise: amountInPaise,
        currency: 'INR',
        customer_email: profile.email,
        customer_name: profile.full_name
      }, { status: 201 })

    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError)
      
      // Log the error (non-blocking)
      try {
        await supabase
          .from('payment_logs')
          .insert({
            order_id: order.id,
            status: 'razorpay_order_failed',
            error_message: razorpayError.message,
            response_data: { error: razorpayError.message }
          })
      } catch (_) {}

      return NextResponse.json(
        { error: 'Failed to create payment order. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in create-order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
