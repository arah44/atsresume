import { TargetJobJson } from '@/types';

const STORAGE_KEY = 'atsresume_jobs';

export interface SavedJob extends TargetJobJson {
  id: string;
  timestamp: number;
}

export class JobStorageService {
  /**
   * Generate a unique ID for a job
   */
  private static generateId(job: TargetJobJson): string {
    const content = `${job.name}-${job.company}-${job.url}-${Date.now()}`;
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
   * Get all saved jobs
   */
  static getAllJobs(): SavedJob[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      return [];
    }
  }

  /**
   * Get a job by ID
   */
  static getJobById(id: string): SavedJob | null {
    const jobs = this.getAllJobs();
    return jobs.find(j => j.id === id) || null;
  }

  /**
   * Save a new job
   */
  static saveJob(job: TargetJobJson): string {
    const jobs = this.getAllJobs();
    const id = this.generateId(job);
    const timestamp = Date.now();

    const newJob: SavedJob = {
      ...job,
      id,
      timestamp
    };

    jobs.push(newJob);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    
    return id;
  }

  /**
   * Update an existing job
   */
  static updateJob(id: string, updates: Partial<TargetJobJson>): boolean {
    const jobs = this.getAllJobs();
    const index = jobs.findIndex(j => j.id === id);
    
    if (index === -1) return false;

    jobs[index] = {
      ...jobs[index],
      ...updates,
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    return true;
  }

  /**
   * Delete a job
   */
  static deleteJob(id: string): boolean {
    const jobs = this.getAllJobs();
    const filtered = jobs.filter(j => j.id !== id);
    
    if (filtered.length === jobs.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Set a job as current/active target job
   */
  static setCurrentJob(id: string): void {
    const job = this.getJobById(id);
    if (!job) return;

    // Save to the main target job storage
    localStorage.setItem('atsresume_target_job', JSON.stringify({
      name: job.name,
      url: job.url,
      company: job.company,
      description: job.description,
      raw_content: job.raw_content
    }));
  }
}

