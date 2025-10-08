import { Person, Resume } from '@/types';

const STORAGE_KEY = 'atsresume_user_profile';

export interface UserProfile extends Person {
  timestamp: number;
  baseResume?: Resume; // Complete base resume object (generated from profile)
  metadata?: {
    lastUpdated?: number;
    version?: number;
    notes?: string;
  };
}

export class ProfileStorageService {
  /**
   * Get the user's profile
   */
  static getProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }

  /**
   * Save or update the user's profile
   * Accepts either a Person or a partial UserProfile with additional fields
   */
  static saveProfile(person: Person | Partial<UserProfile>): void {
    console.log('📥 ProfileStorage.saveProfile called');
    console.log('Input has baseResume?', 'baseResume' in person);
    console.log('Input has metadata?', 'metadata' in person);
    console.log('Input keys:', Object.keys(person));

    const timestamp = Date.now();
    const existingProfile = this.getProfile();

    // Spread all fields from person (including baseResume and metadata if present)
    const profile: UserProfile = {
      ...existingProfile,
      ...person,
      timestamp,
      metadata: {
        ...existingProfile?.metadata,
        ...(('metadata' in person) ? person.metadata : {}),
        lastUpdated: timestamp
      }
    } as UserProfile;

    console.log('📦 Profile being saved:');
    console.log('  - Name:', profile.name);
    console.log('  - Has baseResume?', !!profile.baseResume);
    console.log('  - Has metadata?', !!profile.metadata);
    console.log('  - BaseResume position:', profile.baseResume?.position);
    console.log('  - BaseResume work experience count:', profile.baseResume?.workExperience?.length);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    // Also save to the main person storage for backwards compatibility
    localStorage.setItem('atsresume_person', JSON.stringify({
      name: profile.name,
      raw_content: profile.raw_content
    }));

    console.log('✅ Profile saved to localStorage');
  }

  /**
   * Update the user's profile
   */
  static updateProfile(updates: Partial<UserProfile>): boolean {
    console.log('🔄 ProfileStorage.updateProfile called');
    console.log('Updates keys:', Object.keys(updates));
    console.log('Updates has baseResume?', 'baseResume' in updates);
    console.log('Updates has metadata?', 'metadata' in updates);

    const profile = this.getProfile();

    if (!profile) {
      console.error('❌ Profile not found');
      return false;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      timestamp: Date.now(),
      metadata: {
        ...profile.metadata,
        ...updates.metadata,
        lastUpdated: Date.now()
      }
    };

    console.log('📦 Updated profile:');
    console.log('  - Has baseResume?', !!updatedProfile.baseResume);
    console.log('  - Has metadata?', !!updatedProfile.metadata);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));

    // Also update the main person storage
    localStorage.setItem('atsresume_person', JSON.stringify({
      name: updatedProfile.name,
      raw_content: updatedProfile.raw_content
    }));

    console.log('✅ Profile updated in localStorage');
    return true;
  }

  /**
   * Delete the user's profile
   */
  static deleteProfile(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('atsresume_person');
      console.log('✅ Profile deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return false;
    }
  }

  /**
   * Check if a profile exists
   */
  static hasProfile(): boolean {
    return !!this.getProfile();
  }
}

