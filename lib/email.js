import nodemailer from 'nodemailer'

const EMAIL_FROM = process.env.EMAIL_FROM || 'spacecraftfurniturevercel@gmail.com'
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spacecraftfurniturevercel@gmail.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Spacecrafts Furniture'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacecraftsfurniture.vercel.app'

// ─── Gmail SMTP Transporter ──────────────────────────────────────────────────

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_FROM,
        pass: EMAIL_APP_PASSWORD,
      },
    })
  }
  return transporter
}

// ─── Core Send Function ──────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  if (!EMAIL_APP_PASSWORD) {
    console.log('EMAIL_APP_PASSWORD not configured; skipping email to:', to)
    return { ok: false, reason: 'no_app_password' }
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${SITE_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      text: text || subject,
      html: html || undefined,
    })
    console.log('Email sent:', info.messageId, 'to:', to)
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('Email error:', err.message)
    return { ok: false, reason: 'smtp_error', message: err.message }
  }
}

// ─── HTML Template Wrapper ───────────────────────────────────────────────────

function emailWrapper(title, bodyContent) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<!-- Header -->
<tr><td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">${SITE_NAME}</h1>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px;">
${bodyContent}
</td></tr>
<!-- Footer -->
<tr><td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
<p style="margin:4px 0 0;font-size:12px;color:#999;">
<a href="${SITE_URL}" style="color:#666;text-decoration:none;">${SITE_URL.replace(/https?:\/\//, '')}</a>
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

// ─── Order Confirmation (after payment) ──────────────────────────────────────

function buildOrderConfirmationHtml({ order, items, address, customerName }) {
  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:right;">₹${(item.unit_price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('')

  const addressText = address
    ? `${address.line1 || address.address_line1 || ''}${address.line2 || address.address_line2 ? ', ' + (address.line2 || address.address_line2) : ''}, ${address.city || ''}, ${address.state || ''} - ${address.postal_code || address.pincode || ''}`
    : 'N/A'

  return emailWrapper('Order Confirmed', `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#22c55e;line-height:56px;text-align:center;">
        <span style="color:#fff;font-size:28px;">✓</span>
      </div>
      <h2 style="margin:16px 0 4px;font-size:22px;color:#1a1a1a;">Payment Successful!</h2>
      <p style="margin:0;color:#666;font-size:14px;">Thank you for your order, ${customerName || 'Customer'}.</p>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <table width="100%" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;color:#6b7280;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:600;">#${String(order.id).slice(0, 8)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Date</td><td style="padding:4px 0;text-align:right;">${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Payment</td><td style="padding:4px 0;text-align:right;">₹${order.total?.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>
    <h3 style="font-size:15px;color:#1a1a1a;margin:20px 0 8px;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="border-bottom:2px solid #e5e7eb;">
        <th style="padding:8px 0;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">ITEM</th>
        <th style="padding:8px 0;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">QTY</th>
        <th style="padding:8px 0;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">AMOUNT</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0;font-size:15px;font-weight:700;">Total</td>
        <td style="padding:12px 0;text-align:right;font-size:15px;font-weight:700;">₹${order.total?.toLocaleString('en-IN')}</td>
      </tr>
    </table>
    <h3 style="font-size:15px;color:#1a1a1a;margin:20px 0 8px;">Delivery Address</h3>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${addressText}</p>
    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Order</a>
    </div>
  `)
}

function buildAdminNewOrderHtml({ order, items, address, customerName, customerEmail, customerPhone }) {
  const itemsList = (items || []).map(item => `• ${item.name} × ${item.quantity} — ₹${(item.unit_price * item.quantity).toLocaleString('en-IN')}`).join('<br>')

  const addressText = address
    ? `${address.line1 || address.address_line1 || ''}${address.line2 || address.address_line2 ? ', ' + (address.line2 || address.address_line2) : ''}, ${address.city || ''}, ${address.state || ''} - ${address.postal_code || address.pincode || ''}`
    : 'N/A'

  return emailWrapper('New Order Received', `
    <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;">🛒 New Order Received</h2>
    <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-bottom:20px;">
      <table width="100%" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;color:#92400e;font-weight:600;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:700;">#${String(order.id).slice(0, 8)}</td></tr>
        <tr><td style="padding:4px 0;color:#92400e;font-weight:600;">Total</td><td style="padding:4px 0;text-align:right;font-weight:700;">₹${order.total?.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:4px 0;color:#92400e;font-weight:600;">Payment</td><td style="padding:4px 0;text-align:right;">Razorpay (Completed)</td></tr>
      </table>
    </div>
    <h3 style="font-size:15px;color:#1a1a1a;margin:16px 0 8px;">Customer</h3>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
      ${customerName || 'N/A'}<br>
      ${customerEmail || 'N/A'}<br>
      ${customerPhone || 'N/A'}
    </p>
    <h3 style="font-size:15px;color:#1a1a1a;margin:16px 0 8px;">Items</h3>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${itemsList}</p>
    <h3 style="font-size:15px;color:#1a1a1a;margin:16px 0 8px;">Delivery Address</h3>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${addressText}</p>
    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}/admin/shipping" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Manage Shipping →</a>
    </div>
  `)
}

// ─── Shipment Created Email ──────────────────────────────────────────────────

function buildShipmentCreatedHtml({ order, awb, courierName, estimatedDelivery, customerName }) {
  return emailWrapper('Order Shipped', `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#3b82f6;line-height:56px;text-align:center;">
        <span style="color:#fff;font-size:24px;">🚚</span>
      </div>
      <h2 style="margin:16px 0 4px;font-size:22px;color:#1a1a1a;">Your Order Has Been Shipped!</h2>
      <p style="margin:0;color:#666;font-size:14px;">Hi ${customerName || 'Customer'}, your order is on its way.</p>
    </div>
    <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:20px;">
      <table width="100%" style="font-size:14px;color:#374151;">
        <tr><td style="padding:6px 0;color:#1e40af;font-weight:600;">Order ID</td><td style="padding:6px 0;text-align:right;">#${String(order.id).slice(0, 8)}</td></tr>
        <tr><td style="padding:6px 0;color:#1e40af;font-weight:600;">Courier</td><td style="padding:6px 0;text-align:right;">${courierName || 'Assigned'}</td></tr>
        ${awb ? `<tr><td style="padding:6px 0;color:#1e40af;font-weight:600;">Tracking Number</td><td style="padding:6px 0;text-align:right;font-family:monospace;font-weight:700;">${awb}</td></tr>` : ''}
        ${estimatedDelivery ? `<tr><td style="padding:6px 0;color:#1e40af;font-weight:600;">Est. Delivery</td><td style="padding:6px 0;text-align:right;">${estimatedDelivery}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${SITE_URL}/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Track Your Order</a>
    </div>
  `)
}

function buildAdminShipmentCreatedHtml({ order, awb, courierName, shippingCost, systemOrderId }) {
  return emailWrapper('Shipment Created', `
    <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;">📦 Shipment Created</h2>
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px;">
      <table width="100%" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;font-weight:600;">Order ID</td><td style="padding:4px 0;text-align:right;">#${String(order.id).slice(0, 8)}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">BigShip Order</td><td style="padding:4px 0;text-align:right;">${systemOrderId || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Courier</td><td style="padding:4px 0;text-align:right;">${courierName || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">AWB</td><td style="padding:4px 0;text-align:right;font-family:monospace;">${awb || 'Pending'}</td></tr>
        ${shippingCost ? `<tr><td style="padding:4px 0;font-weight:600;">Shipping Cost</td><td style="padding:4px 0;text-align:right;">₹${shippingCost}</td></tr>` : ''}
        <tr><td style="padding:4px 0;font-weight:600;">Order Total</td><td style="padding:4px 0;text-align:right;font-weight:700;">₹${order.total?.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${SITE_URL}/admin/shipping" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View in Dashboard →</a>
    </div>
  `)
}

// ─── Shipping Status Update Email ────────────────────────────────────────────

function buildStatusUpdateHtml({ order, status, awb, courierName, customerName, scanLocation, scanRemarks }) {
  const statusColors = {
    'In-Transit': '#f59e0b',
    'Out for Delivery': '#3b82f6',
    'Delivered': '#22c55e',
    'Cancelled': '#ef4444',
    'RTO In Transit': '#8b5cf6',
    'RTO Delivered': '#8b5cf6',
    'Undelivered': '#ef4444',
  }
  const color = statusColors[status] || '#6b7280'

  const isDelivered = status === 'Delivered'

  return emailWrapper(`Order ${status}`, `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:8px 24px;border-radius:20px;background:${color}18;color:${color};font-weight:700;font-size:16px;">
        ${status}
      </div>
      <h2 style="margin:16px 0 4px;font-size:20px;color:#1a1a1a;">
        ${isDelivered ? 'Your Order Has Been Delivered!' : `Shipping Update for Order #${String(order.id).slice(0, 8)}`}
      </h2>
      <p style="margin:0;color:#666;font-size:14px;">Hi ${customerName || 'Customer'}</p>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <table width="100%" style="font-size:14px;color:#374151;">
        <tr><td style="padding:6px 0;color:#6b7280;">Order ID</td><td style="padding:6px 0;text-align:right;">#${String(order.id).slice(0, 8)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Courier</td><td style="padding:6px 0;text-align:right;">${courierName || 'N/A'}</td></tr>
        ${awb ? `<tr><td style="padding:6px 0;color:#6b7280;">AWB</td><td style="padding:6px 0;text-align:right;font-family:monospace;">${awb}</td></tr>` : ''}
        ${scanLocation ? `<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;text-align:right;">${scanLocation}</td></tr>` : ''}
        ${scanRemarks ? `<tr><td style="padding:6px 0;color:#6b7280;">Details</td><td style="padding:6px 0;text-align:right;">${scanRemarks}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${SITE_URL}/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Track Order</a>
    </div>
  `)
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Old compat — keep for any existing callers */
export async function sendOrderEmail(order, toEmail) {
  return sendEmail({
    to: toEmail,
    subject: `Order confirmation #${order.id}`,
    text: `Thanks for your order. Order #${order.id} total ${order.total} ${order.currency || 'INR'}`,
  })
}

/** Send order confirmation to customer + admin after payment */
export async function sendOrderConfirmationEmails({ order, items, address, customerName, customerEmail, customerPhone }) {
  const results = { customer: null, admin: null }

  // Customer email
  if (customerEmail) {
    results.customer = await sendEmail({
      to: customerEmail,
      subject: `Order Confirmed — #${String(order.id).slice(0, 8)} | ${SITE_NAME}`,
      html: buildOrderConfirmationHtml({ order, items, address, customerName }),
    })
  }

  // Admin email
  results.admin = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🛒 New Order #${String(order.id).slice(0, 8)} — ₹${order.total?.toLocaleString('en-IN')}`,
    html: buildAdminNewOrderHtml({ order, items, address, customerName, customerEmail, customerPhone }),
  })

  return results
}

/** Send shipment created notification to customer + admin */
export async function sendShipmentCreatedEmails({ order, awb, courierName, shippingCost, systemOrderId, customerName, customerEmail }) {
  const results = { customer: null, admin: null }

  if (customerEmail) {
    results.customer = await sendEmail({
      to: customerEmail,
      subject: `Your Order Has Been Shipped! 🚚 #${String(order.id).slice(0, 8)} | ${SITE_NAME}`,
      html: buildShipmentCreatedHtml({ order, awb, courierName, customerName }),
    })
  }

  results.admin = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `📦 Shipment Created — Order #${String(order.id).slice(0, 8)} via ${courierName || 'BigShip'}`,
    html: buildAdminShipmentCreatedHtml({ order, awb, courierName, shippingCost, systemOrderId }),
  })

  return results
}

/** Send shipping status update to customer */
export async function sendShippingStatusEmail({ order, status, awb, courierName, customerName, customerEmail, scanLocation, scanRemarks }) {
  if (!customerEmail) return { ok: false, reason: 'no_email' }

  return sendEmail({
    to: customerEmail,
    subject: `Order ${status} — #${String(order.id).slice(0, 8)} | ${SITE_NAME}`,
    html: buildStatusUpdateHtml({ order, status, awb, courierName, customerName, scanLocation, scanRemarks }),
  })
}

/** Send delivery confirmed email to customer + admin */
export async function sendDeliveryConfirmedEmails({ order, awb, courierName, customerName, customerEmail }) {
  const results = { customer: null, admin: null }

  if (customerEmail) {
    results.customer = await sendEmail({
      to: customerEmail,
      subject: `Order Delivered! ✅ #${String(order.id).slice(0, 8)} | ${SITE_NAME}`,
      html: buildStatusUpdateHtml({ order, status: 'Delivered', awb, courierName, customerName }),
    })
  }

  results.admin = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `✅ Order Delivered — #${String(order.id).slice(0, 8)}`,
    html: buildStatusUpdateHtml({ order, status: 'Delivered', awb, courierName, customerName: 'Admin' }),
  })

  return results
}
