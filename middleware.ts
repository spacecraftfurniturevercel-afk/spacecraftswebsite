import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the cookie header to check for auth token
  const cookieHeader = request.headers.get('cookie') || ''
  
  // Check if user has an auth token in cookies
  let hasAuthToken = false
  
  if (cookieHeader) {
    // Look for Supabase auth token
    // The token will be in a cookie like sb-[project-id]-auth-token
    hasAuthToken = /sb-[a-z0-9]+-auth-token/.test(cookieHeader)
  }

  const pathname = request.nextUrl.pathname

  // Redirect old WordPress URLs to homepage
  if (
    pathname.startsWith('/product-category') ||
    pathname === '/shop'
  ) {
    return NextResponse.redirect(new URL('/', request.url), 301)
  }

  // NOTE: We do NOT redirect authenticated users away from /login via middleware.
  // Reason: the cookie-based check (hasAuthToken) cannot verify if the token is still valid.
  // A stale/expired cookie would cause an infinite loop: /login → /account → "Please Log In" → /login → ...
  // The login page's client-side code already redirects genuinely-authenticated users to /account.

  // If user is not logged in and tries to access protected pages, redirect to login
  if (
    !hasAuthToken &&
    (pathname.startsWith('/account') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/orders'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets / API.
     * Must exclude favicons and public image folders or Next serves not-found.
     */
    '/((?!_next/static|_next/image|api|favicon\\.ico|favicon-.*\\.png|apple-touch-icon\\.png|android-chrome-.*\\.png|favlogo/|.*\\.(?:ico|png|jpg|jpeg|webp|svg|gif|css|js|map|txt|xml|webmanifest)$).*)',
  ],
}
