import { NextResponse } from 'next/server'
import stripe from '../../../lib/stripe'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req) {
  try {
    const body = await req.json()
    const items = body.items || []
    if (!items.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

    const supa = createSupabaseServerClient()

    // Create order (draft) and order_items using service role
    const total = 0 // we'll compute below
    // insert order with placeholder total, update after calculation
    const { data: order } = await supa.from('orders').insert([{ profile_id: body.profile_id || null, total: 0, status: 'placed' }]).select().single()
    if (!order) return NextResponse.json({ error: 'Could not create order' }, { status: 500 })

    let computedTotal = 0
    for (const it of items) {
      const { data: product } = await supa.from('products').select('*').eq('id', it.product_id).single()
      if (!product) continue
      const unitPrice = Number(product.discount_price || product.price || 0)
      computedTotal += unitPrice * (it.quantity || 1)
      await supa.from('order_items').insert([{ order_id: order.id, product_id: product.id, name: product.name, unit_price: unitPrice, quantity: it.quantity || 1 }])
    }

    // update order total
    await supa.from('orders').update({ total: computedTotal }).eq('id', order.id)

    // create stripe line items
    const line_items = []
    for (const it of items) {
      const { data: product } = await supa.from('products').select('*').eq('id', it.product_id).single()
      if (!product) continue
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: { name: product.name },
          unit_amount: Math.round((product.discount_price || product.price) * 100)
        },
        quantity: it.quantity || 1
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      metadata: { order_id: String(order.id) },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`
    })

    // save stripe_session_id on order
    await supa.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

    return NextResponse.json({ id: session.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
