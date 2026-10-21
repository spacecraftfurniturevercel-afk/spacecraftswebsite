import { COMPANY } from '../companyInfo'

/** Public site URL used in chat replies and product links (always production). */
export const SITE_URL = COMPANY.url

export const STORE_CONTACT = {
  name: COMPANY.name,
  address: COMPANY.address.full,
  phone: '09003003733',
  phoneDisplay: COMPANY.phonePrimaryDisplay,
  phoneSecondary: COMPANY.phoneSecondaryDisplay,
  whatsapp: COMPANY.whatsapp,
  email: COMPANY.email,
  storeLocatorUrl: '/store-locator',
  contactUrl: '/contact',
  hours: COMPANY.hours,
  googleMapsUrl: COMPANY.mapsUrl,
  googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY.address.full)}`,
}

export const CATEGORY_KEYWORDS = {
  beds: ['bed', 'beds', 'cot', 'cots'],
  chairs: ['chair', 'chairs', 'seating'],
  recliners: ['recliner', 'recliners'],
  'sofa-cum-beds': ['sofa cum beds', 'sofa cum bed', 'sofa-cum-bed', 'sofa-cum-beds', 'sofa bed', 'sofa beds'],
  'dining-sets': ['dining', 'dining set', 'dining table'],
  wardrobes: ['wardrobe', 'wardrobes', 'storage'],
  'office-furniture': ['office', 'study desk', 'study table', 'office furniture'],
  'center-tables': ['center table', 'coffee table', 'centre table'],
  sofas: ['sofa', 'sofas', 'couch'],
  'pooja-racks': ['pooja', 'mandir', 'pooja rack'],
  'bunk-beds': ['bunk bed', 'bunk beds', 'bunker'],
  mattress: ['mattress', 'mattresses'],
}

export const CHAT_SESSION_STORAGE_KEY = 'sc_furniture_chat_session'
