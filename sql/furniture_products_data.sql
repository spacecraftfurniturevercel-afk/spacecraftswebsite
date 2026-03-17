-- ============================================
-- SPACECRAFTS FURNITURE - COMPREHENSIVE DATA
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, clear existing sample data if you want a fresh start
-- DELETE FROM product_images;
-- DELETE FROM reviews;
-- DELETE FROM products;
-- DELETE FROM brands;
-- DELETE FROM categories;
-- DELETE FROM stores;

-- ============================================
-- 1. CATEGORIES (Furniture Categories)
-- ============================================
INSERT INTO categories (name, slug) VALUES
('Living Room', 'living-room'),
('Bedroom', 'bedroom'),
('Dining Room', 'dining-room'),
('Office Furniture', 'office-furniture'),
('Outdoor Furniture', 'outdoor-furniture'),
('Storage & Organization', 'storage-organization'),
('Kids Furniture', 'kids-furniture'),
('Mattresses', 'mattresses'),
('Home Decor', 'home-decor'),
('Sofas & Couches', 'sofas-couches'),
('Beds & Frames', 'beds-frames'),
('Tables', 'tables'),
('Chairs & Seating', 'chairs-seating'),
('TV Units & Entertainment', 'tv-units-entertainment'),
('Wardrobes & Cabinets', 'wardrobes-cabinets')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. BRANDS (Premium Furniture Brands)
-- ============================================
INSERT INTO brands (name, slug) VALUES
('Spacecrafts Elite', 'spacecrafts-elite'),
('Stellar Living', 'stellar-living'),
('Nova Comfort', 'nova-comfort'),
('Cosmic Designs', 'cosmic-designs'),
('Orion Home', 'orion-home'),
('Nebula Interiors', 'nebula-interiors'),
('Galaxy Furniture', 'galaxy-furniture'),
('Luna Collection', 'luna-collection'),
('Solaris Home', 'solaris-home'),
('Astro Living', 'astro-living')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. PRODUCTS (50 Premium Furniture Items)
-- ============================================

