import { Collection } from 'mongodb';
import { MongoBaseRepository } from './base-repository';
import { ProfileDocument } from '../types';
import { ApplicationDetail } from '@/types';

export interface UserProfile {
  id: string;
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
  timestamp: number;
}

/**
 * MongoDB Profile Repository
 * Uses native MongoDB operations instead of key-value storage
 */
export class MongoProfileRepository extends MongoBaseRepository<ProfileDocument, UserProfile> {
  private userId: string;

  constructor(collection: Collection<ProfileDocument>, userId: string) {
    super(collection);
    this.userId = userId;
  }

  protected toDocument(entity: UserProfile): ProfileDocument {
    const { id, ...data } = entity;
    return {
      ...data,
      userId: this.userId
    };
  }

  protected toEntity(doc: ProfileDocument): UserProfile {
    return {
      id: doc.userId, // Use userId as the profile ID
      userId: doc.userId,
      name: doc.name,
      raw_content: doc.raw_content,
      email: doc.email,
      phone: doc.phone,
      baseResumeId: doc.baseResumeId,
      additional_details: doc.additional_details,
      metadata: doc.metadata,
      timestamp: doc.timestamp
    };
  }

  /**
   * Get the user's profile (single profile system)
   */
  async getProfile(): Promise<UserProfile | null> {
    const doc = await this.collection.findOne({ userId: this.userId });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Save or update the user's profile
   */
  async saveProfile(profile: Omit<UserProfile, 'id' | 'timestamp' | 'userId'>): Promise<string> {
    const existing = await this.getProfile();
    
    const profileData: ProfileDocument = {
      userId: this.userId,
      name: profile.name,
      raw_content: profile.raw_content,
      email: profile.email,
      phone: profile.phone,
      baseResumeId: profile.baseResumeId,
      additional_details: profile.additional_details,
      metadata: {
        ...existing?.metadata,
        ...profile.metadata,
        lastUpdated: Date.now(),
        version: (existing?.metadata?.version || 0) + 1
      },
      timestamp: Date.now()
    };

    await this.collection.replaceOne(
      { userId: this.userId },
      profileData,
      { upsert: true }
    );

    console.log('✅ Profile saved for user:', this.userId);
    return this.userId;
  }

  /**
   * Update profile fields
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const existing = await this.getProfile();
    if (!existing) return false;

    const updateData: Partial<ProfileDocument> = {
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        lastUpdated: Date.now()
      },
      timestamp: Date.now()
    };

    // Remove id and userId from updates
    delete updateData.id;
    delete updateData.userId;

    const result = await this.collection.updateOne(
      { userId: this.userId },
      { $set: updateData }
    );

    console.log('✅ Profile updated for user:', this.userId);
    return result.modifiedCount > 0;
  }

  /**
   * Delete profile
   */
  async deleteProfile(): Promise<boolean> {
    const result = await this.collection.deleteOne({ userId: this.userId });
    return result.deletedCount > 0;
  }

  /**
   * Check if profile exists
   */
  async hasProfile(): Promise<boolean> {
    const count = await this.collection.countDocuments({ userId: this.userId }, { limit: 1 });
    return count > 0;
  }
}
