-- ============================================
-- ADD best_seller & is_offered COLUMNS TO PRODUCTS
-- ============================================
-- Run this in Supabase SQL Editor
-- These boolean columns drive the FeaturedProductsSection tabs
-- ============================================

-- Step 1: Add best_seller column (if not already added by prior migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller BOOLEAN DEFAULT false;

-- Step 2: Add is_offered column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offered BOOLEAN DEFAULT false;

-- Step 3: Mark SpaceCraft bestsellers
-- Products with highest ratings / most popular
UPDATE products SET best_seller = true
WHERE slug IN (
  'nova-sofa-bed-without-storage',     -- ₹30,000 → ₹21,186 (30% off)
  'jupiter-bunk-cum-futon-cot',        -- ₹42,000 → ₹29,661 (29% off)
  'sputnic-convertable-wooden-leg-bunk-bed', -- ₹38,100 → ₹26,949 (29% off)
  'zenith-rocking-easy-chair',         -- ₹14,200 → ₹10,085 (29% off)
  'luminous-steel-cot'                 -- ₹31,600 → ₹22,373 (29% off)
);

-- Step 4: Mark products with special offers
-- Products that have discount_price set (on offer)
UPDATE products SET is_offered = true
WHERE slug IN (
  'nova-sofa-bed-without-storage',     -- 30% off
  'voyager-nec-chair',                 -- 30% off
  'halley-sofa-cum-bed-single',        -- 29% off
  'jupiter-bunk-cum-futon-cot',        -- 29% off
  'rainbow-convertable-bunk-bed',      -- 22% off
  'sputnic-convertable-wooden-leg-bunk-bed', -- 29% off
  'luminous-steel-cot',                -- 29% off
  'proton-study-desk',                 -- 29% off
  'zenith-rocking-easy-chair'          -- 29% off
);


-- ============================================
-- VERIFICATION
-- ============================================
SELECT
  name,
  slug,
  best_seller,
  is_offered,
  price,
  discount_price,
  CASE WHEN discount_price IS NOT NULL
    THEN ROUND(((price - discount_price) / price * 100)::numeric, 0)
    ELSE 0
  END AS discount_pct
FROM products
WHERE is_active = true
ORDER BY name;


-- ============================================
-- HOW TO USE IN FUTURE
-- ============================================
--
-- Mark a product as bestseller:
--   UPDATE products SET best_seller = true WHERE slug = 'your-product-slug';
--
-- Remove bestseller status:
--   UPDATE products SET best_seller = false WHERE slug = 'your-product-slug';
--
-- Mark a product as offered:
--   UPDATE products SET is_offered = true WHERE slug = 'your-product-slug';
--
-- Remove offer status:
--   UPDATE products SET is_offered = false WHERE slug = 'your-product-slug';