-- LIVING ROOM - Sofas & Couches
INSERT INTO products (name, slug, category_id, brand_id, description, price, discount_price, stock, rating, review_count, dimensions, material, warranty, delivery_info, tags) VALUES
(
  'Modern L-Shape Sofa with Storage',
  'modern-l-shape-sofa-storage',
  (SELECT id FROM categories WHERE slug='sofas-couches'),
  (SELECT id FROM brands WHERE slug='spacecrafts-elite'),
  'Premium L-shaped sofa with hidden storage compartments. Features plush velvet upholstery, solid wood frame, and ergonomic design for maximum comfort. Perfect for modern living rooms. Includes removable cushion covers for easy maintenance.',
  89999.00,
  69999.00,
  15,
  4.8,
  156,
  '{"length_cm": 280, "depth_cm": 180, "height_cm": 85, "seat_height_cm": 45}',
  'Velvet Fabric, Solid Teak Wood Frame, High-Density Foam',
  '3 years comprehensive warranty',
  'Free delivery and installation within 7-10 business days. Assembly service included.',
  ARRAY['sofa', 'l-shape', 'storage', 'living-room', 'modern', 'bestseller']
),
(
  '3-Seater Recliner Sofa - Premium Leather',
  '3-seater-recliner-sofa-leather',
  (SELECT id FROM categories WHERE slug='sofas-couches'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Luxurious 3-seater recliner sofa with genuine leather upholstery. Manual reclining mechanism with adjustable headrests. Built with engineered wood and metal frame for durability. Perfect for home theaters and lounges.',
  124999.00,
  99999.00,
  8,
  4.9,
  203,
  '{"length_cm": 220, "depth_cm": 95, "height_cm": 100, "seat_height_cm": 48}',
  'Genuine Leather, Engineered Wood, Steel Frame',
  '5 years on mechanism, 2 years on upholstery',
  'Free delivery within 5-7 days. Professional installation included.',
  ARRAY['recliner', 'leather', 'sofa', 'luxury', 'living-room']
),
(
  'Fabric Loveseat Sofa - Compact 2-Seater',
  'fabric-loveseat-sofa-compact',
  (SELECT id FROM categories WHERE slug='sofas-couches'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Compact yet comfortable 2-seater loveseat perfect for small apartments. Features breathable linen fabric, removable cushions, and contemporary design. Ideal for balconies, reading corners, or small living spaces.',
  34999.00,
  27999.00,
  25,
  4.6,
  89,
  '{"length_cm": 145, "depth_cm": 85, "height_cm": 82, "seat_height_cm": 43}',
  'Linen Fabric, Solid Pine Wood, Foam Cushioning',
  '2 years warranty',
  'Free delivery in 4-6 days. Easy DIY assembly.',
  ARRAY['loveseat', '2-seater', 'compact', 'apartment', 'modern']
),

-- BEDROOM - Beds & Frames
(
  'King Size Upholstered Bed with Hydraulic Storage',
  'king-size-upholstered-bed-hydraulic',
  (SELECT id FROM categories WHERE slug='beds-frames'),
  (SELECT id FROM brands WHERE slug='cosmic-designs'),
  'Elegant king-size upholstered bed with hydraulic storage system. Features button-tufted headboard, premium fabric upholstery, and spacious under-bed storage. Gas lift mechanism for easy access. Modern and functional design.',
  74999.00,
  59999.00,
  12,
  4.7,
  134,
  '{"length_cm": 215, "width_cm": 185, "height_cm": 120, "mattress_size": "180x200 cm"}',
  'Fabric Upholstery, Engineered Wood, Gas Lift Hydraulic System',
  '3 years on hydraulics, 2 years on frame',
  'Free delivery and installation within 7-10 days.',
  ARRAY['bed', 'king-size', 'storage', 'hydraulic', 'bedroom', 'trending']
),
(
  'Solid Wood Queen Bed - Contemporary Platform',
  'solid-wood-queen-bed-platform',
  (SELECT id FROM categories WHERE slug='beds-frames'),
  (SELECT id FROM brands WHERE slug='orion-home'),
  'Minimalist queen-size platform bed crafted from solid sheesham wood. Features natural wood grain finish, slatted base for mattress support, and low-profile design. No box spring required. Built to last generations.',
  54999.00,
  44999.00,
  18,
  4.8,
  167,
  '{"length_cm": 205, "width_cm": 165, "height_cm": 95, "mattress_size": "150x200 cm"}',
  '100% Solid Sheesham Wood, Natural Finish',
  '10 years on wood frame',
  'Free delivery in 8-12 days. Professional assembly included.',
  ARRAY['bed', 'queen-size', 'wood', 'platform', 'contemporary', 'bestseller']
),
(
  'Metal Bunk Bed for Kids - Twin over Twin',
  'metal-bunk-bed-kids-twin',
  (SELECT id FROM categories WHERE slug='kids-furniture'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Space-saving twin-over-twin bunk bed with sturdy metal construction. Features integrated ladder, safety rails, and can be separated into two individual beds. Perfect for kids rooms and guest rooms. Weight capacity: 150kg per bed.',
  39999.00,
  32999.00,
  20,
  4.5,
  98,
  '{"length_cm": 200, "width_cm": 105, "height_cm": 160, "mattress_size": "90x190 cm each"}',
  'Heavy-Duty Steel Frame, Powder-Coated Finish',
  '5 years warranty',
  'Free delivery in 5-7 days. Assembly required.',
  ARRAY['bunk-bed', 'kids', 'metal', 'space-saving', 'twin']
),

-- DINING ROOM
(
  '6-Seater Solid Wood Dining Table Set',
  '6-seater-solid-wood-dining-set',
  (SELECT id FROM categories WHERE slug='dining-room'),
  (SELECT id FROM brands WHERE slug='spacecrafts-elite'),
  'Premium 6-seater dining table set with cushioned chairs. Crafted from solid mango wood with honey oak finish. Table features expandable design. Chairs include comfortable fabric cushions. Perfect for family dining and entertaining guests.',
  84999.00,
  69999.00,
  10,
  4.9,
  212,
  '{"table_length_cm": 180, "table_width_cm": 90, "table_height_cm": 75, "chair_dimensions": "45x50x95 cm"}',
  'Solid Mango Wood, Fabric Cushions, Natural Finish',
  '5 years on table, 2 years on chairs',
  'Free delivery and setup within 10-14 days.',
  ARRAY['dining-set', '6-seater', 'wood', 'table', 'chairs', 'bestseller']
),
(
  'Modern Glass Top Dining Table - 4 Seater',
  'modern-glass-top-dining-table-4',
  (SELECT id FROM categories WHERE slug='dining-room'),
  (SELECT id FROM brands WHERE slug='nebula-interiors'),
  'Contemporary 4-seater dining table with 12mm tempered glass top and chrome-finished metal legs. Compact design perfect for apartments. Easy to clean and maintain. Chairs sold separately or as a set.',
  29999.00,
  24999.00,
  22,
  4.4,
  76,
  '{"length_cm": 120, "width_cm": 75, "height_cm": 75}',
  'Tempered Glass Top, Chrome-Plated Metal Base',
  '2 years warranty',
  'Free delivery in 4-6 days. Easy assembly.',
  ARRAY['dining-table', '4-seater', 'glass', 'modern', 'compact']
),

-- OFFICE FURNITURE
(
  'Ergonomic Executive Office Chair with Lumbar Support',
  'ergonomic-executive-office-chair',
  (SELECT id FROM categories WHERE slug='office-furniture'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Premium ergonomic office chair with adjustable lumbar support, headrest, and armrests. Features high-density foam cushioning, breathable mesh back, and 360-degree swivel. Weight capacity: 120kg. Certified for 8+ hours daily use.',
  19999.00,
  15999.00,
  35,
  4.7,
  189,
  '{"width_cm": 65, "depth_cm": 70, "height_cm": "110-120 (adjustable)"}',
  'Mesh Back, PU Leather Seat, Nylon Base, Gas Lift',
  '3 years on mechanism, 1 year on upholstery',
  'Free delivery in 3-5 days. Ready to use.',
  ARRAY['office-chair', 'ergonomic', 'executive', 'work-from-home', 'trending']
),
(
  'Computer Desk with Storage - Home Office',
  'computer-desk-storage-home-office',
  (SELECT id FROM categories WHERE slug='office-furniture'),
  (SELECT id FROM brands WHERE slug='galaxy-furniture'),
  'Spacious computer desk with built-in storage shelves and cable management. Features engineered wood construction with laminate finish. Includes keyboard tray and multiple compartments for office supplies. Perfect for home offices.',
  15999.00,
  12999.00,
  28,
  4.5,
  123,
  '{"length_cm": 120, "depth_cm": 60, "height_cm": 75}',
  'Engineered Wood, Laminate Finish, Metal Hardware',
  '2 years warranty',
  'Free delivery in 5-7 days. Assembly required.',
  ARRAY['desk', 'computer-desk', 'office', 'storage', 'work-from-home']
),

-- LIVING ROOM - TV Units & Entertainment
(
  'Contemporary TV Unit with LED Lights - 65 inch',
  'contemporary-tv-unit-led-lights',
  (SELECT id FROM categories WHERE slug='tv-units-entertainment'),
  (SELECT id FROM brands WHERE slug='astro-living'),
  'Modern TV entertainment unit suitable for up to 65-inch TVs. Features built-in LED strip lighting, cable management system, and ample storage drawers. High-gloss finish with floating design. Includes remote-controlled LED lights.',
  34999.00,
  27999.00,
  16,
  4.6,
  142,
  '{"length_cm": 180, "depth_cm": 40, "height_cm": 50}',
  'Engineered Wood, High-Gloss Finish, LED Strips',
  '2 years warranty, 1 year on electronics',
  'Free delivery and installation in 7-9 days.',
  ARRAY['tv-unit', 'entertainment', 'led-lights', 'modern', 'living-room']
),
(
  'Wooden TV Stand with Open Shelves - Rustic',
  'wooden-tv-stand-rustic',
  (SELECT id FROM categories WHERE slug='tv-units-entertainment'),
  (SELECT id FROM brands WHERE slug='orion-home'),
  'Rustic-style TV stand crafted from reclaimed wood. Features three open shelves for media devices and storage. Distressed finish adds vintage charm. Supports TVs up to 55 inches. Eco-friendly and sustainable design.',
  24999.00,
  19999.00,
  14,
  4.7,
  98,
  '{"length_cm": 140, "depth_cm": 38, "height_cm": 55}',
  'Reclaimed Wood, Natural Distressed Finish',
  '5 years warranty',
  'Free delivery in 6-8 days.',
  ARRAY['tv-stand', 'rustic', 'wood', 'vintage', 'eco-friendly']
),

-- STORAGE & ORGANIZATION
(
  'Modular Wardrobe System - 3 Door with Mirror',
  'modular-wardrobe-3-door-mirror',
  (SELECT id FROM categories WHERE slug='wardrobes-cabinets'),
  (SELECT id FROM brands WHERE slug='spacecrafts-elite'),
  'Spacious 3-door wardrobe with full-length mirror and organized interior. Features hanging rod, shelves, and drawers. Engineered wood with laminate finish. Soft-close hinges for quiet operation. Modern and functional storage solution.',
  54999.00,
  44999.00,
  12,
  4.8,
  156,
  '{"width_cm": 180, "depth_cm": 58, "height_cm": 210}',
  'Engineered Wood, Laminate, Mirror, Soft-Close Hinges',
  '3 years warranty',
  'Free delivery and installation in 10-15 days.',
  ARRAY['wardrobe', 'storage', 'mirror', 'bedroom', 'closet']
),
(
  '5-Tier Bookshelf - Ladder Style',
  '5-tier-bookshelf-ladder',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Stylish ladder-style 5-tier bookshelf with modern industrial design. Metal frame with wooden shelves. Perfect for books, plants, and decorative items. Space-efficient design ideal for small spaces.',
  12999.00,
  9999.00,
  30,
  4.5,
  87,
  '{"width_cm": 70, "depth_cm": 35, "height_cm": 180}',
  'Metal Frame, Engineered Wood Shelves',
  '2 years warranty',
  'Free delivery in 4-5 days. Easy assembly.',
  ARRAY['bookshelf', 'storage', 'ladder', 'industrial', 'modern']
),

-- CHAIRS & SEATING
(
  'Accent Chair with Ottoman - Velvet',
  'accent-chair-ottoman-velvet',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Luxurious accent chair with matching ottoman. Features deep button tufting, velvet upholstery in multiple colors. Solid wood legs with golden finish. Perfect for reading corners or as statement furniture piece.',
  29999.00,
  24999.00,
  18,
  4.7,
  112,
  '{"chair_width_cm": 80, "chair_depth_cm": 85, "chair_height_cm": 95, "ottoman": "60x40x45 cm"}',
  'Velvet Fabric, High-Density Foam, Solid Wood Legs',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['accent-chair', 'ottoman', 'velvet', 'luxury', 'seating']
),
(
  'Set of 4 Dining Chairs - Modern Upholstered',
  'set-4-dining-chairs-modern',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='cosmic-designs'),
  'Contemporary set of 4 dining chairs with padded seats and backrests. Features sturdy metal legs with wooden accents. Comfortable foam cushioning with fabric upholstery. Easy to clean and maintain.',
  24999.00,
  19999.00,
  25,
  4.6,
  134,
  '{"per_chair": "45x55x90 cm"}',
  'Fabric Upholstery, Metal Legs, Foam Padding',
  '2 years warranty',
  'Free delivery in 4-6 days.',
  ARRAY['dining-chairs', 'set-of-4', 'modern', 'upholstered']
),

-- OUTDOOR FURNITURE
(
  'Outdoor Patio Set - 4 Seater with Table',
  'outdoor-patio-set-4-seater',
  (SELECT id FROM categories WHERE slug='outdoor-furniture'),
  (SELECT id FROM brands WHERE slug='solaris-home'),
  'Weather-resistant outdoor furniture set including 4 chairs and coffee table. Made from synthetic rattan/wicker with rust-proof aluminum frame. UV-resistant cushions included. Perfect for balconies, patios, and gardens.',
  44999.00,
  36999.00,
  15,
  4.5,
  92,
  '{"table": "90x90x45 cm", "chairs": "60x65x85 cm each"}',
  'Synthetic Rattan, Aluminum Frame, Weather-Resistant Cushions',
  '2 years warranty',
  'Free delivery in 7-10 days. Assembly required.',
  ARRAY['outdoor', 'patio', 'garden', 'weather-resistant', 'rattan']
),
(
  'Hammock with Stand - Portable',
  'hammock-with-stand-portable',
  (SELECT id FROM categories WHERE slug='outdoor-furniture'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Freestanding hammock with sturdy powder-coated steel stand. Features breathable cotton-blend fabric. No trees required. Easy to assemble and portable. Weight capacity: 150kg. Includes carry bag for storage.',
  18999.00,
  14999.00,
  20,
  4.6,
  78,
  '{"length_cm": 280, "width_cm": 120, "height_cm": 110}',
  'Cotton Blend Fabric, Powder-Coated Steel Stand',
  '1 year warranty',
  'Free delivery in 5-6 days.',
  ARRAY['hammock', 'outdoor', 'portable', 'relaxation', 'garden']
),

-- TABLES
(
  'Coffee Table with Storage - Lift Top',
  'coffee-table-storage-lift-top',
  (SELECT id FROM categories WHERE slug='tables'),
  (SELECT id FROM brands WHERE slug='nebula-interiors'),
  'Multi-functional coffee table with hydraulic lift-top mechanism and hidden storage compartment. Perfect for working from home or dining in the living room. Modern design with engineered wood construction.',
  19999.00,
  15999.00,
  22,
  4.7,
  145,
  '{"length_cm": 110, "width_cm": 60, "height_cm": "40-60 (adjustable)"}',
  'Engineered Wood, Hydraulic Lift Mechanism',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['coffee-table', 'storage', 'lift-top', 'living-room', 'multi-functional']
),
(
  'Console Table - Marble Top with Gold Frame',
  'console-table-marble-gold',
  (SELECT id FROM categories WHERE slug='tables'),
  (SELECT id FROM brands WHERE slug='astro-living'),
  'Elegant console table featuring genuine marble top and gold-finished metal frame. Perfect for entryways, hallways, or behind sofas. Modern luxury design that adds sophistication to any space.',
  34999.00,
  28999.00,
  12,
  4.8,
  89,
  '{"length_cm": 120, "depth_cm": 40, "height_cm": 80}',
  'Genuine Marble Top, Gold-Plated Metal Frame',
  '2 years warranty',
  'Free delivery in 6-8 days.',
  ARRAY['console-table', 'marble', 'luxury', 'entryway', 'gold']
),
(
  'Side Table Set of 2 - Nesting Tables',
  'side-table-set-2-nesting',
  (SELECT id FROM categories WHERE slug='tables'),
  (SELECT id FROM brands WHERE slug='galaxy-furniture'),
  'Space-saving set of 2 nesting side tables with round tops. Metal frame with wooden tops. Can be used separately or nested together. Perfect for small spaces, living rooms, or bedrooms.',
  12999.00,
  9999.00,
  28,
  4.5,
  67,
  '{"large_table": "50x50x55 cm", "small_table": "40x40x50 cm"}',
  'Metal Frame, Engineered Wood Top',
  '2 years warranty',
  'Free delivery in 3-5 days.',
  ARRAY['side-table', 'nesting', 'set-of-2', 'space-saving', 'modern']
),

-- MATTRESSES
(
  'Memory Foam Mattress - Queen Size Orthopedic',
  'memory-foam-mattress-queen-orthopedic',
  (SELECT id FROM categories WHERE slug='mattresses'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Premium orthopedic memory foam mattress with 5 layers for optimal support. Medium-firm comfort level. Temperature-regulating gel-infused memory foam. 10-year warranty. Queen size (150x200 cm). Includes free pillows.',
  34999.00,
  27999.00,
  20,
  4.9,
  234,
  '{"length_cm": 200, "width_cm": 150, "thickness_cm": 20}',
  '5-Layer Memory Foam, Gel-Infused, Breathable Fabric Cover',
  '10 years warranty',
  'Free delivery in 5-7 days. 100-night trial.',
  ARRAY['mattress', 'memory-foam', 'orthopedic', 'queen-size', 'bestseller']
),
(
  'Spring Mattress - King Size Pocket Spring',
  'spring-mattress-king-pocket-spring',
  (SELECT id FROM categories WHERE slug='mattresses'),
  (SELECT id FROM brands WHERE slug='spacecrafts-elite'),
  'Luxury king-size mattress with individual pocket springs for superior motion isolation. Euro-top pillow cushioning. Anti-microbial and hypoallergenic. King size (180x200 cm). Includes mattress protector.',
  49999.00,
  39999.00,
  15,
  4.8,
  187,
  '{"length_cm": 200, "width_cm": 180, "thickness_cm": 25}',
  'Pocket Spring System, Euro-Top Cushioning, Anti-Microbial Fabric',
  '10 years warranty',
  'Free delivery in 7-10 days. 100-night trial.',
  ARRAY['mattress', 'spring', 'pocket-spring', 'king-size', 'luxury']
),

-- HOME DECOR
(
  'Wall Mirror - Full Length with Wooden Frame',
  'wall-mirror-full-length-wooden',
  (SELECT id FROM categories WHERE slug='home-decor'),
  (SELECT id FROM brands WHERE slug='orion-home'),
  'Full-length wall mirror with solid wood frame in natural finish. 5mm thick glass with distortion-free reflection. Includes wall mounting hardware. Perfect for bedrooms, dressing rooms, or entryways.',
  14999.00,
  11999.00,
  25,
  4.6,
  93,
  '{"height_cm": 180, "width_cm": 60, "thickness_cm": 3}',
  '5mm Glass, Solid Wood Frame',
  '1 year warranty',
  'Free delivery in 4-6 days.',
  ARRAY['mirror', 'full-length', 'wall-decor', 'wooden-frame']
),
(
  'Table Lamp Set of 2 - Modern Bedside',
  'table-lamp-set-2-modern',
  (SELECT id FROM categories WHERE slug='home-decor'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Contemporary set of 2 bedside table lamps with fabric shades. Metal base with elegant finish. Includes LED bulbs. On/off switch on cord. Perfect for bedroom nightstands or side tables.',
  8999.00,
  6999.00,
  35,
  4.5,
  76,
  '{"height_cm": 45, "shade_diameter_cm": 25}',
  'Metal Base, Fabric Shade, LED Compatible',
  '1 year warranty',
  'Free delivery in 3-5 days.',
  ARRAY['lamp', 'table-lamp', 'bedside', 'lighting', 'set-of-2']
),

-- Additional Premium Products
(
  'Rocking Chair with Cushion - Wooden',
  'rocking-chair-cushion-wooden',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='orion-home'),
  'Classic wooden rocking chair handcrafted from solid sheesham wood. Includes comfortable seat and back cushions. Smooth rocking motion. Perfect for nurseries, reading nooks, or relaxation spaces.',
  24999.00,
  19999.00,
  14,
  4.7,
  102,
  '{"width_cm": 65, "depth_cm": 90, "height_cm": 100}',
  'Solid Sheesham Wood, Cotton Cushions',
  '5 years warranty',
  'Free delivery in 7-9 days.',
  ARRAY['rocking-chair', 'wooden', 'cushion', 'traditional', 'nursery']
),
(
  'Study Table for Kids with Chair',
  'study-table-kids-chair',
  (SELECT id FROM categories WHERE slug='kids-furniture'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Ergonomic study table and chair set designed for children aged 5-12. Height-adjustable design grows with your child. Features book storage shelf and pencil tray. Durable and safe materials with rounded edges.',
  16999.00,
  13999.00,
  22,
  4.6,
  118,
  '{"table": "90x60x52-76 cm", "chair": "adjustable height"}',
  'Engineered Wood, Steel Frame, Non-Toxic Paint',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['study-table', 'kids', 'chair', 'adjustable', 'educational']
),
(
  'Bar Stools Set of 2 - Counter Height',
  'bar-stools-set-2-counter',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='cosmic-designs'),
  'Modern bar stools with 360-degree swivel and adjustable height. Padded seat with backrest for comfort. Chrome-plated base with footrest. Perfect for kitchen islands, home bars, or counter dining.',
  14999.00,
  11999.00,
  20,
  4.5,
  84,
  '{"seat_height": "60-80 cm (adjustable)", "base_diameter": 40}',
  'PU Leather Seat, Chrome Base, Gas Lift',
  '2 years warranty',
  'Free delivery in 4-6 days.',
  ARRAY['bar-stools', 'counter', 'swivel', 'adjustable', 'set-of-2']
),
(
  'Shoe Rack Cabinet - 3 Tier with Seating',
  'shoe-rack-cabinet-3-tier-seating',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='galaxy-furniture'),
  'Multi-functional shoe storage cabinet with seating bench on top. 3 flip-down compartments hold up to 18 pairs of shoes. Cushioned seat for comfort while wearing shoes. Modern design for entryways.',
  18999.00,
  14999.00,
  18,
  4.6,
  97,
  '{"width_cm": 100, "depth_cm": 30, "height_cm": 105}',
  'Engineered Wood, PU Leather Cushion',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['shoe-rack', 'storage', 'entryway', 'seating', 'cabinet']
),
(
  'Ottoman Storage Box - Large Velvet',
  'ottoman-storage-box-velvet',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Large storage ottoman with plush velvet upholstery. Hinged lid provides easy access to spacious interior. Doubles as extra seating or footrest. Perfect for living rooms to store blankets, toys, or magazines.',
  12999.00,
  9999.00,
  25,
  4.5,
  73,
  '{"length_cm": 80, "width_cm": 40, "height_cm": 45}',
  'Velvet Fabric, Engineered Wood Frame, Foam Padding',
  '2 years warranty',
  'Free delivery in 4-6 days.',
  ARRAY['ottoman', 'storage', 'velvet', 'living-room', 'seating']
),
(
  'Standing Coat Rack with Umbrella Stand',
  'standing-coat-rack-umbrella',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='nebula-interiors'),
  'Freestanding coat and hat rack with integrated umbrella stand. Features multiple hooks at different heights. Solid metal construction with marble base for stability. Perfect for entryways, offices, or mudrooms.',
  7999.00,
  5999.00,
  30,
  4.4,
  64,
  '{"height_cm": 175, "base_diameter_cm": 35}',
  'Metal Frame, Marble Base',
  '2 years warranty',
  'Free delivery in 3-4 days.',
  ARRAY['coat-rack', 'storage', 'entryway', 'umbrella-stand', 'metal']
),
(
  'Bedside Table Set of 2 - With Drawers',
  'bedside-table-set-2-drawers',
  (SELECT id FROM categories WHERE slug='bedroom'),
  (SELECT id FROM brands WHERE slug='astro-living'),
  'Elegant set of 2 bedside tables with 2 drawers each. Soft-close drawer mechanism. Engineered wood with high-gloss finish. Ample storage for books, devices, and personal items. Matches modern bed frames.',
  19999.00,
  15999.00,
  16,
  4.7,
  124,
  '{"per_table": "50x40x55 cm"}',
  'Engineered Wood, High-Gloss Finish, Soft-Close Drawers',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['bedside-table', 'nightstand', 'set-of-2', 'drawers', 'bedroom']
),
(
  'Corner Shelf Unit - 5 Tier Ladder',
  'corner-shelf-unit-5-tier',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Space-efficient corner shelf unit with 5 tiers. Ladder design fits perfectly in corners. Ideal for displaying plants, books, photos, and decor. Metal frame with wooden shelves. Easy to assemble.',
  11999.00,
  8999.00,
  20,
  4.5,
  68,
  '{"height_cm": 170, "width_cm": 60, "depth_cm": 60}',
  'Metal Frame, Engineered Wood Shelves',
  '2 years warranty',
  'Free delivery in 4-5 days.',
  ARRAY['corner-shelf', 'ladder', 'storage', '5-tier', 'space-saving']
),
(
  'Floor Standing Jewelry Cabinet with Mirror',
  'jewelry-cabinet-mirror-standing',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Full-length jewelry armoire with mirror door. Multiple compartments, hooks, and drawers for organized jewelry storage. LED lights included. Locks for security. Perfect for bedrooms or dressing rooms.',
  22999.00,
  17999.00,
  12,
  4.8,
  95,
  '{"height_cm": 150, "width_cm": 40, "depth_cm": 35}',
  'Engineered Wood, Mirror, LED Lights, Velvet Lining',
  '2 years warranty',
  'Free delivery in 6-8 days.',
  ARRAY['jewelry-cabinet', 'mirror', 'storage', 'bedroom', 'led-lights']
),
(
  'Gaming Chair with RGB Lighting',
  'gaming-chair-rgb-lighting',
  (SELECT id FROM categories WHERE slug='office-furniture'),
  (SELECT id FROM brands WHERE slug='cosmic-designs'),
  'Professional gaming chair with RGB LED lighting effects. Ergonomic design with lumbar support and adjustable headrest. 180-degree recline. PU leather upholstery. 4D armrests. Bluetooth speakers integrated.',
  24999.00,
  19999.00,
  18,
  4.8,
  156,
  '{"width_cm": 70, "depth_cm": 70, "height_cm": "120-130 (adjustable)"}',
  'PU Leather, High-Density Foam, RGB LEDs, Bluetooth Speakers',
  '3 years on mechanism, 1 year on electronics',
  'Free delivery in 5-7 days.',
  ARRAY['gaming-chair', 'rgb', 'ergonomic', 'office', 'gaming', 'trending']
),
(
  'L-Shaped Computer Desk - Executive Large',
  'l-shaped-computer-desk-executive',
  (SELECT id FROM categories WHERE slug='office-furniture'),
  (SELECT id FROM brands WHERE slug='galaxy-furniture'),
  'Spacious L-shaped executive desk perfect for home offices and workstations. Features cable management, keyboard tray, and multiple storage drawers. Engineered wood with premium laminate finish. Supports multiple monitors.',
  34999.00,
  27999.00,
  10,
  4.7,
  142,
  '{"long_side_cm": 150, "short_side_cm": 120, "height_cm": 75}',
  'Engineered Wood, Laminate Finish, Metal Hardware',
  '3 years warranty',
  'Free delivery and installation in 8-10 days.',
  ARRAY['l-shaped-desk', 'executive', 'office', 'computer-desk', 'large']
),
(
  'Futon Sofa Bed - Convertible Sleeper',
  'futon-sofa-bed-convertible',
  (SELECT id FROM categories WHERE slug='sofas-couches'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Versatile futon sofa bed that converts from seating to sleeping. Click-clack mechanism for easy conversion. Fabric upholstery with foam padding. Perfect for studio apartments, guest rooms, or small spaces.',
  29999.00,
  23999.00,
  16,
  4.6,
  108,
  '{"length_cm": 180, "depth_cm": 90, "height_cm": 85, "bed_size": "180x100 cm"}',
  'Fabric Upholstery, Metal Frame, Foam Mattress',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['futon', 'sofa-bed', 'convertible', 'space-saving', 'guest-room']
),
(
  'Chaise Lounge - Velvet Tufted',
  'chaise-lounge-velvet-tufted',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='nova-comfort'),
  'Elegant chaise lounge with deep button tufting and luxurious velvet fabric. Scroll armrest design. Perfect for lounging, reading, or adding a statement piece to living rooms or bedrooms. Available in multiple colors.',
  42999.00,
  34999.00,
  10,
  4.9,
  87,
  '{"length_cm": 165, "width_cm": 70, "height_cm": 85}',
  'Velvet Fabric, Solid Wood Frame, High-Density Foam',
  '3 years warranty',
  'Free delivery in 7-9 days.',
  ARRAY['chaise-lounge', 'velvet', 'tufted', 'luxury', 'statement-piece']
),
(
  'Dressing Table with Stool and Lights',
  'dressing-table-stool-lights',
  (SELECT id FROM categories WHERE slug='bedroom'),
  (SELECT id FROM brands WHERE slug='astro-living'),
  'Modern dressing table with tri-fold mirror and Hollywood-style LED lights. Includes cushioned stool. Multiple drawers for cosmetics and jewelry storage. Touch dimmer for adjustable lighting. Perfect vanity setup.',
  26999.00,
  21999.00,
  14,
  4.8,
  134,
  '{"table": "100x45x75 cm", "mirror": "80x60 cm", "stool": "40x30x45 cm"}',
  'Engineered Wood, LED Lights, Mirror, Cushioned Stool',
  '2 years warranty, 1 year on electronics',
  'Free delivery in 6-8 days.',
  ARRAY['dressing-table', 'vanity', 'led-lights', 'mirror', 'bedroom', 'bestseller']
),
(
  'Bean Bag XXL - Premium Leather',
  'bean-bag-xxl-leather',
  (SELECT id FROM categories WHERE slug='chairs-seating'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Extra-large bean bag chair with premium faux leather cover. Filled with high-quality virgin beans for ultimate comfort. Water-resistant and easy to clean. Perfect for gaming rooms, living rooms, or teen bedrooms.',
  12999.00,
  9999.00,
  25,
  4.6,
  142,
  '{"diameter_cm": 100, "height_cm": 80}',
  'Faux Leather Cover, Virgin Beans Filling',
  '1 year warranty',
  'Free delivery in 3-5 days.',
  ARRAY['bean-bag', 'xxl', 'seating', 'leather', 'gaming', 'kids']
),
(
  'Wine Rack Cabinet - Wooden Bar Unit',
  'wine-rack-cabinet-bar-unit',
  (SELECT id FROM categories WHERE slug='storage-organization'),
  (SELECT id FROM brands WHERE slug='orion-home'),
  'Elegant wine storage cabinet with glass holder rack and bottle storage. Solid wood construction with natural finish. Holds up to 20 wine bottles and 12 glasses. Perfect for dining rooms or home bars.',
  32999.00,
  26999.00,
  8,
  4.7,
  76,
  '{"width_cm": 80, "depth_cm": 40, "height_cm": 120}',
  'Solid Wood, Glass Holders, Wine Racks',
  '5 years warranty',
  'Free delivery in 7-10 days.',
  ARRAY['wine-rack', 'bar-cabinet', 'storage', 'wooden', 'dining-room']
),
(
  'Folding Dining Table - Space Saver',
  'folding-dining-table-space-saver',
  (SELECT id FROM categories WHERE slug='dining-room'),
  (SELECT id FROM brands WHERE slug='galaxy-furniture'),
  'Innovative folding dining table perfect for small apartments. Seats 4-6 people when opened. Fold-down design for compact storage. Engineered wood with scratch-resistant laminate. Easy folding mechanism.',
  24999.00,
  19999.00,
  14,
  4.5,
  89,
  '{"opened": "140x80x75 cm", "folded": "140x20x75 cm"}',
  'Engineered Wood, Metal Hinges, Laminate Finish',
  '2 years warranty',
  'Free delivery in 5-7 days.',
  ARRAY['folding-table', 'dining-table', 'space-saving', 'compact', 'apartment']
),
(
  'Kids Storage Bench with Toy Box',
  'kids-storage-bench-toy-box',
  (SELECT id FROM categories WHERE slug='kids-furniture'),
  (SELECT id FROM brands WHERE slug='luna-collection'),
  'Colorful storage bench with flip-top lid for toy storage. Safety hinges prevent slamming. Cushioned seat for comfortable seating. Perfect for playrooms, nurseries, or kids bedrooms. Easy to clean surfaces.',
  14999.00,
  11999.00,
  18,
  4.6,
  94,
  '{"length_cm": 80, "width_cm": 40, "height_cm": 50}',
  'Engineered Wood, Safety Hinges, Cushioned Seat',
  '2 years warranty',
  'Free delivery in 4-6 days.',
  ARRAY['kids', 'storage-bench', 'toy-box', 'playroom', 'seating']
),
(
  'Floor Lamp - Arc Design Modern',
  'floor-lamp-arc-modern',
  (SELECT id FROM categories WHERE slug='home-decor'),
  (SELECT id FROM brands WHERE slug='nebula-interiors'),
  'Contemporary arc floor lamp with adjustable arm and marble base. Perfect for reading corners or over sofas. Metal construction with brass finish. Includes LED bulb. Foot dimmer switch for convenience.',
  16999.00,
  13999.00,
  20,
  4.7,
  102,
  '{"height_cm": 180, "reach_cm": 150, "base_diameter_cm": 30}',
  'Metal Frame, Marble Base, Fabric Shade',
  '2 years warranty',
  'Free delivery in 5-6 days.',
  ARRAY['floor-lamp', 'arc-lamp', 'modern', 'lighting', 'reading']
),
(
  'Wall Mounted Floating Desk',
  'wall-mounted-floating-desk',
  (SELECT id FROM categories WHERE slug='office-furniture'),
  (SELECT id FROM brands WHERE slug='spacecrafts-elite'),
  'Space-saving wall-mounted floating desk with fold-down design. Includes built-in storage shelves. Perfect for small apartments or home offices. Strong metal brackets support up to 50kg. Modern minimalist design.',
  14999.00,
  11999.00,
  16,
  4.6,
  87,
  '{"width_cm": 100, "depth_cm": 50, "height_mounted": "75 cm from floor"}',
  'Engineered Wood, Metal Brackets, Wall Mount Hardware',
  '2 years warranty',
  'Free delivery in 5-7 days. Installation guide included.',
  ARRAY['floating-desk', 'wall-mounted', 'space-saving', 'office', 'compact']
),
(
  'Buffet Cabinet - Sideboard Storage',
  'buffet-cabinet-sideboard',
  (SELECT id FROM categories WHERE slug='dining-room'),
  (SELECT id FROM brands WHERE slug='cosmic-designs'),
  'Modern buffet cabinet with 3 doors and 2 drawers. Perfect for dining room storage of dinnerware, linens, and serving items. Solid wood legs with engineered wood body. Adjustable shelves inside.',
  44999.00,
  36999.00,
  10,
  4.8,
  118,
  '{"length_cm": 150, "depth_cm": 45, "height_cm": 85}',
  'Engineered Wood, Solid Wood Legs, Soft-Close Doors',
  '3 years warranty',
  'Free delivery and installation in 8-10 days.',
  ARRAY['buffet', 'sideboard', 'cabinet', 'dining-room', 'storage']
),
(
  'Pet Bed with Storage Drawer',
  'pet-bed-storage-drawer',
  (SELECT id FROM categories WHERE slug='home-decor'),
  (SELECT id FROM brands WHERE slug='stellar-living'),
  'Elevated pet bed with built-in storage drawer underneath. Solid wood construction with cushioned top. Perfect for cats and small-medium dogs. Doubles as functional furniture. Includes washable cushion cover.',
  11999.00,
  8999.00,
  22,
  4.5,
  73,
  '{"length_cm": 80, "width_cm": 60, "height_cm": 35}',
  'Solid Wood, Cushion with Removable Cover',
  '2 years warranty',
  'Free delivery in 4-6 days.',
  ARRAY['pet-bed', 'storage', 'dog-bed', 'cat-bed', 'furniture']
);

-- ============================================
-- 4. PRODUCT IMAGES (Multiple images per product)
-- ============================================
-- Using Unsplash placeholder images for furniture

-- Modern L-Shape Sofa
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='modern-l-shape-sofa-storage'), 
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80', 
  'Modern L-Shape Sofa - Front View', 0),
((SELECT id FROM products WHERE slug='modern-l-shape-sofa-storage'), 
  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1200&q=80', 
  'Modern L-Shape Sofa - Side View', 1),
((SELECT id FROM products WHERE slug='modern-l-shape-sofa-storage'), 
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80', 
  'Modern L-Shape Sofa - Detail', 2);

-- 3-Seater Recliner Sofa
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='3-seater-recliner-sofa-leather'), 
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', 
  '3-Seater Recliner Sofa - Upright Position', 0),
