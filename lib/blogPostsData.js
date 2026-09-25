import { COMPANY } from './companyInfo'

/** Unsplash (allowed in next.config) — illustrative interiors only */
const U = {
  living: 'https://images.unsplash.com/photo-1555041469-a586c61e9bc7?w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80',
  bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
  sofa: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
  delivery: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
  office: 'https://images.unsplash.com/photo-1518455027359-f3f816dca9dc?w=1200&q=80',
  bunk: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80',
}

export const BLOG_POSTS_DATA = [
  {
    slug: 'visit-spacecrafts-furniture-showroom-ambattur-chennai',
    title: 'Visit Our 8,000 Sq. Ft. Furniture Showroom in Ambattur, Chennai',
    description:
      'Plan your visit to Spacecrafts Furniture in Ambattur Industrial Estate, Chennai. See sofas, beds, dining sets, and space-saving designs in our 8,000 sq. ft. showroom. Address, hours, parking, and what to expect.',
    publishedAt: '2025-08-15',
    updatedAt: '2026-03-26',
    image: '/aboutus/exterior1.webp',
    imageAlt: 'Spacecrafts Furniture showroom exterior in Ambattur, Chennai',
    tags: ['showroom', 'Chennai', 'Ambattur'],
    sections: [
      {
        type: 'p',
        text: `Furniture is a long-term purchase. Photos and descriptions help, but sitting on a sofa, opening a storage drawer, or testing a folding mechanism tells you far more than any catalogue. At ${COMPANY.name}, we welcome customers to our 8,000 sq. ft. experience centre in Ambattur Industrial Estate, Chennai, where living room, bedroom, dining, and workspace collections are displayed in realistic room settings.`,
      },
      {
        type: 'p',
        text: 'Whether you are furnishing a new flat in Anna Nagar, upgrading a villa in OMR, or sourcing bulk pieces for a rental portfolio, a showroom visit lets you compare finishes, sizes, and comfort before you commit. Many visitors browse our website first, shortlist SKUs, and then confirm their choices in person—a workflow that saves time and reduces returns.',
      },
      {
        type: 'image',
        src: '/aboutus/exterior2.webp',
        alt: 'Exterior view of Spacecrafts Furniture facility Chennai',
        caption: 'Our Ambattur facility — showroom and operations under one roof.',
      },
      {
        type: 'h2',
        text: 'Location, address, and how to reach us',
      },
      {
        type: 'p',
        text: `📍 ${COMPANY.address.full}. The showroom is in Old Ambattur / Attipattu, within Ambattur Industrial Estate—well connected from NH-44 and the Chennai Metro (nearest stations include Ambattur Industrial Estate and surrounding bus routes).`,
      },
      {
        type: 'p',
        text: `Open ${COMPANY.hours}. For design consultations or bulk viewings, call ${COMPANY.phoneDisplay} or email ${COMPANY.email} so our team can reserve time with you. GST: ${COMPANY.gst}.`,
      },
      {
        type: 'p',
        text: `Google Maps: ${COMPANY.mapsUrl}`,
      },
      {
        type: 'image',
        src: '/aboutus/inner3.webp',
        alt: 'Interior furniture display at Spacecrafts showroom',
        caption: 'Walk through living, bedroom, and dining zones in one visit.',
      },
      {
        type: 'h2',
        text: 'What you can see and try in the showroom',
      },
      {
        type: 'ul',
        items: [
          'Sofas, sofa cum beds, recliners, and diwans for living rooms',
          'Wooden beds, metal cots, bunk beds, folding cots, and mattresses',
          'Dining tables, chairs, and compact dining sets for apartments',
          'Study tables, office chairs, coffee tables, and TV units',
          'Space-saving furniture: sofa beds, foldable tables, storage cots',
        ],
      },
      {
        type: 'h3',
        text: 'Who benefits most from a visit?',
      },
      {
        type: 'p',
        text: 'Families choosing a primary sofa or bed, interior designers specifying dimensions for clients, and business buyers placing repeat orders all use the showroom differently. Our consultants can explain warranty terms, lead times to your pin code, and which collections suit Chennai humidity and daily use.',
      },
      {
        type: 'image',
        src: U.living,
        alt: 'Modern living room furniture layout inspiration',
        caption: 'Use our displays as inspiration for your own room layout (illustrative).',
      },
      {
        type: 'h2',
        text: 'Showroom visit + online shopping',
      },
      {
        type: 'p',
        text: 'You do not have to choose only one channel. Add favourites to your cart on spacecraftsfurniture.in, note the SKU, and validate comfort and colour at the showroom. Conversely, if you discover a model in store that is not yet in your cart, our team can help you place the order online for pan-India delivery.',
      },
      {
        type: 'p',
        text: 'We also support bulk and franchise enquiries—ask at the desk or use the bulk order form on the website before you visit so we can prepare samples.',
      },
      {
        type: 'h2',
        text: 'Before you leave home',
      },
      {
        type: 'ul',
        items: [
          'Carry a rough floor plan with measurements and door widths',
          'Photograph your current room in daylight for colour matching',
          'List must-have features (storage, foldable, king vs queen size)',
          'Bring swatches of wall paint or curtain fabric if matching matters',
        ],
      },
      {
        type: 'p',
        text: `We look forward to welcoming you to ${COMPANY.name}. For store photos and facility details, see our store locator page on the website.`,
      },
    ],
  },
  {
    slug: 'how-to-buy-furniture-online-india-2025',
    title: 'How to Buy Furniture Online in India: A Practical Checklist',
    description:
      'A step-by-step guide to buying furniture online in India—measurements, materials, delivery, warranty, and returns. Expert tips from Spacecrafts Furniture, Chennai.',
    publishedAt: '2025-08-20',
    updatedAt: '2026-03-26',
    image: '/aboutus/inner2.webp',
    imageAlt: 'Modern furniture display inside Spacecrafts showroom',
    tags: ['buying guide', 'online furniture'],
    sections: [
      {
        type: 'p',
        text: 'Indian shoppers now comfortably buy phones, groceries, and appliances online—furniture is the natural next step, provided you treat it like a planned project rather than an impulse buy. The goal is simple: receive pieces that fit your rooms, match your lifestyle, and arrive with clear warranty and support. This checklist works for any reputable retailer; we have added notes where Spacecrafts policies apply.',
      },
      {
        type: 'h2',
        text: '1. Measure twice, including access paths',
      },
      {
        type: 'p',
        text: 'Record length, width, and ceiling height of the room. For sofas and beds, note the path from the street or lift to the room—tight stairwells in older Chennai buildings often need modular or knock-down designs. Measure door frame width and height; compare with product shipping dimensions when listed.',
      },
      {
        type: 'image',
        src: U.apartment,
        alt: 'Compact apartment living room planning',
        caption: 'Small footprints reward careful measurement and multi-use furniture.',
      },
      {
        type: 'h2',
        text: '2. Understand materials and climate',
      },
      {
        type: 'p',
        text: 'Solid wood (sheesham, mango, teak) offers classic grain and repairability. Engineered wood and MDF provide stable, budget-friendly carcasses when edge sealing is good. Metal frames suit cots and modern sofas. Upholstery should breathe in humid months—ask about fabric care and whether cushions are reversible.',
      },
      {
        type: 'p',
        text: 'In coastal and tropical cities, avoid placing untreated wood directly against damp walls; leave air gaps and use coasters under planters on furniture surfaces.',
      },
      {
        type: 'h2',
        text: '3. Read reviews, ratings, and real photos',
      },
      {
        type: 'p',
        text: 'Look beyond star averages. Read reviews that mention delivery experience, assembly, and comfort after three to six months. On our site, product images from the showroom and customer settings help set expectations; when in doubt, visit our Ambattur showroom.',
      },
      {
        type: 'image',
        src: '/aboutus/inner6.webp',
        alt: 'Furniture collection at Spacecrafts Chennai',
        caption: 'Seeing finishes in person complements online research.',
      },
      {
        type: 'h2',
        text: '4. Delivery, assembly, and total cost',
      },
      {
        type: 'p',
        text: 'Confirm estimated delivery days to your pin code, whether assembly is included, and how charges are calculated (weight, volume, distance). At checkout, review the final amount including delivery before payment. If shipping dimensions are missing for a product, contact support—accurate quotes depend on size and weight.',
      },
      {
        type: 'h2',
        text: '5. Warranty, returns, and support',
      },
      {
        type: 'p',
        text: 'Note warranty period and what is covered (frame, mechanism, fabric). Understand return windows for damage in transit versus change-of-mind policies—furniture often differs from apparel. Save invoices and chat records. Spacecrafts lists standard warranty on eligible items and provides support via phone, email, and our Chennai facility.',
      },
      {
        type: 'h2',
        text: '6. After delivery',
      },
      {
        type: 'ul',
        items: [
          'Inspect cartons before signing; photograph any outer damage',
          'Assemble on a clean surface; retain hardware bags until complete',
          'Register warranty if the brand requires it',
          'Tighten bolts after the first week of use on beds and chairs',
        ],
      },
      {
        type: 'p',
        text: `Questions while you shop? Call ${COMPANY.phoneDisplay} or visit ${COMPANY.address.city} showroom at ${COMPANY.address.locality}.`,
      },
    ],
  },
  {
    slug: 'space-saving-furniture-small-homes-chennai',
    title: 'Space-Saving Furniture Ideas for Small Homes in Chennai',
    description:
      'Sofa cum beds, folding cots, bunk beds, and compact dining for Chennai apartments. Layout tips and product types from Spacecrafts Furniture.',
    publishedAt: '2025-09-01',
    updatedAt: '2026-03-26',
    image: '/aboutus/inner4.webp',
    imageAlt: 'Space-saving furniture collection at Spacecrafts',
    tags: ['space saving', 'Chennai', 'apartments'],
    sections: [
      {
        type: 'p',
        text: 'Chennai apartments—from compact units in Velachery to narrow row houses in older neighbourhoods—often trade floor area for location. Space-saving furniture lets one room serve as living room by day and guest bedroom by night, or turns a study into a spare cot for relatives during festival season.',
      },
      {
        type: 'p',
        text: 'The best solutions combine a clear primary function (comfortable seating or sleep) with storage or fold-flat profiles. Below we outline categories we stock at Spacecrafts and how to place them without blocking ventilation or natural light.',
      },
      {
        type: 'image',
        src: U.apartment,
        alt: 'Small apartment interior with efficient layout',
        caption: 'Vertical storage and dual-purpose pieces maximise usable area.',
      },
      {
        type: 'h2',
        text: 'Living room: sofa cum beds and sofa beds',
      },
      {
        type: 'p',
        text: 'Sofa cum beds with storage hide bedding and reduce clutter in studio layouts. Test the pull-out or click-clack action in store if possible—the mechanism should operate smoothly with one person and lock securely in bed mode. Allow clearance in front of the sofa equal to the bed footprint when extended.',
      },
      {
        type: 'image',
        src: U.sofa,
        alt: 'Sofa in a compact living space',
        caption: 'Choose seat depth and back height that work for both TV time and sleep.',
      },
      {
        type: 'h2',
        text: 'Guest sleep: folding cots and recliner beds',
      },
      {
        type: 'p',
        text: 'Folding cots and recliner folding beds store upright in wardrobes or behind doors. They suit homes that host guests a few times a year without dedicating a full bedroom. Pair with a thin mattress sized for the cot frame.',
      },
      {
        type: 'h2',
        text: 'Children and shared rooms: bunk and pull-out cots',
      },
      {
        type: 'p',
        text: 'Bunk beds and pull-out cots use vertical space or under-bed sliders. Check guard rails for upper bunks and weight limits. Teach children safe ladder use; avoid placing bunks under ceiling fans.',
      },
      {
        type: 'image',
        src: U.bunk,
        alt: 'Bunk bed in a shared kids room',
        caption: 'Bunks free floor space for study desks and play areas.',
      },
      {
        type: 'h2',
        text: 'Dining and work in tight spaces',
      },
      {
        type: 'ul',
        items: [
          'Foldable dining sets that tuck against a wall',
          'Wall-mounted or slim study tables',
          'Nesting coffee tables and TV units with closed storage',
          'Shoe racks and slim book shelves to keep floors clear',
        ],
      },
      {
        type: 'h2',
        text: 'See mechanisms before you buy',
      },
      {
        type: 'p',
        text: `Visit ${COMPANY.name} at ${COMPANY.address.full} to test fold, slide, and recline actions. Browse the space-saving category online and filter by room tags. Delivery is available across India; showroom confirmation is especially valuable for first-time buyers of convertible furniture.`,
      },
    ],
  },
  {
    slug: 'sofa-cum-bed-buying-guide-india',
    title: 'Sofa Cum Bed Buying Guide: Storage, Size & Fabric',
    description:
      'How to choose a sofa cum bed in India—sizes, fabrics, storage, mechanisms, and maintenance. Buying guide from Spacecrafts Furniture, Chennai.',
    publishedAt: '2025-09-10',
    updatedAt: '2026-03-26',
    image: '/aboutus/inner1.webp',
    imageAlt: 'Sofa cum bed furniture at Spacecrafts Chennai',
    tags: ['sofa cum bed', 'living room'],
    sections: [
      {
        type: 'p',
        text: 'A sofa cum bed is the workhorse of Indian urban homes: it anchors the living room for family TV time and converts when cousins visit or when you need a quick nap. Quality varies widely—this guide explains what to compare beyond colour and price.',
      },
      {
        type: 'h2',
        text: 'Size and orientation',
      },
      {
        type: 'p',
        text: 'Measure wall length and the space needed when the bed is open. Three-seater sofa beds need more clearance than two-seater units. Corner layouts may block walkways when extended; L-shaped rooms sometimes favour a straight sofa along the longest wall.',
      },
      {
        type: 'image',
        src: U.sofa,
        alt: 'Sofa cum bed living room setup',
        caption: 'Leave walking space on all sides when the bed is deployed.',
      },
      {
        type: 'h2',
        text: 'With storage vs without storage',
      },
      {
        type: 'p',
        text: 'Under-seat storage holds pillows, sheets, and seasonal throws—valuable when you lack a linen cupboard. Without-storage models are lighter and sometimes lower in price; choose them when you already have dedicated storage nearby.',
      },
      {
        type: 'h2',
        text: 'Frame, mechanism, and mattress',
      },
      {
        type: 'p',
        text: 'Hardwood or metal-reinforced frames resist wobble. Open and close the bed ten times in the showroom; listen for squeaks. Mattress thickness affects seat height—very thin mattresses feel firm as sofas; thicker ones may look bulky. Ask whether the mattress is included or sold separately.',
      },
      {
        type: 'image',
        src: '/aboutus/inner2.webp',
        alt: 'Sofa display at Spacecrafts showroom Chennai',
        caption: 'Test comfort in both sofa and bed positions at our Ambattur showroom.',
      },
      {
        type: 'h2',
        text: 'Fabric and cleaning',
      },
      {
        type: 'p',
        text: 'Polyester blends resist stains; cotton-rich fabrics feel cooler but may need more care. Removable covers simplify washing. Vacuum weekly and rotate cushions to even out wear. Keep pets’ nails trimmed to reduce snagging.',
      },
      {
        type: 'h2',
        text: 'Delivery and placement',
      },
      {
        type: 'p',
        text: `Large sofa cum beds ship in multiple cartons. Confirm lift access and whether assembly is included. Spacecrafts delivers across India from Chennai; local customers can arrange showroom pickup discussions via ${COMPANY.phoneDisplay}.`,
      },
      {
        type: 'p',
        text: 'Explore sofa cum beds on our website or visit us at Ambattur Industrial Estate for hands-on trials.',
      },
    ],
  },
  {
    slug: 'metal-cots-and-beds-durability-guide',
    title: 'Metal Cots & Steel Beds: Durability and Care',
    description:
      'Guide to metal cots and steel beds for Indian homes—frame quality, coatings, mattress pairing, and maintenance. From Spacecrafts Furniture, Chennai.',
    publishedAt: '2025-09-18',
    updatedAt: '2026-03-26',
    image: '/aboutus/inner5.webp',
    imageAlt: 'Metal and steel bed frames at Spacecrafts',
    tags: ['beds', 'metal cots'],
    sections: [
      {
        type: 'p',
        text: 'Metal cots and steel platform beds are popular in guest rooms, hostels, rental homes, and primary bedrooms where owners want easy cleaning and long service life. When built with proper gauge steel and powder coating, they resist warping better than some low-grade wooden slats in humid conditions.',
      },
      {
        type: 'h2',
        text: 'Types we commonly sell',
      },
      {
        type: 'ul',
        items: [
          'Single and double metal cots with or without wooden legs',
          'Steel cots with storage drawers for compact rooms',
          'King and queen metal leg beds with upholstered headboards',
          'Folding metal cots for portable guest use',
        ],
      },
      {
        type: 'image',
        src: U.bedroom,
        alt: 'Bedroom with metal frame bed',
        caption: 'Steel frames pair with a wide range of mattress types.',
      },
      {
        type: 'h2',
        text: 'What to inspect before purchase',
      },
      {
        type: 'p',
        text: 'Check weld consistency and whether legs include adjustable feet for uneven floors. Ask for rated weight capacity. Ensure side rails fit your mattress height—gaps that are too large are unsafe for children. Powder-coated finishes resist rust; touch up scratches promptly in coastal areas.',
      },
      {
        type: 'image',
        src: '/aboutus/inner5.webp',
        alt: 'Steel cot display Spacecrafts',
        caption: 'Compare finishes and leg designs at our Chennai showroom.',
      },
      {
        type: 'h2',
        text: 'Mattress pairing',
      },
      {
        type: 'p',
        text: 'Metal grids or slats need even mattress support; sprung mattresses may need a solid base or bunkie board. Memory foam suits uniform platforms. Flip or rotate mattresses per manufacturer guidance to avoid dipping.',
      },
      {
        type: 'h2',
        text: 'Care and noise prevention',
      },
      {
        type: 'ul',
        items: [
          'Tighten bolts after the first week and quarterly thereafter',
          'Use felt pads where metal meets tile to reduce tick sounds',
          'Wipe frames with a dry cloth; avoid harsh solvents on coated finishes',
          'Do not jump on bunk or upper levels—follow manufacturer limits',
        ],
      },
      {
        type: 'h2',
        text: 'Warranty and support',
      },
      {
        type: 'p',
        text: `Spacecrafts lists warranty terms on eligible beds and cots. Keep your invoice and contact ${COMPANY.email} or ${COMPANY.phoneDisplay} for service. Visit ${COMPANY.address.full} to compare models side by side.`,
      },
    ],
  },
  {
    slug: 'furniture-delivery-across-india-spacecrafts',
    title: 'Furniture Delivery Across India from Our Chennai Facility',
    description:
      'How Spacecrafts Furniture ships sofas, beds, and tables across India from Ambattur, Chennai. Delivery charges, timelines, inspection tips, and support.',
    publishedAt: '2025-09-22',
    updatedAt: '2026-03-26',
    image: '/aboutus/exterior2.webp',
    imageAlt: 'Spacecrafts Furniture facility Chennai',
    tags: ['delivery', 'India'],
    sections: [
      {
        type: 'p',
        text: `${COMPANY.name} fulfils online orders from our base in Ambattur Industrial Estate, Chennai. Customers across Tamil Nadu and other states receive sofas, beds, dining sets, and space-saving pieces through partner logistics networks sized for furniture cartons—not small-parcel couriers alone.`,
      },
      {
        type: 'h2',
        text: 'How delivery charges work',
      },
      {
        type: 'p',
        text: 'Charges depend on destination pin code, product weight, and box dimensions (length × width × height). When shipping data is on the product record, checkout shows applicable fees before you pay. If dimensions are being updated for a SKU, our team may confirm charges after order placement—we are transparent about adjustments before dispatch.',
      },
      {
        type: 'image',
        src: U.delivery,
        alt: 'Furniture delivery and logistics',
        caption: 'Large items ship in protective cartons with handling labels.',
      },
      {
        type: 'h2',
        text: 'Timelines and tracking',
      },
      {
        type: 'p',
        text: 'Metro and tier-1 cities often receive goods sooner than remote pin codes. Festival seasons and weather can add buffer days. You will receive updates by SMS or email when the carrier books a slot; ensure someone is available to receive and inspect cartons.',
      },
      {
        type: 'h2',
        text: 'On delivery day',
      },
      {
        type: 'ul',
        items: [
          'Clear path from vehicle to room; measure lifts and stairs again',
          'Open boxes before signing if policy allows; note outer carton damage on the receipt',
          'Photograph any crushed corners for support claims',
          'Keep packaging until assembly is complete in case return is required',
        ],
      },
      {
        type: 'image',
        src: '/aboutus/exterior3.webp',
        alt: 'Spacecrafts Furniture Chennai building',
        caption: `Dispatch and customer support operate from ${COMPANY.address.locality}.`,
      },
      {
        type: 'h2',
        text: 'Assembly and installation',
      },
      {
        type: 'p',
        text: 'Some products require basic assembly (legs, handles, slats). Instructions are included; our support line can clarify steps. For complex wall units, hire a local carpenter if you prefer professional fitting.',
      },
      {
        type: 'h2',
        text: 'Bulk, B2B, and franchise',
      },
      {
        type: 'p',
        text: 'Hotels, PG operators, and franchise partners should use the bulk order enquiry path on the website. We coordinate staged deliveries and SKU lists from the same Chennai facility.',
      },
      {
        type: 'h2',
        text: 'Contact & visit',
      },
      {
        type: 'p',
        text: `📍 ${COMPANY.address.full} · 📞 ${COMPANY.phoneDisplay} · ✉️ ${COMPANY.email} · Maps: ${COMPANY.mapsUrl}. Prefer to see products first? Visit our showroom, then order for delivery to your city.`,
      },
    ],
  },
]
