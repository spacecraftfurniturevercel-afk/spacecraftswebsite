# Spacecrafts Furniture — Product Data Collection Guide for Client

> **This document explains exactly what data and images we need from you to add products to the website.**

---

## Overview

We need **3 things** from you:

1. **Google Sheet** — Fill in all product details (we provide the template)
2. **Product Images** — Upload to a Google Drive folder (follow the naming rules below)
3. **Share access** — Share the Google Drive folder link with us

---

## PART 1: Google Sheet — Product Data

Copy the Google Sheet template we share with you. It has **3 sheets (tabs)**:

---

### Sheet 1: `Products` (Main Product Info)

**Fill one row per product.** All columns explained below:

| # | Column Name | Required? | What to Fill | Example |
|---|-------------|-----------|--------------|---------|
| 1 | **name** | ✅ YES | Full product name | Nova Sofa Bed Without Storage |
| 2 | **slug** | ✅ YES | URL-friendly name — **lowercase, hyphens only, no spaces** | nova-sofa-bed-without-storage |
| 3 | **category_name** | ✅ YES | Category (pick from list below) | Sofa Beds |
| 4 | **brand_name** | ✅ YES | Brand name (pick from list below, or write new) | Spacecrafts |
| 5 | **description** | ✅ YES | Detailed product description (at least 2-3 sentences, good for SEO) | The Nova sofa bed is a versatile piece... |
| 6 | **price** | ✅ YES | Original MRP in ₹ (numbers only, no ₹ symbol) | 30000.00 |
| 7 | **discount_price** | Optional | Sale price in ₹. Leave blank if no discount. Must be LESS than price | 21186.00 |
| 8 | **stock** | ✅ YES | How many units available | 10 |
| 9 | **material** | ✅ YES | Primary material description | Fabric Upholstery, Hardwood & Metal Frame |
| 10 | **warranty_period_months** | Optional | Warranty in months (default: 12) | 12 |
| 11 | **warranty_type** | Optional | Standard / Extended / Premium (default: Standard) | Standard |
| 12 | **delivery_info** | Optional | Delivery details text | Free Delivery across India \| 7-10 Days |
| 13 | **dimensions_length_m** | ✅ YES | Length in meters | 1.9 |
| 14 | **dimensions_width_m** | ✅ YES | Width in meters | 0.9 |
| 15 | **dimensions_height_m** | ✅ YES | Height in meters | 0.85 |
| 16 | **tags** | ✅ YES | Comma-separated search tags (lowercase, hyphens) — pick from tag list below | sofa-bed,space-saving,living-room,fabric |
| 17 | **best_seller** | Optional | TRUE / FALSE — Is this a best seller? (default: FALSE) | TRUE |
| 18 | **is_offered** | Optional | TRUE / FALSE — Show in "Offers" section? (default: FALSE) | TRUE |
| 19 | **is_active** | Optional | TRUE / FALSE — Show on website? (default: TRUE) | TRUE |
| 20 | **assembly_cost** | Optional | Assembly service cost in ₹ (default: 0) | 500.00 |
| 21 | **assembly_time_hours** | Optional | Assembly time in hours | 2.5 |
| 22 | **care_instructions** | Optional | How to clean/maintain the product | Vacuum clean fabric weekly. Avoid direct sunlight. |
| 23 | **emi_enabled** | Optional | TRUE / FALSE — Allow EMI payments? (default: TRUE) | TRUE |
| 24 | **return_days** | Optional | Return policy days (default: 30) | 30 |
| 25 | **is_limited_stock** | Optional | TRUE / FALSE — Show "limited stock" badge? (default: FALSE) | FALSE |
| 26 | **related_product_slugs** | ✅ YES | Comma-separated **slugs** of 3–5 related products | voyager-nec-chair,jupiter-bunk-cum-futon-cot,luminous-steel-cot |
| 27 | **image_1_filename** | ✅ YES | Filename of main/hero image in Google Drive | nova-sofa-bed-without-storage-1.jpg |
| 28 | **image_2_filename** | ✅ YES | Filename of 2nd image | nova-sofa-bed-without-storage-2.jpg |
| 29 | **image_3_filename** | ✅ YES | Filename of 3rd image | nova-sofa-bed-without-storage-3.jpg |
| 30 | **image_4_filename** | Optional | Filename of 4th image | nova-sofa-bed-without-storage-4.jpg |
| 31 | **image_5_filename** | Optional | Filename of 5th image (if needed) | |

