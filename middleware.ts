
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Domain redirect configuration
const PRODUCTION_DOMAIN = 'www.adviesnconsultancy.nl'
const NON_WWW_DOMAIN = 'adviesnconsultancy.nl'

export async function middleware(request: NextRequest) {
  const { pathname, search, protocol, hostname } = request.nextUrl
  const url = request.nextUrl.clone()

  // ==== DOMAIN REDIRECTS ====
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && protocol !== 'https:') {
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  // Redirect non-www to www in production
  if (process.env.NODE_ENV === 'production' && hostname === NON_WWW_DOMAIN) {
    url.hostname = PRODUCTION_DOMAIN
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301) // Permanent redirect
  }

  // Handle other hostname variants (in case of different domains pointing to the site)
  if (process.env.NODE_ENV === 'production' && 
      hostname !== PRODUCTION_DOMAIN && 
      hostname.includes('adviesnconsultancy')) {
    url.hostname = PRODUCTION_DOMAIN
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

  // ==== AUTHENTICATION MIDDLEWARE ====
  
  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    // Allow login and error pages
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next()
    }

    try {
      // Check for valid JWT token
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
      })

      if (!token || !token.isActive) {
        // Redirect to login with returnUrl
        const loginUrl = url.clone()
        loginUrl.pathname = '/admin/login'
        loginUrl.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`
        return NextResponse.redirect(loginUrl)
      }

      // Additional security check for expired or inactive sessions
      if (token.expired || token.inactive || token.accountDeactivated) {
        const loginUrl = url.clone()
        loginUrl.pathname = '/admin/login'
        loginUrl.search = `?error=SessionExpired&callbackUrl=${encodeURIComponent(pathname + search)}`
        return NextResponse.redirect(loginUrl)
      }

    } catch (error) {
      console.error('Middleware auth error:', error)
      // Redirect to login on error
      const loginUrl = url.clone()
      loginUrl.pathname = '/admin/login'
      loginUrl.search = `?error=AuthError`
      return NextResponse.redirect(loginUrl)
    }
  }

  // ==== SECURITY HEADERS ====
  
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy (allow Cloudflare and other necessary sources)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://apps.abacus.ai https://cloudflareinsights.com;
    frame-src 'self';
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
