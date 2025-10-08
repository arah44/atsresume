/**
 * Application Storage Service
 * Manages job applications in local storage
 */

import { JobApplication } from '@/types';

const STORAGE_KEY = 'atsresume_applications';

export class ApplicationStorageService {
  /**
   * Generate a unique ID for an application
   */
  private static generateId(jobId: string): string {
    return `app-${jobId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Save a new application
   */
  static saveApplication(application: Omit<JobApplication, 'id' | 'timestamp'>): JobApplication {
    const newApplication: JobApplication = {
      ...application,
      id: this.generateId(application.job_id),
      timestamp: Date.now()
    };

    const applications = this.getAllApplications();
    applications.push(newApplication);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }

    return newApplication;
  }

  /**
   * Update an existing application
   */
  static updateApplication(id: string, updates: Partial<JobApplication>): boolean {
    const applications = this.getAllApplications();
    const index = applications.findIndex(app => app.id === id);

    if (index === -1) {
      return false;
    }

    applications[index] = {
      ...applications[index],
      ...updates
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }

    return true;
  }

  /**
   * Get application by ID
   */
  static getApplicationById(id: string): JobApplication | null {
    const applications = this.getAllApplications();
    return applications.find(app => app.id === id) || null;
  }

  /**
   * Get all applications for a specific job
   */
  static getApplicationsByJobId(jobId: string): JobApplication[] {
    const applications = this.getAllApplications();
    return applications.filter(app => app.job_id === jobId);
  }

  /**
   * Get the latest application for a job
   */
  static getLatestApplicationForJob(jobId: string): JobApplication | null {
    const applications = this.getApplicationsByJobId(jobId);

    if (applications.length === 0) {
      return null;
    }

    return applications.reduce((latest, current) => {
      return current.timestamp > latest.timestamp ? current : latest;
    });
  }

  /**
   * Get all applications
   */
  static getAllApplications(): JobApplication[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load applications:', error);
      return [];
    }
  }

  /**
   * Delete an application
   */
  static deleteApplication(id: string): boolean {
    const applications = this.getAllApplications();
    const filtered = applications.filter(app => app.id !== id);

    if (filtered.length === applications.length) {
      return false; // No application found
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    return true;
  }

  /**
   * Delete all applications for a job
   */
  static deleteApplicationsByJobId(jobId: string): number {
    const applications = this.getAllApplications();
    const filtered = applications.filter(app => app.job_id !== jobId);
    const deletedCount = applications.length - filtered.length;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    return deletedCount;
  }

  /**
   * Get application statistics
   */
  static getStatistics(): {
    total: number;
    submitted: number;
    failed: number;
    pending: number;
  } {
    const applications = this.getAllApplications();

    return {
      total: applications.length,
      submitted: applications.filter(app => app.status === 'submitted').length,
      failed: applications.filter(app => app.status === 'failed').length,
      pending: applications.filter(app => ['pending', 'filling', 'preview', 'submitting'].includes(app.status)).length
    };
  }

  /**
   * Check if a job has been applied to
   */
  static hasApplied(jobId: string): boolean {
    const applications = this.getApplicationsByJobId(jobId);
    return applications.some(app => app.status === 'submitted');
  }
}

