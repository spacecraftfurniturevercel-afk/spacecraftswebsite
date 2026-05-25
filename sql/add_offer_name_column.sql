-- Add promotional offer label for products (e.g. "Limited time deal", "Diwali Offer")
-- Run in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_name text;

COMMENT ON COLUMN products.offer_name IS 'Promotional label shown beside discount badge (Limited time deal, Diwali Offer, etc.)';

-- Examples (uncomment and adjust slugs as needed):
-- UPDATE products SET offer_name = 'Limited time deal'
-- WHERE slug IN ('nova-sofa-bed-without-storage', 'ventura') AND discount_price IS NOT NULL;

-- UPDATE products SET offer_name = 'Diwali Offer'
-- WHERE is_offered = true AND offer_name IS NULL;

-- Verify
-- SELECT id, name, slug, offer_name, discount_price, is_offered FROM products WHERE offer_name IS NOT NULL LIMIT 20;
