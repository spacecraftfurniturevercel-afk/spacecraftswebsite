import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * GET /api/test-email
 * Admin-only: tests SMTP connection and sends a test email.
 * Remove this file after debugging.
 */
export async function GET(request) {
  const EMAIL_FROM = process.env.EMAIL_FROM
  const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const ADMIN_EMAIL_2 = process.env.ADMIN_EMAIL_2 || ''

  // Config check
  const config = {
    EMAIL_FROM: EMAIL_FROM || '(not set)',
    EMAIL_APP_PASSWORD: EMAIL_APP_PASSWORD ? `set (${EMAIL_APP_PASSWORD.length} chars)` : '(NOT SET)',
    ADMIN_EMAIL: ADMIN_EMAIL || '(not set)',
    ADMIN_EMAIL_2: ADMIN_EMAIL_2 || '(not set)',
  }

  if (!EMAIL_APP_PASSWORD || !EMAIL_FROM) {
    return NextResponse.json({ ok: false, error: 'EMAIL_FROM or EMAIL_APP_PASSWORD not configured', config })
  }

  // Test SMTP connection
  let verifyResult = null
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_FROM, pass: EMAIL_APP_PASSWORD },
    })
    await transporter.verify()
    verifyResult = 'SMTP connection OK'

    // Send test email
    const to = [ADMIN_EMAIL, ADMIN_EMAIL_2].filter(Boolean).join(',')
    const info = await transporter.sendMail({
      from: `"Spacecrafts Test" <${EMAIL_FROM}>`,
      to,
      subject: `✅ Test Email — ${new Date().toLocaleString('en-IN')}`,
      html: `<p>This is a test email sent from <strong>${EMAIL_FROM}</strong> to <strong>${to}</strong>.</p><p>If you received this, email is working correctly.</p>`,
    })

    return NextResponse.json({
      ok: true,
      smtp: verifyResult,
      messageId: info.messageId,
      sentTo: to,
      sentFrom: EMAIL_FROM,
      config,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      smtp: verifyResult,
      error: err.message,
      errorCode: err.code,
      config,
    })
  }
}
