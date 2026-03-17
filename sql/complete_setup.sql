-- Complete Database Setup for Address Management and Delivery System
-- Run this script in your Supabase SQL Editor

-- ============================================
-- 1. Create or Update delivery_requests Table
-- ============================================

-- First, check if table exists and update schema
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='profile_id') THEN
        ALTER TABLE delivery_requests ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='full_name') THEN
        ALTER TABLE delivery_requests ADD COLUMN full_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='phone') THEN
        ALTER TABLE delivery_requests ADD COLUMN phone VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='address') THEN
        ALTER TABLE delivery_requests ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='postal_code') THEN
        ALTER TABLE delivery_requests ADD COLUMN postal_code VARCHAR(6);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='delivery_requests' AND column_name='pincode') THEN
        -- pincode column doesn't exist, that's fine
    ELSE
        -- If pincode exists, we're already using postal_code
    END IF;

    -- Update existing columns to NOT NULL where needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='delivery_requests' AND column_name='city' AND is_nullable='YES') THEN
        UPDATE delivery_requests SET city = 'Unknown' WHERE city IS NULL;
        ALTER TABLE delivery_requests ALTER COLUMN city SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='delivery_requests' AND column_name='state' AND is_nullable='YES') THEN
        UPDATE delivery_requests SET state = 'Unknown' WHERE state IS NULL;
        ALTER TABLE delivery_requests ALTER COLUMN state SET NOT NULL;
    END IF;
END $$;

-- Create index on profile_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_delivery_requests_profile_id ON delivery_requests(profile_id);

-- ============================================
-- 2. Create Addresses Table
-- ============================================

CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_addresses_profile_id ON addresses(profile_id);
CREATE INDEX IF NOT EXISTS idx_addresses_postal_code ON addresses(postal_code);

-- ============================================
-- 3. Enable Row Level Security
-- ============================================

-- Enable RLS on addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;

-- Create RLS policies for addresses
CREATE POLICY "Users can view their own addresses"
  ON addresses
  FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own addresses"
  ON addresses
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own addresses"
  ON addresses
  FOR DELETE
  USING (auth.uid() = profile_id);

-- ============================================
-- 4. Create Functions and Triggers
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on address update
DROP TRIGGER IF EXISTS update_addresses_updated_at_trigger ON addresses;
CREATE TRIGGER update_addresses_updated_at_trigger
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated address is set as default
  IF NEW.is_default = TRUE THEN
    -- Set all other addresses for this user to not default
    UPDATE addresses
    SET is_default = FALSE
    WHERE profile_id = NEW.profile_id
      AND id != COALESCE(NEW.id, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one default address
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON addresses;
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- ============================================
-- 5. Add Comments
-- ============================================

COMMENT ON TABLE addresses IS 'Stores user delivery addresses with a maximum of 4 addresses per user';
COMMENT ON COLUMN addresses.profile_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN addresses.is_default IS 'Only one address can be default per user';
COMMENT ON COLUMN addresses.postal_code IS '6-digit Indian postal code for delivery validation';

-- ============================================
-- 6. Verify Tables
-- ============================================

-- Display created tables
SELECT 
  'addresses' as table_name,
  COUNT(*) as row_count
FROM addresses
UNION ALL
SELECT 
  'delivery_requests' as table_name,
  COUNT(*) as row_count
FROM delivery_requests
UNION ALL
SELECT 
  'delivery_zones' as table_name,
  COUNT(*) as row_count
FROM delivery_zones;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: addresses';
  RAISE NOTICE 'Tables updated: delivery_requests';
  RAISE NOTICE 'RLS policies applied: addresses';
END $$;
