import { NextResponse } from 'next/server'

const SHIPPING_PROVIDER = process.env.SHIPPING_PROVIDER || 'shiprocket'

/**
 * GET /api/shipping/track?order_id=123
 * Unified tracking — delegates to bigship or shiprocket
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const internalUrl = new URL(request.url)
    const base = `${internalUrl.protocol}//${internalUrl.host}`

    let targetUrl
    if (SHIPPING_PROVIDER === 'bigship') {
      targetUrl = `${base}/api/bigship/track?${searchParams.toString()}`
    } else {
      targetUrl = `${base}/api/shiprocket/track?${searchParams.toString()}`
    }

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
        Cookie: request.headers.get('Cookie') || '',
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Shipping track proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 })
  }
}
