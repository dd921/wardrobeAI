import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  console.log('[Middleware] Path:', req.nextUrl.pathname)

  // Skip middleware if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('[Middleware] Supabase not configured, skipping')
    return NextResponse.next()
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    console.log('[Middleware] Getting session...')
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('[Middleware] Session:', session ? 'found' : 'none')

    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    console.log('[Middleware] Is public route:', isPublicRoute)

    // If user is not authenticated and trying to access a protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access login/signup
    if (session && isPublicRoute) {
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware auth error:', error)
    // On error, allow access to public routes, redirect others to login
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
