import { NextResponse } from 'next/server'

export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  
  const cookies = cookieHeader.split(';').map(cookie => {
    const [name, value] = cookie.split('=')
    return {
      name: name ? name.trim() : '',
      value: value ? value.trim().substring(0, 50) : '' // truncate for privacy
    }
  }).filter(c => c.name)

  return NextResponse.json({
    message: 'Cookies received in API route:',
    cookiesReceived: cookies,
    totalCookies: cookies.length,
    cookieHeaderRaw: cookieHeader.substring(0, 200)
  })
}
