# Better Auth - Quick Reference

## ✅ What's Working Now

### Auth Pages
- `/sign-in` - Sign in page with RetroGrid background
- `/sign-up` - Sign up page with password strength indicator
- `/api/auth/*` - All Better Auth API endpoints

### Middleware Protection
- `/dashboard/*` - Requires authentication
- `/resume/*` - Requires authentication (except public shares)
- `/profile/*` - Requires authentication

### Databases (Separate)
- `ATSResumeAuth` - Users, sessions, accounts
- `ATSResumeCache` - AI-generated content cache
- `ATSResumeData` - Future: User profiles, jobs, resumes

## How to Use

### In Client Components
```typescript
'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';

export function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return <button onClick={() => signIn.email({...})}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### In Server Components
```typescript
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

  return <div>Welcome {session.user.name}!</div>;
}
```

### In Server Actions
```typescript
'use server';

import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function saveData(data: any) {
  // Throws if not authenticated
  const userId = await getUserId();

  // Use userId to scope data...
  await saveToDatabase(userId, data);

  revalidatePath('/dashboard');
  return { success: true };
}
```

### In Middleware (Edge Runtime)
```typescript
import { getCookieCache } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const session = await getCookieCache(request);

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
```

## Important Notes

### ✅ DO:
- Use `getCookieCache` in middleware (edge-compatible)
- Use `auth.api.getSession()` in server components/actions
- Use `useSession()` hook in client components
- Always get `userId` from session server-side
- Use `"server-only"` for auth.ts

### ❌ DON'T:
- Don't import `auth` from `@/lib/auth` in client components
- Don't import `auth` in middleware (use `getCookieCache`)
- Don't trust client-provided `userId` - always get from session
- Don't import MongoDB in client code or middleware

## Session Data Structure

```typescript
{
  user: {
    id: string;           // MongoDB ObjectId
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  },
  session: {
    token: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }
}
```

## Testing Checklist

- [ ] Sign up creates user in `ATSResumeAuth.user`
- [ ] Auto sign-in works after signup
- [ ] Sign out clears session
- [ ] Sign in works with correct credentials
- [ ] Sign in fails with wrong credentials
- [ ] Protected routes redirect to `/sign-in`
- [ ] Auth routes redirect to `/dashboard` when logged in
- [ ] Session persists across page reloads
- [ ] Session expires after 7 days

## Next: Multi-User Migration

To support multiple users with data isolation, you need to:

1. Add `userId` field to repositories
2. Update server actions to get `userId` from session
3. Scope all data by user
4. Keep jobs shared across users

See `AUTH_ARCHITECTURE.md` for full migration guide.

