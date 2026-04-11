-- Add shipping dimension columns to order_items table
-- These are copied from products at order creation time so BigShip gets real dims
-- Run this in Supabase SQL Editor ONCE

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS shipping_weight    DECIMAL(10, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipping_length    INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipping_width     INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipping_height    INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipping_box_count INT DEFAULT 1;

COMMENT ON COLUMN order_items.shipping_weight    IS 'Dead weight in kg (copied from products.shipping_weight at order creation)';
COMMENT ON COLUMN order_items.shipping_length    IS 'Box length in cm (copied from products.shipping_length at order creation)';
COMMENT ON COLUMN order_items.shipping_width     IS 'Box width in cm (copied from products.shipping_width at order creation)';
COMMENT ON COLUMN order_items.shipping_height    IS 'Box height in cm (copied from products.shipping_height at order creation)';
COMMENT ON COLUMN order_items.shipping_box_count IS 'Number of boxes per unit (copied from products.shipping_box_count at order creation)';
