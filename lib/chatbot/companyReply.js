import { SITE_URL, STORE_CONTACT } from './constants'

export const COMPANY_INFO = {
  name: 'Spacecrafts Furniture',
  founded: 1997,
  experience: '25+ years',
  location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
  facility: '8,000 sq. ft. showroom and manufacturing facility',
  aboutUrl: `${SITE_URL}/about`,
  specialties: [
    'Space-saving and innovative furniture',
    'Sofas, beds, dining sets, office furniture, wardrobes',
    'Custom furniture solutions',
    'Free delivery and installation in service areas',
  ],
  values: ['Innovation', 'Quality', 'Integrity', 'Speed'],
}

export function buildCompanyContext() {
  return {
    ...COMPANY_INFO,
    phone: STORE_CONTACT.phoneDisplay,
    email: STORE_CONTACT.email,
    storeLocator: `${SITE_URL}${STORE_CONTACT.storeLocatorUrl}`,
    contact: `${SITE_URL}${STORE_CONTACT.contactUrl}`,
  }
}

export function buildCompanyFallbackReply() {
  const c = COMPANY_INFO
  return [
    `${c.name} is a Chennai-based furniture manufacturer and retailer, established in ${c.founded}.`,
    '',
    `With ${c.experience} of experience, we specialize in ${c.specialties[0].toLowerCase()} for homes and businesses.`,
    `Our ${c.facility} is located in ${c.location}.`,
    '',
    'We offer sofas, beds, dining sets, office furniture, wardrobes, and more — with custom options available.',
    '',
    `Learn more: ${c.aboutUrl}`,
    `Visit us: ${SITE_URL}${STORE_CONTACT.storeLocatorUrl}`,
    `Call: ${STORE_CONTACT.phoneDisplay} / ${STORE_CONTACT.phoneSecondary}`,
  ].join('\n')
}
