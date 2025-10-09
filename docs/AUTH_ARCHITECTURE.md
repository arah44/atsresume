# Authentication & Data Ownership Architecture

## MongoDB Database Structure

### 1. **ATSResumeAuth** (Authentication)
Managed by `better-auth`:
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth accounts
- `verificationTokens` - Email verification

### 2. **ATSResumeCache** (AI Cache)
Managed by `StorageService`:
- `cache` - Cached AI responses (job analysis, resume generation, etc.)

### 3. **ATSResumeData** (User Data)
Managed by Repositories:
- `profiles` - User profiles (one per user)
- `jobs` - **Shared** job postings (many-to-many with users)
- `resumes` - **User-owned** resumes (belongs to one user)
- `applications` - **User-owned** applications (belongs to one user)
- `userJobs` - Junction collection (user → job relationship)

## Data Ownership Model

### User-Specific Data (userId required)
```typescript
interface UserProfile extends BaseEntity {
  userId: string;  // Owner
  name: string;
  email: string;
  baseResume?: Resume;
  // ...
}

interface SavedResume extends BaseEntity {
  userId: string;  // Owner
  name: string;
  position: string;
  // ...
}

interface JobApplication extends BaseEntity {
  userId: string;  // Owner
  jobId: string;   // References shared job
  status: 'pending' | 'submitted' | 'failed';
  // ...
}
```

### Shared Data (no userId, referenced by many users)
```typescript
interface SavedJob extends BaseEntity {
  // NO userId field - shared across users
  name: string;
  company: string;
  url: string;
  description: string;
  // ...
}

interface UserJobRelation {
  userId: string;
  jobId: string;
  savedAt: number;
  // Custom user notes, tags, etc.
}
```

## Repository Pattern with User Context

### Server Actions (Auto-inject userId)
```typescript
// Server action automatically gets userId from session
export async function saveResume(resume: Resume) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const resumeRepo = getResumeRepository(session.user.id);
  return await resumeRepo.save(resume);
}
```

### Repository Usage
```typescript
// User-scoped repository
const resumeRepo = getResumeRepository(userId);
const myResumes = await resumeRepo.getAll(); // Only user's resumes

// Shared job repository
const jobRepo = getJobRepository(userId);
const myJobs = await jobRepo.getAll(); // Jobs saved by this user
const sharedJob = await jobRepo.saveShared(job); // Save to shared pool
```

## Migration Strategy

### Phase 1: Add Auth Infrastructure ✅ COMPLETE
- ✅ Install better-auth
- ✅ Configure MongoDB adapter (synchronous Db instance)
- ✅ Set up auth API routes (`/api/auth/[...all]`)
- ✅ Create edge-compatible middleware with `getCookieCache`
- ✅ Beautiful sign-in/sign-up pages with Magic UI RetroGrid
- ✅ Auth client setup with React hooks

### Phase 2: Update Data Models ⏳ NEXT
- Add `userId` to: `UserProfile`, `SavedResume`, `JobApplication`
- Keep `SavedJob` without `userId` (shared)
- Create `UserJobRelation` for job bookmarks

### Phase 3: Update Repositories ⏳
- Inject `userId` into repository constructors
- Scope cache keys by userId: `user-{userId}-profile-{id}`
- Filter queries by `userId` for user-owned data
- Implement shared job logic

### Phase 4: Update Server Actions ⏳
- Extract `userId` from session using `getUserId()` helper
- Pass `userId` to repositories
- Add authorization checks (user owns resource)

### Phase 5: Protect Routes ✅ COMPLETE
- ✅ Middleware for protected routes
- ✅ Redirect unauthenticated users to `/sign-in`
- ✅ Redirect authenticated users away from auth pages
- ⏳ Handle public resume sharing (future)

## Security Considerations

1. **Always validate userId**: Never trust client-provided userId
2. **Session-based access**: Extract userId from server-side session only
3. **Resource ownership**: Verify user owns resource before mutations
4. **Public sharing**: Implement secure resume sharing with tokens
5. **Rate limiting**: Prevent abuse of AI generation endpoints

## Example Flow

### Saving a Resume (User-Owned)
```typescript
// Client Component
const handleSave = async () => {
  await saveResumeAction(resume); // No userId needed
};

// Server Action
export async function saveResumeAction(resume: Resume) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const resumeRepo = getResumeRepository(session.user.id);
  const id = await resumeRepo.save(resume);

  revalidatePath('/dashboard');
  return { success: true, id };
}

// Repository
class ResumeRepository extends BaseRepository<SavedResume> {
  constructor(storage: AsyncStorageProvider, private userId: string) {
    super(storage, `resume-${userId}-`, `resumes-${userId}`);
  }

  async save(resume: Resume): Promise<string> {
    const savedResume = {
      ...resume,
      userId: this.userId, // Automatically inject userId
    };
    return super.save(savedResume);
  }
}
```

### Saving a Job (Shared)
```typescript
// Server Action
export async function saveJobAction(job: TargetJobJson) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const jobRepo = getJobRepository(session.user.id);

  // Check if job already exists (shared)
  const existing = await jobRepo.findByUrl(job.url);
  const jobId = existing?.id || await jobRepo.saveShared(job);

  // Create user → job relationship
  await jobRepo.saveUserRelation(session.user.id, jobId);

  revalidatePath('/dashboard/jobs');
  return { success: true, id: jobId };
}
```

## Public Resume Sharing

For sharing resumes publicly:

```typescript
interface PublicResumeToken {
  resumeId: string;
  userId: string;
  token: string; // Random secure token
  expiresAt?: number;
  viewCount?: number;
}

// Generate shareable link
const token = await createPublicResumeToken(resumeId);
const shareUrl = `/share/resume/${token}`;

// Public route (no auth required)
export async function GET(request: Request, { params }: { params: { token: string } }) {
  const tokenData = await getResumeByToken(params.token);

  if (!tokenData || (tokenData.expiresAt && tokenData.expiresAt < Date.now())) {
    return notFound();
  }

  const resume = await getResumeById(tokenData.resumeId);
  return NextResponse.json(resume);
}
```

