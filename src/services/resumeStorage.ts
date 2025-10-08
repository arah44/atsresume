import { Resume } from '../types';
import { ensureResumeId, isValidResumeId } from '../utils/resumeHash';
import { ProfileStorageService } from './profileStorage';

const STORAGE_PREFIX = 'resume-';
const RESUME_LIST_KEY = 'resumes-list';
const BASE_RESUME_ID = 'base-resume';

/**
 * Service for saving and loading resumes by UUID
 *
 * Storage Structure (mimics cache from test-generate-resume.ts):
 * - Key: resume-[UUID] (e.g., "resume-550e8400-e29b-41d4-a716-446655440000")
 * - Value: Resume JSON (no wrapper, direct data like cache files)
 * - List: resumes-list contains metadata array for dashboard
 */
export class ResumeStorageService {
  /**
   * Save a resume with UUID to localStorage (cache-like structure)
   * Special case: 'base-resume' saves to profile
   */
  static saveResumeById(resume: Resume): string {
    try {
      // Ensure resume has a UUID (or use existing ID)
      const resumeWithId = resume.id ? resume : ensureResumeId(resume);
      const id = resumeWithId.id!;

      // Special case: base-resume saves to profile
      if (id === BASE_RESUME_ID) {
        console.log('📋 Saving base resume to profile');
        ProfileStorageService.updateProfile({ baseResume: resumeWithId });
        // Also save to regular storage for consistency
        localStorage.setItem(
          `${STORAGE_PREFIX}${id}`,
          JSON.stringify(resumeWithId, null, 2)
        );
        console.log(`✅ Base resume saved`);
        return id;
      }

      // Regular resumes: save to localStorage
      localStorage.setItem(
        `${STORAGE_PREFIX}${id}`,
        JSON.stringify(resumeWithId, null, 2)
      );

      // Add to resume list
      this.addToResumeList(id, resumeWithId);

      console.log(`✅ Resume saved with UUID: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Failed to save resume:', error);
      throw new Error('Failed to save resume to storage');
    }
  }

  /**
   * Load a resume by UUID from localStorage
   * Special case: 'base-resume' loads from profile
   */
  static loadResumeById(id: string): Resume | null {
    try {
      // Special case: base-resume loads from profile
      if (id === BASE_RESUME_ID) {
        console.log('📋 Loading base resume from profile');
        const profile = ProfileStorageService.getProfile();
        if (!profile?.baseResume) {
          console.error('❌ No base resume found in profile');
          return null;
        }
        return { ...profile.baseResume, id: BASE_RESUME_ID };
      }

      // Regular resumes: validate UUID format
      if (!isValidResumeId(id)) {
        console.error('❌ Invalid resume UUID format:', id);
        return null;
      }

      const data = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (!data) {
        console.log('🔍 Resume not found with UUID:', id);
        return null;
      }

      const resume = JSON.parse(data) as Resume;
      console.log('✅ Resume loaded:', id);
      return resume;
    } catch (error) {
      console.error('❌ Failed to load resume:', error);
      return null;
    }
  }

  /**
   * Delete a resume by UUID
   */
  static deleteResumeById(id: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      this.removeFromResumeList(id);
      console.log('✅ Resume deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete resume:', error);
      return false;
    }
  }

  /**
   * Get list of all saved resumes (metadata only)
   */
  static getSavedResumesList(): Array<{
    id: string;
    name: string;
    position: string;
    timestamp: number;
  }> {
    try {
      const data = localStorage.getItem(RESUME_LIST_KEY);
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to get resume list:', error);
      return [];
    }
  }

  /**
   * Add resume metadata to the list (for dashboard)
   */
  private static addToResumeList(id: string, resume: Resume): void {
    try {
      const list = this.getSavedResumesList();

      // Remove existing entry if any (update scenario)
      const filteredList = list.filter(item => item.id !== id);

      // Add new entry at the top
      filteredList.unshift({
        id,
        name: resume.name,
        position: resume.position,
        timestamp: Date.now()
      });

      // Keep only last 50 resumes
      const trimmedList = filteredList.slice(0, 50);

      localStorage.setItem(RESUME_LIST_KEY, JSON.stringify(trimmedList, null, 2));
      console.log(`💾 Resume list updated (${trimmedList.length} resumes)`);
    } catch (error) {
      console.error('❌ Failed to update resume list:', error);
    }
  }

  /**
   * Remove resume metadata from the list
   */
  private static removeFromResumeList(id: string): void {
    try {
      const list = this.getSavedResumesList();
      const filteredList = list.filter(item => item.id !== id);
      localStorage.setItem(RESUME_LIST_KEY, JSON.stringify(filteredList, null, 2));
      console.log(`🗑️  Resume removed from list (${filteredList.length} remaining)`);
    } catch (error) {
      console.error('❌ Failed to remove from resume list:', error);
    }
  }

  /**
   * Generate shareable URL for a resume
   */
  static getResumeUrl(id: string): string {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/resume/${id}`;
  }

  /**
   * Check if a resume exists
   */
  static resumeExists(id: string): boolean {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${id}`) !== null;
    } catch {
      return false;
    }
  }
}

