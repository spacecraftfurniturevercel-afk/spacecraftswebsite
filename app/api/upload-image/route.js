import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req) {
  // expects a multipart/form-data with file and product_id
  const formData = await req.formData()
  const file = formData.get('file')
  const productId = formData.get('product_id')
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const supa = createSupabaseServerClient()
  const bucket = 'spacecraftsdigital'
  const filename = `products/${Date.now()}-${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supa.storage.from(bucket).upload(filename, buffer, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`
  await supa.from('product_images').insert({ product_id: productId, url: publicUrl })

  return NextResponse.json({ url: publicUrl })
}