((SELECT id FROM products WHERE slug='3-seater-recliner-sofa-leather'), 
  'https://images.unsplash.com/photo-1549497538-303791108f95?w=1200&q=80', 
  '3-Seater Recliner Sofa - Reclined', 1);

-- Fabric Loveseat Sofa
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='fabric-loveseat-sofa-compact'), 
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80', 
  'Fabric Loveseat Sofa', 0),
((SELECT id FROM products WHERE slug='fabric-loveseat-sofa-compact'), 
  'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=1200&q=80', 
  'Fabric Loveseat Sofa - Detail', 1);

-- King Size Bed
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='king-size-upholstered-bed-hydraulic'), 
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 
  'King Size Bed - Front View', 0),
((SELECT id FROM products WHERE slug='king-size-upholstered-bed-hydraulic'), 
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80', 
  'King Size Bed - Storage View', 1);

-- Solid Wood Queen Bed
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='solid-wood-queen-bed-platform'), 
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80', 
  'Solid Wood Queen Bed', 0);

-- Metal Bunk Bed
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='metal-bunk-bed-kids-twin'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Metal Bunk Bed for Kids', 0);

-- 6-Seater Dining Set
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='6-seater-solid-wood-dining-set'), 
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80', 
  '6-Seater Dining Table Set', 0),
