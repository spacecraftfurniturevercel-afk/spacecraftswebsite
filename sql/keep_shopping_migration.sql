-- ============================================================
-- Keep Shopping Feature — Database Migration
-- Run these queries in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Add related_product_ids column to products table
-- Stores an array of product UUIDs that are related to this product
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products
ADD COLUMN IF NOT EXISTS related_product_ids integer[] DEFAULT '{}';

-- Add a comment for documentation
COMMENT ON COLUMN products.related_product_ids IS 'Array of related product IDs (integers) for cross-selling';

-- Create a GIN index for efficient array lookups
CREATE INDEX IF NOT EXISTS idx_products_related_ids
ON products USING GIN (related_product_ids);


-- ─────────────────────────────────────────────────────────────
-- 2. Create user_browsing_history table
-- Tracks which products each authenticated user has viewed
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_browsing_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  search_query text,                    -- optional: what search led to this view
  viewed_at timestamptz DEFAULT now(),
  
  -- Ensure one row per user+product (upsert updates viewed_at)
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Index for fast user-specific lookups ordered by recency
CREATE INDEX IF NOT EXISTS idx_browsing_history_user_recent
ON user_browsing_history (user_id, viewed_at DESC);

-- Index for product-specific analytics
CREATE INDEX IF NOT EXISTS idx_browsing_history_product
ON user_browsing_history (product_id);

-- Add comments for documentation
COMMENT ON TABLE user_browsing_history IS 'Tracks product views per user for the Keep Shopping feature';
COMMENT ON COLUMN user_browsing_history.search_query IS 'The search query that led the user to view this product (optional)';


-- ─────────────────────────────────────────────────────────────
-- 3. Row Level Security (RLS)
-- Users can only see and insert their own browsing history
-- ─────────────────────────────────────────────────────────────
ALTER TABLE user_browsing_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
CREATE POLICY "Users can view own browsing history"
ON user_browsing_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert own browsing history"
ON user_browsing_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own history (for upsert / viewed_at updates)
CREATE POLICY "Users can update own browsing history"
ON user_browsing_history FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own browsing history"
ON user_browsing_history FOR DELETE
USING (auth.uid() = user_id);

-- Service role can do everything (used by API routes with service role key)
CREATE POLICY "Service role full access to browsing history"
ON user_browsing_history FOR ALL
USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 4. Helper function: Set related products for a product
-- Usage: SELECT set_related_products(1, ARRAY[2, 3, 4]);
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_related_products(
  p_product_id integer,
  p_related_ids integer[]
)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET related_product_ids = p_related_ids
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 5. Helper function: Auto-populate related products by category
-- Sets up to 4 related products from the same category for products
-- that don't have any related products set yet.
-- Usage: SELECT auto_populate_related_products();
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_populate_related_products()
RETURNS integer AS $$
DECLARE
  updated_count integer := 0;
  product_row RECORD;
  related_ids integer[];
BEGIN
  FOR product_row IN
    SELECT id, category_id
    FROM products
    WHERE is_active = true
      AND (related_product_ids IS NULL OR array_length(related_product_ids, 1) IS NULL)
  LOOP
    SELECT array_agg(id)
    INTO related_ids
    FROM (
      SELECT id
      FROM products
      WHERE category_id = product_row.category_id
        AND id != product_row.id
        AND is_active = true
      ORDER BY rating DESC NULLS LAST
      LIMIT 4
    ) sub;
    
    IF related_ids IS NOT NULL AND array_length(related_ids, 1) > 0 THEN
      UPDATE products
      SET related_product_ids = related_ids
      WHERE id = product_row.id;
      
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 6. Run auto-populate (optional — fills in related products
--    for all products that don't have them set yet)
-- ─────────────────────────────────────────────────────────────
-- Uncomment the line below to auto-fill related products:
-- SELECT auto_populate_related_products();


-- ─────────────────────────────────────────────────────────────
-- 7. Useful queries for admin/debugging
-- ─────────────────────────────────────────────────────────────

-- View a user's browsing history with product details:
-- SELECT ubh.viewed_at, p.name, p.slug, p.price, ubh.search_query
-- FROM user_browsing_history ubh
-- JOIN products p ON p.id = ubh.product_id
-- WHERE ubh.user_id = 'USER-UUID-HERE'
-- ORDER BY ubh.viewed_at DESC;

-- Count total views per product (analytics):
-- SELECT p.name, COUNT(*) as view_count
-- FROM user_browsing_history ubh
-- JOIN products p ON p.id = ubh.product_id
-- GROUP BY p.name
-- ORDER BY view_count DESC;

-- Check which products have related products set:
-- SELECT name, slug, array_length(related_product_ids, 1) as related_count
-- FROM products
-- WHERE related_product_ids IS NOT NULL
--   AND array_length(related_product_ids, 1) > 0
-- ORDER BY related_count DESC;
