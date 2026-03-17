# Image Loading Debug Guide

## Issue
Product images are showing as placeholder instead of actual images from Supabase.

## Debug Steps

### Step 1: Check Console Logs

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Visit product page:**
   ```
   http://localhost:3000/products/nova-sofa-bed-without-storage
   ```

3. **Check Browser Console (F12):**
   - Look for logs like:
   ```
   ProductDetailClient Debug: { product: "Nova Sofa Bed Without Storage", productId: 123, imagesCount: 3, images: [...] }
   ```

4. **Check Terminal Console:**
   - Look for logs like:
   ```
   Server-side Images Debug: { productId: 123, productSlug: "nova-sofa-bed-without-storage", imagesCount: 3, images: [...] }
   ```

### Step 2: Verify Images in Database

Run this query in Supabase SQL Editor:

```sql
-- Check if images exist for the product
SELECT 
  p.id as product_id,
  p.name,
  p.slug,
  COUNT(pi.id) as image_count,
  STRING_AGG(pi.url, ', ') as image_urls
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.slug = 'nova-sofa-bed-without-storage'
GROUP BY p.id, p.name, p.slug;
```

**Expected Result:**
```
product_id | name                           | slug                              | image_count | image_urls
-----------|--------------------------------|----------------------------------|-------------|------------------------------------------
123        | Nova Sofa Bed Without Storage  | nova-sofa-bed-without-storage    | 3           | https://... , https://... , https://...
```

### Step 3: Check Product ID Mismatch

If images aren't showing, the product ID might be different. Run:

```sql
-- List all products with their IDs
SELECT id, name, slug FROM products WHERE brand_id = (SELECT id FROM brands WHERE slug = 'spacecraft') ORDER BY created_at DESC;
```

Verify the product ID matches what you see in the console logs.

### Step 4: Verify Image URLs are Valid

If image_count is 0, images weren't inserted. Check if the SQL insert ran successfully:

```sql
-- Check all images in database
SELECT COUNT(*) as total_images FROM product_images;

-- Show all image URLs
SELECT product_id, url, alt, position FROM product_images ORDER BY product_id DESC LIMIT 10;
```

### Step 5: Manually Check Image URL

Take one of the image URLs from the logs and try opening it in browser:
```
https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/nova-sofa-bed-without-storage-1.jpg
```

If this URL doesn't work, the images weren't uploaded to Supabase Storage correctly.

## Common Issues & Solutions

### Issue: imagesCount = 0
**Problem:** No images found in database
**Solution:** Run [insert_products_corrected.sql](../sql/insert_products_corrected.sql) again

### Issue: Image URLs are not accessible (404)
**Problem:** Images exist in DB but not in Supabase Storage
**Solution:** Upload images to Supabase using /admin/bulk-upload

### Issue: productId doesn't match
**Problem:** Product wasn't inserted correctly
**Solution:** Verify product exists: 
```sql
SELECT * FROM products WHERE slug = 'nova-sofa-bed-without-storage';
```

## Next Steps

1. Run `npm run dev`
2. Visit product page
3. Check console for debug logs
4. Run SQL queries above to verify data
5. Report findings

---

**Debug logs added to:**
- [app/products/[slug]/page.js](../app/products/%5Bslug%5D/page.js) - Server-side
- [components/ProductDetailClient.js](../components/ProductDetailClient.js) - Client-side
