import { NextResponse } from 'next/server'

/**
 * GET /api/shipping/provider
 * Returns the currently configured shipping provider
 */
export async function GET() {
  const provider = process.env.SHIPPING_PROVIDER || 'shiprocket'
  return NextResponse.json({ provider })
}
