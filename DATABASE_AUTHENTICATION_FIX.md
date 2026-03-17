# Authentication & Database Issues - Analysis & Solutions

## Issues Found

### 1. **Session/Auth Cookie Not Being Passed to API Routes**
- **Problem**: Browser doesn't automatically pass Supabase auth cookies to API routes
- **Solution**: Updated `createSupabaseRouteHandlerClient` to use proper SSR cookie handling with `getAll()` and `setAll()`
- **Status**: ✅ FIXED

### 2. **Profile Not Created After Google Login**
- **Problem**: User signs in with Google, but profile doesn't exist in `profiles` table
- **Result**: All API calls fail because profile lookup returns 0 rows (PGRST116 error)
- **Solution**: Updated `AuthProvider.js` to automatically create profile on first login
- **Status**: ✅ FIXED

### 3. **Missing Authorization Header in Client API Calls**
- **Problem**: Account page wasn't sending auth token to API endpoints
- **Solution**: Created `authenticatedFetch()` helper that automatically adds Bearer token
- **Status**: ✅ FIXED

---

## Database Schema Requirements

### Required Tables & Columns

```sql
-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(500) NOT NULL,
  address_line2 VARCHAR(500),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, product_id)
);

-- 4. PRODUCTS TABLE (must exist for references)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID,
  slug VARCHAR(500) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Required Indexes

```sql
-- ADDRESSES INDEXES
CREATE INDEX idx_addresses_profile_id ON public.addresses(profile_id);
CREATE INDEX idx_addresses_is_default ON public.addresses(is_default);

-- CART_ITEMS INDEXES
CREATE INDEX idx_cart_items_profile_id ON public.cart_items(profile_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- PROFILES INDEXES
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ADDRESSES POLICIES
CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

-- CART_ITEMS POLICIES
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  USING (
    profile_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );
```

---

## Supabase Configuration Checklist

### 1. **Authentication Settings**
- ✅ Go to: `Project Settings → Authentication → Providers`
- ✅ Enable Google Provider
- ✅ Add Google OAuth credentials
- ✅ Set Redirect URLs to include `http://localhost:3000/auth/callback` and `https://spacecraftsfurniture.vercel.app/auth/callback`

### 2. **Database Security**
- ✅ Enable RLS (Row Level Security) on all tables
- ✅ Create appropriate RLS policies
- ✅ Test policies with different users

### 3. **API Keys**
- ✅ Anon Key: Used in browser (already in `.env.local`)
- ✅ Service Role Key: Used in backend only (already in `.env.local`)

### 4. **CORS Settings**
- ✅ Go to: `Project Settings → API`
- ✅ Add your domain to CORS Allowed Origins:
  ```
  http://localhost:3000
  https://spacecraftsfurniture.vercel.app
  ```

---

## Testing Checklist After Fixes

```
1. ✅ User signs in with Google
2. ✅ Profile is automatically created in DB
3. ✅ Navigate to /account page
4. ✅ Profile tab loads user info
5. ✅ Click "Add New Address"
6. ✅ Fill form and submit
7. ✅ Address saved successfully in DB
8. ✅ Address appears in list
9. ✅ Edit address works
10. ✅ Delete address works
11. ✅ Cart API returns items
12. ✅ Add to cart works
```

---

## Files Modified

1. **lib/supabaseClient.js** - Fixed SSR cookie handling
2. **app/providers/AuthProvider.js** - Fixed profile creation on login
3. **lib/authenticatedFetch.js** - NEW: Helper for authenticated API calls
4. **app/account/page.js** - Updated to use authenticatedFetch

---

## Important Notes

1. **Always use `authenticatedFetch()` for API calls** that require authentication
2. **Profile is auto-created** on first Google login - no manual action needed
3. **RLS Policies** protect user data at the database level
4. **Service Role Key** should NEVER be exposed in browser - keep in `.env` only

---

## Troubleshooting

If you still get "Not authenticated" errors:

1. Check browser console for errors
2. Verify session is being retrieved: `console.log(await supabase.auth.getSession())`
3. Check that cookies are being sent: DevTools → Network → Check request headers
4. Verify profile exists in Supabase for logged-in user
5. Check Supabase database logs for RLS policy violations

