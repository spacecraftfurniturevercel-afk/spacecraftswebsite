-- ============================================================
-- 12 Homepage Categories + Multi-Category Support
-- Run in Supabase SQL Editor (in order)
-- ============================================================

-- 1) Extend categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2) Many-to-many: product can belong to multiple categories
CREATE TABLE IF NOT EXISTS product_categories (
  product_id int NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id int NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);

-- Public read for product_categories (used by storefront filters)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_categories" ON product_categories;
CREATE POLICY "public_read_product_categories" ON product_categories
  FOR SELECT USING (true);

-- NOTE: After this table exists, Supabase embeds must use the explicit FK hint:
--   categories!products_category_id_fkey (id, name, slug)
-- Otherwise queries fail with "more than one relationship was found".

-- 3) Upsert the 12 homepage categories
INSERT INTO categories (name, slug, image_url, sort_order, is_active) VALUES
  ('Beds',              'beds',              '/categories/beds.svg',              1,  true),
  ('Chairs',            'chairs',            '/categories/chairs.svg',            2,  true),
  ('Recliners',         'recliners',         '/categories/recliners.svg',         3,  true),
  ('Sofa Cum Beds',     'sofa-cum-beds',     '/categories/sofa-cum-beds.svg',     4,  true),
  ('Dining Sets',       'dining-sets',       '/categories/dining-sets.svg',       5,  true),
  ('Wardrobes',         'wardrobes',         '/categories/wardrobes.svg',         6,  true),
  ('Office Furniture',  'office-furniture',  '/categories/office-furniture.svg',  7,  true),
  ('Center Table',      'center-tables',     '/categories/center-tables.svg',     8,  true),
  ('Sofas',             'sofas',             '/categories/sofas.svg',             9,  true),
  ('Pooja Racks',       'pooja-racks',       '/categories/pooja-racks.svg',       10, true),
  ('Bunk Beds',         'bunk-beds',         '/categories/bunk-beds.svg',         11, true),
  ('Mattress',          'mattress',          '/categories/mattress.svg',          12, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 4) Backfill junction table from existing primary category_id
INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, p.category_id, true
FROM products p
WHERE p.category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;

-- ============================================================
-- 5) Map existing products to NEW categories (by old slug / tags)
--    Adjust slugs below if your DB uses different names
-- ============================================================

-- Beds
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'beds')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('beds-frames', 'bedroom'))
   OR tags && ARRAY['wooden-beds','futon-beds','diwan-cum-beds','metal-cots']::text[];

-- Chairs
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'chairs')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('chairs-seating'))
   OR tags && ARRAY['office-chairs','study-chairs','lazy-chairs','rocking-chairs','foldable-chairs']::text[];

-- Recliners
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'recliners')
WHERE tags && ARRAY['recliner-sofas','recliner-folding-beds']::text[];

-- Sofa Cum Beds
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sofa-cum-beds')
WHERE tags && ARRAY['sofa-cum-beds','sofa-beds']::text[]
   OR category_id IN (SELECT id FROM categories WHERE slug IN ('sofa-cum-beds'));

-- Dining Sets
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'dining-sets')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('dining-room', 'dining-sets'))
   OR tags && ARRAY['dining-tables','dining-chairs','folding-dinings','wooden-dinings']::text[];

-- Wardrobes
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'wardrobes')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('wardrobes-cabinets', 'wardrobe-racks'))
   OR tags && ARRAY['wardrobes','book-shelves','book-racks','shoe-racks','tv-racks']::text[];

-- Office Furniture
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'office-furniture')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'office-furniture')
   OR tags && ARRAY['study-&-office-tables','study-tables']::text[];

-- Center Table
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'center-tables')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'tables')
   OR tags && ARRAY['coffee-tables','center-tables']::text[];

-- Sofas
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sofas')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('sofas-couches', 'sofa-sets'))
   OR tags && ARRAY['2-seater','3-1-1-sofas','corner-sofas','cushion-sofas','diwans']::text[];

-- Pooja Racks
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'pooja-racks')
WHERE tags && ARRAY['mandirs','pooja-racks']::text[];

-- Bunk Beds
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'bunk-beds')
WHERE tags && ARRAY['bunk-beds']::text[];

-- Mattress
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'mattress')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('mattresses'))
   OR tags && ARRAY['mattress','mattresses']::text[];

-- Re-sync junction after primary updates
INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, p.category_id, true
FROM products p
WHERE p.category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO UPDATE SET is_primary = true;

-- ============================================================
-- 6) SECONDARY categories (same product in 2+ categories)
-- Example: sofa-cum-beds also appear under Sofas + Beds
-- ============================================================

INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, c.id, false
FROM products p
JOIN categories c ON c.slug = 'sofas'
WHERE p.tags && ARRAY['sofa-cum-beds','sofa-beds']::text[]
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, c.id, false
FROM products p
JOIN categories c ON c.slug = 'beds'
WHERE p.tags && ARRAY['sofa-cum-beds','sofa-beds','bunk-beds','futon-beds']::text[]
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, c.id, false
FROM products p
JOIN categories c ON c.slug = 'recliners'
WHERE p.tags && ARRAY['recliner-sofas']::text[]
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT p.id, c.id, false
FROM products p
JOIN categories c ON c.slug = 'sofas'
WHERE p.tags && ARRAY['recliner-sofas','2-seater','corner-sofas']::text[]
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7) Manual examples — assign ONE product to multiple categories
-- ============================================================
-- Replace PRODUCT_ID and category slugs as needed:

-- INSERT INTO product_categories (product_id, category_id, is_primary)
-- SELECT 123, id, false FROM categories WHERE slug = 'sofas'
-- ON CONFLICT DO NOTHING;

-- INSERT INTO product_categories (product_id, category_id, is_primary)
-- SELECT 123, id, true FROM categories WHERE slug = 'sofa-cum-beds'
-- ON CONFLICT DO NOTHING;

-- UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sofa-cum-beds') WHERE id = 123;

-- ============================================================
-- 8) Verification queries
-- ============================================================
SELECT id, name, slug, image_url, sort_order, is_active
FROM categories
WHERE slug IN (
  'beds','chairs','recliners','sofa-cum-beds','dining-sets','wardrobes',
  'office-furniture','center-tables','sofas','pooja-racks','bunk-beds','mattress'
)
ORDER BY sort_order;

SELECT c.name AS category, COUNT(DISTINCT pc.product_id) AS product_count
FROM categories c
LEFT JOIN product_categories pc ON pc.category_id = c.id
LEFT JOIN products p ON p.id = pc.product_id AND p.is_active = true
WHERE c.slug IN (
  'beds','chairs','recliners','sofa-cum-beds','dining-sets','wardrobes',
  'office-furniture','center-tables','sofas','pooja-racks','bunk-beds','mattress'
)
GROUP BY c.id, c.name
ORDER BY c.sort_order;

-- Products in multiple categories
SELECT p.id, p.name, array_agg(c.name ORDER BY c.name) AS categories
FROM products p
JOIN product_categories pc ON pc.product_id = p.id
JOIN categories c ON c.id = pc.category_id
GROUP BY p.id, p.name
HAVING COUNT(*) > 1
ORDER BY p.name;
