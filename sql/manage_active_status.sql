-- Product and Category Activation/Deactivation Helpers

-- ========================================
-- ACTIVATE/DEACTIVATE SPECIFIC PRODUCTS
-- ========================================

-- Activate a specific product by slug
-- UPDATE products SET is_active = true WHERE slug = 'nova-sofa-bed-without-storage';

-- Deactivate a specific product by slug
-- UPDATE products SET is_active = false WHERE slug = 'nova-sofa-bed-without-storage';

-- Activate all products from a specific brand
-- UPDATE products SET is_active = true WHERE brand_id = (SELECT id FROM brands WHERE slug = 'spacecraft');

-- Deactivate all products from a specific brand
-- UPDATE products SET is_active = false WHERE brand_id = (SELECT id FROM brands WHERE slug = 'spacecraft');

-- Activate all products in a specific category
-- UPDATE products SET is_active = true WHERE category_id = (SELECT id FROM categories WHERE slug = 'sofa-cum-beds');

-- Deactivate all products in a specific category
-- UPDATE products SET is_active = false WHERE category_id = (SELECT id FROM categories WHERE slug = 'sofa-cum-beds');

-- ========================================
-- ACTIVATE/DEACTIVATE SPECIFIC CATEGORIES
-- ========================================

-- Activate a specific category by slug
-- UPDATE categories SET is_active = true WHERE slug = 'sofa-cum-beds';

-- Deactivate a specific category by slug
-- UPDATE categories SET is_active = false WHERE slug = 'sofa-cum-beds';

-- ========================================
-- VIEW PRODUCTS BY ACTIVE STATUS
-- ========================================

-- Show only active products
-- SELECT p.id, p.name, p.slug, (SELECT name FROM brands WHERE id = p.brand_id) as brand, 
--        (SELECT name FROM categories WHERE id = p.category_id) as category, 
--        p.price, p.is_active, p.created_at
-- FROM products p
-- WHERE p.is_active = true
-- ORDER BY p.created_at DESC;

-- Show only inactive products
-- SELECT p.id, p.name, p.slug, (SELECT name FROM brands WHERE id = p.brand_id) as brand, 
--        (SELECT name FROM categories WHERE id = p.category_id) as category, 
--        p.price, p.is_active, p.created_at
-- FROM products p
-- WHERE p.is_active = false
-- ORDER BY p.created_at DESC;

-- ========================================
-- VIEW CATEGORIES BY ACTIVE STATUS
-- ========================================

-- Show only active categories
-- SELECT id, name, slug, is_active FROM categories WHERE is_active = true ORDER BY name;

-- Show only inactive categories
-- SELECT id, name, slug, is_active FROM categories WHERE is_active = false ORDER BY name;

-- ========================================
-- BULK OPERATIONS
-- ========================================

-- Activate all products from a specific list of brands
-- UPDATE products SET is_active = true 
-- WHERE brand_id IN (SELECT id FROM brands WHERE slug IN ('spacecraft', 'brand-slug-2'));

-- Get count of active vs inactive products
-- SELECT is_active, COUNT(*) as count FROM products GROUP BY is_active;

-- Get count of active vs inactive categories
-- SELECT is_active, COUNT(*) as count FROM categories GROUP BY is_active;
