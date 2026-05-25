import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabaseClient'

export async function GET() {
  try {
    const supa = createSupabaseServerClient()
    const { data: categories } = await supa
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    const { data: brands } = await supa.from('brands').select('*')
    return NextResponse.json({ categories: categories || [], brands: brands || [] })
  } catch (e) {
    return NextResponse.json({ categories: [], brands: [] })
  }
}
