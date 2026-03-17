-- Migration: Product Enhancements with Warranties, EMI, Offers, and Variants
-- Date: 2026-01-16

-- ===== 1. ALTER PRODUCTS TABLE =====
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_period INT DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_type VARCHAR(100) DEFAULT 'Standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS assembly_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS assembly_time INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS people_viewing INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS assurance_badge VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_stock BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS emi_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS return_days INT DEFAULT 30;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;

-- Add comments to products table columns
COMMENT ON COLUMN products.warranty_period IS 'Warranty in months';
COMMENT ON COLUMN products.warranty_type IS 'Standard, Extended, Premium';
COMMENT ON COLUMN products.assembly_time IS 'Assembly time in hours';
COMMENT ON COLUMN products.assurance_badge IS 'Assured, Certified, etc';

-- ===== 2. CREATE PRODUCT VARIANTS TABLE =====
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL,
  variant_type VARCHAR(50) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(12, 2),
  mrp DECIMAL(12, 2),
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, variant_name)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(product_id, is_active);

-- ===== 3. CREATE PRODUCT OFFERS TABLE =====
CREATE TABLE IF NOT EXISTS product_offers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_amount DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2),
  offer_type VARCHAR(50) NOT NULL,
  promo_code VARCHAR(50),
  min_purchase DECIMAL(12, 2),
  max_discount DECIMAL(10, 2),
  is_limited_time BOOLEAN DEFAULT FALSE,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_offers_product_id ON product_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_active ON product_offers(product_id, is_active);

-- ===== 4. CREATE WARRANTY OPTIONS TABLE =====
CREATE TABLE IF NOT EXISTS warranty_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warranty_name VARCHAR(100) NOT NULL,
  warranty_months INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  coverage_types TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warranty_months)
);

CREATE INDEX IF NOT EXISTS idx_warranty_options_product_id ON warranty_options(product_id);

-- ===== 5. CREATE DELIVERY & STORES TABLE =====
CREATE TABLE IF NOT EXISTS product_stores (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  distance_km DECIMAL(5, 2),
  delivery_days INT DEFAULT 3,
  pincode VARCHAR(10),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_stores_product_id ON product_stores(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stores_pincode ON product_stores(pincode);

-- ===== 6. CREATE EMI OPTIONS TABLE =====
CREATE TABLE IF NOT EXISTS emi_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  card_type VARCHAR(50),
  emi_monthly DECIMAL(12, 2),
  min_purchase DECIMAL(12, 2),
  max_discount DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2),
  tenure_months INT,
  description VARCHAR(255),
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emi_options_product_id ON emi_options(product_id);

-- ===== 7. CREATE PRODUCT SPECIFICATIONS TABLE =====
CREATE TABLE IF NOT EXISTS product_specifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_category VARCHAR(100) NOT NULL,
  spec_name VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, spec_category, spec_name)
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_category ON product_specifications(product_id, spec_category);

-- ===== 8. UPDATE PRODUCT IMAGES TABLE (IF EXISTS) =====
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_type VARCHAR(50) DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON product_images(variant_id);

-- ===== 9. CREATE BRAND COLLECTION TABLE =====
CREATE TABLE IF NOT EXISTS brand_collections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  collection_name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, collection_name)
);

-- ===== 10. RLS POLICIES =====
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE emi_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_collections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_product_offers" ON product_offers FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP));
CREATE POLICY "public_read_warranty_options" ON warranty_options FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_product_stores" ON product_stores FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_emi_options" ON emi_options FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_product_specs" ON product_specifications FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_brand_collections" ON brand_collections FOR SELECT USING (is_active = true);

-- Admin write policies
CREATE POLICY "admin_all_product_variants" ON product_variants FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_product_offers" ON product_offers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_warranty_options" ON warranty_options FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_product_stores" ON product_stores FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_emi_options" ON emi_options FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_product_specs" ON product_specifications FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "admin_all_brand_collections" ON brand_collections FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the schema
/*
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('mrp', 'warranty_period', 'assembly_cost', 'stock_quantity', 'people_viewing', 'assurance_badge');

SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('product_variants', 'product_offers', 'warranty_options', 'product_stores', 'emi_options', 'product_specifications', 'brand_collections');

SELECT * FROM product_variants LIMIT 1;
SELECT * FROM product_offers LIMIT 1;
*/
