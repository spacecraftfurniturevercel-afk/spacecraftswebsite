# ✅ RAZORPAY REQUIREMENTS CHECKLIST

## 📋 What You Need to Get From Razorpay

This document lists everything you need to collect from Razorpay to make the payment system work.

---

## 🔑 API CREDENTIALS (MANDATORY)

### Credential 1: Key ID (Public Key)
- **Where to find:** Razorpay Dashboard → Settings → API Keys
- **Format:** `rzp_test_xxxxx` (test) or `rzp_live_xxxxx` (live)
- **Where to use:** 
  - Frontend: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - Backend: `RAZORPAY_KEY_ID`
- **Example:** `rzp_test_0123456789abcde`
- **Status:** ⏳ Not yet obtained

### Credential 2: Key Secret (Private Key)
- **Where to find:** Razorpay Dashboard → Settings → API Keys → Reveal Secret
- **Format:** Long alphanumeric string
- **Where to use:** 
  - Backend only: `RAZORPAY_KEY_SECRET`
  - **NEVER expose to frontend!**
- **Example:** `aBcDeFgHiJkLmNoPqRsT1234`
- **Status:** ⏳ Not yet obtained
- **⚠️ IMPORTANT:** Keep this secret! Never commit to git, never share!

---

## 🔐 WEBHOOK SETUP (OPTIONAL BUT RECOMMENDED)

### Webhook URL
- **Purpose:** Receive real-time payment notifications
- **Where to configure:** Razorpay Dashboard → Settings → Webhooks
- **URL to add:** `https://yourdomain.com/api/razorpay/webhook`
  - For local testing: Can use ngrok tunnel
  - For production: Use your actual domain

### Webhook Signing Secret
- **Where to find:** After creating webhook in Razorpay
- **Where to use:** `RAZORPAY_WEBHOOK_SECRET` (optional)
- **Purpose:** Verify webhook authenticity
- **Status:** ⏳ Not yet obtained

### Webhook Events to Enable
- [ ] `payment.authorized` - When payment is authorized
- [ ] `payment.failed` - When payment fails
- [ ] `payment.captured` - When payment is captured
- [ ] `refund.created` - When refund is initiated
- [ ] `order.paid` - When order is fully paid

---

## 🌍 ACCOUNT INFORMATION (FOR YOUR RECORDS)

### Company Details
- [ ] Business Name: `_________________`
- [ ] Business Email: `_________________`
- [ ] Business Phone: `_________________`
- [ ] Website: `_________________`

### Account Type
- [ ] Standard Account
- [ ] Custom Account
- Account Status: ⏳ Pending KYC

---

## 📝 ENVIRONMENT VARIABLES TEMPLATE

Once you have the credentials, add them to `.env.local`:

```bash
# ============================================
# RAZORPAY PAYMENT CONFIGURATION
# ============================================

# API Keys (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxx              # Key ID from dashboard
RAZORPAY_KEY_SECRET=your_secret_key_here    # Key Secret (KEEP SECRET!)

# Public Key for Frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx  # Same as RAZORPAY_KEY_ID

# Domain Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Webhook (Optional)
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here # Optional webhook secret
```

---

## 🎯 STEP-BY-STEP: HOW TO GET CREDENTIALS

### Step 1: Create Account
1. Go to https://razorpay.com
2. Click "Sign Up"
3. Enter email and password
4. Verify email
5. Create account

### Step 2: Complete KYC
1. Go to Dashboard
2. Click "Complete KYC"
3. Upload:
   - [ ] PAN card
   - [ ] Business registration
   - [ ] Bank account details
   - [ ] Business address proof
4. Submit for verification
5. Wait 24-48 hours for approval

### Step 3: Get API Keys
1. Once KYC approved, go to Dashboard
2. Click "Settings" (bottom left)
3. Click "API Keys"
4. You'll see:
   - **Key ID** - Copy this
   - **Key Secret** - Click "Reveal" then copy
5. Note both values

### Step 4: Test Mode
- Razorpay gives you test credentials automatically
- Use test credentials first (starts with `rzp_test_`)
- Later switch to live credentials (starts with `rzp_live_`)

---

## 💰 PRICING INFORMATION

Razorpay charges:
- **Settlement:** 2% for standard payments
- **Payment Gateway:** 2-3% depending on payment method
- **Refunds:** No additional charge
- **No monthly fees**

---

## 🧪 TEST CREDENTIALS (PROVIDED BY SYSTEM)

Razorpay automatically provides test credentials:
- **Test Key ID:** Starts with `rzp_test_`
- **Test Key Secret:** Long alphanumeric string
- **Use for:** Development & testing
- **Test Cards:** Provided by Razorpay docs

---

## 📊 INFORMATION TO GATHER

### Razorpay Dashboard Features You'll Use

- [ ] **API Keys Page**
  - Location: Settings → API Keys
  - What you get: Key ID, Key Secret

- [ ] **Webhooks Page** (Optional)
  - Location: Settings → Webhooks
  - What you do: Add webhook URL
  - What you get: Webhook Secret

- [ ] **Payments Page**
  - Location: Dashboard → Payments
  - What you see: All payment history
  - Use for: Debugging payment issues

- [ ] **Documentation**
  - Location: https://razorpay.com/docs
  - Use for: API reference, test cards

