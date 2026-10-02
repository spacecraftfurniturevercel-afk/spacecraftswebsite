import Link from 'next/link'
import Image from 'next/image'
import { COMPANY } from '../../lib/companyInfo'
import styles from './chennai.module.css'

const SITE = COMPANY.url

export const metadata = {
  title: {
    absolute: 'Furniture Store in Chennai | Best Furniture Showroom Ambattur',
  },
  description:
    'Looking for a furniture store in Chennai? Visit Spacecrafts Furniture in Ambattur — 8,000 sq. ft. showroom for sofas, beds, bunk beds, dining sets and space-saving furniture. Shop online with pan-India delivery.',
  keywords:
    'furniture store Chennai, best furniture store Chennai, furniture shop Chennai, furniture showroom Chennai, buy furniture in Chennai, furniture store near me Chennai, Ambattur furniture store, sofa store Chennai, bed showroom Chennai, Spacecrafts Furniture',
  alternates: {
    canonical: `${SITE}/furniture-store-chennai`,
  },
  openGraph: {
    title: 'Furniture Store in Chennai | Spacecrafts Ambattur',
    description:
      '8,000 sq. ft. furniture showroom in Ambattur, Chennai. Sofas, bunk beds, metal cots, dining sets. Visit or shop online.',
    url: `${SITE}/furniture-store-chennai`,
    type: 'website',
    images: [
      {
        url: '/aboutus/exterior1.webp',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture store in Chennai — Ambattur showroom',
      },
    ],
  },
}

const faqs = [
  {
    q: 'Which is a good furniture store in Chennai for space-saving designs?',
    a: 'Spacecrafts Furniture in Ambattur specialises in sofa cum beds, bunk beds, metal cots and compact dining sets suited to Chennai apartments. Visit the 8,000 sq. ft. showroom or shop online with delivery across India.',
  },
  {
    q: 'Where is the Spacecrafts furniture showroom in Chennai?',
    a: `${COMPANY.address.full}. Open ${COMPANY.hours}. Call ${COMPANY.phoneDisplay}.`,
  },
  {
    q: 'What furniture categories can I buy in Chennai at Spacecrafts?',
    a: 'Sofas, sofa cum beds, recliners, wooden and metal beds, bunk beds, dining sets, study tables, office chairs, wardrobes, centre tables and space-saving furniture for every room.',
  },
  {
    q: 'Do you deliver furniture across Chennai and India?',
    a: 'Yes. We deliver across Chennai neighbourhoods and pan-India from our Ambattur facility. Confirm pin-code availability at checkout or call our team.',
  },
  {
    q: 'Can I try furniture before buying?',
    a: 'Yes. Sit on sofas, check bunk bed safety rails, and compare finishes in our Ambattur showroom before you order in store or online.',
  },
]

const areas = [
  'Ambattur',
  'Anna Nagar',
  'Mogappair',
  'Padi',
  'Avadi',
  'Kolathur',
  'Villivakkam',
  'Koyambedu',
  'Porur',
  'OMR',
  'Velachery',
  'Tambaram',
]

export default function FurnitureStoreChennaiPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const storeLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${SITE}/furniture-store-chennai#store`,
    name: COMPANY.name,
    url: `${SITE}/furniture-store-chennai`,
    image: `${SITE}/aboutus/exterior1.webp`,
    telephone: COMPANY.phoneTel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    areaServed: { '@type': 'City', name: 'Chennai' },
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeLd) }}
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.mainTitle}>
            Furniture Store in Chennai — Showroom, Sofas, Beds &amp; Space-Saving Designs
          </h1>
          <p className={styles.intro}>
            Searching for a <strong>furniture store in Chennai</strong> that balances showroom
            experience with online convenience? {COMPANY.name} is a manufacturer and retailer in{' '}
            <strong>Ambattur Industrial Estate</strong> with an 8,000 sq. ft. facility — so you can
            compare sofas, beds, bunk beds and dining sets in person, then order for home delivery
            across Chennai and India.
          </p>
          <p className={styles.intro}>
            Unlike pure catalogue marketplaces, we design and stock durable, space-saving furniture
            built for Indian apartments — from compact sofa cum beds to metal cots that handle
            Chennai humidity. Visit us, call {COMPANY.phoneDisplay}, or browse{' '}
            <Link href="/products" className={styles.inlineLink}>
              all products
            </Link>
            .
          </p>

          <div className={styles.media}>
            <Image
              src="/aboutus/exterior1.webp"
              alt="Spacecrafts Furniture store exterior in Ambattur, Chennai"
              fill
              priority
              sizes="(max-width: 920px) 100vw, 920px"
            />
          </div>
          <p className={styles.caption}>
            Our Ambattur showroom — a practical furniture shopping destination in Chennai.
          </p>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>
            Why shop at a furniture showroom in Chennai?
          </h2>
          <p className={styles.bodyText}>
            Large national brands and mall stores offer wide catalogues. A focused Chennai
            showroom helps you check dimensions against your flat, feel fabric and foam, and get
            honest guidance on bunk beds, storage cots and folding designs that actually fit lifts
            and bedrooms. Combine that with online ordering when you already know your SKU.
          </p>
          <ul className={styles.bulletList}>
            <li className={styles.bulletItem}>
              Try before you buy — sofas, recliners and bunk beds on the floor
            </li>
            <li className={styles.bulletItem}>
              Specialist space-saving range for 1BHK / 2BHK homes
            </li>
            <li className={styles.bulletItem}>
              Manufacturer-backed quality from our Ambattur facility
            </li>
            <li className={styles.bulletItem}>No-cost EMI options and pan-India shipping</li>
          </ul>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Furniture for every room — shop in Chennai</h2>

          <h3 className={styles.subHeading}>Living room furniture in Chennai</h3>
          <p className={styles.bodyText}>
            Sofas, sofa cum beds, recliners and centre tables for Anna Nagar apartments to OMR
            villas. Start with our{' '}
            <Link href="/products/category/sofa-cum-beds" className={styles.inlineLink}>
              sofa cum beds
            </Link>{' '}
            and{' '}
            <Link href="/products/category/recliner-sofas" className={styles.inlineLink}>
              recliner sofas
            </Link>
            .
          </p>

          <h3 className={styles.subHeading}>Bedroom furniture in Chennai</h3>
          <p className={styles.bodyText}>
            Metal cots, wooden beds, bunk beds and mattresses suited to humid coastal weather.
            Explore{' '}
            <Link href="/products/category/metal-cots" className={styles.inlineLink}>
              metal cots
            </Link>
            ,{' '}
            <Link href="/products/category/wooden-beds" className={styles.inlineLink}>
              wooden beds
            </Link>{' '}
            and{' '}
            <Link href="/products/category/bunk-beds" className={styles.inlineLink}>
              bunk beds
            </Link>
            .
          </p>

          <h3 className={styles.subHeading}>Dining furniture in Chennai</h3>
          <p className={styles.bodyText}>
            Compact and family dining sets for everyday meals. Browse{' '}
            <Link href="/products/category/dining-sets" className={styles.inlineLink}>
              dining sets
            </Link>
            .
          </p>

          <h3 className={styles.subHeading}>Study &amp; office furniture in Chennai</h3>
          <p className={styles.bodyText}>
            Study tables and chairs for WFH setups. See{' '}
            <Link href="/products" className={styles.inlineLink}>
              full catalogue
            </Link>{' '}
            for office and workspace pieces.
          </p>

          <div className={styles.media}>
            <Image
              src="/aboutus/inner1.webp"
              alt="Modern living room sofa — furniture shopping inspiration for Chennai homes"
              fill
              sizes="(max-width: 920px) 100vw, 920px"
            />
          </div>
          <p className={styles.caption}>
            Living room inspiration — compare styles in our showroom before you buy.
          </p>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Areas we serve across Chennai</h2>
          <p className={styles.bodyText}>
            Customers visit from across the city and order online for delivery. Popular areas
            include:
          </p>
          <ul className={styles.areaGrid}>
            {areas.map((area) => (
              <li key={area} className={styles.areaItem}>
                {area}, Chennai
              </li>
            ))}
          </ul>
          <p className={styles.bodyText}>
            Get directions on our{' '}
            <Link href="/store-locator" className={styles.inlineLink}>
              store locator
            </Link>{' '}
            page.
          </p>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>
            Frequently asked questions — furniture store Chennai
          </h2>
          {faqs.map((item) => (
            <div key={item.q} className={styles.faqBlock}>
              <h3 className={styles.subHeading}>{item.q}</h3>
              <p className={styles.bodyText}>{item.a}</p>
            </div>
          ))}

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>
            Visit Spacecrafts — your furniture store in Chennai
          </h2>
          <p className={styles.closingText}>
            Address: <strong>{COMPANY.address.full}</strong>
            <br />
            Hours: {COMPANY.hours}
            <br />
            Phone: {COMPANY.phoneDisplay}
            <br />
            Maps:{' '}
            <a
              href={COMPANY.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              Open in Google Maps
            </a>
          </p>
          <p className={styles.closingTextBold}>
            Read guides:{' '}
            <Link
              href="/blog/best-furniture-store-chennai-buying-guide"
              className={styles.inlineLink}
            >
              Best furniture store in Chennai — buying guide
            </Link>
            {' · '}
            <Link
              href="/blog/furniture-shopping-in-chennai-showroom-vs-online"
              className={styles.inlineLink}
            >
              Showroom vs online furniture shopping in Chennai
            </Link>
          </p>
          <div className={styles.ctaRow}>
            <Link href="/products" className={styles.ctaPrimary}>
              Shop furniture
            </Link>
            <Link href="/store-locator" className={styles.ctaSecondary}>
              Visit showroom
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
