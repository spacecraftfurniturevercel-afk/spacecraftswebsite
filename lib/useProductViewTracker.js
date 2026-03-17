'use client'

/**
 * useProductViewTracker
 * 
 * Tracks product views in both localStorage (for guests) and 
 * the DB via API (for authenticated users).
 * 
 * Usage:
 *   import { trackProductView, getLocalViewHistory } from '../lib/useProductViewTracker'
 *   
 *   // When user views a product:
 *   trackProductView(product.id, isAuthenticated, searchQuery)
 *   
 *   // To get localStorage history (guest fallback):
 *   const ids = getLocalViewHistory()
 */

const STORAGE_KEY = 'spacecrafts_recently_viewed'
const MAX_LOCAL_ITEMS = 20

/**
 * Get recently viewed product IDs from localStorage
 * Returns array of { id, timestamp } objects, most recent first
 */
export function getLocalViewHistory() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Sort by most recent first
    return parsed.sort((a, b) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

/**
 * Get just the product IDs from local history
 */
export function getLocalViewHistoryIds() {
  return getLocalViewHistory().map(item => item.id)
}

/**
 * Save a product view to localStorage
 */
function saveToLocalStorage(productId) {
  if (typeof window === 'undefined') return
  try {
    let history = getLocalViewHistory()
    
    // Remove existing entry for this product (we'll re-add it at the top)
    history = history.filter(item => item.id !== productId)
    
    // Add to the beginning
    history.unshift({ id: productId, timestamp: Date.now() })
    
    // Limit size
    if (history.length > MAX_LOCAL_ITEMS) {
      history = history.slice(0, MAX_LOCAL_ITEMS)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.warn('Failed to save view history:', e)
  }
}

/**
 * Track a product view — saves to localStorage always, 
 * and to DB if user is authenticated.
 */
export async function trackProductView(productId, isAuthenticated = false, searchQuery = null) {
  if (!productId) return
  
  // Always save to localStorage (fast, works offline)
  saveToLocalStorage(productId)
  
  // If authenticated, also save to DB
  if (isAuthenticated) {
    try {
      await fetch('/api/browsing-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, searchQuery })
      })
    } catch (e) {
      // Silently fail — localStorage already has the data
      console.warn('Failed to save browsing history to DB:', e)
    }
  }
}

/**
 * Check if user has any browsing history (local)
 */
export function hasViewHistory() {
  return getLocalViewHistory().length > 0
}