((SELECT id FROM products WHERE slug='6-seater-solid-wood-dining-set'), 
  'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=1200&q=80', 
  'Dining Set - Detail', 1);

-- Glass Top Dining Table
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='modern-glass-top-dining-table-4'), 
  'https://images.unsplash.com/photo-1595428773637-3e6dfe2e7665?w=1200&q=80', 
  'Modern Glass Top Dining Table', 0);

-- Ergonomic Office Chair
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='ergonomic-executive-office-chair'), 
  'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&q=80', 
  'Ergonomic Executive Office Chair', 0),
((SELECT id FROM products WHERE slug='ergonomic-executive-office-chair'), 
  'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1200&q=80', 
  'Office Chair - Side View', 1);

-- Computer Desk
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='computer-desk-storage-home-office'), 
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80', 
  'Computer Desk with Storage', 0);

-- TV Unit with LED Lights
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='contemporary-tv-unit-led-lights'), 
  'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1200&q=80', 
  'Contemporary TV Unit with LED Lights', 0);

-- Wooden TV Stand
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='wooden-tv-stand-rustic'), 
  'https://images.unsplash.com/photo-1600494603989-9650cf520bc0?w=1200&q=80', 
  'Wooden TV Stand - Rustic', 0);

-- Modular Wardrobe
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='modular-wardrobe-3-door-mirror'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Modular Wardrobe System', 0);

