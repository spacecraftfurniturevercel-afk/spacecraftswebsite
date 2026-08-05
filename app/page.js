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
import { CATALOG_REVALIDATE_SECONDS } from '../lib/catalogCache'
import { getCachedHomeCatalog } from '../lib/catalogData'

// Cache homepage catalog data — cuts PostgREST egress vs force-dynamic every visit
export const revalidate = CATALOG_REVALIDATE_SECONDS

// SEO Metadata
export const metadata = {
  title: 'Spacecrafts Furniture | Buy Premium Furniture Online India',
  description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery across India. Best prices with 30-day returns.',
  keywords: 'furniture store, online furniture shopping, sofas, beds, dining sets, office furniture, home decor, furniture India, premium furniture',
  openGraph: {
    title: 'Spacecrafts Furniture | Buy Premium Furniture Online',
    description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery, best prices.',
    url: 'https://www.spacecraftsfurniture.in',
    siteName: 'Spacecrafts Furniture',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spacecrafts Furniture | Buy Premium Furniture Online',
    description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery, best prices.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in'
  }
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
    name: 'Spacecrafts Furniture',
    description: 'Premium furniture store offering sofas, beds, dining sets, office furniture and home decor',
    url: 'https://spacecraftsfurniture.in',
    logo: 'https://www.spacecraftsfurniture.in/logo.png',
    image: 'https://www.spacecraftsfurniture.in/og-image.jpg',
    telephone: '+919003003733',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '94A/1, 3rd Main Rd, Old Ambattur, Attipattu',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600058',
      addressCountry: 'IN'
    },
    priceRange: '₹₹₹',
    openingHours: 'Mo-Sa 10:00-20:00',
    sameAs: [
      'https://www.facebook.com/spacecraftsfurniture',
      'https://www.instagram.com/spacecraftsfurniture',
      'https://twitter.com/spacecraftsfurn'
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      </main>
    </>
  )
}
