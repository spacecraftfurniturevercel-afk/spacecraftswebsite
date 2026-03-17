# Razorpay Payment Integration Guide

## Overview
This is a complete Razorpay payment integration for the Spacecrafts Furniture ecommerce platform. It supports:
- ✅ Direct product purchases (Buy Now from product page)
- ✅ Cart checkout
- ✅ Payment verification with signature validation
- ✅ Order tracking
- ✅ Payment status management
- ✅ Refunds support

---

## Part 1: Requirements from Razorpay

### 1.1 Create Razorpay Account
- Go to https://razorpay.com
- Sign up for a merchant account
- Complete KYC verification
- Wait for account approval (usually 24-48 hours)

### 1.2 Get API Credentials

Once your account is activated, navigate to:
1. **Dashboard** → **Settings** → **API Keys**
2. You'll see two keys:
   - **Key ID** (public key) - Share with frontend
   - **Key Secret** (private key) - Keep secret, use on backend only

#### Sample Credentials (DUMMY - Replace with yours):
```
RAZORPAY_KEY_ID=rzp_live_0123456789abcde
RAZORPAY_KEY_SECRET=your_secret_key_here_xyz
```

### 1.3 Optional: Webhook Setup (For Asynchronous Confirmation)
- Navigate to **Settings** → **Webhooks**
- Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
- Events to listen for:
  - `payment.authorized`
  - `payment.failed`
  - `payment.captured`
- Copy the **Webhook Secret** (if needed for webhook validation)

---

## Part 2: Environment Setup

### 2.1 Add Environment Variables
Create/update `.env.local` file in the project root:

```bash
# Razorpay Keys (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxx              # Public key
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx        # Private key (Backend only!)

# Frontend-accessible Razorpay Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx # Same as RAZORPAY_KEY_ID (public)

# Site URL (for payment redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For local dev
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # For production
```

### 2.2 Install Razorpay SDK
```bash
npm install razorpay
```

---

## Part 3: Database Setup

### 3.1 Run Migration
Execute the SQL migration in Supabase:

**Path:** `sql/razorpay_migration.sql`

This adds the following columns to the `orders` table:
- `razorpay_order_id` - Razorpay order ID
- `razorpay_payment_id` - Razorpay payment ID
- `razorpay_signature` - Payment signature for verification
- `payment_method` - Payment gateway used
- `payment_status` - pending | completed | failed
- `payment_timestamp` - When payment was completed

It also creates a `payment_logs` table for debugging payment issues.

---

## Part 4: File Structure & Implementation

### 4.1 Backend Files

#### `/lib/razorpay.js`
- Initializes Razorpay instance
- Helper functions for:
  - Creating orders
  - Verifying signatures
  - Fetching payment/order details
  - Capturing payments
  - Processing refunds
  - Amount formatting

#### `/app/api/razorpay/create-order/route.js`
- Creates order in database
- Creates Razorpay order via API
- Returns Razorpay order ID for frontend payment modal
- Supports two payment types:
  - `cart` - Checkout from cart items
  - `direct` - Direct product purchase (Buy Now)

#### `/app/api/razorpay/verify-payment/route.js`
- Verifies payment signature
- Confirms payment with Razorpay
- Updates order status to "confirmed"
- Clears user's cart items
- Logs payment confirmation

#### `/app/api/orders/[orderId]/route.js`
- Fetches order details with items
- Retrieves delivery address
- User-specific (returns only their orders)

### 4.2 Frontend Files

#### `/components/RazorpayPayment.js`
- Payment modal component
- Loads Razorpay checkout script
- Handles payment flow
- Verifies payment on backend
- Shows loading/error states

#### `/components/ProductDetailClient.js` (Updated)
- Buy Now button now triggers direct payment
- Opens Razorpay payment modal with order details

#### `/app/checkout/page.js` (Completely Rebuilt)
- Full checkout flow
- Address selection
- Order summary
- Razorpay payment integration
- Cart item display

#### `/app/orders/success/page.js` (Updated)
- Payment success confirmation
- Order details display
- GTM conversion tracking
- Next steps information

#### `/app/orders/failure/page.js` (New)
- Payment failure handling
- Retry payment option
- Support contact information

---

## Part 5: Payment Flow

### 5.1 Direct Product Purchase (Buy Now)

```
User clicks "Buy Now" on product
        ↓
Opens Razorpay Payment Modal
        ↓
User enters payment details (Card/UPI/Wallet/etc)
        ↓
Razorpay processes payment
        ↓
Payment success callback
        ↓
Frontend calls verify-payment API
        ↓
Backend verifies signature & confirms order
        ↓
Redirects to /orders/success?order_id=123
```

### 5.2 Cart Checkout

```
User adds items to cart
        ↓
Clicks "Proceed to Checkout"
        ↓
Select delivery address
        ↓
Click "Proceed to Payment"
        ↓
Opens Razorpay Payment Modal
        ↓
User pays (same as above)
        ↓
Order confirmed & cart cleared
        ↓
Success page with order details
```

---

## Part 6: API Endpoints

### 6.1 Create Order
```
POST /api/razorpay/create-order

Body (Cart Checkout):
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ],
  "address_id": 5,
  "payment_type": "cart"
}

Body (Direct Product Purchase):
{
  "product_id": 1,
  "quantity": 1,
  "payment_type": "direct",
  "address_id": null
}

Response:
{
  "success": true,
  "order_id": 123,
  "razorpay_order_id": "order_xxxxx",
  "amount": 5000,
  "amount_paise": 500000,
  "currency": "INR",
  "customer_email": "user@example.com",
  "customer_name": "John Doe"
}
```

