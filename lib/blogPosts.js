import { COMPANY } from './companyInfo'

/**
 * Static blog posts for SEO & content marketing.
 * Add new entries here; slugs appear on /blog and in sitemap.xml.
 */
export const BLOG_POSTS = [
  {
    slug: 'visit-spacecrafts-furniture-showroom-ambattur-chennai',
    title: 'Visit Our 8,000 Sq. Ft. Furniture Showroom in Ambattur, Chennai',
    description:
      'Tour the Spacecrafts Furniture showroom at Ambattur Industrial Estate, Chennai. See sofas, beds, dining sets in person. Address, hours, and directions.',
    publishedAt: '2025-08-15',
    updatedAt: '2025-09-01',
    image: '/aboutus/exterior1.webp',
    imageAlt: 'Spacecrafts Furniture showroom exterior in Ambattur, Chennai',
    tags: ['showroom', 'Chennai', 'Ambattur'],
    sections: [
      {
        type: 'p',
        text: `Buying furniture online is convenient, but seeing materials, finishes, and comfort in person still makes a difference. Our ${COMPANY.name} showroom in Ambattur Industrial Estate, Chennai, spans 8,000 sq. ft. so you can compare sofas, beds, dining sets, and space-saving pieces before you order.`,
      },
      {
        type: 'h2',
        text: 'Showroom address & hours',
      },
      {
        type: 'p',
        text: `📍 ${COMPANY.address.full}. We are open ${COMPANY.hours}. Call ${COMPANY.phoneDisplay} or email ${COMPANY.email} before you visit for design consultations.`,
      },
      {
        type: 'p',
        text: `Get directions on Google Maps: ${COMPANY.mapsUrl}`,
      },
      {
        type: 'h2',
        text: 'What you can explore in store',
      },
      {
        type: 'ul',
        items: [
          'Living room sofas, sofa cum beds, and recliners',
          'Beds, cots, bunk beds, and mattresses',
          'Dining tables and chairs',
          'Study tables, office chairs, and storage',
          'Expert help for custom sizes and bulk orders',
        ],
      },
      {
        type: 'p',
        text: 'Prefer to shop from home? Browse our full catalogue online at spacecraftsfurniture.in with delivery across India, then visit us to confirm your favourites.',
      },
    ],
  },
  {
    slug: 'how-to-buy-furniture-online-india-2025',
    title: 'How to Buy Furniture Online in India: A Practical Checklist',
    description:
      'Measure your room, compare materials, check warranty and delivery, and buy furniture online confidently. Tips from Spacecrafts Furniture, Chennai.',
    publishedAt: '2025-08-20',
    updatedAt: '2025-09-10',
    image: '/aboutus/inner2.webp',
    imageAlt: 'Modern furniture display inside Spacecrafts showroom',
    tags: ['buying guide', 'online furniture'],
    sections: [
      {
        type: 'p',
        text: 'Online furniture shopping saves time, but the best results come from a short checklist before you click buy. Use this guide whether you shop with Spacecrafts or any trusted Indian retailer.',
      },
      {
        type: 'h2',
        text: '1. Measure twice',
      },
      {
        type: 'p',
        text: 'Note room length, width, ceiling height, and door frame width. For sofas and beds, leave walking space on all sides. Our product pages list dimensions where available; contact us if you need help.',
      },
      {
        type: 'h2',
        text: '2. Material & maintenance',
      },
      {
        type: 'p',
        text: 'Solid wood, engineered wood, metal, and upholstery each behave differently in humidity and daily use. Chennai’s climate favours finishes that resist moisture and regular dusting.',
      },
      {
        type: 'h2',
        text: '3. Delivery, assembly, and warranty',
      },
      {
        type: 'p',
        text: 'Confirm delivery timeline to your pin code, assembly support, return window, and warranty period. Spacecrafts offers standard warranty on eligible products and customer support at our Ambattur facility.',
      },
    ],
  },
  {
    slug: 'space-saving-furniture-small-homes-chennai',
    title: 'Space-Saving Furniture Ideas for Small Homes in Chennai',
    description:
      'Sofa cum beds, folding cots, bunk beds, and multi-use furniture for compact apartments. Spacecrafts Furniture, Chennai.',
    publishedAt: '2025-09-01',
    updatedAt: '2025-09-15',
    image: '/aboutus/inner4.webp',
    imageAlt: 'Space-saving furniture collection at Spacecrafts',
    tags: ['space saving', 'Chennai', 'apartments'],
    sections: [
      {
        type: 'p',
        text: 'Apartments in Chennai often need furniture that works double duty. Space-saving designs help you host guests, work from home, and sleep comfortably without clutter.',
      },
      {
        type: 'h2',
        text: 'Popular space-saving categories',
      },
      {
        type: 'ul',
        items: [
          'Sofa cum beds and sofa beds for living rooms',
          'Folding cots and recliner folding beds for guests',
          'Bunk beds and pull-out cots for kids’ rooms',
          'Foldable dining and study tables',
          'TV units and storage racks with a small footprint',
        ],
      },
      {
        type: 'p',
        text: `Explore space-saving products on our website or visit ${COMPANY.address.locality}, ${COMPANY.address.city}, to try mechanisms before you buy.`,
      },
    ],
  },
  {
    slug: 'sofa-cum-bed-buying-guide-india',
    title: 'Sofa Cum Bed Buying Guide: Storage, Size & Fabric',
    description:
      'Choose the right sofa cum bed for Indian homes—sizes, storage, fabrics, and delivery. Expert tips from Spacecrafts Furniture.',
    publishedAt: '2025-09-10',
    updatedAt: '2025-09-20',
    image: '/aboutus/inner1.webp',
    imageAlt: 'Sofa cum bed furniture at Spacecrafts Chennai',
    tags: ['sofa cum bed', 'living room'],
    sections: [
      {
        type: 'p',
        text: 'A sofa cum bed combines seating by day and sleeping by night—ideal for studio apartments and guest rooms. Look for a smooth conversion mechanism, stable frame, and breathable upholstery.',
      },
      {
        type: 'h2',
        text: 'With storage vs without',
      },
      {
        type: 'p',
        text: 'Models with under-seat storage fit extra bedding and pillows. Open-floor plans benefit from storage; fixed living rooms may prefer a lighter without-storage design.',
      },
      {
        type: 'h2',
        text: 'Try before delivery',
      },
      {
        type: 'p',
        text: `Visit our Chennai showroom at ${COMPANY.address.full} to test sofa cum beds in person, or order online with delivery across India.`,
      },
    ],
  },
  {
    slug: 'metal-cots-and-beds-durability-guide',
    title: 'Metal Cots & Steel Beds: Durability and Care',
    description:
      'Why metal cots and steel beds suit Indian homes, how to maintain them, and what to check before buying from Spacecrafts Furniture.',
    publishedAt: '2025-09-18',
    updatedAt: '2025-09-22',
    image: '/aboutus/inner5.webp',
    imageAlt: 'Metal and steel bed frames at Spacecrafts',
    tags: ['beds', 'metal cots'],
    sections: [
      {
        type: 'p',
        text: 'Steel cots and metal leg beds offer strong support, easier cleaning, and long service life—popular for guest rooms, rental homes, and growing families.',
      },
      {
        type: 'h2',
        text: 'What to check when buying',
      },
      {
        type: 'ul',
        items: [
          'Frame gauge and weld quality',
          'Weight capacity listed by the manufacturer',
          'Mattress size compatibility (single, queen, king)',
          'Powder coating or finish for rust resistance',
          'Warranty and after-sales support',
        ],
      },
      {
        type: 'p',
        text: `Questions? Call ${COMPANY.phoneDisplay} or visit our Ambattur showroom. GST ${COMPANY.gst}.`,
      },
    ],
  },
  {
    slug: 'furniture-delivery-across-india-spacecrafts',
    title: 'Furniture Delivery Across India from Our Chennai Facility',
    description:
      'How Spacecrafts Furniture ships sofas, beds, and tables across India. Delivery charges, timelines, and support from Ambattur, Chennai.',
    publishedAt: '2025-09-22',
    updatedAt: '2025-09-25',
    image: '/aboutus/exterior2.webp',
    imageAlt: 'Spacecrafts Furniture facility Chennai',
    tags: ['delivery', 'India'],
    sections: [
      {
        type: 'p',
        text: `${COMPANY.name} ships from our Chennai base to pin codes across India. Delivery charges depend on location, product size, and weight; exact costs appear at checkout when dimensions are on file.`,
      },
      {
        type: 'h2',
        text: 'Our location',
      },
      {
        type: 'p',
        text: `📍 ${COMPANY.address.full}. 📞 ${COMPANY.phoneDisplay}. ✉️ ${COMPANY.email}`,
      },
      {
        type: 'p',
        text: 'For bulk orders and franchise enquiries, use our bulk order and franchise pages on the website.',
      },
    ],
  },
]

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  )
}

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((p) => p.slug)
}
