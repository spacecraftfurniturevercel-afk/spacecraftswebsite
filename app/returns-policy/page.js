import Link from 'next/link'

export const metadata = {
  title: 'Returns & Refunds Policy - Spacecrafts Furniture',
  description: 'Spacecrafts Furniture returns and refunds policy. Learn about our return window, refund process, and exchange policy for all furniture purchases.',
  alternates: { canonical: 'https://www.spacecraftsfurniture.in/returns-policy' },
}

const sections = [
  {
    title: 'Return Eligibility',
    items: [
      'Returns are accepted within 7 days of delivery for manufacturing defects or damage during transit.',
      'The product must be unused, unassembled (if delivered flat-packed), and in its original packaging.',
      'Custom-made or personalised furniture cannot be returned unless there is a manufacturing defect.',
      'Items purchased on clearance or final sale are non-returnable.',
    ],
  },
  {
    title: 'How to Request a Return',
    items: [
      'Contact us at spacecraftsdigital@gmail.com or call 090030 03733 within 7 days of delivery.',
      'Provide your order number, photos of the issue, and a brief description.',
      'Our team will review your request and respond within 24–48 hours.',
      'If approved, we will arrange pickup at no extra cost for defective/damaged items.',
    ],
  },
  {
    title: 'Refund Process',
    items: [
      'Refunds are initiated once the returned product is received and inspected at our facility.',
      'Refunds are processed to the original payment method within 7–10 business days.',
      'Shipping charges are non-refundable unless the return is due to a defect or our error.',
      'For COD orders, refunds are processed via bank transfer. Please provide your bank details.',
    ],
  },
  {
    title: 'Exchanges',
    items: [
      'Exchanges are subject to product availability.',
      'If the replacement product is of a higher value, you will need to pay the difference.',
      'Exchange requests follow the same timeline as returns — within 7 days of delivery.',
    ],
  },
  {
    title: 'Damaged in Transit',
    items: [
      'If your furniture arrives damaged, please take photos and report it within 48 hours of delivery.',
      'We will arrange a free replacement or full refund for transit-damaged items.',
      'Do not discard the packaging until the issue is resolved.',
    ],
  },
  {
    title: 'Cancellations',
    items: [
      'Orders can be cancelled before they are dispatched for a full refund.',
      'Once shipped, cancellation is not possible — you may request a return after delivery.',
      'Custom or made-to-order furniture cannot be cancelled once production has started.',
    ],
  },
]

export default function ReturnsPolicy() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.5 }}>Returns & Refunds</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto' }}>Our commitment to your satisfaction</p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px', paddingBottom: 10, borderBottom: '2px solid #f0f0f0' }}>{s.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {s.items.map((item, j) => (
                <li key={j} style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 28, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#92400e', margin: '0 0 8px' }}>Have Questions About Returns?</h3>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 20px' }}>Reach out — we are here to help resolve any issues.</p>
          <Link href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
