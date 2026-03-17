import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ categories: [] })
    }
    return NextResponse.json({ categories: data || [] })
  } catch {
    return NextResponse.json({ categories: [] })
  }
}
