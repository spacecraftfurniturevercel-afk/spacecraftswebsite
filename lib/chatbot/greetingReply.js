import { SITE_URL, STORE_CONTACT } from './constants'

export function buildGreetingReply() {
  return [
    'Hello! Welcome to Spacecrafts Furniture.',
    '',
    'I can help you with:',
    '- Best sellers and current offers',
    '- Sofas, beds, chairs, dining sets, and more',
    '- Store location, phone, and directions',
    '',
    `Browse: ${SITE_URL}/products`,
    `Call: ${STORE_CONTACT.phoneDisplay} / ${STORE_CONTACT.phoneSecondary}`,
    '',
    'What would you like to explore today?',
  ].join('\n')
}
