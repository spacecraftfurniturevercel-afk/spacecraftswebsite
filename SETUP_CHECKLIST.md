# Quick Setup Checklist

## Image Upload & Related Products

### 1. Related Products (✓ Done)
- **What:** Product pages now show minimum 4 related products
- **How:** Fetches from same category first, then supplements with same brand products
- **Location:** [app/products/[slug]/page.js](app/products/%5Bslug%5D/page.js)
- **Status:** ✓ Auto-working, no config needed

### 2. Supabase Storage Setup

#### Check Storage Bucket
In Supabase Dashboard → Storage:
- [ ] Bucket exists named `spacecraftsdigital`
- [ ] Bucket is set to Public (for read access)
- [ ] No authentication required for viewing images

#### Update `.env.local`
```env
SUPABASE_STORAGE_BUCKET=spacecraftsdigital
```

### 3. Image Upload Methods

#### Option A: Admin Bulk Upload Page
- **URL:** `http://localhost:3000/admin/bulk-upload`
- **Features:** Upload multiple images, optionally link to product ID
- **Access:** Admin users only (email contains 'admin@' or '@admin')

#### Option B: API Upload
- **Endpoint:** `POST /api/upload-image`
- **Accepts:** Multipart form data with file
- **Returns:** Public URL to use in database

#### Option C: Script-Based Import
- Use the Node.js script in [GOOGLE_DRIVE_IMAGE_GUIDE.md](GOOGLE_DRIVE_IMAGE_GUIDE.md)
- Download images from Google Drive
- Auto-upload to Supabase Storage
- Auto-link to products

### 4. Workflow: Google Drive → Database

#### Step 1: Client Prepares Data
Client creates Google Sheet with:
- Product details (name, price, description, etc.)
- Image URLs (Google Drive direct links)

See [PRODUCT_IMPORT_GUIDE.md](PRODUCT_IMPORT_GUIDE.md) for template

#### Step 2: You Download CSV
File → Download as → CSV

#### Step 3: Process & Upload

**Option A: Manual via Admin Panel**
1. Go to `/admin/bulk-upload`
2. Select images from your computer (you'll need to download from Google Drive first)
3. Upload and get URLs
4. Insert URLs into product database

**Option B: Automated Script**
Use bulk import script from [GOOGLE_DRIVE_IMAGE_GUIDE.md](GOOGLE_DRIVE_IMAGE_GUIDE.md):
```bash
node scripts/import-products.js products.csv
```

### 5. Key Files

| File | Purpose |
|------|---------|
| [PRODUCT_IMPORT_TEMPLATE.json](PRODUCT_IMPORT_TEMPLATE.json) | Sample product data format |
| [PRODUCT_IMPORT_GUIDE.md](PRODUCT_IMPORT_GUIDE.md) | Client guide for data format |
| [GOOGLE_DRIVE_IMAGE_GUIDE.md](GOOGLE_DRIVE_IMAGE_GUIDE.md) | Image upload & Google Drive handling |
| [app/api/upload-image/route.js](app/api/upload-image/route.js) | Image upload API endpoint |
| [app/admin/bulk-upload/page.js](app/admin/bulk-upload/page.js) | Admin bulk upload UI |
| [app/products/[slug]/page.js](app/products/%5Bslug%5D/page.js) | Product page (fetches min 4 related) |

### 6. Testing

#### Test Related Products
1. Go to any product page
2. Scroll to "Related Products"
3. Should see 4+ products from same category/brand
4. Each should have images

#### Test Image Upload
1. Go to `http://localhost:3000/admin/bulk-upload` (must be logged in as admin)
2. Select an image
3. Upload
4. Get public URL back
5. Verify image loads in browser

#### Test Google Drive Link
```
Original: https://drive.google.com/file/d/ABC123XYZ/view
Direct URL: https://drive.google.com/uc?id=ABC123XYZ&export=download
```
- Paste direct URL in browser address bar
- Should download image (not show 404)

### 7. Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Images not showing on product page | Check image URLs are valid; verify Supabase bucket is public |
| Upload fails with 413 error | Image too large (>5MB); compress and retry |
| Google Drive link returns 404 | File must be publicly shared; avoid "view only" links |
| Related products showing <4 items | Database might have limited products; add more products to increase options |
| Admin bulk upload page is blank | Must be logged in as admin; email must contain 'admin@' or '@admin' |

### 8. Next Steps

1. **Verify Supabase bucket is ready** (check dashboard)
2. **Test image upload** at `/admin/bulk-upload`
3. **Request client data** using [PRODUCT_IMPORT_GUIDE.md](PRODUCT_IMPORT_GUIDE.md)
4. **Prepare import script** or do manual uploads via admin panel
5. **Verify products display** with images and related products on live site

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Upload images via API (curl example)
curl -X POST http://localhost:3000/api/upload-image \
  -F "file=@/path/to/image.jpg" \
  -F "productId=57" \
  -F "folder=products"

# Run bulk import script (if Node.js script available)
node scripts/import-products.js products.csv
```

---

**Status:** ✓ All systems ready for image uploads and product imports