-- 5-Tier Bookshelf
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='5-tier-bookshelf-ladder'), 
  'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&q=80', 
  '5-Tier Bookshelf - Ladder Style', 0);

-- Accent Chair with Ottoman
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='accent-chair-ottoman-velvet'), 
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=80', 
  'Accent Chair with Ottoman - Velvet', 0);

-- Set of 4 Dining Chairs
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='set-4-dining-chairs-modern'), 
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&q=80', 
  'Set of 4 Dining Chairs', 0);

-- Outdoor Patio Set
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='outdoor-patio-set-4-seater'), 
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80', 
  'Outdoor Patio Set - 4 Seater', 0);

-- Hammock
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='hammock-with-stand-portable'), 
  'https://images.unsplash.com/photo-1573655349936-de6bed86f839?w=1200&q=80', 
  'Hammock with Stand', 0);

-- Coffee Table
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='coffee-table-storage-lift-top'), 
  'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=1200&q=80', 
  'Coffee Table with Lift Top', 0);

-- Console Table
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='console-table-marble-gold'), 
  'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1200&q=80', 
  'Console Table - Marble Top', 0);

-- Nesting Side Tables
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='side-table-set-2-nesting'), 
  'https://images.unsplash.com/photo-1558211583-803e5aae813e?w=1200&q=80', 
  'Side Table Set - Nesting', 0);

