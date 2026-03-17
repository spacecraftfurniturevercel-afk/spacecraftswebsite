-- Add is_active flag to products and categories tables
-- This allows selective activation/deactivation of products and categories

-- Add is_active column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_active column to categories table if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Deactivate all existing products
UPDATE products SET is_active = false;

-- Activate only the 9 new SpaceCraft products
UPDATE products SET is_active = true 
WHERE brand_id = (SELECT id FROM brands WHERE slug = 'spacecraft');

-- Optional: You can also manage categories activation
-- For now, keep all categories active
UPDATE categories SET is_active = true;

-- Verification: Show all products with their active status
SELECT id, name, slug, (SELECT name FROM brands WHERE id = products.brand_id) as brand, is_active, created_at
FROM products
ORDER BY created_at DESC;

-- Verification: Show categories with their active status
SELECT id, name, slug, is_active
FROM categories
ORDER BY name;
