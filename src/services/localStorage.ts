import { Person, TargetJobJson, Resume } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  PERSON: 'atsresume_person',
  TARGET_JOB: 'atsresume_target_job',
  RESUME: 'atsresume_resume'
} as const;

export class LocalStorageService {
  /**
   * Save person data to local storage
   */
  static savePerson(person: Person): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSON, JSON.stringify(person));
      console.log('Person data saved to local storage');
    } catch (error) {
      console.error('Failed to save person data to local storage:', error);
    }
  }

  /**
   * Load person data from local storage
   */
  static loadPerson(): Person | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSON);
      if (!data) return null;
      
      const person = JSON.parse(data) as Person;
      console.log('Person data loaded from local storage');
      return person;
    } catch (error) {
      console.error('Failed to load person data from local storage:', error);
      return null;
    }
  }

  /**
   * Save target job data to local storage
   */
  static saveTargetJob(targetJob: TargetJobJson): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TARGET_JOB, JSON.stringify(targetJob));
      console.log('Target job data saved to local storage');
    } catch (error) {
      console.error('Failed to save target job data to local storage:', error);
    }
  }

  /**
   * Load target job data from local storage
   */
  static loadTargetJob(): TargetJobJson | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARGET_JOB);
      if (!data) return null;
      
      const targetJob = JSON.parse(data) as TargetJobJson;
      console.log('Target job data loaded from local storage');
      return targetJob;
    } catch (error) {
      console.error('Failed to load target job data from local storage:', error);
      return null;
    }
  }

  /**
   * Save resume data to local storage
   */
  static saveResume(resume: Resume): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(resume));
      console.log('Resume data saved to local storage');
    } catch (error) {
      console.error('Failed to save resume data to local storage:', error);
    }
  }

  /**
   * Load resume data from local storage
   */
  static loadResume(): Resume | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESUME);
      if (!data) return null;
      
      const resume = JSON.parse(data) as Resume;
      console.log('Resume data loaded from local storage');
      return resume;
    } catch (error) {
      console.error('Failed to load resume data from local storage:', error);
      return null;
    }
  }

  /**
   * Save all data to local storage
   */
  static saveAll(person: Person, targetJob: TargetJobJson, resume: Resume): void {
    this.savePerson(person);
    this.saveTargetJob(targetJob);
    this.saveResume(resume);
  }

  /**
   * Load all data from local storage
   */
  static loadAll(): { person: Person | null; targetJob: TargetJobJson | null; resume: Resume | null } {
    return {
      person: this.loadPerson(),
      targetJob: this.loadTargetJob(),
      resume: this.loadResume()
    };
  }

  /**
   * Clear all data from local storage
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PERSON);
      localStorage.removeItem(STORAGE_KEYS.TARGET_JOB);
      localStorage.removeItem(STORAGE_KEYS.RESUME);
      console.log('All data cleared from local storage');
    } catch (error) {
      console.error('Failed to clear data from local storage:', error);
    }
  }

  /**
   * Check if data exists in local storage
   */
  static hasData(): boolean {
    return !!(
      localStorage.getItem(STORAGE_KEYS.PERSON) ||
      localStorage.getItem(STORAGE_KEYS.TARGET_JOB) ||
      localStorage.getItem(STORAGE_KEYS.RESUME)
    );
  }

  /**
   * Export all data as JSON string
   */
  static exportData(): string | null {
    try {
      const data = this.loadAll();
      if (!data.person && !data.targetJob && !data.resume) {
        return null;
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Import data from JSON string
   */
  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.person) this.savePerson(data.person);
      if (data.targetJob) this.saveTargetJob(data.targetJob);
      if (data.resume) this.saveResume(data.resume);
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}