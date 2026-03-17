import { NextResponse } from 'next/server'

const SHIPPING_PROVIDER = process.env.SHIPPING_PROVIDER || 'shiprocket'

/**
 * POST /api/shipping/create-order
 * Unified shipping order creation — delegates to bigship or shiprocket
 */
export async function POST(request) {
  try {
    const clonedBody = await request.text()
    const internalUrl = new URL(request.url)
    const base = `${internalUrl.protocol}//${internalUrl.host}`

    let targetUrl
    if (SHIPPING_PROVIDER === 'bigship') {
      targetUrl = `${base}/api/bigship/create-order`
    } else {
      targetUrl = `${base}/api/shiprocket/create-order`
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
        Cookie: request.headers.get('Cookie') || '',
      },
      body: clonedBody,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Shipping create-order proxy error:', error)
    return NextResponse.json({ error: 'Failed to create shipping order' }, { status: 500 })
  }
}
