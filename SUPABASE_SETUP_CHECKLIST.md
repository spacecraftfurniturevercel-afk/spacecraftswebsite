# Supabase Setup Checklist

Complete these steps to finalize authentication and get the application fully operational.

---

## Step 1: Enable Google OAuth Provider

**Location**: Supabase Dashboard → Authentication → Providers

1. Click on **Google**
2. Toggle **Enabled** to ON
3. Enter your Google OAuth credentials:
   - **Client ID**: Your Google Cloud Console Client ID
   - **Client Secret**: Your Google Cloud Console Client Secret
4. Click **Save**

✅ **Done**: Google login will now work

---

## Step 2: Add CORS Origins

**Location**: Supabase Dashboard → Authentication → URL Configuration

Click **Add URL** and add these origins:

```
http://localhost:3000
https://spacecraftsfurniture.vercel.app
```

✅ **Done**: Browser requests from your app domains will be accepted

---

## Step 3: Configure OAuth Redirect URLs

**Location**: Supabase Dashboard → Authentication → URL Configuration

Under "Redirect URLs", add:

```
http://localhost:3000/auth/callback
https://spacecraftsfurniture.vercel.app/auth/callback
```

Also add these to your **Google Cloud Console** → OAuth 2.0 Client ID → Authorized redirect URIs

✅ **Done**: OAuth callback will redirect to your app

---

## Step 4: Create Database Tables

**Location**: Supabase Dashboard → SQL Editor

Copy and paste the entire contents of `EXECUTE_THIS_IN_SUPABASE.sql` into the SQL editor and run it.

Or manually run these commands:

### 4.1 Create Profiles Table

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 4.2 Create Addresses Table

```sql
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

### 4.3 Create Cart Items Table

```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

### 4.4 Create Orders Table

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

✅ **Done**: Database tables are created

---

## Step 5: Enable Row Level Security (RLS)

**Location**: Supabase Dashboard → Tables → Each Table

For each table: `profiles`, `addresses`, `cart_items`, `orders`

1. Click the table
2. Click **RLS** at the top
3. Toggle **Enable RLS** to ON
4. Click **Create Policy**

### 5.1 Profiles RLS Policy

```sql
CREATE POLICY "Users can see their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 5.2 Addresses RLS Policy

```sql
CREATE POLICY "Users can see their own addresses"
ON addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
ON addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON addresses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON addresses FOR DELETE
USING (auth.uid() = user_id);
```

### 5.3 Cart Items RLS Policy

```sql
CREATE POLICY "Users can see their own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
```

### 5.4 Orders RLS Policy

```sql
CREATE POLICY "Users can see their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
USING (auth.uid() = user_id);
```

✅ **Done**: RLS policies protect user data

---

## Step 6: Verify Settings

### Check Email Provider

**Location**: Supabase Dashboard → Authentication → Providers

- [ ] **Email/Password** - Should be enabled (for backup)
- [ ] **Google** - Should be enabled

### Check Email Configuration

**Location**: Supabase Dashboard → Authentication → Email Templates

Verify that email templates are configured (for password resets, confirmations, etc.)

### Check User Limits

**Location**: Supabase Dashboard → Settings → Usage

- Free tier supports enough users for development/testing
- Upgrade if needed for production

✅ **Done**: Settings verified

---

## Step 7: Test Everything

### Test 1: Sign In with Google

```
1. Go to http://localhost:3000
2. Click "Sign In"
3. Choose "Google"
4. Complete Google OAuth flow
5. Should redirect to http://localhost:3000/auth/callback
6. Should be logged in and see profile in /account
```

**Expected**: ✅ Profile created automatically, no errors

### Test 2: Add Address

```
1. Go to http://localhost:3000/account
2. Click "Addresses" tab
3. Click "Add New Address"
4. Fill form: name, phone, email, address, city, state, postal code
5. Click "Save Address"
```

**Expected**: ✅ Address saved, appears in list immediately, no 401 error

### Test 3: Add to Cart

```
1. Go to http://localhost:3000/products
2. Click on any product
3. Click "Add to Cart"
4. Check cart count in header (should increment)
5. Go to /cart page
```

**Expected**: ✅ Item in cart, cart count updated, no 401 error

### Test 4: Checkout

```
1. Go to /cart page
2. Click "Proceed to Checkout"
3. Select saved address (or add new one)
4. Complete checkout flow
```

**Expected**: ✅ All steps work, order created, no auth errors

---

## Step 8: Monitor for Errors

### Open Browser DevTools (F12)

**Console Tab**:
- Watch for any red error messages
- Common auth errors to look for:
  - "Not authenticated"
  - "Session not found"
  - "RLS violation"

**Network Tab**:
- Click on API requests (e.g., `/api/cart/add`)
- Check "Authorization" header is present:
  ```
  Authorization: Bearer eyJhbGc...
  ```
- Check response status (should be 200, not 401)

**Application Tab**:
- Cookies → Look for `sb-{project-id}-auth-token`
- LocalStorage → Look for `supabase.auth.token`

✅ **Done**: Can monitor for issues

---

## Step 9: Deploy to Production

When ready to deploy:

1. **Update Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your Supabase anon key

2. **Deploy to Vercel**
   ```bash
   npm run build
   git push
   # Vercel auto-deploys
   ```

3. **Update Google OAuth**
   - Add `https://spacecraftsfurniture.vercel.app` to Google Cloud authorized domains
   - Add `https://spacecraftsfurniture.vercel.app/auth/callback` to redirect URIs

