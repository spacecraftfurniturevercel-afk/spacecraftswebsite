import ModernHeroCarousel from '../components/ModernHeroCarousel'
import PromoBanners from '../components/PromoBanners'
import BankBanner from '../components/BankBanner'
import KeepShoppingSection from '../components/KeepShoppingSection'
import ModernCategoryGrid from '../components/ModernCategoryGrid'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import MoreIdeasSection from '../components/MoreIdeasSection'
import NewArrivalsGrid from '../components/NewArrivalsGrid'
import CustomerReviewsSection from '../components/CustomerReviewsSection'
import AboutFurnitureSection from '../components/AboutFurnitureSection'
import Link from 'next/link'
import { CATALOG_REVALIDATE_SECONDS } from '../lib/catalogCache'
import { getCachedHomeCatalog } from '../lib/catalogData'

// Cache homepage catalog data — cuts PostgREST egress vs force-dynamic every visit
export const revalidate = CATALOG_REVALIDATE_SECONDS

// SEO Metadata
export const metadata = {
  title: {
    absolute: 'Furniture Store in Chennai | Sofas, Beds & Showroom Ambattur',
  },
  description:
    'Best furniture store in Chennai for sofas, bunk beds, metal cots and space-saving furniture. Visit our 8,000 sq. ft. Ambattur showroom or shop online. Call 90030 03733. Pan-India delivery.',
  keywords:
    'furniture store Chennai, best furniture store Chennai, furniture shop Chennai, furniture showroom Chennai, buy furniture in Chennai, furniture store near me Chennai, furniture shop Ambattur, bunk beds Chennai, sofa cum bed Chennai, metal cots Chennai, space saving furniture Chennai, Spacecrafts Furniture',
  openGraph: {
    title: 'Furniture Store in Chennai | Sofas, Beds & Showroom Ambattur',
    description:
      'Ambattur showroom + online store. Sofas, bunk beds, sofa cum beds, metal cots. Visit or shop online.',
    url: 'https://www.spacecraftsfurniture.in',
    siteName: 'Spacecrafts Furniture',
    images: [
      {
        url: '/aboutus/exterior1.webp',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture store in Chennai',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furniture Store in Chennai | Sofas, Beds & Showroom Ambattur',
    description:
      'Ambattur showroom + online store. Sofas, bunk beds, sofa cum beds, metal cots. Visit or shop online.',
    images: ['/aboutus/exterior1.webp'],
  },
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in',
  },
}

export default async function Home() {
  let categories = []
  let bestsellers = []
  let offeredProducts = []

  try {
    const catalog = await getCachedHomeCatalog()
    categories = catalog.categories
    bestsellers = catalog.bestsellers
    offeredProducts = catalog.offeredProducts
  } catch (e) {
    console.warn('Supabase not configured for server fetch in Home:', e.message)
  }

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': 'https://www.spacecraftsfurniture.in/#furniture-store',
    name: 'Spacecrafts Furniture',
    description: 'Premium furniture store in Ambattur, Chennai offering sofas, sofa cum beds, bunk beds, metal cots, dining sets and space-saving furniture. 8,000 sq. ft. showroom open daily.',
    url: 'https://www.spacecraftsfurniture.in',
    logo: 'https://www.spacecraftsfurniture.in/favlogo/logo-01.png',
    image: [
      'https://www.spacecraftsfurniture.in/aboutus/exterior1.webp',
      'https://www.spacecraftsfurniture.in/aboutus/exterior2.webp',
      'https://www.spacecraftsfurniture.in/aboutus/inner1.webp'
    ],
    telephone: '+919003003733',
    email: 'support@spacecraftsfurniture.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '94A/1, 3rd Main Rd, Old Ambattur, Attipattu',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600058',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.0910641,
      longitude: 80.1586599
    },
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '21:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00'
      }
    ],
    sameAs: [
      'https://www.facebook.com/spacecraftsfurniture',
      'https://www.instagram.com/spacecraftsfurniture',
      'https://maps.app.goo.gl/sMTmsBTJBKszoP1Q7'
    ],
    hasMap: 'https://maps.app.goo.gl/sMTmsBTJBKszoP1Q7',
    keywords:
      'furniture store Chennai, best furniture store Chennai, bunk beds Chennai, sofa cum bed, metal cots, space saving furniture, furniture showroom Ambattur',
    areaServed: [
      { '@type': 'City', name: 'Chennai' },
      { '@type': 'State', name: 'Tamil Nadu' },
      { '@type': 'Place', name: 'Ambattur' },
      { '@type': 'Place', name: 'Anna Nagar' },
      { '@type': 'Place', name: 'Mogappair' },
      { '@type': 'Place', name: 'Avadi' },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is a good furniture store in Chennai for bunk beds and sofa cum beds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Spacecrafts Furniture in Ambattur Industrial Estate, Chennai offers an 8,000 sq. ft. showroom with bunk beds, sofa cum beds, metal cots and space-saving furniture. Address: 94A/1, 3rd Main Rd, Ambattur Industrial Estate, Chennai 600058.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Spacecrafts Furniture deliver across Chennai?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We deliver across Chennai and pan-India from our Ambattur facility. Confirm your pin code at checkout or call 090030 03733.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I visit the furniture showroom before buying online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Visit our Ambattur showroom to try sofas, beds and bunk beds, then order in store or online at spacecraftsfurniture.in.',
        },
      },
    ],
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <main>
        {/* Hero Section */}
        <ModernHeroCarousel />

        {/* Promo Banners — Coupon + Offer Cards */}
        <PromoBanners />

        {/* Bank Offer Banner + Ticker */}
        <BankBanner />

        {/* Trust Badges / Benefits */}
        {/* <TrustBadges /> */}

        {/* Keep Shopping — Recently Viewed Products + Related Items */}
        <KeepShoppingSection />

        {/* Categories Section */}
        <ModernCategoryGrid serverCategories={categories} />

        {/* Featured Products — Bestsellers & Offers */}
        <FeaturedProductsSection bestsellers={bestsellers} offered={offeredProducts} />

        {/* More Ideas & Inspiration — Editorial Masonry Grid */}
        <MoreIdeasSection />

        {/* New Arrivals — 3-Column Feature Grid */}
        <NewArrivalsGrid />

        {/* Customer Reviews — Google Reviews Showcase */}
        <CustomerReviewsSection />

        {/* About Furniture — SEO Content Block */}
        <AboutFurnitureSection />

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
          Furniture tips & guides
        </h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '24px', maxWidth: '560px', margin: '0 auto 24px' }}>
          Buying guides for furniture stores in Chennai, showroom visits, and space-saving ideas.
        </p>
        <p style={{ textAlign: 'center', marginBottom: 16, lineHeight: 1.7 }}>
          <Link href="/furniture-store-chennai">Furniture store in Chennai</Link>
          {' · '}
          <Link href="/blog/best-furniture-store-chennai-buying-guide">Best store buying guide</Link>
          {' · '}
          <Link href="/blog/furniture-shopping-in-chennai-showroom-vs-online">Showroom vs online</Link>
        </p>
        <p style={{ textAlign: 'center' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: '#e67e22',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Read the blog
          </Link>
        </p>
      </section>
      </main>
    </>
  )
}
