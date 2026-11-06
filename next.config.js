/** CSP + defense headers (SEC 04). Next/GTM/Razorpay need inline scripts. */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com https://js.stripe.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://checkout.razorpay.com https://*.razorpay.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://*.razorpay.com https://lumberjack.razorpay.com https://api.razorpay.com https://checkout.razorpay.com https://nominatim.openstreetmap.org https://api.stripe.com https://*.googleapis.com",
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://checkout.razorpay.com https://api.razorpay.com https://js.stripe.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), usb=(), geolocation=(self), payment=(self), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Image optimization — resized WebP/AVIF via Next/Vercel CDN (cuts Supabase egress)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: ''
      }
    ],
    formats: ['image/avif', 'image/webp'],
    // Default quality keeps product photos sharp while reducing file size
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Performance optimizations
  swcMinify: true,
  
  // Enable compression
  compress: true,

  // HTTP headers for security and caching
  async headers() {
    return [
      {
        source: '/hero/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      }
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      // Fix GSC 404s
      {
        source: '/$',
        destination: '/',
        permanent: true
      },
      {
        source: '/products/mcarthur-sofa',
        destination: '/products',
        permanent: true
      },
      // SKU slug → keyword slug redirects (301 permanent)
      {
        source: '/products/jf-5270-3f',
        destination: '/products/3feet-recliner-folding-cot',
        permanent: true
      },
      {
        source: '/products/jf-5210-5f',
        destination: '/products/ancient-folding-cot-5-feet-jf-5210-5f',
        permanent: true
      },
      {
        source: '/products/jf-5210-4f',
        destination: '/products/apollo-folding-cot-4-feet-jf-5210-4f',
        permanent: true
      },
      {
        source: '/products/jf-1155d',
        destination: '/products/cosmo-sofa-cum-bed-double-jf-1155d',
        permanent: true
      },
      {
        source: '/products/jf-9090',
        destination: '/products/fontanka-bunker-cot-jf-9090',
        permanent: true
      },
      {
        source: '/products/fw-4545',
        destination: '/products/jinli-sliding-study-desk-fw-4545',
        permanent: true
      },
      {
        source: '/products/fw-4656',
        destination: '/products/lombard-pull-out-table',
        permanent: true
      },
      {
        source: '/products/jf-5909',
        destination: '/products/luminous-steel-cot-jf-5909',
        permanent: true
      },
      {
        source: '/products/jf-5151',
        destination: '/products/mercury-steel-cot-jf-5151',
        permanent: true
      },
      {
        source: '/products/jf-5555',
        destination: '/products/metal-leg-double-cot-jf-5555',
        permanent: true
      }
    ]
  }
}

// Bundle analyzer (optional)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfig)
