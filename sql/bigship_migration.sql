-- BigShip Integration: Add bigship_order_id column to orders table
-- Run this in Supabase SQL Editor

-- Add bigship_order_id column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bigship_order_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_bigship_order_id ON orders(bigship_order_id);

-- Ensure shipping-related columns exist (they may already exist from Shiprocket integration)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;

-- Ensure shipping_events table exists for logging
CREATE TABLE IF NOT EXISTS shipping_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status TEXT,
  awb_code TEXT,
  courier TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
