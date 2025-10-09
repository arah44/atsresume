# Authentication Testing Guide

## Quick Test (5 minutes)

### 1. Start Server
```bash
bun run dev
```
Visit: `http://localhost:3000`

### 2. Sign Up
- Click "Sign up" or go to `/sign-up`
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: test1234
  - Confirm: test1234
- Submit
- Expected: Auto-signed in, redirected to `/dashboard`

### 3. Check MongoDB
```bash
mongosh
use ATSResumeAuth
db.user.findOne()
# Should see your test user

db.session.findOne()
# Should see active session
```

### 4. Create Profile
- Go to `/dashboard/profile`
- Upload resume PDF or fill in form
- Submit
- Expected: Profile saved

### 5. Check User Data
```bash
use ATSResumeCache
db.cache.find({ key: /^user-.*-profile/ }).pretty()
# Should see profile with your userId
```

### 6. Sign Out
- Click user menu in sidebar
- Click "Log out"
- Expected: Redirected to `/sign-in`

### 7. Test Protection
- Try accessing `/dashboard`
- Expected: Redirected to `/sign-in`

### 8. Sign In Again
- Email: test@example.com
- Password: test1234
- Expected: Signed in, see your profile data

## Full Test (15 minutes)

### Multi-User Data Isolation

#### User A Flow
1. Sign up as `usera@test.com`
2. Create profile with name "Alice"
3. Generate a resume
4. Save a job "Software Engineer at Google"
5. Note the MongoDB keys created
6. Sign out

#### User B Flow
1. Sign up as `userb@test.com`
2. Verify dashboard is empty (no Alice's data)
3. Create profile with name "Bob"
4. Generate a different resume
5. Save the same job "Software Engineer at Google" (should be shared)
6. Sign out

#### Verify Isolation
```bash
# Get User A's ID
use ATSResumeAuth
const userA = db.user.findOne({ email: "usera@test.com" })
const userB = db.user.findOne({ email: "userb@test.com" })

# Check data isolation
use ATSResumeCache

# User A's data
db.cache.find({ key: new RegExp(`^user-${userA._id}`) }).count()
# Should show Alice's profile and resume

# User B's data
db.cache.find({ key: new RegExp(`^user-${userB._id}`) }).count()
# Should show Bob's profile and resume

# Shared jobs
db.cache.find({ key: /^job-/ }).pretty()
# Should show one job (shared by both users)
```

#### Sign Back as User A
1. Sign in as `usera@test.com`
2. Verify you see Alice's profile
3. Verify you see Alice's resumes
4. Verify you do NOT see Bob's data
5. Verify you CAN see shared job

## Expected MongoDB Structure

### ATSResumeAuth Database
```javascript
// Users collection
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "usera@test.com",
  name: "Alice",
  emailVerified: false,
  createdAt: ISODate("2025-10-09T..."),
  updatedAt: ISODate("2025-10-09T...")
}

// Sessions collection
{
  _id: ObjectId("..."),
  token: "some-long-token",
  userId: "507f1f77bcf86cd799439011",
  expiresAt: ISODate("2025-10-16T..."),
  ipAddress: "::1",
  userAgent: "Mozilla/5.0..."
}
```

### ATSResumeCache Database
```javascript
// User A's profile
{
  _id: ObjectId("..."),
  key: "user-507f1f77bcf86cd799439011-profile-user-profile",
  data: {
    userId: "507f1f77bcf86cd799439011",
    id: "user-profile",
    name: "Alice",
    email: "usera@test.com",
    baseResume: { ... },
    timestamp: 1728480000000
  },
  timestamp: 1728480000000
}

// User A's resume
{
  _id: ObjectId("..."),
  key: "user-507f1f77bcf86cd799439011-resume-abc123",
  data: {
    userId: "507f1f77bcf86cd799439011",
    id: "abc123",
    name: "Alice",
    position: "Software Engineer",
    // ... resume data
  },
  timestamp: 1728480100000
}

// Shared job (NO userId prefix)
{
  _id: ObjectId("..."),
  key: "job-xyz789",
  data: {
    id: "xyz789",
    name: "Software Engineer",
    company: "Google",
    // ... job data (no userId field)
  },
  timestamp: 1728480200000
}
```

## Common Issues & Fixes

### Issue: "Module build failed: node:process"
**Cause**: Importing server-only code in middleware/client
**Fix**: ✅ Use `getCookieCache` in middleware, not `auth.api.getSession`

### Issue: "db2.collection is not a function"
**Cause**: MongoDB adapter received wrong type
**Fix**: ✅ Pass synchronous `Db` instance, not Promise

### Issue: "Password contains unescaped characters"
**Cause**: Special chars in MongoDB password
**Fix**: URL-encode password in connection string

### Issue: User sees other users' data
**Cause**: Missing userId in queries
**Fix**: ✅ All repositories now scoped by userId

### Issue: Server actions fail with "Unauthorized"
**Cause**: Not signed in
**Fix**: Sign in first, or check session handling

## Debug Commands

### Check Current Session
```typescript
// In server component:
const session = await auth.api.getSession({ headers: await headers() })
console.log('Session:', session)
```

### Check Repository Keys
```typescript
// In server action:
const userId = await getUserId()
console.log('User ID:', userId)

const profileRepo = getProfileRepository(userId)
// This creates keys like: user-{userId}-profile-*
```

### List All Keys for a User
```bash
mongosh
use ATSResumeCache
db.cache.find({ key: /^user-507f1f77/ }).forEach(doc => {
  print(doc.key)
})
```

## Success Criteria

✅ Sign up creates user in `ATSResumeAuth.user`
✅ Session cookie set after sign in
✅ Protected routes redirect to `/sign-in`
✅ User can create profile
✅ Profile saved with userId prefix in key
✅ User can generate resumes
✅ Resumes saved with userId prefix
✅ Different users see different data
✅ Jobs are shared between users
✅ Sign out clears session and redirects

## Performance Notes

- **Connection Pooling**: Single MongoDB client shared across auth, cache, and data
- **Cookie Caching**: Sessions cached in cookies for 5 minutes (reduces DB queries)
- **Lazy Connection**: MongoDB connects only when first operation is performed
- **Edge Middleware**: Fast session checks without database queries

## Security Checklist

✅ Never trust client-provided userId
✅ Always get userId from server-side session
✅ Validate resource ownership before mutations
✅ Use `"server-only"` for auth.ts
✅ Scope all user data by userId
✅ Keep shared data (jobs) unscoped
✅ Use HTTPS in production
✅ Enable email verification in production
✅ Set secure cookies in production

## Production Deployment

Before deploying:

1. **Enable Email Verification**
   ```typescript
   // src/lib/auth.ts
   emailAndPassword: {
     enabled: true,
     requireEmailVerification: true,  // Change this
   }
   ```

2. **Set Environment Variables**
   ```env
   MONGODB_CONNECTION_STRING=mongodb+srv://...
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   BETTER_AUTH_SECRET=generate-random-secret-here
   ```

3. **Enable HTTPS**
   - Use Vercel, Netlify, or similar
   - Better Auth automatically uses secure cookies on HTTPS

4. **Add Rate Limiting**
   - Protect sign-up/sign-in endpoints
   - Limit AI generation requests per user

## Support

If you encounter issues:

1. Check MongoDB connection string (URL-encode password)
2. Verify environment variables are set
3. Check browser console for errors
4. Check server logs for auth errors
5. Verify session cookie is being set
6. Test in incognito mode (fresh session)

## Congratulations! 🎉

Your app now supports unlimited users with complete data isolation!

