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
  private static readonly BASE_RESUME_ID = 'base-resume';
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
   * Get base resume
   */
  async getBaseResume(): Promise<SavedResume | null> {
    return this.getById(ResumeRepository.BASE_RESUME_ID);
  }

  /**
   * Save base resume
   */
  async saveBaseResume(resume: Resume): Promise<string> {
    const baseResume: SavedResume = {
      ...resume,
      userId: this.userId,  // Inject userId
      id: ResumeRepository.BASE_RESUME_ID,
      timestamp: Date.now()
    };

    const key = this.getEntityKey(ResumeRepository.BASE_RESUME_ID);
    await this.storage.writeAsync(key, baseResume);

    console.log('✅ Base resume saved for user:', this.userId);
    return ResumeRepository.BASE_RESUME_ID;
  }

  /**
   * Get resumes for a specific job
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


