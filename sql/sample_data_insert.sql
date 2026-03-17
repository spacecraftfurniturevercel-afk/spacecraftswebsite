-- QUICK REFERENCE: Insert Sample Product Enhancement Data
-- Use these SQL statements to populate test data for product variants, offers, warranties, EMI, stores, and specifications
-- Replace product_id = 1 with your actual product ID

-- ============================================================
-- 1. PRODUCT VARIANTS (Colors/Styles)
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (1, 'Sandy Brown', 'color', 'NOVA-SB-001', 38499, 53999, 15, 'https://via.placeholder.com/100?text=Sandy+Brown', 1, true),
  (1, 'Grey', 'color', 'NOVA-GR-001', 38499, 53999, 12, 'https://via.placeholder.com/100?text=Grey', 2, true),
  (1, 'Navy Blue', 'color', 'NOVA-NV-001', 38499, 53999, 8, 'https://via.placeholder.com/100?text=Navy', 3, true),
  (1, 'Black', 'color', 'NOVA-BK-001', 38499, 53999, 10, 'https://via.placeholder.com/100?text=Black', 4, true),
  (1, 'Cream', 'color', 'NOVA-CR-001', 38499, 53999, 5, 'https://via.placeholder.com/100?text=Cream', 5, true);

-- ============================================================
-- 2. PRODUCT OFFERS (Promotions & Discounts)
-- ============================================================

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (1, 'Sign-Up & Get Up to ₹1,500 off on Your First Purchase!', 'New user exclusive offer', 'percentage', 15, true, 1, true),
  (1, 'Buy Any 3 Products* & Get EXTRA 20% off*', 'Multi-buy discount on 3+ products', 'percentage', 20, true, 2, true),
  (1, 'Extra Rs.1,500 Off on Purchase Above ₹14,999!', 'Minimum purchase required', 'fixed', NULL, true, 3, true),
  (1, 'Get 10% off upto ₹4,000 on ICICI Cards with Min Purchase of 30,000 INR', 'ICICI credit card offer', 'card', 10, true, 4, true),
  (1, 'Get 7.5% off upto ₹1,500 on ICICI Cards with Min Purchase of 15000 INR', 'ICICI debit card offer', 'card', 7.5, true, 5, true),
  (1, 'Get 10% Off upto ₹3,000 On HDFC Credit Card & Debit Card EMI', 'HDFC EMI offer', 'card', 10, true, 6, true);

-- ============================================================
-- 3. WARRANTY OPTIONS (Protection Plans)
-- ============================================================

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (1, '1-Year Protection Plan', 12, 2130, 'Protection from spills & damage, instant payout for approvals, extended warranty for defects', '["spills", "damage", "instant_claim", "extended_warranty"]', true),
  (1, '2-Year Protection Plan', 24, 3500, 'Extended 2-year coverage with all benefits', '["spills", "damage", "instant_claim", "extended_warranty", "accidental_damage"]', true),
  (1, '3-Year Protection Plan', 36, 4999, 'Premium 3-year coverage with maximum protection', '["spills", "damage", "instant_claim", "extended_warranty", "accidental_damage", "replacement"]', true);

-- ============================================================
-- 4. EMI OPTIONS (Bank Financing)
-- ============================================================

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (1, 'HDFC', 'Credit Card', 3208, 12, 10, 30000, 3000, 'Get 10% off upto ₹3,000', 1, true),
  (1, 'HDFC', 'Debit Card EMI', 3208, 12, 7.5, 15000, 2000, 'Get 7.5% off upto ₹2,000', 2, true),
  (1, 'ICICI', 'Credit Card', 3416, 12, 10, 30000, 4000, 'Get 10% off upto ₹4,000', 3, true),
  (1, 'ICICI', 'Debit Card', 3416, 12, 7.5, 15000, 1500, 'Get 7.5% off upto ₹1,500', 4, true),
  (1, 'Axis', 'Credit Card', 3208, 12, 5, 50000, 1500, 'Get ₹1,500 off on Axis CC EMI', 5, true),
  (1, 'American Express', 'Credit Card', 3416, 12, 10, 40000, 4000, 'FLAT 10% off upto ₹4,000 on AmEx CC EMI', 6, true);

