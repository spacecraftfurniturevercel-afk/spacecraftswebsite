export const metadata = {
  title: 'Privacy Policy | Spacecrafts Furniture',
  description: 'Read our privacy policy to understand how Spacecrafts Furniture collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  const updated = '18 April 2026'
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40, borderBottom: '1px solid #e5e7eb', paddingBottom: 24 }}>
        Last updated: {updated}
      </p>

      {[
        {
          title: '1. Information We Collect',
          body: `When you visit our website or place an order, we collect the following information:
          - Personal details: name, email address, phone number
          - Delivery address and billing information
          - Order history and transaction data
          - Device and browser information (via cookies and analytics)
          - Communication records when you contact our support team`
        },
        {
          title: '2. How We Use Your Information',
          body: `We use your information to:
          - Process and fulfil your orders
          - Send order confirmations, invoices, and delivery updates
          - Respond to your enquiries and provide customer support
          - Improve our website, products, and services
          - Send promotional offers (only with your consent; you can unsubscribe anytime)
          - Comply with legal obligations`
        },
        {
          title: '3. Sharing of Information',
          body: `We do not sell your personal information. We may share it with:
          - Logistics and courier partners (e.g., BigShip, Delhivery) to fulfil deliveries
          - Payment processors (e.g., Razorpay) to handle transactions securely
          - Cloud service providers who host our platform (e.g., Supabase)
          - Legal authorities if required by law

          All third-party partners are bound by their own privacy policies and applicable data protection laws.`
        },
        {
          title: '4. Cookies',
          body: `Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You may disable cookies in your browser settings, though some features may not function correctly without them.`
        },
        {
          title: '5. Data Security',
          body: `We implement industry-standard security measures including SSL encryption to protect your data during transmission. Passwords are hashed and stored securely. We regularly review our data practices to prevent unauthorised access.`
        },
        {
          title: '6. Data Retention',
          body: `We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. You may request deletion of your account and associated data by contacting us.`
        },
        {
          title: '7. Your Rights',
          body: `You have the right to:
          - Access the personal information we hold about you
          - Request correction of inaccurate data
          - Request deletion of your data
          - Withdraw consent for marketing communications at any time
          - Lodge a complaint with the relevant data protection authority

          To exercise any of these rights, contact us at spacecraftsdigital@gmail.com.`
        },
        {
          title: '8. Children\'s Privacy',
          body: `Our services are not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such data, please contact us immediately.`
        },
        {
          title: '9. Changes to This Policy',
          body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the revised policy.`
        },
        {
          title: '10. Contact Us',
          body: `If you have questions about this Privacy Policy, please reach out:

          Spacecrafts Furniture
          94A/1, 3rd Main Road, Ambattur, Chennai – 600053, Tamil Nadu
          Email: spacecraftsdigital@gmail.com
          Phone: 09003003733
          Website: www.spacecraftsfurniture.in`
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
