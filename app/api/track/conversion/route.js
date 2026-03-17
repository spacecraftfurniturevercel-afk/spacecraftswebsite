import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'
import { sendOrderEmail } from '../../../../lib/email'
import { sendGA4Purchase } from '../../../../lib/analytics'
import { uploadGoogleAdsConversion } from '../../../../lib/googleAds'

export async function POST(req) {
  try {
    const body = await req.json()
    const orderId = body.order_id
    const supa = createSupabaseServerClient()
    const { data: order } = await supa.from('orders').select('*').eq('id', orderId).single()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Send to GTM server endpoint if configured (legacy support)
    const gtmServerUrl = process.env.GTM_SERVER_URL || null
    if (gtmServerUrl) {
      const payload = {
        event: 'purchase',
        order_id: order.id,
        value: order.total,
        currency: order.currency || 'INR'
      }
      try {
        await fetch(gtmServerUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } catch (e) { console.error('Failed to send to GTM server', e) }
    }

    // GA4 Measurement Protocol server-side sending (recommended simple server example)
    try {
      // fetch order items
      let orderItems = []
      try {
        const { data: items } = await supa.from('order_items').select('*').eq('order_id', order.id)
        orderItems = items || []
      } catch (e) { }
      await sendGA4Purchase(order, orderItems)
    } catch (e) { console.error('GA4 send failed', e) }

    // Google Ads server-side upload (scaffold) using placeholders
    try {
      // If you have a gclid or other identifier, provide it here. We'll call the upload helper with placeholders.
      const gclid = body.gclid || null
      if (gclid) {
        await uploadGoogleAdsConversion({ gclid, conversionActionResourceName: process.env.GOOGLE_ADS_CONVERSION_RESOURCE || '', conversionTime: new Date().toISOString(), conversionValue: order.total, currency: order.currency || 'INR', orderId: order.id })
      }
    } catch (e) { console.error('Google Ads upload failed', e) }

    // Send confirmation email if user email available
    if (order.profile_id) {
      try {
        // Try to get profile email
        const { data: profile } = await supa.from('profiles').select('email').eq('id', order.profile_id).single()
        if (profile?.email) {
          await sendOrderEmail(order, profile.email)
        }
      } catch (e) { console.error('Error sending email', e) }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
