import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const EMAIL_FROM = process.env.EMAIL_FROM || 'spacecraftsdigital@gmail.com'
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spacecraftfurniturevercel@gmail.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Spacecrafts Furniture'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spacecraftsfurniture.in'

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

export async function POST(request) {
  try {
    const { name, email, phone, message, productId, productName, productSlug, productPrice } = await request.json()

    if (!name || (!email && !phone) || !message) {
      return NextResponse.json({ error: 'Name, message, and at least one of email or phone are required' }, { status: 400 })
    }

    // Basic email format check (only when email is provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const productUrl = productSlug ? `${SITE_URL}/products/${productSlug}` : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:#1a1a1a;padding:24px 32px;">
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">New Product Enquiry</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1a1a1a;">Product Enquiry Received</h2>
          ${productName ? `
          <div style="background:#f9f9fb;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #eee;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">${productName}</p>
            ${productPrice ? `<p style="margin:0 0 4px;font-size:14px;color:#666;">Price: ₹${Number(productPrice).toLocaleString('en-IN')}</p>` : ''}
            ${productUrl ? `<a href="${productUrl}" style="font-size:13px;color:#2563eb;text-decoration:none;">View Product →</a>` : ''}
          </div>
          ` : ''}
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;font-weight:500;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;"><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a></td>
            </tr>
            ${phone ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Phone</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;"><a href="tel:${phone}" style="color:#2563eb;text-decoration:none;">${phone}</a></td>
            </tr>` : ''}
          </table>
          <div style="background:#f9f9fb;border-radius:8px;padding:16px;border:1px solid #eee;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
            <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9f9fb;padding:20px 32px;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;text-align:center;">This enquiry was submitted from <a href="${SITE_URL}" style="color:#2563eb;text-decoration:none;">${SITE_NAME}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    if (!EMAIL_APP_PASSWORD) {
      console.warn('[enquiry] EMAIL_APP_PASSWORD not set — logging enquiry instead')
      console.warn('[enquiry]', { name, email, phone, message, productName })
      return NextResponse.json({ success: true, message: 'Enquiry received' })
    }

    await getTransporter().sendMail({
      from: `"${SITE_NAME}" <${EMAIL_FROM}>`,
      to: ADMIN_EMAIL,
      replyTo: email || undefined,
      subject: `Product Enquiry: ${productName || 'General'} — ${name}`,
      html,
      text: `New enquiry from ${name} (${email}${phone ? ', ' + phone : ''}) about ${productName || 'a product'}:\n\n${message}`,
    })

    return NextResponse.json({ success: true, message: 'Enquiry sent successfully' })
  } catch (error) {
    console.error('Enquiry API error:', error)
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 })
  }
}
