/**
 * Next.js Middleware for Authentication
 * Protects routes and redirects unauthenticated users
 *
 * Uses Better Auth's getCookieCache for edge-compatible session checking.
 * This validates the session from the cookie cache without requiring Node.js APIs.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getCookieCache } from 'better-auth/cookies';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/resume',
  '/profile',
];

// Routes that are only accessible when NOT authenticated
const authRoutes = [
  '/sign-in',
  '/sign-up',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get session from cookie cache (edge-compatible)
  const session = await getCookieCache(request);

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to sign-in
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

