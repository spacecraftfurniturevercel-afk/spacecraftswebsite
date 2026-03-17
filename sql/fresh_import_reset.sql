-- ============================================================
-- FRESH IMPORT RESET — Clears all product/category/brand data
-- Run this in Supabase SQL editor BEFORE re-importing via CSV
-- ============================================================

-- Step 1: Drop dependent tables first (FK order)
DELETE FROM product_images;
DELETE FROM product_specifications;
DELETE FROM product_variants;

-- Step 2: Drop products
DELETE FROM products;

-- Step 3: Drop categories and brands
DELETE FROM categories;
DELETE FROM brands;

-- Step 4: Reset sequences so IDs restart from 1 (optional but clean)
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;
-- ALTER SEQUENCE brands_id_seq RESTART WITH 1;

-- ============================================================
-- After running this script, use the Admin Import page
-- to upload your CSV. The import will:
--   • Create new categories/brands as found in CSV
--   • Create new products with images uploaded to storage
-- ============================================================
