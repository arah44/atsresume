import { BaseRepository, BaseEntity } from './BaseRepository';
import { AsyncStorageProvider } from '../storage';
import { Resume } from '@/types';
import { ensureResumeId } from '@/utils/resumeHash';

export interface SavedResume extends Omit<Resume, 'id'>, BaseEntity {
  userId: string;  // Owner of this resume
}

/**
 * Resume Repository with Dependency Injection
 * Now supports multi-user with userId scoping
 */
export class ResumeRepository extends BaseRepository<SavedResume> {
  private userId: string;

  constructor(storage: AsyncStorageProvider, userId: string) {
    // Scope keys by userId: user-{userId}-resume-
    super(storage, `user-${userId}-resume-`, `user-${userId}-resumes-list`);
    this.userId = userId;
  }

  protected generateId(resume: Omit<SavedResume, 'id' | 'timestamp'>): string {
    // Generate UUID for new resume
    const resumeWithId = ensureResumeId(resume as Resume);
    return resumeWithId.id!;
  }

  /**
   * Save resume with validation
   */
  async saveResume(resume: Resume): Promise<string> {
    const resumeWithId = resume.id ? resume : ensureResumeId(resume);
    const id = resumeWithId.id!;

    const savedResume: SavedResume = {
      ...resumeWithId,
      userId: this.userId,  // Inject userId
      id,
      timestamp: Date.now()
    };

    const key = this.getEntityKey(id);
    await this.storage.writeAsync(key, savedResume);
    await this.addToList(savedResume);

    console.log(`✅ Resume saved for user: ${this.userId}, ID: ${id}`);
    return id;
  }

  /**
   * Get base resume (resume without jobId)
   */
  async getBaseResume(): Promise<SavedResume | null> {
    const all = await this.getAll();
    return all.find(resume => !resume.jobId) || null;
  }

  /**
   * Save base resume (ensures no jobId is set)
   */
  async saveBaseResume(resume: Resume): Promise<string> {
    // Ensure no jobId for base resume
    const baseResumeData = { ...resume, jobId: undefined };
    const resumeWithId = baseResumeData.id ? baseResumeData : ensureResumeId(baseResumeData);
    
    const baseResume: SavedResume = {
      ...resumeWithId,
      userId: this.userId,  // Inject userId
      jobId: undefined, // Explicitly ensure no jobId
      id: resumeWithId.id!,
      timestamp: Date.now()
    };

    const key = this.getEntityKey(baseResume.id);
    await this.storage.writeAsync(key, baseResume);
    await this.addToList(baseResume);

    console.log('✅ Base resume saved for user:', this.userId, 'ID:', baseResume.id);
    return baseResume.id;
  }

  /**
   * Get resumes for a specific job by jobId
   */
  async getJobResumes(jobId: string): Promise<SavedResume[]> {
    const all = await this.getAll();
    return all.filter(resume => resume.jobId === jobId);
  }

  /**
   * Get resumes for a specific job by name and company (legacy method)
   */
  async getByJob(jobName: string, company: string): Promise<SavedResume[]> {
    const all = await this.getAll();

    return all.filter(resume => {
      const targetJob = resume.generationMetadata?.targetJob;
      return targetJob?.name === jobName && targetJob?.company === company;
    });
  }

  /**
   * Get resume metadata list (for dashboard)
   */
  async getResumesList(): Promise<Array<{
    id: string;
    name: string;
    position: string;
    timestamp: number;
  }>> {
    const all = await this.getAll();

    return all.map(resume => ({
      id: resume.id, // BaseEntity ensures id is always string
      name: resume.name,
      position: resume.position,
      timestamp: resume.timestamp
    }));
  }
}


