# Razorpay Payment System - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Environment Setup
```bash
# .env.local
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Install
```bash
npm install razorpay
```

### 3. Database
```bash
# Run in Supabase SQL Editor:
# Execute: sql/razorpay_migration.sql
```

### 4. Test
- Go to product page, click "Buy Now"
- Or add to cart, go to `/checkout`
- Use test card: `4111111111111111`

---

## 📝 API Quick Reference

### Create Order
```
POST /api/razorpay/create-order

Cart:
{ items: [{product_id, quantity}], address_id, payment_type: "cart" }

Direct:
{ product_id, quantity, payment_type: "direct" }
```

### Verify Payment
```
POST /api/razorpay/verify-payment

{
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  order_id
}
```

### Get Order
```
GET /api/orders/:orderId
```

---

## 💳 Test Cards

| Type | Card Number | Status |
|------|------------|--------|
| Debit | 4111111111111111 | Success |
| Credit | 4222222222222220 | Failure |
| Expiry | Any future date | - |
| CVV | Any 3 digits | - |
| OTP | 000000 | - |

---

## 🔧 File Map

```
lib/
  └─ razorpay.js                    # Razorpay utilities

components/
  ├─ RazorpayPayment.js             # Payment modal
  └─ ProductDetailClient.js          # Buy Now button

app/
  ├─ checkout/
  │  └─ page.js                     # Checkout page
  ├─ orders/
  │  ├─ success/
  │  │  └─ page.js                  # Success page
  │  └─ failure/
  │     └─ page.js                  # Failure page
  └─ api/
     ├─ razorpay/
     │  ├─ create-order/
     │  │  └─ route.js              # Create order API
     │  └─ verify-payment/
     │     └─ route.js              # Verify payment API
     └─ orders/
        └─ [orderId]/
           └─ route.js              # Get order API

sql/
  └─ razorpay_migration.sql         # DB migration
```

---

## 🔍 Debug Payment Issues

### Check Payment Logs
```sql
-- View all payment attempts
SELECT * FROM payment_logs 
WHERE order_id = YOUR_ORDER_ID
ORDER BY created_at DESC;

-- View failed payments
SELECT * FROM payment_logs 
WHERE status != 'completed'
ORDER BY created_at DESC;
```

### Check Order Status
```sql
SELECT id, razorpay_order_id, razorpay_payment_id, 
       payment_status, status, created_at
FROM orders 
WHERE id = YOUR_ORDER_ID;
```

---

## 🛡️ Security Checklist

- ✅ `RAZORPAY_KEY_SECRET` never exposed to frontend
- ✅ Payment signature verified on backend
- ✅ Amount validated against database
- ✅ Orders only accessible by owner
- ✅ Cart cleared only after payment confirmed
- ✅ All errors logged for audit

---

## 💡 Common Issues

| Issue | Solution |
|-------|----------|
| Modal won't open | Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| Signature fails | Verify `RAZORPAY_KEY_SECRET` |
| Order not created | Ensure user logged in |
| Payment not confirmed | Check payment_logs table |
| Cart not clearing | Verify verify-payment API called |

---

## 📊 Payment Flow Diagram

```
User → Buy Now/Checkout
        ↓
  Create Order API
        ↓
  Get Razorpay Order ID
        ↓
  Open Payment Modal
        ↓
  User Pays (Card/UPI/etc)
        ↓
  Razorpay Success Callback
        ↓
  Verify Payment API
        ↓
  ✅ Order Confirmed
  ❌ Order Failed (Retry)
        ↓
  Redirect to Success/Failure
```

---

## 🎯 Key Functions

### Frontend
```javascript
// In RazorpayPayment.js
handlePaymentClick()        // Opens payment modal
verifyAndCompletePayment()  // Verifies signature
```

### Backend
```javascript
// In lib/razorpay.js
createRazorpayOrder()       // Create order
verifyPaymentSignature()    // Verify signature
fetchPaymentDetails()       // Get payment info
refundPayment()             // Process refund

// In API routes
POST /api/razorpay/create-order   // Create order
POST /api/razorpay/verify-payment // Confirm payment
GET /api/orders/[orderId]         // Fetch order
```

---

## 📈 Monitoring

### Track in Payment Logs
```sql
-- Daily summary
SELECT DATE(created_at), status, COUNT(*) 
FROM payment_logs 
GROUP BY DATE(created_at), status
ORDER BY DATE(created_at) DESC;
```

### Monitor Orders
```sql
-- Pending payments
SELECT * FROM orders 
WHERE payment_status = 'pending' 
AND created_at < NOW() - INTERVAL '1 hour';

-- Completed orders
SELECT COUNT(*) as total_orders, SUM(total) as total_revenue
FROM orders 
WHERE status = 'confirmed'
AND created_at > NOW() - INTERVAL '1 day';
```

---

## 🚀 Production Deployment

1. **Get Live Credentials**
   - Update RAZORPAY_KEY_ID (live)
   - Update RAZORPAY_KEY_SECRET (live)
   - Update NEXT_PUBLIC_RAZORPAY_KEY_ID (live)

2. **Update Domain**
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Test Again**
   - Use real payment methods
   - Test refunds
   - Monitor Razorpay dashboard

4. **Enable Webhooks** (Optional)
   - Add webhook URL in Razorpay Dashboard
   - Implement `/api/razorpay/webhook`
   - Async payment confirmation

---

## 📚 Full Documentation

See complete guides:
- `RAZORPAY_SETUP.md` - Full setup guide
- `RAZORPAY_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

## ⚡ Performance Tips

1. **Cache Razorpay Script**
   - Script loads async, doesn't block page
   
2. **Optimize Payment Modal**
   - Keep modal lightweight
   - Pre-fetch customer data
   
3. **Database Queries**
   - Use indexes on razorpay_order_id, payment_id
   - Archive old payment_logs monthly

---

## 🔗 Useful Commands

```bash
# Check environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# View logs locally
npm run dev

# Check database migration
# In Supabase: SELECT * FROM orders LIMIT 1;
```

---

## 💬 Need Help?

1. **Check Logs**
   - Browser console: Network/Console tabs
   - Database: payment_logs table
   - Razorpay Dashboard: Payment history

2. **Verify Setup**
   - Environment variables set?
   - Database migrated?
   - Dependencies installed?

3. **Test with Debug**
   - Add console.log in API routes
   - Check response status codes
   - Verify request body matches schema

---

Happy payments! 🎉
