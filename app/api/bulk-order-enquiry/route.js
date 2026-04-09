import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'
import { sendEmail } from '../../../../lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spacecraftfurniturevercel@gmail.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Spacecrafts Furniture'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spacecraftsfurniture.in'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, company_name, gst_number, quantity, product_type, message, _source } = body
    const source = _source === 'whatsapp' ? 'whatsapp' : 'form'

    if (source === 'form') {
      if (!name || !message || !product_type || !quantity) {
        return NextResponse.json({ error: 'Name, product type, quantity and message are required.' }, { status: 400 })
      }
      if (!email && !phone) {
        return NextResponse.json({ error: 'Please provide at least your email or phone number.' }, { status: 400 })
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
      }
    }

    // Save to DB
    const supabase = createSupabaseServerClient()
    const { data: enquiry, error: dbErr } = await supabase
      .from('enquiries')
      .insert({
        type: 'bulk_order',
        source,
        status: 'new',
        name, email: email || null, phone: phone || null, message,
        company_name: company_name || null,
        gst_number: gst_number || null,
        product_type: product_type || null,
        quantity: String(quantity),
      })
      .select('id')
      .single()
    if (dbErr) console.error('[bulk-order-enquiry] DB insert error:', dbErr.message)

    const enquiryId = enquiry?.id

    const row = (label, value) => value ? `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:140px;">${label}</td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;font-weight:500;">${value}</td>
      </tr>` : ''

    const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a1a;padding:24px 32px;">
  <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
  <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">New Bulk Order Enquiry${enquiryId ? ` #${enquiryId}` : ''}</p>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1a1a1a;">&#128230; Bulk Order Enquiry Received</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    ${row('Enquiry #', enquiryId)}
    ${row('Name', name)}
    ${row('Email', email ? `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>` : '')}
    ${row('Phone', phone ? `<a href="tel:${phone}" style="color:#2563eb;text-decoration:none;">${phone}</a>` : '')}
    ${row('Company', company_name)}
    ${row('GST Number', gst_number)}
    ${row('Product / Category', product_type)}
    ${row('Quantity Required', quantity)}
  </table>
  <div style="background:#f9f9fb;border-radius:8px;padding:16px;border:1px solid #eee;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Requirements</p>
    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${message}</p>
  </div>
</td></tr>
<tr><td style="background:#f9f9fb;padding:16px 32px;border-top:1px solid #eee;text-align:center;">
  <a href="${SITE_URL}/admin/enquiries" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">View in Admin Dashboard &rarr;</a>
</td></tr>
</table>
</td></tr></table></body></html>`

    const userHtml = !email ? null : `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
  <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
</td></tr>
<tr><td style="padding:36px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:16px;">&#128230;</div>
  <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Bulk Order Request Received!</h2>
  <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">Hi ${name}, we have received your bulk order enquiry for <strong>${product_type}</strong>. Our team will reach out within 1-2 business days with a custom quote.</p>
  <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:left;font-size:13px;color:#555;">
    <strong>Your Request:</strong><br/>
    Product: ${product_type}<br/>
    Quantity: ${quantity}<br/>
    ${enquiryId ? `Reference: #${enquiryId}` : ''}
  </div>
</td></tr>
<tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
  <p style="margin:0;font-size:12px;color:#999;">For queries: <a href="mailto:support@spacecraftsfurniture.in" style="color:#666;">support@spacecraftsfurniture.in</a></p>
</td></tr>
</table>
</td></tr></table></body></html>`

    await Promise.all([
      sendEmail({ to: ADMIN_EMAIL, subject: `&#128230; Bulk Order Enquiry from ${name}${company_name ? ` (${company_name})` : ''} — ${product_type} × ${quantity}`, html: adminHtml }),
      email ? sendEmail({ to: email, subject: `Bulk Order Request Received — ${SITE_NAME}`, html: userHtml }) : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, enquiry_id: enquiryId })
  } catch (err) {
    console.error('[bulk-order-enquiry] Error:', err)
    return NextResponse.json({ error: 'Failed to send enquiry. Please try again.' }, { status: 500 })
  }
}

let transporter = null
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_FROM, pass: EMAIL_APP_PASSWORD },
    })
  }
  return transporter
}

async function sendEmail({ to, subject, html }) {
  if (!EMAIL_APP_PASSWORD) {
    console.warn('[bulk-order-enquiry] EMAIL_APP_PASSWORD not set — skipping email to:', to)
    return { ok: false }
  }
  try {
    const info = await getTransporter().sendMail({
      from: `"${SITE_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
    console.log('[bulk-order-enquiry] Email sent:', info.messageId, 'to:', to)
    return { ok: true }
  } catch (err) {
    console.error('[bulk-order-enquiry] Email error:', err.message)
    return { ok: false }
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, company_name, gst_number, quantity, product_type, message } = body

    if (!name || !message || !product_type || !quantity) {
      return NextResponse.json({ error: 'Name, product type, quantity and message are required.' }, { status: 400 })
    }
    if (!email && !phone) {
      return NextResponse.json({ error: 'Please provide at least your email or phone number.' }, { status: 400 })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const row = (label, value) => value ? `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:140px;">${label}</td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;font-weight:500;">${value}</td>
      </tr>` : ''

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a1a;padding:24px 32px;">
  <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
  <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">New Bulk Order Enquiry</p>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1a1a1a;">📦 Bulk Order Enquiry Received</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    ${row('Name', name)}
    ${row('Email', email ? `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>` : '')}
    ${row('Phone', phone ? `<a href="tel:${phone}" style="color:#2563eb;text-decoration:none;">${phone}</a>` : '')}
    ${row('Company', company_name)}
    ${row('GST Number', gst_number)}
    ${row('Product / Category', product_type)}
    ${row('Quantity Required', quantity)}
  </table>
  <div style="background:#f9f9fb;border-radius:8px;padding:16px;border:1px solid #eee;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Requirements</p>
    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${message}</p>
  </div>
</td></tr>
<tr><td style="background:#f9f9fb;padding:20px 32px;border-top:1px solid #eee;">
  <p style="margin:0;font-size:12px;color:#999;text-align:center;">Submitted via <a href="${SITE_URL}/bulk-orders" style="color:#2563eb;text-decoration:none;">${SITE_URL}/bulk-orders</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `📦 Bulk Order Enquiry from ${name}${company_name ? ` (${company_name})` : ''} — ${product_type} × ${quantity}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[bulk-order-enquiry] Error:', err)
    return NextResponse.json({ error: 'Failed to send enquiry. Please try again.' }, { status: 500 })
  }
}
