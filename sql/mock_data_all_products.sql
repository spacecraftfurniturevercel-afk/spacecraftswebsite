-- ============================================================
-- COMPREHENSIVE MOCK DATA FOR ALL PRODUCTS
-- For IDs: 96, 97, 98, 99, 100, 101, 102, 103, 104
-- Includes: Variants, Offers, Warranties, EMI, Stores, Specs
-- ============================================================

-- ============================================================
-- PRODUCT 96: Nova Sofa Bed Without Storage
-- ============================================================

-- Color Variants
INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (96, 'Sandy Brown', 'color', 'NOVA-SB-001', 38499, 53999, 15, 'https://via.placeholder.com/100?text=Sandy+Brown', 1, true),
  (96, 'Grey', 'color', 'NOVA-GR-001', 38499, 53999, 12, 'https://via.placeholder.com/100?text=Grey', 2, true),
  (96, 'Navy Blue', 'color', 'NOVA-NV-001', 38499, 53999, 8, 'https://via.placeholder.com/100?text=Navy', 3, true),
  (96, 'Black', 'color', 'NOVA-BK-001', 38499, 53999, 10, 'https://via.placeholder.com/100?text=Black', 4, true)
ON CONFLICT DO NOTHING;

-- Offers
INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (96, 'Sign-Up & Get Up to ₹1,500 off on Your First Purchase!', 'New user exclusive', 'percentage', 15, true, 1, true),
  (96, 'Buy Any 3 Products & Get EXTRA 20% off', 'Multi-buy offer', 'percentage', 20, true, 2, true),
  (96, 'Extra Rs.1,500 Off on Purchase Above ₹14,999', 'Minimum purchase required', 'fixed', NULL, true, 3, true),
  (96, 'Get 10% off upto ₹4,000 on ICICI Cards', 'ICICI credit card offer', 'card', 10, true, 4, true)
ON CONFLICT DO NOTHING;

-- Warranty Options
INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (96, '1-Year Protection Plan', 12, 2130, 'Protection from spills & damage, instant payout', '["spills", "damage", "instant_claim"]', true),
  (96, '2-Year Protection Plan', 24, 3500, 'Extended coverage with accidental damage', '["spills", "damage", "accidental_damage"]', true),
  (96, '3-Year Protection Plan', 36, 4999, 'Premium coverage with replacement', '["spills", "damage", "accidental_damage", "replacement"]', true)
ON CONFLICT DO NOTHING;

-- EMI Options
INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (96, 'HDFC', 'Credit Card', 3208, 12, 10, 30000, 3000, 'Get 10% off upto ₹3,000', 1, true),
  (96, 'ICICI', 'Credit Card', 3416, 12, 10, 30000, 4000, 'Get 10% off upto ₹4,000', 2, true),
  (96, 'Axis', 'Credit Card', 3208, 12, 5, 50000, 1500, 'Get ₹1,500 off', 3, true)
ON CONFLICT DO NOTHING;

