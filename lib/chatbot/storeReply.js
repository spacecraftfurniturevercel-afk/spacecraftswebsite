import { SITE_URL, STORE_CONTACT } from './constants'

function formatStoreBlock(store) {
  const lines = []
  if (store.name) lines.push(store.name)
  if (store.address) lines.push(store.address)
  if (store.phone) lines.push(`Phone: ${store.phone}`)
  if (store.email) lines.push(`Email: ${store.email}`)
  if (store.hours) lines.push(`Hours: ${store.hours}`)
  return lines.join('\n')
}

export function buildStoreReply() {
  const primary = STORE_CONTACT
  const contactUrl = `${SITE_URL}${primary.contactUrl}`
  const locatorUrl = `${SITE_URL}${primary.storeLocatorUrl}`
  const mapsUrl = primary.googleMapsUrl
  const directionsUrl = primary.googleMapsDirectionsUrl
  const whatsappUrl = `https://wa.me/${primary.whatsapp}`

  const lines = [
    'Here are our showroom and contact details:',
    '',
    formatStoreBlock({
      name: primary.name,
      address: primary.address,
      phone: `${primary.phoneDisplay} / ${primary.phoneSecondary}`,
      email: primary.email,
      hours: primary.hours,
    }),
    '',
    'Google Maps (view location):',
    mapsUrl,
    '',
    'Get directions (Google Maps routing):',
    directionsUrl,
    '',
    'Contact page:',
    contactUrl,
    '',
    'Store locator (photos, facilities and map):',
    locatorUrl,
    '',
    `WhatsApp: ${whatsappUrl}`,
    '',
    'Call us anytime during store hours. We are happy to help with directions or product questions.',
  ]

  return lines.join('\n')
}
