-- ============================================
-- EXECUTE THIS SCRIPT NOW IN SUPABASE
-- ============================================

-- Step 1: Add is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Add is_active column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Add is_active column to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 4: Deactivate ALL existing products
UPDATE products SET is_active = false;

-- Step 5: Activate ONLY the 9 new SpaceCraft products
UPDATE products SET is_active = true 
WHERE brand_id = (SELECT id FROM brands WHERE slug = 'spacecraft');

-- Step 6: Deactivate ALL brands except SpaceCraft
UPDATE brands SET is_active = false;

-- Step 7: Activate ONLY SpaceCraft brand
UPDATE brands SET is_active = true 
WHERE slug = 'spacecraft';

-- Step 8: Deactivate ALL categories first
UPDATE categories SET is_active = false;

-- Step 9: Activate ONLY the categories needed for 9 SpaceCraft products
UPDATE categories SET is_active = true 
WHERE slug IN (
  'sofa-cum-beds',      -- Nova, Halley
  'lazy-chairs',        -- Voyager
  'study-tables',       -- Proton
  'bunk-beds',          -- Jupiter, Sputnic, Rainbow
  'metal-cots',         -- Luminous
  'rocking-chairs'      -- Zenith
);

-- ============================================
-- VERIFICATION QUERIES (Run these to verify)
-- ============================================

-- Check: How many active products?
SELECT COUNT(*) as active_count FROM products WHERE is_active = true;
-- Expected: 9

-- Check: How many inactive products?
SELECT COUNT(*) as inactive_count FROM products WHERE is_active = false;
-- Expected: 1

-- Check: Show all products with status
SELECT 
  p.id,
  p.name,
  p.slug,
  (SELECT name FROM brands WHERE id = p.brand_id) as brand,
  p.is_active,
  p.created_at
FROM products p
ORDER BY p.created_at DESC;

-- Check: Show only active products
SELECT 
  name,
  slug,
  price,
  discount_price,
  (SELECT name FROM categories WHERE id = products.category_id) as category
FROM products
WHERE is_active = true
ORDER BY created_at DESC;

-- Check: Show only inactive products (to activate later)
SELECT 
  name,
  slug,
  price,
  (SELECT name FROM brands WHERE id = products.brand_id) as brand
FROM products
WHERE is_active = false
ORDER BY created_at DESC;

-- Check: Category status
SELECT 
  name,
  slug,
  is_active
FROM categories
ORDER BY name;

-- Check: Brand status
SELECT 
  name,
  slug,
  is_active
FROM brands
ORDER BY name;

-- Check: Count active brands (should be 1 - SpaceCraft)
SELECT COUNT(*) as active_brands FROM brands WHERE is_active = true;

-- Check: Count inactive brands
SELECT COUNT(*) as inactive_brands FROM brands WHERE is_active = false;
