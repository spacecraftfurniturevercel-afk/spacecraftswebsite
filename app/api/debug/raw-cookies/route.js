import { NextResponse } from 'next/server'

export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  
  // Parse manually
  const cookies = {}
  const cookiePairs = cookieHeader.split(';')
  
  cookiePairs.forEach(pair => {
    const [nameWithPart, ...rest] = pair.split('=')
    const trimmedName = nameWithPart.trim()
    const trimmedValue = rest.join('=').trim()
    
    if (!trimmedName) return
    
    const baseMatch = trimmedName.match(/^(.+)\.\d+$/)
    if (baseMatch) {
      const baseName = baseMatch[1]
      if (!cookies[baseName]) {
        cookies[baseName] = ''
      }
      cookies[baseName] += trimmedValue
    } else {
      cookies[trimmedName] = trimmedValue
    }
  })
  
  // Check if we have the auth token
  const hasAuthToken = !!cookies['sb-oduvaeykaeabnpmyliut-auth-token']
  const authTokenPreview = cookies['sb-oduvaeykaeabnpmyliut-auth-token'] 
    ? cookies['sb-oduvaeykaeabnpmyliut-auth-token'].substring(0, 100) 
    : 'NONE'
  
  return NextResponse.json({
    message: 'Raw cookie inspection',
    cookieHeader: {
      length: cookieHeader.length,
      preview: cookieHeader.substring(0, 150)
    },
    reconstructed: {
      totalCookies: Object.keys(cookies).length,
      cookieNames: Object.keys(cookies),
      hasAuthToken,
      authTokenPreview
    },
    raw: cookies
  })
}
