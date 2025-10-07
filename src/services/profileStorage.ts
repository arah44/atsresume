import { Person, Resume } from '@/types';

const STORAGE_KEY = 'atsresume_profiles';

export interface SavedProfile extends Person {
  id: string;
  timestamp: number;
  baseResume?: Resume; // Complete base resume object (generated from profile)
  metadata?: {
    lastUpdated?: number;
    version?: number;
    tags?: string[];
    notes?: string;
  };
}

export class ProfileStorageService {
  /**
   * Generate a unique ID for a profile
   */
  private static generateId(person: Person): string {
    const content = `${person.name}-${person.raw_content.substring(0, 100)}-${Date.now()}`;
    // Simple hash function for browser compatibility
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get all saved profiles
   */
  static getAllProfiles(): SavedProfile[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      return [];
    }
  }

  /**
   * Get a profile by ID
   */
  static getProfileById(id: string): SavedProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  /**
   * Save a new profile
   * Accepts either a Person or a partial SavedProfile with additional fields
   */
  static saveProfile(person: Person | Partial<SavedProfile>): string {
    console.log('📥 ProfileStorage.saveProfile called');
    console.log('Input has baseResume?', 'baseResume' in person);
    console.log('Input has metadata?', 'metadata' in person);
    console.log('Input keys:', Object.keys(person));

    const profiles = this.getAllProfiles();
    const id = this.generateId(person as Person);
    const timestamp = Date.now();

    // Spread all fields from person (including baseResume and metadata if present)
    // Then override with generated id and timestamp
    const newProfile: SavedProfile = {
      ...person,
      id,
      timestamp
    } as SavedProfile;

    console.log('📦 Profile being saved:');
    console.log('  - ID:', newProfile.id);
    console.log('  - Name:', newProfile.name);
    console.log('  - Has baseResume?', !!newProfile.baseResume);
    console.log('  - Has metadata?', !!newProfile.metadata);
    console.log('  - BaseResume position:', newProfile.baseResume?.position);
    console.log('  - BaseResume work experience count:', newProfile.baseResume?.workExperience?.length);

    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    console.log('✅ Profile saved to localStorage');
    console.log('Total profiles:', profiles.length);

    return id;
  }

  /**
   * Update an existing profile
   */
  static updateProfile(id: string, updates: Partial<SavedProfile>): boolean {
    console.log('🔄 ProfileStorage.updateProfile called');
    console.log('Profile ID:', id);
    console.log('Updates keys:', Object.keys(updates));
    console.log('Updates has baseResume?', 'baseResume' in updates);
    console.log('Updates has metadata?', 'metadata' in updates);

    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) {
      console.error('❌ Profile not found:', id);
      return false;
    }

    profiles[index] = {
      ...profiles[index],
      ...updates,
      timestamp: Date.now(),
      metadata: {
        ...profiles[index].metadata,
        ...updates.metadata,
        lastUpdated: Date.now()
      }
    };

    console.log('📦 Updated profile:');
    console.log('  - Has baseResume?', !!profiles[index].baseResume);
    console.log('  - Has metadata?', !!profiles[index].metadata);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    console.log('✅ Profile updated in localStorage');
    return true;
  }

  /**
   * Delete a profile
   */
  static deleteProfile(id: string): boolean {
    const profiles = this.getAllProfiles();
    const filtered = profiles.filter(p => p.id !== id);

    if (filtered.length === profiles.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Set a profile as current/active
   */
  static setCurrentProfile(id: string): void {
    const profile = this.getProfileById(id);
    if (!profile) return;

    // Save to the main person storage
    localStorage.setItem('atsresume_person', JSON.stringify({
      name: profile.name,
      raw_content: profile.raw_content
    }));
  }
}

