import styles from '../../components/StoreLocatorDetail.module.css'
import Link from 'next/link'

export const metadata = {
  title: 'Store Locator - Visit Spacecrafts Furniture Ambattur Showroom',
  description: 'Visit our 8,000 sq. ft. showroom and manufacturing facility in Ambattur Industrial Estate, Chennai. Experience premium furniture designs in person. Open daily. Get directions and contact info.',
  keywords: 'furniture showroom Chennai, Ambattur furniture store, Spacecrafts Furniture location, furniture store near me, furniture showroom Ambattur',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/store-locator'
  },
  openGraph: {
    title: 'Visit Our Showroom - Spacecrafts Furniture Store',
    description: 'Visit our modern 8,000 sq. ft. showroom in Ambattur Industrial Estate, Chennai.',
    url: 'https://www.spacecraftsfurniture.in/store-locator',
    type: 'website'
  }
}

export default function StoreLocator() {
  const storeDetails = {
    name: 'Spacecrafts Furniture',
    address: '94A/1, 3rd Main Rd, Old Ambattur, Attipattu, Ambattur Industrial Estate, Chennai, Tamil Nadu 600058',
    phone: '090030 03733',
    email: 'support@spacecraftsfurniture.in',
    gst: '33AASFH4116N1Z2',
    hours: {
      weekday: '10:00 AM - 9:30 PM',
      weekend: '10:00 AM - 10:00 PM',
    },
    facilities: [
      { icon: '📐', label: '8,000 sq. ft. Modern Facility' },
      { icon: '🛋️', label: 'Wide Furniture Collection' },
      { icon: '👨‍💼', label: 'Expert Design Consultants' },
      { icon: '🚚', label: 'Free Delivery & Installation' },
      { icon: '✅', label: 'Quality Guarantee' },
      { icon: '📱', label: 'Custom Furniture Solutions' }
    ]
  }

  const exteriorImages = [
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/exterior1.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/exterior2.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/exterior3.webp'
  ]

  const interiorImages = [
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner1.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner2.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner3.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner4.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner5.webp',
    'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/inner6.webp'
  ]

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Visit Our Showroom</h1>
          <p className={styles.heroSubtitle}>Experience premium furniture at our modern 8,000 sq. ft. facility in Ambattur Industrial Estate, Chennai</p>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Store Details Grid */}
        <section className={styles.storeDetailsSection}>
          <div className={styles.detailsGrid}>
            {/* Contact Information */}
            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>📍</div>
              <h3>Location</h3>
              <p className={styles.addressText}>{storeDetails.address}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(storeDetails.address)}`} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                View on Google Maps →
              </a>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>📞</div>
              <h3>Contact Info</h3>
              <p><strong>Phone:</strong> <a href={`tel:${storeDetails.phone.replace(/\s/g, '')}`}>{storeDetails.phone}</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${storeDetails.email}`}>{storeDetails.email}</a></p>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>⏰</div>
              <h3>Store Hours</h3>
              <p><strong>Mon - Fri:</strong> {storeDetails.hours.weekday}</p>
              <p><strong>Saturday - Sunday:</strong> {storeDetails.hours.weekend}</p>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>*Open on all holidays</p>
            </div>
          </div>
        </section>

        {/* Facilities Highlights */}
        <section className={styles.facilitiesSection}>
          <h2 className={styles.sectionTitle}>Why Visit Us</h2>
          <div className={styles.facilitiesGrid}>
            {storeDetails.facilities.map((facility, idx) => (
              <div key={idx} className={styles.facilityCard}>
                <div className={styles.facilityIcon}>{facility.icon}</div>
                <p>{facility.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exterior Photos */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>Exterior Photos</h2>
          <div className={styles.galleryGrid}>
            {exteriorImages.map((img, idx) => (
              <div key={idx} className={styles.galleryItem}>
                <img 
                  src={img} 
                  alt={`Spacecrafts Furniture exterior view ${idx + 1}`}
                  loading="lazy"
                  style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px' }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Interior Photos */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>Showroom Interior</h2>
          <div className={styles.galleryGrid}>
            {interiorImages.map((img, idx) => (
              <div key={idx} className={styles.galleryItem}>
                <img 
                  src={img} 
                  alt={`Spacecrafts Furniture showroom interior view ${idx + 1}`}
                  loading="lazy"
                  style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px' }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Find Us on Map</h2>
          <div className={styles.mapContainer}>
            <iframe
              width="100%"
              height="500"
              style={{ border: 0, borderRadius: '10px' }}
              loading="lazy"
              allowFullScreen=""
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.2476543214!2d80.10522!3d13.12345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52f3f3f3f3f3f3%3A0x0!2sSpacecrafts%20Furniture!5e0!3m2!1sen!2sin!4v1234567890`}
              title="Spacecrafts Furniture Location Map"
            ></iframe>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Transform Your Space?</h2>
            <p>Visit our showroom today and discover our complete collection of premium furniture solutions.</p>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className={styles.primaryBtn}>Get Directions</Link>
              <Link href="/products" className={styles.secondaryBtn}>Browse Collection</Link>
            </div>
          </div>
        </section>
      </div>

      {/* Schema Markup for Local Business */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'Spacecrafts Furniture',
            'image': 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/aboutus/exterior1.webp',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '94A/1, 3rd Main Rd, Old Ambattur, Attipattu',
              'addressLocality': 'Chennai',
              'addressRegion': 'Tamil Nadu',
              'postalCode': '600058',
              'addressCountry': 'IN'
            },
            'telephone': '+919003003733',
            'email': 'support@spacecraftsfurniture.in',
            'url': 'https://spacecraftsfurniture.in',
            'openingHoursSpecification': [
              {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                'opens': '10:00',
                'closes': '20:00'
              },
              {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': 'Sunday',
                'opens': '11:00',
                'closes': '18:00'
              }
            ],
            'priceRange': '₹₹₹'
          })
        }}
      />
    </div>
  )
}
