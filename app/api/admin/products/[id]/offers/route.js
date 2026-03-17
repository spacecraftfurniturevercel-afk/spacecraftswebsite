import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('product_offers')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('position')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('product_offers')
      .insert({
        product_id: id,
        ...body
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
