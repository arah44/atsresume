/**
 * Repository Layer with Dependency Injection
 * All repositories receive MongoDB collections as dependencies
 * User-scoped repositories (Profile, Resume, Application) require userId
 * Job repository is shared across users
 */

import { MongoProfileRepository } from '@/services/mongodb/repositories/profile-repository';
import { MongoJobRepository } from '@/services/mongodb/repositories/job-repository';
import { MongoResumeRepository } from '@/services/mongodb/repositories/resume-repository';
import { MongoApplicationRepository } from '@/services/mongodb/repositories/application-repository';
import { 
  getProfilesCollection, 
  getJobsCollection, 
  getResumesCollection, 
  getApplicationsCollection 
} from '@/services/mongodb/connection';

// Cache repository instances
let profileRepoCache: Map<string, MongoProfileRepository> = new Map();
let jobRepoCache: MongoJobRepository | null = null;
let resumeRepoCache: Map<string, MongoResumeRepository> = new Map();
let applicationRepoCache: Map<string, MongoApplicationRepository> = new Map();

/**
 * Get user-scoped Profile Repository
 * @param userId - User ID from Better Auth session (required)
 */
export async function getProfileRepository(userId: string): Promise<MongoProfileRepository> {
  if (!profileRepoCache.has(userId)) {
    const collection = await getProfilesCollection();
    profileRepoCache.set(userId, new MongoProfileRepository(collection, userId));
  }
  return profileRepoCache.get(userId)!;
}

/**
 * Get shared Job Repository
 * Jobs are shared across users
 */
export async function getJobRepository(): Promise<MongoJobRepository> {
  if (!jobRepoCache) {
    const collection = await getJobsCollection();
    jobRepoCache = new MongoJobRepository(collection);
  }
  return jobRepoCache;
}

/**
 * Get user-scoped Resume Repository
 * @param userId - User ID from Better Auth session (required)
 */
export async function getResumeRepository(userId: string): Promise<MongoResumeRepository> {
  if (!resumeRepoCache.has(userId)) {
    const collection = await getResumesCollection();
    resumeRepoCache.set(userId, new MongoResumeRepository(collection, userId));
  }
  return resumeRepoCache.get(userId)!;
}

/**
 * Get user-scoped Application Repository
 * @param userId - User ID from Better Auth session (required)
 */
export async function getApplicationRepository(userId: string): Promise<MongoApplicationRepository> {
  if (!applicationRepoCache.has(userId)) {
    const collection = await getApplicationsCollection();
    applicationRepoCache.set(userId, new MongoApplicationRepository(collection, userId));
  }
  return applicationRepoCache.get(userId)!;
}

// Export types and classes
export { MongoBaseRepository } from '@/services/mongodb/repositories/base-repository';
export { MongoProfileRepository } from '@/services/mongodb/repositories/profile-repository';
export type { UserProfile } from '@/services/mongodb/repositories/profile-repository';
export { MongoJobRepository } from '@/services/mongodb/repositories/job-repository';
export type { SavedJob } from '@/services/mongodb/repositories/job-repository';
export { MongoResumeRepository } from '@/services/mongodb/repositories/resume-repository';
export type { SavedResume } from '@/services/mongodb/repositories/resume-repository';
export { MongoApplicationRepository } from '@/services/mongodb/repositories/application-repository';
export type { SavedApplication } from '@/services/mongodb/repositories/application-repository';

