import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Parse cookies manually
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = {}
    
    if (cookieHeader) {
      const cookiePairs = cookieHeader.split(';')
      cookiePairs.forEach(pair => {
        const [nameWithPart, ...rest] = pair.split('=')
        const trimmedName = nameWithPart.trim()
        let trimmedValue = rest.join('=').trim()
        
        if (!trimmedName) return
        
        // Decode immediately
        try {
          trimmedValue = decodeURIComponent(trimmedValue)
        } catch (e) {
          console.error('Decode error:', e)
        }
        
        // Handle split cookies
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
    }
    
    // Try to parse the auth token
    const authToken = cookies['sb-oduvaeykaeabnpmyliut-auth-token']
    let parsedAuth = null
    if (authToken) {
      try {
        parsedAuth = JSON.parse(authToken)
      } catch (e) {
        console.error('Parse error:', e.message)
      }
    }
    
    return NextResponse.json({
      hasAuthCookie: !!authToken,
      authTokenLength: authToken ? authToken.length : 0,
      authTokenStart: authToken ? authToken.substring(0, 50) : 'NONE',
      parsedSuccessfully: !!parsedAuth,
      hasAccessToken: parsedAuth?.access_token ? true : false,
      accessTokenPreview: parsedAuth?.access_token ? parsedAuth.access_token.substring(0, 50) : 'NONE'
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
