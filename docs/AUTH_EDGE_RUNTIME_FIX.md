# Edge Runtime & Client/Server Boundary Fix

## Problem
Initial middleware implementation imported `auth` from `@/lib/auth.ts`, which uses MongoDB and Node.js APIs. This caused a build error because middleware runs on the Edge Runtime and cannot use Node.js modules.

**Error:**
```
Module build failed: UnhandledSchemeError: Reading from "node:process" is not handled by plugins (Unhandled scheme).
```

## Solution
Updated middleware to use Better Auth's edge-compatible `getCookieCache` helper from `better-auth/cookies`.

### Middleware Implementation (Edge-Compatible)

```typescript
// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getCookieCache } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get session from cookie cache (edge-compatible)
  const session = await getCookieCache(request);

  // Redirect logic...
}
```

**Key Points:**
- ✅ No MongoDB imports
- ✅ No Node.js API imports
- ✅ Edge Runtime compatible
- ✅ Validates session from cookie cache
- ✅ No database query required

### Server-Side Auth Configuration

```typescript
// src/lib/auth.ts
import "server-only"; // Marks file as server-only

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: mongodbAdapter(/* ... */),
  plugins: [
    nextCookies() // Handles cookies in server actions
  ],
});
```

**Key Points:**
- ✅ Uses `"server-only"` import to prevent client-side usage
- ✅ Includes `nextCookies()` plugin for proper cookie handling
- ✅ Only imported in server components and API routes

### Client-Side Auth

```typescript
// src/lib/auth-client.ts
'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: window.location.origin,
});

export const { useSession, signIn, signUp, signOut } = authClient;
```

**Key Points:**
- ✅ Uses `'use client'` directive
- ✅ No MongoDB or server-only code
- ✅ Browser-safe APIs only

## Better Auth Middleware Approaches

Better Auth documentation provides 3 approaches for middleware:

### 1. Edge Runtime with Cookie Cache (✅ Our Choice)
```typescript
import { getCookieCache } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const session = await getCookieCache(request);
  // Validates session from cookie
}
```
**Pros:** Edge-compatible, validates session, fast
**Cons:** Cookie cache not updated until server interaction

### 2. Node.js Runtime (Next.js 15.2.0+)
```typescript
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
}

export const config = {
  runtime: "nodejs", // Required
  matcher: ["/dashboard"]
};
```
**Pros:** Direct database access, real-time validation
**Cons:** Requires Node.js runtime, slower cold starts

### 3. Cookie Existence Check Only (❌ Not Secure)
```typescript
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // Only checks if cookie exists, doesn't validate!
}
```
**Pros:** Fast, simple
**Cons:** NOT SECURE - can be bypassed by manually creating cookie

## Server Component Auth Checks

For server components and server actions, use the full auth API:

```typescript
// Server Component
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/sign-in');
  }

  return <div>Welcome {session.user.name}</div>;
}
```

```typescript
// Server Action
'use server';

import { getUserId } from '@/lib/auth-utils';

export async function saveData(data: any) {
  const userId = await getUserId(); // Throws if not authenticated
  // ... save data for user
}
```

## File Organization

```
src/
├── middleware.ts                    # Edge Runtime (getCookieCache)
├── lib/
│   ├── auth.ts                     # Server-only (MongoDB, betterAuth)
│   ├── auth-client.ts              # Client-only (React hooks)
│   ├── auth-utils.ts               # Server-only helpers
│   └── mongodb.ts                  # Server-only (MongoDB client)
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx       # Client component (auth-client)
│   │   └── sign-up/page.tsx       # Client component (auth-client)
│   ├── api/
│   │   └── auth/[...all]/route.ts # API route (server auth)
│   └── dashboard/
│       └── page.tsx                # Server component (server auth)
```

## Import Rules

### ✅ DO:
```typescript
// In middleware.ts
import { getCookieCache } from 'better-auth/cookies';

// In server components/actions
import { auth } from '@/lib/auth';
import { getUserId } from '@/lib/auth-utils';

// In client components
import { useSession, signIn } from '@/lib/auth-client';
```

### ❌ DON'T:
```typescript
// In middleware.ts - WRONG!
import { auth } from '@/lib/auth'; // Has MongoDB!

// In client components - WRONG!
import { auth } from '@/lib/auth'; // Server-only!

// In client components - WRONG!
import { getMongoClient } from '@/lib/mongodb'; // Server-only!
```

## Summary

The fix ensures proper client/server boundaries by:

1. **Middleware**: Uses edge-compatible `getCookieCache` - no Node.js/MongoDB
2. **Server Code**: Marked with `"server-only"` import
3. **Client Code**: Marked with `'use client'` directive
4. **Plugins**: Added `nextCookies()` for proper cookie handling
5. **Clear Separation**: Different files for server vs client auth

This resolves the build error while maintaining proper authentication flow!

