function gtag() {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag === 'function') {
    window.gtag.apply(null, arguments)
    return
  }
  window.dataLayer.push(arguments)
}

export function trackPurchase({ transactionId, value, currency = 'INR' }) {
  if (!transactionId) return
  const key = `ga4_purchase_${transactionId}`
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch (_) {}

  gtag('event', 'purchase', {
    transaction_id: String(transactionId),
    value: Number(value) || 0,
    currency,
  })
}

export function trackGenerateLead(source = 'contact_form') {
  gtag('event', 'generate_lead', {
    currency: 'INR',
    value: 0,
    lead_source: source,
  })
}

export function trackClickToCall(phone) {
  gtag('event', 'click_to_call', {
    phone: String(phone || '').slice(0, 20),
  })
}

export function trackClickToWhatsapp() {
  gtag('event', 'click_to_whatsapp')
}
