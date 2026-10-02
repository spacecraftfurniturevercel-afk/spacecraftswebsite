import './globals.css'
import NextTopLoader from 'nextjs-toploader'
import AnnouncementBar from '../components/AnnouncementBar'
import TopNavigationBar from '../components/TopNavigationBar'
import Header from '../components/Header'
import ModernFooter from '../components/ModernFooter'
import DelayedSignupModal from '../components/DelayedSignupModal'
import ChatWidget from '../components/ChatWidget/ChatWidget'
import { AuthProvider } from './providers/AuthProvider'
import GoogleAnalytics from '../components/GoogleAnalytics'
import OrganizationStructuredData from '../components/OrganizationStructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spacecraftsfurniture.in'
const GOOGLE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  'vIUiQmIuDBTYAPEi739t9h8d-XTGzu7uv8ti6mg0Ems'

const DEFAULT_OG_IMAGE = '/aboutus/exterior1.webp'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Spacecrafts Furniture | Buy Premium Furniture Online India',
    template: '%s | Spacecrafts Furniture'
  },
  description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery across India. Best prices with 30-day returns.',
  keywords: ['furniture online', 'buy furniture online', 'furniture store India', 'sofas online', 'beds online', 'office furniture', 'home furniture', 'premium furniture', 'furniture shopping'],
  authors: [{ name: 'Spacecrafts Furniture' }],
  creator: 'Spacecrafts Digital',
  publisher: 'Spacecrafts Furniture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Spacecrafts Furniture',
    title: 'Spacecrafts Furniture | Buy Premium Furniture Online India',
    description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery, best prices.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spacecrafts Furniture | Buy Premium Furniture Online',
    description: 'Shop sofas, beds, dining sets & office furniture online. Free delivery, best prices.',
    images: [DEFAULT_OG_IMAGE],
    creator: '@spacecraftsfurn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: GOOGLE_VERIFICATION,
  },
}

function GTMSnippet(){
  const id = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'
  if (!id || id === 'GTM-XXXXXXX') return null
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'? '&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');` }} />
    </>
  )
}

function GTMNoScript(){
  const id = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'
  if (!id || id === 'GTM-XXXXXXX') return null
  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0" 
        width="0" 
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <GoogleAnalytics />
        <OrganizationStructuredData />
        <GTMSnippet />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <NextTopLoader 
          color="#e67e22"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #e67e22, 0 0 5px #e67e22"
        />
        <AuthProvider>
          <GTMNoScript />
          <AnnouncementBar />
          <TopNavigationBar />
          <Header />
          <main style={{ minHeight: '60vh' }}>
            {children}
          </main>
          <ModernFooter />
          <DelayedSignupModal />
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  )
}
