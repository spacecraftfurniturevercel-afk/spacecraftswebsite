# SEO, Google Search Console & GA4

## Vercel environment variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.spacecraftsfurniture.in` | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | GA4 (gtag.js) |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Google Tag Manager (optional) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | (optional) | Overrides default Search Console meta tag |

Redeploy after changing env vars.

## Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → **URL prefix**: `https://www.spacecraftsfurniture.in/`
3. Choose **HTML tag** verification (already in site `<head>` via `metadata.verification.google`).
4. Deploy latest code, then click **Verify**.
5. **Submit sitemap**: `https://www.spacecraftsfurniture.in/sitemap.xml`
6. Set **preferred domain** to `www` in settings if offered.
7. Use **URL inspection** on homepage and a product URL after deploy.

## Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → Admin → **Create property** (if needed).
2. **Data streams** → Web → URL `https://www.spacecraftsfurniture.in`.
3. Copy **Measurement ID** (`G-...`) → Vercel `NEXT_PUBLIC_GA_MEASUREMENT_ID` → redeploy.
4. In GA4: **Admin** → **Data collection** → enable Google signals as needed.
5. Link **Search Console**: GA4 Admin → **Product links** → **Search Console**.

## Optional: GTM instead of direct GA4

If you load GA4 only via GTM, you can leave `NEXT_PUBLIC_GA_MEASUREMENT_ID` empty and configure GA4 inside GTM. Set `NEXT_PUBLIC_GTM_ID` on Vercel.

## robots.txt

`public/robots.txt` points to the sitemap and blocks `/admin`, `/api`, checkout, etc.