---

### Sheet 2: `Variants` (Color Options)

**Fill one row per color variant.** Each product can have up to 4+ colors.

| # | Column Name | Required? | What to Fill | Example |
|---|-------------|-----------|--------------|---------|
| 1 | **product_slug** | ✅ YES | The slug of the parent product (must match Sheet 1) | nova-sofa-bed-without-storage |
| 2 | **variant_name** | ✅ YES | Color display name | Sandy Brown |
| 3 | **variant_type** | ✅ YES | Type of variant — write `color` | color |
| 4 | **price** | ✅ YES | Price for this color variant in ₹ (can be same as parent price) | 21186.00 |
| 5 | **stock** | ✅ YES | Stock for this color variant | 15 |
| 6 | **image_filename** | ✅ YES | Image filename for this color in Google Drive | nova-sofa-bed-without-storage-sandy-brown.jpg |

**Example rows:**

| product_slug | variant_name | variant_type | price | stock | image_filename |
|-------------|-------------|-------------|-------|-------|----------------|
| nova-sofa-bed-without-storage | Sandy Brown | color | 21186.00 | 15 | nova-sofa-bed-without-storage-sandy-brown.jpg |
| nova-sofa-bed-without-storage | Grey | color | 21186.00 | 12 | nova-sofa-bed-without-storage-grey.jpg |
| nova-sofa-bed-without-storage | Navy Blue | color | 21186.00 | 10 | nova-sofa-bed-without-storage-navy-blue.jpg |
| nova-sofa-bed-without-storage | Charcoal Black | color | 21186.00 | 8 | nova-sofa-bed-without-storage-charcoal-black.jpg |
| voyager-nec-chair | Black Grey | color | 14500.00 | 12 | voyager-nec-chair-black-grey.jpg |
| voyager-nec-chair | Brown Beige | color | 14500.00 | 8 | voyager-nec-chair-brown-beige.jpg |

---

### Sheet 3: `Specifications` (Detailed Specs)

**Fill one row per spec.** Each product should have at least 8–15 specs.

| # | Column Name | Required? | What to Fill | Example |
|---|-------------|-----------|--------------|---------|
| 1 | **product_slug** | ✅ YES | The slug of the parent product | nova-sofa-bed-without-storage |
| 2 | **spec_category** | ✅ YES | Group name (see list below) | Dimensions |
| 3 | **spec_name** | ✅ YES | Specification label | Length |
| 4 | **spec_value** | ✅ YES | Specification value | 190 cm |

**Recommended specs per product (fill as many as applicable):**

| Spec Category | Spec Names to Include |
|---------------|----------------------|
| **Dimensions** | Length, Width, Height, Seat Height, Bed Length (if applicable) |
| **Material** | Primary Material, Frame Material, Fabric Type, Upholstery |
| **Weight** | Weight Capacity (kg), Product Weight (kg) |
| **Assembly** | Assembly Required (Yes/No/Minimal), Assembly Time |
| **Features** | Any unique features — Foldable, Storage, Reclining, Rocking, Adjustable Height, Removable Covers, etc. |
| **Capacity** | Seating Capacity (persons) |

**Example rows for one product:**

| product_slug | spec_category | spec_name | spec_value |
|-------------|---------------|-----------|------------|
| nova-sofa-bed-without-storage | Dimensions | Length | 190 cm |
| nova-sofa-bed-without-storage | Dimensions | Width | 90 cm |
| nova-sofa-bed-without-storage | Dimensions | Height | 85 cm |
| nova-sofa-bed-without-storage | Dimensions | Seat Height | 45 cm |
| nova-sofa-bed-without-storage | Dimensions | Bed Length | 180 cm |
| nova-sofa-bed-without-storage | Material | Primary Material | Fabric Upholstery, Hardwood & Metal Frame |
| nova-sofa-bed-without-storage | Material | Frame Material | Hardwood with Metal Reinforcement |
| nova-sofa-bed-without-storage | Material | Fabric Type | Premium Polyester Blend |
| nova-sofa-bed-without-storage | Weight | Weight Capacity | 300 kg |
| nova-sofa-bed-without-storage | Weight | Product Weight | 45 kg |
| nova-sofa-bed-without-storage | Capacity | Seating Capacity | 3 persons |
| nova-sofa-bed-without-storage | Assembly | Assembly Required | Yes |
| nova-sofa-bed-without-storage | Assembly | Assembly Time | 2-3 hours |
| nova-sofa-bed-without-storage | Features | Folding Mechanism | Smooth Pull-Out |
| nova-sofa-bed-without-storage | Features | Mattress Type | Spring Mattress |
| nova-sofa-bed-without-storage | Features | Removable Covers | Yes |

