# Updated: Categories & Brands Filtering

## Changes Made

### ✅ SQL Migration Updated
**File**: [EXECUTE_THIS_IN_SUPABASE.sql](EXECUTE_THIS_IN_SUPABASE.sql)

**New Steps Added:**
1. Added `is_active` column to brands table
2. Deactivate ALL brands
3. Activate ONLY SpaceCraft brand
4. Deactivate ALL categories (already there)
5. Activate ONLY 6 categories needed for products

### ✅ Frontend Updated
**File**: [app/products/page.js](app/products/page.js)

**Changes:**
- Brands filter now shows only `is_active = true` brands
- Categories filter already had the filter from before

## Current Setup After Migration

### Active Brands (1):
```
✅ SpaceCraft
```

### Inactive Brands (All Others):
```
⚫ Orion Furnishings
⚫ Stellar Home
⚫ Nova Interiors
```

### Active Categories (6):
```
✅ Sofa Cum Beds (Nova, Halley)
✅ Lazy Chairs (Voyager)
✅ Study Tables (Proton)
✅ Bunk Beds (Jupiter, Sputnic, Rainbow)
✅ Metal Cots (Luminous)
✅ Rocking Chairs (Zenith)
```

### Inactive Categories (4):
```
⚫ Sofas
⚫ Chairs
⚫ Tables
⚫ Beds
⚫ Dining Sets
⚫ Outdoor Furniture
⚫ Racks & Storage
⚫ Mattresses
⚫ Home Decor
⚫ Top Brands
```

## What Users Will See

### On `/products` page:
✅ **Categories Filter** - Shows only 6 active categories
✅ **Brands Filter** - Shows only SpaceCraft brand
✅ **Products** - Shows only 9 SpaceCraft products

## How to Run

1. **Copy** entire [EXECUTE_THIS_IN_SUPABASE.sql](EXECUTE_THIS_IN_SUPABASE.sql)
2. **Paste** in Supabase SQL Editor
3. **Click** RUN

## Verification Queries (After Running)

```sql
-- Should show: 1 (SpaceCraft)
SELECT COUNT(*) as active_brands FROM brands WHERE is_active = true;

-- Should show: 3 (Orion, Stellar, Nova)
SELECT COUNT(*) as inactive_brands FROM brands WHERE is_active = false;

-- Should show: 6
SELECT COUNT(*) as active_categories FROM categories WHERE is_active = true;

-- Should show: 4
SELECT COUNT(*) as inactive_categories FROM categories WHERE is_active = false;
```

## Activate More Brands/Categories Later

### Activate a Brand:
```sql
UPDATE brands SET is_active = true 
WHERE slug = 'brand-slug';
```

### Activate a Category:
```sql
UPDATE categories SET is_active = true 
WHERE slug = 'category-slug';
```

---

**Status: Ready to Deploy! 🚀**
