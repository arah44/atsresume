import { BaseRepository, BaseEntity } from './BaseRepository';
import { AsyncStorageProvider } from '../storage';
import { JobApplication } from '@/types';

export interface SavedApplication extends JobApplication, BaseEntity {
  userId: string;  // Owner of this application
}

/**
 * Application Repository with Dependency Injection
 * Now supports multi-user with userId scoping
 */
export class ApplicationRepository extends BaseRepository<SavedApplication> {
  private userId: string;

  constructor(storage: AsyncStorageProvider, userId: string) {
    // Scope keys by userId: user-{userId}-application-
    super(storage, `user-${userId}-application-`, `user-${userId}-applications-list`);
    this.userId = userId;
  }

  protected generateId(application: Omit<SavedApplication, 'id' | 'timestamp'>): string {
    return `app-${application.job_id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get applications for a specific job
   */
  async getByJobId(jobId: string): Promise<SavedApplication[]> {
    const all = await this.getAll();
    return all.filter(app => app.job_id === jobId);
  }

  /**
   * Get latest application for a job
   */
  async getLatestForJob(jobId: string): Promise<SavedApplication | null> {
    const applications = await this.getByJobId(jobId);
    
    if (applications.length === 0) return null;

    return applications.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  /**
   * Check if a job has been applied to
   */
  async hasApplied(jobId: string): Promise<boolean> {
    const applications = await this.getByJobId(jobId);
    return applications.some(app => app.status === 'submitted');
  }

  /**
   * Get application statistics
   */
  async getStatistics(): Promise<{
    total: number;
    submitted: number;
    failed: number;
    pending: number;
  }> {
    const all = await this.getAll();

    return {
      total: all.length,
      submitted: all.filter(app => app.status === 'submitted').length,
      failed: all.filter(app => app.status === 'failed').length,
      pending: all.filter(app => 
        ['pending', 'filling', 'preview', 'submitting'].includes(app.status)
      ).length
    };
  }

  /**
   * Delete all applications for a job
   */
  async deleteByJobId(jobId: string): Promise<number> {
    const applications = await this.getByJobId(jobId);
    
    await Promise.all(
      applications.map(app => this.delete(app.id))
    );

    return applications.length;
  }
}

