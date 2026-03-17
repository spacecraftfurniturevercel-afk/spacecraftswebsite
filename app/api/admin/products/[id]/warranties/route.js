import { createSupabaseServerClient } from '../../../../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('warranty_options')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching warranties:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('warranty_options')
      .insert({
        product_id: id,
        ...body
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error creating warranty:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
