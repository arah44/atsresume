import { Collection } from 'mongodb';
import { MongoBaseRepository } from './base-repository';
import { ResumeDocument } from '../types';
import { Resume } from '@/types';
import { ensureResumeId } from '@/utils/resumeHash';

export interface SavedResume extends Omit<Resume, 'id'> {
  id: string;
  userId: string;  // Owner of this resume
  timestamp: number;
}

/**
 * MongoDB Resume Repository
 * Uses native MongoDB operations with proper jobId filtering
 */
export class MongoResumeRepository extends MongoBaseRepository<ResumeDocument, SavedResume> {
  private userId: string;

  constructor(collection: Collection<ResumeDocument>, userId: string) {
    super(collection);
    this.userId = userId;
  }

  protected toDocument(entity: SavedResume): ResumeDocument {
    const { id, userId, timestamp, ...data } = entity;
    return {
      ...data,
      id: id,
      userId: this.userId,
      timestamp
    };
  }

  protected toEntity(doc: ResumeDocument): SavedResume {
    return {
      id: doc.id,
      userId: doc.userId,
      jobId: doc.jobId,
      name: doc.name,
      position: doc.position,
      contactInformation: doc.contactInformation,
      email: doc.email,
      address: doc.address,
      profilePicture: doc.profilePicture,
      showProfilePicture: doc.showProfilePicture,
      socialMedia: doc.socialMedia,
      summary: doc.summary,
      education: doc.education,
      workExperience: doc.workExperience,
      projects: doc.projects,
      skills: doc.skills,
      languages: doc.languages,
      certifications: doc.certifications,
      generationMetadata: doc.generationMetadata,
      timestamp: doc.timestamp
    };
  }

  /**
   * Save resume with validation
   */
  async saveResume(resume: Resume): Promise<string> {
    const resumeWithId = resume.id ? resume : ensureResumeId(resume);
    const id = resumeWithId.id!;

    const resumeData: ResumeDocument = {
      id,
      userId: this.userId,
      jobId: resumeWithId.jobId,
      name: resumeWithId.name,
      position: resumeWithId.position,
      contactInformation: resumeWithId.contactInformation,
      email: resumeWithId.email,
      address: resumeWithId.address,
      profilePicture: resumeWithId.profilePicture,
      showProfilePicture: resumeWithId.showProfilePicture,
      socialMedia: resumeWithId.socialMedia,
      summary: resumeWithId.summary,
      education: resumeWithId.education,
      workExperience: resumeWithId.workExperience,
      projects: resumeWithId.projects,
      skills: resumeWithId.skills,
      languages: resumeWithId.languages,
      certifications: resumeWithId.certifications,
      generationMetadata: resumeWithId.generationMetadata,
      timestamp: Date.now()
    };

    await this.collection.replaceOne(
      { id },
      resumeData,
      { upsert: true }
    );

    console.log(`✅ Resume saved for user: ${this.userId}, ID: ${id}`);
    return id;
  }

  /**
   * Get base resume (resume without jobId)
   */
  async getBaseResume(): Promise<SavedResume | null> {
    const doc = await this.collection.findOne({
      userId: this.userId,
      jobId: { $exists: false }
    });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Save base resume (ensures no jobId is set)
   */
  async saveBaseResume(resume: Resume): Promise<string> {
    // Ensure no jobId for base resume
    const baseResumeData = { ...resume, jobId: undefined };
    const resumeWithId = baseResumeData.id ? baseResumeData : ensureResumeId(baseResumeData);

    const resumeData: ResumeDocument = {
      id: resumeWithId.id!,
      userId: this.userId,
      jobId: undefined, // Explicitly ensure no jobId
      name: resumeWithId.name,
      position: resumeWithId.position,
      contactInformation: resumeWithId.contactInformation,
      email: resumeWithId.email,
      address: resumeWithId.address,
      profilePicture: resumeWithId.profilePicture,
      showProfilePicture: resumeWithId.showProfilePicture,
      socialMedia: resumeWithId.socialMedia,
      summary: resumeWithId.summary,
      education: resumeWithId.education,
      workExperience: resumeWithId.workExperience,
      projects: resumeWithId.projects,
      skills: resumeWithId.skills,
      languages: resumeWithId.languages,
      certifications: resumeWithId.certifications,
      generationMetadata: resumeWithId.generationMetadata,
      timestamp: Date.now()
    };

    await this.collection.replaceOne(
      { id: resumeWithId.id! },
      resumeData,
      { upsert: true }
    );

    console.log('✅ Base resume saved for user:', this.userId, 'ID:', resumeWithId.id);
    return resumeWithId.id!;
  }

  /**
   * Get resumes for a specific job by jobId
   */
  async getJobResumes(jobId: string): Promise<SavedResume[]> {
    const docs = await this.collection
      .find({ userId: this.userId, jobId })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map(doc => this.toEntity(doc));
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
    const docs = await this.collection
      .find({ userId: this.userId })
      .project({ id: 1, name: 1, position: 1, timestamp: 1 })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      position: doc.position,
      timestamp: doc.timestamp
    }));
  }

  /**
   * Get all resumes for user
   */
  async getAll(): Promise<SavedResume[]> {
    const docs = await this.collection
      .find({ userId: this.userId })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map(doc => this.toEntity(doc));
  }
}
