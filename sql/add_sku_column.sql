-- Add SKU column to products table
-- SKU is a unique product identifier provided by the client (e.g., "jf-1020")

ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;

-- Create unique index on SKU (allow nulls - not every product has one yet)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
