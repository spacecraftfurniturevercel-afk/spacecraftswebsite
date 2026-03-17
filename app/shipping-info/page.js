import Link from 'next/link'

export const metadata = {
  title: 'Shipping & Delivery - Spacecrafts Furniture',
  description: 'Learn about Spacecrafts Furniture shipping and delivery policies. We deliver across India with reliable courier partners. Free delivery on select orders.',
  alternates: { canonical: 'https://www.spacecraftsfurniture.in/shipping-info' },
}

const policies = [
  {
    icon: '🚚',
    title: 'Delivery Areas',
    content: 'We deliver across India through our trusted logistics partners. Delivery to remote or hard-to-reach pin codes may take additional time.',
  },
  {
    icon: '⏱️',
    title: 'Delivery Timeline',
    content: 'Standard delivery takes 5–10 business days depending on your location. Large or custom-made furniture may take 10–15 business days. You will receive a tracking number once your order is dispatched.',
  },
  {
    icon: '📦',
    title: 'Packaging & Handling',
    content: 'All furniture is carefully packaged with protective layers to prevent damage during transit. Heavy items are palletised for safe handling.',
  },
  {
    icon: '💰',
    title: 'Shipping Charges',
    content: 'Shipping charges are calculated based on the delivery pin code, weight, and dimensions of your order. Charges are displayed at checkout before payment.',
  },
  {
    icon: '📍',
    title: 'Order Tracking',
    content: 'Once dispatched, you will receive email and SMS notifications with a tracking link. You can also track your order from your account under "My Orders".',
  },
  {
    icon: '🔄',
    title: 'Rescheduling & Failed Delivery',
    content: 'If you are unavailable at the time of delivery, our courier partner will attempt re-delivery. Please contact us to reschedule. After 3 failed attempts, the order may be returned to our warehouse.',
  },
]

export default function ShippingInfo() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.5 }}>Shipping & Delivery</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto' }}>Everything you need to know about how we get your furniture to you</p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gap: 28 }}>
          {policies.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, padding: 24, background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{p.icon}</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>{p.title}</h2>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: 0 }}>{p.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: 28, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>Need Help with Your Delivery?</h3>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 20px' }}>Our team is happy to assist with any shipping or delivery queries.</p>
          <Link href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
