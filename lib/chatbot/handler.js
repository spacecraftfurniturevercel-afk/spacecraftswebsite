import { detectIntent } from './intent'
import { STORE_CONTACT, SITE_URL } from './constants'
import { searchProducts, getBestsellers, getOffers, getStores } from './productQueries'
import { generateChatReply } from './gemini'
import { buildStoreReply } from './storeReply'
import { buildProductListReply } from './productReply'
import { buildGreetingReply } from './greetingReply'
import { buildCompanyContext, buildCompanyFallbackReply } from './companyReply'

function shouldUseProductListReply(intent, products) {
  if (intent.type === 'bestsellers' || intent.type === 'offers') return true
  if (intent.type === 'search' && (intent.categorySlug || products.length > 0)) return true
  if (intent.type === 'default' && products.length > 0) return true
  return false
}

function buildStoreContext(stores = []) {
  const dbStores = stores.map((s) => ({
    name: s.name,
    address: [s.address, s.city, s.state, s.postal_code].filter(Boolean).join(', '),
    phone: s.phone,
  }))

  return {
    primary: STORE_CONTACT,
    stores: dbStores.length ? dbStores : [STORE_CONTACT],
    storeLocatorUrl: `${SITE_URL}${STORE_CONTACT.storeLocatorUrl}`,
    contactUrl: `${SITE_URL}${STORE_CONTACT.contactUrl}`,
    googleMapsUrl: STORE_CONTACT.googleMapsUrl,
    googleMapsDirectionsUrl: STORE_CONTACT.googleMapsDirectionsUrl,
  }
}

function productsContext(products = []) {
  return products.map((p) => ({
    name: p.name,
    price_inr: p.final_price,
    mrp_inr: p.price,
    offer: p.offer_name,
    category: p.category,
    url: p.url,
  }))
}

export async function handleChatMessage(supabase, { message, history = [] }) {
  const intent = detectIntent(message)
  let products = []
  let storeLocations = []
  let context = { intent: intent.type }

  switch (intent.type) {
    case 'store': {
      storeLocations = await getStores(supabase)
      context.store = buildStoreContext(storeLocations)
      break
    }
    case 'bestsellers': {
      products = await getBestsellers(supabase, 6)
      context.products = productsContext(products)
      context.listType = 'bestsellers'
      break
    }
    case 'offers': {
      products = await getOffers(supabase, 6)
      context.products = productsContext(products)
      context.listType = 'offers'
      break
    }
    case 'search': {
      products = await searchProducts(supabase, {
        query: intent.query,
        categorySlug: intent.categorySlug,
        maxPrice: intent.maxPrice,
        limit: intent.categorySlug ? 10 : 6,
      })
      context.products = productsContext(products)
      context.search = {
        query: intent.query,
        category: intent.categorySlug,
        maxPrice: intent.maxPrice,
      }
      break
    }
    case 'greeting': {
      context.greeting = true
      context.store = { phone: STORE_CONTACT.phoneDisplay, site: SITE_URL }
      break
    }
    case 'general': {
      context.company = buildCompanyContext()
      context.generalQuestion = message
      break
    }
    default: {
      products = await searchProducts(supabase, { query: message, limit: 4 })
      context.products = productsContext(products)
    }
  }

  let reply
  let replySource = 'template'

  if (intent.type === 'store') {
    reply = buildStoreReply()
    replySource = 'template'
  } else if (intent.type === 'greeting') {
    reply = buildGreetingReply()
    replySource = 'template'
  } else if (shouldUseProductListReply(intent, products)) {
    reply = buildProductListReply(products, intent.type === 'default' ? 'search' : intent.type, {
      categorySlug: intent.categorySlug || null,
      maxPrice: intent.maxPrice || null,
    })
    replySource = 'catalog'
  } else {
    try {
      reply = await generateChatReply({ userMessage: message, history, context })
      replySource = 'ai'
    } catch (err) {
      console.error('[chat handler]', err.message)
      reply = fallbackReply(intent, products)
      replySource = 'fallback'
    }
  }

  return { reply, products, intent: intent.type, replySource }
}

function fallbackReply(intent, products) {
  if (intent.type === 'store') return buildStoreReply()
  if (intent.type === 'greeting') return buildGreetingReply()
  if (intent.type === 'general') return buildCompanyFallbackReply()
  if (products.length) return buildProductListReply(products, intent.type === 'offers' ? 'offers' : 'search')
  return `I am here to help you find furniture at Spacecrafts. Try asking about best sellers, current offers, sofas, beds, or our store location. You can also call ${STORE_CONTACT.phoneDisplay} or visit ${SITE_URL}/contact.`
}
