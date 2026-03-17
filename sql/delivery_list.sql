-- Delivery List Schema and Mock Data
-- Manages pincodes and delivery availability

-- Create delivery_zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id SERIAL PRIMARY KEY,
  pincode VARCHAR(6) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  shipping_cost NUMERIC(7,2) DEFAULT 0,
  delivery_days INT DEFAULT 3,
  cod_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode ON delivery_zones(pincode);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_city ON delivery_zones(city);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_available ON delivery_zones(is_available);

-- Create delivery_requests table
CREATE TABLE IF NOT EXISTS delivery_requests (
  id SERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  pincode VARCHAR(6) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, scheduled, delivered
  notes TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  scheduled_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_requests_pincode ON delivery_requests(pincode);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_product_id ON delivery_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_profile_id ON delivery_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_email ON delivery_requests(email);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON delivery_requests(status);

-- Create delivery_partners table (for future use)
CREATE TABLE IF NOT EXISTS delivery_partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  coverage_area VARCHAR(255),
  zones TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert mock delivery zones data
INSERT INTO delivery_zones (pincode, city, state, region, is_available, shipping_cost, delivery_days, cod_available)
VALUES
-- Mumbai
('400001', 'Mumbai', 'Maharashtra', 'South Mumbai', TRUE, 0, 2, TRUE),
('400002', 'Mumbai', 'Maharashtra', 'South Mumbai', TRUE, 0, 2, TRUE),
('400005', 'Mumbai', 'Maharashtra', 'South Mumbai', TRUE, 0, 2, TRUE),
('400009', 'Mumbai', 'Maharashtra', 'South Mumbai', TRUE, 0, 2, TRUE),
('400011', 'Mumbai', 'Maharashtra', 'South Mumbai', TRUE, 0, 2, TRUE),
('400012', 'Mumbai', 'Maharashtra', 'Central Mumbai', TRUE, 0, 2, TRUE),
('400013', 'Mumbai', 'Maharashtra', 'Central Mumbai', TRUE, 0, 2, TRUE),
('400015', 'Mumbai', 'Maharashtra', 'Central Mumbai', TRUE, 0, 2, TRUE),
('400020', 'Mumbai', 'Maharashtra', 'Central Mumbai', TRUE, 0, 2, TRUE),
('400024', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400049', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400051', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400052', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400057', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400080', 'Mumbai', 'Maharashtra', 'North Mumbai', TRUE, 0, 3, TRUE),
('400081', 'Mumbai', 'Maharashtra', 'East Mumbai', TRUE, 0, 3, TRUE),
('400083', 'Mumbai', 'Maharashtra', 'East Mumbai', TRUE, 0, 3, TRUE),
('400086', 'Mumbai', 'Maharashtra', 'East Mumbai', TRUE, 0, 3, TRUE),
('400088', 'Mumbai', 'Maharashtra', 'East Mumbai', TRUE, 0, 3, TRUE),
('400101', 'Mumbai', 'Maharashtra', 'West Mumbai', TRUE, 0, 3, TRUE),

-- Bangalore
('560001', 'Bangalore', 'Karnataka', 'Central Bangalore', TRUE, 0, 2, TRUE),
('560002', 'Bangalore', 'Karnataka', 'Central Bangalore', TRUE, 0, 2, TRUE),
('560003', 'Bangalore', 'Karnataka', 'Central Bangalore', TRUE, 0, 2, TRUE),
('560004', 'Bangalore', 'Karnataka', 'Central Bangalore', TRUE, 0, 2, TRUE),
('560005', 'Bangalore', 'Karnataka', 'Central Bangalore', TRUE, 0, 2, TRUE),
('560008', 'Bangalore', 'Karnataka', 'South Bangalore', TRUE, 0, 3, TRUE),
('560009', 'Bangalore', 'Karnataka', 'South Bangalore', TRUE, 0, 3, TRUE),
('560010', 'Bangalore', 'Karnataka', 'South Bangalore', TRUE, 0, 3, TRUE),
('560011', 'Bangalore', 'Karnataka', 'South Bangalore', TRUE, 0, 3, TRUE),
('560017', 'Bangalore', 'Karnataka', 'North Bangalore', TRUE, 0, 3, TRUE),
('560019', 'Bangalore', 'Karnataka', 'North Bangalore', TRUE, 0, 3, TRUE),
('560021', 'Bangalore', 'Karnataka', 'North Bangalore', TRUE, 0, 3, TRUE),
('560024', 'Bangalore', 'Karnataka', 'East Bangalore', TRUE, 0, 3, TRUE),
('560025', 'Bangalore', 'Karnataka', 'East Bangalore', TRUE, 0, 3, TRUE),
('560035', 'Bangalore', 'Karnataka', 'East Bangalore', TRUE, 0, 3, TRUE),

-- Delhi
('110001', 'Delhi', 'Delhi', 'Central Delhi', TRUE, 0, 2, TRUE),
('110002', 'Delhi', 'Delhi', 'Central Delhi', TRUE, 0, 2, TRUE),
('110006', 'Delhi', 'Delhi', 'Central Delhi', TRUE, 0, 2, TRUE),
('110007', 'Delhi', 'Delhi', 'Central Delhi', TRUE, 0, 2, TRUE),
('110015', 'Delhi', 'Delhi', 'South Delhi', TRUE, 0, 3, TRUE),
('110016', 'Delhi', 'Delhi', 'South Delhi', TRUE, 0, 3, TRUE),
('110017', 'Delhi', 'Delhi', 'South Delhi', TRUE, 0, 3, TRUE),
('110019', 'Delhi', 'Delhi', 'South Delhi', TRUE, 0, 3, TRUE),
('110021', 'Delhi', 'Delhi', 'South Delhi', TRUE, 0, 3, TRUE),
('110024', 'Delhi', 'Delhi', 'North Delhi', TRUE, 0, 3, TRUE),
('110025', 'Delhi', 'Delhi', 'North Delhi', TRUE, 0, 3, TRUE),
('110026', 'Delhi', 'Delhi', 'North Delhi', TRUE, 0, 3, TRUE),
('110030', 'Delhi', 'Delhi', 'East Delhi', TRUE, 0, 3, TRUE),
('110031', 'Delhi', 'Delhi', 'East Delhi', TRUE, 0, 3, TRUE),
('110032', 'Delhi', 'Delhi', 'East Delhi', TRUE, 0, 3, TRUE),

-- Pune
('411001', 'Pune', 'Maharashtra', 'Central Pune', TRUE, 0, 2, TRUE),
('411002', 'Pune', 'Maharashtra', 'Central Pune', TRUE, 0, 2, TRUE),
('411005', 'Pune', 'Maharashtra', 'Central Pune', TRUE, 0, 2, TRUE),
('411009', 'Pune', 'Maharashtra', 'Central Pune', TRUE, 0, 3, TRUE),
('411016', 'Pune', 'Maharashtra', 'East Pune', TRUE, 0, 3, TRUE),
('411017', 'Pune', 'Maharashtra', 'East Pune', TRUE, 0, 3, TRUE),
('411024', 'Pune', 'Maharashtra', 'North Pune', TRUE, 0, 3, TRUE),
('411027', 'Pune', 'Maharashtra', 'West Pune', TRUE, 0, 3, TRUE),
('411028', 'Pune', 'Maharashtra', 'West Pune', TRUE, 0, 3, TRUE),

-- Hyderabad
('500001', 'Hyderabad', 'Telangana', 'Central Hyderabad', TRUE, 0, 2, TRUE),
('500002', 'Hyderabad', 'Telangana', 'Central Hyderabad', TRUE, 0, 2, TRUE),
('500003', 'Hyderabad', 'Telangana', 'Central Hyderabad', TRUE, 0, 2, TRUE),
('500004', 'Hyderabad', 'Telangana', 'Central Hyderabad', TRUE, 0, 2, TRUE),
('500012', 'Hyderabad', 'Telangana', 'South Hyderabad', TRUE, 0, 3, TRUE),
('500013', 'Hyderabad', 'Telangana', 'South Hyderabad', TRUE, 0, 3, TRUE),
('500016', 'Hyderabad', 'Telangana', 'North Hyderabad', TRUE, 0, 3, TRUE),
('500018', 'Hyderabad', 'Telangana', 'North Hyderabad', TRUE, 0, 3, TRUE),
('500033', 'Hyderabad', 'Telangana', 'East Hyderabad', TRUE, 0, 3, TRUE),

-- Chennai
('600001', 'Chennai', 'Tamil Nadu', 'Central Chennai', TRUE, 0, 3, TRUE),
('600002', 'Chennai', 'Tamil Nadu', 'Central Chennai', TRUE, 0, 3, TRUE),
('600003', 'Chennai', 'Tamil Nadu', 'Central Chennai', TRUE, 0, 3, TRUE),
('600004', 'Chennai', 'Tamil Nadu', 'South Chennai', TRUE, 0, 3, TRUE),
('600005', 'Chennai', 'Tamil Nadu', 'South Chennai', TRUE, 0, 3, TRUE),
('600006', 'Chennai', 'Tamil Nadu', 'South Chennai', TRUE, 0, 3, TRUE),
('600020', 'Chennai', 'Tamil Nadu', 'North Chennai', TRUE, 0, 4, TRUE),
('600021', 'Chennai', 'Tamil Nadu', 'North Chennai', TRUE, 0, 4, TRUE),
('600022', 'Chennai', 'Tamil Nadu', 'East Chennai', TRUE, 0, 4, TRUE),

-- Kolkata
('700001', 'Kolkata', 'West Bengal', 'Central Kolkata', TRUE, 0, 3, TRUE),
('700006', 'Kolkata', 'West Bengal', 'Central Kolkata', TRUE, 0, 3, TRUE),
('700007', 'Kolkata', 'West Bengal', 'Central Kolkata', TRUE, 0, 3, TRUE),
('700008', 'Kolkata', 'West Bengal', 'South Kolkata', TRUE, 0, 3, TRUE),
('700009', 'Kolkata', 'West Bengal', 'South Kolkata', TRUE, 0, 3, TRUE),
('700017', 'Kolkata', 'West Bengal', 'North Kolkata', TRUE, 0, 4, TRUE),
('700020', 'Kolkata', 'West Bengal', 'North Kolkata', TRUE, 0, 4, TRUE),

-- Jaipur
('302001', 'Jaipur', 'Rajasthan', 'Central Jaipur', TRUE, 0, 4, TRUE),
('302002', 'Jaipur', 'Rajasthan', 'Central Jaipur', TRUE, 0, 4, TRUE),
('302003', 'Jaipur', 'Rajasthan', 'South Jaipur', TRUE, 0, 4, TRUE),
('302004', 'Jaipur', 'Rajasthan', 'South Jaipur', TRUE, 0, 4, TRUE),

-- Some unavailable pincodes for testing
('410001', 'Aurangabad', 'Maharashtra', 'Aurangabad', FALSE, 200, 5, TRUE),
('442001', 'Nagpur', 'Maharashtra', 'Nagpur', FALSE, 150, 5, TRUE),
('457001', 'Indore', 'Madhya Pradesh', 'Indore', FALSE, 200, 6, FALSE);

-- Enable RLS for security
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view available delivery zones" ON delivery_zones
  FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Authenticated users can insert delivery requests" ON delivery_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own delivery requests" ON delivery_requests
  FOR SELECT USING (email = auth.jwt() ->> 'email' OR auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_zones_availability ON delivery_zones(is_available, delivery_days);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_created_at ON delivery_requests(request_date DESC);
