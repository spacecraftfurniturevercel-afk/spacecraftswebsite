import { CATEGORY_KEYWORDS } from './constants'

const STORE_PATTERNS = /\b(store|location|address|contact|phone|call|visit|where\s+are\s+you|office|showroom|directions|open|hours)\b/i
const BESTSELLER_PATTERNS = /\b(best[\s-]*sell(?:er)?s?|bestsellers?|top[\s-]*sell(?:er)?s?|most[\s-]*popular)\b/i
const OFFER_PATTERNS = /\b(offer|offers|deal|deals|discount|sale|diwali|christmas|festival|limited\s*time)\b/i
const GREETING_PATTERNS = /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste)\b/i
const GENERAL_PATTERNS =
  /\b(about\s+(your\s+)?(company|business|brand|us|spacecrafts)|who\s+are\s+you|tell\s+me\s+about\s+(the\s+)?(company|business|brand|spacecrafts|you|your)|our\s+story|what\s+do\s+you\s+(sell|do|offer)|return\s+policy|refund|warranty|delivery|shipping|do\s+you\s+deliver|franchise|bulk\s+order)\b/i

function extractMaxPrice(text) {
  const priceMatch = text.match(/(?:under|below|less than|max|upto|up to)\s*₹?\s*([\d,]+)/i)
  return priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : null
}

function findCategoryMatch(text) {
  let best = null

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (!text.includes(kw)) continue
      if (!best || kw.length > best.keyword.length) {
        best = { slug, keyword: kw }
      }
    }
  }

  return best
}

export function detectIntent(message = '') {
  const text = message.trim().toLowerCase()
  if (!text) return { type: 'empty' }
  if (GREETING_PATTERNS.test(text)) return { type: 'greeting' }
  if (STORE_PATTERNS.test(text)) return { type: 'store' }
  if (BESTSELLER_PATTERNS.test(text)) return { type: 'bestsellers' }
  if (OFFER_PATTERNS.test(text)) return { type: 'offers' }

  const maxPrice = extractMaxPrice(text)

  if (GENERAL_PATTERNS.test(text)) {
    return { type: 'general', query: message, maxPrice }
  }

  const categoryMatch = findCategoryMatch(text)

  if (categoryMatch) {
    return { type: 'search', categorySlug: categoryMatch.slug, query: message, maxPrice }
  }

  return { type: 'search', query: message, maxPrice }
}
