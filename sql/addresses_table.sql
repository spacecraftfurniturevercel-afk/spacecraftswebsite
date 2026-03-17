-- Create addresses table for user delivery addresses
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on profile_id for faster queries
CREATE INDEX IF NOT EXISTS idx_addresses_profile_id ON addresses(profile_id);

-- Create index on pincode for delivery validation
CREATE INDEX IF NOT EXISTS idx_addresses_pincode ON addresses(pincode);

-- Enable Row Level Security (RLS)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
  ON addresses
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
  ON addresses
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
  ON addresses
  FOR DELETE
  USING (auth.uid() = profile_id);

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
      AND id != NEW.id;
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

-- Add comment to table
COMMENT ON TABLE addresses IS 'Stores user delivery addresses with a maximum of 4 addresses per user';
COMMENT ON COLUMN addresses.profile_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN addresses.is_default IS 'Only one address can be default per user';
COMMENT ON COLUMN addresses.pincode IS '6-digit Indian pincode for delivery validation';
