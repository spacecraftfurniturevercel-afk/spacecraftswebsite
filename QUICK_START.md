# 🚀 Spacecrafts Furniture - Quick Start Checklist

## Step-by-Step Implementation Guide

---

## ✅ Phase 1: Database Setup (15 minutes)

### 1.1 Create Supabase Project
- [ ] Go to https://supabase.com and sign in
- [ ] Click "New Project"
- [ ] Name: `spacecrafts-furniture`
- [ ] Choose region closest to your users
- [ ] Generate and save database password
- [ ] Wait for project to be ready (~2 minutes)

### 1.2 Copy Project Credentials
- [ ] Go to Project Settings → API
- [ ] Copy `Project URL` → Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `anon public` key → Add as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy `service_role` key → Add as `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Run Database Scripts
- [ ] Open Supabase SQL Editor
- [ ] Copy content from `sql/schema.sql`
- [ ] Click "Run" (this creates all tables)
- [ ] Copy content from `sql/furniture_products_data.sql`
- [ ] Click "Run" (this populates data)
- [ ] ✅ Verify: Check "Table Editor" to see tables with data

### 1.4 Set Up Storage
- [ ] Go to Storage in Supabase
- [ ] Create new bucket: `spacecraftsdigital`
- [ ] Make it **Public**
- [ ] Create folders: `products/`, `categories/`, `brands/`, `hero/`
- [ ] Update SUPABASE_STORAGE_BUCKET in `.env.local`

---

## ✅ Phase 2: Stripe Setup (10 minutes)

### 2.1 Create Stripe Account
- [ ] Go to https://stripe.com and sign up
- [ ] Complete business verification (can test without this)
- [ ] Activate test mode (toggle in dashboard)

### 2.2 Get API Keys
- [ ] Go to Developers → API keys
- [ ] Copy `Publishable key (test)` → Add as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Click "Reveal test key" → Copy `Secret key` → Add as `STRIPE_SECRET_KEY`

### 2.3 Set Up Webhooks (After Deployment)
- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] URL: `https://your-domain.com/api/stripe-webhook`
- [ ] Events: Select `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Copy webhook signing secret → Add as `STRIPE_WEBHOOK_SECRET`

---

## ✅ Phase 3: Local Development Setup (5 minutes)

### 3.1 Install Dependencies
```bash
cd spacecraftsfurniture
npm install
```

### 3.2 Configure Environment
- [ ] Copy `.env.local.example` to `.env.local` (if exists)
- [ ] OR create `.env.local` with all variables from `.env.local` in project
- [ ] Update all placeholder values with real credentials

### 3.3 Start Development Server
```bash
npm run dev
```
- [ ] Open http://localhost:3000
- [ ] ✅ Verify: Homepage loads with categories and products

---

## ✅ Phase 4: Upload Product Images (30-60 minutes)

### 4.1 Gather Images
- [ ] Review `PRODUCT_IMAGES_LIST.md` for required images
- [ ] Download placeholder images from Unsplash/Pexels
- [ ] OR use your own product photography
- [ ] Optimize images (resize to 1200x1200px, compress)

### 4.2 Upload to Supabase Storage
- [ ] Go to Supabase Storage → spacecraftsdigital
- [ ] Upload images to appropriate folders
- [ ] Note the public URLs

### 4.3 Update Database with Image URLs
```sql
-- Example for one product
UPDATE product_images
SET url = 'https://[your-project].supabase.co/storage/v1/object/public/spacecraftsdigital/products/sofas/sofa-1.jpg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'modern-l-shape-sofa-storage')
AND position = 0;
```
- [ ] Update all product image URLs
- [ ] Update category images
- [ ] Update hero slider images

---

## ✅ Phase 5: Optional Integrations (15 minutes)

### 5.1 Google Tag Manager
- [ ] Create GTM account at https://tagmanager.google.com
- [ ] Create container for website
- [ ] Copy Container ID (GTM-XXXXXXX)
- [ ] Add to `.env.local` as `NEXT_PUBLIC_GTM_ID`

### 5.2 Google Analytics 4
- [ ] Create GA4 property in Google Analytics
- [ ] Copy Measurement ID (G-XXXXXXXXXX)
- [ ] Add to `.env.local` as `GA4_MEASUREMENT_ID`
- [ ] Generate API secret for measurement protocol
- [ ] Add as `GA4_API_SECRET`

### 5.3 SendGrid Email
- [ ] Sign up at https://sendgrid.com
- [ ] Create API key
- [ ] Add as `SENDGRID_API_KEY`
- [ ] Verify sender email
- [ ] Add as `EMAIL_FROM`

---

## ✅ Phase 6: Testing (20 minutes)

### 6.1 Test User Authentication
- [ ] Sign up for a new account
- [ ] Verify email is sent (if SendGrid configured)
- [ ] Log in successfully
- [ ] Test password reset

### 6.2 Test Shopping Flow
- [ ] Browse products by category
- [ ] Add products to cart
- [ ] Update cart quantities
- [ ] Add products to wishlist
- [ ] Proceed to checkout

### 6.3 Test Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] ✅ Order should complete successfully

### 6.4 Test Admin Features
- [ ] Navigate to `/admin/products/new`
- [ ] Create a test product
- [ ] Edit existing product
- [ ] Verify changes appear on frontend

---

## ✅ Phase 7: SEO Configuration (10 minutes)

### 7.1 Update Site Information
- [ ] Update `NEXT_PUBLIC_SITE_URL` in `.env.local`
- [ ] Update `NEXT_PUBLIC_SITE_NAME`
- [ ] Verify metadata in `app/layout.js`
- [ ] Check Open Graph images exist

### 7.2 Verify SEO Features
- [ ] Visit http://localhost:3000/sitemap.xml
- [ ] Check robots.txt at http://localhost:3000/robots.txt
- [ ] Use browser inspector to verify meta tags
- [ ] Test structured data with Google Rich Results Test

---

## ✅ Phase 8: Deployment (20 minutes)

### 8.1 Prepare for Production
- [ ] Run `npm run build` locally to test
- [ ] Fix any build errors
- [ ] Review `.env.local` and prepare production values
- [ ] Commit code to Git repository

### 8.2 Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Click "Import Project"
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Deploy!

### 8.3 Post-Deployment
- [ ] Verify site loads at Vercel URL
- [ ] Update Stripe webhook URL
- [ ] Update NEXT_PUBLIC_SITE_URL to production URL
- [ ] Redeploy to apply changes

### 8.4 Custom Domain (Optional)
- [ ] Purchase domain (Namecheap, GoDaddy, etc.)
- [ ] Add domain in Vercel settings
- [ ] Update DNS records
- [ ] Wait for SSL certificate provisioning

---

## ✅ Phase 9: Post-Launch (Ongoing)

### 9.1 Submit to Search Engines
- [ ] Google Search Console: Add property and submit sitemap
- [ ] Bing Webmaster Tools: Add site and submit sitemap
- [ ] Request indexing for important pages

### 9.2 Monitor & Optimize
- [ ] Set up Google Analytics goals
- [ ] Configure GTM events for cart actions
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Check error logs in Vercel dashboard

### 9.3 Marketing Setup
- [ ] Create social media accounts
- [ ] Add social links to footer
- [ ] Set up email marketing campaigns
- [ ] Configure Google Ads conversion tracking

---

## 📊 Success Metrics to Track

After launch, monitor these KPIs:

### Performance
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals all "Good"
- [ ] Lighthouse score > 90

### SEO
- [ ] Pages indexed in Google
- [ ] Organic traffic growth
- [ ] Keyword rankings
- [ ] Backlinks acquired

### Conversion
- [ ] Cart abandonment rate
- [ ] Checkout completion rate
- [ ] Average order value
- [ ] Customer lifetime value

### Technical
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] API response time < 500ms

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check Supabase URL and keys are correct
# Verify RLS policies are set correctly
# Check network/firewall settings
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook signing secret
- Review Stripe dashboard logs

### Images Not Loading
- Verify Supabase storage bucket is public
- Check image URLs are correct
- Confirm CORS settings in Supabase

---

## 📞 Support Resources

- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **Product Images List**: `PRODUCT_IMAGES_LIST.md`
- **Database Schema**: `sql/schema.sql`
- **Sample Data**: `sql/furniture_products_data.sql`

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## ✨ You're All Set!

Once you complete all phases, your furniture e-commerce store will be:
- ✅ Live and accessible
- ✅ SEO optimized
- ✅ Ready for payments
- ✅ Scalable and performant
- ✅ Ready for marketing

**Need help?** Email: spacecraftsdigital@gmail.com

---

**Built with ❤️ by Spacecrafts Digital**
