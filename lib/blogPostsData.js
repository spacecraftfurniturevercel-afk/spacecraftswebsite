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
  showroom: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80',
  family: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
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
  {
    slug: 'bunk-beds-buying-guide-india-2026',
    title: 'Bunk Beds Buying Guide 2026: Sizes, Safety & Best Picks for Indian Homes',
    description:
      'Everything you need to know before buying bunk beds in India. Sizes, safety rails, weight limits, mattress compatibility, and top picks from Spacecrafts Furniture, Chennai.',
    publishedAt: '2026-09-28',
    updatedAt: '2026-09-28',
    image: U.bunk,
    imageAlt: 'Bunk bed setup in a children\'s bedroom',
    tags: ['bunk beds', 'children furniture', 'buying guide', 'Chennai'],
    sections: [
      {
        type: 'p',
        text: `Bunk beds are one of the most practical furniture purchases for Indian families—whether you are fitting two kids into a shared bedroom, adding a guest sleep spot without dedicating a full room, or furnishing a hostel or PG. But bunk beds vary widely in build quality, safety, and suitability for Indian room dimensions. This guide walks you through every decision point so you buy once and buy right.`,
      },
      {
        type: 'p',
        text: `At ${COMPANY.name} in Ambattur, Chennai, we stock a range of bunk beds and bunk-cum-futon cots built for daily Indian use. You can browse online at spacecraftsfurniture.in or visit our 8,000 sq. ft. showroom to test frames and mattress fit in person before ordering.`,
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
        alt: 'Children sharing a bunk bed in a cosy bedroom',
        caption: 'Bunk beds let two children share one room comfortably — with their own sleep space and storage.',
      },
      {
        type: 'h2',
        text: 'Why bunk beds make sense for Indian homes',
      },
      {
        type: 'p',
        text: 'Urban flats in Chennai, Bangalore, Mumbai, and Delhi often have two-bedroom layouts where one room serves two or more occupants. A standard bunk bed saves the floor area of an entire single bed—typically 3 × 6 feet—freeing space for a study table, wardrobe, or play area. In relative terms, that can feel like adding an extra room to a compact flat.',
      },
      {
        type: 'p',
        text: 'Beyond children\'s rooms, bunk beds see heavy use in PG accommodations, hostel dormitories, and vacation homes. Families that host relatives during summer vacations or festivals often keep a bunk cot or folding bed specifically for those occasions. A well-built metal or engineered-wood bunk can serve double duty for years without showing wear.',
      },
      {
        type: 'h2',
        text: 'Types of bunk beds available in India',
      },
      {
        type: 'h3',
        text: 'Standard twin-over-twin',
      },
      {
        type: 'p',
        text: 'The classic design—one full-size sleeping surface directly above another. Both berths are typically sized for a single mattress (72 × 36 inches / 183 × 90 cm). This is the most common choice for children sharing a room and for hostels where every square foot matters.',
      },
      {
        type: 'h3',
        text: 'Bunk-cum-futon (loft bunk)',
      },
      {
        type: 'p',
        text: 'The lower berth is replaced by a futon sofa or study area. By day, the lower section serves as seating or a workspace; by night, fold it into a sleeping surface. This design is ideal for a student\'s room where a sofa and a sleep space need to coexist. Our Jupiter Bunk Cum Futon Cot is a popular option for exactly this use.',
      },
      {
        type: 'h3',
        text: 'Triple bunk and pull-out cot',
      },
      {
        type: 'p',
        text: 'Triple bunks add a third sleeping level or include a pull-out trundle at the base for a third occupant. These are common in holiday homes and large joint families. Check ceiling height carefully—rooms with a standard 9-foot ceiling can fit most triple bunks, but 8-foot ceilings may need a slimmer design.',
      },
      {
        type: 'h3',
        text: 'Metal vs engineered wood bunk beds',
      },
      {
        type: 'p',
        text: 'Metal frame bunks (powder-coated steel or iron) are lighter to move, easy to clean, and resist warping in humid coastal conditions. Engineered wood and MDF bunks offer a warmer, furniture-like look that blends into a bedroom aesthetic, but check that the edge sealing is clean to prevent moisture ingress during Chennai\'s rainy months. Solid wood options cost more but allow repairs and refinishing over a long life.',
      },
      {
        type: 'image',
        src: '/aboutus/inner5.webp',
        alt: 'Metal cot frame at Spacecrafts Furniture Chennai showroom',
        caption: 'Powder-coated metal frames resist rust and are easy to clean—well suited for Chennai\'s climate.',
      },
      {
        type: 'h2',
        text: 'Safety checklist before you buy',
      },
      {
        type: 'ul',
        items: [
          'Guard rails on both sides of the upper bunk — minimum 5 inches above the mattress surface',
          'Ladder angle and step width — wide steps at 50–60° are easier for young children than near-vertical rungs',
          'Weight capacity — confirm rated capacity for both berths; upper bunks for children often carry 80–100 kg safely',
          'Slat spacing — gaps no wider than 7.5 cm to prevent limbs or heads getting trapped',
          'No sharp edges or exposed bolt heads on the sleeping surface or ladder',
          'Mattress depth — mattress plus base should stay well below the top of guard rails; very thick mattresses reduce effective rail height',
          'Ceiling gap — leave at least 30 cm between upper mattress and ceiling for the child to sit up safely',
          'Fan clearance — in most Indian bedrooms a ceiling fan is directly above; plan bunk placement so the upper sleeper is not directly under a running fan',
        ],
      },
      {
        type: 'p',
        text: 'For children under six, the lower berth is generally safer. Upper bunks are typically recommended for children aged six and older who can use the ladder confidently and understand basic bunk-bed rules.',
      },
      {
        type: 'h2',
        text: 'Mattress sizing and compatibility',
      },
      {
        type: 'p',
        text: 'Most Indian bunk beds accept a single mattress: 72 × 36 inches (183 × 90 cm). Some wider models accommodate a 72 × 48-inch (183 × 120 cm) mattress on the lower berth. Always check the interior frame dimensions before ordering a mattress—a mattress that is 2 cm too long on one side can press against guard rails and compromise safety.',
      },
      {
        type: 'p',
        text: 'Mattress thickness matters too. For upper bunks, a 4–6-inch mattress is often ideal—thicker than that and the guard rail height may be insufficient. Coir and foam mattresses are popular for children\'s bunks; pocket spring mattresses work on lower berths but can be heavy for the upper slot.',
      },
      {
        type: 'h2',
        text: 'Room dimensions and access planning',
      },
      {
        type: 'p',
        text: 'Standard bunk beds have a footprint of approximately 90 cm × 190–200 cm and stand 150–175 cm tall. Measure your room with the door and window placement in mind: the bunk should not block ventilation, natural light, or emergency exit. Plan at least 90 cm of clear floor space on the ladder side for safe daily use.',
      },
      {
        type: 'p',
        text: 'For rooms with lower ceilings (8 feet / 244 cm), choose compact bunk models where the sleeping surface height is lower. In older Chennai buildings with narrow doorways or staircases, confirm the bed ships in knock-down flat-pack form—most quality bunk beds do—so it can be assembled inside the room.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80',
        alt: 'Children\'s bedroom with bunk bed and study area',
        caption: 'With the right bunk bed, one room comfortably handles sleep, study, and storage.',
      },
      {
        type: 'h2',
        text: 'Installation, delivery, and what to check on arrival',
      },
      {
        type: 'p',
        text: 'Most bunk beds arrive flat-packed in 3–5 cartons. Inspect every carton for transit damage before signing the delivery receipt—dents on metal frames or cracked panels on wood bunks should be photographed and reported within 48 hours. Assembly typically takes 1–2 hours for two people; follow the step-by-step guide included or the manufacturer video link.',
      },
      {
        type: 'p',
        text: 'After assembly, test each joint by applying body weight to the frame before a child uses it. Tighten any loose bolts immediately and re-check every 3–6 months—regular use and temperature cycles can loosen fasteners over time.',
      },
      {
        type: 'h2',
        text: 'Bunk beds at Spacecrafts Furniture',
      },
      {
        type: 'p',
        text: `We stock a range of bunk beds and bunk-cum-futon cots designed for Indian families, hostels, and rental homes. Popular models include the Delta Bunk Bed, Century Convertible Bunk Bed, and Jupiter Bunk Cum Futon Cot. All are available for pan-India delivery with assembly instructions; local customers can also visit our showroom at ${COMPANY.address.full} to see them in person and check dimensions before ordering.`,
      },
      {
        type: 'ul',
        items: [
          'Pan-India delivery — order online at spacecraftsfurniture.in',
          `Showroom — ${COMPANY.address.full}, open ${COMPANY.hours}`,
          `Call or WhatsApp: ${COMPANY.phoneDisplay}`,
          `Email: ${COMPANY.email}`,
        ],
      },
      {
        type: 'p',
        text: 'Looking for bunk beds online in India? Browse our full bunk bed collection at spacecraftsfurniture.in/products/category/bunk-beds for sizes, prices, and specifications. Questions before you buy? Call our team or visit the showroom in Ambattur, Chennai.',
      },
    ],
  },
  {
    slug: 'steel-cot-vs-wooden-bed-which-is-better-india',
    title: 'Steel Cot vs Wooden Bed: Which Is Better for Indian Homes? (2026 Guide)',
    description:
      'Confused between a steel cot and a wooden bed? This complete guide compares durability, price, maintenance, and looks — helping you choose the right bed for your bedroom in India.',
    publishedAt: '2026-10-02',
    updatedAt: '2026-10-02',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    imageAlt: 'Modern bedroom with a metal bed frame and clean white bedding',
    tags: ['steel cot', 'wooden bed', 'beds', 'buying guide', 'India'],
    sections: [
      {
        type: 'p',
        text: 'Every year, thousands of Indian families face the same question when furnishing a bedroom: should I buy a steel cot or a wooden bed? Both options are widely available, both have loyal fans — yet they serve different needs, budgets, and lifestyles. This guide breaks down every factor that matters so you can make a confident choice for your home.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
        alt: 'Clean bedroom with a metal cot frame — steel vs wood comparison',
        caption: 'Steel and wooden beds each have a clear place in the Indian bedroom.',
      },
      {
        type: 'h2',
        text: 'What is a steel cot?',
      },
      {
        type: 'p',
        text: 'A steel cot (also called a metal cot or iron bed) uses a welded or bolted frame made from mild steel, hollow sections, or wrought iron. The legs, headboard, footboard, and side rails are all metal. A mesh or slat support holds the mattress. Steel cots are the most common bed type in rental apartments, hostels, hospitals, and budget Indian homes — and increasingly in well-designed urban bedrooms too.',
      },
      {
        type: 'h2',
        text: 'What is a wooden bed?',
      },
      {
        type: 'p',
        text: 'A wooden bed uses a frame made from solid wood (teak, sheesham, rubber wood) or engineered wood (MDF, plywood, HDF). It typically features a thicker headboard, wider side rails, and a more traditional or premium look. Wooden beds are the default choice in traditional Indian households and high-end apartments.',
      },
      {
        type: 'h2',
        text: '1. Durability and strength',
      },
      {
        type: 'p',
        text: 'Steel cots are exceptionally strong. A well-welded steel frame can hold 200–400 kg without flex. Steel does not warp, crack, split, or swell — common problems with wood in humid coastal cities like Chennai, Mumbai, and Kochi. Wooden beds — especially solid teak or sheesham — are also durable but require consistent care. Engineered wood (MDF) is less durable, especially in humid conditions: edges swell, boards delaminate, and screws loosen over time.',
      },
      {
        type: 'ul',
        items: [
          'Steel cot lifespan: 15–25 years with minimal maintenance',
          'Solid wood bed lifespan: 10–20 years with oiling and polishing',
          'Engineered wood lifespan: 5–10 years depending on humidity and usage',
          'Steel does not absorb moisture — ideal for ground floors and coastal areas',
        ],
      },
      {
        type: 'h2',
        text: '2. Price comparison',
      },
      {
        type: 'p',
        text: 'Steel cots are significantly more affordable than wooden beds of similar size and quality. A good single steel cot in India starts at ₹8,000–₹15,000. A double (queen) steel cot ranges from ₹12,000–₹25,000. Equivalent wooden beds cost 1.5× to 3× more. If you are furnishing multiple rooms — a hostel, rental flat, or children\'s room — steel cots offer the best value.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1555041469-a586c61e9bc7?w=1200&q=80',
        alt: 'Living space with clean modern furniture and bedroom visible in background',
        caption: 'Steel cots fit Indian apartments well — affordable, durable, easy to move.',
      },
      {
        type: 'h2',
        text: '3. Maintenance and pest resistance',
      },
      {
        type: 'p',
        text: 'This is where steel wins clearly. Steel does not attract termites, wood borers, or rodents. In India, termite infestation is a real concern — especially in older homes and in states like Kerala, Tamil Nadu, Karnataka, and Maharashtra. Steel cots need no oiling, polishing, or anti-termite treatment. An occasional wipe and a rust-prevention coat every few years is all they need.',
      },
      {
        type: 'p',
        text: 'Wooden beds require annual oiling or polishing to prevent dryness and cracking. In humid climates, wood swells — doors stick, joints loosen, and veneer bubbles. Solid wood is more resistant, but MDF and plywood beds are highly susceptible to water damage.',
      },
      {
        type: 'h2',
        text: '4. Weight and portability',
      },
      {
        type: 'p',
        text: 'Steel cots are lighter than solid wood beds of the same size. A single steel cot weighs 15–25 kg; a solid teak single bed weighs 40–70 kg. If you move homes frequently — as many young professionals and renters in Chennai, Bengaluru, and Mumbai do — a steel cot is far easier to disassemble, transport, and reassemble in a new flat.',
      },
      {
        type: 'h2',
        text: '5. Look and design options',
      },
      {
        type: 'p',
        text: 'Wooden beds have traditionally been preferred for aesthetics. A solid teak or sheesham bed with carved headboard looks premium and warm. However, modern steel cots have improved dramatically in design. Powder-coated frames, clean geometric shapes, and minimalist headboards make today\'s steel cots a stylish choice for modern apartments and rental homes.',
      },
      {
        type: 'p',
        text: 'At Spacecrafts Furniture, our metal cots come in contemporary designs with clean lines — not the utilitarian hospital-style frames of the past. Browse our steel cot and metal bed collection at spacecraftsfurniture.in/products/category/beds.',
      },
      {
        type: 'h2',
        text: '6. Storage options',
      },
      {
        type: 'p',
        text: 'Both steel cots and wooden beds are available with under-bed storage. Wooden storage beds often have hydraulic lift mechanisms or drawers. Steel cots with storage use bolt-on drawer boxes or open-base designs that allow storage boxes underneath. If storage is your priority, wooden hydraulic storage beds offer more capacity and easier access.',
      },
      {
        type: 'h2',
        text: 'Quick comparison table: steel cot vs wooden bed',
      },
      {
        type: 'ul',
        items: [
          'Price: Steel cot wins — 30–60% cheaper for similar quality',
          'Durability: Both good — steel better in humid/coastal areas',
          'Pest resistance: Steel wins — no termite risk at all',
          'Aesthetics: Wood wins for traditional look; steel for minimalist/modern',
          'Weight & portability: Steel wins — easier to move between homes',
          'Maintenance: Steel wins — no oiling, polishing, or treatments needed',
          'Storage options: Wood wins for large hydraulic under-bed storage',
          'Eco-friendliness: Steel is 100% recyclable; wood is renewable if FSC-certified',
        ],
      },
      {
        type: 'h2',
        text: 'Which should you choose?',
      },
      {
        type: 'p',
        text: 'Choose a steel cot if you live in a rented apartment, are furnishing a children\'s room or guest room, live near the coast (Chennai, Mumbai, Kochi), are on a budget, or move homes every 2–3 years. Steel cots also make sense for hostel rooms, PG accommodations, and bulk orders for rental property owners.',
      },
      {
        type: 'p',
        text: 'Choose a wooden bed if you own your home and plan to stay long-term, want a traditional or heritage-style bedroom, have a higher budget (₹25,000+), and are in a dry climate with good ventilation. Solid teak or sheesham beds are lifelong investments if cared for properly.',
      },
      {
        type: 'h2',
        text: 'Single steel cot sizes and prices in India (2026)',
      },
      {
        type: 'ul',
        items: [
          'Single steel cot (75×36 inches): ₹8,000–₹14,000',
          'Single steel cot with storage: ₹12,000–₹20,000',
          'Double / queen steel cot (75×60 inches): ₹15,000–₹28,000',
          'King size steel cot (75×72 inches): ₹20,000–₹35,000',
          'Folding steel cot (portable): ₹6,000–₹12,000',
        ],
      },
      {
        type: 'p',
        text: 'Prices vary by brand, finish, and weight capacity. Always check the gauge (thickness) of the steel tubes — thicker gauge means stronger, longer-lasting frames. At Spacecrafts Furniture, our metal cots use heavy-gauge steel with powder-coated finishes that resist rust and scratching.',
      },
      {
        type: 'h2',
        text: 'Explore steel cots and beds at Spacecrafts Furniture',
      },
      {
        type: 'p',
        text: 'Browse our full range of steel cots, metal cots, folding cots, and wooden beds online at spacecraftsfurniture.in/products/category/beds. We deliver across India from our Ambattur, Chennai facility. Visit our 8,000 sq. ft. showroom to see and test before you buy, or call +91 90030 03733 for guidance.',
      },
    ],
  },
  {
    slug: 'best-furniture-store-chennai-buying-guide',
    title: 'Best Furniture Store in Chennai: How to Choose (2026 Buying Guide)',
    description:
      'Looking for the best furniture store in Chennai? Compare showroom vs mall brands, what to check for sofas and beds, and why Ambattur Spacecrafts Furniture is a strong pick for space-saving homes.',
    publishedAt: '2026-10-03',
    updatedAt: '2026-10-03',
    image: U.showroom,
    imageAlt: 'Styled living room furniture display — choosing a furniture store in Chennai',
    tags: ['furniture store Chennai', 'Chennai', 'buying guide', 'showroom'],
    sections: [
      {
        type: 'p',
        text: `Searching “furniture store Chennai” or “best furniture store in Chennai” usually means you want three things at once: a place you can visit, products that fit Indian apartments, and pricing that does not collapse after delivery charges. ${COMPANY.name} built its reputation in Ambattur around that mix — manufacturer quality, an 8,000 sq. ft. showroom, and online ordering with pan-India shipping.`,
      },
      {
        type: 'image',
        src: U.showroom,
        alt: 'Bright living room with sofa and wood accents',
        caption: 'A good Chennai furniture store lets you test comfort and scale before you pay.',
      },
      {
        type: 'h2',
        text: 'What “best furniture store in Chennai” should mean',
      },
      {
        type: 'p',
        text: 'National chains and mall showrooms win on brand recognition and huge catalogues. Local manufacturer-retailers win when you need bunk beds, metal cots, sofa cum beds, or compact dining that must clear a lift and survive monsoon humidity. Rank stores by fit for your home — not only by Instagram ads.',
      },
      {
        type: 'ul',
        items: [
          'Can you sit on the sofa / climb a bunk safely in store?',
          'Are dimensions published for beds, tables and storage units?',
          'Is there a real address, GST and phone you can call?',
          'Do they explain warranty, foam density and steel gauge clearly?',
          'Can you order online after a showroom visit (or the reverse)?',
        ],
      },
      {
        type: 'h2',
        text: 'Showroom chains vs specialist furniture stores in Chennai',
      },
      {
        type: 'p',
        text: 'Mall furniture shops are excellent for décor, soft furnishings and broad living-room looks. Specialist stores — especially those that also manufacture — are stronger when your brief is “two kids in one bedroom”, “sofa that becomes a guest bed”, or “steel cot that will not warp in Ambattur humidity”. Use both if you like: moodboard at a large brand, structural pieces at a specialist.',
      },
      {
        type: 'image',
        src: U.apartment,
        alt: 'Compact apartment living space with furniture',
        caption: 'Chennai apartments reward space-saving furniture choices.',
      },
      {
        type: 'h2',
        text: 'Categories to prioritise when you shop furniture in Chennai',
      },
      {
        type: 'ul',
        items: [
          'Living: sofas, sofa cum beds, recliners, centre tables',
          'Bedroom: metal cots, wooden beds, bunk beds, mattresses',
          'Dining: 4-seater and compact sets for 1BHK / 2BHK',
          'Study: desks and chairs for work-from-home corners',
          'Storage: wardrobes, racks and under-bed solutions',
        ],
      },
      {
        type: 'h2',
        text: 'Why many buyers start in Ambattur',
      },
      {
        type: 'p',
        text: `${COMPANY.name} operates from ${COMPANY.address.full}. North and west Chennai neighbourhoods — Anna Nagar, Mogappair, Padi, Avadi, Kolathur — reach the showroom easily, and customers from OMR, Velachery and Tambaram often combine a visit with online delivery. Hours: ${COMPANY.hours}.`,
      },
      {
        type: 'image',
        src: U.bedroom,
        alt: 'Bedroom furniture with clean bedding',
        caption: 'Test bed height and mattress feel in person when you can.',
      },
      {
        type: 'h2',
        text: 'Practical checklist before you pay',
      },
      {
        type: 'ul',
        items: [
          'Measure room, door and lift — write numbers on your phone',
          'Decide foam preference (soft vs firm) for sofas and mattresses',
          'Ask about assembly, lead time and pin-code delivery',
          'Compare steel gauge / wood type, not only the sticker price',
          'Photograph finishes in daylight for colour matching at home',
        ],
      },
      {
        type: 'h2',
        text: 'Next steps',
      },
      {
        type: 'p',
        text: `Browse the dedicated guide at spacecraftsfurniture.in/furniture-store-chennai, shop categories online, or visit the showroom. Call ${COMPANY.phoneDisplay} for product questions. For showroom vs online trade-offs, read our companion article on furniture shopping in Chennai.`,
      },
    ],
  },
  {
    slug: 'furniture-shopping-in-chennai-showroom-vs-online',
    title: 'Furniture Shopping in Chennai: Showroom vs Online (What Works in 2026)',
    description:
      'Should you buy furniture in a Chennai showroom or online? Compare comfort testing, delivery, returns and space-saving picks — with a practical hybrid approach used by Spacecrafts customers.',
    publishedAt: '2026-10-03',
    updatedAt: '2026-10-03',
    image: U.living,
    imageAlt: 'Modern sofa in a living room — furniture shopping in Chennai',
    tags: ['furniture shopping Chennai', 'showroom', 'online furniture', 'Chennai'],
    sections: [
      {
        type: 'p',
        text: 'Chennai shoppers now split into three camps: mall showroom only, pure online, and hybrid (shortlist online, confirm in store). For sofas, bunk beds and dining chairs, hybrid usually wins — you protect comfort decisions without giving up pin-code delivery.',
      },
      {
        type: 'image',
        src: U.living,
        alt: 'Green sofa in a modern living room',
        caption: 'Comfort is hard to judge from a product tile alone.',
      },
      {
        type: 'h2',
        text: 'When a furniture showroom in Chennai is worth the trip',
      },
      {
        type: 'ul',
        items: [
          'Primary sofa or recliner you will sit on every day',
          'Bunk beds — check rail height, ladder angle and mattress size',
          'Fabric colour under real lighting (not only phone screens)',
          'Bulk or multi-room orders where samples save expensive mistakes',
        ],
      },
      {
        type: 'h2',
        text: 'When online furniture shopping is enough',
      },
      {
        type: 'ul',
        items: [
          'You already measured and know the exact model / SKU',
          'Repeat purchase (same metal cot or dining chair as before)',
          'You live far from Ambattur but trust published specs and reviews',
          'You need pan-India shipping to another city from Chennai stock',
        ],
      },
      {
        type: 'image',
        src: U.delivery,
        alt: 'People planning a home project together',
        caption: 'Agree measurements and budget before you visit or checkout.',
      },
      {
        type: 'h2',
        text: 'A hybrid workflow that works for Chennai apartments',
      },
      {
        type: 'p',
        text: `1) Shortlist 3–5 products on spacecraftsfurniture.in. 2) Visit ${COMPANY.name} in Ambattur with your floor plan. 3) Confirm foam, finish and dimensions. 4) Place the order online or at the desk for delivery to your pin code. This is how many Anna Nagar and OMR customers avoid returns.`,
      },
      {
        type: 'h2',
        text: 'Delivery and humidity realities',
      },
      {
        type: 'p',
        text: 'Coastal humidity is hard on poor engineered wood and untreated metal. Ask about powder coating on steel frames and sealed edges on wood. Confirm staircase or lift access; many Chennai buildings need pieces that disassemble. Our team can advise before dispatch.',
      },
      {
        type: 'image',
        src: U.dining,
        alt: 'Dining table set in a bright room',
        caption: 'Dining sets: check chair width against your room, not only table length.',
      },
      {
        type: 'h2',
        text: 'Where to go next',
      },
      {
        type: 'p',
        text: `Store details: ${COMPANY.address.full}. Hours: ${COMPANY.hours}. Phone: ${COMPANY.phoneDisplay}. Maps: ${COMPANY.mapsUrl}. Also read the best furniture store in Chennai buying guide and our Ambattur showroom visit article.`,
      },
    ],
  },
  {
    slug: 'sofa-bedroom-furniture-chennai-apartments',
    title: 'Sofa & Bedroom Furniture for Chennai Apartments: Practical Picks',
    description:
      'Furnishing a Chennai apartment? See how to choose sofas, sofa cum beds, metal cots and bunk beds for small bedrooms — with showroom tips from Spacecrafts Furniture Ambattur.',
    publishedAt: '2026-10-03',
    updatedAt: '2026-10-03',
    image: U.sofa,
    imageAlt: 'Living room sofa — furniture ideas for Chennai apartments',
    tags: ['sofa Chennai', 'bedroom furniture Chennai', 'apartments', 'space saving'],
    sections: [
      {
        type: 'p',
        text: 'Most Chennai furniture searches eventually become room problems: a living room that must host guests overnight, or a kids’ room that needs two sleep surfaces. This guide focuses on sofas and bedroom furniture that fit real apartment constraints — not villa floor plans.',
      },
      {
        type: 'image',
        src: U.sofa,
        alt: 'Neutral sofa in a living room',
        caption: 'Start with sofa depth and seat height — not only fabric colour.',
      },
      {
        type: 'h2',
        text: 'Living room: sofas and sofa cum beds',
      },
      {
        type: 'p',
        text: 'For 1BHK and 2BHK homes, a sofa cum bed often beats a bulky 3+2 set. Check mechanism smoothness in the showroom, mattress thickness when unfolded, and whether the sofa still looks intentional when closed. Fabric should handle daily sitting; leatherette needs different care in Chennai heat.',
      },
      {
        type: 'ul',
        items: [
          'Measure wall length and TV unit clearance before choosing sofa width',
          'Prefer removable covers when you have kids or pets',
          'Test edge support if elders will sit and stand often',
        ],
      },
      {
        type: 'image',
        src: U.family,
        alt: 'Apartment interior with living furniture',
        caption: 'Apartment living rewards multi-use furniture.',
      },
      {
        type: 'h2',
        text: 'Bedroom: metal cots, bunk beds and storage',
      },
      {
        type: 'p',
        text: 'Metal cots are popular in Chennai for termite resistance and easier moves between rentals. Bunk beds free floor area for study desks. Always confirm guard-rail height, ladder side, and mattress size (often different from a standard single cot).',
      },
      {
        type: 'image',
        src: U.bunk,
        alt: 'Bedroom with bunk-style sleeping setup',
        caption: 'Bunk beds: verify ceiling height and safe clearance.',
      },
      {
        type: 'h2',
        text: 'Materials that cope with Chennai weather',
      },
      {
        type: 'ul',
        items: [
          'Powder-coated steel for frames near coastal humidity',
          'Well-sealed engineered wood if you choose wood storage',
          'Breathable fabrics for sofas in non-AC rooms',
          'Mattresses with adequate density for daily use — not only “soft feel”',
        ],
      },
      {
        type: 'h2',
        text: 'Shop and visit',
      },
      {
        type: 'p',
        text: `Explore sofas, beds and bunk beds at spacecraftsfurniture.in/products, or visit ${COMPANY.name} at ${COMPANY.address.full}. Call ${COMPANY.phoneDisplay}. More city context: spacecraftsfurniture.in/furniture-store-chennai.`,
      },
    ],
  },
]
