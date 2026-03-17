import { createSupabaseServerClient } from '../../../../lib/supabaseClient'

export async function GET(req, { params }) {
  try {
    const supabase = createSupabaseServerClient()
    const productId = params.id
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get Q&A with answers first (unanswered last)
    const { data: qaList, error, count } = await supabase
      .from('product_qa')
      .select(`
        *,
        user:user_id(full_name, avatar_url),
        answerer:answer_by(full_name)
      `)
      .eq('product_id', productId)
      .eq('status', 'published')
      .order('answer', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return Response.json({
      data: qaList,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('GET /api/qa error:', error)
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

    // Ensure profile exists to satisfy FK
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      })
    }

    const body = await req.json()
    const { question } = body
    const productId = params.id

    // Validate input
    if (!question || question.trim().length < 10) {
      return Response.json(
        { error: 'Question must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Create question
    const { data: qa, error } = await supabase
      .from('product_qa')
      .insert({
        product_id: productId,
        user_id: user.id,
        question: question.trim(),
        status: 'published'
      })
      .select(`
        *,
        user:user_id(full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return Response.json(qa, { status: 201 })
  } catch (error) {
    console.error('POST /api/qa error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
