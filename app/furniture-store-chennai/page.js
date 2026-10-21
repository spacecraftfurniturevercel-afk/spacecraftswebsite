import Link from 'next/link'
import Image from 'next/image'
import { COMPANY } from '../../lib/companyInfo'
import styles from './chennai.module.css'

const SITE = COMPANY.url

export const metadata = {
  title: {
    absolute: 'Best Furniture Stores in Chennai | Ambattur Showroom',
  },
  description:
    'Best furniture stores in Chennai for space-saving homes: visit Spacecrafts Furniture in Ambattur — 8,000 sq. ft. showroom for sofas, bunk beds, sofa cum beds and metal cots. Try before you buy.',
  keywords:
    'best furniture stores in Chennai, best furniture store Chennai, furniture stores in Chennai, furniture store Chennai, furniture shop Chennai, furniture showroom Chennai, Ambattur furniture store, sofa store Chennai, bunk beds Chennai, Spacecrafts Furniture',
  alternates: {
    canonical: `${SITE}/furniture-store-chennai`,
  },
  openGraph: {
    title: 'Best Furniture Stores in Chennai | Ambattur Showroom',
    description:
      'Manufacturer-showroom in Ambattur — sofas, bunk beds, sofa cum beds and metal cots. Visit or shop online.',
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
    q: 'Which are the best furniture stores in Chennai?',
    a: 'Mall chains (Woodpecker, Home Centre, Wooden Street) suit south and central Chennai if you want décor breadth and multiple branches. For north and west Chennai, bunk beds, sofa cum beds and metal cots, Spacecrafts Furniture in Ambattur is the manufacturer-showroom to visit — one 8,000 sq. ft. floor, try before you buy, then order in store or online.',
  },
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
            Best furniture stores in Chennai — visit our Ambattur showroom
          </h1>
          <p className={styles.intro}>
            Searching for the <strong>best furniture stores in Chennai</strong>? Mall brands cover
            south and central Chennai. {COMPANY.name} is the manufacturer-showroom in{' '}
            <strong>Ambattur Industrial Estate</strong> — 8,000 sq. ft. of sofas, bunk beds, sofa
            cum beds, metal cots and dining you can sit on, open and measure before you pay. Order
            in store or online with delivery across Chennai and India.
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
            Best furniture stores in Chennai — mall vs manufacturer-showroom
          </h2>
          <p className={styles.bodyText}>
            Google’s top results for this search are usually city-wide chains:{' '}
            <strong>Wooden Street</strong> (CIT Nagar, Anna Nagar, Pallikaranai, OMR),{' '}
            <strong>Home Centre</strong> (VR Mall, Velachery, Alwarpet, Royapettah) and{' '}
            <strong>Woodpecker</strong> (Besant Nagar, ECR, OMR, Pallikaranai). They win on branch
            count and décor range. They are weaker when you need bunk beds with safety rails, a
            sofa cum bed mechanism you can test, or a steel cot that survives Chennai humidity —
            and when you live in north or west Chennai.
          </p>
          <p className={styles.bodyText}>
            {COMPANY.name} is one showroom, not five malls. Use us when “best” means fit for your
            flat, published dimensions, manufacturer pricing and a real Ambattur address — not the
            longest catalogue.
          </p>
          <ul className={styles.bulletList}>
            <li className={styles.bulletItem}>
              Mall / multi-store brands — style, sofas, bedroom sets, many south Chennai locations
            </li>
            <li className={styles.bulletItem}>
              Spacecrafts Ambattur — space-saving, bunk beds, sofa cum beds, metal cots, try
              before buy, pan-India dispatch from the same facility
            </li>
          </ul>

          <h2 className={styles.sectionHeading}>North and west Chennai — Ambattur first</h2>
          <p className={styles.bodyText}>
            If you are in Ambattur, Mogappair, Padi, Avadi, Kolathur, Villivakkam, Koyambedu or
            Anna Nagar west, a trip to OMR or Velachery is extra traffic for pieces you can test
            locally. Our floor is built for that catchment. South Chennai buyers still visit on
            weekends, then take online delivery.
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
              href="/blog/best-furniture-shops-chennai-2026-local-showroom"
              className={styles.inlineLink}
            >
              Best furniture shops in Chennai 2026
            </Link>
            {' · '}
            <Link
              href="/blog/best-furniture-store-chennai-buying-guide"
              className={styles.inlineLink}
            >
              Buying checklist
            </Link>
            {' · '}
            <Link
              href="/blog/furniture-shopping-in-chennai-showroom-vs-online"
              className={styles.inlineLink}
            >
              Showroom vs online
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