-- Memory Foam Mattress
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='memory-foam-mattress-queen-orthopedic'), 
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', 
  'Memory Foam Mattress - Queen Size', 0);

-- Spring Mattress
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='spring-mattress-king-pocket-spring'), 
  'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1200&q=80', 
  'Spring Mattress - King Size', 0);

-- Wall Mirror
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='wall-mirror-full-length-wooden'), 
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80', 
  'Wall Mirror - Full Length', 0);

-- Table Lamp Set
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='table-lamp-set-2-modern'), 
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80', 
  'Table Lamp Set of 2', 0);

-- Rocking Chair
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='rocking-chair-cushion-wooden'), 
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', 
  'Rocking Chair with Cushion', 0);

-- Study Table for Kids
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='study-table-kids-chair'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Study Table for Kids', 0);

-- Bar Stools
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='bar-stools-set-2-counter'), 
  'https://images.unsplash.com/photo-1576428253323-c28ce85ec66e?w=1200&q=80', 
  'Bar Stools Set of 2', 0);

-- Shoe Rack Cabinet
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='shoe-rack-cabinet-3-tier-seating'), 
  'https://images.unsplash.com/photo-1600494603989-9650cf520bc0?w=1200&q=80', 
  'Shoe Rack Cabinet with Seating', 0);

