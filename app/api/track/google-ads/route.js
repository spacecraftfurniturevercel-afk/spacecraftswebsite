import { NextResponse } from 'next/server'
import { uploadGoogleAdsConversion } from '../../../../lib/googleAds'

export async function POST(req) {
  try {
    const body = await req.json()
    // expected: { gclid, conversionActionResourceName, conversionTime, conversionValue, currency, orderId }
    const res = await uploadGoogleAdsConversion(body)
    return NextResponse.json(res)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
