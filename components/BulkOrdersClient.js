'use client'

import { useState } from 'react'

export default function BulkOrdersClient() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    gst_number: '',
    quantity: '',
    product_type: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleWhatsApp = () => {
    const lines = [
      `*Bulk Order Enquiry – Spacecrafts Furniture*`,
      ``,
      `Name: ${form.name || '—'}`,
      `Phone: ${form.phone || '—'}`,
      `Email: ${form.email || '—'}`,
      `Company: ${form.company_name || '—'}`,
      `GST: ${form.gst_number || '—'}`,
      `Product / Category: ${form.product_type || '—'}`,
      `Quantity Required: ${form.quantity || '—'}`,
      ``,
      `Requirements: ${form.message || '—'}`,
    ]
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/919003003733?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email && !form.phone) {
      setResult({ error: 'Please provide at least your email or phone number.' })
      return
    }
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/bulk-order-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true })
        setForm({ name: '', email: '', phone: '', company_name: '', gst_number: '', quantity: '', product_type: '', message: '' })
      } else {
        setResult({ error: data.error || 'Something went wrong. Please try again.' })
      }
    } catch {
      setResult({ error: 'Network error. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  const benefits = [
    { icon: '💰', title: 'Wholesale Pricing', desc: 'Exclusive rates for orders above 10 units' },
    { icon: '🎨', title: 'Custom Branding', desc: 'Fabric, colour & finish tailored to your brand' },
    { icon: '🚚', title: 'Pan-India Delivery', desc: 'Coordinated logistics for large consignments' },
    { icon: '🛡️', title: 'Dedicated Account Manager', desc: 'Single point of contact from order to delivery' },
  ]

  return (
    <div style={{ width: '100%', background: '#fff', minHeight: '100vh', fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Hero */}
      <section style={{ width: '100%', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: '#fff', textAlign: 'center', padding: '80px 20px 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(230,126,34,0.15)', border: '1px solid rgba(230,126,34,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#f39c12', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>
            Wholesale &amp; Corporate
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Buy In Bulk</h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
            Furnish your office, hotel, school or commercial space with premium furniture at wholesale prices. We handle volume orders across India.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: '#fafafa', border: '1.5px solid #eee', borderRadius: 12, padding: '24px 20px', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>{b.icon}</div>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{b.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'start' }}>

          {/* Left info */}
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>Tell us what you need</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 28px' }}>
              Fill in the form and our team will reach out within 24 hours with personalised pricing and delivery timelines for your project.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Min Order', value: '10+ units per product' },
                { label: 'Turnaround', value: '15–30 working days' },
                { label: 'Payment', value: '50% advance, 50% before dispatch' },
                { label: 'Support', value: 'Dedicated project manager' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: '#e67e22', marginTop: 7 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>{row.label}</span>
                    <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, padding: '16px 20px', background: '#fef3e2', border: '1px solid #fde68a', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                <strong>Prefer to call?</strong><br />
                <a href="tel:09003003733" style={{ color: '#92400e', textDecoration: 'none', fontWeight: 600 }}>090030 03733</a> &nbsp;/&nbsp;
                <a href="tel:09840222779" style={{ color: '#92400e', textDecoration: 'none', fontWeight: 600 }}>98402 22779</a>
              </p>
            </div>
          </div>

          {/* Right form */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            {result?.success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 60, height: 60, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✅</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>Enquiry Received!</h3>
                <p style={{ margin: 0, fontSize: 14, color: '#555', lineHeight: 1.6 }}>Thank you! Our bulk orders team will contact you within 24 hours.</p>
                <button onClick={() => setResult(null)} style={{ marginTop: 20, padding: '10px 28px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Bulk Order Enquiry</h3>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: '#888' }}>All fields marked * are required</p>

                {/* Row: Name + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Full Name *">
                    <input required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email">
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </Field>

                {/* Row: Company + GST (both optional) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Company Name" optional>
                    <input placeholder="Your company" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                  </Field>
                  <Field label="GST Number" optional>
                    <input placeholder="22AAAAA0000A1Z5" value={form.gst_number} onChange={e => setForm(f => ({ ...f, gst_number: e.target.value.toUpperCase() }))} maxLength={15} />
                  </Field>
                </div>

                {/* Row: Product Type + Quantity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Product / Category *">
                    <input required placeholder="e.g. Office chairs" value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))} />
                  </Field>
                  <Field label="Quantity Required *">
                    <input required type="number" min="1" placeholder="e.g. 50" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                  </Field>
                </div>

                {/* Message */}
                <Field label="Additional Requirements *">
                  <textarea required rows={4} placeholder="Tell us about your project, timeline, preferred materials, delivery location, etc." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
                </Field>

                {result?.error && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                    {result.error}
                  </div>
                )}

                <button type="submit" disabled={sending} style={{ width: '100%', padding: '14px', background: sending ? '#999' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', marginTop: 4 }}>
                  {sending ? (
                    <><Spin /> Sending Enquiry...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Bulk Enquiry</>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                  <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                </div>

                <button type="button" onClick={handleWhatsApp} disabled={!form.name && !form.phone && !form.email} style={{ width: '100%', padding: '13px', background: (!form.name && !form.phone && !form.email) ? '#a5d6a7' : '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: (!form.name && !form.phone && !form.email) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Send via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1.4fr"] { grid-template-columns: 1fr !important; }
        }
        input, textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          color: #1a1a1a;
          background: #fff;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus, textarea:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.06); }
        input::placeholder, textarea::placeholder { color: #bbb; }
      `}</style>
    </div>
  )
}

function Field({ label, optional, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
        {optional && <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function Spin() {
  return (
    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'bspin 0.7s linear infinite' }}>
      <style>{`@keyframes bspin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}
