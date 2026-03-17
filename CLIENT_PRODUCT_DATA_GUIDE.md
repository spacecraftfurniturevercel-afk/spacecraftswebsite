# 📦 Spacecrafts Furniture — Product Data Collection Guide

> **Share this document + the Google Sheet template with your client.**
> They fill in the sheet & upload images to Google Drive, then you import everything into Supabase.

---

## 📋 Google Sheet Structure

### Sheet 1: `Products` (Main Product Data)

| Column | Required? | Description | Example |
|--------|-----------|-------------|---------|
| **name** | ✅ YES | Full product name | Nova Sofa Bed Without Storage |
| **slug** | ✅ YES | URL-friendly name (lowercase, hyphens, no spaces) | nova-sofa-bed-without-storage |
| **category_name** | ✅ YES | Category this product belongs to | Sofas, Beds, Dining Sets, Chairs, Tables, Mattresses, Racks & Storage, Outdoor Furniture, Home Decor |
| **brand_name** | ✅ YES | Brand name | Spacecrafts / Orion Furnishings / Stellar Home / Nova Interiors |
| **description** | ✅ YES | Full product description (detailed, SEO-friendly) | _Long paragraph describing the product_ |
| **price** | ✅ YES | Original MRP price in ₹ (numbers only) | 30000.00 |
| **discount_price** | Optional | Sale price in ₹ (must be less than price). Leave blank if no discount | 21186.00 |
| **stock** | ✅ YES | Quantity available | 10 |
| **material** | ✅ YES | Primary material description | Fabric Upholstery, Hardwood & Metal Frame |
| **warranty_period_months** | Optional | Warranty in months (default: 12) | 12 |
| **warranty_type** | Optional | Standard / Extended / Premium (default: Standard) | Standard |
| **delivery_info** | Optional | Delivery details | Free Delivery across India \| 7-10 Days |
| **dimensions_length_m** | ✅ YES | Length in meters | 1.9 |
| **dimensions_width_m** | ✅ YES | Width in meters | 0.9 |
| **dimensions_height_m** | ✅ YES | Height in meters | 0.85 |
| **tags** | ✅ YES | Comma-separated tags (lowercase, hyphens) | sofa-bed,space-saving,living-room,fabric,best-offer |
| **best_seller** | Optional | TRUE / FALSE (default: FALSE) | TRUE |
| **is_offered** | Optional | TRUE / FALSE — show in "Offers" section (default: FALSE) | TRUE |
| **is_active** | Optional | TRUE / FALSE — product visible on site (default: TRUE) | TRUE |
| **assembly_cost** | Optional | Assembly cost in ₹ (default: 0) | 500.00 |
| **assembly_time_hours** | Optional | Assembly time in hours | 2.5 |
| **care_instructions** | Optional | Care/maintenance instructions | Vacuum clean fabric weekly |
| **emi_enabled** | Optional | TRUE / FALSE — allow EMI payments (default: TRUE) | TRUE |
| **return_days** | Optional | Return policy days (default: 30) | 30 |
| **is_limited_stock** | Optional | TRUE / FALSE (default: FALSE) | FALSE |
| **related_product_slugs** | ✅ YES | Comma-separated slugs of 3-5 related products | voyager-nec-chair,jupiter-bunk-cum-futon-cot |

---

### Sheet 2: `Variants` (Color Options per Product)

Each product can have multiple color variants. **One row per variant.**

| Column | Required? | Description | Example |
|--------|-----------|-------------|---------|
| **product_slug** | ✅ YES | Slug of the parent product | nova-sofa-bed-without-storage |
| **variant_name** | ✅ YES | Color/variant display name | Sandy Brown |
| **variant_type** | ✅ YES | Always `color` for now | color |
| **price** | ✅ YES | Price for this variant (can be same as parent) | 21186.00 |
| **stock** | ✅ YES | Stock for this variant | 15 |

---

### Sheet 3: `Specifications` (Detailed Specs per Product)

Each product should have detailed specs. **One row per specification.**

| Column | Required? | Description | Example |
|--------|-----------|-------------|---------|
| **product_slug** | ✅ YES | Slug of the parent product | nova-sofa-bed-without-storage |
| **spec_category** | ✅ YES | Category group: `Dimensions`, `Material`, `Weight`, `Assembly`, `Features` | Dimensions |
| **spec_name** | ✅ YES | Specification label | Length |
| **spec_value** | ✅ YES | Specification value | 190 cm |

