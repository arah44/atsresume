import { BaseRepository, BaseEntity } from './BaseRepository';
import { AsyncStorageProvider } from '../storage';
import { TargetJobJson } from '@/types';

export interface SavedJob extends TargetJobJson, BaseEntity {}

/**
 * Job Repository with Dependency Injection
 */
export class JobRepository extends BaseRepository<SavedJob> {
  constructor(storage: AsyncStorageProvider) {
    super(storage, 'job-', 'jobs-list');
  }

  protected generateId(job: Omit<SavedJob, 'id' | 'timestamp'>): string {
    const content = `${job.name}-${job.company}-${job.url}-${Date.now()}`;
    
    // Simple hash function for ID generation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Find jobs by company
   */
  async getByCompany(company: string): Promise<SavedJob[]> {
    const all = await this.getAll();
    return all.filter(job => 
      job.company.toLowerCase().includes(company.toLowerCase())
    );
  }

  /**
   * Search jobs by keyword
   */
  async search(keyword: string): Promise<SavedJob[]> {
    const all = await this.getAll();
    const lowerKeyword = keyword.toLowerCase();
    
    return all.filter(job =>
      job.name.toLowerCase().includes(lowerKeyword) ||
      job.company.toLowerCase().includes(lowerKeyword) ||
      job.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Get jobs sorted by date (newest first)
   */
  async getAllSorted(): Promise<SavedJob[]> {
    const all = await this.getAll();
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }
}

