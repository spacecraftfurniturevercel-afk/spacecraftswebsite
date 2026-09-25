const PRODUCTION_SITE_URL = 'https://www.spacecraftsfurniture.in'

/** Public site origin for sitemaps, canonicals, emails. Never use localhost on Vercel production. */
export function getPublicSiteUrl() {
  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_URL
  }

  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw
  }

  return PRODUCTION_SITE_URL
}
