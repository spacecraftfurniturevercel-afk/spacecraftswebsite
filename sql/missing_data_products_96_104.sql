-- Missing Data for Products 96-104
-- This script adds: variants, offers, warranties, EMI options, stores, and specifications

-- ==================== PRODUCT VARIANTS ====================
INSERT INTO product_variants (product_id, variant_name, variant_type, price, stock, image_url, created_at) 
VALUES
-- Product 96: Nova Sofa Bed Without Storage
(96, 'Sandy Brown', 'color', 21186.00, 15, '/products/96/sandy-brown.jpg', NOW()),
(96, 'Grey', 'color', 21186.00, 12, '/products/96/grey.jpg', NOW()),
(96, 'Navy Blue', 'color', 21186.00, 10, '/products/96/navy-blue.jpg', NOW()),
(96, 'Charcoal Black', 'color', 21186.00, 8, '/products/96/charcoal-black.jpg', NOW()),

-- Product 97: Voyager NEC Chair
(97, 'Black with Grey Cushion', 'color', 3500.00, 20, '/products/97/black-grey.jpg', NOW()),
(97, 'Brown with Beige Cushion', 'color', 3500.00, 18, '/products/97/brown-beige.jpg', NOW()),
(97, 'White with Blue Cushion', 'color', 3500.00, 16, '/products/97/white-blue.jpg', NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'Light Beige', 'color', 8305.00, 14, '/products/98/light-beige.jpg', NOW()),
(98, 'Dark Grey', 'color', 8305.00, 12, '/products/98/dark-grey.jpg', NOW()),
(98, 'Charcoal', 'color', 8305.00, 10, '/products/98/charcoal.jpg', NOW()),
(98, 'Cream', 'color', 8305.00, 9, '/products/98/cream.jpg', NOW()),

-- Product 99: Proton Study Desk
(99, 'Natural Wood', 'color', 5400.00, 16, '/products/99/natural-wood.jpg', NOW()),
(99, 'Walnut Brown', 'color', 5400.00, 14, '/products/99/walnut-brown.jpg', NOW()),
(99, 'White Laminate', 'color', 5400.00, 12, '/products/99/white-laminate.jpg', NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'Black Powder-Coated', 'color', 29661.00, 8, '/products/100/black-powdered.jpg', NOW()),
(100, 'Grey Powder-Coated', 'color', 29661.00, 7, '/products/100/grey-powdered.jpg', NOW()),
(100, 'Silver Powder-Coated', 'color', 29661.00, 6, '/products/100/silver-powdered.jpg', NOW()),
(100, 'White Powder-Coated', 'color', 29661.00, 5, '/products/100/white-powdered.jpg', NOW()),

-- Product 101: Luminous Steel Cot
(101, 'Matte Black', 'color', 22373.00, 12, '/products/101/matte-black.jpg', NOW()),
(101, 'Brushed Silver', 'color', 22373.00, 10, '/products/101/brushed-silver.jpg', NOW()),
(101, 'Gunmetal Grey', 'color', 22373.00, 8, '/products/101/gunmetal-grey.jpg', NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'Honey Wood with Black Frame', 'color', 26949.00, 9, '/products/102/honey-black.jpg', NOW()),
(102, 'Walnut Wood with Silver Frame', 'color', 26949.00, 8, '/products/102/walnut-silver.jpg', NOW()),
(102, 'Oak Wood with Grey Frame', 'color', 26949.00, 7, '/products/102/oak-grey.jpg', NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'Black Metal', 'color', 21017.00, 11, '/products/103/black-metal.jpg', NOW()),
(103, 'Silver Metal', 'color', 21017.00, 10, '/products/103/silver-metal.jpg', NOW()),
(103, 'White Metal', 'color', 21017.00, 9, '/products/103/white-metal.jpg', NOW()),
(103, 'Grey Metal', 'color', 21017.00, 8, '/products/103/grey-metal.jpg', NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'Black Frame with Grey Fabric', 'color', 10085.00, 13, '/products/104/black-grey.jpg', NOW()),
(104, 'Silver Frame with Beige Fabric', 'color', 10085.00, 11, '/products/104/silver-beige.jpg', NOW()),
(104, 'Bronze Frame with Blue Fabric', 'color', 10085.00, 10, '/products/104/bronze-blue.jpg', NOW())
ON CONFLICT (product_id, variant_name) DO NOTHING;

