import Link from 'next/link'
import styles from './AboutFurnitureSection.module.css'

export default function AboutFurnitureSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Main page H1 — visible for SEO (homepage) */}
        <h1 className={styles.mainTitle}>
          Furniture Store in Chennai — Sofas, Beds &amp; Bunk Beds | Spacecrafts Furniture, Ambattur
        </h1>

        {/* Intro */}
        <p className={styles.intro}>
          Spacecrafts Furniture is a trusted <strong>furniture store in Chennai</strong> for thoughtfully designed, high-quality furniture. With an 8,000 sq. ft. showroom in <strong>Ambattur Industrial Estate</strong> and pan-India online delivery, we make it easy to find and buy the right piece — whether you visit us in person or shop from home.
        </p>
        <p className={styles.intro}>
          We specialise in <strong>sofa cum beds</strong>, <strong>bunk beds</strong>, <strong>metal cots</strong>, <strong>space-saving furniture</strong>, dining sets, recliners, and more. Serving customers across Chennai — from Anna Nagar, Mogappair, and Padi to Ambattur, Avadi, Porur, OMR, Velachery and beyond — as well as pan-India delivery to your doorstep.
        </p>
        <p className={styles.intro}>
          Our showroom at <strong>94A/1, 3rd Main Rd, Ambattur Industrial Estate, Chennai 600058</strong> is open daily (Mon–Sun 10 AM–9:30 PM). Browse, test, and choose — then order online or in store with confidence. Call <strong>090030 03733</strong> or visit spacecraftsfurniture.in. Full guide:{' '}
          <Link href="/furniture-store-chennai">furniture store in Chennai</Link>.
        </p>

        <hr className={styles.divider} />

        {/* Explore Furniture for Every Room */}
        <h2 className={styles.sectionHeading}>Explore Furniture for Every Room</h2>
        <p className={styles.bodyText}>
          At Spacecrafts Furniture, every room deserves attention to detail and design excellence. Our curated collections bring together comfort, functionality, and aesthetics.
        </p>

        <p className={styles.subHeading}>Living Room Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Your living room is the heart of your home. Our Chennai showroom collection includes comfortable sofas, sectionals, sofa cum beds, coffee tables, TV units, bookshelves, and storage solutions designed for apartment living. Whether you prefer contemporary minimalism or timeless elegance, we have designs that suit every interior style.
        </p>

        <p className={styles.subHeading}>Bedroom Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Create a restful retreat with our bedroom collection for Chennai homes. Choose from king, queen, and single beds, metal cots, bunk beds, wardrobes, and bedside tables that balance comfort with durability in humid coastal weather.
        </p>

        <p className={styles.subHeading}>Dining Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Dining spaces are where conversations and memories are made. Our dining tables, chairs, and compact sets suit both smaller flats and family homes across Chennai — from everyday meals to festive gatherings.
        </p>

        <p className={styles.subHeading}>Study &amp; Home Office Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Designed for productivity and comfort, our study and office furniture includes ergonomic chairs, functional desks, bookshelves, and storage cabinets for work-from-home setups across the city.
        </p>

        <p className={styles.subHeading}>Kids&rsquo; Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Our kids&rsquo; furniture collection blends safety, durability, and playful design. Bunk beds, study tables, and storage solutions support growing needs while fitting real Chennai bedroom sizes.
        </p>

        <p className={styles.subHeading}>Outdoor Furniture in Chennai</p>
        <p className={styles.bodyText}>
          Enhance your balcony, patio, or garden with weather-aware outdoor furniture. Lounge sets, chairs, and tables built for coastal light and everyday use.
        </p>

        <p className={styles.subHeading}>Bar Furniture</p>
        <p className={styles.bodyText}>
          For those who love entertaining, our bar cabinets, stools, and storage units help you create a refined and welcoming space for hosting guests.
        </p>

        <hr className={styles.divider} />

        <h2 className={styles.sectionHeading}>Furniture Store Near You in Chennai — Areas We Serve</h2>
        <p className={styles.bodyText}>
          Looking for a <strong>furniture shop near me</strong> in Chennai? Our Ambattur showroom is an easy drive from north and west Chennai, and we deliver city-wide. Popular localities include Ambattur, Anna Nagar, Mogappair, Padi, Avadi, Kolathur, Villivakkam, Koyambedu, Porur, OMR, Velachery and Tambaram.
        </p>
        <p className={styles.bodyText}>
          Plan your visit on the <Link href="/store-locator">store locator</Link> page, or read our{' '}
          <Link href="/furniture-store-chennai">furniture store Chennai guide</Link>.
        </p>

        <hr className={styles.divider} />

        {/* Premium Furniture Materials */}
        <h2 className={styles.sectionHeading}>Premium Furniture Materials We Offer</h2>
        <p className={styles.bodyText}>
          At Spacecrafts Furniture, we use carefully selected materials to ensure durability and elegance.
        </p>

        <p className={styles.subHeading}>Solid Wood (Sheesham, Mango, Teak)</p>
        <p className={styles.bodyText}>
          Known for strength and rich natural grain patterns, solid wood furniture offers timeless beauty and long-lasting performance.
        </p>

        <p className={styles.subHeading}>Engineered Wood</p>
        <p className={styles.bodyText}>
          An affordable and durable alternative, engineered wood provides modern finishes and versatile designs.
        </p>

        <p className={styles.subHeading}>Metal</p>
        <p className={styles.bodyText}>
          Perfect for contemporary and industrial interiors, metal furniture is sturdy, low-maintenance, and stylish.
        </p>

        <p className={styles.subHeading}>Upholstered &amp; Leather Finishes</p>
        <p className={styles.bodyText}>
          Soft fabrics and premium leather add comfort and sophistication to sofas, recliners, and accent chairs.
        </p>

        <hr className={styles.divider} />

        {/* More Than Just Furniture */}
        <h2 className={styles.sectionHeading}>More Than Just Furniture</h2>
        <p className={styles.bodyText}>
          Spacecrafts Furniture also offers:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>Home decor and furnishings</li>
          <li className={styles.bulletItem}>Mattresses for restful sleep</li>
          <li className={styles.bulletItem}>Lighting solutions to enhance ambience</li>
          <li className={styles.bulletItem}>Kitchen and dining essentials</li>
          <li className={styles.bulletItem}>Luxury statement pieces</li>
          <li className={styles.bulletItem}>Modular kitchen solutions</li>
        </ul>
        <p className={styles.bodyText}>
          Everything you need to create a cohesive and elegant living space &mdash; all in one place.
        </p>

        <hr className={styles.divider} />

        {/* Furniture Care Tips */}
        <h2 className={styles.sectionHeading}>Furniture Care Tips</h2>
        <p className={styles.bodyText}>
          To maintain the beauty and longevity of your furniture:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>Dust regularly with a soft cloth.</li>
          <li className={styles.bulletItem}>Avoid direct sunlight to prevent fading.</li>
          <li className={styles.bulletItem}>Use material-specific cleaners.</li>
          <li className={styles.bulletItem}>Tighten screws and fittings periodically.</li>
          <li className={styles.bulletItem}>Keep humidity levels stable for wooden furniture.</li>
        </ul>
        <p className={styles.bodyText}>
          With proper care, your furniture will remain beautiful for years.
        </p>

        <hr className={styles.divider} />

        {/* Things to Consider */}
        <h2 className={styles.sectionHeading}>Things to Consider Before Buying Furniture Online</h2>
        <p className={styles.bodyText}>
          Before making your purchase, keep these essentials in mind:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}><strong>Material</strong> &ndash; Choose based on durability and maintenance needs.</li>
          <li className={styles.bulletItem}><strong>Size</strong> &ndash; Measure your space accurately.</li>
          <li className={styles.bulletItem}><strong>Design</strong> &ndash; Match your existing decor.</li>
          <li className={styles.bulletItem}><strong>Colour</strong> &ndash; Complement your interior palette.</li>
          <li className={styles.bulletItem}><strong>Comfort</strong> &ndash; Especially for sofas, chairs, and beds.</li>
          <li className={styles.bulletItem}><strong>Budget</strong> &ndash; Invest in quality within your range.</li>
          <li className={styles.bulletItem}><strong>Reviews &amp; Warranty</strong> &ndash; Ensure reliability and peace of mind.</li>
          <li className={styles.bulletItem}><strong>Return Policy &amp; Payment Options</strong> &ndash; Shop securely and confidently.</li>
        </ul>

        <hr className={styles.divider} />

        {/* Why Choose Spacecrafts Furniture */}
        <h2 className={styles.sectionHeading}>Why Choose Spacecrafts Furniture — Chennai&apos;s Trusted Furniture Store?</h2>
        <div className={styles.highlightGrid}>
          <div className={styles.highlightCard}>
            <p className={styles.highlightTitle}>Premium Craftsmanship</p>
            <p className={styles.highlightDesc}>
              Every piece is designed with attention to detail and built using high-quality materials.
            </p>
          </div>
          <div className={styles.highlightCard}>
            <p className={styles.highlightTitle}>Modern &amp; Timeless Designs</p>
            <p className={styles.highlightDesc}>
              From minimalist styles to classic wooden pieces, we offer designs that suit every home.
            </p>
          </div>
          <div className={styles.highlightCard}>
            <p className={styles.highlightTitle}>Affordable Luxury</p>
            <p className={styles.highlightDesc}>
              We combine quality, durability, and competitive pricing to offer exceptional value.
            </p>
          </div>
          <div className={styles.highlightCard}>
            <p className={styles.highlightTitle}>Seamless Shopping Experience</p>
            <p className={styles.highlightDesc}>
              User-friendly browsing, secure payments, reliable delivery, and responsive support.
            </p>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Closing */}
        <h2 className={styles.sectionHeading}>Invest in Comfort, Style &amp; Durability — Furniture Store in Chennai</h2>
        <p className={styles.closingText}>
          At Spacecrafts Furniture, we believe furniture should do more than fill a space — it should enhance the way you live. Our collections are designed to offer lasting comfort, refined style, and long-term value. Visit our showroom in <strong>Ambattur Industrial Estate, Chennai</strong> or order online at spacecraftsfurniture.in with delivery across India.
        </p>
        <p className={styles.closingTextBold}>
          Whether you&rsquo;re furnishing a new home or refreshing your current space, Spacecrafts Furniture — your local furniture store in Chennai — is your trusted partner in creating interiors that inspire.
        </p>

        <hr className={styles.divider} />

        <h2 className={styles.sectionHeading}>FAQs — Furniture Store in Chennai</h2>
        <p className={styles.subHeading}>Is Spacecrafts a furniture showroom or only an online store?</p>
        <p className={styles.bodyText}>
          Both. Visit our 8,000 sq. ft. Ambattur showroom to try products, then buy in store or online with delivery across Chennai and India.
        </p>
        <p className={styles.subHeading}>What makes this furniture store in Chennai different?</p>
        <p className={styles.bodyText}>
          We focus on durable, space-saving designs — sofa cum beds, bunk beds and metal cots — manufactured and displayed from the same Ambattur facility, with practical guidance for apartment layouts.
        </p>
        <p className={styles.subHeading}>How do I get directions to the showroom?</p>
        <p className={styles.bodyText}>
          Use our <Link href="/store-locator">store locator</Link> or Google Maps link on the contact page. Address: 94A/1, 3rd Main Rd, Ambattur Industrial Estate, Chennai 600058.
        </p>

      </div>
    </section>
  )
}
