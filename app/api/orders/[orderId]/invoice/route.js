import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerClient } from '../../../../../lib/supabaseClient'

/**
 * GET /api/orders/:orderId/invoice
 * Generate and return an HTML invoice for the order
 */
export async function GET(request, { params }) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = params

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('profile_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Fetch delivery address via service role (session client blocked by RLS)
    let address = null
    if (order.address_id) {
      const adminSupabase = createSupabaseServerClient()
      const { data: addressData } = await adminSupabase
        .from('addresses')
        .select('*')
        .eq('id', order.address_id)
        .single()
      address = addressData
    }

    const items = orderItems || []
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    const invoiceNumber = `INV-${String(order.id).padStart(6, '0')}`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber} - Spacecrafts Furniture</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #fff; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
    
    /* Header */
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid #1a1a1a; }
    .brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
    .brand p { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; font-weight: 300; color: #1a1a1a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .invoice-meta .detail { font-size: 12px; color: #6b7280; line-height: 1.8; }
    .invoice-meta .detail strong { color: #1a1a1a; }
    
    /* Addresses */
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .address-block h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 12px; font-weight: 600; }
    .address-block p { font-size: 13px; color: #374151; line-height: 1.7; }
    .address-block strong { color: #1a1a1a; font-weight: 700; }
    
    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .items-table thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: left; }
    .items-table thead th:last-child, .items-table thead th:nth-child(3), .items-table thead th:nth-child(4) { text-align: right; }
    .items-table tbody td { padding: 16px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
    .items-table tbody td:first-child { font-weight: 600; color: #1a1a1a; }
    .items-table tbody td:last-child, .items-table tbody td:nth-child(3), .items-table tbody td:nth-child(4) { text-align: right; }
    
    /* Totals */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 48px; }
    .totals-box { width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #6b7280; }
    .total-row.grand { padding-top: 16px; margin-top: 8px; border-top: 2px solid #1a1a1a; font-size: 18px; font-weight: 800; color: #1a1a1a; }
    
    /* Payment */
    .payment-info { background: #fafafa; border-radius: 8px; padding: 20px 24px; margin-bottom: 40px; }
    .payment-info h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 12px; font-weight: 600; }
    .payment-row { display: flex; gap: 32px; font-size: 13px; color: #374151; }
    .payment-row span { display: flex; gap: 6px; }
    .payment-row strong { color: #1a1a1a; }
    
    /* Footer */
    .invoice-footer { text-align: center; padding-top: 32px; border-top: 1px solid #e5e7eb; }
    .invoice-footer p { font-size: 11px; color: #9ca3af; line-height: 1.8; }
    
    /* Print */
    @media print {
      body { background: #fff; }
      .invoice { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="invoice-header">
      <div class="brand">
        <h1>Spacecrafts Furniture</h1>
        <p>Premium Furniture & Home Decor</p>
      </div>
      <div class="invoice-meta">
        <h2>Invoice</h2>
        <div class="detail">
          <strong>Invoice No:</strong> ${invoiceNumber}<br>
          <strong>Date:</strong> ${orderDate}<br>
          <strong>Order ID:</strong> #${order.id}${order.razorpay_payment_id ? `<br><strong>Payment ID:</strong> ${order.razorpay_payment_id}` : ''}
        </div>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <h3>From</h3>
        <p>
          <strong>Spacecrafts Furniture</strong><br>
          94A/1, 3rd Main Road<br>
          Ambattur, Chennai - 600053<br>
          Tamil Nadu, India<br>
          Phone: 090030 03733
        </p>
      </div>
      <div class="address-block">
        <h3>Bill To</h3>
        ${address ? `<p>
          <strong>${address.full_name || order.customer_name || ''}</strong><br>
          ${address.address_line1 || address.line1 || ''}<br>
          ${(address.address_line2 || address.line2) ? (address.address_line2 || address.line2) + '<br>' : ''}
          ${address.city || ''}, ${address.state || ''} - ${address.pincode || address.postal_code || ''}<br>
          ${(address.phone || order.customer_phone) ? 'Phone: ' + (address.phone || order.customer_phone) : ''}
        </p>` : `<p><strong>${order.customer_name || user.email || 'Customer'}</strong>${order.customer_email ? '<br>' + order.customer_email : ''}</p>`}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:45%">Item</th>
          <th style="width:15%">Qty</th>
          <th style="width:20%">Unit Price</th>
          <th style="width:20%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
        <tr>
          <td>${item.name || item.product_name || 'Product'}</td>
          <td>${item.quantity}</td>
          <td>&#8377;${Number(item.unit_price).toLocaleString('en-IN')}</td>
          <td>&#8377;${Number(item.unit_price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>&#8377;${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${order.shipping_cost ? `<div class="total-row">
          <span>Shipping</span>
          <span>&#8377;${Number(order.shipping_cost).toLocaleString('en-IN')}</span>
        </div>` : ''}
        ${order.discount ? `<div class="total-row">
          <span>Discount</span>
          <span>-&#8377;${Number(order.discount).toLocaleString('en-IN')}</span>
        </div>` : ''}
        <div class="total-row grand">
          <span>Total</span>
          <span>&#8377;${Number(order.total).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="payment-info">
      <h3>Payment Information</h3>
      <div class="payment-row">
        <span><strong>Method:</strong> ${(order.payment_method || 'Razorpay').toUpperCase()}</span>
        <span><strong>Status:</strong> ${(order.payment_status || order.status || 'Confirmed').toUpperCase()}</span>
      </div>
    </div>

    <div class="invoice-footer">
      <p>
        Thank you for your purchase!<br>
        This is a computer-generated invoice and does not require a signature.<br>
        For queries, contact us at support@spacecraftsfurniture.in or call 090030 03733
      </p>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${invoiceNumber}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