---

## PART 2: Product Images — Google Drive Upload

### Folder Structure

Create this **exact** folder structure in Google Drive:

```
📁 Spacecrafts_Product_Images/
│
├── 📁 nova-sofa-bed-without-storage/
│   ├── nova-sofa-bed-without-storage-1.jpg       ← Main/hero image (shown in listings)
│   ├── nova-sofa-bed-without-storage-2.jpg       ← Angle 2
│   ├── nova-sofa-bed-without-storage-3.jpg       ← Angle 3
│   ├── nova-sofa-bed-without-storage-4.jpg       ← Angle 4 (optional)
│   ├── nova-sofa-bed-without-storage-sandy-brown.jpg    ← Color: Sandy Brown
│   ├── nova-sofa-bed-without-storage-grey.jpg           ← Color: Grey
│   ├── nova-sofa-bed-without-storage-navy-blue.jpg      ← Color: Navy Blue
│   └── nova-sofa-bed-without-storage-charcoal-black.jpg ← Color: Charcoal Black
│
├── 📁 voyager-nec-chair/
│   ├── voyager-nec-chair-1.jpg
│   ├── voyager-nec-chair-2.jpg
│   ├── voyager-nec-chair-3.jpg
│   ├── voyager-nec-chair-black-grey.jpg
│   └── voyager-nec-chair-brown-beige.jpg
│
├── 📁 proton-study-desk/
│   ├── proton-study-desk-1.jpg
│   ├── proton-study-desk-2.jpg
│   ├── proton-study-desk-3.jpg
│   └── proton-study-desk-natural-wood.jpg
│
└── ... (one folder per product, using the product slug as folder name)
```

### Image Naming Rules

| Image Type | Naming Pattern | Example |
|------------|---------------|---------|
| **Product images** (numbered 1–5) | `{slug}-1.jpg`, `{slug}-2.jpg`, `{slug}-3.jpg` ... | `nova-sofa-bed-without-storage-1.jpg` |
| **Color variant images** (one per color) | `{slug}-{color-lowercase-hyphens}.jpg` | `nova-sofa-bed-without-storage-sandy-brown.jpg` |

### Image Rules

| Rule | Details |
|------|---------|
| **Minimum images per product** | 3 product images + 1 per color variant |
| **Maximum images per product** | 5 product images + 1 per color variant |
| **Image 1 (`-1.jpg`)** | This is the **main/hero image** — shown on product listings, search results, and cart |
| **Format** | JPEG (`.jpg`) or PNG (`.png`) |
| **Minimum resolution** | 1200 × 1200 pixels |
| **Recommended resolution** | 1500 × 1500 pixels or higher |
| **Background** | White or light neutral background preferred |
| **File naming** | **Lowercase, hyphens only, NO spaces** |
| **Color image naming** | Must match the variant name (lowercase, spaces → hyphens). E.g., variant "Sandy Brown" → `sandy-brown` |

### How to Convert Color Name to Filename

| Variant Name (in Sheet) | Image Filename Suffix |
|--------------------------|----------------------|
| Sandy Brown | `-sandy-brown.jpg` |
| Navy Blue | `-navy-blue.jpg` |
| Charcoal Black | `-charcoal-black.jpg` |
| Black Grey | `-black-grey.jpg` |
| Natural Wood | `-natural-wood.jpg` |
| Dark Walnut | `-dark-walnut.jpg` |

---

## PART 3: Available Categories & Brands

### Categories (use exact names)

