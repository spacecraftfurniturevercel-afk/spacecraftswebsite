-- CMS & spreadsheet fields that were referenced in admin UI but missing from products table.
-- Run once in Supabase SQL Editor.

ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(120);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(320);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.short_description IS 'Short text for product cards and listings';
COMMENT ON COLUMN products.meta_title IS 'SEO page title (max ~60 chars recommended)';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description (max ~160 chars recommended)';
COMMENT ON COLUMN products.is_featured IS 'Show in Featured Products section on homepage';
COMMENT ON COLUMN products.is_new_arrival IS 'Show New badge and in New Arrivals section';

CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
