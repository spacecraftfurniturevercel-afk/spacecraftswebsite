import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { sendEmail } from '../../../lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spacecraftfurniturevercel@gmail.com'
const ADMIN_EMAIL_2 = process.env.ADMIN_EMAIL_2 || ''
const ADMIN_EMAILS = [...new Set([ADMIN_EMAIL, ADMIN_EMAIL_2].filter(Boolean))].join(',')
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Spacecrafts Furniture'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spacecraftsfurniture.in'

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 })
    }
    if (!email && !phone) {
      return NextResponse.json({ error: 'Please provide at least your email or phone number.' }, { status: 400 })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Save to DB
    const supabase = createSupabaseServerClient()
    const { data: enquiry, error: dbErr } = await supabase
      .from('enquiries')
      .insert({
        type: 'contact',
        source: 'form',
        status: 'new',
        name,
        email: email || null,
        phone: phone || null,
        subject: subject || null,
        message,
      })
      .select('id')
      .single()
    if (dbErr) console.error('[contact] DB insert error:', dbErr.message)

    const enquiryId = enquiry?.id

    const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a1a;padding:24px 32px;">
  <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">${SITE_NAME}</h1>
  <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">New Contact Message${enquiryId ? ` #${enquiryId}` : ''}</p>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">&#128138; New Contact Message</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    ${enquiryId ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Ref #</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">${enquiryId}</td></tr>` : ''}
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;font-weight:500;">${name}</td></tr>
    ${email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;"><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a></td></tr>` : ''}
    ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;"><a href="tel:${phone}" style="color:#2563eb;text-decoration:none;">${phone}</a></td></tr>` : ''}
    ${subject ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">${subject}</td></tr>` : ''}
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
  <div style="font-size:48px;margin-bottom:16px;">&#128522;</div>
  <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Message Received!</h2>
  <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">Hi ${name}, thank you for reaching out. We will respond to your message within 24 hours.</p>
  ${subject ? `<p style="margin:0 0 8px;font-size:13px;color:#777;">Subject: <em>${subject}</em></p>` : ''}
  ${enquiryId ? `<p style="margin:0;font-size:13px;color:#888;">Reference: #${enquiryId}</p>` : ''}
</td></tr>
<tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
  <p style="margin:0;font-size:12px;color:#999;">You can also reach us at <a href="tel:09003003733" style="color:#666;">090030 03733</a></p>
</td></tr>
</table>
</td></tr></table></body></html>`

    await Promise.all([
      sendEmail({ to: ADMIN_EMAILS, subject: `Contact: ${subject || 'General Enquiry'} — ${name}`, html: adminHtml }),
      email ? sendEmail({ to: email, subject: `Message Received — ${SITE_NAME}`, html: userHtml }) : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, enquiry_id: enquiryId })
  } catch (err) {
    console.error('[contact] Error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
