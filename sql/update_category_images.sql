-- Update 12 homepage category images to new client assets
-- Run after copying images to public/categories/

UPDATE categories SET image_url = '/categories/beds.png' WHERE slug = 'beds';
UPDATE categories SET image_url = '/categories/chairs.png' WHERE slug = 'chairs';
UPDATE categories SET image_url = '/categories/recliners.webp' WHERE slug = 'recliners';
UPDATE categories SET image_url = '/categories/sofa-cum-beds.png' WHERE slug = 'sofa-cum-beds';
UPDATE categories SET image_url = '/categories/dining-sets.png' WHERE slug = 'dining-sets';
UPDATE categories SET image_url = '/categories/wardrobes.png' WHERE slug = 'wardrobes';
UPDATE categories SET image_url = '/categories/office-furniture.png' WHERE slug = 'office-furniture';
UPDATE categories SET image_url = '/categories/center-tables.jpg' WHERE slug = 'center-tables';
UPDATE categories SET image_url = '/categories/sofas.png' WHERE slug = 'sofas';
UPDATE categories SET image_url = '/categories/pooja-racks.png' WHERE slug = 'pooja-racks';
UPDATE categories SET image_url = '/categories/bunk-beds.png' WHERE slug = 'bunk-beds';
UPDATE categories SET image_url = '/categories/mattress.png' WHERE slug = 'mattress';

-- Verify
SELECT slug, name, image_url FROM categories
WHERE slug IN (
  'beds','chairs','recliners','sofa-cum-beds','dining-sets','wardrobes',
  'office-furniture','center-tables','sofas','pooja-racks','bunk-beds','mattress'
)
ORDER BY sort_order NULLS LAST, name;
