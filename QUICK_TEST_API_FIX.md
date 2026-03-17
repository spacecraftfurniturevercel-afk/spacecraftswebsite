# Quick Test - Verify the Fix Works

You can now test the API immediately. Here's exactly what to do:

## Step 1: Open Browser DevTools
1. Open your app in browser: `http://localhost:3000`
2. Press **F12** to open DevTools
3. Go to **Console** tab

## Step 2: Log In
1. Click "Sign In" or "Account"
2. Complete Google OAuth login
3. Wait for page to load

## Step 3: Test Address API
Copy and paste this into the **Console** tab:

```javascript
// Test POST to add address
const res = await fetch('http://localhost:3000/api/addresses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: "Test User",
    phone: "9876543210",
    address_line1: "123 Main St",
    address_line2: "Apt 4",
    city: "Chennai",
    state: "Tamil Nadu",
    postal_code: "600001",
    is_default: true
  })
})

const data = await res.json()
console.log('Status:', res.status)
console.log('Response:', data)
```

### Expected Output
```
Status: 200
Response: {
  success: true,
  address: {
    id: "...",
    user_id: "...",
    full_name: "Test User",
    ...
  },
  message: "Address added successfully"
}
```

❌ **If you see**:
```
Status: 401
Response: { error: 'Not authenticated' }
```

Then:
1. Make sure you're logged in
2. Check cookie exists (see Step 4)
3. Check database tables exist (see Step 5)
4. Check RLS policies enabled (see Step 5)

## Step 4: Verify Auth Cookie
Still in Console, run:

```javascript
// Check if auth cookie exists
document.cookie
// Should see something with "sb-..."
```

## Step 5: Check Database

If still getting error, verify in Supabase:

1. **Check tables exist**:
   - Go to Supabase Dashboard → Tables
   - Should see: `profiles`, `addresses`, `cart_items`, `orders`
   - If missing, see SUPABASE_SETUP_CHECKLIST.md

2. **Check RLS is enabled**:
   - Click table → RLS toggle
   - Should be **ON** for addresses table
   - Should see policies like `"Users can see their own addresses"`

3. **Check addresses table columns**:
   - Click table → Columns tab
   - Should have: `user_id`, `full_name`, `phone`, `address_line1`, etc.
   - Should NOT have `profile_id`

4. **Check RLS policy**:
   - Click table → RLS → Policies tab
   - Should see policy with `auth.uid() = user_id`

## Step 6: Test in App

After API works in console, test in the actual application:

1. Go to `/account` page
2. Click "Addresses" tab
3. Click "Add New Address"
4. Fill the form with test data
5. Click "Save Address"

### Expected
- Address appears in list
- No errors in console
- No "Not authenticated" message

### If Not Working
- Check browser console for errors (F12)
- Check Network tab → click /api/addresses request
- Look at Response tab for error details

---

## Test Checklist

Run these in order:

- [ ] Can log in with Google
- [ ] Profile appears at /account
- [ ] API call from console returns 200
- [ ] Address saves from app UI
- [ ] Address appears in list
- [ ] Can edit address
- [ ] Can delete address
- [ ] Can add to cart
- [ ] Cart count updates
- [ ] No console errors

---

## Common Issues & Solutions

### "Not authenticated" in API response
**Solution**: 
1. Check if you're logged in (look for profile name in header)
2. Check auth cookie exists: Run `document.cookie` in console
3. Try logging out and back in
4. Check if addresses table exists with `user_id` column

### No addresses table
**Solution**: 
Create it using SQL from SUPABASE_SETUP_CHECKLIST.md Step 4.2

### RLS policy error
**Solution**: 
Enable RLS and create policies using SUPABASE_SETUP_CHECKLIST.md Step 5

### "Failed to fetch"
**Solution**: 
Check browser Network tab for CORS errors. Verify CORS origins in Supabase Settings.

---

## Next Steps

1. Run the console test above
2. If it returns status 200 → Everything works! ✅
3. If not → Check database configuration above
4. Then test in the actual app (/account page)

---

**Expected Time**: 2-3 minutes
**Difficulty**: Easy (just copy/paste and check)

Let me know what the console test returns!
