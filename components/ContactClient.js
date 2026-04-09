'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './ContactPage.module.css'

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactMethods = [
    {
      icon: '📞',
      title: 'Call Us',
      value: '090030 03733 / 98402 22779',
      link: 'tel:09003003733',
      desc: 'Mon-Fri: 10 AM - 9:30 PM, Sat-Sun: 10 AM - 10 PM'
    },
    {
      icon: '📧',
      title: 'Email Us',
      value: 'support@spacecraftsfurniture.in',
      link: 'mailto:support@spacecraftsfurniture.in',
      desc: 'We respond within 24 hours'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      value: 'Ambattur Industrial Estate',
      link: 'https://maps.google.com/?q=94A/1+3rd+Main+Rd+Ambattur+Chennai',
      desc: '8,000 sq. ft. Modern Showroom'
    }
  ]

  const socialLinks = [
    { name: 'Instagram', icon: '📷', url: 'https://www.instagram.com/spacecraftsfurniture', label: '@spacecraftsfurniture' },
    { name: 'Facebook', icon: '👍', url: 'https://www.facebook.com/spacecraftsfurniture', label: 'Spacecrafts Furniture' },
    { name: 'YouTube', icon: '▶️', url: 'https://www.youtube.com/@spacecraftsfurniture', label: 'Spacecrafts Furniture' }
  ]

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroSubtitle}>We'd love to hear from you. Reach out to us for any inquiries or custom furniture solutions.</p>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Contact Methods Grid */}
        <section className={styles.contactMethodsSection}>
          <div className={styles.methodsGrid}>
            {contactMethods.map((method, idx) => (
              <a key={idx} href={method.link} target={method.link.startsWith('http') ? '_blank' : undefined} rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined} className={styles.methodCard}>
                <div className={styles.methodIcon}>{method.icon}</div>
                <h3>{method.title}</h3>
                <p className={styles.methodValue}>{method.value}</p>
                <p className={styles.methodDesc}>{method.desc}</p>
                <div className={styles.methodArrow}>→</div>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className={styles.formSection}>
          <div className={styles.formLayout}>
            {/* Form Column */}
            <div className={styles.formColumn}>
              <h2 className={styles.sectionTitle}>Send us a Message</h2>
              <p className={styles.formDesc}>Fill out the form below and our team will get back to you as soon as possible.</p>

              {submitted && (
                <div className={styles.successMessage}>
                  ✓ Thank you for your message! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your Phone Number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your needs..."
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Info Column */}
            <div className={styles.infoColumn}>
              <h2 className={styles.sectionTitle}>Store Information</h2>

              <div className={styles.infoCard}>
                <h4>Address</h4>
                <p>94A/1, 3rd Main Rd<br />Old Ambattur, Attipattu<br />Ambattur Industrial Estate<br />Chennai, Tamil Nadu 600058</p>
              </div>

              <div className={styles.infoCard}>
                <h4>Business Hours</h4>
                <p><strong>Monday - Saturday:</strong> 10:00 AM - 8:00 PM<br /><strong>Sunday:</strong> 11:00 AM - 6:00 PM</p>
              </div>



              <div className={styles.infoCard}>
                <h4>Follow Us</h4>
                <div className={styles.socialGrid}>
                  {socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title={social.label}
                    >
                      <span className={styles.socialIcon}>{social.icon}</span>
                      <span className={styles.socialLabel}>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <Link href="/store-locator" className={styles.visitBtn}>
                Visit Our Showroom →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>What are your business hours?</h4>
              <p>We're open Monday to Saturday from 10:00 AM to 8:00 PM, and Sunday from 11:00 AM to 6:00 PM. We're closed on national holidays.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Do you offer custom furniture solutions?</h4>
              <p>Yes! We specialize in custom-made furniture tailored to your space and style. Visit our showroom or contact us to discuss your needs with our design consultants.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>What is your delivery timeline?</h4>
              <p>We offer free delivery and installation across Chennai. Delivery timelines vary based on product type and customization. Contact us for specific details.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>How can I schedule a consultation?</h4>
              <p>You can call us at 090030 03733 or 98402 22779, email us, or visit our showroom directly. Our design consultants are available to help you plan your furniture needs.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            'name': 'Contact Spacecrafts Furniture',
            'description': 'Get in touch with Spacecrafts Furniture for inquiries, custom furniture solutions, and store information.',
            'url': 'https://www.spacecraftsfurniture.in/contact',
            'mainEntity': {
              '@type': 'LocalBusiness',
              'name': 'Spacecrafts Furniture',
              'telephone': '+919003003733',
              'email': 'support@spacecraftsfurniture.in',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': '94A/1, 3rd Main Rd, Old Ambattur, Attipattu',
                'addressLocality': 'Chennai',
                'addressRegion': 'Tamil Nadu',
                'postalCode': '600058',
                'addressCountry': 'IN'
              }
            }
          })
        }}
      />
    </div>
  )
}