**Recommended specs per product:**

| Spec Category | Spec Names to Include |
|---------------|----------------------|
| **Dimensions** | Length, Width, Height, Bed Length (if applicable), Seat Height (if chair) |
| **Material** | Material, Frame Material, Fabric Type, Upholstery |
| **Weight** | Weight Capacity, Product Weight |
| **Assembly** | Assembly Required (Yes/No/Minimal), Assembly Time |
| **Features** | Any unique features (Foldable, Storage, Reclining, Rocking, etc.) |

---

## 🖼️ Image Naming & Google Drive Upload Instructions

> [!IMPORTANT]
> **All images should be high-quality (minimum 1200×1200 px, JPEG or PNG).**

### 📁 Google Drive Folder Structure

Create this folder structure in Google Drive and share the link:

```
📁 Spacecrafts_Product_Images/
├── 📁 nova-sofa-bed-without-storage/
│   ├── nova-sofa-bed-without-storage-1.jpg       ← Main image
│   ├── nova-sofa-bed-without-storage-2.jpg       ← Angle 2
│   ├── nova-sofa-bed-without-storage-3.jpg       ← Angle 3
│   ├── nova-sofa-bed-without-storage-sandy-brown.jpg    ← Color variant
│   ├── nova-sofa-bed-without-storage-grey.jpg           ← Color variant
│   ├── nova-sofa-bed-without-storage-navy-blue.jpg      ← Color variant
│   └── nova-sofa-bed-without-storage-charcoal-black.jpg ← Color variant
│
├── 📁 voyager-nec-chair/
│   ├── voyager-nec-chair-1.jpg
│   ├── voyager-nec-chair-2.jpg
│   ├── voyager-nec-chair-3.jpg
│   ├── voyager-nec-chair-black-grey.jpg
│   └── voyager-nec-chair-brown-beige.jpg
│
└── ... (one folder per product using the slug name)
```

### Image Naming Rules

| Image Type | Naming Pattern | Example |
|------------|---------------|---------|
| **Product images** (3-5 per product) | `{slug}-1.jpg`, `{slug}-2.jpg`, `{slug}-3.jpg` | `nova-sofa-bed-without-storage-1.jpg` |
| **Color variant images** (1 per color) | `{slug}-{color-name-lowercase-hyphenated}.jpg` | `nova-sofa-bed-without-storage-sandy-brown.jpg` |

### Rules:
- Image 1 (`-1.jpg`) = **Main/hero image** (shown in listings)
- Provide **at least 3 product images** per product (different angles)
- Provide **1 image per color variant**
- All filenames: **lowercase, hyphens only, no spaces**
- Color name in filename should match the variant name (lowercased, spaces → hyphens)

---

## ✅ Checklist Before Submitting

- [ ] All products have **name, slug, category, brand, description, price, stock, material, dimensions, tags**
- [ ] All slugs are **unique**, lowercase, hyphens only
- [ ] Each product has **at least 3 product images** in Google Drive
- [ ] Each color variant has **1 image** in Google Drive
- [ ] Image files follow the naming convention: `{slug}-1.jpg`, `{slug}-{color}.jpg`
- [ ] **Related product slugs** are filled in (3-5 related products per product)
- [ ] **Specifications sheet** has at least Dimensions, Material, Weight, Assembly info
- [ ] **Variants sheet** has all color options with price and stock
- [ ] Google Drive folder is **shared with view access**

---

## 📊 Existing Categories in the System

| Category Name | Slug |
|---------------|------|
| Sofas | sofas |
| Chairs | chairs |
| Tables | tables |
| Beds | beds |
| Dining Sets | dining-sets |
| Outdoor Furniture | outdoor-furniture |
| Racks & Storage | racks-storage |
| Mattresses | mattresses |
| Home Decor | home-decor |

> If a product doesn't fit these categories, mention the new category name and we'll add it.

---

## 📊 Existing Brands in the System

| Brand Name | Slug |
|------------|------|
| Orion Furnishings | orion-furnishings |
| Stellar Home | stellar-home |
| Nova Interiors | nova-interiors |

> If the product is a new brand, mention the new brand name and we'll add it.
