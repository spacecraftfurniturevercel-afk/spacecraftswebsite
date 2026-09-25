import Script from 'next/script'

// Browser needs NEXT_PUBLIC_* — same value as GA4_MEASUREMENT_ID in .env / Vercel
const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

/** GA4 (gtag.js) — set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel (e.g. G-XXXXXXXX). */
export default function GoogleAnalytics() {
  if (!GA_ID || GA_ID.includes('XXXX')) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}