- [ ] **Support**
  - Location: Dashboard → Help/Support
  - Use for: Getting help

---

## ✅ CHECKLIST: BEFORE YOU START INTEGRATION

- [ ] Razorpay account created
- [ ] Email verified
- [ ] KYC submitted
- [ ] KYC approved (wait 24-48 hours)
- [ ] Dashboard accessible
- [ ] API Keys page found
- [ ] Key ID copied
- [ ] Key Secret copied
- [ ] Ready to add to .env.local

---

## 🚀 TWO-MODE SYSTEM

### Test Mode (Development)
- **Credentials:** `rzp_test_xxxxx` + test secret
- **Test Cards:** Use provided test cards
- **Real Money:** ❌ NO money charged
- **Time to Setup:** Immediate (auto-provided)
- **When to Use:** Development & QA

### Live Mode (Production)
- **Credentials:** `rzp_live_xxxxx` + live secret
- **Real Cards:** Use real credit/debit cards
- **Real Money:** ✅ Money actually charged
- **Time to Setup:** After KYC approval (24-48 hours)
- **When to Use:** After launch to production

**Recommendation:** Test with test mode first (test cards), then switch to live mode for production.

---

## 📱 TEST WITH THESE CARDS

Once you have Razorpay set up, test with:

```
Success Payment:
  Card: 4111111111111111
  Expiry: 12/25
  CVV: 123
  OTP: 000000
  Result: Payment succeeds

Failed Payment:
  Card: 4222222222222220
  Expiry: 12/25
  CVV: 123
  OTP: 000000
  Result: Payment fails
```

---

## 🔄 WHAT HAPPENS AFTER YOU GIVE CREDENTIALS

1. **Add to `.env.local`**
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
   ```

2. **Run: `npm install razorpay`**

3. **Run Database Migration**
   - Execute SQL in `sql/razorpay_migration.sql`

4. **Start Dev Server**
   - `npm run dev`

5. **Test Payment**
   - Click "Buy Now" on product
   - Use test card
   - Payment should work!

---

## 📞 RAZORPAY SUPPORT

If you need help getting credentials:

- **Email:** support@razorpay.com
- **Website:** https://razorpay.com/support
- **Chat:** Available in Razorpay Dashboard
- **Phone:** +91-120-4025000

---

## ⚠️ IMPORTANT REMINDERS

### Security
- ✅ **DO:** Keep `RAZORPAY_KEY_SECRET` secret
- ✅ **DO:** Use `.env.local` for secrets
- ✅ **DO:** Add `.env.local` to `.gitignore`
- ❌ **DON'T:** Commit secrets to git
- ❌ **DON'T:** Share key secret with anyone
- ❌ **DON'T:** Log key secret in console

### Testing
- ✅ **DO:** Use test credentials first
- ✅ **DO:** Use test cards for testing
- ✅ **DO:** Test all payment flows
- ✅ **DO:** Test failure scenarios
- ❌ **DON'T:** Use real cards in development
- ❌ **DON'T:** Take test mode to production

---

## 📋 QUICK SUMMARY

| Item | Status | Where to Get |
|------|--------|--------------|
| Razorpay Account | ⏳ Needed | https://razorpay.com |
| Key ID | ⏳ Needed | Settings → API Keys |
| Key Secret | ⏳ Needed | Settings → API Keys |
| Webhook Secret | ✅ Optional | Settings → Webhooks |
| Test Cards | ✅ Provided | Razorpay Docs |
| Documentation | ✅ Provided | https://razorpay.com/docs |

---

## 🎯 YOUR ACTION ITEMS

- [ ] **Today:** Sign up for Razorpay account
- [ ] **Next 24-48 hours:** Complete KYC verification
- [ ] **After KYC approval:** Get API credentials
- [ ] **After getting credentials:** Add to `.env.local`
- [ ] **Then:** Follow RAZORPAY_ACTION_ITEMS.md

---

## ✨ ONCE YOU HAVE CREDENTIALS

1. **Your system is 99% ready** - We've already built everything!
2. **Just add your credentials** - 3 environment variables
3. **Run database migration** - 1 SQL script
4. **Test locally** - Use test cards
5. **Deploy to production** - Switch to live credentials

---

## 📝 TEMPLATE TO SAVE

**Print this and fill it out as you get information:**

```
RAZORPAY CREDENTIALS CHECKLIST
================================

Account Created: [ ] Yes / [ ] No
Email: _________________________
Password: _________________________

KYC Status: [ ] Not Started / [ ] Submitted / [ ] Approved
KYC Submitted Date: _________________________
KYC Approval Date: _________________________

Test Credentials:
  Key ID: rzp_test_____________________
  Key Secret: _________________________

Live Credentials (after launch):
  Key ID: rzp_live_____________________
  Key Secret: _________________________

Webhook URL: https://yourdomain.com/api/razorpay/webhook
Webhook Secret: _________________________

Site URL (Local): http://localhost:3000
Site URL (Production): https://yourdomain.com

Ready to Integrate: [ ] Yes / [ ] No
```

---

## 🎉 YOU'RE ALL SET!

Once you have the credentials above, follow the RAZORPAY_ACTION_ITEMS.md checklist and you'll have a fully functional payment system in under 30 minutes!

**Everything else is already built and ready to go!** 🚀
