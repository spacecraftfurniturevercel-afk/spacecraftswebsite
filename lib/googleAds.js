// Google Ads UploadConversions scaffold (server-side)
// This is a scaffold/example. Replace env placeholders with real credentials.
// NOTE: Uploading conversions to Google Ads requires a valid developer token and OAuth2 access token.

const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || ''
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || ''
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN || ''
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || ''

async function getAccessTokenFromRefreshToken() {
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN) {
    console.log('Google Ads OAuth2 credentials missing; skipping token fetch')
    return null
  }
  const tokenUrl = 'https://oauth2.googleapis.com/token'
  const params = new URLSearchParams()
  params.append('client_id', GOOGLE_ADS_CLIENT_ID)
  params.append('client_secret', GOOGLE_ADS_CLIENT_SECRET)
  params.append('refresh_token', GOOGLE_ADS_REFRESH_TOKEN)
  params.append('grant_type', 'refresh_token')

  try {
    const res = await fetch(tokenUrl, { method: 'POST', body: params })
    if (!res.ok) {
      const text = await res.text()
      console.error('Failed to fetch Google Ads access token', res.status, text)
      return null
    }
    const json = await res.json()
    return json.access_token
  } catch (e) {
    console.error('Error fetching Google Ads access token', e)
    return null
  }
}

export async function uploadGoogleAdsConversion({ gclid, conversionActionResourceName, conversionTime, conversionValue, currency='INR', orderId=null }) {
  // gclid: Google Click ID (recommended for conversions from clicks)
  // conversionActionResourceName: resource name of the conversion action in Google Ads, e.g. 'customers/1234567890/conversionActions/987654321'
  // conversionTime: RFC3339 timestamp or 'YYYY-MM-DD HH:MM:SS+TZ'
  // conversionValue: numeric

  const accessToken = await getAccessTokenFromRefreshToken()
  if (!accessToken) {
    return { ok: false, reason: 'no_access_token' }
  }

  if (!GOOGLE_ADS_CUSTOMER_ID || !GOOGLE_ADS_DEVELOPER_TOKEN) {
    return { ok: false, reason: 'missing_customer_or_dev_token' }
  }

  // Construct payload for uploadClickConversions. This is a scaffold example and may need adjustments
  // depending on the exact API version and fields you want to set.
  const payload = {
    conversions: [
      {
        gclid,
        conversion_action: conversionActionResourceName,
        conversion_date_time: conversionTime,
        conversion_value: Number(conversionValue || 0),
        currency_code: currency,
        order_id: orderId ? String(orderId) : undefined
      }
    ],
    partial_failure: true
  }

  // NOTE: The exact REST path and request structure for Google Ads conversion upload may change by API version.
  // Here we attempt to call the documented method: customers/{customerId}/conversionUpload:uploadClickConversions
  const url = `https://googleads.googleapis.com/v14/customers/${GOOGLE_ADS_CUSTOMER_ID}/conversionUpload:uploadClickConversions`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN
      },
      body: JSON.stringify(payload)
    })
    const text = await res.text()
    if (!res.ok) {
      console.error('Google Ads upload failed', res.status, text)
      return { ok: false, status: res.status, text }
    }
    try { return { ok: true, data: JSON.parse(text) } } catch (e) { return { ok: true, text } }
  } catch (e) {
    console.error('Google Ads upload error', e)
    return { ok: false, error: e.message }
  }
}

// Usage: await uploadGoogleAdsConversion({ gclid:'...', conversionActionResourceName:'customers/123/conversionActions/456', conversionTime:'2025-12-14 12:00:00+05:30', conversionValue:49999, orderId: 123 })