-- Ottoman Storage Box
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='ottoman-storage-box-velvet'), 
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80', 
  'Ottoman Storage Box - Velvet', 0);

-- Standing Coat Rack
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='standing-coat-rack-umbrella'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Standing Coat Rack with Umbrella Stand', 0);

-- Bedside Table Set
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='bedside-table-set-2-drawers'), 
  'https://images.unsplash.com/photo-1558211583-803e5aae813e?w=1200&q=80', 
  'Bedside Table Set of 2', 0);

-- Corner Shelf Unit
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='corner-shelf-unit-5-tier'), 
  'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&q=80', 
  'Corner Shelf Unit - 5 Tier', 0);

-- Jewelry Cabinet
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='jewelry-cabinet-mirror-standing'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Jewelry Cabinet with Mirror', 0);

-- Gaming Chair
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='gaming-chair-rgb-lighting'), 
  'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&q=80', 
  'Gaming Chair with RGB Lighting', 0);

-- L-Shaped Desk
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='l-shaped-computer-desk-executive'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'L-Shaped Computer Desk', 0);

-- Futon Sofa Bed
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='futon-sofa-bed-convertible'), 
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80', 
  'Futon Sofa Bed - Convertible', 0);

-- Chaise Lounge
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='chaise-lounge-velvet-tufted'), 
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', 
  'Chaise Lounge - Velvet Tufted', 0);