| Category Name | What Goes Here |
|---------------|---------------|
| Sofas | Regular sofas, sectionals, loveseats |
| Sofa Beds | Sofa-cum-beds, futons, convertible sofas |
| Chairs | Office chairs, accent chairs, recliners, rocking chairs |
| Tables | Coffee tables, console tables, side tables |
| Beds | King/queen/single beds, bunk beds, cots |
| Dining Sets | Dining tables with chairs (sets) |
| Outdoor Furniture | Patio sets, garden furniture, hammocks |
| Racks & Storage | Bookshelves, TV units, wardrobes, cabinets |
| Mattresses | All mattress types |
| Home Decor | Decorative items, cushions, rugs, lighting |

> **New category?** Just write the category name you want and we'll add it to the system.

### Brands (use exact names)

| Brand Name |
|------------|
| Spacecrafts |
| Orion Furnishings |
| Stellar Home |
| Nova Interiors |

> **New brand?** Just write the brand name and we'll add it.

---

## PART 4: Tags Reference

Use these tags in the `tags` column (comma-separated, lowercase). Pick all that apply:

### Room Tags
| Tag | Meaning |
|-----|---------|
| `living-room` | Living room furniture |
| `bed-room` | Bedroom furniture |
| `study-room` | Study/office room |
| `dining-room` | Dining area |

### Type Tags
| Tag | Meaning |
|-----|---------|
| `sofa-bed` | Convertible sofa bed |
| `space-saving` | Compact/multifunctional |
| `multipurpose` | Multiple functions |
| `foldable` | Can be folded |
| `storage` | Has built-in storage |
| `ergonomic` | Ergonomically designed |

### Material Tags
| Tag | Meaning |
|-----|---------|
| `fabric` | Fabric upholstery |
| `leather` | Leather material |
| `wood` | Wooden construction |
| `steel` | Steel frame |
| `metal` | Metal construction |
| `mesh` | Mesh material |

### Promo Tags
| Tag | Meaning |
|-----|---------|
| `best-offer` | High discount product |
| `new-arrival` | Newly added |
| `premium` | Premium/luxury item |

---

## PART 5: Related Products

For each product, you need to list 3–5 **related product slugs**. These are products that appear in the "You may also like" section on the product page.

**How to fill this:**
- Use the **slug** (not the name) of related products
- Separate multiple slugs with commas
- Pick products from the **same or complementary categories**

**Example:**
If you're adding a sofa bed, relate it to other sofa beds, chairs, or beds:
```
voyager-nec-chair,jupiter-bunk-cum-futon-cot,luminous-steel-cot,zenith-rocking-easy-chair
```

### Currently Existing Product Slugs (for reference)

| Product Name | Slug |
|-------------|------|
| Nova Sofa Bed Without Storage | `nova-sofa-bed-without-storage` |
| Voyager NEC Chair | `voyager-nec-chair` |
| Halley Sofa Cum Bed Single | `halley-sofa-cum-bed-single` |
| Proton Study Desk | `proton-study-desk` |
| Jupiter Bunk Cum Futon Cot | `jupiter-bunk-cum-futon-cot` |
| Luminous Steel Cot | `luminous-steel-cot` |
| Sputnic Convertable Wooden Leg Bunk Bed | `sputnic-convertable-wooden-leg-bunk-bed` |
| Rainbow Convertable Bunk Bed | `rainbow-convertable-bunk-bed` |
| Zenith Rocking Easy Chair | `zenith-rocking-easy-chair` |
| Modern L-Shape Sofa with Storage | `modern-l-shape-sofa-storage` |
| 3-Seater Recliner Sofa Leather | `3-seater-recliner-sofa-leather` |
| Fabric Loveseat Sofa Compact | `fabric-loveseat-sofa-compact` |
| King Size Upholstered Bed Hydraulic | `king-size-upholstered-bed-hydraulic` |
| Solid Wood Queen Bed Platform | `solid-wood-queen-bed-platform` |
| Metal Bunk Bed Kids Twin | `metal-bunk-bed-kids-twin` |
| 6-Seater Solid Wood Dining Set | `6-seater-solid-wood-dining-set` |
| Modern Glass Top Dining Table 4 | `modern-glass-top-dining-table-4` |
| Ergonomic Executive Office Chair | `ergonomic-executive-office-chair` |
| Computer Desk Storage Home Office | `computer-desk-storage-home-office` |
| Contemporary TV Unit LED Lights | `contemporary-tv-unit-led-lights` |
| Wooden TV Stand Rustic | `wooden-tv-stand-rustic` |
| Modular Wardrobe 3-Door Mirror | `modular-wardrobe-3-door-mirror` |
| 5-Tier Bookshelf Ladder | `5-tier-bookshelf-ladder` |
| Accent Chair Ottoman Velvet | `accent-chair-ottoman-velvet` |
| Set 4 Dining Chairs Modern | `set-4-dining-chairs-modern` |
| Outdoor Patio Set 4-Seater | `outdoor-patio-set-4-seater` |
| Hammock With Stand Portable | `hammock-with-stand-portable` |
| Coffee Table Storage Lift Top | `coffee-table-storage-lift-top` |
| Console Table Marble Gold | `console-table-marble-gold` |

