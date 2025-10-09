# Authentication Migration Guide

## Overview

This guide explains how to migrate from single-user to multi-user with authentication.

## Step 1: Update Data Models

### Add `userId` field to user-owned entities:

```typescript
// src/services/repositories/ProfileRepository.ts
export interface UserProfile extends BaseEntity {
  userId: string;  // ADD THIS
  name: string;
  email: string;
  // ... rest of fields
}

// src/services/repositories/ResumeRepository.ts
export interface SavedResume extends Omit<Resume, 'id'>, BaseEntity {
  userId: string;  // ADD THIS
  // ... rest of fields
}

// src/services/repositories/ApplicationRepository.ts
export interface JobApplication extends BaseEntity {
  userId: string;  // ADD THIS
  jobId: string;
  status: string;
  // ... rest of fields
}
```

### Keep `SavedJob` shared (NO userId):

```typescript
// src/services/repositories/JobRepository.ts
export interface SavedJob extends TargetJobJson, BaseEntity {
  // NO userId - jobs are shared across users
}
```

## Step 2: Update Repository Constructors

```typescript
// src/services/repositories/BaseRepository.ts
export abstract class BaseRepository<T extends BaseEntity> {
  protected storage: AsyncStorageProvider;
  protected prefix: string;
  protected listKey: string;
  protected userId?: string;  // ADD THIS

  constructor(
    storage: AsyncStorageProvider,
    prefix: string,
    listKey: string,
    userId?: string  // ADD THIS
  ) {
    this.storage = storage;
    
    // Scope keys by userId if provided
    this.prefix = userId ? `user-${userId}-${prefix}` : prefix;
    this.listKey = userId ? `user-${userId}-${listKey}` : listKey;
    this.userId = userId;
  }
}
```

## Step 3: Update Repository Factory

```typescript
// src/services/repositories/index.ts
import { StorageService, getStorageService } from '../storage';
import { ProfileRepository } from './ProfileRepository';
import { JobRepository } from './JobRepository';
import { ResumeRepository } from './ResumeRepository';
import { ApplicationRepository } from './ApplicationRepository';

const storage = getStorageService();

// User-scoped repositories (require userId)
export function getProfileRepository(userId: string): ProfileRepository {
  return new ProfileRepository(storage, userId);
}

export function getResumeRepository(userId: string): ResumeRepository {
  return new ResumeRepository(storage, userId);
}

export function getApplicationRepository(userId: string): ApplicationRepository {
  return new ApplicationRepository(storage, userId);
}

// Shared job repository (optional userId for filtering)
export function getJobRepository(userId?: string): JobRepository {
  return new JobRepository(storage, userId);
}
```

## Step 4: Update Server Actions

All server actions must get userId from session:

```typescript
// src/app/actions/profileActions.ts
'use server';

import { getProfileRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { Person, Resume } from '@/types';
import { UserProfile } from '@/services/repositories/ProfileRepository';
import { revalidatePath } from 'next/cache';

export async function saveProfileAction(person: Person | Partial<UserProfile>): Promise<UserProfile> {
  // Get userId from session (throws if not authenticated)
  const userId = await getUserId();
  
  const profileRepo = getProfileRepository(userId);
  
  // ... rest of logic
}

export async function getProfileAction(): Promise<UserProfile | null> {
  const userId = await getUserId();
  const profileRepo = getProfileRepository(userId);
  return await profileRepo.getProfile();
}
```

## Step 5: Update Server Components

Server components that fetch data need to get userId:

```typescript
// src/app/dashboard/profile/page.tsx
import { getUserId } from '@/lib/auth-utils';
import { getProfileRepository } from '@/services/repositories';
import { ProfileClientPage } from './ProfileClientPage';

export default async function ProfilePage() {
  // Get userId from session
  const userId = await getUserId();
  
  // Get user-scoped repository
  const profileRepo = getProfileRepository(userId);
  const profile = await profileRepo.getProfile();

  return <ProfileClientPage initialProfile={profile} />;
}
```

## Step 6: Migrate Existing Data

Create a migration script to add userId to existing data:

```typescript
// scripts/migrate-add-user-ids.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING!;
const DEFAULT_USER_ID = 'user-default'; // Or prompt for real user ID

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db('ATSResumeData');
  
  // Update profiles
  await db.collection('cache').updateMany(
    { key: /^profile-/, userId: { $exists: false } },
    { $set: { 'data.userId': DEFAULT_USER_ID } }
  );
  
  // Update resumes
  await db.collection('cache').updateMany(
    { key: /^resume-/, userId: { $exists: false } },
    { $set: { 'data.userId': DEFAULT_USER_ID } }
  );
  
  // Update applications
  await db.collection('cache').updateMany(
    { key: /^application-/, userId: { $exists: false } },
    { $set: { 'data.userId': DEFAULT_USER_ID } }
  );
  
  console.log('✅ Migration complete');
  await client.close();
}

migrate().catch(console.error);
```

Run migration:
```bash
bun run scripts/migrate-add-user-ids.ts
```

## Step 7: Update Client Components

Client components don't need changes - they receive data as props and use server actions for mutations.

```typescript
// src/app/dashboard/profile/ProfileClientPage.tsx
'use client';

import { saveProfileAction } from '@/app/actions/profileActions';
import { UserProfile } from '@/services/repositories/ProfileRepository';

export function ProfileClientPage({ 
  initialProfile 
}: { 
  initialProfile: UserProfile | null 
}) {
  const handleSave = async (data) => {
    // Server action automatically gets userId from session
    await saveProfileAction(data);
    router.refresh();
  };
  
  return <div>{/* UI */}</div>;
}
```

## Step 8: Add Auth UI Components

Install better-auth React client:

```bash
bun add @better-auth/react
```

Create auth client:

```typescript
// src/lib/auth-client.ts
'use client';

import { createAuthClient } from '@better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

Use in components:

```typescript
'use client';

import { useSession, signOut } from '@/lib/auth-client';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  
  if (!session) {
    return <Link href="/sign-in">Sign In</Link>;
  }
  
  return (
    <div>
      <span>{session.user.email}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Step 9: Testing

1. **Sign up a new user**
   - Go to `/sign-up`
   - Create account
   - Verify you're redirected to `/dashboard`

2. **Test data isolation**
   - Sign up as User A
   - Create profile, jobs, resumes
   - Sign out
   - Sign up as User B
   - Verify User B sees empty dashboard
   - Create different data
   - Sign out
   - Sign in as User A
   - Verify User A's data is still there

3. **Test shared jobs**
   - User A saves a job
   - User B saves the same job (same URL)
   - Verify only one job record exists in DB
   - Verify both users can see it in their dashboards

## Rollback Plan

If needed to rollback:

1. Remove middleware protection from routes
2. Use `getProfileRepository('user-default')` with hardcoded ID
3. Revert server action changes
4. Continue with single-user mode

## Summary of Changes

✅ Added `userId` to user-owned data models  
✅ Updated repository constructors to accept `userId`  
✅ Created auth utilities (`getUserId`, `requireAuth`)  
✅ Updated all server actions to get `userId` from session  
✅ Updated server components to pass `userId` to repositories  
✅ Added middleware for route protection  
✅ Set up better-auth with MongoDB adapter  
✅ Migrated existing data to include `userId`  

The migration maintains the same architecture while adding multi-user support!

