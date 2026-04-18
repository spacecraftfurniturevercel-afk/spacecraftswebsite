export const metadata = {
  title: 'Terms & Conditions | Spacecrafts Furniture',
  description: 'Read the terms and conditions governing use of the Spacecrafts Furniture website and purchases.',
}

export default function TermsPage() {
  const updated = '18 April 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Terms &amp; Conditions</h1>
      <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40, borderBottom: '1px solid #e5e7eb', paddingBottom: 24 }}>
        Last updated: {updated}
      </p>

      {[
        {
          title: '1. Acceptance of Terms',
          body: `By accessing or using the Spacecrafts Furniture website (spacecraftsfurniture.in) or placing an order, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.`
        },
        {
          title: '2. Products & Pricing',
          body: `- All product descriptions, images, and prices are provided in good faith and are subject to change without notice.
          - Prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.
          - We reserve the right to correct any pricing errors and may cancel orders placed at incorrect prices.
          - Product colours may vary slightly due to photography and screen calibration.`
        },
        {
          title: '3. Orders & Payment',
          body: `- Orders are confirmed only upon successful payment.
          - We accept payments via UPI, credit/debit cards, net banking, and other methods supported by Razorpay.
          - Spacecrafts Furniture is not responsible for payment failures caused by your bank or payment provider.
          - In case of a duplicate charge, please contact us within 48 hours and we will resolve it promptly.`
        },
        {
          title: '4. Shipping & Delivery',
          body: `- We deliver across India. Delivery timelines are estimates and may vary due to logistics or unforeseen circumstances.
          - Delivery charges, if any, are shown at checkout before payment.
          - Risk of loss or damage passes to you upon delivery.
          - If a product is damaged in transit, report it within 48 hours with photographs.`
        },
        {
          title: '5. Returns & Refunds',
          body: `- We accept return requests within 7 days of delivery for manufacturing defects or incorrect items.
          - Products must be in original condition, unused, and with original packaging.
          - Custom or made-to-order items are non-returnable unless defective.
          - Approved refunds will be processed within 7–10 business days to the original payment method.
          - To initiate a return, contact us at spacecraftsdigital@gmail.com with your order number and photos.`
        },
        {
          title: '6. Cancellations',
          body: `- Orders may be cancelled before they are dispatched. Contact us immediately at spacecraftsdigital@gmail.com or +91 90030 03733.
          - Once an order is shipped, cancellation is not possible. You may initiate a return after delivery.`
        },
        {
          title: '7. Intellectual Property',
          body: `All content on this website — including product images, descriptions, logos, and text — is the property of Spacecrafts Furniture. Unauthorised reproduction, distribution, or use of any content is strictly prohibited.`
        },
        {
          title: '8. Limitation of Liability',
          body: `Spacecrafts Furniture shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our liability is limited to the amount paid for the specific order in question.`
        },
        {
          title: '9. Governing Law',
          body: `These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.`
        },
        {
          title: '10. Changes to Terms',
          body: `We may update these Terms from time to time. The latest version will always be available at spacecraftsfurniture.in/terms. Continued use of our website after changes constitutes your acceptance.`
        },
        {
          title: '11. Contact Us',
          body: `For any questions regarding these Terms & Conditions:

          Spacecrafts Furniture
          94A/1, 3rd Main Road, Ambattur, Chennai – 600053, Tamil Nadu
          Email: spacecraftsdigital@gmail.com
          Phone: 09003003733`
        },
      ].map((section) => (
        <section key={section.title} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>{section.title}</h2>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{section.body}</p>
        </section>
      ))}

      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '20px 24px',
        marginTop: 40,
      }}>
        <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
          Questions? Email us at{' '}
          <a href="mailto:spacecraftsdigital@gmail.com" style={{ color: '#1a1a1a', fontWeight: 600 }}>
            spacecraftsdigital@gmail.com
          </a>{' '}
          or WhatsApp us at{' '}
          <a href="https://wa.me/919003003733" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', fontWeight: 600 }}>
            +91 90030 03733
          </a>
        </p>
      </div>
    </main>
  )
}
