import styles from '../../components/AboutPage.module.css'
import Link from 'next/link'

export const metadata = {
  title: 'About Us - Spacecrafts Furniture | Premium Furniture Manufacturer Chennai',
  description: 'Learn about Spacecrafts Furniture - A leading furniture manufacturer in Chennai since 1997. Over 25 years of expertise in space-saving, innovative furniture design and manufacturing.',
  keywords: 'about furniture company, furniture manufacturer Chennai, Spacecrafts Furniture history, furniture design expertise, Indian furniture brand',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/about'
  },
  openGraph: {
    title: 'About Spacecrafts Furniture - Premium Furniture Solutions',
    description: 'Over 25 years of expertise in designing and manufacturing premium quality furniture.',
    url: 'https://www.spacecraftsfurniture.in/about',
    type: 'website'
  }
}

export default function About() {
  const values = [
    {
      icon: '💡',
      title: 'Innovation',
      desc: 'We continuously experiment with new materials, designs, and ergonomic principles to create furniture that\'s both beautiful and functional.'
    },
    {
      icon: '✨',
      title: 'Quality',
      desc: 'Every piece undergoes strict quality control from material selection to final finishing, ensuring durability and comfort.'
    },
    {
      icon: '🤝',
      title: 'Integrity',
      desc: 'We build long-lasting relationships with customers through reliable service, transparency, and honest communication.'
    },
    {
      icon: '⚡',
      title: 'Speed',
      desc: 'We deliver on time with efficient processes and responsive customer support for a smooth furniture-buying experience.'
    }
  ]

  const timeline = [
    { year: '1997', event: 'Founded with Vision', desc: 'Spacecrafts Furniture established to design and manufacture Indian-made, world-class furniture.' },
    { year: '2000s', event: 'Growing Recognition', desc: 'Became known for space-saving and innovative furniture solutions across Chennai and surrounding areas.' },
    { year: '2010s', event: 'Expansion Era', desc: 'Expanded product range to include office and commercial furniture, serving diverse customer segments.' },
    { year: '2024', event: '8,000 sq. ft. Facility', desc: 'Opened modern manufacturing and showroom facility in Ambattur Industrial Estate, Chennai.' }
  ]

  const products = [
    { icon: '🛋️', name: 'Sofas & Seating', desc: 'Space-saving modular sofas and comfort seating solutions' },
    { icon: '🛏️', name: 'Bedroom Furniture', desc: 'Modern beds, wardrobes, and storage solutions' },
    { icon: '🪑', name: 'Office Furniture', desc: 'Professional desks, chairs, and workstations' },
    { icon: '🍽️', name: 'Dining Furniture', desc: 'Elegant dining sets and functional storage' },
    { icon: '🏢', name: 'Commercial Solutions', desc: 'Institutional and corporate furniture systems' },
    { icon: '🌳', name: 'Outdoor Range', desc: 'Durable and stylish outdoor furniture' }
  ]

  const reasons = [
    'Over 25 years of trusted expertise',
    'Modern 8,000 sq. ft. manufacturing facility',
    'Wide range of home, office, and commercial furniture',
    'High-quality materials from reliable vendors',
    'Custom-made solutions for your space',
    'Affordable prices without compromise on quality',
    'Exceptional after-sales service',
    'On-time delivery and professional installation'
  ]

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Story</h1>
          <p className={styles.heroSubtitle}>25+ Years of Excellence in Furniture Design & Manufacturing</p>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        {/* About Intro */}
        <section className={styles.introSection}>
          <div className={styles.introContent}>
            <h2 className={styles.sectionTitle}>About Spacecrafts Furniture</h2>
            <p className={styles.introText}>
              Spacecrafts Furniture is one of Chennai's leading furniture manufacturers and dealers, known for creating innovative, space-saving, and high-quality furniture for homes and businesses. Established in 1997, we have been delivering excellence in furniture design, craftsmanship, and service for over two decades.
            </p>
            <p className={styles.introText}>
              Now, with our new 8,000 sq. ft. facility in Ambattur Industrial Estate, Chennai, we've expanded our capabilities to serve our customers even better — offering a wider range of modern, functional, and durable furniture solutions designed to fit your space perfectly.
            </p>
          </div>

          <div className={styles.introImages}>
            <img 
              src="https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/exterior1.webp" 
              alt="Spacecrafts Furniture showroom exterior"
              className={styles.introImage}
            />
            <img 
              src="https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner1.webp" 
              alt="Spacecrafts Furniture showroom interior"
              className={styles.introImage}
            />
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <div className={styles.cardIcon}>🎯</div>
            <h3>Our Mission</h3>
            <p>To create value for our customers through reliability, integrity, and speed of service. We aim to build long-lasting relationships by offering products and services that make customers proud to nurture and share their experience with Spacecrafts Furniture.</p>
          </div>

          <div className={styles.missionCard}>
            <div className={styles.cardIcon}>🌟</div>
            <h3>Our Vision</h3>
            <p>To design and manufacture Indian-made, world-class furniture that combines functionality, elegance, and quality. Our mission has always been to craft furniture that transforms small spaces into beautiful, efficient living and working environments.</p>
          </div>
        </section>

        {/* Core Values */}
        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, idx) => (
              <div key={idx} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h4>{value.title}</h4>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className={styles.timelineSection}>
          <h2 className={styles.sectionTitle}>Our Journey</h2>
          <div className={styles.timeline}>
            {timeline.map((item, idx) => (
              <div key={idx} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <h4 className={styles.timelineYear}>{item.year}</h4>
                  <h5 className={styles.timelineEvent}>{item.event}</h5>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Products We Offer */}
        <section className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>Our Product Range</h2>
          <div className={styles.productsGrid}>
            {products.map((product, idx) => (
              <div key={idx} className={styles.productCard}>
                <div className={styles.productIcon}>{product.icon}</div>
                <h4>{product.name}</h4>
                <p>{product.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className={styles.whyChooseSection}>
          <h2 className={styles.sectionTitle}>Why Choose Spacecrafts Furniture?</h2>
          <div className={styles.reasonsGrid}>
            {reasons.map((reason, idx) => (
              <div key={idx} className={styles.reasonItem}>
                <div className={styles.checkmark}>✓</div>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>Our Team</h2>
          <div className={styles.teamContent}>
            <p>We are a team of passionate furniture experts and skilled craftsmen. With years of experience in design, production, and customer service, our staff work tirelessly to bring innovative furniture ideas to life — tailored to your home, office, or commercial space.</p>
            <p>Each member of our team brings specialized expertise, from design consultants who understand space optimization to craftspeople who ensure every detail meets our quality standards.</p>
          </div>
        </section>

        {/* Quality Guarantee */}
        <section className={styles.qualitySection}>
          <h2 className={styles.sectionTitle}>Quality Guarantee</h2>
          <div className={styles.qualityContent}>
            <div className={styles.qualityItem}>
              <div className={styles.qualityIcon}>🔍</div>
              <h4>Strict Quality Control</h4>
              <p>Every piece of furniture goes through rigorous testing from material selection to final finishing.</p>
            </div>
            <div className={styles.qualityItem}>
              <div className={styles.qualityIcon}>🛠️</div>
              <h4>Expert Craftsmanship</h4>
              <p>Our skilled craftsmen use precision techniques to ensure perfect construction and finish.</p>
            </div>
            <div className={styles.qualityItem}>
              <div className={styles.qualityIcon}>📦</div>
              <h4>Durable Materials</h4>
              <p>We source high-quality materials from trusted vendors to ensure longevity and durability.</p>
            </div>
            <div className={styles.qualityItem}>
              <div className={styles.qualityIcon}>💯</div>
              <h4>Satisfaction Guaranteed</h4>
              <p>We stand behind our products with dedicated after-sales support and service.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Experience Quality & Innovation</h2>
            <p>Visit our showroom today and discover the Spacecrafts Furniture difference. Our design consultants are ready to help you transform your space.</p>
            <div className={styles.ctaButtons}>
              <Link href="/store-locator" className={styles.primaryBtn}>Visit Our Showroom</Link>
              <Link href="/contact" className={styles.secondaryBtn}>Get in Touch</Link>
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
            '@type': 'Organization',
            'name': 'Spacecrafts Furniture',
            'url': 'https://spacecraftsfurniture.in',
            'logo': 'https://www.spacecraftsfurniture.in/logo.png',
            'description': 'Premium furniture manufacturer and dealer in Chennai with 25+ years of expertise.',
            'founder': 'Spacecrafts Furniture',
            'foundingDate': '1997',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '94A/1, 3rd Main Rd, Old Ambattur, Attipattu',
              'addressLocality': 'Chennai',
              'addressRegion': 'Tamil Nadu',
              'postalCode': '600058',
              'addressCountry': 'IN'
            },
            'contactPoint': {
              '@type': 'ContactPoint',
              'contactType': 'Customer Service',
              'telephone': '+919003003733',
              'email': 'support@spacecraftsfurniture.in'
            },
            'sameAs': [
              'https://www.facebook.com/spacecraftsfurniture',
              'https://www.instagram.com/spacecraftsfurniture',
              'https://www.youtube.com/@spacecraftsfurniture'
            ]
          })
        }}
      />
    </div>
  )
}
