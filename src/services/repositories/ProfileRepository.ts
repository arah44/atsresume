import { BaseRepository, BaseEntity } from './BaseRepository';
import { AsyncStorageProvider } from '../storage';
import { Person, Resume, ApplicationDetail } from '@/types';

export interface UserProfile extends BaseEntity {
  userId: string;  // Owner of this profile (from Better Auth)
  name: string;
  raw_content: string;
  email?: string;
  phone?: string;
  baseResumeId?: string; // ID reference to base resume in ResumeRepository
  additional_details?: ApplicationDetail[];
  metadata?: {
    lastUpdated?: number;
    version?: number;
    notes?: string;
  };
}

/**
 * Profile Repository with Dependency Injection
 * Now supports multi-user with userId scoping
 */
export class ProfileRepository extends BaseRepository<UserProfile> {
  private static readonly PROFILE_ID = 'user-profile';
  private userId: string;

  constructor(storage: AsyncStorageProvider, userId: string) {
    // Scope keys by userId: user-{userId}-profile-
    super(storage, `user-${userId}-profile-`, `user-${userId}-profiles-list`);
    this.userId = userId;
  }

  protected generateId(entity: Omit<UserProfile, 'id' | 'timestamp'>): string {
    // Profiles use a fixed ID per user
    return ProfileRepository.PROFILE_ID;
  }

  /**
   * Get the user's profile (single profile system)
   */
  async getProfile(): Promise<UserProfile | null> {
    return this.getById(ProfileRepository.PROFILE_ID);
  }

  /**
   * Save or update the user's profile
   */
  async saveProfile(profile: Omit<UserProfile, 'id' | 'timestamp' | 'userId'>): Promise<string> {
    const existing = await this.getProfile();
    
    const profileData: UserProfile = {
      ...profile,
      userId: this.userId,  // Inject userId
      id: ProfileRepository.PROFILE_ID,
      timestamp: Date.now(),
      metadata: {
        ...existing?.metadata,
        ...profile.metadata,
        lastUpdated: Date.now(),
        version: (existing?.metadata?.version || 0) + 1
      }
    };

    const key = this.getEntityKey(ProfileRepository.PROFILE_ID);
    await this.storage.writeAsync(key, profileData);

    console.log('✅ Profile saved for user:', this.userId);
    return ProfileRepository.PROFILE_ID;
  }

  /**
   * Update profile fields
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const existing = await this.getProfile();
    if (!existing) return false;

    const updated: UserProfile = {
      ...existing,
      ...updates,
      userId: this.userId,  // Ensure userId is maintained
      id: ProfileRepository.PROFILE_ID,
      timestamp: Date.now(),
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        lastUpdated: Date.now()
      }
    };

    const key = this.getEntityKey(ProfileRepository.PROFILE_ID);
    await this.storage.writeAsync(key, updated);

    console.log('✅ Profile updated for user:', this.userId);
    return true;
  }

  /**
   * Delete profile
   */
  async deleteProfile(): Promise<boolean> {
    return this.delete(ProfileRepository.PROFILE_ID);
  }

  /**
   * Check if profile exists
   */
  async hasProfile(): Promise<boolean> {
    return this.exists(ProfileRepository.PROFILE_ID);
  }
}

