-- Add shipment_error column to orders table
-- Stores the last Phase 1 failure reason so admin can see why auto-shipment failed
-- Run this ONCE in Supabase SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipment_error TEXT DEFAULT NULL;

COMMENT ON COLUMN orders.shipment_error IS 'Last Phase 1 BigShip error message. Cleared when shipment is created successfully.';
