-- Run if product_categories already exists but storefront shows no products.
-- Fixes public read policy on junction table.

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_categories" ON product_categories;
CREATE POLICY "public_read_product_categories" ON product_categories
  FOR SELECT USING (true);