-- ============================================================
-- 5. PRODUCT STORES (Nearby Showrooms)
-- ============================================================

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (1, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, 3rd Ave, Near Shanthi Colony Jn Signal, Anna Nagar, Chennai, Tamil Nadu 600040', '08037500352', 7, 2, '600040', true),
  (1, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Thousand Lights West, Nungambakkam, Next to Star Bucks, Chennai, Tamil Nadu 600034', '08045699564', 8, 2, '600034', true),
  (1, 'Spacecrafts Velachery', '181A, 100 ft Bye pass road, Velachery, Chennai, Tamil Nadu 600042', '08037500365', 10, 2, '600042', true),
  (1, 'Spacecrafts Adyar', 'M 49/50, Ground Floor, Classic Royal, LB Road, Opposite Impcops, Indira Nagar, Adyar, Chennai, Tamil Nadu 600020', '08045699569', 12, 3, '600020', true);

-- ============================================================
-- 6. PRODUCT SPECIFICATIONS (Technical Details)
-- ============================================================

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  -- Dimensions
  (1, 'Dimensions', 'Length', '180', 'cm', 1, true),
  (1, 'Dimensions', 'Width', '90', 'cm', 2, true),
  (1, 'Dimensions', 'Height', '85', 'cm', 3, true),
  (1, 'Dimensions', 'Seating Height', '42', 'cm', 4, true),
  
  -- Material & Construction
  (1, 'Material', 'Fabric Type', 'Chenille', NULL, 1, true),
  (1, 'Material', 'Frame Material', 'Solid Wood', NULL, 2, true),
  (1, 'Material', 'Cushion Material', 'High Density Foam', NULL, 3, true),
  (1, 'Material', 'Leg Material', 'Wooden Legs', NULL, 4, true),
  
  -- Weight & Capacity
  (1, 'Weight & Capacity', 'Weight', '95', 'kg', 1, true),
  (1, 'Weight & Capacity', 'Seating Capacity', '3', 'persons', 2, true),
  (1, 'Weight & Capacity', 'Max Load', '500', 'kg', 3, true),
  
  -- Features
  (1, 'Features', 'Removable Covers', 'Yes', NULL, 1, true),
  (1, 'Features', 'Easy Maintenance', 'Yes', NULL, 2, true),
  (1, 'Features', 'Warranty Period', '36 months', NULL, 3, true),
  
  -- Assembly
  (1, 'Assembly', 'Assembly Required', 'Yes', NULL, 1, true),
  (1, 'Assembly', 'Assembly Time', '2-3 hours', NULL, 2, true),
  (1, 'Assembly', 'Assembly Service Cost', '₹1,399', NULL, 3, true);

-- ============================================================
-- 7. UPDATE MAIN PRODUCT WITH NEW FIELDS
-- ============================================================

UPDATE products 
SET 
  mrp = 53999,
  warranty_period = 36,
  warranty_type = 'Premium',
  assembly_cost = 1399,
  assembly_time = 3,
  stock_quantity = 50,
  people_viewing = 58,
  assurance_badge = 'Assured',
  is_limited_stock = false,
  emi_enabled = true,
  return_days = 30,
  care_instructions = 'Dry clean only. Keep away from direct sunlight. Use soft brush for regular cleaning.'
WHERE id = 1;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check variants inserted
-- SELECT * FROM product_variants WHERE product_id = 1 AND is_active = true ORDER BY position;

-- Check offers inserted
-- SELECT * FROM product_offers WHERE product_id = 1 AND is_active = true ORDER BY position;

-- Check warranties inserted
-- SELECT * FROM warranty_options WHERE product_id = 1 AND is_active = true;

-- Check EMI options inserted
-- SELECT * FROM emi_options WHERE product_id = 1 AND is_active = true ORDER BY position;

-- Check stores inserted
-- SELECT * FROM product_stores WHERE product_id = 1 AND is_active = true ORDER BY distance_km;

-- Check specifications inserted
-- SELECT * FROM product_specifications WHERE product_id = 1 AND is_active = true ORDER BY spec_category, position;

-- Check main product update
-- SELECT mrp, warranty_period, assembly_cost, stock_quantity, people_viewing, assurance_badge FROM products WHERE id = 1;
