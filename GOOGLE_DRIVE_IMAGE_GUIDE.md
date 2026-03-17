# Image Upload & Google Drive Guide

## Overview

This guide covers:
1. How to handle images shared via Google Drive
2. How to upload images to Supabase Storage
3. Integration with product import workflow

---

## Google Drive Image Handling

### Option 1: Direct Share Link (Recommended)

**Client shares images via Google Drive folder link**

1. Client creates public Google Drive folder
2. Shares link: `https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing`
3. You can script-download images or manually process them

**Convert Google Drive Link to Direct Download URL:**
```
Original share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
Direct download URL: https://drive.google.com/uc?id=FILE_ID&export=download
```

**How to extract FILE_ID:**
- Open Google Drive file link
- Copy the ID from the URL: `https://drive.google.com/file/d/{FILE_ID}/view`
- Use in direct URL: `https://drive.google.com/uc?id={FILE_ID}&export=download`

### Option 2: Shared Google Sheet with Image URLs

Client fills Google Sheet with product data + Google Drive image links:
```
Product Name | Image URL 1
Sofa | https://drive.google.com/uc?id=ABC123&export=download
Bed | https://drive.google.com/uc?id=XYZ789&export=download
```

Then you download the CSV and import (see below).

---

## Supabase Storage Setup

### 1. Create Storage Bucket

In Supabase Dashboard → Storage:
- Create new bucket named: `spacecraftsdigital` (or your preferred name)
- Set to Public (allow public reads)
- Keep uploads private/admin-only via API

### 2. Configure Bucket in `.env.local`

```env
SUPABASE_STORAGE_BUCKET=spacecraftsdigital
```

---

## Image Upload Workflow

### Method A: Direct Upload via API

**Endpoint:** `POST /api/upload-image`

**Request:**
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('productId', 57) // Optional
formData.append('folder', 'products') // Optional

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.url) // Public URL to use in DB
```

### Method B: Download from Google Drive & Upload

**Node.js script to download Google Drive image and upload to Supabase:**

```javascript
const fetch = require('node-fetch')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function downloadAndUploadGoogleDriveImage(googleDriveFileId, productId) {
  try {
    // Download from Google Drive
    const driveUrl = `https://drive.google.com/uc?id=${googleDriveFileId}&export=download`
    const response = await fetch(driveUrl)
    const buffer = await response.buffer()

    // Upload to Supabase
    const filename = `products/${Date.now()}-${googleDriveFileId}.jpg`
    const { data, error } = await supabase
      .storage
      .from('spacecraftsdigital')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('spacecraftsdigital')
      .getPublicUrl(filename)

    // Link to product if productId provided
    if (productId) {
      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          alt: `Product image`,
          position: 0
        })
    }

    return publicUrl
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Usage
await downloadAndUploadGoogleDriveImage('GOOGLE_DRIVE_FILE_ID', 57)
```

---

## Product Import with Images

### Step 1: Client Prepares Google Sheet

Columns:
- Product Name, Slug, Category, Brand, Price, Stock, Description
- Image URL 1, Image URL 2, Image URL 3
- (All image URLs should be direct Google Drive links or HTTPS URLs)

Example:
```
Product Name,Slug,Category,Brand,Price,Stock,Image URL 1,Image URL 2
Premium Sofa,premium-sofa,Sofas,LuxeComfort,45999,12,https://drive.google.com/uc?id=ABC123&export=download,https://drive.google.com/uc?id=ABC124&export=download
```

### Step 2: Download CSV from Google Sheet

File → Download → CSV

### Step 3: Process CSV & Import

**Node.js bulk import script:**

```javascript
const fs = require('fs')
const csv = require('csv-parse/sync')
const fetch = require('node-fetch')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importProductsFromCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  for (const record of records) {
    try {
      // 1. Create or get category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', record.Category)
        .single()

      let categoryId = categoryData?.id
      if (!categoryId) {
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({ name: record.Category, slug: record.Category.toLowerCase() })
          .select()
          .single()
        categoryId = newCategory?.id
      }

      // 2. Create or get brand
      const { data: brandData } = await supabase
        .from('brands')
        .select('id')
        .eq('name', record.Brand)
        .single()

      let brandId = brandData?.id
      if (!brandId) {
        const { data: newBrand } = await supabase
          .from('brands')
          .insert({ name: record.Brand, slug: record.Brand.toLowerCase() })
          .select()
          .single()
        brandId = newBrand?.id
      }

      // 3. Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: record['Product Name'],
          slug: record.Slug,
          category_id: categoryId,
          brand_id: brandId,
          description: record.Description,
          price: parseFloat(record.Price),
          discount_price: record['Discount Price'] ? parseFloat(record['Discount Price']) : null,
          stock: parseInt(record.Stock),
          material: record.Material || null,
          warranty: record.Warranty || null,
          delivery_info: record['Delivery Info'] || null,
          tags: record.Tags ? record.Tags.split(',') : []
        })
        .select()
        .single()

      if (productError) throw productError

      // 4. Upload images
      let position = 1
      for (let i = 1; i <= 3; i++) {
        const imageUrl = record[`Image URL ${i}`]
        if (imageUrl) {
          try {
            const response = await fetch(imageUrl)
            const buffer = await response.buffer()

            const filename = `products/${product.id}-${i}.jpg`
            const { data: uploadData } = await supabase
              .storage
              .from('spacecraftsdigital')
              .upload(filename, buffer, { contentType: 'image/jpeg' })

            const { data: { publicUrl } } = supabase
              .storage
              .from('spacecraftsdigital')
              .getPublicUrl(filename)

            await supabase
              .from('product_images')
              .insert({
                product_id: product.id,
                url: publicUrl,
                alt: `${record['Product Name']} image ${i}`,
                position: position++
              })
          } catch (imgError) {
            console.warn(`Failed to upload image ${i} for product ${product.id}:`, imgError.message)
          }
        }
      }

      console.log(`✓ Imported: ${record['Product Name']}`)
    } catch (error) {
      console.error(`✗ Failed to import ${record['Product Name']}:`, error.message)
    }
  }
}