-- Stores
INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (96, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, 3rd Ave, Anna Nagar, Chennai 600040', '08037500352', 7, 2, '600040', true),
  (96, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Nungambakkam, Chennai 600034', '08045699564', 8, 2, '600034', true),
  (96, 'Spacecrafts Velachery', '181A, 100 ft Bye pass road, Velachery, Chennai 600042', '08037500365', 10, 2, '600042', true)
ON CONFLICT DO NOTHING;

-- Specifications
INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (96, 'Dimensions', 'Length', '180', 'cm', 1, true),
  (96, 'Dimensions', 'Width', '90', 'cm', 2, true),
  (96, 'Dimensions', 'Height', '85', 'cm', 3, true),
  (96, 'Dimensions', 'Seating Height', '42', 'cm', 4, true),
  (96, 'Material', 'Fabric Type', 'Chenille', NULL, 1, true),
  (96, 'Material', 'Frame Material', 'Solid Wood', NULL, 2, true),
  (96, 'Weight & Capacity', 'Weight', '95', 'kg', 1, true),
  (96, 'Weight & Capacity', 'Seating Capacity', '4', 'persons', 2, true),
  (96, 'Features', 'Removable Covers', 'Yes', NULL, 1, true),
  (96, 'Features', 'Storage Included', 'No', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 97: Voyager NEC Chair
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (97, 'Black', 'color', 'VOY-BK-001', 12499, 18999, 20, 'https://via.placeholder.com/100?text=Black', 1, true),
  (97, 'White', 'color', 'VOY-WH-001', 12499, 18999, 15, 'https://via.placeholder.com/100?text=White', 2, true),
  (97, 'Grey', 'color', 'VOY-GR-001', 12499, 18999, 18, 'https://via.placeholder.com/100?text=Grey', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (97, 'Flat 20% OFF on NEC Chairs', 'Chair collection discount', 'percentage', 20, false, 1, true),
  (97, 'Free Delivery on Orders Above ₹10,000', 'Delivery offer', 'percentage', 0, true, 2, true),
  (97, 'Extra ₹1,000 OFF with HDFC Cards', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (97, '1-Year Protection Plan', 12, 1500, 'Standard warranty coverage', '["manufacturing_defects"]', true),
  (97, '2-Year Protection Plan', 24, 2500, 'Extended protection', '["manufacturing_defects", "wear_tear"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (97, 'HDFC', 'Credit Card', 1041, 12, 5, 10000, 1000, '5% off on HDFC CC', 1, true),
  (97, 'ICICI', 'Credit Card', 1041, 12, 5, 10000, 800, '5% off on ICICI CC', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (97, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 1, '600040', true),
  (97, 'Spacecrafts Velachery', '181A, 100 ft Bye pass road, Velachery, Chennai 600042', '08037500365', 10, 1, '600042', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (97, 'Dimensions', 'Length', '65', 'cm', 1, true),
  (97, 'Dimensions', 'Width', '65', 'cm', 2, true),
  (97, 'Dimensions', 'Height', '75', 'cm', 3, true),
  (97, 'Dimensions', 'Seat Height', '45', 'cm', 4, true),
  (97, 'Material', 'Frame Material', 'Metal & Wood', NULL, 1, true),
  (97, 'Material', 'Seat Material', 'Fabric', NULL, 2, true),
  (97, 'Weight & Capacity', 'Weight', '25', 'kg', 1, true),
  (97, 'Weight & Capacity', 'Max Load', '150', 'kg', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 98: Halley Sofa Cum Bed Single
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (98, 'Beige', 'color', 'HAL-BE-001', 28999, 42999, 12, 'https://via.placeholder.com/100?text=Beige', 1, true),
  (98, 'Maroon', 'color', 'HAL-MR-001', 28999, 42999, 10, 'https://via.placeholder.com/100?text=Maroon', 2, true),
  (98, 'Dark Brown', 'color', 'HAL-DB-001', 28999, 42999, 14, 'https://via.placeholder.com/100?text=Brown', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (98, 'Perfect for Small Spaces - 32% OFF', 'Space-saving solution', 'percentage', 32, false, 1, true),
  (98, 'Free Assembly Service Included', 'Assembly offer', 'percentage', 0, false, 2, true),
  (98, 'Get ₹2,000 OFF with SBI Cards', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (98, '1-Year Warranty', 12, 1999, 'Manufacturing defects covered', '["manufacturing_defects"]', true),
  (98, '2-Year Protection', 24, 3299, 'Extended coverage with accidental damage', '["manufacturing_defects", "accidental_damage"]', true),
  (98, '3-Year Premium Plan', 36, 4599, 'Complete protection', '["manufacturing_defects", "accidental_damage", "replacement"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (98, 'HDFC', 'Credit Card', 2416, 12, 10, 20000, 2000, '10% off on HDFC', 1, true),
  (98, 'SBI', 'Credit Card', 2416, 12, 8, 15000, 1500, '8% off on SBI', 2, true),
  (98, 'ICICI', 'Debit Card EMI', 2416, 12, 5, 15000, 800, '5% off EMI', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (98, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 2, '600040', true),
  (98, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Chennai 600034', '08045699564', 8, 2, '600034', true),
  (98, 'Spacecrafts Adyar', 'M 49/50, Ground Floor, Adyar, Chennai 600020', '08045699569', 12, 3, '600020', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (98, 'Dimensions', 'Length', '200', 'cm', 1, true),
  (98, 'Dimensions', 'Width', '95', 'cm', 2, true),
  (98, 'Dimensions', 'Height', '75', 'cm', 3, true),
  (98, 'Dimensions', 'Bed Length when Extended', '200', 'cm', 4, true),
  (98, 'Material', 'Upholstery', 'Premium Fabric', NULL, 1, true),
  (98, 'Material', 'Frame', 'Solid Wood', NULL, 2, true),
  (98, 'Weight & Capacity', 'Weight', '120', 'kg', 1, true),
  (98, 'Weight & Capacity', 'Sleeping Capacity', '1', 'person', 2, true),
  (98, 'Features', 'Convertible Bed', 'Yes', NULL, 1, true),
  (98, 'Features', 'Storage', 'No', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 99: Proton Study Desk
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (99, 'Walnut', 'color', 'PRO-WL-001', 9999, 14999, 25, 'https://via.placeholder.com/100?text=Walnut', 1, true),
  (99, 'Oak', 'color', 'PRO-OK-001', 9999, 14999, 20, 'https://via.placeholder.com/100?text=Oak', 2, true),
  (99, 'White Finish', 'color', 'PRO-WH-001', 9999, 14999, 22, 'https://via.placeholder.com/100?text=White', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (99, 'Back to School - Flat 33% OFF', 'Education offer', 'percentage', 33, false, 1, true),
  (99, 'Free Delivery Pan India', 'Shipping offer', 'percentage', 0, false, 2, true),
  (99, 'Student Discount - Extra 10% OFF', 'Valid with student ID', 'percentage', 10, false, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (99, '1-Year Warranty', 12, 999, 'Manufacturing defects', '["manufacturing_defects"]', true),
  (99, '2-Year Extended Warranty', 24, 1799, 'Extended protection', '["manufacturing_defects", "damage"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (99, 'HDFC', 'Credit Card', 833, 12, 5, 10000, 500, '5% off on HDFC', 1, true),
  (99, 'ICICI', 'Credit Card', 833, 12, 5, 10000, 500, '5% off on ICICI', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (99, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 1, '600040', true),
  (99, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 1, '600042', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (99, 'Dimensions', 'Length', '120', 'cm', 1, true),
  (99, 'Dimensions', 'Width', '60', 'cm', 2, true),
  (99, 'Dimensions', 'Height', '75', 'cm', 3, true),
  (99, 'Material', 'Top Material', 'Solid Wood', NULL, 1, true),
  (99, 'Material', 'Frame Material', 'Wood', NULL, 2, true),
  (99, 'Weight & Capacity', 'Weight', '45', 'kg', 1, true),
  (99, 'Weight & Capacity', 'Load Capacity', '150', 'kg', 2, true),
  (99, 'Features', 'Shelves Included', 'Yes', NULL, 1, true),
  (99, 'Features', 'Drawer Count', '3', 'drawers', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 100: Jupiter Bunk Cum Futon Cot
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (100, 'Natural Wood', 'color', 'JUP-NW-001', 19999, 31999, 18, 'https://via.placeholder.com/100?text=Natural', 1, true),
  (100, 'Honey Finish', 'color', 'JUP-HF-001', 19999, 31999, 16, 'https://via.placeholder.com/100?text=Honey', 2, true),
  (100, 'Dark Brown', 'color', 'JUP-DB-001', 19999, 31999, 20, 'https://via.placeholder.com/100?text=Dark+Brown', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (100, 'Space-Saving Bunk Bed - Save 37% Now', 'Multi-functional furniture', 'percentage', 37, false, 1, true),
  (100, 'FREE Installation Service', 'Assembly included', 'percentage', 0, false, 2, true),
  (100, 'Get Up to ₹3,000 OFF with Bank Cards', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (100, '1-Year Warranty', 12, 1999, 'Manufacturing defects covered', '["manufacturing_defects"]', true),
  (100, '2-Year Extended Warranty', 24, 3499, 'Extended coverage', '["manufacturing_defects", "wood_damage"]', true),
  (100, '3-Year Premium Warranty', 36, 4999, 'Complete protection with replacement option', '["manufacturing_defects", "wood_damage", "replacement"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (100, 'HDFC', 'Credit Card', 1666, 12, 10, 15000, 3000, '10% off on HDFC', 1, true),
  (100, 'ICICI', 'Credit Card', 1666, 12, 10, 15000, 2500, '10% off on ICICI', 2, true),
  (100, 'SBI', 'Debit Card EMI', 1666, 12, 5, 10000, 1000, '5% off EMI', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (100, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 3, '600040', true),
  (100, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Chennai 600034', '08045699564', 8, 3, '600034', true),
  (100, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 3, '600042', true),
  (100, 'Spacecrafts Adyar', 'M 49/50, Adyar, Chennai 600020', '08045699569', 12, 4, '600020', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (100, 'Dimensions', 'Length', '210', 'cm', 1, true),
  (100, 'Dimensions', 'Width', '110', 'cm', 2, true),
  (100, 'Dimensions', 'Height', '155', 'cm', 3, true),
  (100, 'Dimensions', 'Lower Bed Size', '90x190', 'cm', 4, true),
  (100, 'Material', 'Material', 'Solid Wood', NULL, 1, true),
  (100, 'Material', 'Finish', 'Lacquered', NULL, 2, true),
  (100, 'Weight & Capacity', 'Weight', '180', 'kg', 1, true),
  (100, 'Weight & Capacity', 'Sleeping Capacity', '2', 'persons', 2, true),
  (100, 'Features', 'Convertible Futon', 'Yes', NULL, 1, true),
  (100, 'Features', 'Storage Compartment', 'Yes', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 101: Luminous Steel Cot
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (101, 'Silver Grey', 'color', 'LUM-SG-001', 7999, 11999, 30, 'https://via.placeholder.com/100?text=Silver', 1, true),
  (101, 'Gunmetal Black', 'color', 'LUM-GB-001', 7999, 11999, 28, 'https://via.placeholder.com/100?text=Black', 2, true),
  (101, 'Bronze', 'color', 'LUM-BR-001', 7999, 11999, 25, 'https://via.placeholder.com/100?text=Bronze', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (101, 'Strong & Durable Steel Cot - 33% OFF', 'Steel furniture sale', 'percentage', 33, false, 1, true),
  (101, 'Free Shipping All Over India', 'Delivery offer', 'percentage', 0, false, 2, true),
  (101, 'Additional ₹500 OFF with HDFC', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (101, '1-Year Warranty', 12, 799, 'Manufacturing defects', '["manufacturing_defects"]', true),
  (101, '2-Year Extended Warranty', 24, 1499, 'Extended protection', '["manufacturing_defects", "rust_protection"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (101, 'HDFC', 'Credit Card', 666, 12, 3, 5000, 500, '3% off on HDFC', 1, true),
  (101, 'ICICI', 'Credit Card', 666, 12, 3, 5000, 400, '3% off on ICICI', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (101, 'Spacecrafts Anna Nagar', 'AA-144, Anna Nagar, Chennai 600040', '08037500352', 7, 1, '600040', true),
  (101, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 1, '600042', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (101, 'Dimensions', 'Length', '200', 'cm', 1, true),
  (101, 'Dimensions', 'Width', '90', 'cm', 2, true),
  (101, 'Dimensions', 'Height', '40', 'cm', 3, true),
  (101, 'Material', 'Material', 'High Grade Steel', NULL, 1, true),
  (101, 'Material', 'Finish', 'Epoxy Powder Coated', NULL, 2, true),
  (101, 'Weight & Capacity', 'Weight', '68', 'kg', 1, true),
  (101, 'Weight & Capacity', 'Load Capacity', '200', 'kg', 2, true),
  (101, 'Features', 'Foldable', 'Yes', NULL, 1, true),
  (101, 'Features', 'With Mattress', 'No', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 102: Sputnic Convertable Wooden Leg Bunk Bed
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (102, 'Light Oak', 'color', 'SPU-LO-001', 24999, 39999, 14, 'https://via.placeholder.com/100?text=Light+Oak', 1, true),
  (102, 'Dark Walnut', 'color', 'SPU-DW-001', 24999, 39999, 12, 'https://via.placeholder.com/100?text=Dark+Walnut', 2, true),
  (102, 'Cherry Wood', 'color', 'SPU-CW-001', 24999, 39999, 16, 'https://via.placeholder.com/100?text=Cherry', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (102, 'Premium Convertable Bunk - 37% OFF', 'Multi-functional bed', 'percentage', 37, false, 1, true),
  (102, 'FREE Assembly & Installation', 'Assembly offer', 'percentage', 0, false, 2, true),
  (102, 'Get ₹3,000 OFF with SBI Cards', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (102, '2-Year Warranty', 24, 2499, 'Manufacturing defects & wood damage', '["manufacturing_defects", "wood_damage"]', true),
  (102, '3-Year Premium Warranty', 36, 3999, 'Extended protection with replacement', '["manufacturing_defects", "wood_damage", "replacement", "color_guarantee"]', true),
  (102, '5-Year Ultimate Warranty', 60, 5999, 'Ultimate peace of mind', '["manufacturing_defects", "wood_damage", "replacement", "color_guarantee", "structural"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (102, 'HDFC', 'Credit Card', 2083, 12, 10, 20000, 3000, '10% off on HDFC', 1, true),
  (102, 'SBI', 'Credit Card', 2083, 12, 12, 25000, 3500, '12% off on SBI', 2, true),
  (102, 'ICICI', 'Credit Card', 2083, 12, 10, 20000, 2500, '10% off on ICICI', 3, true),
  (102, 'Axis', 'Debit Card EMI', 2083, 12, 5, 15000, 1000, '5% off EMI', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (102, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 4, '600040', true),
  (102, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Chennai 600034', '08045699564', 8, 4, '600034', true),
  (102, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 4, '600042', true),
  (102, 'Spacecrafts Adyar', 'M 49/50, Adyar, Chennai 600020', '08045699569', 12, 5, '600020', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (102, 'Dimensions', 'Length', '210', 'cm', 1, true),
  (102, 'Dimensions', 'Width', '110', 'cm', 2, true),
  (102, 'Dimensions', 'Height', '160', 'cm', 3, true),
  (102, 'Dimensions', 'Bed Width', '95', 'cm', 4, true),
  (102, 'Material', 'Material', 'Solid Wood', NULL, 1, true),
  (102, 'Material', 'Wooden Legs', 'Yes', NULL, 2, true),
  (102, 'Material', 'Finish Type', 'Lacquered Polish', NULL, 3, true),
  (102, 'Weight & Capacity', 'Weight', '200', 'kg', 1, true),
  (102, 'Weight & Capacity', 'Total Capacity', '400', 'kg', 2, true),
  (102, 'Features', 'Convertible Design', 'Yes', NULL, 1, true),
  (102, 'Features', 'Storage Drawer', 'Yes', NULL, 2, true),
  (102, 'Assembly', 'Assembly Required', 'Yes', NULL, 1, true),
  (102, 'Assembly', 'Assembly Time', '3-4 hours', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 103: Rainbow Convertable Bunk Bed
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (103, 'Classic Brown', 'color', 'RBW-CB-001', 22999, 36999, 17, 'https://via.placeholder.com/100?text=Brown', 1, true),
  (103, 'Modern Grey', 'color', 'RBW-MG-001', 22999, 36999, 19, 'https://via.placeholder.com/100?text=Grey', 2, true),
  (103, 'Natural Teak', 'color', 'RBW-NT-001', 22999, 36999, 15, 'https://via.placeholder.com/100?text=Teak', 3, true),
  (103, 'White', 'color', 'RBW-WH-001', 22999, 36999, 13, 'https://via.placeholder.com/100?text=White', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (103, 'Rainbow Bunk Bed - 37% Discount', 'Budget-friendly option', 'percentage', 37, false, 1, true),
  (103, 'FREE Mattresses Worth ₹8,000', 'Combo offer', 'percentage', 0, false, 2, true),
  (103, 'Extra 15% OFF with Student ID', 'Student offer', 'percentage', 15, false, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (103, '1-Year Basic Warranty', 12, 1699, 'Manufacturing defects', '["manufacturing_defects"]', true),
  (103, '2-Year Standard Warranty', 24, 2899, 'Extended coverage', '["manufacturing_defects", "wood_damage"]', true),
  (103, '3-Year Premium Warranty', 36, 4299, 'Premium protection with replacement', '["manufacturing_defects", "wood_damage", "replacement"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (103, 'HDFC', 'Credit Card', 1916, 12, 10, 20000, 2500, '10% off on HDFC', 1, true),
  (103, 'ICICI', 'Credit Card', 1916, 12, 8, 15000, 2000, '8% off on ICICI', 2, true),
  (103, 'Axis', 'Credit Card', 1916, 12, 5, 10000, 800, '5% off on Axis', 3, true),
  (103, 'SBI', 'Debit Card EMI', 1916, 12, 3, 10000, 500, '3% off EMI', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (103, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 3, '600040', true),
  (103, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Chennai 600034', '08045699564', 8, 3, '600034', true),
  (103, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 3, '600042', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (103, 'Dimensions', 'Total Length', '210', 'cm', 1, true),
  (103, 'Dimensions', 'Total Width', '110', 'cm', 2, true),
  (103, 'Dimensions', 'Total Height', '155', 'cm', 3, true),
  (103, 'Dimensions', 'Each Bed Size', '90x190', 'cm', 4, true),
  (103, 'Material', 'Material Type', 'Solid Wood', NULL, 1, true),
  (103, 'Material', 'Wood Type', 'Mixed Wood', NULL, 2, true),
  (103, 'Material', 'Finish', 'Natural Polish', NULL, 3, true),
  (103, 'Weight & Capacity', 'Total Weight', '180', 'kg', 1, true),
  (103, 'Weight & Capacity', 'Per Bed Capacity', '200', 'kg', 2, true),
  (103, 'Features', 'Convertible', 'Yes', NULL, 1, true),
  (103, 'Features', 'Storage Shelves', 'Yes', NULL, 2, true),
  (103, 'Features', 'Guardrails', 'Yes', NULL, 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT 104: Zenith Rocking Easy Chair
-- ============================================================

INSERT INTO product_variants (product_id, variant_name, variant_type, sku, price, mrp, stock, image_url, position, is_active)
VALUES 
  (104, 'Premium Brown', 'color', 'ZEN-PB-001', 15999, 24999, 20, 'https://via.placeholder.com/100?text=Brown', 1, true),
  (104, 'Modern Black', 'color', 'ZEN-MB-001', 15999, 24999, 18, 'https://via.placeholder.com/100?text=Black', 2, true),
  (104, 'Comfort Grey', 'color', 'ZEN-CG-001', 15999, 24999, 22, 'https://via.placeholder.com/100?text=Grey', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_offers (product_id, title, description, offer_type, discount_percent, is_limited_time, position, is_active)
VALUES 
  (104, 'Relaxation Starts Here - 36% OFF', 'Comfort furniture', 'percentage', 36, false, 1, true),
  (104, 'FREE Neck Pillow with Purchase', 'Bundle offer', 'percentage', 0, false, 2, true),
  (104, 'Get ₹1,500 OFF with ICICI Cards', 'Bank offer', 'fixed', NULL, true, 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, is_active)
VALUES 
  (104, '1-Year Warranty', 12, 1299, 'Manufacturing defects covered', '["manufacturing_defects"]', true),
  (104, '2-Year Extended Warranty', 24, 2299, 'Extended protection from wear & tear', '["manufacturing_defects", "wear_tear"]', true),
  (104, '3-Year Premium Warranty', 36, 3499, 'Complete coverage with replacement option', '["manufacturing_defects", "wear_tear", "replacement"]', true)
ON CONFLICT DO NOTHING;

INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, discount_percent, min_purchase, max_discount, description, position, is_active)
VALUES 
  (104, 'HDFC', 'Credit Card', 1333, 12, 8, 15000, 1500, '8% off on HDFC', 1, true),
  (104, 'ICICI', 'Credit Card', 1333, 12, 10, 15000, 2000, '10% off on ICICI', 2, true),
  (104, 'SBI', 'Credit Card', 1333, 12, 5, 10000, 800, '5% off on SBI', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, pincode, is_active)
VALUES 
  (104, 'Spacecrafts Anna Nagar', 'AA-144, Ground floor, Anna Nagar, Chennai 600040', '08037500352', 7, 2, '600040', true),
  (104, 'Spacecrafts KNK Road', '7, Khader Nawaz Khan Rd, Chennai 600034', '08045699564', 8, 2, '600034', true),
  (104, 'Spacecrafts Velachery', '181A, Velachery, Chennai 600042', '08037500365', 10, 2, '600042', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, unit, position, is_active)
VALUES 
  (104, 'Dimensions', 'Length', '75', 'cm', 1, true),
  (104, 'Dimensions', 'Width', '85', 'cm', 2, true),
  (104, 'Dimensions', 'Height', '95', 'cm', 3, true),
  (104, 'Dimensions', 'Seat Height', '45', 'cm', 4, true),
  (104, 'Material', 'Upholstery', 'Premium Fabric', NULL, 1, true),
  (104, 'Material', 'Frame Material', 'Solid Wood', NULL, 2, true),
  (104, 'Material', 'Base Material', 'Wood with Rockers', NULL, 3, true),
  (104, 'Weight & Capacity', 'Weight', '35', 'kg', 1, true),
  (104, 'Weight & Capacity', 'Max Load', '200', 'kg', 2, true),
  (104, 'Features', 'Rocking Feature', 'Yes', NULL, 1, true),
  (104, 'Features', 'Reclinable', 'No', NULL, 2, true),
  (104, 'Features', 'Removable Covers', 'Yes', NULL, 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- UPDATE ALL PRODUCTS WITH ADDITIONAL FIELDS
-- ============================================================

UPDATE products SET 
  emi_enabled = true,
  warranty_type = 'Premium',
  care_instructions = 'Dry clean only. Keep away from direct sunlight. Use soft brush for regular cleaning. Avoid sharp objects.',
  return_days = 30,
  assurance_badge = 'Assured',
  is_limited_stock = false
WHERE id IN (96, 97, 98, 99, 100, 101, 102, 103, 104);

-- ============================================================
-- VERIFICATION QUERIES (Uncomment to check)
-- ============================================================

-- Check all products updated:
-- SELECT id, name, emi_enabled, warranty_type FROM products WHERE id IN (96, 97, 98, 99, 100, 101, 102, 103, 104);

-- Check variants count by product:
-- SELECT product_id, COUNT(*) as variant_count FROM product_variants WHERE product_id IN (96, 97, 98, 99, 100, 101, 102, 103, 104) GROUP BY product_id;

-- Check offers count by product:
-- SELECT product_id, COUNT(*) as offer_count FROM product_offers WHERE product_id IN (96, 97, 98, 99, 100, 101, 102, 103, 104) GROUP BY product_id;

-- Check warranty count by product:
-- SELECT product_id, COUNT(*) as warranty_count FROM warranty_options WHERE product_id IN (96, 97, 98, 99, 100, 101, 102, 103, 104) GROUP BY product_id;
