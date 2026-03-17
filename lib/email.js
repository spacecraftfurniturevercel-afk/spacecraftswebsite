export async function sendOrderEmail(order, toEmail) {
  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.EMAIL_FROM || 'noreply@example.com'
  if (!apiKey) {
    console.log('SENDGRID_API_KEY not configured; skipping email. Order:', order)
    return { ok: false, reason: 'no_api_key' }
  }

  const body = {
    personalizations: [{ to: [{ email: toEmail }], subject: `Order confirmation #${order.id}` }],
    from: { email: from },
    content: [{ type: 'text/plain', value: `Thanks for your order. Order #${order.id} total ${order.total} ${order.currency || 'INR'}` }]
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('SendGrid error:', res.status, text)
    return { ok: false, reason: 'sendgrid_error', status: res.status, text }
  }
  return { ok: true }
}