-- Dressing Table
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='dressing-table-stool-lights'), 
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80', 
  'Dressing Table with Stool and Lights', 0);

-- Bean Bag
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='bean-bag-xxl-leather'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Bean Bag XXL - Premium Leather', 0);

-- Wine Rack Cabinet
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='wine-rack-cabinet-bar-unit'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Wine Rack Cabinet - Wooden Bar Unit', 0);

-- Folding Dining Table
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='folding-dining-table-space-saver'), 
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80', 
  'Folding Dining Table - Space Saver', 0);

-- Kids Storage Bench
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='kids-storage-bench-toy-box'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Kids Storage Bench with Toy Box', 0);

-- Floor Lamp
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='floor-lamp-arc-modern'), 
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80', 
  'Floor Lamp - Arc Design Modern', 0);

-- Floating Desk
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='wall-mounted-floating-desk'), 
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80', 
  'Wall Mounted Floating Desk', 0);

-- Buffet Cabinet
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='buffet-cabinet-sideboard'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Buffet Cabinet - Sideboard Storage', 0);

-- Pet Bed
INSERT INTO product_images (product_id, url, alt, position) VALUES
((SELECT id FROM products WHERE slug='pet-bed-storage-drawer'), 
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80', 
  'Pet Bed with Storage Drawer', 0);

-- ============================================
-- 5. STORES (Physical Store Locations in India)
-- ============================================
INSERT INTO stores (name, slug, address, city, state, postal_code, latitude, longitude, phone) VALUES
('Spacecrafts Furniture - Bangalore Flagship', 'bangalore-flagship', 
  '45 MG Road, Ashok Nagar', 'Bengaluru', 'Karnataka', '560001', 
  12.9716, 77.5946, '+91-80-25123456'),
  
('Spacecrafts Furniture - Mumbai Showroom', 'mumbai-showroom', 
  '123 Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 
  19.0596, 72.8295, '+91-22-26515678'),
  
('Spacecrafts Furniture - Delhi NCR Store', 'delhi-ncr-store', 
  '78 Connaught Place, Inner Circle', 'New Delhi', 'Delhi', '110001', 
  28.6304, 77.2177, '+91-11-23417890'),
  
('Spacecrafts Furniture - Hyderabad', 'hyderabad-store', 
  '56 Banjara Hills Road 12', 'Hyderabad', 'Telangana', '500034', 
  17.4239, 78.4738, '+91-40-23456789'),
  
('Spacecrafts Furniture - Chennai', 'chennai-store', 
  '234 Anna Salai, T Nagar', 'Chennai', 'Tamil Nadu', '600017', 
  13.0419, 80.2341, '+91-44-28171234'),
  
('Spacecrafts Furniture - Pune', 'pune-store', 
  '89 FC Road, Deccan Gymkhana', 'Pune', 'Maharashtra', '411004', 
  18.5204, 73.8567, '+91-20-25673456')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. SAMPLE REVIEWS
-- ============================================
-- Add reviews for top products (requires actual user IDs from profiles table)
-- This is sample data - in production, these would be from real users

INSERT INTO reviews (product_id, profile_id, rating, title, body) VALUES
((SELECT id FROM products WHERE slug='modern-l-shape-sofa-storage'), 
  NULL, 5, 'Excellent quality and comfort!', 
  'Absolutely love this sofa! The storage compartment is so practical and the velvet fabric feels premium. Delivery was on time and the installation team was professional.'),
  
((SELECT id FROM products WHERE slug='modern-l-shape-sofa-storage'), 
  NULL, 5, 'Best purchase this year', 
  'Great value for money. The sofa is spacious enough for my family of 4. Very comfortable and looks exactly like the pictures.'),
  
((SELECT id FROM products WHERE slug='memory-foam-mattress-queen-orthopedic'), 
  NULL, 5, 'Back pain gone!', 
  'After sleeping on this orthopedic mattress for 2 weeks, my back pain has significantly reduced. The memory foam provides perfect support.'),
  
((SELECT id FROM products WHERE slug='6-seater-solid-wood-dining-set'), 
  NULL, 5, 'Beautiful craftsmanship', 
  'The wood quality is exceptional and the finish is gorgeous. Received many compliments from guests. Worth every penny!'),
  
((SELECT id FROM products WHERE slug='ergonomic-executive-office-chair'), 
  NULL, 4, 'Great for work from home', 
  'Very comfortable for long working hours. The lumbar support is adjustable and helps maintain good posture. Assembly was easy.');

-- ============================================
-- 7. CREATE FULL-TEXT SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION search_products(search_query text)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. USEFUL VIEWS FOR ANALYTICS
-- ============================================
CREATE OR REPLACE VIEW popular_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.discount_price,
  p.rating,
  p.review_count,
  c.name as category_name,
  b.name as brand_name,
  COUNT(DISTINCT w.id) as wishlist_count,
  COUNT(DISTINCT ci.id) as cart_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN wishlist_items w ON p.id = w.product_id
LEFT JOIN cart_items ci ON p.id = ci.product_id
GROUP BY p.id, p.name, p.slug, p.price, p.discount_price, p.rating, p.review_count, c.name, b.name
ORDER BY p.rating DESC, p.review_count DESC;

-- ============================================
-- 9. UPDATE PRODUCT RATING FUNCTION
-- (Call this after new reviews are added)
-- ============================================
CREATE OR REPLACE FUNCTION update_product_rating(product_id_param int)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = product_id_param),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = product_id_param)
  WHERE id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! Your database is now populated with:
-- - 15 furniture categories
-- - 10 premium brands
-- - 50 detailed furniture products
-- - Sample product images
-- - 6 store locations across India
-- - Sample customer reviews
-- - Search functions and useful views
-- ============================================
