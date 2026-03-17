-- ============================================
-- ASSIGN ROOM TAGS TO ALL PRODUCTS
-- ============================================
-- Run this in Supabase SQL Editor
-- Tags products based on their category and sub-category tags
-- so ShopAllThingsHome tabs show products correctly.
-- Safe to re-run — skips products that already have the tag.
-- ============================================

-- ─── LIVING ROOM ───
-- Sofa Sets, Diwans, Corner Sofas, Cushion Sofas, Recliner Sofas, Coffee Tables, TV Racks, 2 Seater, 3+1+1 Sofas
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['living-room']
)
WHERE is_active = true
AND (
  category_id IN (SELECT id FROM categories WHERE slug = 'sofa-sets')
  OR tags && ARRAY['diwans','corner-sofas','cushion-sofas','recliner-sofas','coffee-tables','tv-racks','2-seater','3-1-1-sofas','sofa','sofa-beds','sofa-cum-beds','rocking-chairs','lazy-chairs']
)
AND NOT ('living-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── BED ROOM ───
-- Beds, Wardrobes, Dressing Tables, Wooden Beds, Bunk Beds, Metal Cots, Folding Beds
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['bed-room']
)
WHERE is_active = true
AND (
  category_id IN (SELECT id FROM categories WHERE slug IN ('beds', 'wardrobe-racks'))
  OR tags && ARRAY['wooden-beds','bunk-beds','metal-cots','folding-beds','futon-beds','diwan-cum-beds','recliner-folding-beds','sofa-cum-beds','sofa-beds','wardrobes','dressing-tables','book-shelves','book-racks','shoe-racks']
)
AND NOT ('bed-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── DINING ROOM ───
-- Dining Sets, Dining Tables, Dining Chairs, Folding Dinings, Wooden Dinings
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['dining-room']
)
WHERE is_active = true
AND (
  category_id IN (SELECT id FROM categories WHERE slug = 'dining-sets')
  OR tags && ARRAY['dining-sets','folding-dinings','wooden-dinings']
)
AND NOT ('dining-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── STUDY ROOM ───
-- Study Chairs, Study Tables, Office Chairs, Foldable Tables, Foldable Chairs, Book Racks, Book Shelves
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['study-room']
)
WHERE is_active = true
AND (
  tags && ARRAY['study-chairs','study-tables','study-&-office-tables','office-chairs','foldable-tables','foldable-chairs','book-racks','book-shelves']
)
AND NOT ('study-room' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- ─── BEST OFFERS ───
-- All products with a discount (discount_price < price)
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['best-offer']
)
WHERE is_active = true
AND discount_price IS NOT NULL
AND discount_price > 0
AND discount_price < price
AND NOT ('best-offer' = ANY(COALESCE(tags, ARRAY[]::text[])));

-- Also tag products explicitly marked as is_offered
UPDATE products
SET tags = array_cat(
  COALESCE(tags, ARRAY[]::text[]),
  ARRAY['best-offer']
)
WHERE is_active = true
AND is_offered = true
AND NOT ('best-offer' = ANY(COALESCE(tags, ARRAY[]::text[])));


-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'living-room' as tab,
  COUNT(*) as product_count
FROM products 
WHERE is_active = true AND 'living-room' = ANY(COALESCE(tags, ARRAY[]::text[]))

UNION ALL

SELECT 
  'bed-room',
  COUNT(*)
FROM products 
WHERE is_active = true AND 'bed-room' = ANY(COALESCE(tags, ARRAY[]::text[]))

UNION ALL

SELECT 
  'dining-room',
  COUNT(*)
FROM products 
WHERE is_active = true AND 'dining-room' = ANY(COALESCE(tags, ARRAY[]::text[]))

UNION ALL

SELECT 
  'study-room',
  COUNT(*)
FROM products 
WHERE is_active = true AND 'study-room' = ANY(COALESCE(tags, ARRAY[]::text[]))

UNION ALL

SELECT 
  'best-offer',
  COUNT(*)
FROM products 
WHERE is_active = true AND 'best-offer' = ANY(COALESCE(tags, ARRAY[]::text[]))

ORDER BY tab;