-- ==================== PRODUCT OFFERS ====================
INSERT INTO product_offers (product_id, title, offer_type, discount_amount, discount_percent, valid_from, valid_until, created_at)
VALUES
-- Product 96: Nova Sofa Bed
(96, 'Bank Offer: 5% cashback on HDFC Credit Cards', 'bank', NULL, 5, NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', NOW()),
(96, 'Limited Time: Extra 5% off on orders above 20000', 'limited_time', NULL, 5, NOW(), NOW() + INTERVAL '15 days', NOW()),
(96, 'Free Delivery on orders above 25000', 'delivery', 2000, NULL, NOW() - INTERVAL '15 days', NOW() + INTERVAL '60 days', NOW()),
(96, 'Loyalty Program: 3% discount for repeat customers', 'loyalty', NULL, 3, NOW() - INTERVAL '60 days', NOW() + INTERVAL '365 days', NOW()),

-- Product 97: Voyager NEC Chair
(97, 'Bank Offer: 5% discount on SBI Debit Cards', 'bank', NULL, 5, NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', NOW()),
(97, 'Bundle Offer: Buy 2 get 500 off', 'bundle', 500, NULL, NOW(), NOW() + INTERVAL '20 days', NOW()),
(97, 'Weekend Special: 10% off on purchases', 'weekend', NULL, 10, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', NOW()),
(97, 'Seasonal Discount: 2% off on all folding chairs', 'seasonal', NULL, 2, NOW() - INTERVAL '90 days', NOW() + INTERVAL '180 days', NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'Bank Offer: 5% cashback on Axis Bank Cards', 'bank', NULL, 5, NOW() - INTERVAL '25 days', NOW() + INTERVAL '85 days', NOW()),
(98, 'Flash Sale: 8% off for limited hours', 'flash', NULL, 8, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NOW()),
(98, 'Free Accessories: Pillows & Cushions worth 1500', 'bundle', 1500, NULL, NOW() - INTERVAL '20 days', NOW() + INTERVAL '70 days', NOW()),
(98, 'Referral Program: 4% off when referred by existing customer', 'referral', NULL, 4, NOW() - INTERVAL '45 days', NOW() + INTERVAL '365 days', NOW()),

-- Product 99: Proton Study Desk
(99, 'Bank Offer: 5% discount on ICICI Credit Cards', 'bank', NULL, 5, NOW() - INTERVAL '35 days', NOW() + INTERVAL '95 days', NOW()),
(99, 'Back to School: 12% off on study furniture', 'seasonal', NULL, 12, NOW() - INTERVAL '10 days', NOW() + INTERVAL '45 days', NOW()),
(99, 'Free Assembly: Professional assembly at no extra cost', 'service', 800, NULL, NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', NOW()),
(99, 'Office Supplies Combo: Get 6% off when buying with accessories', 'bundle', NULL, 6, NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'Bank Offer: 5% cashback on AmEx Cards', 'bank', NULL, 5, NOW() - INTERVAL '20 days', NOW() + INTERVAL '80 days', NOW()),
(100, 'Year-End Sale: 15% off on bunk beds', 'seasonal', NULL, 15, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW()),
(100, 'Free Delivery & Installation worth 3000', 'delivery', 3000, NULL, NOW() - INTERVAL '45 days', NOW() + INTERVAL '100 days', NOW()),
(100, 'Family Package: 7% off when buying multiple beds', 'bundle', NULL, 7, NOW() - INTERVAL '60 days', NOW() + INTERVAL '180 days', NOW()),

-- Product 101: Luminous Steel Cot
(101, 'Bank Offer: 5% discount on Standard Chartered Cards', 'bank', NULL, 5, NOW() - INTERVAL '28 days', NOW() + INTERVAL '88 days', NOW()),
(101, 'New Year Special: 10% off on all steel furniture', 'seasonal', NULL, 10, NOW() - INTERVAL '15 days', NOW() + INTERVAL '50 days', NOW()),
(101, 'Free Mattress: Premium mattress worth 2500 included', 'bundle', 2500, NULL, NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', NOW()),
(101, 'Customer Appreciation: 5% off for first-time buyers', 'loyalty', NULL, 5, NOW() - INTERVAL '90 days', NOW() + INTERVAL '365 days', NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'Bank Offer: 5% cashback on HDFC Debit Cards', 'bank', NULL, 5, NOW() - INTERVAL '22 days', NOW() + INTERVAL '82 days', NOW()),
(102, 'Children''s Furniture Sale: 12% off on all bunk beds', 'seasonal', NULL, 12, NOW() - INTERVAL '8 days', NOW() + INTERVAL '40 days', NOW()),
(102, 'Free Bedding: Complete bedding set worth 2800', 'bundle', 2800, NULL, NOW() - INTERVAL '35 days', NOW() + INTERVAL '95 days', NOW()),
(102, 'Bulk Purchase: 8% off when buying multiple units', 'bulk', NULL, 8, NOW() - INTERVAL '50 days', NOW() + INTERVAL '150 days', NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'Bank Offer: 5% discount on ICICI Debit Cards', 'bank', NULL, 5, NOW() - INTERVAL '32 days', NOW() + INTERVAL '92 days', NOW()),
(103, 'Monsoon Special: 11% off on indoor furniture', 'seasonal', NULL, 11, NOW() - INTERVAL '12 days', NOW() + INTERVAL '48 days', NOW()),
(103, 'Free Accessories: Safety rails & ladders included', 'bundle', 2200, NULL, NOW() - INTERVAL '40 days', NOW() + INTERVAL '100 days', NOW()),
(103, 'Warranty Extension: 6% off when purchasing extended warranty', 'warranty', NULL, 6, NOW() - INTERVAL '75 days', NOW() + INTERVAL '365 days', NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'Bank Offer: 5% cashback on Axis Debit Cards', 'bank', NULL, 5, NOW() - INTERVAL '18 days', NOW() + INTERVAL '78 days', NOW()),
(104, 'Comfort Zone: 10% off on all relaxation furniture', 'category', NULL, 10, NOW() - INTERVAL '6 days', NOW() + INTERVAL '35 days', NOW()),
(104, 'Free Rocking Cushion: Premium cushion set worth 1000', 'bundle', 1000, NULL, NOW() - INTERVAL '25 days', NOW() + INTERVAL '85 days', NOW()),
(104, 'Senior Citizen: 5% additional discount for senior citizens', 'loyalty', NULL, 5, NOW() - INTERVAL '100 days', NOW() + INTERVAL '365 days', NOW())
ON CONFLICT DO NOTHING;

-- ==================== WARRANTY OPTIONS ====================
INSERT INTO warranty_options (product_id, warranty_name, warranty_months, price, description, coverage_types, created_at)
VALUES
-- Product 96: Nova Sofa Bed
(96, 'Standard Warranty', 12, 0, 'Covers manufacturing defects and structural issues', 'Manufacturing defects coverage for 1 year', NOW()),
(96, 'Extended Protection Plan', 24, 2499, 'Extended 2-year protection including accidental damage', 'Covers fabric damage, zipper failures, and springs', NOW()),
(96, 'Premium Care Protection', 36, 4999, 'Full 3-year protection with free repairs and replacements', 'Comprehensive coverage including wear & tear, damage, and replacements', NOW()),

-- Product 97: Voyager NEC Chair
(97, 'Basic Warranty', 12, 0, 'Standard 1-year manufacturing warranty', 'Frame defects and welding issues', NOW()),
(97, 'Extended Durability Plan', 24, 999, 'Extended 2-year warranty with component replacements', 'Fabric damage, cushion degradation, and frame issues', NOW()),
(97, 'Lifetime Frame Warranty', 60, 1999, '5-year protection with frame lifetime guarantee', 'Lifetime protection on metal frame', NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'Standard Coverage', 12, 0, 'Basic 1-year manufacturer warranty', 'Manufacturing defects and construction issues', NOW()),
(98, 'Enhanced Protection', 24, 1999, '2-year extended protection plan', 'Fabric, springs, and mechanism defects', NOW()),
(98, 'Supreme Care Plan', 36, 3999, 'Full 3-year protection with annual maintenance', 'All-inclusive coverage with service visits', NOW()),

-- Product 99: Proton Study Desk
(99, 'Standard Warranty', 12, 0, '1-year basic warranty', 'Structural defects and laminate peeling', NOW()),
(99, 'Enhanced Durability', 24, 1499, '2-year extended warranty with scratch repair', 'Scratch protection and component failures', NOW()),
(99, 'Premium Guarantee', 36, 2499, '3-year comprehensive protection', 'Complete coverage with replacement parts', NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'Standard Warranty', 12, 0, '1-year basic manufacturing warranty', 'Frame welding and joint failures', NOW()),
(100, 'Extended Metal Coverage', 24, 2999, '2-year extended warranty with rust protection', 'Rust protection and powder coat peeling', NOW()),
(100, 'Ultimate Protection Plan', 36, 5999, '3-year comprehensive protection plan', 'Complete coverage including mattress and springs', NOW()),

-- Product 101: Luminous Steel Cot
(101, 'Standard Warranty', 12, 0, '1-year basic warranty', 'Structural and welding defects', NOW()),
(101, 'Extended Steel Protection', 24, 2499, '2-year extended warranty with anti-rust coating', 'Rust prevention and coating protection', NOW()),
(101, 'Premium Durability Plan', 36, 4499, '3-year full protection plan', 'All-inclusive maintenance and repairs', NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'Standard Warranty', 12, 0, '1-year basic warranty', 'Wood defects and joint failures', NOW()),
(102, 'Extended Wood Care', 24, 2299, '2-year extended care plan', 'Wood treatment, joint strengthening, paint touch-ups', NOW()),
(102, 'Premium Protection Plus', 36, 4299, '3-year comprehensive protection', 'Complete coverage with wood restoration', NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'Standard Warranty', 12, 0, '1-year basic warranty', 'Frame defects and paint issues', NOW()),
(103, 'Enhanced Metal Coverage', 24, 1999, '2-year extended warranty with reinforcement', 'Rust protection and joint reinforcement', NOW()),
(103, 'Ultimate Peace of Mind', 36, 3999, '3-year comprehensive protection plan', 'Complete coverage with replacements', NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'Standard Warranty', 12, 0, '1-year basic warranty', 'Frame defects and cushion issues', NOW()),
(104, 'Extended Comfort Plan', 24, 1799, '2-year extended warranty with comfort guarantee', 'Cushion replacement and frame reinforcement', NOW()),
(104, 'Premium Relaxation Guarantee', 36, 3299, '3-year full protection plan', 'Complete coverage including fabric and mechanism', NOW())
ON CONFLICT (product_id, warranty_months) DO NOTHING;

-- ==================== EMI OPTIONS ====================
INSERT INTO emi_options (product_id, bank_name, card_type, emi_monthly, tenure_months, created_at)
VALUES
-- Product 96: Nova Sofa Bed
(96, 'HDFC Bank', 'credit', 1765.50, 12, NOW()),
(96, 'ICICI Bank', 'credit', 1765.50, 12, NOW()),
(96, 'SBI Bank', 'debit', 1765.50, 12, NOW()),
(96, 'Axis Bank', 'credit', 1059.30, 20, NOW()),
(96, 'AmEx', 'credit', 883.20, 24, NOW()),

-- Product 97: Voyager NEC Chair
(97, 'HDFC Bank', 'credit', 291.67, 12, NOW()),
(97, 'ICICI Bank', 'debit', 291.67, 12, NOW()),
(97, 'SBI Bank', 'credit', 291.67, 12, NOW()),
(97, 'Axis Bank', 'debit', 175, 20, NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'HDFC Bank', 'credit', 692.08, 12, NOW()),
(98, 'ICICI Bank', 'credit', 692.08, 12, NOW()),
(98, 'SBI Bank', 'debit', 692.08, 12, NOW()),
(98, 'Axis Bank', 'credit', 415.25, 20, NOW()),
(98, 'AmEx', 'credit', 346.04, 24, NOW()),

-- Product 99: Proton Study Desk
(99, 'HDFC Bank', 'credit', 450, 12, NOW()),
(99, 'ICICI Bank', 'debit', 450, 12, NOW()),
(99, 'SBI Bank', 'credit', 450, 12, NOW()),
(99, 'Axis Bank', 'credit', 270, 20, NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'HDFC Bank', 'credit', 2471.75, 12, NOW()),
(100, 'ICICI Bank', 'credit', 2471.75, 12, NOW()),
(100, 'SBI Bank', 'debit', 2471.75, 12, NOW()),
(100, 'Axis Bank', 'credit', 1483.05, 20, NOW()),
(100, 'AmEx', 'credit', 1235.88, 24, NOW()),

-- Product 101: Luminous Steel Cot
(101, 'HDFC Bank', 'credit', 1864.42, 12, NOW()),
(101, 'ICICI Bank', 'debit', 1864.42, 12, NOW()),
(101, 'SBI Bank', 'credit', 1864.42, 12, NOW()),
(101, 'Axis Bank', 'credit', 1118.65, 20, NOW()),
(101, 'AmEx', 'credit', 932.21, 24, NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'HDFC Bank', 'credit', 2245.75, 12, NOW()),
(102, 'ICICI Bank', 'debit', 2245.75, 12, NOW()),
(102, 'SBI Bank', 'credit', 2245.75, 12, NOW()),
(102, 'Axis Bank', 'credit', 1347.45, 20, NOW()),
(102, 'AmEx', 'credit', 1122.88, 24, NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'HDFC Bank', 'credit', 1751.42, 12, NOW()),
(103, 'ICICI Bank', 'debit', 1751.42, 12, NOW()),
(103, 'SBI Bank', 'credit', 1751.42, 12, NOW()),
(103, 'Axis Bank', 'credit', 1050.85, 20, NOW()),
(103, 'AmEx', 'credit', 875.71, 24, NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'HDFC Bank', 'credit', 840.42, 12, NOW()),
(104, 'ICICI Bank', 'debit', 840.42, 12, NOW()),
(104, 'SBI Bank', 'credit', 840.42, 12, NOW()),
(104, 'Axis Bank', 'credit', 504.25, 20, NOW()),
(104, 'AmEx', 'credit', 420.21, 24, NOW())
ON CONFLICT DO NOTHING;

-- ==================== PRODUCT STORES ====================
INSERT INTO product_stores (product_id, store_name, address, phone, distance_km, delivery_days, created_at)
VALUES
-- Product 96: Nova Sofa Bed
(96, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 2, NOW()),
(96, 'Spacecrafts Furniture - Mumbai South', '123 Fort Street, South Mumbai', '+91-22-1234-5602', 8.3, 3, NOW()),
(96, 'Spacecrafts Furniture - Pune', '567 MG Road, Pune', '+91-20-1234-5603', 0.8, 2, NOW()),

-- Product 97: Voyager NEC Chair
(97, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 1, NOW()),
(97, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 2, NOW()),
(97, 'Spacecrafts Furniture - Pune', '567 MG Road, Pune', '+91-20-1234-5603', 0.8, 1, NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'Spacecrafts Furniture - Mumbai South', '123 Fort Street, South Mumbai', '+91-22-1234-5602', 8.3, 3, NOW()),
(98, 'Spacecrafts Furniture - Pune', '567 MG Road, Pune', '+91-20-1234-5603', 0.8, 2, NOW()),
(98, 'Spacecrafts Furniture - Nagpur', '890 Wardha Road, Nagpur', '+91-712-1234-5605', 1.5, 4, NOW()),
(98, 'Spacecrafts Furniture - Aurangabad', '345 Jalna Road, Aurangabad', '+91-240-1234-5606', 2.1, 5, NOW()),

-- Product 99: Proton Study Desk
(99, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 1, NOW()),
(99, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 2, NOW()),
(99, 'Spacecrafts Furniture - Delhi', '789 Connaught Place, Delhi', '+91-11-1234-5607', 4.5, 3, NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 3, NOW()),
(100, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 4, NOW()),
(100, 'Spacecrafts Furniture - Chennai', '456 Mount Road, Chennai', '+91-44-1234-5608', 5.8, 5, NOW()),
(100, 'Spacecrafts Furniture - Hyderabad', '678 Banjara Hills, Hyderabad', '+91-40-1234-5609', 3.9, 4, NOW()),

-- Product 101: Luminous Steel Cot
(101, 'Spacecrafts Furniture - Mumbai South', '123 Fort Street, South Mumbai', '+91-22-1234-5602', 8.3, 2, NOW()),
(101, 'Spacecrafts Furniture - Pune', '567 MG Road, Pune', '+91-20-1234-5603', 0.8, 2, NOW()),
(101, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 3, NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 4, NOW()),
(102, 'Spacecrafts Furniture - Delhi', '789 Connaught Place, Delhi', '+91-11-1234-5607', 4.5, 5, NOW()),
(102, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 4, NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 3, NOW()),
(103, 'Spacecrafts Furniture - Pune', '567 MG Road, Pune', '+91-20-1234-5603', 0.8, 2, NOW()),
(103, 'Spacecrafts Furniture - Nagpur', '890 Wardha Road, Nagpur', '+91-712-1234-5605', 1.5, 4, NOW()),
(103, 'Spacecrafts Furniture - Aurangabad', '345 Jalna Road, Aurangabad', '+91-240-1234-5606', 2.1, 5, NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'Spacecrafts Furniture - Mumbai Central', 'Plot 45, Marine Drive, Mumbai', '+91-22-1234-5601', 2.5, 2, NOW()),
(104, 'Spacecrafts Furniture - Bangalore', '234 Residency Road, Bangalore', '+91-80-1234-5604', 3.2, 3, NOW()),
(104, 'Spacecrafts Furniture - Chennai', '456 Mount Road, Chennai', '+91-44-1234-5608', 5.8, 4, NOW())
ON CONFLICT DO NOTHING;

-- ==================== PRODUCT SPECIFICATIONS ====================
INSERT INTO product_specifications (product_id, spec_category, spec_name, spec_value, created_at)
VALUES
-- Product 96: Nova Sofa Bed Without Storage
(96, 'Dimensions', 'Length', '190 cm', NOW()),
(96, 'Dimensions', 'Width', '90 cm', NOW()),
(96, 'Dimensions', 'Height', '85 cm', NOW()),
(96, 'Dimensions', 'Bed Length', '190 cm', NOW()),
(96, 'Dimensions', 'Bed Width', '140 cm', NOW()),
(96, 'Material', 'Material', 'Fabric Upholstery, Hardwood & Metal Frame', NOW()),
(96, 'Material', 'Fabric Type', 'Premium Polyester Blend', NOW()),
(96, 'Material', 'Frame Material', 'Hardwood with Metal Reinforcement', NOW()),
(96, 'Weight', 'Weight Capacity', '300 kg (Sofa), 250 kg (Bed)', NOW()),
(96, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(96, 'Assembly', 'Assembly Time', '2-3 hours', NOW()),
(96, 'Features', 'Folding Mechanism', 'Smooth Pull-Out', NOW()),
(96, 'Features', 'Storage Compartment', 'No', NOW()),
(96, 'Features', 'Mattress Type', 'Spring Mattress', NOW()),

-- Product 97: Voyager NEC Chair
(97, 'Dimensions', 'Length', '65 cm', NOW()),
(97, 'Dimensions', 'Width', '60 cm', NOW()),
(97, 'Dimensions', 'Height', '95 cm', NOW()),
(97, 'Dimensions', 'Seating Height', '45 cm', NOW()),
(97, 'Material', 'Material', 'Powder-Coated Metal Frame, Cushioned Fabric Seat', NOW()),
(97, 'Material', 'Frame Material', 'Powder-Coated Steel', NOW()),
(97, 'Material', 'Seat Material', 'High-Density Foam with Fabric Cover', NOW()),
(97, 'Weight', 'Weight Capacity', '150 kg', NOW()),
(97, 'Weight', 'Chair Weight', '8 kg', NOW()),
(97, 'Assembly', 'Assembly Required', 'Minimal', NOW()),
(97, 'Features', 'Foldable', 'Yes', NOW()),
(97, 'Features', 'Folded Dimensions', '60 x 30 x 20 cm', NOW()),
(97, 'Features', 'Armrests', 'Yes', NOW()),

-- Product 98: Halley Sofa Cum Bed Single
(98, 'Dimensions', 'Length', '180 cm', NOW()),
(98, 'Dimensions', 'Width', '85 cm', NOW()),
(98, 'Dimensions', 'Height', '80 cm', NOW()),
(98, 'Dimensions', 'Bed Length', '180 cm', NOW()),
(98, 'Dimensions', 'Bed Width', '110 cm', NOW()),
(98, 'Material', 'Material', 'Fabric Upholstery, Hardwood & Metal Frame', NOW()),
(98, 'Material', 'Fabric Type', 'Cotton-Polyester Blend', NOW()),
(98, 'Weight', 'Weight Capacity', '280 kg', NOW()),
(98, 'Features', 'Storage Compartment', 'Optional (Available models)', NOW()),
(98, 'Features', 'Folding Mechanism', 'Simple Pull-Out', NOW()),
(98, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(98, 'Assembly', 'Assembly Time', '2 hours', NOW()),

-- Product 99: Proton Study Desk
(99, 'Dimensions', 'Length', '120 cm', NOW()),
(99, 'Dimensions', 'Width', '60 cm', NOW()),
(99, 'Dimensions', 'Height', '75 cm', NOW()),
(99, 'Dimensions', 'Surface Area', '0.72 sqm', NOW()),
(99, 'Material', 'Material', 'Engineered Wood with Laminate Finish', NOW()),
(99, 'Material', 'Frame', 'Metal with Powder-Coating', NOW()),
(99, 'Weight', 'Weight Capacity', '60 kg', NOW()),
(99, 'Weight', 'Desk Weight', '25 kg', NOW()),
(99, 'Features', 'Storage Shelves', '2 Built-in Shelves', NOW()),
(99, 'Features', 'Drawers', '2 Storage Drawers', NOW()),
(99, 'Features', 'Cable Management', 'Yes', NOW()),
(99, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(99, 'Assembly', 'Assembly Time', '1.5 hours', NOW()),

-- Product 100: Jupiter Bunk Cum Futon Cot
(100, 'Dimensions', 'Length', '200 cm', NOW()),
(100, 'Dimensions', 'Width', '100 cm', NOW()),
(100, 'Dimensions', 'Height', '170 cm', NOW()),
(100, 'Material', 'Material', 'Powder-Coated Steel Frame, Fabric Futon Mattress', NOW()),
(100, 'Material', 'Frame Material', 'High-Grade Steel Powder-Coated', NOW()),
(100, 'Material', 'Futon Material', 'Cotton-Polyester with Memory Foam', NOW()),
(100, 'Weight', 'Weight Capacity', '200 kg per level', NOW()),
(100, 'Weight', 'Total Weight', '95 kg', NOW()),
(100, 'Dimensions', 'Upper Bunk Length', '190 cm', NOW()),
(100, 'Dimensions', 'Upper Bunk Width', '90 cm', NOW()),
(100, 'Dimensions', 'Futon Length', '190 cm', NOW()),
(100, 'Dimensions', 'Futon Width', '90 cm', NOW()),
(100, 'Features', 'Safety Rails', 'Yes', NOW()),
(100, 'Features', 'Ladder Type', 'Metal with Rubber Steps', NOW()),
(100, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(100, 'Assembly', 'Assembly Time', '3-4 hours', NOW()),

-- Product 101: Luminous Steel Cot
(101, 'Dimensions', 'Length', '200 cm', NOW()),
(101, 'Dimensions', 'Width', '160 cm', NOW()),
(101, 'Dimensions', 'Height', '95 cm', NOW()),
(101, 'Material', 'Material', 'Steel Frame with Storage Options', NOW()),
(101, 'Material', 'Frame Quality', 'High-Grade Mild Steel', NOW()),
(101, 'Material', 'Storage Type', 'Under-bed Drawers', NOW()),
(101, 'Weight', 'Weight Capacity', '350 kg', NOW()),
(101, 'Weight', 'Total Weight', '110 kg', NOW()),
(101, 'Features', 'Storage Capacity', '200 liters', NOW()),
(101, 'Features', 'Drawer Quantity', '4 Large Drawers', NOW()),
(101, 'Features', 'Mattress Type', 'Spring Mattress Compatible', NOW()),
(101, 'Features', 'Finish', 'Powder-Coated with Chrome Handles', NOW()),
(101, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(101, 'Assembly', 'Assembly Time', '2-3 hours', NOW()),

-- Product 102: Sputnic Convertable Wooden Leg Bunk Bed
(102, 'Dimensions', 'Length', '200 cm', NOW()),
(102, 'Dimensions', 'Width', '100 cm', NOW()),
(102, 'Dimensions', 'Height', '160 cm', NOW()),
(102, 'Material', 'Material', 'Solid Wood Legs, Metal Frame', NOW()),
(102, 'Material', 'Wood Type', 'Sheesham or Pine (Variant-specific)', NOW()),
(102, 'Material', 'Frame Material', 'Tubular Steel', NOW()),
(102, 'Weight', 'Weight Capacity', '250 kg per level', NOW()),
(102, 'Weight', 'Total Weight', '100 kg', NOW()),
(102, 'Features', 'Convertible Feature', 'Can be separated into 2 single beds', NOW()),
(102, 'Features', 'Safety Rails', 'Yes (Upper Bunk)', NOW()),
(102, 'Features', 'Ladder Material', 'Solid Wood', NOW()),
(102, 'Features', 'Mattress Size', '190x90 cm (Single)', NOW()),
(102, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(102, 'Assembly', 'Assembly Time', '3 hours', NOW()),

-- Product 103: Rainbow Convertable Bunk Bed
(103, 'Dimensions', 'Length', '200 cm', NOW()),
(103, 'Dimensions', 'Width', '100 cm', NOW()),
(103, 'Dimensions', 'Height', '160 cm', NOW()),
(103, 'Material', 'Material', 'Metal Frame with Reinforced Joints', NOW()),
(103, 'Material', 'Frame Material', 'High-Strength Steel Tubing', NOW()),
(103, 'Material', 'Finish', 'Powder-Coated (Various Colors)', NOW()),
(103, 'Weight', 'Weight Capacity', '250 kg per level', NOW()),
(103, 'Weight', 'Total Weight', '95 kg', NOW()),
(103, 'Features', 'Convertible', 'Yes - Converts to 2 Single Beds', NOW()),
(103, 'Features', 'Safety Rails', 'Yes', NOW()),
(103, 'Features', 'Ladder Type', 'Metal with Anti-Slip Steps', NOW()),
(103, 'Features', 'Mattress Compatibility', '190x90 cm (Single)', NOW()),
(103, 'Assembly', 'Assembly Required', 'Yes', NOW()),
(103, 'Assembly', 'Assembly Time', '2.5 hours', NOW()),

-- Product 104: Zenith Rocking Easy Chair
(104, 'Dimensions', 'Length', '75 cm', NOW()),
(104, 'Dimensions', 'Width', '70 cm', NOW()),
(104, 'Dimensions', 'Height', '100 cm', NOW()),
(104, 'Dimensions', 'Seat Height', '50 cm', NOW()),
(104, 'Material', 'Material', 'Metal Frame, Cushioned Fabric Upholstery', NOW()),
(104, 'Material', 'Frame Material', 'Wrought Iron or Steel', NOW()),
(104, 'Material', 'Upholstery', 'Premium Fabric with High-Density Foam', NOW()),
(104, 'Weight', 'Weight Capacity', '120 kg', NOW()),
(104, 'Weight', 'Chair Weight', '18 kg', NOW()),
(104, 'Features', 'Rocking Feature', 'Yes - Gentle Rocking Motion', NOW()),
(104, 'Features', 'Foldable', 'Yes', NOW()),
(104, 'Features', 'Armrests', 'Yes - Padded', NOW()),
(104, 'Features', 'Recline Feature', 'Optional (Variant-specific)', NOW()),
(104, 'Assembly', 'Assembly Required', 'Minimal', NOW()),
(104, 'Assembly', 'Assembly Time', '30 minutes', NOW())
ON CONFLICT (product_id, spec_category, spec_name) DO NOTHING;
