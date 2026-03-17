# Product & Category Activation System Setup

## Overview
You now have a complete system to show/hide products and categories using `is_active` boolean flags. This allows you to:
- Show only 9 SpaceCraft products initially
- Deactivate existing products
- Activate/deactivate products anytime in the future
- Do the same for categories

## Step 1: Add `is_active` Columns to Database

Run this SQL in Supabase SQL Editor:

**File**: [sql/add_is_active_flag.sql](sql/add_is_active_flag.sql)

This script:
✅ Adds `is_active` boolean column to products table (default: true)
✅ Adds `is_active` boolean column to categories table (default: true)
✅ Deactivates ALL existing products
✅ Activates only the 9 SpaceCraft products
✅ Provides verification queries

## Step 2: Updated Frontend Code

All product queries have been updated to filter by `is_active = true`:

### Files Updated:
1. **[app/page.js](app/page.js)** - Homepage featured products
   - Latest products filtered
   - Featured/bestselling products filtered

2. **[app/products/page.js](app/products/page.js)** - Products listing page
   - All products filtered by is_active
   - Categories filtered by is_active

3. **[app/products/[slug]/page.js](app/products/%5Bslug%5D/page.js)** - Product detail page
   - Product fetching filtered by is_active
   - Related products filtered by is_active
   - Category products filtered by is_active
   - Brand products filtered by is_active

4. **[app/sitemap.xml/route.js](app/sitemap.xml/route.js)** - SEO sitemap
   - Products filtered by is_active
   - Categories filtered by is_active

## Step 3: Manage Product Status

### Show Current Status
```sql
-- See which products are active vs inactive
SELECT name, slug, is_active, created_at
FROM products
ORDER BY created_at DESC;

-- See only active products
SELECT name, slug, price, is_active
FROM products
WHERE is_active = true;

-- See only inactive products (to activate later)
SELECT name, slug, price, is_active
FROM products
WHERE is_active = false;
```

### Activate/Deactivate Products

**Activate a specific product:**
```sql
UPDATE products SET is_active = true WHERE slug = 'product-slug';
```

**Deactivate a specific product:**
```sql
UPDATE products SET is_active = false WHERE slug = 'product-slug';
```

**Activate all products from a brand:**
```sql
UPDATE products SET is_active = true 
WHERE brand_id = (SELECT id FROM brands WHERE slug = 'brand-slug');
```

**Deactivate all products from a brand:**
```sql
UPDATE products SET is_active = false 
WHERE brand_id = (SELECT id FROM brands WHERE slug = 'brand-slug');
```

**Activate all products in a category:**
```sql
UPDATE products SET is_active = true 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'category-slug');
```

**Deactivate all products in a category:**
```sql
UPDATE products SET is_active = false 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'category-slug');
```

## Step 4: Manage Category Status

### Activate/Deactivate Categories

**Activate a specific category:**
```sql
UPDATE categories SET is_active = true WHERE slug = 'category-slug';
```

**Deactivate a specific category:**
```sql
UPDATE categories SET is_active = false WHERE slug = 'category-slug';
```

**View category status:**
```sql
SELECT id, name, slug, is_active FROM categories ORDER BY name;
```

## Current Status After Migration

After running the SQL migration script:

### Active Products (9):
- Nova Sofa Bed Without Storage
- Voyager NEC Chair
- Halley Sofa Cum Bed Single
- Proton Study Desk
- Jupiter Bunk Cum Futon Cot
- Luminous Steel Cot
- Sputnic Convertable Wooden Leg Bunk Bed
- Rainbow Convertable Bunk Bed
- Zenith Rocking Easy Chair

### Inactive Products:
- Modern 3-Seater Sofa (and any other existing products)

### Active Categories:
- All 10 default categories

## Helper Queries

Use the file [sql/manage_active_status.sql](sql/manage_active_status.sql) for common operations. It contains:
- Quick copy-paste queries for activation/deactivation
- Bulk operations
- Status viewing queries

## Frontend Behavior

### What Users See:
✅ Only active products appear in:
  - Homepage featured sections
  - Product listing page (/products)
  - Related products on detail pages
  - Sitemap for SEO

### What Users Don't See:
❌ Inactive products are completely hidden from:
  - Search results
  - Category listings
  - Homepage
  - Sitemap

### Admin Dashboard:
The admin panel still shows all products (active and inactive) for management purposes.

## Future Product Releases

When you're ready to activate more products:

1. Upload product images to Supabase Storage (using /admin/bulk-upload)
2. Insert products using SQL with images
3. Run activation query:
```sql
UPDATE products SET is_active = true WHERE slug IN ('product-slug-1', 'product-slug-2');
```
4. Products immediately appear on frontend

## Quick Reference

**Current URL to check results:**
- http://localhost:3000/products - Shows only 9 active SpaceCraft products

**SQL Files Created:**
- [sql/add_is_active_flag.sql](sql/add_is_active_flag.sql) - Run this first
- [sql/manage_active_status.sql](sql/manage_active_status.sql) - Helper queries

**Frontend Files Updated:**
- [app/page.js](app/page.js)
- [app/products/page.js](app/products/page.js)
- [app/products/[slug]/page.js](app/products/%5Bslug%5D/page.js)
- [app/sitemap.xml/route.js](app/sitemap.xml/route.js)

---

**Ready to go live!** 🚀
