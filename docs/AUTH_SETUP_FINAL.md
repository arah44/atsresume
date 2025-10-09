# Better Auth Setup - Final Implementation

## ✅ Fixed Issues

### Issue 1: Edge Runtime Error (node:process)
**Problem**: Middleware imported MongoDB, causing "Unhandled scheme: node:process" error
**Solution**: Use `getCookieCache` from `better-auth/cookies` in middleware (edge-compatible)

### Issue 2: MongoDB Adapter Type Error
**Problem**: `mongodbAdapter` received Promise<Db> instead of Db
**Solution**: Create synchronous MongoClient and call `.db()` synchronously

### Issue 3: Database Collection Error
**Problem**: `db2.collection is not a function`
**Solution**: Pass Db instance (not client, not promise) to adapter

## ✅ Correct Implementation

### 1. MongoDB Setup (`src/lib/mongodb.ts`)
```typescript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_CONNECTION_STRING;

// Shared client for cache operations
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// For cache system
export async function getCacheDatabase() {
  const client = await clientPromise;
  return client.db('ATSResumeCache');
}
```

### 2. Better Auth Config (`src/lib/auth.ts`)
```typescript
import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

// Create synchronous client for Better Auth
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
  retryWrites: true,
  writeConcern: { w: 'majority' },
});

// Get database instance synchronously (connection is lazy)
const db = client.db('ATSResumeAuth');

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    updateAge: 24 * 60 * 60, // 24 hours
    expiresIn: 7 * 24 * 60 * 60, // 7 days
  },

  advanced: {
    generateId: false, // Use MongoDB ObjectId
  },

  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  plugins: [nextCookies()],
});
```

### 3. Auth Client (`src/lib/auth-client.ts`)
```typescript
'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export type { Session } from './auth';

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
```

### 4. Middleware (`src/middleware.ts`)
```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { getCookieCache } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get session from cookie cache (edge-compatible)
  const session = await getCookieCache(request);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
```

### 5. API Route (`src/app/api/auth/[...all]/route.ts`)
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Key Differences from Initial Attempt

| Aspect | Initial (Wrong) | Final (Correct) |
|--------|----------------|-----------------|
| Client Creation | `const clientPromise = client.connect()` | `const client = new MongoClient(uri)` |
| Database Ref | `const db = await getAuthDatabase()` | `const db = client.db('ATSResumeAuth')` |
| Adapter Call | `mongodbAdapter(dbPromise)` | `mongodbAdapter(db, { client })` |
| Initialization | Async/await | Synchronous |
| Connection | Eager connection | Lazy connection |

## Why This Works

1. **Synchronous Module Init**: Better Auth config is evaluated at module load time, needs sync values
2. **Lazy Connection**: MongoClient connects lazily on first operation, not at instantiation
3. **Db Instance**: Adapter needs `Db` object (has `.collection()` method), not `MongoClient`
4. **Transaction Support**: Passing `client` enables transactions
5. **MongoDB ObjectId**: `generateId: false` uses MongoDB's native `_id` generation

## MongoDB Databases

All on one connection, three separate databases:

```
MONGODB_CONNECTION_STRING
├── ATSResumeAuth (Better Auth)
│   ├── user
│   ├── session
│   ├── account
│   └── verification
│
├── ATSResumeCache (AI Cache)
│   └── cache { _id, key, data, timestamp, cacheType }
│
└── ATSResumeData (Future - User Data)
    ├── profiles
    ├── jobs
    ├── resumes
    └── applications
```

## Testing Auth

### 1. Start Development Server
```bash
bun run dev
```

### 2. Navigate to Sign-Up
Visit: `http://localhost:3000/sign-up`

Expected:
- ✅ See RetroGrid animated background
- ✅ See sign-up form with name, email, password fields
- ✅ Password strength indicator

### 3. Create Account
Fill in:
- Name: Your Name
- Email: test@example.com
- Password: password123
- Confirm Password: password123

Expected:
- ✅ Account created in MongoDB `ATSResumeAuth.user` collection
- ✅ Session created in `ATSResumeAuth.session` collection
- ✅ Auto-signed in (`autoSignIn: true`)
- ✅ Redirected to `/dashboard`

### 4. Test Protected Routes
- Sign out (need to add UI for this)
- Try accessing `/dashboard`
- Expected: Redirected to `/sign-in`

### 5. Sign In
- Go to `/sign-in`
- Enter credentials
- Expected: Signed in, redirected to dashboard

## Next Steps

Now that auth is working, complete the multi-user migration:

1. **Phase 2**: Add `userId` to data models
2. **Phase 3**: Update repositories to accept `userId`
3. **Phase 4**: Update server actions to get `userId` from session
4. **Phase 6**: Full end-to-end testing

## Environment Variables

Required in `.env.local`:

```env
# MongoDB Connection
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/
# or for Atlas:
# MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Summary

✅ **Auth Infrastructure Complete**
- Better Auth installed and configured
- MongoDB adapter working correctly
- Edge-compatible middleware
- Beautiful sign-in/sign-up pages with Magic UI
- Proper client/server boundaries

Ready to proceed with multi-user data isolation!

