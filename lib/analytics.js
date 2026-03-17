// Server-side analytics helpers (GA4 Measurement Protocol example)
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'
const GA4_API_SECRET = process.env.GA4_API_SECRET || 'YOUR_API_SECRET'

export async function sendGA4Purchase(order, items=[]) {
  // order: { id, total, currency }
  // items: array of { id, name, quantity, price }
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.log('GA4 env not configured, skipping GA4 event', { GA4_MEASUREMENT_ID, GA4_API_SECRET })
    return { ok: false, reason: 'no_ga4_env' }
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`

  // client_id is required — when you don't have a client id (server-side), you can use a random uuid or a stable identifier
  const client_id = `server-${order.id}`

  const event = {
    client_id,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: String(order.id),
          value: Number(order.total) || 0,
          currency: order.currency || 'INR',
          items: items.map(it => ({ item_id: String(it.id || ''), item_name: it.name || '', quantity: it.quantity || 1, price: it.price || 0 }))
        }
      }
    ]
  }

  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) })
    if (!res.ok) {
      const text = await res.text()
      console.error('GA4 MP error', res.status, text)
      return { ok: false, status: res.status, text }
    }
    return { ok: true }
  } catch (e) {
    console.error('GA4 MP request failed', e)
    return { ok: false, error: e.message }
  }
}

// Note: Direct Google Ads server-side conversions typically require the Google Ads API with OAuth and using
// the 'conversions:upload' endpoint. That is more involved (requires a service account or OAuth credentials).
// The GA4 Measurement Protocol approach above is a simple server-side example you can use to send conversion
// events to Google Analytics 4 which can be linked to Google Ads for conversion measurement.
