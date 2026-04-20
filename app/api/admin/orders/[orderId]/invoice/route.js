import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../../../lib/supabaseClient'

/**
 * GET /api/admin/orders/:orderId/invoice
 * Admin-only: generate a printable A4 HTML invoice for any order
 */
export async function GET(request, { params }) {
  try {
    // Verify admin identity
    const sessionClient = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await sessionClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin =
      user.email?.includes('@admin') ||
      user.email === process.env.ADMIN_EMAIL ||
      user.email === process.env.ADMIN_EMAIL_2

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { orderId } = params

    // Use service role to bypass RLS for all queries
    const supabase = createSupabaseServerClient()

    // Fetch order (no profile_id filter — admin can view any order)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Fetch customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', order.profile_id)
      .single()

    // Fetch delivery address
    let address = null
    if (order.address_id) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', order.address_id)
        .single()
      address = addressData
    }

    const items = orderItems || []
    const subtotal   = Number(order.subtotal)        || items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0)
    const gst        = Number(order.tax)             || 0
    const shipping   = Number(order.delivery_charge) || Number(order.shipping_cost) || 0
    const grandTotal = Number(order.total)           || subtotal + gst + shipping

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
    const invoiceNumber = `INV-${String(order.id).padStart(6, '0')}`

    const customerName  = address?.full_name   || profile?.full_name   || order.customer_name  || 'Customer'
    const customerPhone = address?.phone       || profile?.phone       || order.customer_phone || ''
    const addrLine1     = address?.address_line1 || address?.line1 || ''
    const addrLine2     = address?.address_line2 || address?.line2 || ''
    const addrCity      = address?.city     || ''
    const addrState     = address?.state    || ''
    const addrPin       = address?.pincode  || address?.postal_code || ''

    const awb       = order.tracking_number          || '&#8212;'
    const courier   = order.courier_name             || '&#8212;'
    const paymentId = order.razorpay_payment_id || order.payment_id || null
    const isCod       = (order.payment_method || '').toLowerCase() === 'cod'
    const payMethodLabel = isCod ? 'Cash on Delivery' : (order.payment_method || 'Razorpay').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const payStatus = isCod ? 'PAY ON DELIVERY' : (order.payment_status || 'Completed').toUpperCase()

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice ${invoiceNumber} &#8212; Spacecrafts Furniture</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #f3f4f6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: #fff;
      box-shadow: 0 4px 32px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
    }
    .inv-header {
      background: #1a1a1a;
      color: #fff;
      padding: 28px 36px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .inv-brand { display: flex; flex-direction: column; gap: 4px; }
    .inv-brand-tag { font-size: 11px; color: #aaa; letter-spacing: 0.5px; margin-top: 4px; }
    .inv-brand-contact { margin-top: 10px; font-size: 11px; color: #ccc; line-height: 1.7; }
    .inv-brand-contact a { color: #ccc; text-decoration: none; }
    .inv-meta { text-align: right; }
    .inv-meta-title { font-size: 26px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; color: #fff; margin-bottom: 10px; }
    .inv-meta-table { font-size: 12px; color: #ccc; line-height: 2; }
    .inv-meta-table td:first-child { padding-right: 18px; color: #888; text-align: right; }
    .inv-meta-table td:last-child { color: #fff; font-weight: 600; }
    .inv-body { padding: 28px 36px; flex: 1; }
    .addr-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 28px;
    }
    .addr-block { padding: 18px 22px; }
    .addr-block + .addr-block { border-left: 1px solid #e5e7eb; }
    .addr-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    .addr-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 5px; }
    .addr-line { font-size: 12px; color: #4b5563; line-height: 1.7; }
    .gst-strip {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;
      padding: 10px 22px; font-size: 11px; color: #6b7280; margin-bottom: 28px;
      display: flex; gap: 32px; flex-wrap: wrap;
    }
    .gst-strip span strong { color: #1a1a1a; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    .items-table thead tr { background: #1a1a1a; }
    .items-table thead th {
      font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
      color: #fff; padding: 10px 14px; text-align: left;
    }
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4),
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody tr:nth-child(even) { background: #f9fafb; }
    .items-table tbody td {
      padding: 12px 14px; font-size: 13px; color: #374151;
      border-bottom: 1px solid #f3f4f6; vertical-align: top;
    }
    .items-table tbody td:first-child { font-weight: 600; color: #111; }
    .items-table tbody td:nth-child(2),
    .items-table tbody td:nth-child(3),
    .items-table tbody td:nth-child(4),
    .items-table tbody td:last-child { text-align: right; }
    .inv-bottom { display: grid; grid-template-columns: 1fr auto; gap: 32px; margin-top: 24px; align-items: start; }
    .inv-notes { font-size: 11px; color: #6b7280; line-height: 1.8; }
    .inv-notes strong { color: #1a1a1a; display: block; margin-bottom: 4px; font-size: 12px; }
    .totals-box { min-width: 240px; }
    .total-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 7px 0; font-size: 13px; color: #6b7280;
      border-bottom: 1px solid #f3f4f6; gap: 40px;
    }
    .total-row:last-child { border-bottom: none; }
    .total-row.grand {
      padding: 12px 0 0; margin-top: 6px; font-size: 16px; font-weight: 800;
      color: #1a1a1a; border-top: 2px solid #1a1a1a; border-bottom: none;
    }
    .total-row span:last-child { font-weight: 600; color: #1a1a1a; white-space: nowrap; }
    .total-row.grand span:last-child { font-size: 18px; }
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-top: 28px;
    }
    .info-block { padding: 16px 22px; }
    .info-block + .info-block { border-left: 1px solid #e5e7eb; }
    .info-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
    .info-row .k { color: #6b7280; }
    .info-row .v { font-weight: 600; color: #1a1a1a; text-align: right; }
    .inv-footer {
      background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 36px;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
    }
    .inv-footer-left { font-size: 11px; color: #9ca3af; line-height: 1.8; }
    .inv-footer-right { font-size: 11px; color: #6b7280; text-align: right; line-height: 1.8; }
    @media print {
      body { background: #fff; }
      .page { margin: 0; box-shadow: none; width: 100%; min-height: 100%; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;padding:16px 0 0;font-family:Inter,sans-serif;">
    <button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
      &#8595; Download / Print Invoice
    </button>
  </div>

  <div class="page">
    <div class="inv-header">
      <div class="inv-brand">
        <div class="inv-brand-name">Spacecrafts Furniture</div>
        <div class="inv-brand-tag">Premium Furniture &amp; Home Decor</div>
        <div class="inv-brand-contact">
          94A/1, 3rd Main Road, Ambattur<br>
          Chennai &ndash; 600053, Tamil Nadu, India<br>
          <a href="tel:09003003733">09003003733</a> &nbsp;|&nbsp;
          <a href="mailto:spacecraftsdigital@gmail.com">spacecraftsdigital@gmail.com</a><br>
          <a href="https://www.spacecraftsfurniture.in">www.spacecraftsfurniture.in</a>
        </div>
      </div>
      <div class="inv-meta">
        <div class="inv-meta-title">Tax Invoice</div>
        <table class="inv-meta-table">
          <tr><td>Invoice No.</td><td>${invoiceNumber}</td></tr>
          <tr><td>Date</td><td>${orderDate}</td></tr>
          <tr><td>Order ID</td><td>#${order.id}</td></tr>
          <tr><td>Payment</td><td>${payStatus}</td></tr>
        </table>
      </div>
    </div>

    <div class="inv-body">
      <div class="addr-grid">
        <div class="addr-block">
          <div class="addr-label">Sold By</div>
          <div class="addr-name">Spacecrafts Furniture</div>
          <div class="addr-line">
            94A/1, 3rd Main Road, Ambattur<br>
            Chennai &ndash; 600053, Tamil Nadu<br>
            GSTIN: 33ABCDE1234F1Z5<br>
            Ph: 09003003733
          </div>
        </div>
        <div class="addr-block">
          <div class="addr-label">Shipped To</div>
          <div class="addr-name">${customerName}</div>
          <div class="addr-line">
            ${addrLine1}${addrLine2 ? '<br>' + addrLine2 : ''}<br>
            ${addrCity}${addrState ? ', ' + addrState : ''}${addrPin ? ' &ndash; ' + addrPin : ''}<br>
            ${customerPhone ? 'Ph: ' + customerPhone : ''}
          </div>
        </div>
      </div>

      <div class="gst-strip">
        <span><strong>GSTIN:</strong> 33ABCDE1234F1Z5</span>
        <span><strong>State Code:</strong> 33 (Tamil Nadu)</span>
        <span><strong>Supply Type:</strong> B2C</span>
        <span><strong>Payment Method:</strong> ${payMethodLabel}</span>
        ${order.razorpay_payment_id ? `<span><strong>Payment Ref:</strong> ${order.razorpay_payment_id}</span>` : ''}
        ${isCod ? `<span style="color:#ea580c;font-weight:600;">&#9679; Amount collectible at delivery</span>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width:42%">Description</th>
            <th style="width:8%">Qty</th>
            <th style="width:16%">Unit Price</th>
            <th style="width:14%">GST (18%)</th>
            <th style="width:20%">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const base = Number(item.unit_price) * item.quantity
            const itemGst = Math.round(base * 0.18)
            return `
          <tr>
            <td>${item.name || item.product_name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>&#8377;${Number(item.unit_price).toLocaleString('en-IN')}</td>
            <td>&#8377;${itemGst.toLocaleString('en-IN')}</td>
            <td>&#8377;${(base + itemGst).toLocaleString('en-IN')}</td>
          </tr>`
          }).join('')}
        </tbody>
      </table>

      <div class="inv-bottom">
        <div class="inv-notes">
          <strong>Terms &amp; Notes</strong>
          &#8226; This is a computer-generated invoice and does not require a signature.<br>
          &#8226; All prices are inclusive of GST (18%).<br>
          ${isCod ? '&#8226; <strong style="color:#ea580c">Cash on Delivery:</strong> &#8377;' + grandTotal.toLocaleString('en-IN') + ' to be paid in cash to the courier at delivery.<br>' : ''}
          &#8226; spacecraftsdigital@gmail.com &nbsp;|&nbsp; 09003003733
        </div>
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal (before GST)</span>
            <span>&#8377;${subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div class="total-row">
            <span>GST (18%)</span>
            <span>&#8377;${gst.toLocaleString('en-IN')}</span>
          </div>
          ${shipping > 0 ? `<div class="total-row">
            <span>Shipping</span>
            <span>&#8377;${shipping.toLocaleString('en-IN')}</span>
          </div>` : ''}
          <div class="total-row grand">
            <span>Grand Total</span>
            <span>&#8377;${grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">Shipment Details</div>
          <div class="info-row"><span class="k">Courier Partner</span><span class="v">${courier}</span></div>
          <div class="info-row"><span class="k">Tracking Number (AWB)</span><span class="v">${awb}</span></div>
          ${order.estimated_delivery ? `<div class="info-row"><span class="k">Est. Delivery</span><span class="v">${order.estimated_delivery}</span></div>` : ''}
          <div class="info-row"><span class="k">Shipping Status</span><span class="v">${(order.shipping_status || 'Processing').replace(/_/g, ' ').toUpperCase()}</span></div>
        </div>
        <div class="info-block">
          <div class="info-label">Payment Details</div>
          <div class="info-row"><span class="k">Method</span><span class="v">${payMethodLabel}</span></div>
          <div class="info-row"><span class="k">Status</span><span class="v" style="${isCod ? 'color:#ea580c' : ''}">${payStatus}</span></div>
          ${paymentId ? `<div class="info-row"><span class="k">Payment ID</span><span class="v" style="font-size:10px">${paymentId}</span></div>` : ''}
          <div class="info-row"><span class="k">Order Date</span><span class="v">${orderDate}</span></div>
          ${isCod ? `<div class="info-row" style="margin-top:6px"><span class="k" style="color:#ea580c">COD Amount</span><span class="v" style="color:#ea580c">&#8377;${grandTotal.toLocaleString('en-IN')}</span></div>` : ''}
        </div>
      </div>
    </div>

    <div class="inv-footer">
      <div class="inv-footer-left">
        Spacecrafts Furniture &nbsp;|&nbsp; GSTIN: 33ABCDE1234F1Z5<br>
        94A/1, 3rd Main Road, Ambattur, Chennai &ndash; 600053, Tamil Nadu
      </div>
      <div class="inv-footer-right">
        www.spacecraftsfurniture.in<br>
        spacecraftsdigital@gmail.com &nbsp;|&nbsp; 09003003733
      </div>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${invoiceNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating admin invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
