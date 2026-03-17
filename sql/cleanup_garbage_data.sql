-- ============================================
-- CLEANUP: Remove garbage categories & brands
-- Created by bad CSV imports where description
-- fragments were inserted as category/brand names.
-- Run this in Supabase SQL Editor.
-- ============================================

-- Step 1: Preview garbage CATEGORIES (review before deleting)
SELECT id, name, slug FROM categories
WHERE 
  name ~ '\.' -- contains period (sentence fragment)
  OR length(name) > 50 -- too long for a category name
  OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
  OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)'
  OR name IN ('guest rooms', 'patios', 'pillows', 'read', 'space saving furniture')
ORDER BY name;

-- Step 2: Preview garbage BRANDS (review before deleting)
SELECT id, name, slug FROM brands
WHERE 
  name ~ '\.'
  OR length(name) > 50
  OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
  OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)'
ORDER BY name;

-- Step 3: Nullify category_id on products pointing to garbage categories
UPDATE products SET category_id = NULL
WHERE category_id IN (
  SELECT id FROM categories
  WHERE 
    name ~ '\.'
    OR length(name) > 50
    OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
    OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)'
    OR name IN ('guest rooms', 'patios', 'pillows', 'read', 'space saving furniture')
);

-- Step 4: Nullify brand_id on products pointing to garbage brands
UPDATE products SET brand_id = NULL
WHERE brand_id IN (
  SELECT id FROM brands
  WHERE 
    name ~ '\.'
    OR length(name) > 50
    OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
    OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)'
);

-- Step 5: Delete garbage categories
DELETE FROM categories
WHERE 
  name ~ '\.'
  OR length(name) > 50
  OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
  OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)'
  OR name IN ('guest rooms', 'patios', 'pillows', 'read', 'space saving furniture');

-- Step 6: Delete garbage brands
DELETE FROM brands
WHERE 
  name ~ '\.'
  OR length(name) > 50
  OR name ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
  OR name ~* '(furniture|durability|construction|surface|weather|resistant|stylish|interior|household|suitable|movement|limited space)';

-- Step 7: Verify remaining categories
SELECT id, name, slug FROM categories ORDER BY name;

-- Step 8: Verify remaining brands
SELECT id, name, slug FROM brands ORDER BY name;

-- Step 9: Clean garbage SKU values on products (description fragments as SKU)
UPDATE products SET sku = NULL
WHERE sku IS NOT NULL AND (
  length(sku) > 50
  OR sku ~ '\.'
  OR sku ~* '^(and |or |so |which |ensuring |making |giving |reducing |it |the |this |that |its |with |for |to |a )'
  OR sku ~ '\s{2,}'
);

-- Step 10: Preview cleaned products
SELECT id, name, slug, sku, category_id, brand_id FROM products ORDER BY name LIMIT 50;
SELECT id, name, slug FROM brands ORDER BY name;

-- ============================================
-- BONUS: Clean description fields in products
-- Strips leading "Product Name – Simple Description"
-- header lines that were included in description text
-- ============================================

-- Step 11: Preview products with description header lines
SELECT id, name, substring(description, 1, 120) as desc_preview
FROM products
WHERE description ~* '^.{0,120}[\-–—]\s*(simple description|product description|description|overview)';

-- Step 12: Strip leading header lines from descriptions
UPDATE products
SET description = trim(
  regexp_replace(
    description,
    '^[^\n]{0,120}[\-–—][^\n]*(simple description|product description|description|overview)[^\n]*\n+',
    '',
    'in'
  )
)
WHERE description ~* '^.{0,120}[\-–—]\s*(simple description|product description|description|overview)';

-- Step 13: Final check
SELECT id, name, sku, category_id, brand_id, substring(description,1,100) as desc_preview
FROM products
ORDER BY name LIMIT 30;