> **Tip:** When adding new products, you can reference other new products too — just make sure the slugs match exactly.

---

## PART 6: Slug Rules (Important!)

The **slug** is the most important identifier. It is used in:
- Website URLs (e.g., `spacecraftsfurniture.in/products/nova-sofa-bed-without-storage`)
- Image folder names in Google Drive
- Image file names
- Related product references

### Slug Rules:
1. **Lowercase only** — no capital letters
2. **Hyphens only** — no spaces, underscores, or special characters
3. **Must be unique** — no two products can have the same slug
4. **Keep it descriptive but short** — include key identifying words
5. **No numbers at the start** — avoid starting with a number if possible

### Good Slug Examples:
| Product Name | Good Slug ✅ |
|-------------|-------------|
| Nova Sofa Bed Without Storage | `nova-sofa-bed-without-storage` |
| Voyager NEC Chair | `voyager-nec-chair` |
| 3-Seater Recliner Sofa | `3-seater-recliner-sofa-leather` |
| Modern L-Shape Sofa with Storage | `modern-l-shape-sofa-storage` |

### Bad Slug Examples:
| Bad Slug ❌ | Why It's Wrong |
|-------------|---------------|
| `Nova Sofa Bed` | Has spaces and capitals |
| `nova_sofa_bed` | Uses underscores |
| `nova sofa bed` | Has spaces |
| `NOVA-SOFA-BED` | Has capitals |

---

## ✅ Final Checklist Before Submitting

Before sharing the Google Sheet and Drive folder, make sure:

### Google Sheet:
- [ ] Every product has: **name, slug, category, brand, description, price, stock, material, dimensions (L/W/H), tags**
- [ ] All **slugs are unique** and follow the rules (lowercase, hyphens, no spaces)
- [ ] **Related product slugs** are filled for every product (3–5 related products)
- [ ] **Image filenames** are filled in columns `image_1_filename` through `image_3_filename` (minimum 3)
- [ ] **Variants sheet** has all color options with product_slug, variant_name, price, stock, image_filename
- [ ] **Specifications sheet** has at least: Dimensions, Material, Weight, Assembly info for each product
- [ ] `discount_price` is less than `price` (where filled)
- [ ] `tags` use lowercase hyphens only (e.g., `living-room`, not `Living Room`)

### Google Drive:
- [ ] One **folder per product** named with the **product slug**
- [ ] Each folder has **at least 3 product images** (`{slug}-1.jpg`, `-2.jpg`, `-3.jpg`)
- [ ] Each folder has **1 image per color variant** (`{slug}-{color}.jpg`)
- [ ] All filenames are **lowercase, hyphens, no spaces**
- [ ] Images are **at least 1200×1200 pixels**, JPEG or PNG
- [ ] Image filenames in Drive **match exactly** with filenames in the Google Sheet
- [ ] Drive folder is **shared** (view access) and link sent to us

---

## Quick Reference: Complete Data for ONE Product

Here's everything needed for a single product (e.g., Nova Sofa Bed):

### In the Google Sheet:

