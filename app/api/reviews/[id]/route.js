import { createSupabaseServerClient } from '../../../../lib/supabaseClient'
import { headers } from 'next/headers'

export async function GET(req, { params }) {
  try {
    const supabase = createSupabaseServerClient()
    const productId = params.id
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get approved reviews
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return Response.json({
      data: reviews,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const supabase = createSupabaseServerClient()
    const token = req.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { title, body: reviewBody, rating } = body
    const productId = params.id

    // Validate input
    if (!title || !reviewBody || !rating || rating < 1 || rating > 5) {
      return Response.json({ error: 'Invalid review data' }, { status: 400 })
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return Response.json(
        { error: 'You already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        title,
        body: reviewBody,
        rating: parseInt(rating),
        status: 'pending' // Reviews require approval
      })
      .select()
      .single()

    if (error) throw error

    return Response.json(review, { status: 201 })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
