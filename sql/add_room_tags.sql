-- ============================================
-- ADD ROOM TAGS + BEST OFFER TAGS TO PRODUCTS
-- ============================================
-- Run this in Supabase SQL Editor
--
-- This adds room-based tags and "best-offer" tag
-- to the existing tags[] array on each product.
-- The ShopAllThingsHome component will filter
-- products by these tags instead of category slugs.
-- ============================================

-- ─── LIVING ROOM TAG ───
-- Products that belong in Living Room: Nova (sofa bed), Halley (sofa bed), Voyager (lazy chair), Zenith (rocking chair)
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['living-room']
)
WHERE slug IN (
  'nova-sofa-bed-without-storage',
  'halley-sofa-cum-bed-single',
  'voyager-nec-chair',
  'zenith-rocking-easy-chair'
)
AND NOT ('living-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── BED ROOM TAG ───
-- Products that belong in Bed Room: Nova (sofa bed), Halley (sofa bed), Jupiter (bunk), Sputnic (bunk), Rainbow (bunk), Luminous (steel cot)
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['bed-room']
)
WHERE slug IN (
  'nova-sofa-bed-without-storage',
  'halley-sofa-cum-bed-single',
  'jupiter-bunk-cum-futon-cot',
  'sputnic-convertable-wooden-leg-bunk-bed',
  'rainbow-convertable-bunk-bed',
  'luminous-steel-cot'
)
AND NOT ('bed-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── DINING ROOM TAG ───
-- No dining products yet, but this is how you add them in future:
-- UPDATE products
-- SET tags = array_cat(COALESCE(tags, ARRAY[]::text[]), ARRAY['dining-room'])
-- WHERE slug IN ('your-dining-product-slug')
-- AND NOT ('dining-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── STUDY ROOM TAG ───
-- Products that belong in Study Room: Proton (study desk)
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['study-room']
)
WHERE slug IN (
  'proton-study-desk'
)
AND NOT ('study-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── BEST OFFER TAG ───
-- Products with best discounts (>25% off) get the "best-offer" tag
-- Currently: Nova (30% off), Voyager (30% off), Halley (29% off), Jupiter (29% off), Rainbow (22% off), Sputnic (29% off)
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['best-offer']
)
WHERE slug IN (
  'nova-sofa-bed-without-storage',
  'voyager-nec-chair',
  'halley-sofa-cum-bed-single',
  'jupiter-bunk-cum-futon-cot',
  'sputnic-convertable-wooden-leg-bunk-bed',
  'rainbow-convertable-bunk-bed',
  'luminous-steel-cot',
  'proton-study-desk',
  'zenith-rocking-easy-chair'
)
AND NOT ('best-offer' = ANY(COALESCE(tags, ARRAY[]::text[])));


-- ============================================
-- VERIFICATION: Check tags were added correctly
-- ============================================

SELECT 
  name,
  slug,
  tags,
  price,
  discount_price,
  CASE WHEN discount_price IS NOT NULL 
    THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) 
    ELSE 0 
  END as discount_pct
FROM products
WHERE is_active = true
ORDER BY name;


-- ============================================
-- HOW TO ADD TAGS IN FUTURE
-- ============================================
-- 
-- To tag a product for a room:
--   UPDATE products SET tags = array_append(tags, 'living-room') WHERE slug = 'your-product-slug';
--
-- To tag multiple products:
--   UPDATE products SET tags = array_cat(tags, ARRAY['living-room', 'best-offer']) WHERE slug = 'your-product-slug';
--
-- To remove a tag:
--   UPDATE products SET tags = array_remove(tags, 'best-offer') WHERE slug = 'your-product-slug';
--
-- Supported tab tags:
--   'living-room'   → Living Room tab
--   'bed-room'      → Bed Room tab
--   'dining-room'   → Dining Room tab
--   'study-room'    → Study Room tab
--   'best-offer'    → Best Offers tab
--
-- Special tabs (no tag needed, auto-filtered):
--   Solid Wood       → filters by material containing "solid wood"
--   Engineered Wood  → filters by material containing "engineered/mdf/plywood"
--   Luxury Furniture → filters by price >= ₹25,000
