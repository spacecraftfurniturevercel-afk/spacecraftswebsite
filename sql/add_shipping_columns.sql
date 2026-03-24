-- Add shipping weight and dimension columns to products table
-- These are used by BigShip Calculate Rates API (POST /api/calculator)
-- BigShip requires: dead_weight (kg), length (cm), width (cm), height (cm)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL(10, 2) DEFAULT NULL,   -- in kg
  ADD COLUMN IF NOT EXISTS shipping_length INT DEFAULT NULL,               -- in cm
  ADD COLUMN IF NOT EXISTS shipping_width  INT DEFAULT NULL,               -- in cm
  ADD COLUMN IF NOT EXISTS shipping_height INT DEFAULT NULL;               -- in cm

-- Add comments for clarity
COMMENT ON COLUMN products.shipping_weight IS 'Shipping dead weight in kg for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_length IS 'Shipping box length in cm for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_width  IS 'Shipping box width in cm for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_height IS 'Shipping box height in cm for BigShip rate calculation';
