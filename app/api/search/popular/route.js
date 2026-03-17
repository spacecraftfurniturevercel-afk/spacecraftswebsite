import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabaseClient'

// Hardcoded fallback popular searches
const FALLBACK_SEARCHES = [
  'Sofa Sets',
  'Wooden Beds',
  'Office Chairs',
  'Dining Tables',
  'Wardrobes',
  'Bunk Beds',
  'Shoe Racks',
  'Recliner Sofas'
]

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)

    // Try to fetch from popular_searches table if it exists
    const { data, error } = await supabase
      .from('popular_searches')
      .select('term, search_count')
      .eq('is_active', true)
      .order('search_count', { ascending: false })
      .limit(12)

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        searches: data.map(s => ({ term: s.term, count: s.search_count }))
      })
    }

    // Fallback: return hardcoded popular searches
    return NextResponse.json({
      success: true,
      searches: FALLBACK_SEARCHES.map(term => ({ term, count: 0 }))
    })

  } catch (error) {
    console.error('Popular searches error:', error)
    // Always return fallback so the UI works
    return NextResponse.json({
      success: true,
      searches: FALLBACK_SEARCHES.map(term => ({ term, count: 0 }))
    })
  }
}
