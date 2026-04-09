import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { sendEmail } from '../../../lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spacecraftfurniturevercel@gmail.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Spacecrafts Furniture'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spacecraftsfurniture.in'

export async function POST(request) {
  try {
    const { name, email, phone, message, productId, productName, productSlug, productPrice, _source } = await request.json()
    const source = _source === 'whatsapp' ? 'whatsapp' : 'form'

    // For WhatsApp source, skip strict validation (fire-and-forget, user may not have filled all fields)
    if (source === 'form') {
      if (!name || (!email && !phone) || !message) {
        return NextResponse.json({ error: 'Name, message, and at least one of email or phone are required' }, { status: 400 })
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
      }
    }

    const productUrl = productSlug ? `${SITE_URL}/products/${productSlug}` : ''

    // Save to DB
    const supabase = createSupabaseServerClient()
    const { data: enquiry, error: dbErr } = await supabase
      .from('enquiries')
      .insert({
        type: 'product',
        source,
        status: 'new',
        name: name || null, email: email || null, phone: phone || null, message: message || null,
        product_id: productId ? Number(productId) : null,
        product_name: productName || null,
        product_slug: productSlug || null,
        product_price: productPrice ? Number(productPrice) : null,
      })
      .select('id')
      .single()
    if (dbErr) console.error('[enquiry] DB insert error:', dbErr.message)

    const enquiryId = enquiry?.id

    const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a1a;padding:24px 32px;">
  <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
  <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">New Product Enquiry${enquiryId ? ` #${enquiryId}` : ''}</p>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">Product Enquiry Received</h2>
  ${productName ? `<div style="background:#f9f9fb;border-radius:8px;padding:14px;margin-bottom:16px;border:1px solid #eee;">
    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">${productName}</p>
    ${productPrice ? `<p style="margin:0 0 4px;font-size:13px;color:#666;">Price: &#8377;${Number(productPrice).toLocaleString('en-IN')}</p>` : ''}
    ${productUrl ? `<a href="${productUrl}" style="font-size:13px;color:#2563eb;text-decoration:none;">View Product &rarr;</a>` : ''}
  </div>` : ''}
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    ${enquiryId ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Enquiry #</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">${enquiryId}</td></tr>` : ''}
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;font-weight:500;">${name}</td></tr>
    ${email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;"><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a></td></tr>` : ''}
    ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;"><a href="tel:${phone}" style="color:#2563eb;text-decoration:none;">${phone}</a></td></tr>` : ''}
  </table>
  <div style="background:#f9f9fb;border-radius:8px;padding:16px;border:1px solid #eee;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
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
  <div style="font-size:48px;margin-bottom:16px;">&#128172;</div>
  <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Enquiry Received!</h2>
  <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">Hi ${name}, thank you for your enquiry${productName ? ` about <strong>${productName}</strong>` : ''}. Our team will get back to you within 24 hours.</p>
  ${enquiryId ? `<p style="margin:0;font-size:13px;color:#888;">Reference: #${enquiryId}</p>` : ''}
</td></tr>
<tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
  <p style="margin:0;font-size:12px;color:#999;">For queries: <a href="mailto:support@spacecraftsfurniture.in" style="color:#666;">support@spacecraftsfurniture.in</a></p>
</td></tr>
</table>
</td></tr></table></body></html>`

    await Promise.all([
      sendEmail({ to: ADMIN_EMAIL, subject: `Product Enquiry: ${productName || 'General'} — ${name}`, html: adminHtml }),
      email ? sendEmail({ to: email, subject: `Enquiry Received — ${SITE_NAME}`, html: userHtml }) : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, message: 'Enquiry sent successfully', enquiry_id: enquiryId })
  } catch (error) {
    console.error('Enquiry API error:', error)
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 })
  }
}

