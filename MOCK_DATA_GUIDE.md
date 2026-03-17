# Product Enhancement Mock Data Setup Guide

## Overview
This guide helps you populate mock data for 9 products with comprehensive information including variants, offers, warranties, EMI options, stores, and specifications.

## Products Included
1. **Product 96**: Nova Sofa Bed Without Storage
2. **Product 97**: Voyager NEC Chair  
3. **Product 98**: Halley Sofa Cum Bed Single
4. **Product 99**: Proton Study Desk
5. **Product 100**: Jupiter Bunk Cum Futon Cot
6. **Product 101**: Luminous Steel Cot
7. **Product 102**: Sputnic Convertable Wooden Leg Bunk Bed
8. **Product 103**: Rainbow Convertable Bunk Bed
9. **Product 104**: Zenith Rocking Easy Chair

## Setup Instructions

### Step 1: Execute the Migration (Already Done)
The database tables should already be created:
- `product_variants`
- `product_offers`
- `warranty_options`
- `emi_options`
- `product_stores`
- `product_specifications`

### Step 2: Insert Mock Data
1. Go to your Supabase Dashboard
2. Click **SQL Editor**
3. Open the file: `sql/mock_data_all_products.sql`
4. Copy the entire SQL content
5. Paste it in the Supabase SQL Editor
6. Click **Run**

This will populate:
- 36 color variants (4 per product avg)
- 36 offers (4 per product avg)
- 27 warranty options (3 per product avg)
- 37 EMI options (4-5 per product avg)
- 29 store records (3-4 per product avg)
- 90+ specifications

### Step 3: Verify the Data
```sql
-- Check products updated
SELECT id, name, emi_enabled FROM products WHERE id IN (96, 97, 98, 99, 100, 101, 102, 103, 104);

-- Check variant counts
SELECT product_id, COUNT(*) as count FROM product_variants WHERE product_id IN (96, 97, 98, 99, 100, 101, 102, 103, 104) GROUP BY product_id;

-- Check offer counts
SELECT product_id, COUNT(*) as count FROM product_offers WHERE product_id IN (96, 97, 98, 99, 100, 101, 102, 103, 104) GROUP BY product_id;
```

## New Product Tabs

The following tabs are now available on the product detail page:

### 1. **Description**
- Original product description
- Bullet points with key features

### 2. **Specifications**
- Technical details organized by category
- Dimensions
- Material & Construction
- Weight & Capacity
- Features
- Assembly info

### 3. **Warranty** (NEW)
- Standard warranty period
- Warranty type (Premium, Standard, etc)
- Coverage details with checkmarks
- Available protection plans with pricing
- Plan descriptions and benefits

### 4. **Care & Maintenance** (NEW)
- General care instructions
- Cleaning tips
- Prevention tips
- Longevity tips
- Safe handling recommendations

### 5. **Brand & Collection** (NEW)
- Brand overview and history
- Brand highlights (Premium Quality, Modern Designs, etc)
- Collection information
- Why choose this collection
- Link to view full collection

### 6. **Stores Near You** (NEW)
- List of nearby showrooms with:
  - Store name
  - Full address
  - Phone number
  - Distance from your location
  - Expected delivery days
  - Get Directions button

### 7. **Reviews**
- Customer reviews and ratings
- Review submission form
- Filter and sort options

### 8. **Q&A**
- Common questions and answers
- Ask a question feature

## Product Information Section

The product info section displays:

### Color Variants
- Displays all color/style variants
- Shows price, MRP, and stock
- Click to select variant
- Placeholder message if no variants

### Additional Offers
- Special promotional offers
- Bank card discounts
- Limited-time deals
- Promo codes display

### EMI Options
- Bank financing options
- Monthly EMI amount
- Tenure (12 months)
- Discount percentages
- Minimum purchase requirements

### Protection Plans
- Warranty plan selection
- Plan pricing
- Coverage duration
- Plan descriptions
- Radio button selection

### Delivery & Stores
- Nearby store locations
- Delivery timeframes
- Store address and contact
- Expandable store cards
- Distance information

## Data Structure

### Variants Table
```
- variant_name: "Sandy Brown", "Grey", "Navy Blue", etc
- variant_type: "color"
- sku: Unique SKU code
- price: Discount price
- mrp: Original price
- stock: Available stock
- image_url: Product image URL
- position: Display order
```

### Offers Table
```
- title: Offer name
- description: Offer details
- offer_type: "percentage", "fixed", "card"
- discount_percent: Discount amount
- is_limited_time: Boolean
- position: Display order
```

### Warranty Options Table
```
- warranty_name: Plan name
- warranty_months: Duration
- price: Plan cost
- description: Coverage details
- coverage_types: JSON array of coverage types
```

### EMI Options Table
```
- bank_name: "HDFC", "ICICI", "SBI", "Axis", "American Express"
- card_type: "Credit Card", "Debit Card EMI", etc
- emi_monthly: Monthly EMI amount
- tenure_months: 12 months
- discount_percent: Discount percentage
- min_purchase: Minimum purchase required
- max_discount: Maximum discount amount
- description: EMI details
```

### Product Stores Table
```
- store_name: Store name
- address: Full address
- phone: Contact number
- distance_km: Distance from location
- delivery_days: Expected delivery days
- pincode: Store pincode
```

### Specifications Table
```
- spec_category: "Dimensions", "Material", "Weight & Capacity", etc
- spec_name: "Length", "Width", "Fabric Type", etc
- spec_value: The actual value
- unit: "cm", "kg", "persons", etc
- position: Display order within category
```

## Customization

### Adding More Products
1. Copy the SQL block for one product
2. Update the product_id
3. Modify the data (names, prices, descriptions)
4. Run the updated SQL

### Modifying Data
To update existing data:
```sql
UPDATE product_variants SET price = 15999 WHERE product_id = 96 AND variant_name = 'Sandy Brown';

UPDATE product_offers SET discount_percent = 25 WHERE product_id = 96;
```

### Deleting Data
To remove data for a product:
```sql
DELETE FROM product_variants WHERE product_id = 96;
DELETE FROM product_offers WHERE product_id = 96;
-- Repeat for other tables
```

## Frontend Display

### Tab Navigation
- Tabs appear in product detail page
- Click tab buttons to switch content
- Active tab is highlighted
- Mobile-responsive design

### Responsive Design
- Desktop: Full tab layout
- Tablet: Adjusted spacing
- Mobile: Scrollable tabs

### Styling
- Brand colors: #28a745 (green), #007bff (blue)
- Clean typography
- Consistent spacing
- Hover effects on interactive elements

## Notes

- All mock data is realistic and representative
- Prices are in Indian Rupees (INR)
- Phone numbers are placeholder format
- Store addresses are based on real Spacecrafts locations
- EMI options match common Indian banks
- All data respects database relationships via product_id

## Troubleshooting

**Issue**: Data not appearing on product page
**Solution**: 
1. Verify SQL executed successfully
2. Check browser cache (Ctrl+Shift+Delete)
3. Verify product ID matches in database
4. Check browser console for errors

**Issue**: Images not loading
**Solution**: 
1. Images use placeholder URLs (placeholder.com)
2. Replace image_url with actual URLs if desired
3. Check CORS settings for image sources

**Issue**: Prices showing incorrectly
**Solution**:
1. Verify price and mrp values in database
2. Check currency formatting in code
3. Ensure discount_price is set correctly

## Support

For issues or questions:
1. Check the database tables in Supabase
2. Verify data consistency
3. Check browser console for JavaScript errors
4. Review SQL syntax in migrations
