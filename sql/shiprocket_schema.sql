-- =====================================================
-- Shiprocket Integration: Database Schema Updates
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add Shiprocket-related columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;

-- Create shipping_events table for webhook event logging
CREATE TABLE IF NOT EXISTS shipping_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  awb_code TEXT,
  courier TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_shipping_events_order_id ON shipping_events(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Enable RLS on shipping_events
ALTER TABLE shipping_events ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own shipping events
DROP POLICY IF EXISTS "Users can view their own shipping events" ON shipping_events;
CREATE POLICY "Users can view their own shipping events"
  ON shipping_events FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE profile_id = auth.uid()
    )
  );

-- Allow service role (webhook) to insert
DROP POLICY IF EXISTS "Service can insert shipping events" ON shipping_events;
CREATE POLICY "Service can insert shipping events"
  ON shipping_events FOR INSERT
  WITH CHECK (true);
