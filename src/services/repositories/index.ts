/**
 * Repository Layer with Dependency Injection
 * All repositories receive MongoDB storage as a dependency
 * User-scoped repositories (Profile, Resume, Application) require userId
 * Job repository is shared across users
 */

import { getStorageService } from '../storage';
import { ProfileRepository } from './ProfileRepository';
import { JobRepository } from './JobRepository';
import { ResumeRepository } from './ResumeRepository';
import { ApplicationRepository } from './ApplicationRepository';

// Get MongoDB storage service
const mongoStorage = getStorageService();

// Shared job repository (singleton - jobs are shared across users)
const jobRepository = new JobRepository(mongoStorage);

/**
 * Get user-scoped Profile Repository
 * @param userId - User ID from Better Auth session (required)
 */
export function getProfileRepository(userId: string): ProfileRepository {
  return new ProfileRepository(mongoStorage, userId);
}

/**
 * Get shared Job Repository
 * Jobs are shared across users
 */
export function getJobRepository(): JobRepository {
  return jobRepository;
}

/**
 * Get user-scoped Resume Repository
 * @param userId - User ID from Better Auth session (required)
 */
export function getResumeRepository(userId: string): ResumeRepository {
  return new ResumeRepository(mongoStorage, userId);
}

/**
 * Get user-scoped Application Repository
 * @param userId - User ID from Better Auth session (required)
 */
export function getApplicationRepository(userId: string): ApplicationRepository {
  return new ApplicationRepository(mongoStorage, userId);
}

// Export types and classes
export { BaseRepository } from './BaseRepository';
export type { BaseEntity } from './BaseRepository';
export { ProfileRepository } from './ProfileRepository';
export type { UserProfile } from './ProfileRepository';
export { JobRepository } from './JobRepository';
export type { SavedJob } from './JobRepository';
export { ResumeRepository } from './ResumeRepository';
export type { SavedResume } from './ResumeRepository';
export { ApplicationRepository } from './ApplicationRepository';
export type { SavedApplication } from './ApplicationRepository';

