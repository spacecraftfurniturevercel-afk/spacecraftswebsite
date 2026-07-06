/** Public site URL used in chat replies and product links (always production). */
export const SITE_URL = 'https://www.spacecraftsfurniture.in'

const STORE_ADDRESS =
  '94A/1, 3rd Main Rd, Old Ambattur, Attipattu, Ambattur Industrial Estate, Chennai, Tamil Nadu 600058'

export const STORE_CONTACT = {
  name: 'Spacecrafts Furniture - Chennai Flagship',
  address: STORE_ADDRESS,
  phone: '09003003733',
  phoneDisplay: '090030 03733',
  phoneSecondary: '98402 22779',
  whatsapp: '919003003733',
  email: 'support@spacecraftsfurniture.in',
  storeLocatorUrl: '/store-locator',
  contactUrl: '/contact',
  hours: 'Mon-Fri: 10:00 AM - 9:30 PM | Sat-Sun: 10:00 AM - 10:00 PM (open on holidays)',
  googleMapsUrl: 'https://maps.app.goo.gl/sMTmsBTJBKszoP1Q7',
  googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_ADDRESS)}`,
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
