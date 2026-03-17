# Product Import Template for Spacecrafts Furniture

## Instructions for Clients

1. **Duplicate this Google Sheet** (or download as Excel/CSV)
2. **Fill in product data** following the column definitions below
3. **For images**: Provide URLs as a pipe-separated list (see examples)
4. **Save as CSV** and send to us for bulk import
5. **Do NOT modify column headers** - keep them exactly as shown

---

## Column Definitions

### Basic Info (Required)
- **Product Name**: Full name of the product (e.g., "Premium Leather Sofa - 3 Seater")
- **Slug**: URL-friendly unique identifier (lowercase, hyphens only, no spaces)
  - Example: `premium-leather-sofa-3-seater`
- **Category**: Product category (Sofas, Beds, Dining, Office, Storage, Chairs, Tables, Mattresses)
- **Brand**: Brand name (e.g., "LuxeComfort", "WoodCraft")

### Pricing & Stock (Required)
- **Price (₹)**: Base price in Indian Rupees (whole number or decimal, e.g., 45999 or 45999.50)
- **Discount Price (₹)**: Sale price (leave blank if no discount)
- **Stock**: Number of units available (e.g., 0, 5, 100)

### Description & Details (Required)
- **Description**: 50-200 word description of the product
  - Should include: material, features, uses, benefits
  - Keep it concise but informative

### Additional Info (Optional)
- **Material**: Material composition (e.g., "100% Genuine Italian Leather, Hardwood Frame")
- **Warranty**: Warranty period (e.g., "3 Years", "5 Years", "Lifetime")
- **Delivery Info**: Delivery details (e.g., "Free Delivery across India | 5-7 Days")
- **Dimensions**: Product size in meters (e.g., "L: 2.1m, W: 0.9m, H: 0.85m")
- **Tags**: Searchable keywords (comma-separated, e.g., "leather,sofa,seating,living-room,premium")

### Images (Required - At Least 1)
- **Image URL 1** (Main/Hero Image): Publicly accessible image URL (https://...)
- **Image Alt 1**: Short description for accessibility (e.g., "Premium Leather Sofa front view")
- **Image URL 2** (Optional): Second product image
- **Image Alt 2** (Optional): Description for second image
- **Image URL 3** (Optional): Third product image
- **Image Alt 3** (Optional): Description for third image

---

## Sample Rows

| Product Name | Slug | Category | Brand | Price (₹) | Discount Price (₹) | Stock | Description | Material | Warranty | Delivery Info | Dimensions | Tags | Image URL 1 | Image Alt 1 | Image URL 2 | Image Alt 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Premium Leather Sofa - 3 Seater | premium-leather-sofa-3-seater | Sofas | LuxeComfort | 45999 | 38499 | 12 | Elegant 3-seater premium leather sofa with high-back design, perfect for modern living rooms. Features genuine Italian leather, hardwood frame, and comfortable cushioning. | 100% Genuine Italian Leather, Hardwood Frame | 5 Years | Free Delivery across India \| 7-10 Days | L: 2.1m, W: 0.9m, H: 0.85m | leather,sofa,seating,living-room,premium | https://your-cdn.com/sofa-1-main.jpg | Premium Leather Sofa front view | https://your-cdn.com/sofa-1-side.jpg | Premium Leather Sofa side view |
| Modern Wooden Dining Table - 6 Seater | modern-wooden-dining-table-6-seater | Dining | WoodCraft | 28999 | 24499 | 8 | Contemporary 6-seater dining table crafted from solid acacia wood with sleek natural finish. Spacious tabletop accommodates family meals and gatherings. | Solid Acacia Wood with Natural Polish | 3 Years | Free Delivery across India \| 5-7 Days | L: 1.8m, W: 1.0m, H: 0.75m | dining,wood,table,acacia,6-seater | https://your-cdn.com/dining-table-1.jpg | Modern Dining Table top view | https://your-cdn.com/dining-table-2.jpg | Modern Dining Table full view |

---

## Best Practices

### Slug
- ✅ Use hyphens: `modern-wooden-dining-table`
- ✅ Use lowercase: `premium-leather-sofa`
- ❌ Avoid spaces: `premium leather sofa` (use hyphens instead)
- ❌ Avoid special characters: `sofa@luxury`, `table#modern`
- Make it unique (no duplicates)

### Price
- Format: `45999` or `45999.50` (numbers only, no ₹ symbol)
- Discount Price must be less than Price
- If no discount, leave Discount Price blank

### Images
- URLs must be complete: `https://example.com/image.jpg`
- Common format: JPG, PNG, WebP
- Recommended size: 1200x1200px or larger (aspect ratio 1:1 preferred)
- Use image CDN (AWS S3, Cloudinary, etc.) for fast loading

### Tags
- Separate with commas: `leather,sofa,seating,living-room`
- Use lowercase
- 3-5 tags per product recommended
- Use keywords customers would search for

### Warranty & Delivery
- Warranty examples: `1 Year`, `3 Years`, `5 Years`, `Lifetime`
- Delivery examples: `Free Delivery | 5-7 Days`, `COD Available`, `All India Shipping`

---

## How We'll Import

1. Receive your CSV file
2. Validate data (check for required fields, image URLs, etc.)
3. Create products in database
4. Create categories & brands if new
5. Upload images to our CDN
6. Link images to products
7. Confirm import completion

---

## Questions?

Please contact us if you need clarification on any field or format.
