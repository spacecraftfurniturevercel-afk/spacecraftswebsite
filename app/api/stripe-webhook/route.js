import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-01' })

export async function POST(req) {
  const buf = await req.arrayBuffer()
  const raw = Buffer.from(buf)
  const sig = req.headers.get('stripe-signature')
  let event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  const supa = createSupabaseServerClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // TODO: create order record using session data
    try {
      // If we created an order before checkout, link and confirm it using metadata.order_id
      const orderId = session.metadata?.order_id
      let orderRecord = null
      if (orderId) {
        const { data: order } = await supa.from('orders').select('*').eq('id', orderId).single()
        if (order) {
          orderRecord = order
          await supa.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
        }
      } else {
        const { data: newOrder } = await supa.from('orders').insert({ stripe_session_id: session.id, total: (session.amount_total/100.0), status: 'confirmed' }).select().single()
        orderRecord = newOrder
      }

      // Clear cart items for the profile if present
      const profileId = orderRecord?.profile_id || null
      if (profileId) {
        await supa.from('cart_items').delete().eq('profile_id', profileId)
      }

      // Send purchase event to GTM server via internal API (centralized) to reuse logic
      try {
        if (orderRecord?.id) {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/track/conversion`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderRecord.id }) })
        }
      } catch (e) { console.error('Failed to call internal conversion API', e) }
    } catch (e) { console.error(e) }
  }

  return NextResponse.json({ received: true })
}