### 6.2 Verify Payment
```
POST /api/razorpay/verify-payment

Body:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "order_id": 123
}

Response:
{
  "success": true,
  "message": "Payment verified and confirmed successfully",
  "order_id": 123,
  "razorpay_payment_id": "pay_xxxxx",
  "payment_status": "completed"
}
```

### 6.3 Get Order Details
```
GET /api/orders/:orderId

Response:
{
  "order": {
    "id": 123,
    "profile_id": "uuid",
    "total": 5000,
    "status": "confirmed",
    "payment_status": "completed",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "created_at": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "name": "Chair",
        "unit_price": 2500,
        "quantity": 2
      }
    ]
  },
  "address": {
    "id": 5,
    "label": "Home",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "phone": "9876543210"
  }
}
```

---

## Part 7: Testing

### 7.1 Test Cards (Razorpay Test Mode)

**Successful Payment:**
- Card: 4111111111111111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits
- Name: Any name
- OTP: 000000

**Failed Payment:**
- Card: 4222222222222220
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 000000

### 7.2 Testing Workflow

1. **Add to Cart**
   - Add products to cart
   - Verify items show on cart page

2. **Test Checkout**
   - Go to `/checkout`
   - Select address
   - Click "Proceed to Payment"
   - Payment modal should open

3. **Test Payment**
   - Use test card from above
   - Select "Debit Card" payment method
   - Enter card details
   - Enter OTP: 000000
   - Click "Pay"

4. **Verify Success**
   - Should redirect to `/orders/success?order_id=123`
   - Order details should display
   - Cart should be cleared

5. **Direct Purchase Test**
   - Go to any product page
   - Click "Buy Now"
   - Payment modal opens with product details
   - Complete payment
   - Verify order created

---

## Part 8: Payment Signature Verification

Razorpay payment verification works as follows:

```javascript
// On frontend, Razorpay sends these to your success handler:
{
  razorpay_order_id: "order_xxxxx",
  razorpay_payment_id: "pay_xxxxx",
  razorpay_signature: "signature_xxxxx"
}

// Backend verifies:
const body = razorpay_order_id + '|' + razorpay_payment_id
const expectedSignature = HMAC-SHA256(body, KEY_SECRET)

// If expectedSignature === razorpay_signature, payment is valid!
```

This ensures payment legitimacy without relying on frontend data alone.

---

## Part 9: Production Checklist

- [ ] Update `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Get live Razorpay credentials (replace test keys)
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Enable webhook (optional but recommended for asynchronous confirmation)
- [ ] Test with actual credit cards/UPI
- [ ] Set up email notifications for orders
- [ ] Configure refund policy
- [ ] Test failed payment flow
- [ ] Monitor Razorpay dashboard for payment reports
- [ ] Set up order status webhooks for real-time updates
- [ ] Enable payment retries for failed payments
- [ ] Add support documentation for customers

---

## Part 10: Troubleshooting

### Issue: "Payment modal not opening"
**Solution:**
- Verify Razorpay script loaded: `window.Razorpay` should exist
- Check browser console for errors
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly

### Issue: "Signature verification failed"
**Solution:**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check order ID and payment ID are being sent correctly
- Enable debug logging in `verify-payment` endpoint

### Issue: "Order creation fails"
**Solution:**
- Verify user is authenticated
- Check database connection
- Verify address exists and belongs to user
- Check cart items have valid product IDs

### Issue: "Payment status not updating"
**Solution:**
- Verify `payment_logs` table for errors
- Check API response in browser Network tab
- Verify order ID is returned from create-order endpoint
- Check database constraints on orders table

---

## Part 11: Advanced Features (Optional)

### 11.1 Webhook Implementation (For Async Confirmation)
- Creates payment_logs entries for all Razorpay events
- Handles async payment failures
- Enables real-time payment status updates

### 11.2 Payment Retries
- User can retry failed payments
- Maintains order integrity
- Creates payment audit trail

### 11.3 Refund Processing
- Admin can issue refunds
- Refund status tracked in database
- Customer notified via email

### 11.4 EMI Support
- Razorpay supports EMI options
- Configure in RazorpayPayment component
- Store EMI details with order

---

## Part 12: Security Notes

1. **Never log or expose `RAZORPAY_KEY_SECRET`**
   - Keep it server-side only
   - Use environment variables

2. **Always verify signatures**
   - Don't trust frontend payment confirmation
   - Verify with backend every time

3. **Use HTTPS in production**
   - PCI DSS compliance requirement
   - Prevents man-in-the-middle attacks

4. **Validate order amounts**
   - Ensure amount in DB matches Razorpay verification
   - Prevents payment tampering

5. **Rate limit payment endpoints**
   - Prevent brute force attacks
   - Implement request throttling

---

## Summary of What You Need to Do

1. **Get from Razorpay Dashboard:**
   - [ ] Key ID (rzp_test_xxxxx)
   - [ ] Key Secret (keep private!)
   - [ ] Set webhook URL (optional)

2. **Add to `.env.local`:**
   ```
   RAZORPAY_KEY_ID=xxx
   RAZORPAY_KEY_SECRET=xxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx
   ```

3. **Run Database Migration:**
   ```sql
   Execute: sql/razorpay_migration.sql
   ```

4. **Install Dependencies:**
   ```bash
   npm install razorpay
   ```

5. **Test the System:**
   - Test cart checkout
   - Test direct product purchase
   - Verify order creation
   - Verify payment confirmation

That's it! Your Razorpay payment system is ready! 🎉

---

## Support & Documentation

- **Razorpay Docs:** https://razorpay.com/docs/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-test-card-details
- **API Reference:** https://razorpay.com/docs/api
- **Integration Issues:** Check `payment_logs` table in Supabase
