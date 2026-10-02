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
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
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