// Usage
importProductsFromCSV('./products.csv')
```

---

## Best Practices

### Image URLs
- ✅ Use direct download links: `https://drive.google.com/uc?id=FILE_ID&export=download`
- ✅ Use HTTPS URLs only
- ✅ Test URLs in browser first
- ❌ Avoid "view only" links that require authentication

### Image Files
- Format: JPG, PNG, WebP
- Size: 1200x1200px minimum (larger is okay)
- Aspect ratio: 1:1 (square) preferred for product showcase
- File size: < 5MB per image

### Google Drive Sharing
- Set folder to "Anyone with the link can view"
- Do NOT require sign-in
- Use file IDs, not public-access tokens

### Supabase Storage
- Keep bucket public for reads (customers can view images)
- Uploads only via authenticated API (admin/server only)
- Use folder structure: `products/`, `categories/`, etc.
- Monitor storage usage in Supabase dashboard

---

## Troubleshooting

### Image URL returns 404
- Verify file is publicly shared on Google Drive
- Check FILE_ID is correct
- Try opening URL in incognito/private browser window

### Upload fails with 413 Payload Too Large
- Compress image before uploading
- Max size is 5MB

### Upload succeeds but URL is broken
- Verify Supabase bucket is public
- Check bucket name matches `SUPABASE_STORAGE_BUCKET` env var
- Test URL by pasting in browser address bar

### Google Drive download fails
- File must be publicly accessible
- Sharing link must NOT require authentication
- Use "Anyone with the link" setting

---

## Related Documents

- [PRODUCT_IMPORT_GUIDE.md](../PRODUCT_IMPORT_GUIDE.md) - Product data format
- [PRODUCT_IMPORT_TEMPLATE.json](../PRODUCT_IMPORT_TEMPLATE.json) - Sample JSON

