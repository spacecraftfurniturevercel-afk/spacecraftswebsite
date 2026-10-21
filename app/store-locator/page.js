import styles from '../../components/StoreLocatorDetail.module.css'
import Link from 'next/link'
import { COMPANY } from '../../lib/companyInfo'

const SITE = COMPANY.url
const PAGE_URL = `${SITE}/store-locator`

export const metadata = {
  title: {
    absolute: 'Furniture Shop Near Me | Ambattur Chennai Showroom',
  },
  description:
    'Looking for a furniture shop near you in Chennai? Visit Spacecrafts — 8,000 sq. ft. showroom in Ambattur. Try sofas, bunk beds & sofa cum beds. Open daily. Directions, hours & map on this page.',
  keywords:
    'furniture shop near me, furniture store near me, furniture near me, furniture showroom Chennai, furniture shop Ambattur, furniture store Chennai, best furniture store Chennai, sofa showroom Chennai, bed showroom Chennai',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Furniture Shop Near Me | Spacecrafts Ambattur, Chennai',
    description:
      '8,000 sq. ft. furniture showroom in Ambattur. Sofas, bunk beds, metal cots & space-saving designs. Open daily — get directions and hours.',
    url: PAGE_URL,
    type: 'website',
    images: [
      {
        url: '/aboutus/exterior1.webp',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture showroom — furniture shop near me in Ambattur, Chennai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furniture Shop Near Me | Spacecrafts Ambattur, Chennai',
    description: '8,000 sq. ft. showroom in Ambattur. Directions, hours and contact.',
    images: ['/aboutus/exterior1.webp'],
  },
}

const localFaqs = [
  {
    q: 'Where is the nearest Spacecrafts furniture shop in Chennai?',
    a: `${COMPANY.name} is at ${COMPANY.address.full}. The showroom is in Ambattur Industrial Estate — convenient from Anna Nagar, Mogappair, Padi, Avadi and north Chennai.`,
  },
  {
    q: 'What are the showroom opening hours?',
    a: COMPANY.hours,
  },
  {
    q: 'What furniture can I see in the showroom?',
    a: 'Sofas, sofa cum beds, bunk beds and bunker cots, metal cots, dining sets, study tables, recliners and space-saving furniture — displayed so you can test before you buy.',
  },
]

export default function StoreLocator() {
  const storeDetails = {
    name: COMPANY.name,
    address: COMPANY.address.full,
    phone: COMPANY.phoneDisplay,
    email: COMPANY.email,
    gst: COMPANY.gst,
    hours: {
      weekday: COMPANY.hoursWeekday,
      weekend: COMPANY.hoursWeekend,
    },
    facilities: [
      { icon: '📐', label: '8,000 sq. ft. Modern Facility' },
      { icon: '🛋️', label: 'Wide Furniture Collection' },
      { icon: '👨‍💼', label: 'Expert Design Consultants' },
      { icon: '🚚', label: 'Free Delivery & Installation' },
      { icon: '✅', label: 'Quality Guarantee' },
      { icon: '📱', label: 'Custom Furniture Solutions' },
    ],
  }

  const exteriorImages = [
    '/aboutus/exterior1.webp',
    '/aboutus/exterior2.webp',
    '/aboutus/exterior3.webp',
  ]

  const interiorImages = [
    '/aboutus/inner1.webp',
    '/aboutus/inner2.webp',
    '/aboutus/inner3.webp',
    '/aboutus/inner4.webp',
    '/aboutus/inner5.webp',
    '/aboutus/inner6.webp',
  ]

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${PAGE_URL}#furniture-store`,
    name: COMPANY.name,
    url: PAGE_URL,
    image: [
      `${SITE}/aboutus/exterior1.webp`,
      `${SITE}/aboutus/exterior2.webp`,
      `${SITE}/aboutus/inner1.webp`,
    ],
    description:
      'Furniture shop and showroom in Ambattur, Chennai. Sofas, bunk beds, metal cots, sofa cum beds and space-saving furniture. 8,000 sq. ft. open daily.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.0910641,
      longitude: 80.1586599,
    },
    telephone: COMPANY.phoneTel,
    email: COMPANY.email,
    sameAs: [
      COMPANY.social.facebook,
      COMPANY.social.instagram,
      COMPANY.mapsUrl,
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:30',
        closes: '21:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00',
      },
    ],
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking',
    areaServed: [{ '@type': 'City', name: 'Chennai' }],
    hasMap: COMPANY.mapsUrl,
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <div className={styles.pageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Furniture Shop Near Me in Chennai — Ambattur Showroom
          </h1>
          <p className={styles.heroSubtitle}>
            Visit {COMPANY.name} — 8,000 sq. ft. in Ambattur Industrial Estate. Try sofas,
            bunk beds, sofa cum beds and metal cots before you buy. Open daily.
          </p>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      <div className={styles.container}>
        <section className={styles.localIntroSection} aria-labelledby="local-intro-heading">
          <h2 id="local-intro-heading" className={styles.sectionTitle} style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: 16 }}>
            Your local furniture store in Ambattur, Chennai
          </h2>
          <p>
            Searching for a <strong>furniture shop near me</strong> or a{' '}
            <strong>furniture showroom in Chennai</strong>? Our Ambattur experience centre is a
            manufacturer showroom — not just a catalogue — so you can check size, comfort and
            build quality in person, then order in store or online.
          </p>
          <p>Customers visit us from across Chennai, including:</p>
          <ul>
            <li>Ambattur, Anna Nagar, Mogappair and Padi</li>
            <li>Avadi, Kolathur, Villivakkam and Koyambedu</li>
            <li>Porur, OMR, Velachery and Tambaram (delivery available)</li>
          </ul>
          <p>
            More on shopping locally:{' '}
            <Link href="/furniture-store-chennai">furniture store in Chennai</Link>
            {' · '}
            <Link href="/blog/furniture-shop-near-me-chennai-ambattur">furniture shop near me guide</Link>
          </p>
        </section>

        <section className={styles.storeDetailsSection}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>📍</div>
              <h3>Location</h3>
              <p className={styles.addressText}>{storeDetails.address}</p>
              <a
                href={COMPANY.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapLink}
              >
                View on Google Maps →
              </a>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>📞</div>
              <h3>Contact Info</h3>
              <p>
                <strong>Phone:</strong>{' '}
                <a href="tel:09003003733">090030 03733</a> /{' '}
                <a href="tel:09840222779">98402 22779</a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${storeDetails.email}`}>{storeDetails.email}</a>
              </p>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.cardIcon}>⏰</div>
              <h3>Store Hours</h3>
              <p><strong>Mon - Fri:</strong> {storeDetails.hours.weekday}</p>
              <p><strong>Saturday - Sunday:</strong> {storeDetails.hours.weekend}</p>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                *Open on all holidays
              </p>
            </div>
          </div>
        </section>

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

        <section className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Find Us on Map</h2>
          <div className={styles.mapContainer}>
            <iframe
              width="100%"
              height="500"
              style={{ border: 0, borderRadius: '10px' }}
              loading="lazy"
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.598!2d80.1586599!3d13.0910641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526390982427af%3A0x8eb12c2c78d47abd!2sSpacecrafts%20-%20Ambattur!5e0!3m2!1sen!2sin!4v1711000000000!5m2!1sen!2sin"
              title="Spacecrafts Furniture Location Map"
            ></iframe>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to visit our furniture showroom?</h2>
            <p>
              Get directions below or browse our collection online — bunk beds, sofas and more
              from our Ambattur, Chennai store.
            </p>
            <div className={styles.ctaButtons}>
              <a
                href={COMPANY.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryBtn}
              >
                Open in Google Maps
              </a>
              <Link href="/products" className={styles.secondaryBtn}>Browse Collection</Link>
            </div>
          </div>
        </section>

        <section className={styles.localIntroSection} style={{ marginBottom: 80 }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '1.35rem', textAlign: 'left' }}>
            Common questions
          </h2>
          {localFaqs.map((item) => (
            <div key={item.q} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{item.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555', margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}