4. **Update Supabase CORS**
   - Already added in Step 2

✅ **Done**: Production ready

---

## Troubleshooting

### "Not authenticated" on API calls?

1. Check browser DevTools → Application → Cookies
2. Should have `sb-{project-id}-auth-token` cookie
3. If not, go to /login and sign in again
4. Check Network tab → Authorization header present?

### Profile not created on login?

1. Open Supabase → Tables → profiles
2. Does a row exist for your user ID?
3. If not, AuthProvider failed - check console logs
4. Manually insert: 
   ```sql
   INSERT INTO profiles (id, email, full_name, created_at, updated_at)
   VALUES ('your-user-id', 'your@email.com', 'Your Name', now(), now())
   ```

### RLS policy errors?

1. Go to Supabase → Table → RLS
2. Check policy is enabled (toggle should be ON)
3. Verify USING clause matches your auth context
4. Test with Supabase's built-in query editor

### Addresses not loading in checkout?

1. Check RLS is enabled on addresses table
2. Verify RLS policy allows SELECT
3. Check addresses table has rows with your user_id
4. Check Network tab for error response

---

## Quick Command Reference

### Create all tables at once
Copy entire `EXECUTE_THIS_IN_SUPABASE.sql` and run in SQL Editor

### Create RLS policies at once
```bash
# In Supabase SQL Editor, run all 5.1-5.4 policies together
```

### Test if RLS is working
```sql
-- Should return only YOUR records
SELECT * FROM profiles;
SELECT * FROM addresses;
```

### Check authentication status
```javascript
// In browser console
const { data: { session } } = await supabase.auth.getSession()
console.log(session)
```

---

## Done Checklist

- [ ] Step 1: Google OAuth enabled
- [ ] Step 2: CORS origins added
- [ ] Step 3: Redirect URLs configured
- [ ] Step 4: Database tables created
- [ ] Step 5: RLS policies enabled
- [ ] Step 6: Settings verified
- [ ] Step 7: All tests passing
- [ ] Step 8: No console errors
- [ ] Step 9: (Optional) Production deployed

**All done?** → Application is fully authenticated and ready to use! 🎉

---

## Support Documents

- **AUTHENTICATION_FIXES_COMPLETE.md** - Code changes made
- **DATABASE_AUTHENTICATION_FIX.md** - Detailed schema & policies
- **DEVELOPER_QUICK_REFERENCE.md** - API endpoint docs

---

**Status**: Ready for Supabase Configuration
**Next**: Follow steps 1-9 above in Supabase dashboard
