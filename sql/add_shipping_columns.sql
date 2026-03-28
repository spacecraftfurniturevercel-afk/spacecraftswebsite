-- Add shipping weight, dimension, and box count columns to products table
-- These are used by BigShip Calculate Rates API (POST /api/calculator)
-- BigShip requires: dead_weight (kg), length (cm), width (cm), height (cm), box_count

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_weight    DECIMAL(10, 2) DEFAULT NULL,   -- in kg
  ADD COLUMN IF NOT EXISTS shipping_length    INT DEFAULT NULL,               -- in cm
  ADD COLUMN IF NOT EXISTS shipping_width     INT DEFAULT NULL,               -- in cm
  ADD COLUMN IF NOT EXISTS shipping_height    INT DEFAULT NULL,               -- in cm
  ADD COLUMN IF NOT EXISTS shipping_box_count INT DEFAULT 1;                  -- number of boxes (each_box_count in BigShip)

-- Add comments for clarity
COMMENT ON COLUMN products.shipping_weight    IS 'Shipping dead weight in kg for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_length    IS 'Shipping box length in cm for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_width     IS 'Shipping box width in cm for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_height    IS 'Shipping box height in cm for BigShip rate calculation';
COMMENT ON COLUMN products.shipping_box_count IS 'Number of boxes required to ship one unit; multiplied by order quantity for total box_count';

-- ─── Orders table: store shipping cost breakdown ────────────────────────────
-- Adds subtotal, delivery_charge, and tax so order records show the full breakdown:
--   total = subtotal + tax (18% GST) + delivery_charge
-- The shipping charge fetched BEFORE payment via /api/calculator is stored here.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal        DECIMAL(10, 2) DEFAULT NULL,   -- product price before GST & shipping
  ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0,      -- shipping cost from BigShip calculator
  ADD COLUMN IF NOT EXISTS tax             DECIMAL(10, 2) DEFAULT NULL;    -- GST (18% of subtotal)

COMMENT ON COLUMN orders.subtotal        IS 'Product subtotal before GST and shipping';
COMMENT ON COLUMN orders.delivery_charge IS 'Shipping charge calculated by BigShip before payment';
COMMENT ON COLUMN orders.tax             IS 'GST (18%) applied on product subtotal';