**Products sheet (1 row):**
```
name: Nova Sofa Bed Without Storage
slug: nova-sofa-bed-without-storage
category_name: Sofa Beds
brand_name: Spacecrafts
description: The Nova sofa bed is a versatile piece...
price: 30000.00
discount_price: 21186.00
stock: 10
material: Fabric Upholstery, Hardwood & Metal Frame
warranty_period_months: 12
warranty_type: Standard
delivery_info: Free Delivery across India | 7-10 Days
dimensions_length_m: 1.9
dimensions_width_m: 0.9
dimensions_height_m: 0.85
tags: sofa-bed,space-saving,living-room,fabric,multipurpose,bed-room,best-offer
best_seller: TRUE
is_offered: TRUE
is_active: TRUE
assembly_cost: 0.00
assembly_time_hours: 2.5
care_instructions: Vacuum clean fabric weekly...
emi_enabled: TRUE
return_days: 30
is_limited_stock: FALSE
related_product_slugs: voyager-nec-chair,jupiter-bunk-cum-futon-cot,luminous-steel-cot,sputnic-convertable-wooden-leg-bunk-bed
image_1_filename: nova-sofa-bed-without-storage-1.jpg
image_2_filename: nova-sofa-bed-without-storage-2.jpg
image_3_filename: nova-sofa-bed-without-storage-3.jpg
image_4_filename: nova-sofa-bed-without-storage-4.jpg
```

**Variants sheet (4 rows):**
```
nova-sofa-bed-without-storage | Sandy Brown   | color | 21186.00 | 15 | nova-sofa-bed-without-storage-sandy-brown.jpg
nova-sofa-bed-without-storage | Grey          | color | 21186.00 | 12 | nova-sofa-bed-without-storage-grey.jpg
nova-sofa-bed-without-storage | Navy Blue     | color | 21186.00 | 10 | nova-sofa-bed-without-storage-navy-blue.jpg
nova-sofa-bed-without-storage | Charcoal Black| color | 21186.00 |  8 | nova-sofa-bed-without-storage-charcoal-black.jpg
```

**Specifications sheet (16 rows):**
```
nova-sofa-bed-without-storage | Dimensions | Length            | 190 cm
nova-sofa-bed-without-storage | Dimensions | Width             | 90 cm
nova-sofa-bed-without-storage | Dimensions | Height            | 85 cm
nova-sofa-bed-without-storage | Dimensions | Seat Height       | 45 cm
nova-sofa-bed-without-storage | Dimensions | Bed Length         | 180 cm
nova-sofa-bed-without-storage | Material   | Primary Material   | Fabric Upholstery, Hardwood & Metal Frame
nova-sofa-bed-without-storage | Material   | Frame Material     | Hardwood with Metal Reinforcement
nova-sofa-bed-without-storage | Material   | Fabric Type        | Premium Polyester Blend
nova-sofa-bed-without-storage | Weight     | Weight Capacity    | 300 kg
nova-sofa-bed-without-storage | Weight     | Product Weight     | 45 kg
nova-sofa-bed-without-storage | Capacity   | Seating Capacity   | 3 persons
nova-sofa-bed-without-storage | Assembly   | Assembly Required  | Yes
nova-sofa-bed-without-storage | Assembly   | Assembly Time      | 2-3 hours
nova-sofa-bed-without-storage | Features   | Folding Mechanism  | Smooth Pull-Out
nova-sofa-bed-without-storage | Features   | Mattress Type      | Spring Mattress
nova-sofa-bed-without-storage | Features   | Removable Covers   | Yes
```

### In Google Drive:

```
📁 nova-sofa-bed-without-storage/
├── nova-sofa-bed-without-storage-1.jpg          (Main image)
├── nova-sofa-bed-without-storage-2.jpg          (Angle 2)
├── nova-sofa-bed-without-storage-3.jpg          (Angle 3)
├── nova-sofa-bed-without-storage-4.jpg          (Angle 4)
├── nova-sofa-bed-without-storage-sandy-brown.jpg
├── nova-sofa-bed-without-storage-grey.jpg
├── nova-sofa-bed-without-storage-navy-blue.jpg
└── nova-sofa-bed-without-storage-charcoal-black.jpg
```

---

*Once you share the completed Google Sheet and Google Drive folder with us, we will import all products, upload images to our server, and make them live on the website.*
