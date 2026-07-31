import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import {
  configuredAccounts,
  getAccount,
  getActiveAccountId,
  publicUrlFor,
  uploadToAccounts,
} from '../../../lib/storage/dualStorage'

export const maxDuration = 60

/**
 * POST /api/upload-image  (multipart/form-data)
 *
 *   file         one or more image files
 *   product_id   product to attach the images to
 *   upload_to    both | primary | secondary   (default: both)
 *   url_account  active | primary | secondary (default: active — whichever account
 *                currently serves the site, so new images match the rest)
 *
 * The same storage path is used in every account, so the admin storage panel can
 * later re-point these URLs at either account without re-uploading.
 */

function safeFileName(name = 'image') {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'image'
}

function resolveUploadTargets(uploadTo) {
  const available = configuredAccounts().map((a) => a.id)
  if (!available.length) return []
  if (uploadTo === 'primary' || uploadTo === 'secondary') {
    return available.includes(uploadTo) ? [uploadTo] : []
  }
  return available
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('file').filter((f) => f && typeof f.arrayBuffer === 'function')
    const productId = formData.get('product_id')
    const uploadTo = (formData.get('upload_to') || 'both').toString()
    const urlAccountPref = (formData.get('url_account') || 'active').toString()

    if (!files.length) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const targets = resolveUploadTargets(uploadTo)
    if (!targets.length) {
      return NextResponse.json(
        { error: `No storage account configured for "${uploadTo}"` },
        { status: 500 }
      )
    }

    const supabase = createSupabaseServerClient()

    let urlAccountId = urlAccountPref
    if (urlAccountPref === 'active') urlAccountId = await getActiveAccountId(supabase)
    if (!targets.includes(urlAccountId)) urlAccountId = targets[0]

    // Continue the position sequence so new images land after existing ones
    let nextPosition = 0
    if (productId) {
      const { data: last } = await supabase
        .from('product_images')
        .select('position')
        .eq('product_id', productId)
        .order('position', { ascending: false })
        .limit(1)
      nextPosition = (last?.[0]?.position ?? -1) + 1
    }

    const results = []
    const rowsToInsert = []

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]
      const path = `products/${Date.now()}-${i}-${safeFileName(file.name)}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { uploaded, failed } = await uploadToAccounts(targets, {
        path,
        buffer,
        contentType: file.type,
      })

      if (!uploaded.length) {
        results.push({ name: file.name, path, url: null, uploaded, failed })
        continue
      }

      const urlOwner = uploaded.includes(urlAccountId) ? urlAccountId : uploaded[0]
      const url = publicUrlFor(getAccount(urlOwner), path)

      if (productId) {
        rowsToInsert.push({
          product_id: productId,
          url,
          alt: null,
          position: nextPosition + i,
        })
      }

      results.push({ name: file.name, path, url, served_by: urlOwner, uploaded, failed })
    }

    if (rowsToInsert.length) {
      const { error } = await supabase.from('product_images').insert(rowsToInsert)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const firstUrl = results.find((r) => r.url)?.url || null

    return NextResponse.json({
      url: firstUrl,
      uploaded_to: targets,
      served_by: urlAccountId,
      count: rowsToInsert.length,
      results,
    })
  } catch (err) {
    console.error('[api/upload-image]', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
