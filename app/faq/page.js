'use client'

import { useState } from 'react'
import Link from 'next/link'

const faqs = [
  {
    category: 'Orders & Payment',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets through Razorpay. Cash on delivery is available for select pin codes.' },
      { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via email. You can also track your order from the "My Orders" section in your account.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are dispatched. Once shipped, cancellation is not possible but you may request a return after delivery. Custom-made items cannot be cancelled once production begins.' },
      { q: 'Is it safe to pay online?', a: 'Yes. All payments are processed through Razorpay, which uses bank-grade encryption and is PCI DSS compliant. We never store your card details.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 5–10 business days depending on your location. Large or custom furniture may take 10–15 business days.' },
      { q: 'Do you deliver across India?', a: 'Yes, we deliver to most pin codes across India through our logistics partners. Delivery to remote areas may take a few extra days.' },
      { q: 'What are the shipping charges?', a: 'Shipping charges are calculated based on your delivery pin code, item weight, and dimensions. The exact charges are displayed at checkout.' },
      { q: 'Will I be notified before delivery?', a: 'Yes, you will receive email and SMS notifications with tracking updates. Our delivery partner will also contact you before attempting delivery.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for manufacturing defects or transit damage. Items must be unused and in original packaging. Custom-made items are non-returnable unless defective.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 7–10 business days after we receive and inspect the returned product. The amount is credited to your original payment method.' },
      { q: 'What if my furniture arrives damaged?', a: 'Take photos immediately and report the damage within 48 hours. We will arrange a free replacement or full refund for transit-damaged items.' },
    ],
  },
  {
    category: 'Products & Customisation',
    questions: [
      { q: 'Do you offer custom furniture?', a: 'Yes! We specialise in custom-made furniture tailored to your space and requirements. Contact us with your measurements and preferences for a quote.' },
      { q: 'What materials do you use?', a: 'We use high-quality engineered wood, solid wood, premium fabrics, and durable hardware sourced from trusted vendors. Material details are listed on each product page.' },
      { q: 'Do you provide assembly?', a: 'Professional assembly/installation is available in Chennai and surrounding areas. For other locations, assembly instructions are included with the product.' },
      { q: 'Can I see furniture before buying?', a: 'Yes, visit our showroom at Ambattur Industrial Estate, Chennai. You can also request a video call to see products in detail.' },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 22, color: '#999', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: '0 0 18px', paddingRight: 40 }}>{a}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.5 }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto' }}>Find answers to common questions about our products and services</p>
      </section>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px 80px' }}>
        {faqs.map((cat, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', paddingBottom: 12, borderBottom: '2px solid #1a1a1a' }}>{cat.category}</h2>
            {cat.questions.map((faq, j) => (
              <FAQItem key={j} q={faq.q} a={faq.a} />
            ))}
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 28, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e40af', margin: '0 0 8px' }}>Still Have Questions?</h3>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 20px' }}>Our team is ready to help. Reach out and we will get back to you within 24 hours.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Contact Us</Link>
            <a href="tel:09003003733" style={{ display: 'inline-block', padding: '12px 32px', background: '#fff', color: '#1a1a1a', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, border: '1.5px solid #1a1a1a' }}>Call: 090030 03733</a>
          </div>
        </div>
      </div>
    </div>
  )
}
